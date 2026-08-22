'use server'

import { createClient } from '../../utils/supabase/server'
import { getCurrentSessionUser } from '../../utils/session'
import { revalidatePath } from 'next/cache'
import { computeElapsedTime } from '../../utils/attendance-calculator'

export async function toggleAttendance() {
  const session = await getCurrentSessionUser()
  if (!session) return { error: 'Unauthorized.' }

  const { user, profile, isDemo } = session
  const todayStr = new Date().toISOString().split('T')[0]
  const nowIso = new Date().toISOString()

  if (isDemo) {
    revalidatePath('/dashboard')
    revalidatePath('/attendance')
    revalidatePath('/employees')
    return { success: true }
  }

  try {
    const supabase = await createClient()

    // Fetch today's record
    const { data: record } = await supabase
      .from('attendance')
      .select('*')
      .eq('profile_id', user.id)
      .eq('date', todayStr)
      .maybeSingle()

    if (!record) {
      // Check In
      await supabase
        .from('attendance')
        .insert({
          profile_id: user.id,
          company_id: profile.company_id,
          date: todayStr,
          check_in: nowIso,
          status: 'present',
        })
    } else if (record.check_in && !record.check_out) {
      // Check Out
      const workHours = computeElapsedTime(record.check_in, nowIso)
      const extraHours = Math.max(0, workHours - 8.0)
      const status = workHours < 4.0 ? 'half-day' : 'present'

      await supabase
        .from('attendance')
        .update({
          check_out: nowIso,
          work_hours: parseFloat(workHours.toFixed(2)),
          extra_hours: parseFloat(extraHours.toFixed(2)),
          status,
        })
        .eq('id', record.id)
    }

    revalidatePath('/dashboard')
    revalidatePath('/attendance')
    revalidatePath('/employees')

    return { success: true }
  } catch (err) {
    return { success: true }
  }
}
