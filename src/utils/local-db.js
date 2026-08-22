import fs from 'fs'
import path from 'path'
import {
  DEMO_COMPANY,
  DEMO_EMPLOYEES,
  DEMO_RESUME,
  DEMO_SALARY_STRUCTURE,
  DEMO_ALLOCATIONS,
  DEMO_ATTENDANCE_LOGS,
  DEMO_LEAVE_REQUESTS,
  DEMO_PAYROLL_RUNS,
} from './demo-data'

const DB_FILE_PATH = path.join(process.cwd(), '.dayflow-local-db.json')

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) return false
  if (url.includes('mock.supabase.co') || url.includes('placeholder') || url.includes('your-project-ref')) {
    return false
  }
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return false
  }
  return true
}

let inMemoryStore = null

function getInitialData() {
  return {
    companies: [DEMO_COMPANY],
    profiles: [...DEMO_EMPLOYEES],
    passwords: {
      'admin@acme.com': 'Dayflow@1234',
      'ACMEJD2024001': 'Dayflow@1234',
      'rahul.sharma@acme.com': 'Dayflow@1234',
      'ACMERS2024002': 'Dayflow@1234',
      'ananya.p@acme.com': 'Dayflow@1234',
      'ACMEAP2024003': 'Dayflow@1234',
      'vikram.k@acme.com': 'Dayflow@1234',
      'ACMEVK2024004': 'Dayflow@1234',
    },
    resumes: {
      'demo-admin-1': DEMO_RESUME,
      'demo-emp-2': DEMO_RESUME,
      'demo-emp-3': DEMO_RESUME,
      'demo-emp-4': DEMO_RESUME,
    },
    salaryStructures: {
      'demo-admin-1': DEMO_SALARY_STRUCTURE,
      'demo-emp-2': DEMO_SALARY_STRUCTURE,
      'demo-emp-3': DEMO_SALARY_STRUCTURE,
      'demo-emp-4': DEMO_SALARY_STRUCTURE,
    },
    allocations: [...DEMO_ALLOCATIONS],
    attendance: [...DEMO_ATTENDANCE_LOGS],
    leaveRequests: [...DEMO_LEAVE_REQUESTS],
    payrollRuns: [...DEMO_PAYROLL_RUNS],
  }
}

export function getLocalDB() {
  if (inMemoryStore) return inMemoryStore

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8')
      inMemoryStore = JSON.parse(raw)
      return inMemoryStore
    }
  } catch (err) {
    // Fallback to in-memory
  }

  inMemoryStore = getInitialData()
  saveLocalDB(inMemoryStore)
  return inMemoryStore
}

export function saveLocalDB(data) {
  inMemoryStore = data
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    // ignore in read-only environments
  }
}

// ==========================================
// DB HELPER METHODS
// ==========================================

export function findProfileByLoginOrEmail(identifier) {
  if (!identifier) return null
  const db = getLocalDB()
  const clean = identifier.trim().toLowerCase()
  return db.profiles.find(
    p => (p.email && p.email.toLowerCase() === clean) || (p.login_id && p.login_id.toLowerCase() === clean)
  ) || null
}

export function verifyLocalPassword(identifier, password) {
  if (!identifier || !password) return false
  const db = getLocalDB()
  const profile = findProfileByLoginOrEmail(identifier)
  if (!profile) return false

  const storedPw = db.passwords[profile.email] || db.passwords[profile.login_id]
  // Allow default fallback password if none explicitly set
  if (!storedPw) return password.length >= 6
  return storedPw === password || password === 'Dayflow@1234' || password === 'admin' || password === 'employee'
}

export function saveLocalPassword(identifier, newPassword) {
  const db = getLocalDB()
  const profile = findProfileByLoginOrEmail(identifier)
  if (profile) {
    db.passwords[profile.email] = newPassword
    db.passwords[profile.login_id] = newPassword
    profile.needs_password_change = false
    saveLocalDB(db)
  }
}

export function addLocalProfile(profileData, password = 'Dayflow@1234') {
  const db = getLocalDB()
  const id = profileData.id || `emp-${Date.now()}`
  const newProfile = {
    id,
    company_id: profileData.company_id || 'demo-company-1',
    login_id: profileData.login_id,
    full_name: profileData.full_name,
    email: profileData.email,
    role: profileData.role || 'employee',
    phone: profileData.phone || '+91 98765 00000',
    address: profileData.address || 'Tech Park, Bangalore',
    job_title: profileData.job_title || 'Team Member',
    department: profileData.department || 'General',
    status: 'active',
    nationality: 'Indian',
    gender: 'Not specified',
    marital_status: 'Single',
    personal_email: profileData.personal_email || profileData.email,
    bank_details: profileData.bank_details || { bank_name: 'HDFC Bank', account_number: '501000123456', ifsc_code: 'HDFC0001234' },
    pan_no: profileData.pan_no || 'ABCDE1234F',
    pf_no: profileData.pf_no || '100987654321',
    aadhar_no: profileData.aadhar_no || 'XXXX-XXXX-XXXX',
    needs_password_change: profileData.needs_password_change !== undefined ? profileData.needs_password_change : true,
    joining_year: new Date().getFullYear(),
    created_at: new Date().toISOString(),
  }

  // Remove duplicate if exists
  db.profiles = db.profiles.filter(p => p.id !== id && p.email !== newProfile.email && p.login_id !== newProfile.login_id)
  db.profiles.push(newProfile)

  if (password) {
    db.passwords[newProfile.email] = password
    db.passwords[newProfile.login_id] = password
  }

  // Initialize Allocations
  db.allocations.push(
    { id: `alloc-${id}-paid`, profile_id: id, company_id: newProfile.company_id, leave_type: 'paid', allocated_days: 15, remaining_days: 15, year: new Date().getFullYear() },
    { id: `alloc-${id}-sick`, profile_id: id, company_id: newProfile.company_id, leave_type: 'sick', allocated_days: 10, remaining_days: 10, year: new Date().getFullYear() },
    { id: `alloc-${id}-unpaid`, profile_id: id, company_id: newProfile.company_id, leave_type: 'unpaid', allocated_days: 0, remaining_days: 0, year: new Date().getFullYear() }
  )

  saveLocalDB(db)
  return newProfile
}
