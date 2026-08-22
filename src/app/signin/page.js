'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { signInUser } from '../actions/auth'

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInUser, null)

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] ledger-card p-8 bg-surface border border-border">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded bg-ink text-amber flex items-center justify-center font-heading font-bold text-base">
            DF
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-ink">Dayflow</h1>
            <p className="font-mono-ledger text-[10px] text-amber font-semibold uppercase tracking-wider">
              Identity Portal
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-heading text-xl font-semibold text-ink">
            Sign In
          </h2>
          <p className="text-xs text-slate mt-1">
            Enter your Login ID or registered organization email to access your workspace.
          </p>
        </div>

        {state?.error && (
          <div className="p-3 mb-5 rounded-[6px] bg-rose/10 border border-rose/30 text-rose text-xs font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            label="Login ID or Email"
            id="identifier"
            name="identifier"
            placeholder="e.g. ACMEJS2401 or user@company.com"
            required
            mono
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />

          <div className="pt-2">
            <Button
              variant="amber"
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 font-semibold text-sm"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-slate">
          <span>New organization?</span>
          <Link href="/signup" className="text-amber font-semibold hover:underline">
            Register Company →
          </Link>
        </div>

      </div>
    </div>
  )
}
