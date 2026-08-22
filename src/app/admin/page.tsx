"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { NotificationBell, Users, Calendar, DollarSign, Layout, Activity, Clipboard, Settings, LogOut } from "lucide-react"

interface AdminDashboardProps {
  children?: React.ReactNode
}

export function AdminDashboard({ children }: AdminDashboardProps) {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Check auth state on mount
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <span className="text-slate">Loading...</span>
      </div>
    )
  }

  if (!user) {
    const signInPath = "/auth/signin"
    const navigate = (window as any).navigate || ((url: string) => {
      window.location.href = url
    })
    navigate(signInPath)
    return null
  }

  // Check if user is admin
  const isAdmin = user?.role === "admin"

  if (!isAdmin) {
    const dashboardPath = "/"
    const navigate = (window as any).navigate || ((url: string) => {
      window.location.href = url
    })
    navigate(dashboardPath)
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      // Silently fail
    }
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/dayflow-logo.svg"
              alt="Dayflow"
              width="40"
              height="40"
              className="object-contain"
            />
            <span className="font-display font-semibold text-ink">Dayflow</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell className="h-5 w-5 text-slate" />
            <span className="text-sm text-slate">{user?.fullName || "Admin"}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-paper">
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Quick stats cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="bg-surface border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-slate" />
                  <span className="text-sm text-slate">Total Employees</span>
                </div>
                <p className="font-display font-serif-prime text-3xl font-bold text-ink">142</p>
                <p className="text-xs text-slate">Active employees</p>
              </div>
              <div className="bg-surface border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-slate" />
                  <span className="text-sm text-slate">Pending Leave</span>
                </div>
                <p className="font-display font-serif-prime text-3xl font-bold text-amber">23</p>
                <p className="text-xs text-slate">Awaiting approval</p>
              </div>
              <div className="bg-surface border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-slate" />
                  <span className="text-sm text-slate">Monthly Payroll</span>
                </div>
                <p className="font-display font-serif-prime text-3xl font-bold text-amber">$45,000</p>
                <p className="text-xs text-slate">This month</p>
              </div>
              <div className="bg-surface border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-slate" />
                  <span className="text-sm text-slate">Attendance Today</span>
                </div>
                <p className="font-display font-serif-prime text-3xl font-bold text-sage">89%</p>
                <p className="text-xs text-slate">Present rate</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="font-display font-semibold text-ink mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
              >
                <Users className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Manage Leave
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                View Payroll
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
              >
                <Activity className="mr-2 h-4 w-4" />
                Attendance Report
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}