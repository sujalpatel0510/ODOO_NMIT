import { redirect, notFound } from 'next/navigation'
import EmployeeProfileView from '../../../../components/profile/EmployeeProfileView'
import { getCurrentSessionUser } from '../../../../utils/session'
import { createClient } from '../../../../utils/supabase/server'
import {
  DEMO_EMPLOYEES,
  DEMO_RESUME,
  DEMO_SALARY_STRUCTURE,
  DEMO_ATTENDANCE_LOGS,
} from '../../../../utils/demo-data'

export const dynamic = 'force-dynamic'

export default async function EmployeeDetailPage({ params }) {
  const { id } = await params
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  const { profile: currentProfile, isDemo } = session
  const todayStr = new Date().toISOString().split('T')[0]

  let targetProfile = DEMO_EMPLOYEES.find(e => e.id === id) || DEMO_EMPLOYEES[0]
  let resumeData = DEMO_RESUME
  let salaryStructure = DEMO_SALARY_STRUCTURE
  let todayAttendance = DEMO_ATTENDANCE_LOGS.find(a => a.profile_id === id) || null

  if (!isDemo) {
    try {
      const supabase = await createClient()

      const { data: tp } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (tp) targetProfile = tp

      const { data: rd } = await supabase
        .from('resume_entries')
        .select('*')
        .eq('profile_id', id)
        .maybeSingle()
      if (rd) resumeData = rd

      if (currentProfile.role === 'admin') {
        const { data: struct } = await supabase
          .from('salary_structures')
          .select('*')
          .eq('profile_id', id)
          .maybeSingle()
        if (struct) salaryStructure = struct
      }

      const { data: att } = await supabase
        .from('attendance')
        .select('*')
        .eq('profile_id', id)
        .eq('date', todayStr)
        .maybeSingle()
      if (att) todayAttendance = att
    } catch {}
  }

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
