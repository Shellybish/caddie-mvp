import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

export type SortOption = 
  | 'rating_desc'    // Best Rated (High to Low)
  | 'rating_asc'     // Rating (Low to High)
  | 'name_asc'       // Name (A-Z)
  | 'name_desc'      // Name (Z-A)
  | 'created_desc'   // Newest
  | 'review_count_desc' // Most Reviews

export interface SortState {
  sortBy: SortOption
}

export const SORT_OPTIONS = [
  { value: 'rating_desc' as SortOption, label: 'Best Rated' },
  { value: 'name_asc' as SortOption, label: 'Name (A-Z)' },
  { value: 'name_desc' as SortOption, label: 'Name (Z-A)' },
  { value: 'rating_asc' as SortOption, label: 'Lowest Rated' },
  { value: 'review_count_desc' as SortOption, label: 'Most Reviews' },
  { value: 'created_desc' as SortOption, label: 'Recently Added' },
]

export function useCourseSort() {
  const searchParams = useSearchParams()
  
  // Initialize sort state from URL parameters, default to rating_desc (Best Rated)
  const [sortState, setSortState] = useState<SortState>({
    sortBy: (searchParams.get('sort') as SortOption) || 'rating_desc'
  })
  
  // Update sort and URL
  const updateSort = useCallback((newSort: SortOption) => {
    setSortState({ sortBy: newSort })
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams)
    
    // Always set sort parameter (don't delete even for default)
    params.set('sort', newSort)
    
    // Update URL without causing navigation
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [searchParams])
  
  // Get sort query parameter for API calls
  const getSortParam = useCallback(() => {
    return sortState.sortBy
  }, [sortState.sortBy])
  
  // Get sort display label
  const getSortLabel = useCallback(() => {
    const option = SORT_OPTIONS.find(opt => opt.value === sortState.sortBy)
    return option?.label || 'Best Rated'
  }, [sortState.sortBy])
  
  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlSort = (searchParams.get('sort') as SortOption) || 'rating_desc'
    
    if (urlSort !== sortState.sortBy) {
      setSortState({ sortBy: urlSort })
    }
  }, [searchParams, sortState.sortBy])
  
  // Sort courses client-side (for non-API results)
  const sortCourses = useCallback((courses: any[]) => {
    const sorted = [...courses]
    
    switch (sortState.sortBy) {
      case 'rating_desc':
        return sorted.sort((a, b) => {
          // Handle courses with no ratings
          const aRating = a.rating || a.average_rating || 0
          const bRating = b.rating || b.average_rating || 0
          if (aRating === bRating) {
            // Secondary sort by name for consistent ordering
            return a.name.localeCompare(b.name)
          }
          return bRating - aRating
        })
      
      case 'rating_asc':
        return sorted.sort((a, b) => {
          const aRating = a.rating || a.average_rating || 0
          const bRating = b.rating || b.average_rating || 0
          if (aRating === bRating) {
            return a.name.localeCompare(b.name)
          }
          return aRating - bRating
        })
      
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      
      case 'created_desc':
        return sorted.sort((a, b) => {
          const aDate = new Date(a.created_at || 0)
          const bDate = new Date(b.created_at || 0)
          if (aDate.getTime() === bDate.getTime()) {
            return a.name.localeCompare(b.name)
          }
          return bDate.getTime() - aDate.getTime()
        })
      
      case 'review_count_desc':
        return sorted.sort((a, b) => {
          const aCount = a.reviewCount || a.total_reviews || 0
          const bCount = b.reviewCount || b.total_reviews || 0
          if (aCount === bCount) {
            return a.name.localeCompare(b.name)
          }
          return bCount - aCount
        })
      
      default:
        return sorted
    }
  }, [sortState.sortBy])
  
  return {
    sortState,
    updateSort,
    getSortParam,
    getSortLabel,
    sortCourses,
    currentSort: sortState.sortBy
  }
} 