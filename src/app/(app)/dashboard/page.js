import { redirect } from 'next/navigation'
import DashboardView from '../../../components/dashboard/DashboardView'
import { getCurrentSessionUser } from '../../../utils/session'
import { createClient } from '../../../utils/supabase/server'
import {
  DEMO_COMPANY,
  DEMO_EMPLOYEES,
  DEMO_ALLOCATIONS,
  DEMO_ATTENDANCE_LOGS,
  DEMO_LEAVE_REQUESTS,
  DEMO_PAYROLL_RUNS,
} from '../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile, user, isDemo } = session
  const todayStr = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  let company = DEMO_COMPANY
  let todayAttendanceRecord = DEMO_ATTENDANCE_LOGS.find(a => a.profile_id === profile.id) || null
  let allocations = DEMO_ALLOCATIONS
  let recentAttendance = DEMO_ATTENDANCE_LOGS
  let companyEmployees = DEMO_EMPLOYEES
  let pendingRequests = DEMO_LEAVE_REQUESTS.filter(r => r.status === 'pending')
  let latestPayrollRun = DEMO_PAYROLL_RUNS[0]

  if (!isDemo) {
    try {
      const supabase = await createClient()

      // Fetch company
      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single()
      if (comp) company = comp

      // Fetch today's attendance
      const { data: att } = await supabase
        .from('attendance')
        .select('*')
        .eq('profile_id', user.id)
        .eq('date', todayStr)
        .maybeSingle()
      if (att) todayAttendanceRecord = att

      // Fetch allocations
      const { data: allocs } = await supabase
        .from('leave_allocations')
        .select('*')
        .eq('profile_id', user.id)
        .eq('year', currentYear)
      if (allocs && allocs.length > 0) allocations = allocs

      // Fetch recent attendance
      const { data: recAtt } = await supabase
        .from('attendance')
        .select('*')
        .eq('profile_id', user.id)
        .order('date', { ascending: false })
        .limit(7)
      if (recAtt) recentAttendance = recAtt

      // If admin, fetch company employees and pending requests
      if (profile.role === 'admin') {
        const { data: emps } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', profile.company_id)
        if (emps) companyEmployees = emps

        const { data: reqs } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('company_id', profile.company_id)
          .eq('status', 'pending')
        if (reqs) pendingRequests = reqs
      }

      // Latest payroll run
      const { data: pr } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (pr) latestPayrollRun = pr
    } catch {}
  }

  return (
    <DashboardView
      currentUser={profile}
      company={company}
      todayAttendanceRecord={todayAttendanceRecord}
      allocations={allocations}
      recentAttendance={recentAttendance}
      companyEmployees={companyEmployees}
      pendingRequests={pendingRequests}
      latestPayrollRun={latestPayrollRun}
    />
  )
}
