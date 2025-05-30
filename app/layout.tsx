import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chess Tutor",
  description: "Learn chess with AI assistance",
  creator: "Adityaa Mehra",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          <Navigation />
            <main className="flex-1 bg-cover bg-center" style={{ backgroundImage: "url('/main_bg.avif')" }}>
            {children}
            </main>
        </div>
      </body>
    </html>
  )
}



import './globals.css'