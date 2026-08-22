'use client'

import { useState, useTransition } from 'react'
import Button from '../ui/Button'
import { reviewLeaveRequest } from '../../app/actions/leave'

export default function AdminApprovalQueue({ requests = [], employeesMap = {} }) {
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [adminComment, setAdminComment] = useState('')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  const handleDecision = (requestId, status) => {
    setMessage(null)
    startTransition(async () => {
      const res = await reviewLeaveRequest(requestId, status, adminComment)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: `Request marked as ${status}.` })
        setSelectedRequestId(null)
        setAdminComment('')
      }
    })
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const completedRequests = requests.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-[6px] text-xs font-medium ${
            message.type === 'success'
              ? 'bg-sage/10 border border-sage/30 text-sage'
              : 'bg-rose/10 border border-rose/30 text-rose'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Pending Approvals Section */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Pending Leave Requests ({pendingRequests.length})
          </h4>
          <span className="text-xs font-mono-ledger text-amber font-medium">
            Requires Admin Review
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate font-mono-ledger">
            No pending leave requests in the queue.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-[6px]">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Remarks</th>
                  <th>Attachment</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => {
                  const emp = employeesMap[req.profile_id] || {}
                  const isDeciding = selectedRequestId === req.id

                  return (
                    <tr key={req.id}>
                      <td className="font-medium text-ink">
                        <div>
                          <span>{emp.full_name || 'Staff Member'}</span>
                          <span className="block text-[10px] font-mono-ledger text-slate">
                            {emp.login_id || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="capitalize font-medium text-ink">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono-ledger ${
                          req.leave_type === 'sick' ? 'bg-amber/10 text-amber' : 'bg-paper text-slate border border-border'
                        }`}>
                          {req.leave_type}
                        </span>
                      </td>
                      <td className="font-mono-ledger text-xs text-ink whitespace-nowrap">
                        {req.start_date} → {req.end_date}
                      </td>
                      <td className="text-xs text-slate max-w-[200px] truncate" title={req.remarks}>
                        {req.remarks || '—'}
                      </td>
                      <td className="text-xs font-mono-ledger">
                        {req.attachment_url ? (
                          <a
                            href={req.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber hover:underline flex items-center gap-1"
                          >
                            <span>📎 Document</span>
                          </a>
                        ) : (
                          <span className="text-slate">—</span>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        {isDeciding ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              placeholder="Comment (optional)"
                              value={adminComment}
                              onChange={(e) => setAdminComment(e.target.value)}
                              className="w-36 px-2 py-1 text-xs border border-border rounded bg-surface focus:outline-none focus:ring-1 focus:ring-amber"
                            />
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isPending}
                              onClick={() => handleDecision(req.id, 'approved')}
                              className="!bg-sage text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isPending}
                              onClick={() => handleDecision(req.id, 'rejected')}
                            >
                              Reject
                            </Button>
                            <button
                              type="button"
                              onClick={() => setSelectedRequestId(null)}
                              className="text-xs text-slate hover:text-ink px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequestId(req.id)
                              setAdminComment('')
                            }}
                            className="px-3 py-1 bg-ink text-white rounded text-xs font-medium hover:bg-opacity-90 focus:outline-none focus:ring-1 focus:ring-amber"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Audit Trail */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Processed Decision History
        </h4>

        {completedRequests.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate font-mono-ledger">
            No previous leave decisions recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-[6px]">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Date Interval</th>
                  <th>Decision</th>
                  <th>Admin Comment</th>
                  <th>Decided At</th>
                </tr>
              </thead>
              <tbody>
                {completedRequests.map((req) => {
                  const emp = employeesMap[req.profile_id] || {}
                  const isApproved = req.status === 'approved'

                  return (
                    <tr key={req.id}>
                      <td className="font-medium text-ink">
                        {emp.full_name || 'Staff Member'}
                      </td>
                      <td className="capitalize text-slate font-mono-ledger">
                        {req.leave_type}
                      </td>
                      <td className="font-mono-ledger text-ink">
                        {req.start_date} → {req.end_date}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono-ledger font-semibold ${
                          isApproved ? 'bg-sage/10 text-sage' : 'bg-rose/10 text-rose'
                        }`}>
                          {req.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-xs text-slate">
                        {req.admin_comment || '—'}
                      </td>
                      <td className="font-mono-ledger text-xs text-slate">
                        {req.decided_at ? new Date(req.decided_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
