"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmployeeCard } from "@/components/employees/employee-card"
import { Data } from "lucide-react"

interface Employee {
  id: string
  name: string
  employeeId: string
  designation: string
  department: string
  status: "present" | "absent" | "on-leave"
  avatar?: string
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("")
  const [employees, setEmployees] = useState<Employee[]>([])

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="font-display font-semibold text-2xl text-ink">Employee Directory</h1>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary">New Employee</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <EmployeeCard
              key={emp.id}
              id={emp.id}
              name={emp.name}
              employeeId={emp.employeeId}
              designation={emp.designation}
              department={emp.department}
              status={emp.status}
              avatar={emp.avatar}
              onView={() => console.log("view", emp.id)}
            />
          ))}
          {filteredEmployees.length === 0 && (
            <p className="col-span-full text-slate text-sm text-center py-8">
              No employees found
            </p>
          )}
        </div>
      </div>
    </div>
  )
}