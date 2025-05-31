import { MainNav } from "@/components/layout/main-nav"
import { Footer } from "@/components/layout/footer"
import type { ReactNode } from "react"

export default function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
