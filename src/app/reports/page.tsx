"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { BarChart3, PieChart, Table, Calendar, Activity, Users, Layout } from "lucide-react"

interface ReportFilter {
  type: "month" | "quarter" | "year"
  value: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<ReportFilter>({ type: "year", value: "2024" })
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    const mockReports = [
      {
        type: "employee-count",
        title: "Employee Count",
        value: 142,
        change: "+12",
        changeType: "positive",
        icon: Users,
      },
      {
        type: "attendance-rate",
        title: "Attendance Rate",
        value: "94%",
        change: "+3%",
        changeType: "positive",
        icon: Activity,
      },
      {
        type: "leave-summary",
        title: "Leave Summary",
        value: "47 requests",
        change: "+8",
        changeType: "positive",
        icon: Calendar,
      },
      {
        type: "payroll-total",
        title: "Payroll Total",
        value: "$125,000",
        change: "+5%",
        changeType: "positive",
        icon: DollarSign,
      },
    ]
    setReports(mockReports)
  }, [user])

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
          <h1 className="font-display font-semibold text-2xl text-ink">Reports</h1>
          <Layout className="h-5 w-5 text-amber" />
        </div>

        {/* Report filters */}
        <div className="bg-surface border border-border rounded-md p-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate">Filter by:</span>
            <Button variant="ghost" size="sm" onClick={() => setFilter({ type: "year", value: "2024" })}>
              Year
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFilter({ type: "quarter", value: "Q1" })}>
              Quarter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFilter({ type: "month", value: "Jan" })}>
              Month
            </Button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {reports.map((report) => (
            <div key={report.type} className="bg-amber/5 border border-amber/5 rounded-md p-4">
              <div className="flex items-center gap-3 mb-2">
                <report.icon className="h-5 w-5 text-amber" />
                <span className="font-medium text-ink">{report.title}</span>
              </div>
              <p className="font-display font-serif-prime text-3xl font-bold text-amber">{report.value}</p>
              <p className={`text-amber ${
                report.changeType === "positive" ? "font-medium" : "font-light"
              }`}>
                {report.change}{report.changeType === "positive" ? "+" : ""}
              </p>
            </div>
          ))}
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Employee Count by Department */}
          <div className="bg-surface border border-border rounded-md p-6 h-full">
            <h3 className="font-display font-semibold text-ink mb-4">Employee Count by Department</h3>
            <div className="h-48 bg-border rounded-md flex items-center justify-center">
              <span className="text-slate">No data</span>
            </div>
          </div>

          {/* Leave Trends */}
          <div className="bg-surface border border-border rounded-md p-6 h-full">
            <h3 className="font-display font-semibold text-ink mb-4">Leave Trends</h3>
            <div className="h-48 bg-border rounded-md flex items-center justify-center">
              <span className="text-slate">No data</span>
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="bg-surface border border-border rounded-md p-6 h-full">
            <h3 className="font-display font-semibold text-ink mb-4">Attendance Overview</h3>
            <div className="h-48 bg-border rounded-md flex items-center justify-center">
              <span className="text-slate">No data</span>
            </div>
          </div>
        </div>

        {/* Detailed tables */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Attendance Report */}
          <div className="bg-surface border border-border rounded-md p-6">
            <h3 className="font-display font-semibold text-ink mb-4">Attendance Report</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Employee</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Present</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Absent</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Leave</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 font-mono text-sm text-ink">Engineering</td>
                    <td className="py-3 font-mono text-sm text-amber">87</td>
                    <td className="py-3 font-mono text-sm text-rose">5</td>
                    <td className="py-3 font-mono text-sm text-slate">3</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-sm text-slate">Marketing</td>
                    <td className="py-3 font-mono text-sm text-amber">72</td>
                    <td className="py-3 font-mono text-sm text-rose">8</td>
                    <td className="py-3 font-mono text-sm text-slate">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Report */}
          <div className="bg-surface border border-border rounded-md p-6">
            <h3 className="font-display font-semibold text-ink mb-4">Leave Report</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Employee</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Type</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Duration</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 font-mono text-sm text-ink">John Doe</td>
                    <td className="py-3 font-mono text-sm text-sickle">Sick</td>
                    <td className="py-3 font-mono text-sm">5 days</td>
                    <td className="py-3">
                      <span className="h-2 w-2 rounded-full bg-sage border-2 border-surface mr-1" aria-hidden="true" />
                      Approved
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payroll Report */}
          <div className="bg-surface border border-border rounded-md p-6">
            <h3 className="font-display font-semibold text-ink mb-4">Payroll Report</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Employee</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Gross</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Net</th>
                    <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 font-mono text-sm text-ink">Jane Smith</td>
                    <td className="py-3 font-mono text-sm text-amber">$5,200</td>
                    <td className="py-3 font-mono text-sm text-ink">$4,850</td>
                    <td className="py-3">
                      <span className="h-2 w-2 rounded-full bg-sage border-2 border-surface mr-1" aria-hidden="true" />
                      Paid
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}