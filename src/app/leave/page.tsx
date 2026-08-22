"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { Calendar, Check, X, Settings } from "lucide-react"

interface LeaveRequest {
  id: string
  profileId: string
  leaveType: "paid" | "sick" | "unpaid"
  startDate: string
  endDate: string
  duration: number
  reason: string
  status: "pending" | "approved" | "rejected"
  attachmentUrl?: string
}

interface LeaveAllocation {
  leaveType: "paid" | "sick" | "unpaid"
  allocatedDays: number
  remainingDays: number
}

export default function LeavePage() {
  const { user } = useAuth()
  const [leaveType, setLeaveType] = useState<"paid" | "sick" | "unpaid">("paid")
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState<string>(new Date().addDays(1).toISOString().split("T")[0])
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [allocations, setAllocations] = useState<LeaveAllocation[]>([])

  // Calculate duration
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setDuration(diffDays)
    }
  }, [startDate, endDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!reason.trim()) {
      setError("Please provide a reason for the leave request.")
      return
    }
    try {
      const newRequest: LeaveRequest = {
        id: Date.now().toString(),
        profileId: user?.id || "1",
        leaveType,
        startDate,
        endDate,
        duration,
        reason,
        status: "pending",
      }
      setRequests([...requests, newRequest])
      setReason("")
      setStartDate(new Date().toISOString().split("T")[0])
      setEndDate(new Date().addDays(1).toISOString().split("T")[0])
    } catch (err) {
      setError("Failed to submit leave request. Please try again.")
    }
  }

  return (
    <div className="p-6 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="font-display font-semibold text-2xl text-ink">Leave Management</h1>
          <Calendar className="h-5 w-5 text-amber" />
        </div>

        {/* Employee request form */}
        <div className="bg-surface border border-border rounded-md p-6 mb-6">
          <h2 className="font-display font-semibold text-ink mb-4">Request Leave</h2>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate mb-1">Leave Type</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer select-none border border-border hover:border-amber">
                    <input
                      type="radio"
                      name="leaveType"
                      value="paid"
                      checked={leaveType === "paid"}
                      onChange={(e) => setLeaveType("paid")}
                      className="peer-hidden peer-indicator-border"
                    />
                    <span>Paid Leave</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer select-none border border-border hover:border-amber">
                    <input
                      type="radio"
                      name="leaveType"
                      value="sick"
                      checked={leaveType === "sick"}
                      onChange={(e) => setLeaveType("sick")}
                      className="peer-hidden peer-indicator-border"
                    />
                    <span>Sick Leave</span>
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer select-none border border-border hover:border-amber">
                    <input
                      type="radio"
                      name="leaveType"
                      value="unpaid"
                      checked={leaveType === "unpaid"}
                      onChange={(e) => setLeaveType("unpaid")}
                      className="peer-hidden peer-indicator-border"
                    />
                    <span>Unpaid Leave</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate mb-1">Duration</label>
                <p className="font-mono text-2xl text-amber">{duration} days</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate mb-1">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate mb-1">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate mb-1">Reason</label>
              <Input
                placeholder="Enter reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            {leaveType === "sick" && (
              <div>
                <label className="block text-sm text-slate mb-1">
                  Attachment (required for Sick Leave)
                </label>
                <Input type="file" className="w-full p-2 bg-border rounded-md" />
              </div>
            )}

            <Button type="submit" disabled={!!error}>
              Submit Request
            </Button>
          </form>
        </div>

        {/* Leave balance */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {allocations.map((alloc) => (
            <div key={alloc.leaveType} className="bg-surface border border-border rounded-md p-4 text-center">
              <p className="text-sm text-slate capitalize">{alloc.leaveType}</p>
              <p className="font-display font-semibold text-2xl text-amber">{alloc.remainingDays} days</p>
              <p className="text-sm text-slate">Remaining</p>
            </div>
          ))}
        </div>

        {/* Requests table */}
        <div>
          <h2 className="font-display font-semibold text-ink mb-4">Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Employee</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Leave Type</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Duration</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Status</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-border hover:bg-amber/5">
                    <td className="py-3 font-mono text-sm text-ink">{req.profileId}</td>
                    <td className="py-3 font-mono text-sm text-ink">{req.leaveType}</td>
                    <td className="py-3 font-mono text-sm text-ink">{req.duration} days</td>
                    <td className="py-3">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          req.status === "approved" ? "bg-sage" :
                          req.status === "rejected" ? "bg-rose" :
                          "bg-dust"
                        } border-2 border-surface mr-1`}
                        aria-hidden="true"
                      />
                      {req.status}
                    </td>
                    <td className="py-3 text-sm">
                      {req.status === "pending" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="text-slate">{req.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td className="py-8 text-center text-slate" colSpan={6}>
                      No leave requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}