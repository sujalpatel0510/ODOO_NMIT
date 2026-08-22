"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

export default function SignInPage() {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signIn({ loginId, password })
    } catch (err) {
      setError("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-8">
      <div className="max-w-md w-full space-y-6 p-8 bg-surface border border-border rounded-md">
        <h2 className="text-2xl font-display font-semibold text-ink">Sign In</h2>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Login ID or Email"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-sm text-slate text-center">
          Forgot password? <a href="#" className="text-amber hover:text-ink">Reset</a>
        </p>
      </div>
    </div>
  )
}