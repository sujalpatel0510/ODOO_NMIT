import { redirect } from 'next/navigation'
import TimeOffView from '../../../components/time-off/TimeOffView'
import { getCurrentSessionUser } from '../../../utils/session'
import { isSupabaseConfigured, getLocalDB } from '../../../utils/local-db'
import { createClient } from '../../../utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TimeOffPage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile, user } = session
  const companyId = profile.company_id
  const isAdmin = profile.role === 'admin'
  const currentYear = new Date().getFullYear()

  const db = getLocalDB()
  let allocations = db.allocations.filter(a => a.profile_id === user.id && a.year === currentYear)
  if (allocations.length === 0) allocations = db.allocations.slice(0, 3)
  let myRequests = db.leaveRequests.filter(r => r.profile_id === user.id)
  let allCompanyRequests = db.leaveRequests
  let companyEmployees = db.profiles

  if (isSupabaseConfigured()) {
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
