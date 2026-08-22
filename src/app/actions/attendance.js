'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { computeElapsedTime } from '../../utils/attendance-calculator'

export async function toggleAttendance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const todayStr = new Date().toISOString().split('T')[0]
  const nowIso = new Date().toISOString()

  // 1. Fetch user's company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found.' }

  // 2. Fetch today's record
  const { data: record } = await supabase
    .from('attendance')
    .select('*')
    .eq('profile_id', user.id)
    .eq('date', todayStr)
    .maybeSingle()

  if (!record) {
    // Check In
    const { error: insErr } = await supabase
      .from('attendance')
      .insert({
        profile_id: user.id,
        company_id: profile.company_id,
        date: todayStr,
        check_in: nowIso,
        status: 'present',
      })

    if (insErr) return { error: insErr.message }
  } else if (record.check_in && !record.check_out) {
    // Check Out
    const workHours = computeElapsedTime(record.check_in, nowIso)
    const extraHours = Math.max(0, workHours - 8.0)
    const status = workHours < 4.0 ? 'half-day' : 'present'

    const { error: updErr } = await supabase
      .from('attendance')
      .update({
        check_out: nowIso,
        work_hours: parseFloat(workHours.toFixed(2)),
        extra_hours: parseFloat(extraHours.toFixed(2)),
        status,
      })
      .eq('id', record.id)

    if (updErr) return { error: updErr.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/attendance')
  revalidatePath('/employees')

  return { success: true }
}
