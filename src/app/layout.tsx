import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { checkSupabaseConnection, checkSupabaseSchema } from "@/lib/supabase/client"

const inter = Inter({ subsets: ["latin"] })

// Verify Supabase connection on app initialization (in development)
async function verifySupabaseSetup() {
  // Check connection
  const result = await checkSupabaseConnection()
  
  if (result.connected) {
    // If connected, also check schema
    const schemaResult = await checkSupabaseSchema()
    
    if (schemaResult.success) {
      // Schema is good
    } else {
      console.error("❌ Database schema issue:", schemaResult.error)
      console.warn("You may need to create the profiles table:")
      console.warn(`
        CREATE TABLE profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          username TEXT UNIQUE,
          full_name TEXT,
          location TEXT,
          bio TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
    }
  } else {
    console.error("❌ Failed to connect to Supabase:", result.error)
    console.warn("Please check your Supabase setup including:")
    console.warn("- Environment variables in .env.local")
    console.warn("- Supabase project configuration")
    console.warn("- Database tables and schemas")
  }
}

// Only run verification in development
if (process.env.NODE_ENV === 'development') {
  verifySupabaseSetup()
}

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontSerif = Inter({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400", // Inter only has 400 weight
})

export const metadata: Metadata = {
  title: "Caddie - Golf Course Reviews & Social Platform",
  description: "Discover, review, and share your favorite golf courses with the Caddie community.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontSerif.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
