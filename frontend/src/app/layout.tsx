import type { Metadata } from "next"
import { Geist, Young_Serif } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["300", "400", "500", "600", "700"],
})

const youngSerif = Young_Serif({
  subsets: ["latin"],
  variable: "--font-young-serif",
  weight: ["400"],
})

export const metadata: Metadata = {
  title:       "BharatZero — CBAM Carbon Calculator for Indian Exporters",
  description: "Calculate your Scope 1 & 2 carbon emissions and check EU CBAM compliance in 60 seconds. Built for Indian MSMEs.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geist.variable} ${youngSerif.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
