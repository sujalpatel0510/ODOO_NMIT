'use client'

import { useState } from 'react'
import Button from '../ui/Button'
import LeaveBalanceCards from './LeaveBalanceCards'
import RequestLeaveModal from './RequestLeaveModal'
import AdminApprovalQueue from './AdminApprovalQueue'
import AdminAllocationModal from './AdminAllocationModal'

export default function TimeOffView({
  isAdmin,
  currentUser,
  allocations = [],
  myRequests = [],
  allCompanyRequests = [],
  companyEmployees = [],
}) {
  const [activeTab, setActiveTab] = useState(isAdmin ? 'approvals' : 'my-requests')
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false)

  const employeesMap = companyEmployees.reduce((acc, emp) => {
    acc[emp.id] = emp
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-ledger text-xs text-amber font-semibold uppercase tracking-wider">
              Leave & Absence Ledger
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-ink tracking-tight">
            Time Off & Leave Management
          </h1>
          <p className="text-sm text-slate max-w-xl">
            Track annual leave quotas, submit time-off requests with supporting documents, and reconcile organizational absence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="secondary"
              onClick={() => setIsAllocModalOpen(true)}
              className="text-xs"
            >
              + Allocate Quotas
            </Button>
          )}
          <Button
            variant="amber"
            onClick={() => setIsRequestModalOpen(true)}
            className="text-xs"
          >
            + Request Time Off
          </Button>
        </div>
      </div>

      <LeaveBalanceCards allocations={allocations} />

      {isAdmin && (
        <div className="flex items-center gap-2 border-b border-border pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'approvals' ? 'text-ink' : 'text-slate hover:text-ink'
            }`}
          >
            Approval Queue ({allCompanyRequests.filter(r => r.status === 'pending').length})
            {activeTab === 'approvals' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-requests')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'my-requests' ? 'text-ink' : 'text-slate hover:text-ink'
            }`}
          >
            My Submitted Requests
            {activeTab === 'my-requests' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber" />
            )}
          </button>
        </div>
      )}

      {isAdmin && activeTab === 'approvals' && (
        <AdminApprovalQueue
          requests={allCompanyRequests}
          employeesMap={employeesMap}
        />
      )}

      {(!isAdmin || activeTab === 'my-requests') && (
        <div className="ledger-card p-6 bg-surface space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
              My Leave Request History
            </h4>
            <span className="text-xs font-mono-ledger text-slate">
              {myRequests.length} requests logged
            </span>
          </div>

          <div className="overflow-x-auto border border-border rounded-[6px]">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Remarks</th>
                  <th>Attachment</th>
                  <th>Status</th>
                  <th>Admin Comment</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-slate font-mono-ledger">
                      No leave requests submitted yet. Click "+ Request Time Off" to create one.
                    </td>
                  </tr>
                ) : (
                  myRequests.map((req) => {
                    const isApproved = req.status === 'approved'
                    const isRejected = req.status === 'rejected'

                    return (
                      <tr key={req.id}>
                        <td className="capitalize font-medium text-ink">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono-ledger ${
                            req.leave_type === 'sick' ? 'bg-amber/10 text-amber' : 'bg-paper text-slate border border-border'
                          }`}>
                            {req.leave_type}
                          </span>
                        </td>
                        <td className="font-mono-ledger text-ink whitespace-nowrap">
                          {req.start_date} → {req.end_date}
                        </td>
                        <td className="text-xs text-slate max-w-[200px] truncate" title={req.remarks}>
                          {req.remarks || '—'}
                        </td>
                        <td className="font-mono-ledger text-xs">
                          {req.attachment_url ? (
                            <a
                              href={req.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber hover:underline flex items-center gap-1"
                            >
                              📎 Document
                            </a>
                          ) : (
                            <span className="text-slate">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono-ledger font-semibold ${
                            isApproved
                              ? 'bg-sage/10 text-sage'
                              : isRejected
                              ? 'bg-rose/10 text-rose'
                              : 'bg-amber/10 text-amber'
                          }`}>
                            {req.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-xs text-slate">
                          {req.admin_comment || '—'}
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

      <RequestLeaveModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      {isAdmin && (
        <AdminAllocationModal
          isOpen={isAllocModalOpen}
          onClose={() => setIsAllocModalOpen(false)}
          employees={companyEmployees}
        />
      )}
    </div>
  )
}
