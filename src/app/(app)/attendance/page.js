import { redirect } from 'next/navigation'
import AttendanceView from '../../../components/attendance/AttendanceView'
import { getCurrentSessionUser } from '../../../utils/session'
import { isSupabaseConfigured, getLocalDB } from '../../../utils/local-db'
import { createClient } from '../../../utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile: currentProfile, user } = session
  const companyId = currentProfile.company_id
  const isAdmin = currentProfile.role === 'admin'
  const todayStr = new Date().toISOString().split('T')[0]

  const db = getLocalDB()
  let todayAttendanceRecord = db.attendance.find(a => a.profile_id === user.id && a.date === todayStr) || null
  let dailyRecords = db.attendance.filter(a => a.date === todayStr)
  if (dailyRecords.length === 0) dailyRecords = db.attendance
  let companyEmployees = db.profiles
  let monthlyRecords = db.attendance.filter(a => a.profile_id === user.id)
  if (monthlyRecords.length === 0) monthlyRecords = db.attendance

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()

      const { data: todayAtt } = await supabase
        .from('attendance')
        .select('*')
        .eq('profile_id', user.id)
        .eq('date', todayStr)
        .maybeSingle()
      if (todayAtt) todayAttendanceRecord = todayAtt

      if (isAdmin) {
        const { data: emps } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', companyId)
          .order('full_name', { ascending: true })
        if (emps && emps.length > 0) companyEmployees = emps

        const { data: recs } = await supabase
          .from('attendance')
          .select('*')
          .eq('company_id', companyId)
          .eq('date', todayStr)
        if (recs && recs.length > 0) dailyRecords = recs
      }

      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

      const { data: monthRecs } = await supabase
        .from('attendance')
        .select('*')
        .eq('profile_id', user.id)
        .gte('date', currentMonthStart)
        .lte('date', currentMonthEnd)
        .order('date', { ascending: false })
      if (monthRecs && monthRecs.length > 0) monthlyRecords = monthRecs
    } catch {}
  }

  return (
    <AttendanceView
      isAdmin={isAdmin}
      currentUser={currentProfile}
      todayAttendanceRecord={todayAttendanceRecord}
      initialDate={todayStr}
      initialDailyRecords={dailyRecords}
      initialMonthlyRecords={monthlyRecords}
      companyEmployees={companyEmployees}
    />
  )
}
