"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/common/star-rating"
import { 
  SearchIcon, 
  MapPinIcon, 
  UserIcon, 
  ListIcon,
  ClubIcon as GolfIcon,
  BookOpenIcon,
  FilterIcon
} from "lucide-react"
import { useUnifiedSearch } from "@/hooks/use-unified-search"
import { cn } from "@/lib/utils"

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialFilter = searchParams.get('filter') || 'all'
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState<'all' | 'courses' | 'users' | 'lists'>(
    initialFilter as 'all' | 'courses' | 'users' | 'lists'
  )
  
  const { 
    searchTerm, 
    setSearchTerm, 
    results, 
    isLoading, 
    error 
  } = useUnifiedSearch()

  // Update search term when component mounts or query changes
  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery)
      setSearchQuery(initialQuery)
    }
  }, [initialQuery, setSearchTerm])

  // Update URL when filter changes
  const handleFilterChange = (filter: 'all' | 'courses' | 'users' | 'lists') => {
    setActiveFilter(filter)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (filter !== 'all') params.set('filter', filter)
    
    router.push(`/search?${params.toString()}`, { scroll: false })
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchTerm(searchQuery.trim())
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      if (activeFilter !== 'all') params.set('filter', activeFilter)
      
      router.push(`/search?${params.toString()}`, { scroll: false })
    }
  }

  const filters = [
    { 
      key: 'all' as const, 
      label: 'All', 
      count: results.courses.length + results.users.length + results.lists.length,
      icon: SearchIcon
    },
    { 
      key: 'courses' as const, 
      label: 'Courses', 
      count: results.courses.length,
      icon: GolfIcon
    },
    { 
      key: 'users' as const, 
      label: 'Users', 
      count: results.users.length,
      icon: UserIcon
    },
    { 
      key: 'lists' as const, 
      label: 'Lists', 
      count: results.lists.length,
      icon: ListIcon
    }
  ]

  const getFilteredResults = () => {
    switch (activeFilter) {
      case 'courses':
        return results.courses
      case 'users':
        return results.users
      case 'lists':
        return results.lists
      default:
        return [
          ...results.courses,
          ...results.users,
          ...results.lists
        ]
    }
  }

  const filteredResults = getFilteredResults()

  return (
    <div className="container py-6 md:py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Search</h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for courses, users, or lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Show results only if there's a search term */}
      {searchTerm && (
        <>
          {/* Results Header & Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isLoading ? 'Searching...' : `Results for "${searchTerm}"`}
              </h2>
              {!isLoading && filteredResults.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FilterIcon className="h-4 w-4" />
                  <span>{filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filters.map((filter) => {
                const Icon = filter.icon
                return (
                  <Button
                    key={filter.key}
                    variant={activeFilter === filter.key ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap",
                      activeFilter === filter.key && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleFilterChange(filter.key)}
                  >
                    <Icon className="h-4 w-4" />
                    {filter.label}
                    {!isLoading && (
                      <Badge variant={activeFilter === filter.key ? "secondary" : "outline"} className="ml-1">
                        {filter.count}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Results Content */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-muted rounded-md" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Search Error</h3>
                  <p className="text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            ) : filteredResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    No {activeFilter === 'all' ? 'results' : activeFilter} found for "{searchTerm}"
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => handleFilterChange('all')}
                    className="mr-2"
                  >
                    Show all results
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      setSearchTerm('')
                      router.push('/search')
                    }}
                  >
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredResults.map((result) => (
                  <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State - No Search Query */}
      {!searchTerm && (
        <Card>
          <CardContent className="p-12 text-center">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-xl font-semibold mb-2">Search Everything</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Search across golf courses, users, and curated lists to discover your next great round.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <GolfIcon className="h-4 w-4 text-primary" />
                <span>Golf Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                <span>Users</span>
              </div>
              <div className="flex items-center gap-2">
                <ListIcon className="h-4 w-4 text-primary" />
                <span>Lists</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SearchResultCard({ result }: { result: any }) {
  if (result.type === 'course') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <Link href={`/courses/${result.id}`} className="block">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                <GolfIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{result.name}</h3>
                  {result.average_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <StarRating rating={result.average_rating} />
                      <span className="text-sm text-muted-foreground">
                        ({result.total_reviews} reviews)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{result.location}, {result.province}</span>
                </div>
              </div>
              <Badge variant="outline">Course</Badge>
            </div>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (result.type === 'user') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <Link href={`/user/${result.username}`} className="block">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={result.avatar_url || "/placeholder.svg"} alt={result.username} />
                <AvatarFallback>
                  {result.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">@{result.username}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span>User profile</span>
                </div>
              </div>
              <Badge variant="outline">User</Badge>
            </div>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (result.type === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <Link href={`/lists/${result.id}`} className="block">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{result.title}</h3>
                  <Badge variant="secondary">
                    {result.course_count} courses
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2 line-clamp-2">
                  {result.description || 'No description available'}
                </p>
                <div className="text-sm text-muted-foreground">
                  by {result.author_name}
                </div>
              </div>
              <Badge variant="outline">List</Badge>
            </div>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return null
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container py-6 md:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-4" />
          <div className="h-12 bg-muted rounded max-w-2xl" />
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
} 