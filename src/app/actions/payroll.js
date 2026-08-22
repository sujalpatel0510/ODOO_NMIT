'use server'

import { createClient } from '../../utils/supabase/server'
import { createAdminClient } from '../../utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { calculatePayableDays, computeProRatedPayroll } from '../../utils/payroll-calculator'

export async function executePayrollRun(periodStart, periodEnd) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized.' }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') {
    return { error: 'Only administrators can execute payroll runs.' }
  }

  const adminClient = createAdminClient()
  const companyId = adminProfile.company_id

  // 1. Fetch all employees in company
  const { data: employees } = await adminClient
    .from('profiles')
    .select('id')
    .eq('company_id', companyId)

  if (!employees || employees.length === 0) {
    return { error: 'No employee records found in company.' }
  }

  const s = new Date(periodStart)
  const e = new Date(periodEnd)
  const totalDaysInPeriod = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1

  let processedCount = 0

  for (const emp of employees) {
    // 2. Fetch salary structure
    const { data: salaryStruct } = await adminClient
      .from('salary_structures')
      .select('*')
      .eq('profile_id', emp.id)
      .maybeSingle()

    // 3. Fetch unpaid leaves in this period
    const { data: unpaidLeaves } = await adminClient
      .from('leave_requests')
      .select('*')
      .eq('profile_id', emp.id)
      .eq('leave_type', 'unpaid')
      .eq('status', 'approved')
      .gte('start_date', periodStart)
      .lte('end_date', periodEnd)

    let unpaidDays = 0
    (unpaidLeaves || []).forEach(l => {
      const ls = new Date(l.start_date)
      const le = new Date(l.end_date)
      unpaidDays += Math.ceil(Math.abs(le - ls) / (1000 * 60 * 60 * 24)) + 1
    })

    // 4. Fetch unexcused absences
    const { data: absences } = await adminClient
      .from('attendance')
      .select('*')
      .eq('profile_id', emp.id)
      .eq('status', 'absent')
      .gte('date', periodStart)
      .lte('date', periodEnd)

    const unexcusedAbsenceDays = (absences || []).length

    // 5. Calculate payable days and pro-rated wage
    const payableDays = calculatePayableDays(totalDaysInPeriod, unpaidDays, unexcusedAbsenceDays)
    const calculation = computeProRatedPayroll(salaryStruct, totalDaysInPeriod, payableDays)

    // 6. Insert payroll run
    await adminClient
      .from('payroll_runs')
      .insert({
        profile_id: emp.id,
        company_id: companyId,
        period_start: periodStart,
        period_end: periodEnd,
        payable_days: calculation.payableDays,
        total_days: calculation.totalDays,
        computed_components: calculation.computedComponents,
        gross_pay: calculation.grossPay,
        total_deductions: calculation.deductions.totalDeductions,
        net_pay: calculation.netPay,
        status: 'processed',
        updated_by: user.id,
      })

    processedCount++
  }

  revalidatePath('/payroll')
  return { success: true, count: processedCount }
}
