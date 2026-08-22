import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import TopNav from '../../components/nav/TopNav'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/signin')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/signin')
  }

  // Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single()

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <TopNav userProfile={profile} company={company} />
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
