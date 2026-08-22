/**
 * Dayflow HRMS Salary Calculator Engine
 * Handles component allocations, cascades, sum validations, PF and tax deductions.
 */

export const DEFAULT_COMPONENTS = [
  { key: 'basic', name: 'Basic Salary', percent: 50, amount: 0 },
  { key: 'hra', name: 'House Rent Allowance (HRA)', percent: 20, amount: 0 },
  { key: 'standard_allowance', name: 'Standard Allowance', percent: 15, amount: 0 },
  { key: 'performance_bonus', name: 'Performance Bonus', percent: 10, amount: 0 },
  { key: 'special_allowance', name: 'Special Allowance', percent: 5, amount: 0 },
]

export function calculateComponentsFromWage(monthlyWage, components = DEFAULT_COMPONENTS) {
  const wage = parseFloat(monthlyWage) || 0
  return components.map(comp => {
    const pct = parseFloat(comp.percent) || 0
    const amt = Math.round((wage * pct) / 100)
    return {
      ...comp,
      amount: amt
    }
  })
}

export function validateSalaryStructure(monthlyWage, components) {
  const wage = parseFloat(monthlyWage) || 0
  const sumAmounts = (components || []).reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0)
  const sumPercentages = (components || []).reduce((acc, c) => acc + (parseFloat(c.percent) || 0), 0)

  const isExceeding = sumAmounts > wage
  const isPercentExceeding = sumPercentages > 100

  return {
    valid: !isExceeding && sumPercentages <= 100,
    sumAmounts,
    sumPercentages: parseFloat(sumPercentages.toFixed(2)),
    isExceeding,
    isPercentExceeding
  }
}

export function calculateDeductions(monthlyWage, components, pfEmployerPct = 12, pfEmployeePct = 12, profTax = 200) {
  const basicComp = (components || []).find(c => c.key === 'basic')
  const basicSalary = basicComp ? (parseFloat(basicComp.amount) || 0) : ((parseFloat(monthlyWage) || 0) * 0.5)

  const pfEmployer = Math.round((basicSalary * (parseFloat(pfEmployerPct) || 0)) / 100)
  const pfEmployee = Math.round((basicSalary * (parseFloat(pfEmployeePct) || 0)) / 100)
  const professionalTax = parseFloat(profTax) || 0

  return {
    basicSalary,
    pfEmployer,
    pfEmployee,
    professionalTax,
    totalEmployeeDeductions: pfEmployee + professionalTax
  }
}
