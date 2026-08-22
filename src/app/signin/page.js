'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { signInUser, demoLogin } from '../actions/auth'

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInUser, null)

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[460px] ledger-card p-6 sm:p-8 bg-surface border border-border">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-ink text-amber flex items-center justify-center font-heading font-bold text-lg shadow-sm">
              DF
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-ink leading-tight">Dayflow HRMS</h1>
              <p className="font-mono-ledger text-[10px] text-amber font-semibold uppercase tracking-wider">
                Identity & Access Ledger
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono-ledger text-sage bg-sage/10 px-2 py-0.5 rounded border border-sage/20 font-semibold">
            v2.4 Active
          </span>
        </div>

        <div className="mb-5">
          <h2 className="font-heading text-xl font-semibold text-ink">
            Sign In to Workspace
          </h2>
          <p className="text-xs text-slate mt-0.5">
            Enter your sequential Login ID or registered official email address.
          </p>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="mb-5 p-3.5 bg-paper border border-border rounded-[6px] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono-ledger font-semibold text-ink flex items-center gap-1.5">
              <span className="text-amber">⚡</span> Quick Demo Exploration
            </span>
            <span className="text-[10px] text-slate font-mono-ledger">Instant 1-Click Access</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => demoLogin('admin')}
              className="py-2 px-2.5 bg-surface border border-border rounded-[4px] text-xs font-semibold text-ink hover:border-amber hover:text-amber transition-all flex flex-col items-center justify-center text-center group"
            >
              <span className="text-[11px] font-bold">Admin Portal</span>
              <span className="text-[9px] font-mono-ledger text-slate group-hover:text-amber/80">John Doe (COO)</span>
            </button>

            <button
              type="button"
              onClick={() => demoLogin('employee')}
              className="py-2 px-2.5 bg-surface border border-border rounded-[4px] text-xs font-semibold text-ink hover:border-amber hover:text-amber transition-all flex flex-col items-center justify-center text-center group"
            >
              <span className="text-[11px] font-bold">Employee Portal</span>
              <span className="text-[9px] font-mono-ledger text-slate group-hover:text-amber/80">Rahul Sharma (Eng)</span>
            </button>
          </div>
        </div>

        {state?.error && (
          <div className="p-3 mb-4 rounded-[6px] bg-rose/10 border border-rose/30 text-rose text-xs font-medium leading-relaxed">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            label="Login ID or Email"
            id="identifier"
            name="identifier"
            placeholder="e.g. ACMEJD2024001 or admin@acme.com"
            required
            mono
          />

          <Input
            label="Account Password"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />

          <div className="pt-1">
            <Button
              variant="amber"
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 font-semibold text-sm"
            >
              {isPending ? 'Authenticating...' : 'Sign In with Credentials'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-slate">
          <span>Need a new organization?</span>
          <Link href="/signup" className="text-amber font-semibold hover:underline">
            Register Company →
          </Link>
        </div>

      </div>
    </div>
  )
}
