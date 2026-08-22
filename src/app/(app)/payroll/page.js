import { redirect } from 'next/navigation'
import PayrollDashboardView from '../../../components/payroll/PayrollDashboardView'
import { getCurrentSessionUser } from '../../../utils/session'
import { createClient } from '../../../utils/supabase/server'
import {
  DEMO_COMPANY,
  DEMO_EMPLOYEES,
  DEMO_PAYROLL_RUNS,
  DEMO_LEAVE_REQUESTS,
} from '../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function PayrollPage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile, user, isDemo } = session
  const companyId = profile.company_id
  const isAdmin = profile.role === 'admin'

  let company = DEMO_COMPANY
  let payrollRuns = DEMO_PAYROLL_RUNS
  let companyEmployees = DEMO_EMPLOYEES
  let approvedLeaves = 2

  if (!isDemo) {
    try {
      const supabase = await createClient()

      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()
      if (comp) company = comp

      let runsQuery = supabase
        .from('payroll_runs')
        .select('*')
        .order('created_at', { ascending: false })

      if (isAdmin) {
        runsQuery = runsQuery.eq('company_id', companyId)
      } else {
        runsQuery = runsQuery.eq('profile_id', user.id)
      }

      const { data: prs } = await runsQuery
      if (prs && prs.length > 0) payrollRuns = prs

      if (isAdmin) {
        const { data: emps } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', companyId)
        if (emps && emps.length > 0) companyEmployees = emps
      } else {
        companyEmployees = [profile]
      }

      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('company_id', companyId)
      if (leaves) {
        approvedLeaves = leaves.filter(l => l.status === 'approved').length
      }
    } catch {}
  }

  return (
    <PayrollDashboardView
      isAdmin={isAdmin}
      payrollRuns={payrollRuns}
      companyEmployees={companyEmployees}
      company={company}
      attendanceStats={{ attendanceRate: '97.2' }}
      leaveStats={{ approvedLeaves }}
    />
  )
}
