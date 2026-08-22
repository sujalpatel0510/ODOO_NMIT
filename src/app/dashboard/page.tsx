import "./globals.css"
import Image from "next/image"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { NotificationBell } from "lucide-react"
import { User } from "lucide-react"

interface DashboardProps {
  children: React.ReactNode
}

export function Dashboard({ children }: DashboardProps) {
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
    // Redirect to sign in if not authenticated
    const signInPath = "/auth/signin"
    const navigate = (window as any).navigate || ((url: string) => {
      window.location.href = url
    })
    navigate(signInPath)
    return null
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
            <Avatar user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-paper">
          {children}
        </main>
      </div>
    </div>
  )
}

function Avatar({ user }: { user: any }) {
  return (
    <div>
      <img
        src="/avatar.png"
        alt="User"
        className="h-8 w-8 rounded-full object-cover"
      />
    </div>
  )
}