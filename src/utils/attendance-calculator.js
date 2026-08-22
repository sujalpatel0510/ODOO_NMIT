/**
 * Dayflow HRMS Attendance & Workday Ring Calculator Engine
 */

export const STANDARD_WORK_HOURS_PER_DAY = 8.0

export function computeElapsedTime(checkInIso, checkOutIso = null) {
  if (!checkInIso) return 0
  const start = new Date(checkInIso).getTime()
  const end = checkOutIso ? new Date(checkOutIso).getTime() : new Date().getTime()
  const diffMs = Math.max(0, end - start)
  return diffMs / (1000 * 60 * 60) // in hours
}

export function computeWorkdayRingProgress(checkInIso, checkOutIso = null, targetHours = STANDARD_WORK_HOURS_PER_DAY) {
  const hours = computeElapsedTime(checkInIso, checkOutIso)
  const progress = (hours / targetHours) * 100
  return Math.min(100, Math.max(0, progress))
}

export function computeAttendanceStats(attendanceRecords = [], totalWorkingDaysInMonth = 22) {
  let presentDays = 0
  let halfDays = 0
  let unexcusedAbsences = 0
  let totalHours = 0
  let totalExtraHours = 0

  attendanceRecords.forEach(record => {
    totalHours += parseFloat(record.work_hours) || 0
    totalExtraHours += parseFloat(record.extra_hours) || 0

    if (record.status === 'present') {
      presentDays += 1
    } else if (record.status === 'half-day') {
      halfDays += 1
      presentDays += 0.5
    } else if (record.status === 'absent') {
      unexcusedAbsences += 1
    }
  })

  return {
    presentDays,
    halfDays,
    unexcusedAbsences,
    totalHours: parseFloat(totalHours.toFixed(2)),
    totalExtraHours: parseFloat(totalExtraHours.toFixed(2)),
  }
}
