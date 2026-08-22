"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signUp({ email: adminEmail, password: adminPassword, companyName })
      // Redirect to sign in after successful signup
      const signInPath = "/auth/signin"
      const navigate = (window as any).navigate || ((url: string) => {
        window.location.href = url
      })
      navigate(signInPath)
    } catch (err) {
      setError("Failed to create account. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-8">
      <div className="max-w-md w-full space-y-6 p-8 bg-surface border border-border rounded-md">
        <h2 className="text-2xl font-display font-semibold text-ink">Company Sign-Up</h2>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            type="url"
            placeholder="Logo URL (optional)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Admin Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  )
}