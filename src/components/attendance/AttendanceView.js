'use client'

import { useState } from 'react'
import StatusDot from '../ui/StatusDot'
import CheckInOutWidget from './CheckInOutWidget'
import { STANDARD_WORK_HOURS_PER_DAY } from '../../utils/attendance-calculator'

export default function AttendanceView({
  isAdmin,
  currentUser,
  todayAttendanceRecord,
  initialDate,
  initialDailyRecords = [],
  initialMonthlyRecords = [],
  companyEmployees = [],
}) {
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [dateViewMode, setDateViewMode] = useState('date') // 'date' (YYYY-MM-DD) or 'day' (Monday, 22 Aug)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState(isAdmin ? 'daily-admin' : 'my-history')

  // Filter daily records for admin view
  const filteredDaily = companyEmployees.map(emp => {
    const record = initialDailyRecords.find(r => r.profile_id === emp.id)
    return {
      employee: emp,
      record: record || null
    }
  }).filter(({ employee }) => {
    return (
      (employee.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.login_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Format date helper
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (dateViewMode === 'day') {
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    }
    return dateStr
  }

  // Monthly stats calculation for employee
  const totalHoursWorked = initialMonthlyRecords.reduce((acc, r) => acc + (parseFloat(r.work_hours) || 0), 0)
  const totalExtraHours = initialMonthlyRecords.reduce((acc, r) => acc + (parseFloat(r.extra_hours) || 0), 0)
  const presentDays = initialMonthlyRecords.filter(r => r.status === 'present').length
  const halfDays = initialMonthlyRecords.filter(r => r.status === 'half-day').length

  return (
    <div className="space-y-8">
      
      {/* Header + Check In Widget Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
              Time & Attendance Ledger
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight">
            Attendance Records
          </h1>
          <p className="text-sm text-slate max-w-xl leading-relaxed">
            Audit daily shifts, scheduled work intervals, break deductions, and monthly attendance reconciliation.
          </p>

          {/* Tab Selector if Admin */}
          {isAdmin && (
            <div className="pt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('daily-admin')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-[6px] transition-colors ${
                  activeTab === 'daily-admin'
                    ? 'bg-ink text-white'
                    : 'bg-surface border border-border text-slate hover:text-ink'
                }`}
              >
                Organization Daily Log
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('my-history')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-[6px] transition-colors ${
                  activeTab === 'my-history'
                    ? 'bg-ink text-white'
                    : 'bg-surface border border-border text-slate hover:text-ink'
                }`}
              >
                My Monthly History
              </button>
            </div>
          )}
        </div>

        {/* Live Check-in Widget */}
        <div className="lg:col-span-1">
          <CheckInOutWidget initialRecord={todayAttendanceRecord} />
        </div>
      </div>

      {/* ADMIN DAILY LOG TAB */}
      {isAdmin && activeTab === 'daily-admin' && (
        <div className="space-y-6">
          
          {/* Filter & Controls Bar */}
          <div className="ledger-card p-4 bg-surface flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by employee name or ID..."
                className="w-full bg-surface border border-border rounded-[6px] pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-amber"
              />
              <svg className="w-3.5 h-3.5 text-slate absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Date Picker & Format Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate uppercase font-mono-ledger">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-paper border border-border rounded-[6px] px-3 py-1.5 text-xs font-mono-ledger text-ink focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>

              <button
                type="button"
                onClick={() => setDateViewMode(dateViewMode === 'date' ? 'day' : 'date')}
                className="px-2.5 py-1.5 bg-paper border border-border rounded-[6px] text-xs font-mono-ledger text-slate hover:text-ink transition-colors"
                title="Toggle Date / Day Format"
              >
                Format: <span className="text-ink font-semibold uppercase">{dateViewMode}</span>
              </button>
            </div>

          </div>

          {/* Daily Table */}
          <div className="overflow-x-auto border border-border rounded-[6px] ledger-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Login ID</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th className="text-right">Break (Min)</th>
                  <th className="text-right">Work Hours</th>
                  <th className="text-right">Extra Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDaily.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-xs text-slate font-mono-ledger">
                      No employee attendance matching query.
                    </td>
                  </tr>
                ) : (
                  filteredDaily.map(({ employee, record }) => {
                    const hasRecord = Boolean(record)
                    const checkInText = record?.check_in
                      ? new Date(record.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '—'
                    const checkOutText = record?.check_out
                      ? new Date(record.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : record?.check_in ? 'In Shift' : '—'

                    let status = 'absent'
                    if (record) {
                      if (record.check_in && !record.check_out) status = 'checked-in'
                      else status = record.status || 'present'
                    }

                    return (
                      <tr key={employee.id}>
                        <td className="font-medium text-ink flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center font-heading text-[10px]">
                            {employee.full_name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{employee.full_name}</span>
                        </td>
                        <td className="font-mono-ledger text-slate">
                          {employee.login_id || '—'}
                        </td>
                        <td className="text-slate">
                          {employee.department || 'General'}
                        </td>
                        <td className="font-mono-ledger text-ink">
                          {checkInText}
                        </td>
                        <td className="font-mono-ledger text-ink">
                          {checkOutText}
                        </td>
                        <td className="font-mono-ledger text-right text-slate">
                          {hasRecord ? `${record.break_minutes || 0}m` : '—'}
                        </td>
                        <td className="font-mono-ledger text-right font-medium text-ink">
                          {hasRecord ? `${parseFloat(record.work_hours || 0).toFixed(2)}h` : '0.00h'}
                        </td>
                        <td className="font-mono-ledger text-right text-amber font-medium">
                          {hasRecord && record.extra_hours > 0 ? `+${parseFloat(record.extra_hours).toFixed(2)}h` : '—'}
                        </td>
                        <td>
                          <StatusDot status={status} showLabel={true} size="sm" />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* EMPLOYEE MONTHLY VIEW TAB */}
      {(!isAdmin || activeTab === 'my-history') && (
        <div className="space-y-6">
          
          {/* Monthly Summary Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="ledger-card p-5 bg-surface">
              <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
                Total Worked Time
              </span>
              <span className="font-mono-ledger text-2xl font-bold text-ink mt-1 block">
                {totalHoursWorked.toFixed(1)} <span className="text-xs font-normal text-slate">hours</span>
              </span>
              <span className="text-[11px] text-slate mt-1 block">
                Scheduled target: {(presentDays * STANDARD_WORK_HOURS_PER_DAY).toFixed(0)}h
              </span>
            </div>

            <div className="ledger-card p-5 bg-surface">
              <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
                Present Shifts
              </span>
              <span className="font-mono-ledger text-2xl font-bold text-sage mt-1 block">
                {presentDays} <span className="text-xs font-normal text-slate">days</span>
              </span>
              <span className="text-[11px] text-slate mt-1 block">
                Full-day attendances
              </span>
            </div>

            <div className="ledger-card p-5 bg-surface">
              <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
                Half Days
              </span>
              <span className="font-mono-ledger text-2xl font-bold text-amber mt-1 block">
                {halfDays} <span className="text-xs font-normal text-slate">days</span>
              </span>
              <span className="text-[11px] text-slate mt-1 block">
                &lt; 4 hours shift duration
              </span>
            </div>

            <div className="ledger-card p-5 bg-surface">
              <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
                Extra / Overtime
              </span>
              <span className="font-mono-ledger text-2xl font-bold text-amber mt-1 block">
                +{totalExtraHours.toFixed(1)} <span className="text-xs font-normal text-slate">hours</span>
              </span>
              <span className="text-[11px] text-slate mt-1 block">
                Logged beyond 8h standard
              </span>
            </div>
          </div>

          {/* Monthly Shift History Table */}
          <div className="ledger-card p-6 bg-surface space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
                Monthly Shift Log & Reconciled Entries
              </h4>
              <button
                type="button"
                onClick={() => setDateViewMode(dateViewMode === 'date' ? 'day' : 'date')}
                className="px-2.5 py-1 bg-paper border border-border rounded text-xs font-mono-ledger text-slate hover:text-ink"
              >
                Date Display: <span className="text-ink font-semibold uppercase">{dateViewMode}</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-border rounded-[6px]">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th className="text-right">Break</th>
                    <th className="text-right">Work Hours</th>
                    <th className="text-right">Extra Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {initialMonthlyRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-slate font-mono-ledger">
                        No shift entries recorded for this month yet. Check in to create today's entry!
                      </td>
                    </tr>
                  ) : (
                    initialMonthlyRecords.map((r) => {
                      const inTime = r.check_in
                        ? new Date(r.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : '—'
                      const outTime = r.check_out
                        ? new Date(r.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : r.check_in ? 'In Shift' : '—'

                      return (
                        <tr key={r.id}>
                          <td className="font-mono-ledger text-ink font-medium">
                            {formatDateLabel(r.date)}
                          </td>
                          <td className="font-mono-ledger text-slate">{inTime}</td>
                          <td className="font-mono-ledger text-slate">{outTime}</td>
                          <td className="font-mono-ledger text-right text-slate">{r.break_minutes || 0}m</td>
                          <td className="font-mono-ledger text-right font-medium text-ink">
                            {parseFloat(r.work_hours || 0).toFixed(2)}h
                          </td>
                          <td className="font-mono-ledger text-right text-amber font-medium">
                            {r.extra_hours > 0 ? `+${parseFloat(r.extra_hours).toFixed(2)}h` : '—'}
                          </td>
                          <td>
                            <StatusDot
                              status={r.check_in && !r.check_out ? 'checked-in' : r.status || 'present'}
                              showLabel={true}
                              size="sm"
                            />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
