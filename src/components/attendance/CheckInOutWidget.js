'use client'

import { useState, useEffect, useTransition } from 'react'
import WorkdayRing from './WorkdayRing'
import { toggleAttendance } from '../../app/actions/attendance'
import { computeWorkdayRingProgress } from '../../utils/attendance-calculator'

export default function CheckInOutWidget({ initialRecord }) {
  const [record, setRecord] = useState(initialRecord)
  const [isPending, startTransition] = useTransition()
  const [elapsedText, setElapsedText] = useState('00:00:00')
  const [progress, setProgress] = useState(0)

  const isCheckedIn = Boolean(record?.check_in && !record?.check_out)

  useEffect(() => {
    if (!isCheckedIn || !record?.check_in) {
      if (record?.check_in && record?.check_out) {
        const diffMs = Math.max(0, new Date(record.check_out).getTime() - new Date(record.check_in).getTime())
        const hours = Math.floor(diffMs / (1000 * 60 * 60))
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000)
        setElapsedText(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
        setProgress(computeWorkdayRingProgress(record.check_in, record.check_out))
      } else {
        setElapsedText('00:00:00')
        setProgress(0)
      }
      return
    }

    const interval = setInterval(() => {
      const inTime = new Date(record.check_in).getTime()
      const now = new Date().getTime()
      const diffMs = Math.max(0, now - inTime)

      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000)

      setElapsedText(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
      setProgress(computeWorkdayRingProgress(record.check_in))
    }, 1000)

    return () => clearInterval(interval)
  }, [isCheckedIn, record])

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleAttendance()
      if (res?.success) {
        if (!isCheckedIn) {
          setRecord({
            check_in: new Date().toISOString(),
            check_out: null,
            status: 'present'
          })
        } else {
          setRecord(prev => ({
            ...prev,
            check_out: new Date().toISOString()
          }))
        }
      }
    })
  }

  return (
    <div className="ledger-card p-6 flex flex-col items-center justify-center text-center">
      <div className="mb-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-slate mb-1">
          Daily Workday Tracker
        </h4>
        <p className="text-xs text-slate">Standard shift: 8h 00m</p>
      </div>

      {/* Signature Workday Ring */}
      <div className="my-2">
        <WorkdayRing progress={progress} size={150} strokeWidth={3}>
          <div className="flex flex-col items-center">
            <span className="font-mono-ledger text-xl font-medium text-ink tracking-tight">
              {elapsedText}
            </span>
            <span className="text-[11px] text-slate mt-0.5">
              {isCheckedIn ? 'Elapsed' : record?.check_out ? 'Completed' : 'Standby'}
            </span>
          </div>
        </WorkdayRing>
      </div>

      {/* Action Button */}
      <div className="mt-4 w-full max-w-[200px]">
        <button
          type="button"
          disabled={isPending}
          onClick={handleToggle}
          className={`w-full py-2.5 px-4 rounded-[6px] text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber ${
            isCheckedIn
              ? 'bg-rose text-white hover:bg-opacity-90'
              : 'bg-ink text-white hover:bg-opacity-90'
          }`}
        >
          {isPending ? 'Logging...' : isCheckedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate">
        <span
          className={`w-2 h-2 rounded-full ${
            isCheckedIn ? 'bg-sage animate-pulse' : record?.check_out ? 'bg-dust' : 'bg-border'
          }`}
        />
        <span>
          {isCheckedIn
            ? 'Checked In — Live syncing'
            : record?.check_out
            ? 'Checked Out for today'
            : 'Not checked in today'}
        </span>
      </div>
    </div>
  )
}
