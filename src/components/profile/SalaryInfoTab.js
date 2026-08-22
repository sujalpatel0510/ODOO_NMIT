'use client'

import { useState, useTransition } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import {
  DEFAULT_COMPONENTS,
  calculateComponentsFromWage,
  validateSalaryStructure,
  calculateDeductions
} from '../../utils/salary-calculator'
import { updateSalaryStructure } from '../../app/actions/profile'
import { formatCurrency } from '../../utils/payroll-calculator'

export default function SalaryInfoTab({ profileId, initialStructure }) {
  const [monthlyWage, setMonthlyWage] = useState(
    initialStructure?.monthly_wage !== undefined ? parseFloat(initialStructure.monthly_wage) : 50000
  )
  const [workingDays, setWorkingDays] = useState(
    initialStructure?.working_days_per_week || 5
  )
  const [breakMinutes, setBreakMinutes] = useState(
    initialStructure?.break_time_minutes || 60
  )
  const [components, setComponents] = useState(
    Array.isArray(initialStructure?.components) && initialStructure.components.length > 0
      ? initialStructure.components
      : calculateComponentsFromWage(monthlyWage, DEFAULT_COMPONENTS)
  )
  const [pfEmployerPct, setPfEmployerPct] = useState(
    initialStructure?.pf_employer_pct !== undefined ? parseFloat(initialStructure.pf_employer_pct) : 12
  )
  const [pfEmployeePct, setPfEmployeePct] = useState(
    initialStructure?.pf_employee_pct !== undefined ? parseFloat(initialStructure.pf_employee_pct) : 12
  )
  const [profTax, setProfTax] = useState(
    initialStructure?.professional_tax !== undefined ? parseFloat(initialStructure.professional_tax) : 200
  )
  const [effectiveDate, setEffectiveDate] = useState(
    initialStructure?.effective_date || new Date().toISOString().split('T')[0]
  )

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  const handleWageChange = (newWageVal) => {
    const val = parseFloat(newWageVal) || 0
    setMonthlyWage(val)
    const updated = components.map(c => ({
      ...c,
      amount: Math.round((val * (parseFloat(c.percent) || 0)) / 100)
    }))
    setComponents(updated)
  }

  const handlePercentChange = (index, newPct) => {
    const pct = parseFloat(newPct) || 0
    const updated = [...components]
    updated[index] = {
      ...updated[index],
      percent: pct,
      amount: Math.round((monthlyWage * pct) / 100)
    }
    setComponents(updated)
  }

  const handleAmountChange = (index, newAmt) => {
    const amt = parseFloat(newAmt) || 0
    const updated = [...components]
    const calculatedPct = monthlyWage > 0 ? parseFloat(((amt / monthlyWage) * 100).toFixed(2)) : 0
    updated[index] = {
      ...updated[index],
      amount: amt,
      percent: calculatedPct
    }
    setComponents(updated)
  }

  const validation = validateSalaryStructure(monthlyWage, components)
  const deductions = calculateDeductions(monthlyWage, components, pfEmployerPct, pfEmployeePct, profTax)
  const estimatedNetSalary = Math.max(0, monthlyWage - deductions.totalEmployeeDeductions)

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(null)

    if (!validation.valid) {
      setMessage({
        type: 'error',
        text: `Validation Failed: Component allocations (${formatCurrency(validation.sumAmounts)}) exceed total monthly wage (${formatCurrency(monthlyWage)}).`
      })
      return
    }

    startTransition(async () => {
      const res = await updateSalaryStructure(profileId, {
        monthly_wage: monthlyWage,
        working_days_per_week: workingDays,
        break_time_minutes: breakMinutes,
        components,
        pf_employer_pct: pfEmployerPct,
        pf_employee_pct: pfEmployeePct,
        professional_tax: profTax,
        effective_date: effectiveDate
      })

      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Salary structure updated and recorded in ledger.' })
      }
    })
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-[6px] text-xs font-medium ${
            message.type === 'success'
              ? 'bg-sage/10 border border-sage/30 text-sage'
              : 'bg-rose/10 border border-rose/30 text-rose'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Wage Overview Card */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Base Wage Configuration
          </h4>
          <span className="font-mono-ledger text-xs text-amber font-semibold">
            ANNUAL CTC: {formatCurrency(monthlyWage * 12)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Monthly Wage (INR)"
            id="monthlyWage"
            name="monthlyWage"
            type="number"
            value={monthlyWage}
            onChange={(e) => handleWageChange(e.target.value)}
            required
            mono
          />

          <Input
            label="Working Days / Week"
            id="workingDays"
            name="workingDays"
            type="number"
            min={1}
            max={7}
            value={workingDays}
            onChange={(e) => setWorkingDays(parseInt(e.target.value) || 5)}
            required
            mono
          />

          <Input
            label="Daily Break (Minutes)"
            id="breakMinutes"
            name="breakMinutes"
            type="number"
            min={0}
            max={180}
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 60)}
            required
            mono
          />
        </div>

        <div className="pt-2">
          <Input
            label="Effective Date"
            id="effectiveDate"
            name="effectiveDate"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required
            mono
          />
        </div>
      </div>

      {/* Component Breakdown Table */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Component Breakdown & Allocation
          </h4>
          <div className="flex items-center gap-3 text-xs font-mono-ledger">
            <span className={validation.isPercentExceeding ? 'text-rose font-bold' : 'text-slate'}>
              Allocated: {validation.sumPercentages}%
            </span>
            <span>•</span>
            <span className={validation.isExceeding ? 'text-rose font-bold' : 'text-slate'}>
              Total: {formatCurrency(validation.sumAmounts)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-border rounded-[6px]">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Component</th>
                <th className="w-36 text-right">% of Wage</th>
                <th className="w-48 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, idx) => (
                <tr key={comp.key}>
                  <td className="font-medium text-ink">
                    {comp.name}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={comp.percent}
                        onChange={(e) => handlePercentChange(idx, e.target.value)}
                        className="w-20 bg-surface border border-border rounded px-2 py-1 text-xs text-right font-mono-ledger text-ink focus:outline-none focus:ring-1 focus:ring-amber"
                      />
                      <span className="text-xs text-slate font-mono-ledger">%</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-slate font-mono-ledger">₹</span>
                      <input
                        type="number"
                        value={comp.amount}
                        onChange={(e) => handleAmountChange(idx, e.target.value)}
                        className="w-28 bg-surface border border-border rounded px-2 py-1 text-xs text-right font-mono-ledger text-ink focus:outline-none focus:ring-1 focus:ring-amber"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-paper border-t border-border font-semibold">
                <td className="text-xs uppercase text-slate font-mono-ledger">Total Allocated</td>
                <td className={`text-right text-xs font-mono-ledger ${validation.isPercentExceeding ? 'text-rose' : 'text-ink'}`}>
                  {validation.sumPercentages}%
                </td>
                <td className={`text-right text-xs font-mono-ledger ${validation.isExceeding ? 'text-rose' : 'text-ink'}`}>
                  {formatCurrency(validation.sumAmounts)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {!validation.valid && (
          <div className="p-3 bg-rose/10 border border-rose/30 rounded-[6px] text-xs text-rose font-medium flex items-center gap-2">
            <span>⚠ Sum of components ({formatCurrency(validation.sumAmounts)}) exceeds monthly wage ({formatCurrency(monthlyWage)}). Please adjust allocations before saving.</span>
          </div>
        )}
      </div>

      {/* Statutory Deductions */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Statutory Deductions & Estimated Net Pay
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="PF Employer Contribution (%)"
            id="pfEmployerPct"
            name="pfEmployerPct"
            type="number"
            step="0.1"
            value={pfEmployerPct}
            onChange={(e) => setPfEmployerPct(parseFloat(e.target.value) || 0)}
            mono
          />

          <Input
            label="PF Employee Contribution (%)"
            id="pfEmployeePct"
            name="pfEmployeePct"
            type="number"
            step="0.1"
            value={pfEmployeePct}
            onChange={(e) => setPfEmployeePct(parseFloat(e.target.value) || 0)}
            mono
          />

          <Input
            label="Professional Tax (INR / Mo)"
            id="profTax"
            name="profTax"
            type="number"
            value={profTax}
            onChange={(e) => setProfTax(parseFloat(e.target.value) || 0)}
            mono
          />
        </div>

        <div className="p-4 bg-paper border border-border rounded-[6px] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block">Basic Base</span>
            <span className="font-mono-ledger text-sm font-semibold text-ink">
              {formatCurrency(deductions.basicSalary)}
            </span>
          </div>

          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block">PF Employee</span>
            <span className="font-mono-ledger text-sm font-semibold text-ink">
              {formatCurrency(deductions.pfEmployee)}
            </span>
          </div>

          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block">Total Deductions</span>
            <span className="font-mono-ledger text-sm font-semibold text-rose">
              -{formatCurrency(deductions.totalEmployeeDeductions)}
            </span>
          </div>

          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block">Est. Net Take-Home</span>
            <span className="font-mono-ledger text-base font-bold text-sage">
              {formatCurrency(estimatedNetSalary)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          variant="amber"
          type="submit"
          disabled={isPending || !validation.valid}
        >
          {isPending ? 'Reconciling Ledger...' : 'Save Salary Structure'}
        </Button>
      </div>
    </form>
  )
}
