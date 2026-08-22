'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePrivateInfo(profileId, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = currentUserProfile?.role === 'admin'
  const isSelf = user.id === profileId

  if (!isAdmin && !isSelf) {
    return { error: 'Permission denied.' }
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

  // If Admin, also allow organizational & statutory updates
  if (isAdmin) {
    if (formData.job_title !== undefined) updatePayload.job_title = formData.job_title
    if (formData.department !== undefined) updatePayload.department = formData.department
    if (formData.pan_no !== undefined) updatePayload.pan_no = formData.pan_no
    if (formData.pf_no !== undefined) updatePayload.pf_no = formData.pf_no
    if (formData.aadhar_no !== undefined) updatePayload.aadhar_no = formData.aadhar_no
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', profileId)

  if (error) return { error: error.message }

  revalidatePath(`/employees/${profileId}`)
  revalidatePath('/employees')
  return { success: true }
}

export async function updateResume(profileId, resumeData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = currentUserProfile?.role === 'admin'
  const isSelf = user.id === profileId

  if (!isAdmin && !isSelf) {
    return { error: 'Permission denied.' }
  }

  const { error } = await supabase
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

  if (error) return { error: error.message }

  revalidatePath(`/employees/${profileId}`)
  return { success: true }
}

export async function updateSalaryStructure(profileId, structureData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Only administrators can modify salary structures.' }
  }

  const monthlyWage = parseFloat(structureData.monthly_wage) || 0
  const yearlyWage = monthlyWage * 12

  const { error } = await supabase
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

  if (error) return { error: error.message }

  revalidatePath(`/employees/${profileId}`)
  return { success: true }
}
