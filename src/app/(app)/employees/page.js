import { redirect } from 'next/navigation'
import EmployeeDirectoryView from '../../../components/employees/EmployeeDirectoryView'
import { getCurrentSessionUser } from '../../../utils/session'
import { createClient } from '../../../utils/supabase/server'
import { DEMO_EMPLOYEES, DEMO_ATTENDANCE_LOGS } from '../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile, user, isDemo } = session
  const todayStr = new Date().toISOString().split('T')[0]

  let employees = DEMO_EMPLOYEES
  let todayAttendanceList = DEMO_ATTENDANCE_LOGS

  if (!isDemo) {
    try {
      const supabase = await createClient()

      const { data: emps } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('full_name', { ascending: true })

      if (emps && emps.length > 0) employees = emps

      const { data: atts } = await supabase
        .from('attendance')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('date', todayStr)

      if (atts) todayAttendanceList = atts
    } catch {}
  }

  const todayAttendanceMap = (todayAttendanceList || []).reduce((acc, curr) => {
    acc[curr.profile_id] = curr
    return acc
  }, {})

  const todayAttendanceRecord = todayAttendanceMap[user.id] || null

  return (
    <EmployeeDirectoryView
      employees={employees}
      currentUser={profile}
      todayAttendanceMap={todayAttendanceMap}
      todayAttendanceRecord={todayAttendanceRecord}
    />
  )
}
