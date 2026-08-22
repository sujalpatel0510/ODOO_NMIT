import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'
import AttendanceView from '../../../components/attendance/AttendanceView'

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
  const supabase = await createClient()

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // 2. Fetch current profile
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentProfile) redirect('/signin')

  const companyId = currentProfile.company_id
  const isAdmin = currentProfile.role === 'admin'
  const todayStr = new Date().toISOString().split('T')[0]

  // 3. Fetch today's record for current user
  const { data: todayAttendanceRecord } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id)
    .eq('date', todayStr)
    .maybeSingle()

  // 4. Fetch daily records for all company members if admin
  let dailyRecords = []
  let companyEmployees = []

  if (isAdmin) {
    const { data: empList } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId)
      .order('full_name', { ascending: true })

    companyEmployees = empList || []

    const { data: records } = await supabase
      .from('attendance')
      .select('*')
      .eq('company_id', companyId)
      .eq('date', todayStr)

    dailyRecords = records || []
  }

  // 5. Fetch monthly records for current user
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: monthlyRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id)
    .gte('date', currentMonthStart)
    .lte('date', currentMonthEnd)
    .order('date', { ascending: false })

  return (
    <AttendanceView
      isAdmin={isAdmin}
      currentUser={currentProfile}
      todayAttendanceRecord={todayAttendanceRecord}
      initialDate={todayStr}
      initialDailyRecords={dailyRecords}
      initialMonthlyRecords={monthlyRecords || []}
      companyEmployees={companyEmployees}
    />
  )
}
