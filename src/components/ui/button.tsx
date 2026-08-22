"use client"

import { ReactNode } from "react"

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost"
  className?: string
  children: ReactNode
  disabled?: boolean
}

export function Button({ variant = "primary", className, children, disabled = false }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2"

  const variantClasses = {
    primary: "bg-ink text-white hover:bg-slate disabled:opacity-50",
    secondary: "border border-ink text-ink hover:bg-surface disabled:opacity-50",
    ghost: "transparent hover:bg-surface/50 disabled:opacity-50",
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}