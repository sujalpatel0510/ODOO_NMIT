'use client'

export default function LeaveBalanceCards({ allocations = [] }) {
  const getBal = (type) => {
    const found = allocations.find(a => a.leave_type === type)
    return {
      remaining: found ? parseFloat(found.remaining_days) : (type === 'unpaid' ? '—' : 0),
      allocated: found ? parseFloat(found.allocated_days) : (type === 'unpaid' ? '—' : 0),
    }
  }

  const paid = getBal('paid')
  const sick = getBal('sick')
  const unpaid = getBal('unpaid')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Paid Leave Card */}
      <div className="ledger-card p-5 bg-surface">
        <div className="flex items-center justify-between">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Paid Time Off (PTO)
          </span>
          <span className="w-2 h-2 rounded-full bg-sage" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono-ledger text-3xl font-bold text-ink">
            {paid.remaining}
          </span>
          <span className="text-xs text-slate font-mono-ledger">
            / {paid.allocated} days left
          </span>
        </div>
        <p className="text-[11px] text-slate mt-1.5">
          Standard earned annual vacation balance
        </p>
      </div>

      {/* Sick Leave Card */}
      <div className="ledger-card p-5 bg-surface">
        <div className="flex items-center justify-between">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Medical / Sick Leave
          </span>
          <span className="w-2 h-2 rounded-full bg-amber" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono-ledger text-3xl font-bold text-ink">
            {sick.remaining}
          </span>
          <span className="text-xs text-slate font-mono-ledger">
            / {sick.allocated} days left
          </span>
        </div>
        <p className="text-[11px] text-slate mt-1.5">
          Requires doctor note or certificate attachment
        </p>
      </div>

      {/* Unpaid Leave Card */}
      <div className="ledger-card p-5 bg-surface">
        <div className="flex items-center justify-between">
          <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
            Unpaid Leave (LWP)
          </span>
          <span className="w-2 h-2 rounded-full bg-dust" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono-ledger text-3xl font-bold text-ink">
            {unpaid.remaining === '—' ? 'Flexible' : unpaid.remaining}
          </span>
        </div>
        <p className="text-[11px] text-slate mt-1.5">
          Deducted from payable days during payroll run
        </p>
      </div>
    </div>
  )
}
