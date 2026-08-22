"use client"

import { ReactNode } from "react"

export interface InputProps {
  type?: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
}

export function Input({ type = "text", placeholder, value, onChange, disabled = false, className }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 bg-transparent border border-border rounded-md text-ink placeholder-slate focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent transition-colors ${className}`}
    />
  )
}