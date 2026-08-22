"use client"

import { User } from "lucide-react"

interface EmployeeCardProps {
  id: string
  name: string
  employeeId: string
  designation: string
  department: string
  status: "present" | "absent" | "on-leave"
  avatar?: string
  onView: () => void
}

export function EmployeeCard({ id, name, employeeId, designation, department, status, avatar, onView }: EmployeeCardProps) {
  const statusColor = {
    present: "sage",
    absent: "rose",
    "on-leave": "dust",
  }[status]

  return (
    <div
      onClick={onView}
      className="cursor-pointer hover:underline hover:text-ink transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-border flex items-center justify-center flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="bg-amber text-ink text-xs font-bold">
              {name.split(" ")[0]?.charAt(0) || ""}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ink line-clamp-2">{name}</p>
          <p className="text-sm text-slate line-clamp-1">
            {employeeId} • {designation}
          </p>
        </div>
        <div className="w-3 h-3 rounded-full mt-2 flex-shrink-0" />
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs">
        <span className="h-2 w-2 rounded-full bg-{statusColor} border-2 border-surface" aria-hidden="true" />
        <span className="ml-1 capitalize">{status}</span>
      </div>
    </div>
  )
}