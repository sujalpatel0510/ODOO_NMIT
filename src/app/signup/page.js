'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { signUpCompany } from '../actions/auth'

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpCompany, null)

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] ledger-card p-8 bg-surface border border-border">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded bg-ink text-amber flex items-center justify-center font-heading font-bold text-base">
            DF
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-ink">Dayflow</h1>
            <p className="font-mono-ledger text-[10px] text-amber font-semibold uppercase tracking-wider">
              Company Onboarding
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-heading text-xl font-semibold text-ink">
            Register Organization
          </h2>
          <p className="text-xs text-slate mt-1">
            Initialize your company workspace and create the primary administrator account.
          </p>
        </div>

        {state?.error && (
          <div className="p-3 mb-5 rounded-[6px] bg-rose/10 border border-rose/30 text-rose text-xs font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            label="Organization / Company Name"
            id="companyName"
            name="companyName"
            placeholder="e.g. Acme Corporation"
            required
          />

          <Input
            label="Administrator Full Name"
            id="adminName"
            name="adminName"
            placeholder="e.g. John Doe"
            required
          />

          <Input
            label="Administrator Official Email"
            id="email"
            name="email"
            type="email"
            placeholder="admin@company.com"
            required
          />

          <Input
            label="Master Password"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            helperText="Minimum 6 characters"
          />

          <div className="pt-2">
            <Button
              variant="amber"
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 font-semibold text-sm"
            >
              {isPending ? 'Registering Organization...' : 'Create Organization Workspace'}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-slate">
          <span>Already registered?</span>
          <Link href="/signin" className="text-amber font-semibold hover:underline">
            Sign In →
          </Link>
        </div>

      </div>
    </div>
  )
}
