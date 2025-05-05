import type React from "react"
import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
