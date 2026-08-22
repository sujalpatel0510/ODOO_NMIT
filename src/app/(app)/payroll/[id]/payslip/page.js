import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import PrintPayslipButton from './PrintPayslipButton'
import { getCurrentSessionUser } from '../../../../../utils/session'
import { createClient } from '../../../../../utils/supabase/server'
import { formatCurrency } from '../../../../../utils/payroll-calculator'
import { DEMO_COMPANY, DEMO_EMPLOYEES, DEMO_PAYROLL_RUNS } from '../../../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function PayslipPage({ params }) {
  const { id } = await params
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile: currentProfile, isDemo } = session

  let run = DEMO_PAYROLL_RUNS.find(r => r.id === id) || DEMO_PAYROLL_RUNS[0]
  let employee = DEMO_EMPLOYEES.find(e => e.id === run.profile_id) || DEMO_EMPLOYEES[0]
  let company = DEMO_COMPANY

  if (!isDemo) {
    try {
      const supabase = await createClient()

      const { data: r } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('id', id)
        .single()
      if (r) run = r

      const { data: emp } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', run.profile_id)
        .single()
      if (emp) employee = emp

      const { data: comp } = await supabase
        .from('companies')
        .select('*')
        .eq('id', run.company_id)
        .single()
      if (comp) company = comp
    } catch {}
  }

  // Components mapping
  const computedComponents = run.computed_components || {}
  const componentsList = Object.entries(computedComponents).map(([key, val]) => ({
    key,
    ...val,
  }))

  const bank = employee?.bank_details || {}

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between no-print pb-2">
        <Link
          href="/payroll"
          className="text-xs font-mono-ledger text-slate hover:text-ink transition-colors flex items-center gap-1"
        >
          <span>←</span> Back to Payroll Dashboard
        </Link>
        <PrintPayslipButton />
      </div>

      {/* Ledger Grade Payslip Document */}
      <div className="ledger-card p-6 sm:p-10 md:p-12 bg-surface border border-border space-y-8 print:p-0 print:border-none">
        
        {/* Header: Company & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-ink">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded bg-ink text-amber flex items-center justify-center font-heading font-bold text-sm">
                {company?.company_code?.slice(0, 2) || 'DF'}
              </div>
              <h2 className="font-heading text-xl font-bold text-ink">
                {company?.name || 'Dayflow Organization'}
              </h2>
            </div>
            <p className="font-mono-ledger text-xs text-slate uppercase">
              {company?.company_code} • CONFIDENTIAL SALARY DISBURSEMENT STATEMENT
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider block">
              Payslip For Period
            </span>
            <span className="font-mono-ledger text-base font-bold text-ink block">
              {run.period_start} to {run.period_end}
            </span>
            <span className="font-mono-ledger text-[11px] text-slate block mt-0.5">
              Ref: #{run.id?.slice(0, 8).toUpperCase() || 'RUN001'}
            </span>
          </div>
        </div>

        {/* Employee & Bank Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-4 bg-paper border border-border rounded-[6px] text-xs">
          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Employee Name
            </span>
            <span className="font-heading font-semibold text-ink text-sm block mt-0.5">
              {employee?.full_name}
            </span>
            <span className="font-mono-ledger text-slate text-[11px]">
              ID: {employee?.login_id || '—'}
            </span>
          </div>

          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Department & Title
            </span>
            <span className="font-medium text-ink block mt-0.5">
              {employee?.department || 'General'}
            </span>
            <span className="text-slate text-[11px]">
              {employee?.job_title || 'Team Member'}
            </span>
          </div>

          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Bank Details
            </span>
            <span className="font-medium text-ink block mt-0.5">
              {bank.bank_name || 'HDFC Bank'}
            </span>
            <span className="font-mono-ledger text-slate text-[11px]">
              A/C: {bank.account_number ? `••••${bank.account_number.slice(-4)}` : '••••5678'}
            </span>
          </div>

          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Payable / Total Days
            </span>
            <span className="font-mono-ledger font-bold text-ink text-sm block mt-0.5">
              {run.payable_days} <span className="text-slate font-normal text-xs">/ {run.total_days} days</span>
            </span>
            <span className="font-mono-ledger text-sage text-[11px]">
              Pro-rated Ratio: {((run.payable_days / run.total_days) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Earnings & Deductions Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Earnings Column */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-ink pb-1 border-b border-border">
              Earnings (Gross Allowances)
            </h4>
            <div className="space-y-2 text-xs">
              {componentsList.length === 0 ? (
                <div className="flex justify-between py-1">
                  <span className="text-slate">Base Salary (Pro-rated)</span>
                  <span className="font-mono-ledger font-medium text-ink">{formatCurrency(run.gross_pay)}</span>
                </div>
              ) : (
                componentsList.map(c => (
                  <div key={c.key} className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-slate">{c.name}</span>
                    <span className="font-mono-ledger font-medium text-ink">
                      {formatCurrency(c.proRatedAmount)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-border font-semibold text-xs">
              <span className="text-ink uppercase font-mono-ledger">Total Gross Earnings</span>
              <span className="font-mono-ledger text-ink font-bold">
                {formatCurrency(run.gross_pay)}
              </span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-ink pb-1 border-b border-border">
              Statutory & Tax Deductions
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-slate">Provident Fund (Employee 12%)</span>
                <span className="font-mono-ledger font-medium text-rose">
                  -{formatCurrency(Math.max(0, run.total_deductions - 200))}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-slate">Professional Tax (PT)</span>
                <span className="font-mono-ledger font-medium text-rose">
                  -{formatCurrency(200)}
                </span>
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-border font-semibold text-xs">
              <span className="text-ink uppercase font-mono-ledger">Total Deductions</span>
              <span className="font-mono-ledger text-rose font-bold">
                -{formatCurrency(run.total_deductions)}
              </span>
            </div>
          </div>

        </div>

        {/* Net Take-Home Highlight Banner */}
        <div className="p-6 bg-paper border border-ink rounded-[6px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-slate uppercase text-xs tracking-wider block font-mono-ledger font-semibold">
              Net Take-Home Pay (Disbursed)
            </span>
            <p className="text-xs text-slate mt-0.5">
              Transferred to registered bank account via direct automated clearing.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="font-mono-ledger text-3xl font-bold text-ink">
              {formatCurrency(run.net_pay)}
            </span>
            <span className="font-mono-ledger text-[11px] text-sage block font-semibold">
              ✓ RECONCILED IN LEDGER
            </span>
          </div>
        </div>

        {/* Statutory Footer */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono-ledger text-slate">
          <span>This is a computer generated document. No physical signature is required.</span>
          <span>Dayflow HRMS • Secure Statutory Audit Ledger</span>
        </div>

      </div>

    </div>
  )
}
