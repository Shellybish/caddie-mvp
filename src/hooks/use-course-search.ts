import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { SortOption } from './use-course-sort'

export type SearchResult = {
  id: string
  name: string
  location: string
  province: string
  average_rating: number
  total_reviews: number
  relevance_score: number
}

interface SearchOptions {
  province?: string
  minRating?: number
  sort?: SortOption
}

export function useCourseSearch(options?: SearchOptions) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  useEffect(() => {
    const performSearch = async () => {
      const hasSearchTerm = debouncedSearchTerm && debouncedSearchTerm.trim().length >= 2
      const hasFilters = options && (options.province || (options.minRating && options.minRating > 0))
      
      // Clear results if no search term and no filters
      if (!hasSearchTerm && !hasFilters) {
        setResults([])
        setError(null)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Build query parameters
        const params = new URLSearchParams()
        
        if (hasSearchTerm) {
          params.set('q', debouncedSearchTerm.trim())
        }
        
        if (options?.province) {
          params.set('province', options.province)
        }
        
        if (options?.minRating && options.minRating > 0) {
          params.set('minRating', options.minRating.toString())
        }
        
        if (options?.sort) {
          params.set('sort', options.sort)
        }
        
        const response = await fetch(`/api/search/courses?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Search failed')
        }
        
        const data = await response.json()
        setResults(data)
      } catch (err) {
        console.error('Search error:', err)
        setError('Failed to search courses. Please try again.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }
    
    performSearch()
  }, [debouncedSearchTerm, options?.province, options?.minRating, options?.sort])
  
  // Memoize clearSearch to prevent infinite re-renders in components that depend on it
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setResults([])
    setError(null)
  }, [])
  
  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    clearSearch,
    hasResults: results.length > 0,
    isEmpty: !searchTerm || searchTerm.trim().length === 0
  }
} 