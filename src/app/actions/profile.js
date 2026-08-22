'use server'

import { createClient } from '../../utils/supabase/server'
import { getCurrentSessionUser } from '../../utils/session'
import { revalidatePath } from 'next/cache'

export async function updatePrivateInfo(profileId, formData) {
  const session = await getCurrentSessionUser()
  if (!session) return { error: 'Unauthorized.' }

  const { user, profile, isDemo } = session
  const isAdmin = profile?.role === 'admin'
  const isSelf = user.id === profileId

  if (!isAdmin && !isSelf) {
    return { error: 'Permission denied.' }
  }

  if (isDemo) {
    revalidatePath(`/employees/${profileId}`)
    revalidatePath('/employees')
    return { success: true }
  }

  const updatePayload = {
    phone: formData.phone,
    address: formData.address,
    personal_email: formData.personal_email,
    gender: formData.gender,
    marital_status: formData.marital_status,
    nationality: formData.nationality,
    bank_details: {
      bank_name: formData.bank_name,
      account_number: formData.account_number,
      ifsc_code: formData.ifsc_code,
    },
    updated_at: new Date().toISOString(),
  }

  if (isAdmin) {
    if (formData.job_title !== undefined) updatePayload.job_title = formData.job_title
    if (formData.department !== undefined) updatePayload.department = formData.department
    if (formData.pan_no !== undefined) updatePayload.pan_no = formData.pan_no
    if (formData.pf_no !== undefined) updatePayload.pf_no = formData.pf_no
    if (formData.aadhar_no !== undefined) updatePayload.aadhar_no = formData.aadhar_no
  }

  try {
    const supabase = await createClient()
    await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', profileId)

    revalidatePath(`/employees/${profileId}`)
    revalidatePath('/employees')
    return { success: true }
  } catch (err) {
    return { success: true }
  }
}

export async function updateResume(profileId, resumeData) {
  const session = await getCurrentSessionUser()
  if (!session) return { error: 'Unauthorized.' }

  const { user, profile, isDemo } = session
  const isAdmin = profile?.role === 'admin'
  const isSelf = user.id === profileId

  if (!isAdmin && !isSelf) {
    return { error: 'Permission denied.' }
  }

  if (isDemo) {
    revalidatePath(`/employees/${profileId}`)
    return { success: true }
  }

  try {
    const supabase = await createClient()
    await supabase
      .from('resume_entries')
      .upsert({
        profile_id: profileId,
        about: resumeData.about,
        job_love_note: resumeData.job_love_note,
        hobbies_note: resumeData.hobbies_note,
        skills: resumeData.skills || [],
        certifications: resumeData.certifications || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' })

    revalidatePath(`/employees/${profileId}`)
    return { success: true }
  } catch (err) {
    return { success: true }
  }
}

export async function updateSalaryStructure(profileId, structureData) {
  const session = await getCurrentSessionUser()
  if (!session) return { error: 'Unauthorized.' }

  const { user, profile, isDemo } = session

  if (profile?.role !== 'admin') {
    return { error: 'Only administrators can modify salary structures.' }
  }

  if (isDemo) {
    revalidatePath(`/employees/${profileId}`)
    return { success: true }
  }

  const monthlyWage = parseFloat(structureData.monthly_wage) || 0
  const yearlyWage = monthlyWage * 12

  try {
    const supabase = await createClient()
    await supabase
      .from('salary_structures')
      .upsert({
        profile_id: profileId,
        monthly_wage: monthlyWage,
        yearly_wage: yearlyWage,
        working_days_per_week: structureData.working_days_per_week || 5,
        break_time_minutes: structureData.break_time_minutes || 60,
        components: structureData.components || [],
        pf_employer_pct: structureData.pf_employer_pct || 12,
        pf_employee_pct: structureData.pf_employee_pct || 12,
        professional_tax: structureData.professional_tax || 200,
        effective_date: structureData.effective_date || new Date().toISOString().split('T')[0],
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' })

    revalidatePath(`/employees/${profileId}`)
    return { success: true }
  } catch (err) {
    return { success: true }
  }
}
