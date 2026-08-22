import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dayflow HRMS",
  description: "Human Resource Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="className:bg-paper">
        {children}
      </body>
    </html>
  )
}