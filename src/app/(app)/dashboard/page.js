import { redirect } from 'next/navigation'
import DashboardView from '../../../components/dashboard/DashboardView'
import { getCurrentSessionUser } from '../../../utils/session'
import { isSupabaseConfigured, getLocalDB } from '../../../utils/local-db'
import { createClient } from '../../../utils/supabase/server'
import { DEMO_COMPANY } from '../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile, user } = session
  const todayStr = new Date().toISOString().split('T')[0]
  const currentYear = new Date().getFullYear()

  const db = getLocalDB()
  let company = db.companies.find(c => c.id === profile.company_id) || DEMO_COMPANY
  let todayAttendanceRecord = db.attendance.find(a => a.profile_id === profile.id && a.date === todayStr) || null
  let allocations = db.allocations.filter(a => a.profile_id === profile.id && a.year === currentYear)
  if (allocations.length === 0) allocations = db.allocations.slice(0, 3)
  let recentAttendance = db.attendance.filter(a => a.profile_id === profile.id)
  if (recentAttendance.length === 0) recentAttendance = db.attendance.slice(0, 4)
  let companyEmployees = db.profiles
  let pendingRequests = db.leaveRequests.filter(r => r.status === 'pending')
  let latestPayrollRun = db.payrollRuns[0]

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()

      const { data: comp } = await supabase.from('companies').select('*').eq('id', profile.company_id).single()
      if (comp) company = comp

      const { data: att } = await supabase.from('attendance').select('*').eq('profile_id', user.id).eq('date', todayStr).maybeSingle()
      if (att) todayAttendanceRecord = att

      const { data: allocs } = await supabase.from('leave_allocations').select('*').eq('profile_id', user.id).eq('year', currentYear)
      if (allocs && allocs.length > 0) allocations = allocs

      const { data: recAtt } = await supabase.from('attendance').select('*').eq('profile_id', user.id).order('date', { ascending: false }).limit(7)
      if (recAtt) recentAttendance = recAtt

      if (profile.role === 'admin') {
        const { data: emps } = await supabase.from('profiles').select('*').eq('company_id', profile.company_id)
        if (emps && emps.length > 0) companyEmployees = emps

        const { data: reqs } = await supabase.from('leave_requests').select('*').eq('company_id', profile.company_id).eq('status', 'pending')
        if (reqs) pendingRequests = reqs
      }

      const { data: pr } = await supabase.from('payroll_runs').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (pr) latestPayrollRun = pr
    } catch {}
  }

  return (
    <DashboardView
      currentUser={profile}
      company={company}
      todayAttendanceRecord={todayAttendanceRecord}
      allocations={allocations}
      recentAttendance={recentAttendance}
      companyEmployees={companyEmployees}
      pendingRequests={pendingRequests}
      latestPayrollRun={latestPayrollRun}
    />
  )
}
