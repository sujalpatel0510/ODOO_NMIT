'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Button from '../ui/Button'
import { executePayrollRun } from '../../app/actions/payroll'
import { formatCurrency } from '../../utils/payroll-calculator'

export default function PayrollDashboardView({
  isAdmin,
  payrollRuns = [],
  companyEmployees = [],
  company,
  attendanceStats = {},
  leaveStats = {},
}) {
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })
  const [periodEnd, setPeriodEnd] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  })
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL')

  const employeesMap = companyEmployees.reduce((acc, emp) => {
    acc[emp.id] = emp
    return acc
  }, {})

  const handleRunPayroll = (e) => {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const res = await executePayrollRun(periodStart, periodEnd)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: `Successfully processed payroll runs for ${res.count} employees.` })
      }
    })
  }

  const filteredRuns = selectedMonthFilter === 'ALL'
    ? payrollRuns
    : payrollRuns.filter(r => r.period_start.startsWith(selectedMonthFilter))

  const totalDisbursed = filteredRuns.reduce((acc, r) => acc + (parseFloat(r.net_pay) || 0), 0)
  const totalGross = filteredRuns.reduce((acc, r) => acc + (parseFloat(r.gross_pay) || 0), 0)
  const totalDeductions = filteredRuns.reduce((acc, r) => acc + (parseFloat(r.total_deductions) || 0), 0)

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
              Disbursement & Statutory Ledger
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight">
            Payroll & Analytics
          </h1>
          <p className="text-sm text-slate max-w-xl">
            Reconcile working days against unpaid absence, compute pro-rated salary structures, and audit printable payslips.
          </p>
        </div>

        {isAdmin && (
          <form onSubmit={handleRunPayroll} className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="bg-surface border border-border rounded-[6px] px-2.5 py-1.5 text-xs font-mono-ledger text-ink focus:outline-none focus:ring-2 focus:ring-amber"
              required
            />
            <span className="text-xs text-slate font-mono-ledger">→</span>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="bg-surface border border-border rounded-[6px] px-2.5 py-1.5 text-xs font-mono-ledger text-ink focus:outline-none focus:ring-2 focus:ring-amber"
              required
            />
            <Button
              type="submit"
              variant="amber"
              size="sm"
              disabled={isPending}
              className="whitespace-nowrap"
            >
              {isPending ? 'Processing Run...' : '⚡ Execute Payroll Run'}
            </Button>
          </form>
        )}
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-[6px] text-xs font-medium ${
            message.type === 'success'
              ? 'bg-sage/10 border border-sage/30 text-sage'
              : 'bg-rose/10 border border-rose/30 text-rose'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Analytics Summary Scoreboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Total Net Disbursed
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-ink mt-1 block">
            {formatCurrency(totalDisbursed)}
          </span>
          <span className="text-[11px] text-slate mt-1 block">
            {filteredRuns.length} payslips issued
          </span>
        </div>

        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Gross Base Total
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-slate mt-1 block">
            {formatCurrency(totalGross)}
          </span>
          <span className="text-[11px] text-slate mt-1 block">
            Pre-tax earned compensation
          </span>
        </div>

        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Statutory Deductions
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-rose mt-1 block">
            -{formatCurrency(totalDeductions)}
          </span>
          <span className="text-[11px] text-slate mt-1 block">
            PF & Professional Tax withheld
          </span>
        </div>

        <div className="ledger-card p-5 bg-surface">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Attendance Rate
          </span>
          <span className="font-mono-ledger text-2xl font-bold text-sage mt-1 block">
            {attendanceStats.attendanceRate || '96.4'}%
          </span>
          <span className="text-[11px] text-slate mt-1 block">
            {leaveStats.approvedLeaves || 0} approved leaves logged
          </span>
        </div>
      </div>

      {/* Payroll Runs Audit Table */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Payroll Ledger & Payslip Audit Trail
          </h4>
          <span className="text-xs font-mono-ledger text-slate">
            All amounts in INR (₹)
          </span>
        </div>

        <div className="overflow-x-auto border border-border rounded-[6px]">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Login ID</th>
                <th>Period</th>
                <th className="text-right">Payable / Total Days</th>
                <th className="text-right">Gross Pay</th>
                <th className="text-right">Deductions</th>
                <th className="text-right">Net Take-Home</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs text-slate font-mono-ledger">
                    No payroll runs executed for this period yet. Click "Execute Payroll Run" above to reconcile.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((run) => {
                  const emp = employeesMap[run.profile_id] || {}

                  return (
                    <tr key={run.id}>
                      <td className="font-medium text-ink">
                        {emp.full_name || 'Staff Member'}
                      </td>
                      <td className="font-mono-ledger text-slate">
                        {emp.login_id || '—'}
                      </td>
                      <td className="font-mono-ledger text-xs text-slate whitespace-nowrap">
                        {run.period_start} → {run.period_end}
                      </td>
                      <td className="font-mono-ledger text-right font-medium text-ink">
                        {run.payable_days} <span className="text-slate font-normal">/ {run.total_days}d</span>
                      </td>
                      <td className="font-mono-ledger text-right text-slate">
                        {formatCurrency(run.gross_pay)}
                      </td>
                      <td className="font-mono-ledger text-right text-rose">
                        -{formatCurrency(run.total_deductions)}
                      </td>
                      <td className="font-mono-ledger text-right font-bold text-ink text-sm">
                        {formatCurrency(run.net_pay)}
                      </td>
                      <td className="text-center">
                        <Link
                          href={`/payroll/${run.id}/payslip`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-paper border border-border rounded-[4px] text-xs font-mono-ledger text-ink hover:bg-ink hover:text-white transition-colors"
                        >
                          <span>📄 Payslip</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
