/**
 * Dayflow HRMS Payroll Calculator Engine
 * Computes pro-rated component earnings, statutory deductions and payable days.
 */

export function calculatePayableDays(totalDaysInMonth, unpaidLeaves = 0, unexcusedAbsences = 0) {
  const payable = totalDaysInMonth - unpaidLeaves - unexcusedAbsences
  return Math.max(0, parseFloat(payable.toFixed(1)))
}

export function computeProRatedPayroll(salaryStructure, totalDaysInPeriod = 30, payableDays = 30) {
  const monthlyWage = parseFloat(salaryStructure?.monthly_wage) || 0
  const components = Array.isArray(salaryStructure?.components) ? salaryStructure.components : []
  
  const ratio = totalDaysInPeriod > 0 ? (payableDays / totalDaysInPeriod) : 1

  // Pro-rate each component
  const computedComponents = {}
  let computedGross = 0

  components.forEach(comp => {
    const fullAmount = parseFloat(comp.amount) || 0
    const proRated = Math.round(fullAmount * ratio)
    computedComponents[comp.key] = {
      name: comp.name,
      allocatedAmount: fullAmount,
      proRatedAmount: proRated,
      percent: comp.percent
    }
    computedGross += proRated
  })

  // Deductions
  const basicAmount = computedComponents['basic']?.proRatedAmount || Math.round((computedGross * 0.5))
  const pfEmployerPct = parseFloat(salaryStructure?.pf_employer_pct) || 12
  const pfEmployeePct = parseFloat(salaryStructure?.pf_employee_pct) || 12
  const profTax = parseFloat(salaryStructure?.professional_tax) || 200

  const pfEmployee = Math.round((basicAmount * pfEmployeePct) / 100)
  const pfEmployer = Math.round((basicAmount * pfEmployerPct) / 100)
  const professionalTax = payableDays > 0 ? profTax : 0

  const totalDeductions = pfEmployee + professionalTax
  const netPay = Math.max(0, computedGross - totalDeductions)

  return {
    payableDays,
    totalDays: totalDaysInPeriod,
    computedComponents,
    grossPay: computedGross,
    deductions: {
      pfEmployee,
      pfEmployer,
      professionalTax,
      totalDeductions
    },
    netPay
  }
}

export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num)
}
