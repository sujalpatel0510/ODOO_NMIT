'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutUser } from '../../app/actions/auth'

export default function TopNav({ userProfile, company }) {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo + Logo Mark */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} Logo`}
                className="w-8 h-8 rounded-[6px] object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-[6px] bg-ink flex items-center justify-center text-amber font-heading font-bold text-sm tracking-wider">
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

          {/* Navigation Tabs with 2px Amber Underline */}
          <nav className="hidden md:flex items-center space-x-1">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(`${tab.href}/`))
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`relative px-3.5 py-5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-ink font-bold'
                      : 'text-slate hover:text-ink'
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

        {/* Right: Notification Bell + Avatar Dropdown */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-slate hover:text-ink rounded-[6px] hover:bg-paper relative focus:outline-none focus:ring-2 focus:ring-amber"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="flex items-center gap-2.5 p-1 rounded-[6px] hover:bg-paper focus:outline-none focus:ring-2 focus:ring-amber transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-heading font-medium text-xs">
                {userProfile?.full_name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
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
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-[8px] py-1.5 shadow-none z-50">
                <div className="px-3.5 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-ink">{userProfile?.full_name}</p>
                  <p className="font-mono-ledger text-[11px] text-slate truncate">{userProfile?.email}</p>
                  <p className="font-mono-ledger text-[10px] text-amber mt-0.5">{userProfile?.login_id}</p>
                </div>

                <Link
                  href={`/employees/${userProfile?.id}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink hover:bg-paper transition-colors"
                >
                  <svg className="w-4 h-4 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>

                <div className="border-t border-border mt-1 pt-1">
                  <form action={signOutUser}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose hover:bg-paper transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
