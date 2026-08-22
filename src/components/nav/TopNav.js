'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOutUser, demoLogin } from '../../app/actions/auth'

export default function TopNav({ userProfile, company, isDemo }) {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef(null)

  const isAdmin = userProfile?.role === 'admin'

  const navTabs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Employees', href: '/employees' },
    { name: 'Attendance', href: '/attendance' },
    { name: 'Time Off', href: '/time-off' },
    ...(isAdmin ? [{ name: 'Payroll', href: '/payroll' }] : []),
    { name: 'Tasks', href: '/tasks' },
    { name: 'Reports', href: '/reports' },
  ]

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRoleSwitch = (targetRole) => {
    startTransition(async () => {
      await demoLogin(targetRole)
      router.refresh()
    })
  }

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo + Logo Mark */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} Logo`}
                className="w-8 h-8 rounded-[6px] object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-[6px] bg-ink flex items-center justify-center text-amber font-heading font-bold text-sm tracking-wider shadow-sm">
                {company?.company_code?.slice(0, 2) || 'DF'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-ink text-sm tracking-tight leading-tight group-hover:text-amber transition-colors">
                {company?.name || 'Dayflow HRMS'}
              </span>
              <span className="font-mono-ledger text-[10px] text-slate uppercase tracking-wider">
                {company?.company_code || 'LEDGER'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  prefetch={true}
                  className={`relative px-3.5 py-2 text-xs font-semibold tracking-tight transition-colors ${
                    isActive
                      ? 'text-ink font-bold'
                      : 'text-slate hover:text-ink hover:bg-paper/80 rounded-[4px]'
                  }`}
                >
                  {tab.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Quick Role Switcher + Notification Bell + Avatar Dropdown */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Instant Role Switcher Button */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleRoleSwitch(isAdmin ? 'employee' : 'admin')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-paper border border-border text-[11px] font-mono-ledger text-ink hover:border-amber transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Switch between Admin and Employee view"
          >
            <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-rose animate-spin' : 'bg-amber animate-pulse'}`} />
            <span>{isPending ? 'Switching View...' : `Switch to ${isAdmin ? 'Employee' : 'Admin'}`}</span>
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="p-2 text-slate hover:text-ink rounded-[6px] hover:bg-paper relative focus:outline-none focus:ring-2 focus:ring-amber"
            title="Notifications"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full" />
          </button>

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-[6px] hover:bg-paper focus:outline-none focus:ring-2 focus:ring-amber transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-heading font-medium text-xs">
                {userProfile?.full_name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-ink leading-none">
                  {userProfile?.full_name || 'User'}
                </span>
                <span className="font-mono-ledger text-[10px] text-slate mt-0.5 capitalize">
                  {userProfile?.role || 'employee'}
                </span>
              </div>
              <svg className="w-4 h-4 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-surface border border-border rounded-[8px] py-1.5 shadow-lg z-50 animate-in fade-in-50 duration-100">
                <div className="px-3.5 py-2.5 border-b border-border bg-paper/50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink">{userProfile?.full_name}</p>
                    <span className="text-[9px] font-mono-ledger uppercase px-1.5 py-0.5 rounded bg-ink text-amber font-bold">
                      {userProfile?.role}
                    </span>
                  </div>
                  <p className="font-mono-ledger text-[11px] text-slate truncate mt-0.5">{userProfile?.email}</p>
                  <p className="font-mono-ledger text-[10px] text-amber mt-0.5 font-medium">{userProfile?.login_id}</p>
                </div>

                <div className="py-1">
                  <Link
                    href={`/employees/${userProfile?.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink hover:bg-paper transition-colors"
                  >
                    <span>📇</span>
                    My Profile
                  </Link>

                  <Link
                    href="/time-off"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink hover:bg-paper transition-colors"
                  >
                    <span>🌴</span>
                    Leave Balances
                  </Link>

                  <Link
                    href="/payroll"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink hover:bg-paper transition-colors"
                  >
                    <span>💰</span>
                    Payroll & Payslips
                  </Link>
                </div>

                <div className="border-t border-border pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false)
                      signOutUser()
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose hover:bg-rose/10 transition-colors flex items-center gap-2"
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate hover:text-ink rounded-[6px] hover:bg-paper focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-2">
          <div className="pb-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">{userProfile?.full_name} ({userProfile?.role})</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setMobileMenuOpen(false)
                handleRoleSwitch(isAdmin ? 'employee' : 'admin')
              }}
              className="text-[11px] font-mono-ledger text-amber underline font-semibold"
            >
              Switch to {isAdmin ? 'Employee' : 'Admin'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 pt-1">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-[4px] text-xs font-semibold ${
                    isActive ? 'bg-ink text-amber' : 'text-slate hover:bg-paper'
                  }`}
                >
                  {tab.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
