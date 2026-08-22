import { cookies } from 'next/headers'
import { createClient } from './supabase/server'
import {
  DEMO_COMPANY,
  DEMO_EMPLOYEES,
  DEMO_RESUME,
  DEMO_SALARY_STRUCTURE,
  DEMO_ALLOCATIONS,
  DEMO_ATTENDANCE_LOGS,
  DEMO_LEAVE_REQUESTS,
  DEMO_PAYROLL_RUNS,
} from './demo-data'

export async function getCurrentSessionUser() {
  const cookieStore = await cookies()
  const demoRoleCookie = cookieStore.get('dayflow_demo_user')?.value

  // 1. Try Supabase Auth first
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        return {
          user,
          profile,
          isDemo: false,
        }
      }
    }
  } catch (err) {
    // Supabase unreachable or unconfigured
  }

  // 2. Fall back to demo session if active or default to admin
  if (demoRoleCookie === 'employee') {
    const profile = DEMO_EMPLOYEES.find(e => e.role === 'employee') || DEMO_EMPLOYEES[1]
    return {
      user: { id: profile.id, email: profile.email },
      profile,
      isDemo: true,
    }
  }

  if (demoRoleCookie === 'admin') {
    const profile = DEMO_EMPLOYEES[0]
    return {
      user: { id: profile.id, email: profile.email },
      profile,
      isDemo: true,
    }
  }

  return null
}
