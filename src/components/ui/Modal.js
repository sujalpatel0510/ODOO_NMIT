'use client'

import { useEffect } from 'react'

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Flat Scrim - No blur per Ledger spec */}
      <div
        className="fixed inset-0 bg-ink/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidth} bg-surface border border-border rounded-[8px] p-6 shadow-none z-10`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between pb-4 border-b border-border mb-5">
          <div>
            <h3 className="font-heading text-lg font-semibold text-ink">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate hover:text-ink text-lg leading-none p-1 rounded hover:bg-paper focus:outline-none focus:ring-2 focus:ring-amber"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  )
}
