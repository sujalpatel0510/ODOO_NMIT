'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusDot from '../ui/StatusDot'
import Button from '../ui/Button'
import ResumeTab from './ResumeTab'
import PrivateInfoTab from './PrivateInfoTab'
import SalaryInfoTab from './SalaryInfoTab'
import SecurityTab from './SecurityTab'
import { deleteEmployee } from '../../app/actions/profile'

export default function EmployeeProfileView({
  targetProfile,
  currentUser,
  resumeData,
  salaryStructure,
  todayAttendance,
}) {
  const router = useRouter()
  const isAdmin = currentUser?.role === 'admin'
  const isSelf = currentUser?.id === targetProfile?.id

  // Available tabs depending on role
  const tabs = [
    { id: 'resume', label: 'Resume' },
    ...((isAdmin || isSelf) ? [{ id: 'private', label: 'Private Info' }] : []),
    ...(isAdmin ? [{ id: 'salary', label: 'Salary Info' }] : []),
    ...(isSelf && !isAdmin ? [{ id: 'security', label: 'Security' }] : []),
  ]

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'resume')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState(null)

  // Live status calculation
  let currentStatus = 'absent'
  if (todayAttendance) {
    if (todayAttendance.check_in && !todayAttendance.check_out) {
      currentStatus = 'checked-in'
    } else if (todayAttendance.status === 'present') {
      currentStatus = 'present'
    } else if (todayAttendance.status === 'half-day') {
      currentStatus = 'half-day'
    } else if (todayAttendance.status === 'leave') {
      currentStatus = 'on-leave'
    }
  }

  const handleDeleteConfirm = () => {
    startDeleteTransition(async () => {
      const res = await deleteEmployee(targetProfile.id)
      if (res?.error) {
        setErrorMessage(res.error)
        setShowDeleteModal(false)
      } else {
        router.push('/employees')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb Navigation & Top Actions */}
      <div className="flex items-center justify-between text-xs text-slate">
        <Link href="/employees" className="hover:text-ink transition-colors font-mono-ledger flex items-center gap-1">
          <span>←</span> Back to Employee Directory
        </Link>

        {isAdmin && !isSelf && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-rose border-rose/30 hover:bg-rose/10 hover:border-rose"
          >
            🗑 Delete Employee
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-[6px] bg-rose/10 border border-rose/30 text-rose text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Profile Header Shell */}
      <div className="ledger-card p-6 bg-surface">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            {targetProfile.profile_picture_url ? (
              <img
                src={targetProfile.profile_picture_url}
                alt={targetProfile.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-ink text-white flex items-center justify-center font-heading font-semibold text-xl">
                {targetProfile.full_name?.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading text-xl md:text-2xl font-semibold text-ink">
                  {targetProfile.full_name}
                </h1>
                {isSelf && (
                  <span className="text-[10px] bg-paper text-slate px-2 py-0.5 rounded border border-border">
                    You
                  </span>
                )}
                <span className="text-[10px] uppercase font-mono-ledger px-2 py-0.5 rounded bg-ink text-amber font-semibold">
                  {targetProfile.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate mt-1">
                <span>{targetProfile.job_title || 'Team Member'}</span>
                <span>•</span>
                <span>{targetProfile.department || 'General'}</span>
                <span>•</span>
                <span className="font-mono-ledger">ID: {targetProfile.login_id || '—'}</span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3 bg-paper px-4 py-2 rounded-[6px] border border-border">
            <span className="text-xs text-slate uppercase font-mono-ledger">Daily Status:</span>
            <StatusDot status={currentStatus} showLabel={true} size="sm" />
          </div>

        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 border-t border-border mt-6 pt-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive ? 'text-ink font-bold' : 'text-slate hover:text-ink'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content Panes */}
      <div>
        {activeTab === 'resume' && (
          <ResumeTab
            profileId={targetProfile.id}
            initialData={resumeData}
            canEdit={isAdmin || isSelf}
          />
        )}

        {activeTab === 'private' && (isAdmin || isSelf) && (
          <PrivateInfoTab
            profile={targetProfile}
            isAdmin={isAdmin}
            isSelf={isSelf}
          />
        )}

        {activeTab === 'salary' && isAdmin && (
          <SalaryInfoTab
            profileId={targetProfile.id}
            initialStructure={salaryStructure}
          />
        )}

        {activeTab === 'security' && isSelf && !isAdmin && (
          <SecurityTab profile={targetProfile} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                  Delete Employee Account
                </h3>
                <p className="text-xs text-slate mt-0.5">
                  Are you sure you want to permanently delete <strong className="text-ink">{targetProfile.full_name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate bg-paper p-3 rounded-[6px] border border-border leading-relaxed">
              This action will remove <strong className="text-ink">{targetProfile.login_id}</strong> ({targetProfile.email}) from the active roster, revoke their portal access, and purge all associated attendance and leave records.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
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

    </div>
  )
}
