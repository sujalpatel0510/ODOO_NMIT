'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusDot from '../ui/StatusDot'
import CheckInOutWidget from '../attendance/CheckInOutWidget'
import RequestLeaveModal from '../time-off/RequestLeaveModal'
import { formatCurrency } from '../../utils/payroll-calculator'

export default function DashboardView({
  currentUser,
  company,
  todayAttendanceRecord,
  allocations = [],
  recentAttendance = [],
  companyEmployees = [],
  pendingRequests = [],
  latestPayrollRun,
}) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const isAdmin = currentUser?.role === 'admin'

  // Calculations for quick access
  const paidBal = allocations.find(a => a.leave_type === 'paid')?.remaining_days ?? 15
  const sickBal = allocations.find(a => a.leave_type === 'sick')?.remaining_days ?? 10
  const unpaidBal = allocations.find(a => a.leave_type === 'unpaid')?.remaining_days ?? 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
              {company?.name || 'Dayflow Organization'} • Portal
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight">
            Welcome back, {currentUser?.full_name || 'Team Member'}
          </h1>
          <p className="text-xs text-slate mt-0.5">
            {isAdmin
              ? 'Administrator Overview — Monitor workforce operations, attendance, and leave workflows.'
              : 'Employee Workspace — Track your daily workday ring, time-off balances, and profile.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-4 py-2 bg-amber text-white font-medium text-xs rounded-[6px] hover:bg-opacity-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber"
          >
            + Apply for Leave
          </button>
          <Link
            href={`/employees/${currentUser?.id}`}
            className="px-4 py-2 bg-ink text-white font-medium text-xs rounded-[6px] hover:bg-opacity-95 transition-all"
          >
            My Profile
          </Link>
        </div>
      </div>

      {/* ADMIN STATS SUMMARY (If Admin) */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="ledger-card p-5 bg-surface">
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Total Workforce
            </span>
            <span className="font-mono-ledger text-2xl font-bold text-ink mt-1 block">
              {companyEmployees.length} <span className="text-xs font-normal text-slate">members</span>
            </span>
            <Link href="/employees" className="text-[11px] text-amber hover:underline mt-1 block">
              View Directory →
            </Link>
          </div>

          <div className="ledger-card p-5 bg-surface">
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Pending Approvals
            </span>
            <span className="font-mono-ledger text-2xl font-bold text-amber mt-1 block">
              {pendingRequests.length} <span className="text-xs font-normal text-slate">requests</span>
            </span>
            <Link href="/time-off" className="text-[11px] text-amber hover:underline mt-1 block">
              Review Queue →
            </Link>
          </div>

          <div className="ledger-card p-5 bg-surface">
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Today's Shifts
            </span>
            <span className="font-mono-ledger text-2xl font-bold text-sage mt-1 block">
              Active
            </span>
            <Link href="/attendance" className="text-[11px] text-amber hover:underline mt-1 block">
              Open Daily Log →
            </Link>
          </div>

          <div className="ledger-card p-5 bg-surface">
            <span className="text-slate uppercase text-[10px] tracking-wider block font-mono-ledger">
              Payroll Status
            </span>
            <span className="font-mono-ledger text-2xl font-bold text-ink mt-1 block">
              Reconciled
            </span>
            <Link href="/payroll" className="text-[11px] text-amber hover:underline mt-1 block">
              Run & Audit →
            </Link>
          </div>
        </div>
      )}

      {/* QUICK ACCESS CARDS & WORKDAY RING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Quick Access Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: My Profile */}
            <Link
              href={`/employees/${currentUser?.id}`}
              className="ledger-card p-5 bg-surface group hover:border-ink transition-all block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate group-hover:text-amber font-mono-ledger">
                  📇 Employee Profile
                </span>
                <span className="text-xs text-slate">→</span>
              </div>
              <p className="font-heading text-lg font-semibold text-ink">
                {currentUser?.full_name}
              </p>
              <p className="text-xs text-slate mt-0.5">
                {currentUser?.job_title || 'Team Member'} • {currentUser?.department || 'General'}
              </p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono-ledger text-slate">
                <span>Login ID: {currentUser?.login_id || '—'}</span>
                <span className="text-amber">View Details</span>
              </div>
            </Link>

            {/* Card 2: Time Off & Balances */}
            <Link
              href="/time-off"
              className="ledger-card p-5 bg-surface group hover:border-ink transition-all block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate group-hover:text-amber font-mono-ledger">
                  🌴 Leave & Time Off
                </span>
                <span className="text-xs text-slate">→</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-ledger text-2xl font-bold text-ink">
                  {paidBal}d
                </span>
                <span className="text-xs text-slate font-mono-ledger">PTO available</span>
              </div>
              <p className="text-xs text-slate mt-1">
                Sick Leave: <strong className="font-mono-ledger text-ink">{sickBal}d</strong> • Unpaid: <strong className="font-mono-ledger text-ink">{unpaidBal}d</strong>
              </p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono-ledger text-slate">
                <span>Annual Allocations</span>
                <span className="text-amber">Manage Leaves</span>
              </div>
            </Link>

            {/* Card 3: Attendance History */}
            <Link
              href="/attendance"
              className="ledger-card p-5 bg-surface group hover:border-ink transition-all block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate group-hover:text-amber font-mono-ledger">
                  ⏱ Shift Attendance
                </span>
                <span className="text-xs text-slate">→</span>
              </div>
              <p className="font-heading text-lg font-semibold text-ink">
                Daily Ledger
              </p>
              <p className="text-xs text-slate mt-0.5">
                Standard shift: 8h 00m • Break: 60m
              </p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono-ledger text-slate">
                <span>Live shift sync</span>
                <span className="text-amber">Full History</span>
              </div>
            </Link>

            {/* Card 4: Payroll & Payslips */}
            <Link
              href="/payroll"
              className="ledger-card p-5 bg-surface group hover:border-ink transition-all block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate group-hover:text-amber font-mono-ledger">
                  💰 Compensation
                </span>
                <span className="text-xs text-slate">→</span>
              </div>
              <p className="font-heading text-lg font-semibold text-ink">
                {latestPayrollRun ? formatCurrency(latestPayrollRun.net_pay) : 'Salary Statements'}
              </p>
              <p className="text-xs text-slate mt-0.5">
                {latestPayrollRun ? `Reconciled for ${latestPayrollRun.period_start}` : 'View and export printable payslips'}
              </p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono-ledger text-slate">
                <span>Ledger Payslip</span>
                <span className="text-amber">View Statements</span>
              </div>
            </Link>

          </div>

          {/* Recent Attendance Activity Feed */}
          <div className="ledger-card p-6 bg-surface space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
                Recent Shift Activity
              </h4>
              <Link href="/attendance" className="text-xs font-mono-ledger text-amber hover:underline">
                View All Shifts →
              </Link>
            </div>

            {recentAttendance.length === 0 ? (
              <p className="text-xs text-slate font-mono-ledger py-4 text-center">
                No recent shift records found. Use the tracker to check in!
              </p>
            ) : (
              <div className="space-y-2">
                {recentAttendance.slice(0, 4).map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 bg-paper border border-border rounded-[6px] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <StatusDot status={att.check_in && !att.check_out ? 'checked-in' : att.status} showLabel={false} size="sm" />
                      <div>
                        <span className="font-mono-ledger font-semibold text-ink">{att.date}</span>
                        <span className="text-slate ml-2 font-mono-ledger">
                          {att.check_in ? new Date(att.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          {' → '}
                          {att.check_out ? new Date(att.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (att.check_in ? 'In Progress' : '—')}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono-ledger font-medium text-ink">
                      {parseFloat(att.work_hours || 0).toFixed(2)}h
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Check-in / Workday Ring Widget */}
        <div className="lg:col-span-1">
          <CheckInOutWidget initialRecord={todayAttendanceRecord} />
        </div>

      </div>

      {/* Apply Leave Modal */}
      <RequestLeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
    </div>
  )
}
