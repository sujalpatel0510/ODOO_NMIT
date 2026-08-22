"use client"

import { Data } from "lucide-react"
import { UserPlus } from "lucide-react"
import { Calendar } from "lucide-react"
import { CheckCircle } from "lucide-react"
import { Settings } from "lucide-react"
import { LogOut } from "lucide-react"
import { FileText } from "lucide-react"
import { DollarSign } from "lucide-react"
import { BarChart3 } from "lucide-react"
import { Shield } from "lucide-react"

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

export function Sidebar() {
  const NavLinks: NavLink[] = [
    { href: "/", label: "Dashboard", icon: Data },
    { href: "/employees", label: "Employees", icon: UserPlus },
    { href: "/attendance", label: "Attendance", icon: CheckCircle },
    { href: "/leave", label: "Leave", icon: Calendar },
    { href: "/payroll", label: "Payroll", icon: DollarSign },
    { href: "/tasks", label: "Tasks", icon: CheckCircle },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ]

  const AdminLinks: NavLink[] = [
    { href: "/admin", label: "Admin Dashboard", icon: Shield, adminOnly: true },
  ]

  return (
    <aside className="w-64 bg-surface h-full border-right border-border flex-shrink-0 shadow-sm">
      <div className="p-6 border-b border-border">
        <h2 className="font-display font-semibold text-ink text-sm tracking-wider">Dayflow</h2>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {NavLinks.map((link) => (
            <li key={link.href} className="group flex items-center px-3 py-2 rounded-md text-sm text-slate hover:text-ink hover:bg-amber/10 transition-colors">
              <link.icon className="h-4 w-4 mr-3 group-hover:text-amber" />
              {link.label}
            </li>
          ))}
          {AdminLinks.map((link) => (
            <li key={link.href} className="group flex items-center px-3 py-2 rounded-md text-sm text-slate hover:text-ink hover:bg-amber/10 transition-colors">
              <link.icon className="h-4 w-4 mr-3 group-hover:text-amber" />
              {link.label}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-2 border-t border-border mt-auto">
        <button
          className="w-full flex items-center justify-center py-2 rounded-md text-slate hover:text-ink hover:bg-amber/10 transition-colors"
        >
          <span className="hidden md:block">Menu</span>
        </button>
      </div>
    </aside>
  )
}