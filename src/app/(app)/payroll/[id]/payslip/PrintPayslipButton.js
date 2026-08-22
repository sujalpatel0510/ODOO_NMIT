'use client'

import Button from '../../../../../components/ui/Button'

export default function PrintPayslipButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button
      variant="amber"
      size="sm"
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      <span>Print / Save PDF</span>
    </Button>
  )
}
