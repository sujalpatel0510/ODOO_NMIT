import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentSessionUser } from '../../../utils/session'
import { isSupabaseConfigured, getLocalDB } from '../../../utils/local-db'
import { createClient } from '../../../utils/supabase/server'
import { formatCurrency } from '../../../utils/payroll-calculator'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile } = session
  const companyId = profile.company_id

  const db = getLocalDB()
  let attendanceList = db.attendance
  let leaveList = db.leaveRequests
  let payrollList = db.payrollRuns
  let employees = db.profiles

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()

      const { data: att } = await supabase.from('attendance').select('*').eq('company_id', companyId)
      if (att) attendanceList = att

      const { data: leaves } = await supabase.from('leave_requests').select('*').eq('company_id', companyId)
      if (leaves) leaveList = leaves

      const { data: prs } = await supabase.from('payroll_runs').select('*').eq('company_id', companyId)
      if (prs) payrollList = prs

      const { data: emps } = await supabase.from('profiles').select('*').eq('company_id', companyId)
      if (emps) employees = emps
    } catch {}
  }

  const totalShifts = attendanceList?.length || 0
  const presentShifts = attendanceList?.filter(a => a.status === 'present').length || 0
  const attendanceRate = totalShifts > 0 ? ((presentShifts / totalShifts) * 100).toFixed(1) : '98.5'

  const totalDisbursed = (payrollList || []).reduce((acc, p) => acc + (parseFloat(p.net_pay) || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
          Executive Analytics
        </span>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight mt-1">
          Reports & Workforce Analytics
        </h1>
        <p className="text-xs text-slate mt-0.5">
          High-level metrics on organization health, attendance compliance, leave utilization, and compensation.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Total Staff Headcount
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-ink mt-1 block">
            {employees?.length || 0}
          </span>
          <span className="text-[11px] text-slate mt-1 block">Active profiles</span>
        </div>

        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Attendance Rate
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-sage mt-1 block">
            {attendanceRate}%
          </span>
          <span className="text-[11px] text-slate mt-1 block">{presentShifts} on-time shifts</span>
        </div>

        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Leave Requests
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-amber mt-1 block">
            {leaveList?.length || 0}
          </span>
          <span className="text-[11px] text-slate mt-1 block">
            {leaveList?.filter(l => l.status === 'approved').length || 0} approved
          </span>
        </div>

        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Cumulative Payroll
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-ink mt-1 block">
            {formatCurrency(totalDisbursed)}
          </span>
          <span className="text-[11px] text-slate mt-1 block">{payrollList?.length || 0} payslips issued</span>
        </div>
      </div>

      {/* Quick Action links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ledger-card p-6 bg-surface space-y-2">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Attendance Export
          </h4>
          <p className="text-xs text-slate">
            Audit full shift logs, extra hours, and break deductions across departments.
          </p>
          <div className="pt-2">
            <Link href="/attendance" className="text-xs font-mono-ledger text-amber hover:underline font-semibold">
              Open Attendance Ledger →
            </Link>
          </div>
        </div>

        <div className="ledger-card p-6 bg-surface space-y-2">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Leave Distribution
          </h4>
          <p className="text-xs text-slate">
            Review PTO, Sick leave, and Unpaid leave allocations and approvals.
          </p>
          <div className="pt-2">
            <Link href="/time-off" className="text-xs font-mono-ledger text-amber hover:underline font-semibold">
              Review Leave Queue →
            </Link>
          </div>
        </div>

        <div className="ledger-card p-6 bg-surface space-y-2">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Payslip Statements
          </h4>
          <p className="text-xs text-slate">
            Generate and export printable employee salary statements with statutory breakdowns.
          </p>
          <div className="pt-2">
            <Link href="/payroll" className="text-xs font-mono-ledger text-amber hover:underline font-semibold">
              View Payroll Statements →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
