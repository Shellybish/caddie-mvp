"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ClubIcon as GolfIcon, MenuIcon, SearchIcon, UserIcon, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useUser } from "@/contexts/user-context"
import { useCourseSearch } from "@/hooks/use-course-search"
import { SearchResultsDropdown } from "@/components/search/search-results-dropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, logout } = useUser()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Use the course search hook
  const {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    clearSearch,
    hasResults
  } = useCourseSearch()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/courses",
      label: "Courses",
      active: pathname === "/courses" || pathname.startsWith("/courses/"),
    },
    {
      href: "/lists",
      label: "Lists",
      active: pathname === "/lists" || pathname.startsWith("/lists/"),
    },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle clicking on a search result
  const handleResultClick = () => {
    setIsSearchOpen(false)
    clearSearch()
  }

  // Handle "View all results" click
  const handleViewAllResults = () => {
    if (searchTerm.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchTerm)}`)
      setIsSearchOpen(false)
      clearSearch()
    }
  }

  // Handle search form submission (Enter key)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchTerm)}`)
      setIsSearchOpen(false)
      clearSearch()
    }
  }

  // Handle closing search
  const handleCloseSearch = () => {
    setIsSearchOpen(false)
    clearSearch()
  }

  // Handle opening search
  const handleOpenSearch = () => {
    setIsSearchOpen(true)
    // Focus the input after the state update
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  // Clear search when navigating away (but only if search is open)
  useEffect(() => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
      clearSearch()
    }
  }, [pathname]) // Remove clearSearch from dependencies to prevent infinite loop

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <GolfIcon className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold">Caddie</span>
            </Link>
            <nav className="flex flex-col gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 mr-6">
          <GolfIcon className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-bold hidden md:inline-block">Caddie</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative flex items-center" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input 
                  ref={inputRef}
                  type="search" 
                  placeholder="Search courses..." 
                  className="w-[200px] md:w-[300px] pr-8" 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  autoFocus 
                />
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full w-8" 
                  onClick={handleCloseSearch}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close search</span>
                </Button>
              </form>
              
              {/* Search Results Dropdown */}
              <SearchResultsDropdown
                results={results}
                isLoading={isLoading}
                error={error}
                searchTerm={searchTerm}
                onResultClick={handleResultClick}
                onViewAllResults={handleViewAllResults}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleOpenSearch}>
              <SearchIcon className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="default">
                <UserIcon className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
