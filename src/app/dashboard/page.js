import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOutUser } from '../actions/auth'

export const dynamic = 'force-dynamic'

export default async function EmployeeDashboard() {
  const supabase = await createClient()

  // 1. Get logged-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/signin')
  }

  // 2. Fetch employee profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('company_id, role, full_name, email, phone, login_id, needs_password_change, joining_year')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/signin')
  }

  // 3. Force redirect if first-time login
  if (profile.needs_password_change) {
    redirect('/set-password')
  }

  // 4. Fetch company info
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('name, logo_url, company_code')
    .eq('id', profile.company_id)
    .single()

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="text-center mb-6">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} Logo`}
                className="logo-preview"
                style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}
              />
            ) : (
              <div
                className="logo-preview-placeholder"
                style={{ width: '80px', height: '80px', margin: '0 auto 1rem', fontSize: '2rem' }}
              >
                🏢
              </div>
            )}
            <h2 className="gradient-text">{company?.name || 'Company Portal'}</h2>
            {company && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                CODE: {company.company_code}
              </span>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logged in as:</p>
            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.full_name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staff Member</p>
          </div>
        </div>

        <form action={signOutUser}>
          <button type="submit" className="btn-primary" style={{ background: 'var(--danger-gradient)', boxShadow: 'none' }}>
            Sign Out
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="mb-6">
          <h1 className="gradient-text">Welcome back, {profile.full_name}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your employee profile card and workspace information.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', alignItems: 'start' }}>
          
          {/* Profile Card */}
          <div className="glass-card" style={{ maxWidth: '100%', padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '1.5rem',
                color: '#fff',
                fontWeight: '600'
              }}>
                {profile.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="gradient-text" style={{ fontSize: '1.25rem' }}>{profile.full_name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Joined in {profile.joining_year}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <span className="form-label" style={{ marginBottom: '0.25rem' }}>Employee Login ID</span>
                <code style={{ color: '#818cf8', fontSize: '1.1rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block' }}>
                  {profile.login_id}
                </code>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '0.25rem' }}>Email Address</span>
                <p style={{ fontWeight: '500' }}>{profile.email}</p>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '0.25rem' }}>Phone Number</span>
                <p style={{ fontWeight: '500' }}>{profile.phone || 'Not provided'}</p>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: '0.25rem' }}>Account Role</span>
                <p style={{ fontWeight: '500', color: '#10b981' }}>{profile.role.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Quick Workspace Stats/Info */}
          <div className="glass-card" style={{ maxWidth: '100%', padding: '2.5rem' }}>
            <h3 className="gradient-text mb-4">Workspace Details</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              You are signed into the official portal for <strong>{company?.name}</strong>. From here, you will soon be able to access your personal dashboard, check assigned tasks, submit time entries, and review project workflows.
            </p>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontWeight: '600', color: '#10b981', marginTop: '0.25rem' }}>Active</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Company Code</div>
                <div style={{ fontWeight: '600', color: '#818cf8', marginTop: '0.25rem' }}>{company?.company_code}</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
