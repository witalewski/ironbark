import type { Metadata, Viewport } from "next"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Navigation from "@/components/Navigation"
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: "IRONBARK",
  description: "Exercise tracking app",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <html lang="en">
      <body className="bg-black text-white font-mono min-h-screen">
        <SessionProvider session={session}>
          <main className="max-w-lg mx-auto pb-20 min-h-screen">
            {children}
          </main>
          {session && <Navigation />}
        </SessionProvider>
      </body>
    </html>
  )
}
