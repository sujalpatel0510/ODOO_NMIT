'use client'

import { useActionState, startTransition } from 'react'
import { signInUser } from '../actions/auth'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInUser, null)
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="form-container">
      <div className="glass-card">
        <h1 className="text-center mb-2 gradient-text">Welcome Back</h1>
        <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Sign in to access your portal.
        </p>

        {registered && (
          <div className="alert alert-success">
            <span>Company registered successfully! Please log in below.</span>
          </div>
        )}

        {state?.error && (
          <div className="alert alert-danger">
            <span>{state.error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="e.g. user@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
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
                <div className="spinner" /> Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have a company account?{' '}
          <Link href="/signup" className="link-styled">
            Register Company
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="form-container">
        <div className="glass-card text-center">
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p className="mt-4">Loading Sign In...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
