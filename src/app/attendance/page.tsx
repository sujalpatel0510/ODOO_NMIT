"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { Data } from "lucide-react"
import { attendanceService } from "@/services/hrmsServices"
import { AttendanceRecord } from "@/types/hrms"

export default function AttendancePage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch today's attendance and records
    const loadData = async () => {
      try {
        // Fetch today's record
        const today = attendanceService.getTodayAttendance(user?.id || "1")
        setTodayRecord(today)
        
        // Fetch records list
        const records = await attendanceService.getAttendanceRecords(user?.id || "1")
        setRecords(records || [])
      } catch (err) {
        setError("Failed to load attendance data")
        console.error(err)
      }
    }
    
    loadData()
  }, [user])

  const handleCheckIn = async () => {
    try {
      const result = await attendanceService.checkIn(user?.id || "1")
      setCheckInTime(result.checkInTime)
      setIsCheckedIn(true)
      // Refresh data
      const today = await attendanceService.getTodayAttendance(user?.id || "1")
      setTodayRecord(today)
    } catch (err) {
      setError("Failed to check in. Please try again.")
      console.error(err)
    }
  }

  const handleCheckOut = async () => {
    try {
      const result = await attendanceService.checkOut(user?.id || "1")
      setIsCheckedIn(false)
      setCheckInTime(null)
      // Refresh data
      const today = await attendanceService.getTodayAttendance(user?.id || "1")
      setTodayRecord(today)
    } catch (err) {
      setError("Failed to check out. Please try again.")
      console.error(err)
    }
  }

  if (!user) {
    const signInPath = "/auth/signin"
    const navigate = (window as any).navigate || ((url: string) => {
      window.location.href = url
    })
    navigate(signInPath)
    return null
  }

  return (
    <div className="p-6 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="font-display font-semibold text-2xl text-ink">Attendance</h1>
          <Data className="h-5 w-5 text-amber" />
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Today's attendance widget */}
        <div className="bg-surface border border-border rounded-md p-6 mb-6">
          <h2 className="font-display font-semibold text-ink mb-4">Today's Attendance</h2>
          
          {todayRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate">Date</span>
                <span className="font-medium text-ink">{todayRecord.date}</span>
              </div>
              
              {isCheckedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate">Check-in: </span>
                  <span className="font-mono text-amber">{checkInTime}</span>
                  <button
                    onClick={handleCheckOut}
                    className="text-amber/80 hover:text-amber transition-colors"
                  >
                    Check Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckIn}
                    className="text-amber hover:text-ink transition-colors"
                  >
                    Check In
                  </button>
                  <span className="text-sm text-slate">Not checked in</span>
                </div>
              )}
              
              <div className="mt-4">
                <span className="text-sm text-slate">Work hours:</span>
                <span className="font-mono text-ink">{todayRecord?.workHours}h</span>
              </div>
              
              <div>
                <span className="text-sm text-slate">Status</span>
                <span className="h-2 w-2 rounded-full bg-{todayRecord.status === "present" ? "sage" : todayRecord.status === "absent" ? "rose" : "dust"} border-2 border-surface mr-1" aria-hidden="true" />
                <span className="text-sm capitalize">{todayRecord.status}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate text-sm">
              No attendance record for today. <button onClick={handleCheckIn} className="text-amber hover underline">Check In</button>
            </p>
          )}
        </div>

        {/* Workday ring */}
        <div className="relative h-64 md:h-80 relative">
          {/* Workday ring background */}
          <svg className="absolute inset-0 mx-auto">
            <circle
              cx="50%"
              cy="50%"
              r="40"
              stroke="border"
              strokeWidth={2}
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40"
              stroke="amber"
              strokeWidth={2}
              fill="none"
              strokeDasharray={251.2}
              strokeDashoffset={251.2}
              className="transition-all duration-300"
            />
          </svg>
          
          {/* Check-in/out button in the ring */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Button 
              variant="primary" 
              onClick={handleCheckIn} 
              disabled={isCheckedIn}
            >
              {isCheckedIn ? "Checked In" : "Check In"}
            </Button>
            <span className="text-amber text-sm font-mono">
              {checkInTime || "00:00"}
            </span>
          </div>
        </div>

        {/* Monthly attendance summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-md p-4">
            <p className="text-sm text-slate">Present</p>
            <p className="font-display font-semibold text-3xl text-amber">{todayRecord?.status === "present" ? "24" : "0"}</p>
          </div>
          <div className="bg-surface border border-border rounded-md p-4">
            <p className="text-sm text-slate">Absent</p>
            <p className="font-display font-semibold text-3xl text-rose">{todayRecord?.status === "absent" ? "3" : "0"}</p>
          </div>
        </div>

        {/* Records table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Employee</th>
                <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Date</th>
                <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Check-in</th>
                <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Check-out</th>
                <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Work Hours</th>
                <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-border hover:bg-amber/5">
                  <td className="py-3 font-mono text-sm text-ink">{record.profile_id}</td>
                  <td className="py-3 font-mono text-sm text-ink">{record.date}</td>
                  <td className="py-3 font-mono text-sm text-ink">{record.check_in || "—"}</td>
                  <td className="py-3 font-mono text-sm text-ink">{record.check_out || "—"}</td>
                  <td className="py-3 font-mono text-sm text-ink">{record.work_hours}h</td>
                  <td className="py-3">
                    <span className="h-2 w-2 rounded-full bg-{record.status === "present" ? "sage" : record.status === "absent" ? "rose" : "dust"} border-2 border-surface mr-1" aria-hidden="true" />
                    {record.status}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td className="py-8 text-center text-slate" colSpan={6}>
                    No attendance records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}