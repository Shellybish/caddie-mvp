"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
  location: string
  image?: string
}

type UserContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, location: string) => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("courselog-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  // Simulate login
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create mock user
    const mockUser = {
      id: "user1",
      name: email.split("@")[0],
      email,
      location: "Johannesburg, Gauteng",
    }

    // Save to localStorage
    localStorage.setItem("courselog-user", JSON.stringify(mockUser))
    setUser(mockUser)
    setIsLoading(false)
  }

  // Simulate registration
  const register = async (name: string, email: string, password: string, location: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create new user
    const newUser = {
      id: `user${Date.now()}`,
      name,
      email,
      location,
    }

    // Save to localStorage
    localStorage.setItem("courselog-user", JSON.stringify(newUser))
    setUser(newUser)
    setIsLoading(false)
  }

  // Logout
  const logout = () => {
    localStorage.removeItem("courselog-user")
    setUser(null)
  }

  return <UserContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
