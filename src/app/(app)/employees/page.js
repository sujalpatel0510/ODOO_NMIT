import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeDirectoryView from '../../../components/employees/EmployeeDirectoryView'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // 2. Fetch current user profile
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentProfile) redirect('/signin')

  const companyId = currentProfile.company_id

  // 3. Fetch all employees in the same company
  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('full_name', { ascending: true })

  // 4. Fetch today's attendance for all company members
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: todayAttendanceList } = await supabase
    .from('attendance')
    .select('*')
    .eq('company_id', companyId)
    .eq('date', todayStr)

  const todayAttendanceMap = (todayAttendanceList || []).reduce((acc, curr) => {
    acc[curr.profile_id] = curr
    return acc
  }, {})

  const todayAttendanceRecord = todayAttendanceMap[user.id] || null

  return (
    <EmployeeDirectoryView
      employees={employees || []}
      currentUser={currentProfile}
      todayAttendanceMap={todayAttendanceMap}
      todayAttendanceRecord={todayAttendanceRecord}
    />
  )
}
