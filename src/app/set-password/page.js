'use client'

import { useActionState, useState, startTransition } from 'react'
import { updateEmployeePassword } from '../actions/auth'

export default function SetPasswordPage() {
  const [state, formAction, isPending] = useActionState(updateEmployeePassword, null)
  const [clientError, setClientError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setClientError(null)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      setClientError('Passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setClientError('Password must be at least 6 characters long.')
      return
    }

    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="form-container">
      <div className="glass-card">
        <h1 className="text-center mb-2 gradient-text">Setup New Password</h1>
        <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          This is your first login. For security reasons, you must set a new password before accessing your dashboard.
        </p>

        {(state?.error || clientError) && (
          <div className="alert alert-danger">
            <span>{state?.error || clientError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary mt-4"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="spinner" /> Saving Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
