import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'

export type SearchResult = {
  id: string
  name: string
  location: string
  province: string
  average_rating: number
  total_reviews: number
  relevance_score: number
}

export function useCourseSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  useEffect(() => {
    const performSearch = async () => {
      // Clear results and error for empty searches
      if (!debouncedSearchTerm || debouncedSearchTerm.trim().length === 0) {
        setResults([])
        setError(null)
        return
      }
      
      // Don't search for very short terms
      if (debouncedSearchTerm.trim().length < 2) {
        setResults([])
        setError(null)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/search/courses?q=${encodeURIComponent(debouncedSearchTerm)}`)
        
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
  }, [debouncedSearchTerm])
  
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