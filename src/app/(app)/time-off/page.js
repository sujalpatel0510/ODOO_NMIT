import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import TimeOffView from '../../../components/time-off/TimeOffView'

export const dynamic = 'force-dynamic'

export default async function TimeOffPage() {
  const supabase = await createClient()

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // 2. Fetch current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/signin')

  const companyId = profile.company_id
  const isAdmin = profile.role === 'admin'
  const currentYear = new Date().getFullYear()

  // 3. Fetch allocations for current user
  const { data: allocations } = await supabase
    .from('leave_allocations')
    .select('*')
    .eq('profile_id', user.id)
    .eq('year', currentYear)

  // 4. Fetch user's own requests
  const { data: myRequests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  // 5. If admin, fetch all company requests & company employees
  let allCompanyRequests = []
  let companyEmployees = []

  if (isAdmin) {
    const { data: allReqs } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    allCompanyRequests = allReqs || []

    const { data: emps } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)

    companyEmployees = emps || []
  }

  return (
    <TimeOffView
      isAdmin={isAdmin}
      currentUser={profile}
      allocations={allocations || []}
      myRequests={myRequests || []}
      allCompanyRequests={allCompanyRequests}
      companyEmployees={companyEmployees}
    />
  )
}
