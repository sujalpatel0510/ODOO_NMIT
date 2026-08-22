'use client'

import { useActionState, useState, startTransition } from 'react'
import { onboardCompany } from '../actions/auth'
import Link from 'next/link'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(onboardCompany, null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [clientError, setClientError] = useState(null)

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setClientError('Logo file size must be less than 2MB.')
        e.target.value = ''
        setLogoPreview(null)
        return
      }
      setClientError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setClientError(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      setClientError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setClientError('Password must be at least 6 characters long.')
      return
    }

    // Trigger Server Action in a transition
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="form-container">
      <div className="glass-card">
        <h1 className="text-center mb-2 gradient-text">Create Company Account</h1>
        <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Onboard your company and set up your administrator profile.
        </p>

        {(state?.error || clientError) && (
          <div className="alert alert-danger">
            <span>{state?.error || clientError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Company Details */}
          <h3 className="mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Company Details
          </h3>

          <div className="form-group">
            <label className="form-label" htmlFor="companyName">Company Name *</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className="form-input"
              placeholder="e.g. Acme Corporation"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="logo">Company Logo</label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              className="form-input"
              onChange={handleLogoChange}
            />
            <div className="logo-preview-container">
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo preview" className="logo-preview" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logo selected</span>
                </>
              ) : (
                <>
                  <div className="logo-preview-placeholder">★</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No logo selected (optional)</span>
                </>
              )}
            </div>
          </div>

          {/* Admin Details */}
          <h3 className="mb-4 mt-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Administrator Profile
          </h3>

          <div className="form-group">
            <label className="form-label" htmlFor="adminName">Full Name *</label>
            <input
              id="adminName"
              name="adminName"
              type="text"
              className="form-input"
              placeholder="e.g. Sujal Patel"
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
              placeholder="e.g. admin@acme.com"
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

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
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
                <div className="spinner" /> Onboarding...
              </>
            ) : (
              'Register Company'
            )}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/signin" className="link-styled">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
