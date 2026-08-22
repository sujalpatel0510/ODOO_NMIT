import { cookies } from 'next/headers'
import { isSupabaseConfigured, getLocalDB } from './local-db'
import { DEMO_EMPLOYEES } from './demo-data'
import { createClient } from './supabase/server'

export async function getCurrentSessionUser() {
  const cookieStore = await cookies()
  const sessionUserId = cookieStore.get('dayflow_session_user_id')?.value
  const demoRoleCookie = cookieStore.get('dayflow_demo_user')?.value

  // 1. Instant check: If local session cookie exists, resolve immediately in 0ms
  if (sessionUserId) {
    const db = getLocalDB()
    const foundProfile = db.profiles.find(
      p => p.id === sessionUserId || p.email === sessionUserId || p.login_id === sessionUserId
    )
    if (foundProfile) {
      return {
        user: { id: foundProfile.id, email: foundProfile.email },
        profile: foundProfile,
        isDemo: true,
      }
    }
  }

  // 2. Instant check: Demo role switcher cookie
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

  // 3. Fallback: If no cookie and Supabase is configured with real URL, check Supabase with 800ms timeout
  if (isSupabaseConfigured()) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 800)
      )

      const fetchAuthPromise = (async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          if (profile) {
            return { user, profile, isDemo: false }
          }
        }
        return null
      })()

      const result = await Promise.race([fetchAuthPromise, timeoutPromise])
      if (result) return result
    } catch {}
  }

  return null
}
