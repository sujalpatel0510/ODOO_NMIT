'use client'

export default function StatusDot({
  status = 'present', // 'present', 'checked-in', 'on-leave', 'leave', 'absent', 'half-day'
  showLabel = true,
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) {
  const normStatus = (status || '').toLowerCase()
  
  const sizeMap = {
    sm: { dot: 'w-2 h-2', ring: 'w-4 h-4', text: 'text-xs' },
    md: { dot: 'w-2.5 h-2.5', ring: 'w-5 h-5', text: 'text-xs' },
    lg: { dot: 'w-3 h-3', ring: 'w-6 h-6', text: 'text-sm' },
  }[size] || { dot: 'w-2.5 h-2.5', ring: 'w-5 h-5', text: 'text-xs' }

  let dotContent = null
  let labelText = 'Present'

  if (normStatus === 'checked-in' || (normStatus === 'present' && status.isCheckedIn)) {
    labelText = 'Checked In'
    dotContent = (
      <div className={`relative flex items-center justify-center ${sizeMap.ring}`} title="Present (Checked In)">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="var(--border)" strokeWidth="2" fill="none" />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="var(--amber)"
            strokeWidth="2"
            strokeDasharray="56.5"
            strokeDashoffset="18"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span className={`${sizeMap.dot} rounded-full bg-sage`} />
      </div>
    )
  } else if (normStatus === 'present') {
    labelText = 'Present'
    dotContent = (
      <div className={`flex items-center justify-center ${sizeMap.ring}`} title="Present">
        <span className={`${sizeMap.dot} rounded-full bg-sage`} />
      </div>
    )
  } else if (normStatus === 'on-leave' || normStatus === 'leave' || normStatus === 'on leave') {
    labelText = 'On Leave'
    dotContent = (
      <div className={`flex items-center justify-center rounded-full bg-paper border border-dust ${sizeMap.ring}`} title="On Leave">
        <span className="w-2 h-0.5 bg-dust rounded-full" />
      </div>
    )
  } else if (normStatus === 'half-day') {
    labelText = 'Half Day'
    dotContent = (
      <div className={`flex items-center justify-center ${sizeMap.ring}`} title="Half Day">
        <span className={`${sizeMap.dot} rounded-full bg-amber`} />
      </div>
    )
  } else {
    // Absent
    labelText = 'Absent'
    dotContent = (
      <div className={`flex items-center justify-center ${sizeMap.ring}`} title="Absent">
        <span className={`${sizeMap.dot} rounded-full bg-rose`} />
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {dotContent}
      {showLabel && (
        <span className={`${sizeMap.text} font-medium text-slate capitalize`}>
          {labelText}
        </span>
      )}
    </div>
  )
}
