'use client'

import { useState, useTransition } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { allocateLeaveDays } from '../../app/actions/leave'

export default function AdminAllocationModal({ isOpen, onClose, employees = [] }) {
  const [selectedProfileId, setSelectedProfileId] = useState(employees[0]?.id || '')
  const [leaveType, setLeaveType] = useState('paid')
  const [allocatedDays, setAllocatedDays] = useState(15)
  const [year, setYear] = useState(new Date().getFullYear())
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!selectedProfileId) {
      setError('Please select an employee.')
      return
    }

    startTransition(async () => {
      const res = await allocateLeaveDays(selectedProfileId, leaveType, allocatedDays, year)
      if (res?.error) {
        setError(res.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Allocate Annual Leave Days"
      subtitle="Assign earned leave quota to an employee for the calendar year."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-[6px] bg-rose/10 border border-rose/30 text-rose text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
            Select Employee
          </label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="w-full bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.login_id || emp.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber"
            >
              <option value="paid">Paid Time Off (PTO)</option>
              <option value="sick">Sick Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <Input
            label="Year"
            id="year"
            name="year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
            mono
          />
        </div>

        <Input
          label="Allocated Days"
          id="allocatedDays"
          name="allocatedDays"
          type="number"
          step="0.5"
          min="0"
          max="60"
          value={allocatedDays}
          onChange={(e) => setAllocatedDays(parseFloat(e.target.value) || 0)}
          required
          mono
        />

        <div className="pt-2 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="amber" type="submit" disabled={isPending}>
            {isPending ? 'Allocating...' : 'Set Allocation'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
