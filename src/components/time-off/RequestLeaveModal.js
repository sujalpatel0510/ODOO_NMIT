'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { submitLeaveRequest } from '../../app/actions/leave'

export default function RequestLeaveModal({ isOpen, onClose }) {
  const router = useRouter()
  const [leaveType, setLeaveType] = useState('paid')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState(null)
  const [isPending, startTransition] = useTransition()

  const isSickLeave = leaveType === 'sick'

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('leaveType', leaveType)

    const file = formData.get('attachment')
    if (isSickLeave && (!file || file.size === 0)) {
      setError('Medical certificate / proof attachment is mandatory for Sick Leave requests.')
      return
    }

    startTransition(async () => {
      const res = await submitLeaveRequest(null, formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setStartDate('')
        setEndDate('')
        setRemarks('')
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Time Off"
      subtitle="Submit a formal absence request for review in the organizational ledger."
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
            Leave Category <span className="text-rose">*</span>
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <option value="paid">Paid Time Off (PTO)</option>
            <option value="sick">Sick / Medical Leave</option>
            <option value="unpaid">Unpaid Leave (Loss of Pay)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            mono
          />

          <Input
            label="End Date"
            id="endDate"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            mono
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
            Remarks & Reason
          </label>
          <textarea
            name="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder="Provide context for this leave request..."
            className="w-full bg-surface border border-border rounded-[6px] p-3 text-xs text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
            Supporting Document {isSickLeave ? <span className="text-rose font-bold">* (Mandatory for Sick Leave)</span> : '(Optional)'}
          </label>
          <input
            name="attachment"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="block w-full text-xs text-slate file:mr-3 file:py-1.5 file:px-3 file:rounded-[6px] file:border file:border-border file:text-xs file:font-medium file:bg-paper file:text-ink hover:file:bg-border/50 cursor-pointer"
          />
          <p className="text-[11px] text-slate mt-1">
            {isSickLeave
              ? 'Please attach doctor prescription or medical certificate.'
              : 'Optional proof or itinerary document (PDF, PNG, JPG).'}
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="amber" type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Submit Leave Request'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
