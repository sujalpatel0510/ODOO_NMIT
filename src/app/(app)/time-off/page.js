import { redirect } from 'next/navigation'
import TimeOffView from '../../../components/time-off/TimeOffView'
import { getCurrentSessionUser } from '../../../utils/session'
import { createClient } from '../../../utils/supabase/server'
import {
  DEMO_EMPLOYEES,
  DEMO_ALLOCATIONS,
  DEMO_LEAVE_REQUESTS,
} from '../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function TimeOffPage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile, user, isDemo } = session
  const companyId = profile.company_id
  const isAdmin = profile.role === 'admin'
  const currentYear = new Date().getFullYear()

  let allocations = DEMO_ALLOCATIONS
  let myRequests = DEMO_LEAVE_REQUESTS
  let allCompanyRequests = DEMO_LEAVE_REQUESTS
  let companyEmployees = DEMO_EMPLOYEES

  if (!isDemo) {
    try {
      const supabase = await createClient()

      const { data: allocs } = await supabase
        .from('leave_allocations')
        .select('*')
        .eq('profile_id', user.id)
        .eq('year', currentYear)
      if (allocs && allocs.length > 0) allocations = allocs

      const { data: reqs } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
      if (reqs) myRequests = reqs

      if (isAdmin) {
        const { data: allReqs } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
        if (allReqs) allCompanyRequests = allReqs

        const { data: emps } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', companyId)
        if (emps) companyEmployees = emps
      }
    } catch {}
  }

  return (
    <TimeOffView
      isAdmin={isAdmin}
      currentUser={profile}
      allocations={allocations}
      myRequests={myRequests}
      allCompanyRequests={allCompanyRequests}
      companyEmployees={companyEmployees}
    />
  )
}
