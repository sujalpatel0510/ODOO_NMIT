'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitLeaveRequest(prevState, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const leaveType = formData.get('leaveType')?.toString()
  const startDate = formData.get('startDate')?.toString()
  const endDate = formData.get('endDate')?.toString()
  const remarks = formData.get('remarks')?.toString()
  const file = formData.get('attachment')

  if (!leaveType || !startDate || !endDate) {
    return { error: 'Leave type, start date, and end date are required.' }
  }

  // Get user profile for company_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  let attachmentUrl = null

  // File Upload if present
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadErr } = await supabase
      .storage
      .from('attachments')
      .upload(fileName, file)

    if (uploadErr) {
      return { error: `Failed to upload attachment: ${uploadErr.message}` }
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('attachments')
      .getPublicUrl(fileName)

    attachmentUrl = publicUrl
  }

  // Insert Leave Request
  const { error: insErr } = await supabase
    .from('leave_requests')
    .insert({
      profile_id: user.id,
      company_id: profile.company_id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      remarks,
      attachment_url: attachmentUrl,
      status: 'pending',
    })

  if (insErr) return { error: insErr.message }

  revalidatePath('/dashboard')
  revalidatePath('/time-off')
  return { success: true }
}

export async function reviewLeaveRequest(requestId, decision, adminComment = '') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Only administrators can review leave requests.' }
  }

  // 1. Fetch the request
  const { data: req } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!req) return { error: 'Leave request not found.' }

  // 2. Update status
  const { error: updErr } = await supabase
    .from('leave_requests')
    .update({
      status: decision,
      admin_comment: adminComment,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (updErr) return { error: updErr.message }

  // 3. If approved, deduct days from allocations
  if (decision === 'approved') {
    const s = new Date(req.start_date)
    const e = new Date(req.end_date)
    const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1
    const year = s.getFullYear()

    const { data: alloc } = await supabase
      .from('leave_allocations')
      .select('*')
      .eq('profile_id', req.profile_id)
      .eq('leave_type', req.leave_type)
      .eq('year', year)
      .maybeSingle()

    if (alloc) {
      await supabase
        .from('leave_allocations')
        .update({
          remaining_days: Math.max(0, alloc.remaining_days - diffDays)
        })
        .eq('id', alloc.id)
    }

    // Mark attendance records as 'leave'
    const curr = new Date(s)
    while (curr <= e) {
      const dateStr = curr.toISOString().split('T')[0]
      await supabase
        .from('attendance')
        .upsert({
          profile_id: req.profile_id,
          company_id: req.company_id,
          date: dateStr,
          status: 'leave',
          work_hours: 0,
        }, { onConflict: 'profile_id,date' })

      curr.setDate(curr.getDate() + 1)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/time-off')
  revalidatePath('/attendance')
  return { success: true }
}

export async function allocateLeaveDays(profileId, leaveType, allocatedDays, year = new Date().getFullYear()) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') return { error: 'Only admins can set allocations.' }

  const { error } = await supabase
    .from('leave_allocations')
    .upsert({
      profile_id: profileId,
      company_id: adminProfile.company_id,
      leave_type: leaveType,
      allocated_days: allocatedDays,
      remaining_days: allocatedDays,
      year,
    }, { onConflict: 'profile_id,leave_type,year' })

  if (error) return { error: error.message }

  revalidatePath('/time-off')
  return { success: true }
}
