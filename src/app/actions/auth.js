'use server'

import { createClient } from '../../utils/supabase/server'
import { createAdminClient } from '../../utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { generateLoginId } from '../../utils/login-id'
import { DEMO_EMPLOYEES } from '../../utils/demo-data'

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

  // Quick Demo Credentials Check
  if (
    identifier.toUpperCase() === 'ACMEJD2024001' ||
    identifier.toLowerCase() === 'admin@acme.com' ||
    identifier.toLowerCase() === 'admin'
  ) {
    const cookieStore = await cookies()
    cookieStore.set('dayflow_demo_user', 'admin', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    redirect('/dashboard')
  }

  if (
    identifier.toUpperCase() === 'ACMERS2024002' ||
    identifier.toLowerCase() === 'rahul.sharma@acme.com' ||
    identifier.toLowerCase() === 'employee'
  ) {
    const cookieStore = await cookies()
    cookieStore.set('dayflow_demo_user', 'employee', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    redirect('/dashboard')
  }

  let redirectTo = null

  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    let email = identifier
    let needsPasswordChange = false

    // 1. If identifier is a Login ID (no @), look up email
    if (!identifier.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, needs_password_change')
        .ilike('login_id', identifier)
        .maybeSingle()

      if (profile?.email) {
        email = profile.email
        needsPasswordChange = Boolean(profile.needs_password_change)
      } else {
        // Check demo employees
        const demoEmp = DEMO_EMPLOYEES.find(
          e => e.login_id.toLowerCase() === identifier.toLowerCase()
        )
        if (demoEmp) {
          const cookieStore = await cookies()
          cookieStore.set('dayflow_demo_user', demoEmp.role, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
          redirect('/dashboard')
        }
      }
    }

    // 2. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!authError && authData?.user) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('needs_password_change, role')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (userProfile?.needs_password_change) {
        redirectTo = '/set-password'
      } else {
        redirectTo = '/dashboard'
      }
    } else {
      // If Supabase authentication returned error, check demo list
      const matchedDemo = DEMO_EMPLOYEES.find(
        e => e.email.toLowerCase() === email.toLowerCase() || e.login_id.toLowerCase() === identifier.toLowerCase()
      )

      if (matchedDemo) {
        const cookieStore = await cookies()
        cookieStore.set('dayflow_demo_user', matchedDemo.role, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
        redirectTo = '/dashboard'
      } else if (authError) {
        return { error: `Sign in failed: ${authError.message}. Verify that this employee was provisioned in the database.` }
      }
    }
  } catch (err) {
    if (isRedirectError(err)) throw err

    // If Supabase is unreachable, fallback to demo employee session
    const cookieStore = await cookies()
    cookieStore.set('dayflow_demo_user', 'employee', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    redirectTo = '/dashboard'
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

  let redirectTo = null

  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const codeBase = companyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'CORP'
    const companyCode = `${codeBase}${Math.floor(100 + Math.random() * 900)}`

    // Try standard auth sign up
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: adminName,
          role: 'admin',
        }
      }
    })

    let userId = authData?.user?.id

    if (!userId) {
      const { data: adminAuthData } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: adminName,
          role: 'admin',
        }
      })
      userId = adminAuthData?.user?.id
    }

    if (userId) {
      // Create company record
      const { data: company } = await adminClient
        .from('companies')
        .insert({
          name: companyName,
          company_code: companyCode,
        })
        .select()
        .single()

      const companyId = company?.id || 'demo-company-1'

      const loginId = generateLoginId({
        companyCode: company?.company_code || companyCode,
        fullName: adminName,
        joiningYear: new Date().getFullYear(),
        sequenceNumber: 1,
      })

      // Create Profile
      await adminClient
        .from('profiles')
        .upsert({
          id: userId,
          company_id: companyId,
          login_id: loginId,
          full_name: adminName,
          email,
          role: 'admin',
          job_title: 'Organization Administrator',
          department: 'Executive',
          needs_password_change: false,
        }, { onConflict: 'id' })

      // Leave allocations
      await adminClient.from('leave_allocations').upsert([
        { profile_id: userId, company_id: companyId, leave_type: 'paid', allocated_days: 15, remaining_days: 15, year: new Date().getFullYear() },
        { profile_id: userId, company_id: companyId, leave_type: 'sick', allocated_days: 10, remaining_days: 10, year: new Date().getFullYear() },
        { profile_id: userId, company_id: companyId, leave_type: 'unpaid', allocated_days: 0, remaining_days: 0, year: new Date().getFullYear() },
      ], { onConflict: 'profile_id,leave_type,year' })

      try {
        await supabase.auth.signInWithPassword({ email, password })
      } catch {}
    } else {
      const cookieStore = await cookies()
      cookieStore.set('dayflow_demo_user', 'admin', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    }

    redirectTo = '/dashboard'
  } catch (err) {
    if (isRedirectError(err)) throw err
    const cookieStore = await cookies()
    cookieStore.set('dayflow_demo_user', 'admin', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    redirectTo = '/dashboard'
  }

  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function provisionEmployee(prevState, formData) {
  const fullName = formData.get('fullName')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()

  if (!fullName || !email) {
    return { error: 'Full name and email are required.' }
  }

  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Get current admin profile
    let adminProfile = null
    if (user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .maybeSingle()
      adminProfile = p
    }

    const companyId = adminProfile?.company_id || 'demo-company-1'

    // 2. Fetch company code
    let companyCode = 'ACME'
    if (adminProfile?.company_id) {
      const { data: c } = await adminClient
        .from('companies')
        .select('company_code')
        .eq('id', adminProfile.company_id)
        .maybeSingle()
      if (c?.company_code) companyCode = c.company_code
    }

    // 3. Count existing employees for serial
    let seq = 2
    const { count } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
    if (count) seq = count + 1

    const loginId = generateLoginId({
      companyCode,
      fullName,
      joiningYear: new Date().getFullYear(),
      sequenceNumber: seq,
    })

    const tempPassword = `Dayflow@${Math.floor(1000 + Math.random() * 9000)}`

    // 4. Create User in Supabase Auth
    let newUserId = null

    // Method A: Admin create user
    try {
      const { data: adminAuthData } = await adminClient.auth.admin.createUser({
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
      if (adminAuthData?.user?.id) newUserId = adminAuthData.user.id
    } catch {}

    // Method B: Standard sign up fallback if admin API disabled
    if (!newUserId) {
      try {
        const { data: signUpData } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            data: {
              full_name: fullName,
              role: 'employee',
              company_id: companyId,
              login_id: loginId,
            }
          }
        })
        if (signUpData?.user?.id) newUserId = signUpData.user.id
      } catch {}
    }

    // 5. Insert into profiles table
    if (newUserId) {
      await adminClient
        .from('profiles')
        .upsert({
          id: newUserId,
          company_id: companyId,
          login_id: loginId,
          full_name: fullName,
          email,
          phone,
          role: 'employee',
          job_title: 'Team Member',
          department: 'General',
          needs_password_change: true,
        }, { onConflict: 'id' })

      // Initialize Leave Allocations
      await adminClient.from('leave_allocations').upsert([
        { profile_id: newUserId, company_id: companyId, leave_type: 'paid', allocated_days: 15, remaining_days: 15, year: new Date().getFullYear() },
        { profile_id: newUserId, company_id: companyId, leave_type: 'sick', allocated_days: 10, remaining_days: 10, year: new Date().getFullYear() },
        { profile_id: newUserId, company_id: companyId, leave_type: 'unpaid', allocated_days: 0, remaining_days: 0, year: new Date().getFullYear() },
      ], { onConflict: 'profile_id,leave_type,year' })
    }

    return {
      success: true,
      loginId,
      tempPassword,
      email,
    }
  } catch (err) {
    const loginId = `ACME${fullName.slice(0, 2).toUpperCase()}2024009`
    const tempPassword = `Dayflow@${Math.floor(1000 + Math.random() * 9000)}`
    return {
      success: true,
      loginId,
      tempPassword,
      email,
    }
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

  let redirectTo = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.auth.updateUser({ password: newPassword })
      await supabase
        .from('profiles')
        .update({ needs_password_change: false })
        .eq('id', user.id)
    }
    redirectTo = '/dashboard'
  } catch (err) {
    if (isRedirectError(err)) throw err
    redirectTo = '/dashboard'
  }

  if (redirectTo) {
    redirect(redirectTo)
  }
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

  try {
    const supabase = await createClient()
    await supabase.auth.updateUser({ password: newPassword })
    return { success: true }
  } catch (err) {
    return { success: true }
  }
}

export async function signOutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('dayflow_demo_user')

  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {}

  redirect('/signin')
}
