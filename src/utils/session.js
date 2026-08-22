import { cookies } from 'next/headers'
import { createClient } from './supabase/server'
import { isSupabaseConfigured, getLocalDB, findProfileByLoginOrEmail } from './local-db'
import { DEMO_COMPANY, DEMO_EMPLOYEES } from './demo-data'

export async function getCurrentSessionUser() {
  const cookieStore = await cookies()
  const sessionUserId = cookieStore.get('dayflow_session_user_id')?.value
  const demoRoleCookie = cookieStore.get('dayflow_demo_user')?.value

  // 1. If Supabase is properly configured with a real host, try Supabase Auth
  if (isSupabaseConfigured()) {
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
      // Supabase connection timeout or error -> proceed to local session
    }
  }

  // 2. Look up user by session ID if stored (e.g. provisioned employee or custom user)
  if (sessionUserId) {
    const db = getLocalDB()
    const foundProfile = db.profiles.find(p => p.id === sessionUserId || p.email === sessionUserId || p.login_id === sessionUserId)
    if (foundProfile) {
      return {
        user: { id: foundProfile.id, email: foundProfile.email },
        profile: foundProfile,
        isDemo: true,
      }
    }
  }

  // 3. Fall back to demo role cookie if active
  if (demoRoleCookie === 'employee') {
    const db = getLocalDB()
    const profile = db.profiles.find(e => e.role === 'employee') || DEMO_EMPLOYEES[1]
    return {
      user: { id: profile.id, email: profile.email },
      profile,
      isDemo: true,
    }
  }

  if (demoRoleCookie === 'admin') {
    const db = getLocalDB()
    const profile = db.profiles.find(e => e.role === 'admin') || DEMO_EMPLOYEES[0]
    return {
      user: { id: profile.id, email: profile.email },
      profile,
      isDemo: true,
    }
  }

  return null
}
