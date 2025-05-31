"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/common/star-rating"
import { MapPinIcon, SearchIcon } from "lucide-react"
import { SearchResult } from "@/hooks/use-course-search"

interface SearchResultsDropdownProps {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  onResultClick?: () => void
  onViewAllResults?: () => void
}

export function SearchResultsDropdown({
  results,
  isLoading,
  error,
  searchTerm,
  onResultClick,
  onViewAllResults
}: SearchResultsDropdownProps) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return null
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 p-2 max-h-80 overflow-y-auto shadow-lg z-50 bg-background border">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SearchIcon className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Searching courses...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No courses found for "{searchTerm}"
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching for a course name, city, or province
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {results.slice(0, 8).map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                onClick={onResultClick}
                className="block p-2 hover:bg-muted rounded-md transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{course.name}</h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {course.location}{course.province ? `, ${course.province}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center ml-2 flex-shrink-0">
                    <StarRating rating={course.average_rating} />
                    <span className="text-xs text-muted-foreground ml-1">
                      ({course.total_reviews})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {results.length > 8 && (
            <div className="border-t pt-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={onViewAllResults}
              >
                View all {results.length} results
              </Button>
            </div>
          )}
          
          {results.length <= 8 && results.length > 3 && (
            <div className="border-t pt-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={onViewAllResults}
              >
                View search results
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  )
} 