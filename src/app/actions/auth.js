'use server'

import { createClient } from '../../utils/supabase/server'
import { createAdminClient } from '../../utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { generateLoginId } from '../../utils/login-id'

export async function demoLogin(role = 'admin') {
  const cookieStore = await cookies()
  cookieStore.set('dayflow_demo_user', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
    return await demoLogin('admin')
  }

  if (
    identifier.toUpperCase() === 'ACMERS2024002' ||
    identifier.toLowerCase() === 'rahul.sharma@acme.com' ||
    identifier.toLowerCase() === 'employee'
  ) {
    return await demoLogin('employee')
  }

  try {
    const supabase = await createClient()
    let email = identifier

    // If identifier is not an email, lookup by login_id
    if (!identifier.includes('@')) {
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email, needs_password_change')
        .eq('login_id', identifier)
        .maybeSingle()

      if (!profile) {
        return { error: 'Invalid Login ID. Please check your credentials.' }
      }
      email = profile.email
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Check if password change is required
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('needs_password_change')
      .eq('id', data.user.id)
      .single()

    if (userProfile?.needs_password_change) {
      redirect('/set-password')
    }

    redirect('/dashboard')
  } catch (err) {
    // If Supabase is unconfigured, provide clean notice with quick demo buttons
    return {
      error: 'Could not connect to Supabase auth service. Try using the ⚡ Quick Demo Logins below to explore the full application.'
    }
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

  try {
    const adminClient = createAdminClient()

    // Generate unique company code
    const codeBase = companyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'CORP'
    const companyCode = `${codeBase}${Math.floor(100 + Math.random() * 900)}`

    // 1. Create company record
    const { data: company, error: compErr } = await adminClient
      .from('companies')
      .insert({
        name: companyName,
        company_code: companyCode,
      })
      .select()
      .single()

    if (compErr) {
      return { error: compErr.message }
    }

    // 2. Create Auth user
    const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: 'admin',
        company_id: company.id,
      }
    })

    if (authErr) {
      return { error: authErr.message }
    }

    // 3. Generate Login ID
    const loginId = generateLoginId({
      companyCode: company.company_code,
      fullName: adminName,
      joiningYear: new Date().getFullYear(),
      sequenceNumber: 1,
    })

    // 4. Create Profile
    const { error: profErr } = await adminClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        company_id: company.id,
        login_id: loginId,
        full_name: adminName,
        email,
        role: 'admin',
        job_title: 'Organization Administrator',
        department: 'Executive',
        needs_password_change: false,
      })

    if (profErr) {
      return { error: profErr.message }
    }

    // 5. Sign in
    const supabase = await createClient()
    await supabase.auth.signInWithPassword({ email, password })

    redirect('/dashboard')
  } catch (err) {
    return { error: err.message || 'Registration failed. Check your Supabase configuration in .env.local.' }
  }
}

export async function provisionEmployee(prevState, formData) {
  const fullName = formData.get('fullName')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()

  if (!fullName || !email) {
    return { error: 'Full name and email are required.' }
  }

  const cookieStore = await cookies()
  const isDemo = Boolean(cookieStore.get('dayflow_demo_user')?.value)

  if (isDemo) {
    // Demo mode response
    const loginId = `ACME${fullName.slice(0, 2).toUpperCase()}2024009`
    const tempPassword = `Dayflow@${Math.floor(1000 + Math.random() * 9000)}`
    return {
      success: true,
      loginId,
      tempPassword,
      email,
    }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized.' }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return { error: 'Only administrators can provision new staff.' }
    }

    const adminClient = createAdminClient()

    // Fetch company
    const { data: company } = await adminClient
      .from('companies')
      .select('company_code')
      .eq('id', adminProfile.company_id)
      .single()

    // Count existing employees for sequence
    const { count } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', adminProfile.company_id)

    const seq = (count || 0) + 1
    const loginId = generateLoginId({
      companyCode: company.company_code,
      fullName,
      joiningYear: new Date().getFullYear(),
      sequenceNumber: seq,
    })

    const tempPassword = `Dayflow@${Math.floor(1000 + Math.random() * 9000)}`

    // Create Auth User
    const { data: newAuthUser, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'employee',
        company_id: adminProfile.company_id,
      }
    })

    if (authErr) return { error: authErr.message }

    // Create Profile
    const { error: profErr } = await adminClient
      .from('profiles')
      .insert({
        id: newAuthUser.user.id,
        company_id: adminProfile.company_id,
        login_id: loginId,
        full_name: fullName,
        email,
        phone,
        role: 'employee',
        job_title: 'Team Member',
        department: 'General',
        needs_password_change: true,
      })

    if (profErr) return { error: profErr.message }

    // Initialize Default Leave Allocations
    await adminClient.from('leave_allocations').insert([
      { profile_id: newAuthUser.user.id, company_id: adminProfile.company_id, leave_type: 'paid', allocated_days: 15, remaining_days: 15, year: new Date().getFullYear() },
      { profile_id: newAuthUser.user.id, company_id: adminProfile.company_id, leave_type: 'sick', allocated_days: 10, remaining_days: 10, year: new Date().getFullYear() },
      { profile_id: newAuthUser.user.id, company_id: adminProfile.company_id, leave_type: 'unpaid', allocated_days: 0, remaining_days: 0, year: new Date().getFullYear() },
    ])

    return {
      success: true,
      loginId,
      tempPassword,
      email,
    }
  } catch (err) {
    return { error: err.message }
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

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/dashboard')
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: error.message }

    await supabase
      .from('profiles')
      .update({ needs_password_change: false })
      .eq('id', user.id)

    redirect('/dashboard')
  } catch (err) {
    redirect('/dashboard')
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
    return { success: true } // Demo fallback
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
