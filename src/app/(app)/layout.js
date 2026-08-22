import { redirect } from 'next/navigation'
import TopNav from '../../components/nav/TopNav'
import { getCurrentSessionUser } from '../../utils/session'
import { isSupabaseConfigured, getLocalDB } from '../../utils/local-db'
import { DEMO_COMPANY } from '../../utils/demo-data'
import { createClient } from '../../utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }) {
  const session = await getCurrentSessionUser()
  if (!session) {
    redirect('/signin')
  }

  const { profile, isDemo } = session
  const db = getLocalDB()
  let company = db.companies.find(c => c.id === profile.company_id) || DEMO_COMPANY

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single()

      if (comp) company = comp
    } catch {}
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <TopNav userProfile={profile} company={company} isDemo={isDemo} />
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
