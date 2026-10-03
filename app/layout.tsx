import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "I-Manage — by Siemax Ltd",
    template: "%s | I-Manage",
  },
  description:
    "I-Manage by Siemax Ltd — modern property management for landlords and tenants. Track properties, rent, expenses, maintenance, and documents in one place.",
  applicationName: "I-Manage",
  authors: [
    {
      name: "Brian Kiarie",
      url: "https://www.linkedin.com/in/brian-kiarie-00b3a3391",
    },
  ],
  creator: "Brian Kiarie",
  publisher: "Siemax Ltd",
  keywords: [
    "property management",
    "rental management",
    "landlord software",
    "tenant portal",
    "M-Pesa rent",
    "I-Manage",
    "Siemax",
  ],
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased dark">
      <body className="font-sans">{children}</body>
    </html>
  )
}
