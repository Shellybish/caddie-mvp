import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/contexts/user-context"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { checkSupabaseConnection, checkSupabaseSchema } from "@/lib/supabase"

// Verify Supabase connection on app initialization (in development)
if (process.env.NODE_ENV === "development") {
  // Check connection
  checkSupabaseConnection().then(result => {
    if (result.connected) {
      console.log("✅ Connected to Supabase database successfully");
      // If connected, also check schema
      checkSupabaseSchema().then(schemaResult => {
        if (schemaResult.success) {
          console.log("✅ Database schema verified");
          console.log("Available tables:", schemaResult.tables);
        } else {
          console.error("❌ Database schema issue:", schemaResult.error);
          console.log("Available tables:", schemaResult.tables);
          console.warn("You may need to create the profiles table:");
          console.warn(`
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
          `);
        }
      });
    } else {
      console.error("❌ Failed to connect to Supabase:", result.error);
      console.warn("Please check your Supabase setup including:");
      console.warn("- Environment variables in .env.local");
      console.warn("- Supabase project configuration");
      console.warn("- Database tables and schemas");
    }
  });
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
  title: "Caddie - Discover, Rate & Review Golf Courses",
  description: "The social platform for golf enthusiasts to discover, rate, review, and share golf courses.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
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
