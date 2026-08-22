'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import StatusDot from '../ui/StatusDot'
import Button from '../ui/Button'
import ProvisionEmployeeModal from './ProvisionEmployeeModal'
import { deleteEmployee } from '../../app/actions/profile'

export default function EmployeeDirectoryView({
  employees: initialEmployees = [],
  currentUser,
  todayAttendanceMap = {},
}) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [feedbackMessage, setFeedbackMessage] = useState(null)

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

  // Handle Employee Deletion
  const handleDeleteConfirm = () => {
    if (!employeeToDelete) return

    startDeleteTransition(async () => {
      const res = await deleteEmployee(employeeToDelete.id)
      if (res?.error) {
        setFeedbackMessage({ type: 'error', text: res.error })
      } else {
        setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id))
        setFeedbackMessage({ type: 'success', text: `Removed ${employeeToDelete.full_name} from organization.` })
      }
      setEmployeeToDelete(null)
      setTimeout(() => setFeedbackMessage(null), 4000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Page Title, Search & Filter Bar */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
              Directory Ledger
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight mt-1">
            Employee Directory
          </h1>
          <p className="text-sm text-slate max-w-2xl leading-relaxed mt-0.5">
            Every staff member, role allocation, and real-time attendance indicator registered within your organization.
          </p>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`p-3 rounded-[6px] text-xs font-medium border ${
            feedbackMessage.type === 'error'
              ? 'bg-rose/10 border-rose/30 text-rose'
              : 'bg-sage/10 border-sage/30 text-sage'
          }`}>
            {feedbackMessage.text}
          </div>
        )}

        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, title, or email..."
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
            className="bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber focus:border-amber"
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
            Try adjusting your search query or department filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const status = getEmployeeStatus(emp.id)
            const isSelf = emp.id === currentUser?.id

            return (
              <div
                key={emp.id}
                className="ledger-card p-5 relative group transition-all hover:border-ink"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/employees/${emp.id}`} className="flex items-center gap-3 flex-1">
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
                  </Link>

                  <div className="flex items-center gap-2">
                    <StatusDot status={status} showLabel={false} size="md" />

                    {/* Admin Delete Action Button */}
                    {isAdmin && !isSelf && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setEmployeeToDelete(emp)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate hover:text-rose hover:bg-rose/10 rounded transition-all cursor-pointer"
                        title={`Delete ${emp.full_name}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Details */}
                <Link href={`/employees/${emp.id}`} className="block pt-3 border-t border-border/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate uppercase text-[10px] tracking-wider font-mono-ledger">Login ID</span>
                    <span className="font-mono-ledger text-ink font-medium">
                      {emp.login_id || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate uppercase text-[10px] tracking-wider font-mono-ledger">Department</span>
                    <span className="text-ink font-medium">
                      {emp.department || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate uppercase text-[10px] tracking-wider font-mono-ledger">Email</span>
                    <span className="font-mono-ledger text-slate truncate max-w-[160px]">
                      {emp.email}
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-50 duration-100">
          <div className="w-full max-w-md ledger-card p-6 bg-surface border border-border shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose/10 text-rose flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-ink">
                  Delete Employee Profile
                </h3>
                <p className="text-xs text-slate mt-0.5">
                  Are you sure you want to remove <strong className="text-ink">{employeeToDelete.full_name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate bg-paper p-3 rounded-[6px] border border-border leading-relaxed">
              This action will permanently delete <strong className="text-ink">{employeeToDelete.login_id}</strong> ({employeeToDelete.email}), revoking portal access, shift records, and leave history.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setEmployeeToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="rose"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
              </Button>
            </div>
          </div>
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
