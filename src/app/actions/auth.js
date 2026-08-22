'use server'

import { createClient } from '../../utils/supabase/server'
import { createAdminClient } from '../../utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { generateLoginId } from '../../utils/login-id'
import {
  isSupabaseConfigured,
  getLocalDB,
  findProfileByLoginOrEmail,
  verifyLocalPassword,
  saveLocalPassword,
  addLocalProfile,
} from '../../utils/local-db'
import { getCurrentSessionUser } from '../../utils/session'

function isRedirectError(error) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof error.digest === 'string' &&
    error.digest.startsWith('NEXT_REDIRECT')
  )
}

export async function demoLogin(role = 'admin') {
  const cookieStore = await cookies()
  cookieStore.delete('dayflow_session_user_id')
  cookieStore.set('dayflow_demo_user', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  redirect('/dashboard')
}

export async function signInUser(prevState, formData) {
  const identifier = formData.get('identifier')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!identifier || !password) {
    return { error: 'Please enter both login ID/email and password.' }
  }

  const cookieStore = await cookies()

  // 1. Check quick 1-click demo keywords
  if (identifier.toLowerCase() === 'admin' || identifier.toUpperCase() === 'ACMEJD2024001') {
    cookieStore.delete('dayflow_session_user_id')
    cookieStore.set('dayflow_demo_user', 'admin', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    redirect('/dashboard')
  }

  if (identifier.toLowerCase() === 'employee' || identifier.toUpperCase() === 'ACMERS2024002') {
    cookieStore.delete('dayflow_session_user_id')
    cookieStore.set('dayflow_demo_user', 'employee', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    redirect('/dashboard')
  }

  let redirectTo = null

  // 2. If Supabase is real and reachable, try remote Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      let email = identifier

      if (!identifier.includes('@')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, needs_password_change')
          .ilike('login_id', identifier)
          .maybeSingle()

        if (profile?.email) {
          email = profile.email
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!authError && authData?.user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('needs_password_change')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (userProfile?.needs_password_change) {
          redirectTo = '/set-password'
        } else {
          redirectTo = '/dashboard'
        }
      }
    } catch (err) {
      if (isRedirectError(err)) throw err
    }
  }

  // 3. If not redirected yet, check local database (handles provisioned employees, demo users, and offline mode)
  if (!redirectTo) {
    const profile = findProfileByLoginOrEmail(identifier)
    if (profile) {
      const isValid = verifyLocalPassword(identifier, password)
      if (isValid) {
        cookieStore.set('dayflow_session_user_id', profile.id, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
        })
        cookieStore.delete('dayflow_demo_user')

        if (profile.needs_password_change) {
          redirectTo = '/set-password'
        } else {
          redirectTo = '/dashboard'
        }
      } else {
        return { error: 'Invalid password. Please check your credentials.' }
      }
    } else {
      return { error: 'Account not found. Verify your Login ID / Email or register your organization.' }
    }
  }

  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function signUpCompany(prevState, formData) {
  const companyName = formData.get('companyName')?.toString().trim()
  const adminName = formData.get('adminName')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!companyName || !adminName || !email || !password) {
    return { error: 'All fields are required to register your organization.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const cookieStore = await cookies()
  const codeBase = companyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'CORP'
  const companyCode = `${codeBase}${Math.floor(100 + Math.random() * 900)}`
  const loginId = generateLoginId({
    companyCode,
    fullName: adminName,
    joiningYear: new Date().getFullYear(),
    sequenceNumber: 1,
  })

  // Add to local database
  const createdAdmin = addLocalProfile({
    company_id: `comp-${Date.now()}`,
    login_id: loginId,
    full_name: adminName,
    email,
    role: 'admin',
    job_title: 'Organization Administrator',
    department: 'Executive',
    needs_password_change: false,
  }, password)

  // Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const adminClient = createAdminClient()

      const { data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: adminName, role: 'admin' } }
      })

      const userId = authData?.user?.id
      if (userId) {
        await adminClient.from('companies').insert({ name: companyName, company_code: companyCode })
        await adminClient.from('profiles').upsert({
          id: userId,
          company_id: createdAdmin.company_id,
          login_id: loginId,
          full_name: adminName,
          email,
          role: 'admin',
        }, { onConflict: 'id' })
      }
    } catch {}
  }

  cookieStore.set('dayflow_session_user_id', createdAdmin.id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  cookieStore.delete('dayflow_demo_user')

  redirect('/dashboard')
}

export async function provisionEmployee(prevState, formData) {
  const fullName = formData.get('fullName')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()

  if (!fullName || !email) {
    return { error: 'Full name and email are required.' }
  }

  const session = await getCurrentSessionUser()
  const companyId = session?.profile?.company_id || 'demo-company-1'
  const companyCode = 'ACME'

  const db = getLocalDB()
  const seq = db.profiles.length + 1
  const loginId = generateLoginId({
    companyCode,
    fullName,
    joiningYear: new Date().getFullYear(),
    sequenceNumber: seq,
  })

  const tempPassword = `Dayflow@${Math.floor(1000 + Math.random() * 9000)}`

  // 1. Save to local database (Immediate 0ms response, 100% reliable)
  addLocalProfile({
    company_id: companyId,
    login_id: loginId,
    full_name: fullName,
    email,
    phone,
    role: 'employee',
    job_title: 'Team Member',
    department: 'General',
    needs_password_change: true,
  }, tempPassword)

  // 2. Also try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient()
      await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'employee',
          company_id: companyId,
          login_id: loginId,
        }
      })
    } catch {}
  }

  return {
    success: true,
    loginId,
    tempPassword,
    email,
  }
}

export async function setInitialPassword(prevState, formData) {
  const newPassword = formData.get('newPassword')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const session = await getCurrentSessionUser()
  if (session?.profile) {
    saveLocalPassword(session.profile.id, newPassword)
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase.auth.updateUser({ password: newPassword })
    } catch {}
  }

  redirect('/dashboard')
}

export async function updateEmployeePassword(prevState, formData) {
  const newPassword = formData.get('newPassword')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const session = await getCurrentSessionUser()
  if (session?.profile) {
    saveLocalPassword(session.profile.id, newPassword)
  }

  return { success: true }
}

export async function signOutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('dayflow_session_user_id')
  cookieStore.delete('dayflow_demo_user')

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch {}
  }

  redirect('/signin')
}
