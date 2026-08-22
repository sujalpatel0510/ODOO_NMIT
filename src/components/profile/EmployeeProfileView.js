'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusDot from '../ui/StatusDot'
import ResumeTab from './ResumeTab'
import PrivateInfoTab from './PrivateInfoTab'
import SalaryInfoTab from './SalaryInfoTab'
import SecurityTab from './SecurityTab'

export default function EmployeeProfileView({
  targetProfile,
  currentUser,
  resumeData,
  salaryStructure,
  todayAttendance,
}) {
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

  return (
    <div className="space-y-6">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate">
        <Link href="/employees" className="hover:text-ink transition-colors font-mono-ledger">
          ← Back to Directory
        </Link>
      </div>

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
                className={`relative px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-ink' : 'text-slate hover:text-ink'
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

    </div>
  )
}
