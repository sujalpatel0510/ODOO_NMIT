import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import PayrollDashboardView from '../../../components/payroll/PayrollDashboardView'

export const dynamic = 'force-dynamic'

export default async function PayrollPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/signin')

  const companyId = profile.company_id
  const isAdmin = profile.role === 'admin'

  // 1. Fetch Company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  // 2. Fetch Payroll Runs (All if admin, own if employee)
  let runsQuery = supabase
    .from('payroll_runs')
    .select('*')
    .order('created_at', { ascending: false })

  if (isAdmin) {
    runsQuery = runsQuery.eq('company_id', companyId)
  } else {
    runsQuery = runsQuery.eq('profile_id', user.id)
  }

  const { data: payrollRuns } = await runsQuery

  // 3. Fetch Company Employees
  let companyEmployees = []
  if (isAdmin) {
    const { data: emps } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)

    companyEmployees = emps || []
  } else {
    companyEmployees = [profile]
  }

  // 4. Leave and Attendance stats
  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('company_id', companyId)

  const approvedLeaves = (leaveRequests || []).filter(l => l.status === 'approved').length

  return (
    <PayrollDashboardView
      isAdmin={isAdmin}
      payrollRuns={payrollRuns || []}
      companyEmployees={companyEmployees}
      company={company}
      attendanceStats={{ attendanceRate: '97.2' }}
      leaveStats={{ approvedLeaves }}
    />
  )
}
