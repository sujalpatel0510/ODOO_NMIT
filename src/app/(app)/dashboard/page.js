import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardView from '../../../components/dashboard/DashboardView'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // 2. Fetch current profile
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentProfile) redirect('/signin')

  const companyId = currentProfile.company_id
  const todayStr = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  // 3. Fetch company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  // 4. Fetch today's attendance for current user
  const { data: todayAttendanceRecord } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id)
    .eq('date', todayStr)
    .maybeSingle()

  // 5. Fetch leave allocations
  const { data: allocations } = await supabase
    .from('leave_allocations')
    .select('*')
    .eq('profile_id', user.id)
    .eq('year', currentYear)

  // 6. Fetch recent attendance
  const { data: recentAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id)
    .order('date', { ascending: false })
    .limit(7)

  // 7. If admin, fetch employees and pending requests
  let companyEmployees = []
  let pendingRequests = []

  if (currentProfile.role === 'admin') {
    const { data: empList } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)

    companyEmployees = empList || []

    const { data: reqList } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending')

    pendingRequests = reqList || []
  }

  // 8. Latest payroll run
  const { data: latestPayrollRun } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <DashboardView
      currentUser={currentProfile}
      company={company}
      todayAttendanceRecord={todayAttendanceRecord}
      allocations={allocations || []}
      recentAttendance={recentAttendance || []}
      companyEmployees={companyEmployees}
      pendingRequests={pendingRequests}
      latestPayrollRun={latestPayrollRun}
    />
  )
}
