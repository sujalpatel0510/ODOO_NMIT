import { redirect } from 'next/navigation'
import AttendanceView from '../../../components/attendance/AttendanceView'
import { getCurrentSessionUser } from '../../../utils/session'
import { createClient } from '../../../utils/supabase/server'
import { DEMO_EMPLOYEES, DEMO_ATTENDANCE_LOGS } from '../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile: currentProfile, user, isDemo } = session
  const companyId = currentProfile.company_id
  const isAdmin = currentProfile.role === 'admin'
  const todayStr = new Date().toISOString().split('T')[0]

  let todayAttendanceRecord = DEMO_ATTENDANCE_LOGS.find(a => a.profile_id === user.id) || null
  let dailyRecords = DEMO_ATTENDANCE_LOGS
  let companyEmployees = DEMO_EMPLOYEES
  let monthlyRecords = DEMO_ATTENDANCE_LOGS

  if (!isDemo) {
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
        if (emps) companyEmployees = emps

        const { data: recs } = await supabase
          .from('attendance')
          .select('*')
          .eq('company_id', companyId)
          .eq('date', todayStr)
        if (recs) dailyRecords = recs
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
