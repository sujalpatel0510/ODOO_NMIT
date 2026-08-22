'use client'

import { useState, useTransition } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { updateEmployeePassword } from '../../app/actions/auth'

export default function SecurityTab({ profile }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
      return
    }

    startTransition(async () => {
      const res = await updateEmployeePassword(null, formData)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Account password updated successfully.' })
        e.target.reset()
      }
    })
  }

  return (
    <div className="space-y-6">
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

      {/* Account Identifiers */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Account Identifiers
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block mb-1">
              Employee Login ID
            </span>
            <code className="font-mono-ledger text-sm text-ink font-semibold bg-paper px-3 py-1.5 rounded-[6px] border border-border inline-block w-full">
              {profile.login_id || '—'}
            </code>
          </div>

          <div>
            <span className="text-slate uppercase text-[10px] tracking-wider block mb-1">
              Primary System Email
            </span>
            <span className="font-mono-ledger text-sm text-ink bg-paper px-3 py-1.5 rounded-[6px] border border-border inline-block w-full">
              {profile.email}
            </span>
          </div>
        </div>
      </div>

      {/* Update Password */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Change Account Password
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input
            label="New Password"
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            required
            helperText="Minimum 6 characters"
          />

          <Input
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
          />

          <div className="pt-2">
            <Button variant="primary" type="submit" disabled={isPending}>
              {isPending ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
