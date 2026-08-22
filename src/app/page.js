import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-[560px] ledger-card p-10 bg-surface border border-border text-center">
        
        {/* Brand Mark */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-[8px] bg-ink text-amber font-heading font-bold text-2xl mb-6 tracking-wider">
          DF
        </div>
        
        <h1 className="font-heading text-3xl font-semibold text-ink tracking-tight mb-2">
          Dayflow HRMS
        </h1>
        <p className="font-mono-ledger text-xs text-amber font-medium tracking-wide uppercase mb-4">
          Every workday, perfectly aligned.
        </p>

        <p className="text-sm text-slate leading-relaxed mb-8 max-w-md mx-auto">
          An enterprise Human Resource Management System built with ledger-grade precision. Seamlessly manage workforce directory, daily attendance rings, leave requests, and payroll.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/signin"
            className="w-full py-3 px-4 rounded-[6px] bg-ink text-white font-medium text-sm hover:bg-opacity-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-amber"
          >
            Sign In to Ledger
          </Link>

          <Link
            href="/signup"
            className="w-full py-3 px-4 rounded-[6px] bg-amber text-white font-semibold text-sm hover:bg-opacity-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-amber"
          >
            Register Organization
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-center gap-6 text-[11px] text-slate font-mono-ledger">
          <span>SUPABASE POSTGRES</span>
          <span>•</span>
          <span>LEDGER DESIGN</span>
          <span>•</span>
          <span>ROLE RLS</span>
        </div>

      </div>
    </div>
  )
}
