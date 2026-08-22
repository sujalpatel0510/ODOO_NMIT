'use client'

import { useState, useTransition } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { provisionEmployee } from '../../app/actions/auth'

export default function ProvisionEmployeeModal({ isOpen, onClose }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [provisionedData, setProvisionedData] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await provisionEmployee(null, formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        setProvisionedData(res)
      }
    })
  }

  const handleClose = () => {
    setProvisionedData(null)
    setError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={provisionedData ? 'Employee Provisioned' : 'Provision New Staff Member'}
      subtitle={
        provisionedData
          ? 'Share these temporary login credentials with the employee.'
          : 'Creates an employee record and generates a sequential Login ID.'
      }
      maxWidth="max-w-md"
    >
      {provisionedData ? (
        <div className="space-y-4">
          <div className="p-4 bg-sage/10 border border-sage/30 rounded-[6px] text-xs space-y-2">
            <p className="font-medium text-sage">✓ Account created successfully!</p>
            <div className="pt-2 border-t border-sage/20 space-y-1">
              <div>
                <span className="text-slate uppercase text-[10px] tracking-wider block">Login ID</span>
                <code className="font-mono-ledger text-sm text-ink font-semibold">
                  {provisionedData.loginId}
                </code>
              </div>
              <div className="pt-1">
                <span className="text-slate uppercase text-[10px] tracking-wider block">Temporary Password</span>
                <code className="font-mono-ledger text-sm text-amber font-semibold bg-paper px-2 py-0.5 rounded border border-border inline-block">
                  {provisionedData.tempPassword}
                </code>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate">
            The employee will be required to change their temporary password upon their first sign-in.
          </p>

          <Button variant="primary" onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-[6px] bg-rose/10 border border-rose/30 text-rose text-xs font-medium">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            id="fullName"
            name="fullName"
            placeholder="e.g. Rahul Sharma"
            required
          />

          <Input
            label="Official Email"
            id="email"
            name="email"
            type="email"
            placeholder="e.g. rahul.s@company.com"
            required
          />

          <Input
            label="Phone Number"
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="amber" type="submit" disabled={isPending}>
              {isPending ? 'Provisioning...' : 'Provision Employee'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
