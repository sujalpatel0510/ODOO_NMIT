'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusDot from '../ui/StatusDot'
import Button from '../ui/Button'
import CheckInOutWidget from '../attendance/CheckInOutWidget'
import ProvisionEmployeeModal from './ProvisionEmployeeModal'

export default function EmployeeDirectoryView({
  employees = [],
  currentUser,
  todayAttendanceMap = {},
  todayAttendanceRecord,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isAdmin = currentUser?.role === 'admin'

  // Extract unique departments
  const departments = ['ALL', ...new Set(employees.map(e => e.department || 'General').filter(Boolean))]

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      (emp.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.login_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.job_title || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDept = deptFilter === 'ALL' || (emp.department || 'General') === deptFilter

    return matchesSearch && matchesDept
  })

  // Helper to determine live status
  const getEmployeeStatus = (empId) => {
    const att = todayAttendanceMap[empId]
    if (att) {
      if (att.check_in && !att.check_out) {
        return 'checked-in'
      }
      if (att.status === 'present') return 'present'
      if (att.status === 'half-day') return 'half-day'
      if (att.status === 'leave') return 'on-leave'
    }
    return 'absent'
  }

  return (
    <div className="space-y-8">
      {/* Top Banner: Page Title + Check-In Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
              Directory Ledger
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-slate max-w-xl leading-relaxed">
            Every staff member, role allocation, and real-time attendance indicator registered within your organization.
          </p>

          {/* Search and Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID, or title..."
                className="w-full bg-surface border border-border rounded-[6px] pl-9 pr-3.5 py-2 text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-amber focus:border-amber"
              />
              <svg
                className="w-4 h-4 text-slate absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-surface border border-border rounded-[6px] px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber focus:border-amber"
            >
              {departments.map(d => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>

            {/* Admin Provision Button */}
            {isAdmin && (
              <Button
                variant="amber"
                onClick={() => setIsModalOpen(true)}
                className="whitespace-nowrap"
              >
                + New Employee
              </Button>
            )}
          </div>
        </div>

        {/* Live Check-in / Workday Ring Widget */}
        <div className="lg:col-span-1">
          <CheckInOutWidget initialRecord={todayAttendanceRecord} />
        </div>
      </div>

      {/* Directory Count Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-slate">
        <span className="font-mono-ledger">
          Showing {filteredEmployees.length} of {employees.length} team members
        </span>
        <div className="flex items-center gap-4">
          <StatusDot status="checked-in" showLabel={true} size="sm" />
          <StatusDot status="present" showLabel={true} size="sm" />
          <StatusDot status="on-leave" showLabel={true} size="sm" />
          <StatusDot status="absent" showLabel={true} size="sm" />
        </div>
      </div>

      {/* Employee Cards Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <p className="font-heading text-base font-medium text-ink mb-1">
            No employees found
          </p>
          <p className="text-xs text-slate font-mono-ledger">
            Try adjusting your search query or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const status = getEmployeeStatus(emp.id)
            const isSelf = emp.id === currentUser?.id

            return (
              <Link
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="ledger-card p-5 block group transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {emp.profile_picture_url ? (
                      <img
                        src={emp.profile_picture_url}
                        alt={emp.full_name}
                        className="w-11 h-11 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center font-heading font-medium text-sm">
                        {emp.full_name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-ink group-hover:text-amber transition-colors flex items-center gap-1.5">
                        {emp.full_name}
                        {isSelf && (
                          <span className="text-[10px] bg-paper text-slate px-1.5 py-0.5 rounded border border-border">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate font-medium">
                        {emp.job_title || 'Team Member'}
                      </p>
                    </div>
                  </div>

                  {/* Status Ring / Dot */}
                  <StatusDot status={status} showLabel={false} size="md" />
                </div>

                {/* Card Details (Mono Typography for Data per Ledger spec) */}
                <div className="pt-3 border-t border-border/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate uppercase text-[10px] tracking-wider">Login ID</span>
                    <span className="font-mono-ledger text-ink font-medium">
                      {emp.login_id || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate uppercase text-[10px] tracking-wider">Department</span>
                    <span className="text-ink font-medium">
                      {emp.department || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate uppercase text-[10px] tracking-wider">Email</span>
                    <span className="font-mono-ledger text-slate truncate max-w-[160px]">
                      {emp.email}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Provision Employee Modal */}
      {isAdmin && (
        <ProvisionEmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
