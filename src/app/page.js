import Link from 'next/link'

export default function Home() {
  return (
    <div className="form-container">
      <div className="glass-card text-center" style={{ maxWidth: '600px', padding: '3.5rem 2.5rem' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '2rem',
          color: '#fff',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
        }}>
          ⚡
        </div>
        
        <h1 className="gradient-text mb-4" style={{ fontSize: '2.5rem' }}>ODOO NMIT Portal</h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          An all-in-one company onboarding and authentication system. Register your company or sign in to access your administrative and staff dashboards.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '2.5rem' }}>
          <Link href="/signup" className="btn-primary">
            Register Company
          </Link>
          <Link href="/signin" className="btn-primary" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: 'none'
          }}>
            Portal Sign In
          </Link>
        </div>

        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Powered by Next.js 15, Supabase Auth & PostgreSQL Row-Level Security.
          </span>
        </div>
      </div>
    </div>
  )
}
