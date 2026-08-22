import { createClient } from '../../../../utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EmployeeProfileView from '../../../../components/profile/EmployeeProfileView'

export const dynamic = 'force-dynamic'

export default async function EmployeeDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  // 2. Fetch current user's profile
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentProfile) redirect('/signin')

  // 3. Fetch target employee profile
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!targetProfile) notFound()

  // Security check: Must belong to same company
  if (targetProfile.company_id !== currentProfile.company_id) {
    redirect('/employees')
  }

  // 4. Fetch Resume entries
  const { data: resumeData } = await supabase
    .from('resume_entries')
    .select('*')
    .eq('profile_id', id)
    .maybeSingle()

  // 5. Fetch Salary structure (if Admin)
  let salaryStructure = null
  if (currentProfile.role === 'admin') {
    const { data: struct } = await supabase
      .from('salary_structures')
      .select('*')
      .eq('profile_id', id)
      .maybeSingle()
    salaryStructure = struct
  }

  // 6. Fetch Today's Attendance
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', id)
    .eq('date', todayStr)
    .maybeSingle()

  return (
    <EmployeeProfileView
      targetProfile={targetProfile}
      currentUser={currentProfile}
      resumeData={resumeData}
      salaryStructure={salaryStructure}
      todayAttendance={todayAttendance}
    />
  )
}
