"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StarRating } from "@/components/common/star-rating"
import { MapPinIcon, SearchIcon } from "lucide-react"
import { getAllCourses, getCourseReviews, getCourseAverageRating } from "@/lib/api/courses"
import { useCourseSearch } from "@/hooks/use-course-search"
import { useCourseFilters } from "@/hooks/use-course-filters"
import { CourseFilters } from "@/components/courses/course-filters"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"

type CourseWithRating = {
  id: string
  name: string
  location: string
  province: string
  rating: number
  reviewCount: number
  image: string
  address?: string
  description?: string
  latitude?: number
  longitude?: number
  phone?: string
  website?: string
  created_at: string
  postal_code?: number
  email?: string
  num_holes?: number
  designer?: string
  year_established?: number
  green_fee_range?: string
  slope_rating?: number
  course_code?: string
  municipality?: string
}

export default function CoursesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [allCourses, setAllCourses] = useState<CourseWithRating[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Get search term from URL parameters
  const urlSearchTerm = searchParams.get('search') || ''
  
  // Use the filter hooks
  const { filters, updateFilters, clearFilters, hasActiveFilters } = useCourseFilters()
  
  // Use the course search hook with filter integration
  const {
    searchTerm,
    setSearchTerm,
    results,
    isLoading: isSearching,
    error: searchError,
    clearSearch,
    hasResults,
    isEmpty
  } = useCourseSearch(filters)

  // Load all courses and available provinces on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingCourses(true)
        
        // Load courses and provinces in parallel
        const [coursesData, provincesResponse] = await Promise.all([
          getAllCourses(),
          fetch('/api/courses/provinces')
        ])
        
        // Process courses with ratings
        const enhancedCourses = await Promise.all(
          coursesData.map(async (course) => {
            try {
              const reviews = await getCourseReviews(course.id)
              const avgRating = await getCourseAverageRating(course.id)
              return {
                ...course,
                rating: avgRating,
                reviewCount: reviews.length,
                image: "/placeholder.svg?height=200&width=400" // Placeholder image until we have real images
              }
            } catch (error) {
              // Return default values if there's an error
              return {
                ...course,
                rating: 0,
                reviewCount: 0,
                image: "/placeholder.svg?height=200&width=400"
              }
            }
          })
        )
        
        setAllCourses(enhancedCourses)
        
        // Process provinces
        if (provincesResponse.ok) {
          const provincesData = await provincesResponse.json()
          setAvailableProvinces(provincesData)
        }
        
      } catch (err) {
        console.error('Error loading initial data:', err)
        setError('Failed to load courses. Please try again.')
      } finally {
        setIsLoadingCourses(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Set search term from URL parameters
  useEffect(() => {
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm)
    }
  }, [urlSearchTerm, setSearchTerm])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Update URL with search parameter
    const params = new URLSearchParams(searchParams)
    if (value.trim()) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    
    // Update URL without causing navigation
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }

  // Memoize clear search handler to prevent unnecessary re-renders
  const handleClearSearch = useCallback(() => {
    clearSearch()
    clearFilters() // Also clear filters when clearing search
    // Clear URL parameters
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.delete('province')
    params.delete('minRating')
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [clearSearch, clearFilters, searchParams])

  // Filter all courses based on current filters when not searching
  const getFilteredCourses = () => {
    if (hasResults) {
      // Convert search results to CourseWithRating format
      return results.map(result => {
        const fullCourse = allCourses.find(course => course.id === result.id)
        return fullCourse ? {
          ...fullCourse,
          rating: result.average_rating,
          reviewCount: result.total_reviews
        } : {
          id: result.id,
          name: result.name,
          location: result.location,
          province: result.province,
          rating: result.average_rating,
          reviewCount: result.total_reviews,
          image: "/placeholder.svg?height=200&width=400",
          created_at: new Date().toISOString()
        } as CourseWithRating
      })
    }
    
    // Apply filters to all courses when not searching
    if (!searchTerm && hasActiveFilters) {
      return allCourses.filter(course => {
        const provinceMatch = !filters.province || course.province === filters.province
        const ratingMatch = !filters.minRating || course.rating >= filters.minRating
        return provinceMatch && ratingMatch
      })
    }
    
    return allCourses
  }

  const coursesToDisplay = getFilteredCourses()
  const showNoResults = ((hasActiveFilters || !isEmpty) && !isSearching && coursesToDisplay.length === 0)
  const showLoading = isLoadingCourses || isSearching

  // Generate results description
  const getResultsDescription = () => {
    if (hasResults) {
      return `Found ${results.length} course${results.length === 1 ? '' : 's'} matching "${searchTerm}"`
    }
    
    if (hasActiveFilters && !searchTerm) {
      let description = `Showing ${coursesToDisplay.length} course${coursesToDisplay.length === 1 ? '' : 's'}`
      if (filters.province) {
        description += ` in ${filters.province}`
      }
      if (filters.minRating > 0) {
        description += ` with ${filters.minRating}+ star${filters.minRating === 1 ? '' : 's'}`
      }
      return description
    }
    
    return 'Discover and explore golf courses across South Africa'
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Golf Courses</h1>
          <p className="text-muted-foreground">
            {getResultsDescription()}
          </p>
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1 md:w-[300px]">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              className="pl-9"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <CourseFilters
            isOpen={isFiltersOpen}
            onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            availableProvinces={availableProvinces}
          />
        </div>
      </div>

      {/* Error State */}
      {(error || searchError) && (
        <div className="text-center py-8">
          <p className="text-destructive">{error || searchError}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {showLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isLoadingCourses ? 'Loading courses...' : 'Searching...'}
          </p>
        </div>
      )}

      {/* No Results State */}
      {showNoResults && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">
            {searchTerm ? `No courses found for "${searchTerm}"` : 'No courses match the selected filters'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'Try searching for a course name, city, or province' : 'Try adjusting your filters or search criteria'}
          </p>
          <Button variant="outline" className="mt-4" onClick={handleClearSearch}>
            {searchTerm ? 'Clear Search' : 'Clear Filters'}
          </Button>
        </div>
      )}

      {/* Courses Grid */}
      {!showLoading && !error && !searchError && coursesToDisplay.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesToDisplay.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img src={course.image || "/placeholder.svg"} alt={course.name} className="object-cover w-full h-full" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium line-clamp-1">{course.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                          <span>{course.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <StarRating rating={course.rating} />
                        <span className="text-sm text-muted-foreground ml-1">({course.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/courses/${course.id}`}>View Details</Link>
                      </Button>
                      <Button asChild size="sm" className="btn-navy">
                        <Link href={`/courses/${course.id}/log`}>Log Play</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button - Only show for unfiltered courses when no search/filters */}
          {!hasResults && !hasActiveFilters && (
            <div className="flex justify-center mt-8">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
