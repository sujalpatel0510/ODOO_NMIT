'use client'

import { useActionState, startTransition } from 'react'
import { provisionEmployee } from '../../actions/auth'

export default function ProvisionForm() {
  const [state, formAction, isPending] = useActionState(provisionEmployee, null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => {
      formAction(formData)
    })
    e.currentTarget.reset()
  }

  return (
    <div className="glass-card" style={{ maxWidth: '100%', marginTop: '2rem' }}>
      <h3 className="mb-4 gradient-text">Provision New Employee</h3>
      <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Create an employee account. A unique sequential Login ID and random temporary password will be generated automatically.
      </p>

      {state?.error && (
        <div className="alert alert-danger">
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <strong className="mb-2">🎉 Employee Account Created!</strong>
          <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Share these temporary credentials with the employee. They will be forced to change their password on first login.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', width: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="mb-2"><strong>Login ID/Email:</strong> <code style={{ color: '#818cf8', fontSize: '1rem' }}>{state.loginId}</code> (or employee's email)</div>
            <div><strong>Temporary Password:</strong> <code style={{ color: '#818cf8', fontSize: '1rem' }}>{state.tempPassword}</code></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="form-input"
            placeholder="e.g. John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address *</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="e.g. john.doe@company.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="form-input"
            placeholder="e.g. +1 555-0199"
          />
        </div>

        <button
          type="submit"
          className="btn-primary mt-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="spinner" /> Provisioning...
            </>
          ) : (
            'Create Employee Account'
          )}
        </button>
      </form>
    </div>
  )
}
