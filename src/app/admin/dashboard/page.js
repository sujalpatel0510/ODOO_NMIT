import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import ProvisionForm from './ProvisionForm'
import { signOutUser } from '../../actions/auth'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Get logged-in user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/signin')
  }

  // 2. Fetch profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('company_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/signin')
  }

  const companyId = profile.company_id

  // 3. Fetch company details
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('name, company_code, logo_url')
    .eq('id', companyId)
    .single()

  if (companyError || !company) {
    return (
      <div className="form-container">
        <div className="glass-card">
          <h2 className="error-text">Failed to load company details.</h2>
        </div>
      </div>
    )
  }

  // 4. Fetch employees in the same company
  const { data: employees, error: employeesError } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, login_id, needs_password_change, created_at')
    .eq('company_id', companyId)
    .eq('role', 'employee')
    .order('created_at', { ascending: false })

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="text-center mb-6">
            {company.logo_url ? (
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
            <h2 className="gradient-text">{company.name}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              CODE: {company.company_code}
            </span>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logged in as:</p>
            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.full_name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Administrator</p>
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
          <h1 className="gradient-text">Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your organization's employees and credentials.</p>
        </header>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Column: Provision Form */}
          <div>
            <ProvisionForm />
          </div>

          {/* Right Column: Employees List */}
          <div>
            <div className="glass-card" style={{ maxWidth: '100%', marginTop: '2rem' }}>
              <h3 className="gradient-text mb-2">Employee Directory</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                All provisioned staff members for this company.
              </p>

              {employeesError ? (
                <div className="alert alert-danger">Error loading employee list.</div>
              ) : !employees || employees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '3rem' }}>👥</span>
                  <p className="mt-4">No employees provisioned yet.</p>
                </div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Login ID</th>
                        <th>Phone</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td style={{ fontWeight: '500' }}>{emp.full_name}</td>
                          <td>{emp.email}</td>
                          <td>
                            <code style={{ color: '#818cf8', fontSize: '0.85rem' }}>{emp.login_id}</code>
                          </td>
                          <td>{emp.phone || '-'}</td>
                          <td>
                            {emp.needs_password_change ? (
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.2)'
                              }}>
                                Pending Setup
                              </span>
                            ) : (
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                              }}>
                                Active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
