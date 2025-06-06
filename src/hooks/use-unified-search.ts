import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { searchUsersByUsername } from '@/lib/api/profiles'

export interface CourseSearchResult {
  type: 'course'
  id: string
  name: string
  location: string
  province: string
  created_at: string
  average_rating: number
  total_reviews: number
  relevance_score: number
}

export interface UserSearchResult {
  type: 'user'
  id: string
  user_id: string
  username: string
  avatar_url?: string
}

export interface ListSearchResult {
  type: 'list'
  id: string
  title: string
  description: string
  is_public: boolean
  user_id: string
  created_at: string
  course_count: number
  author_name?: string
}

export type UnifiedSearchResult = CourseSearchResult | UserSearchResult | ListSearchResult

export interface UnifiedSearchResults {
  courses: CourseSearchResult[]
  users: UserSearchResult[]
  lists: ListSearchResult[]
  all: UnifiedSearchResult[]
}

export function useUnifiedSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<UnifiedSearchResults>({
    courses: [],
    users: [],
    lists: [],
    all: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  useEffect(() => {
    const performSearch = async () => {
      const hasSearchTerm = debouncedSearchTerm && debouncedSearchTerm.trim().length >= 2
      
      // Clear results if no search term
      if (!hasSearchTerm) {
        setResults({
          courses: [],
          users: [],
          lists: [],
          all: []
        })
        setError(null)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const searchQuery = debouncedSearchTerm.trim()
        
        // Search all content types in parallel
        const [coursesResponse, usersData, listsResponse] = await Promise.allSettled([
          // Search courses
          fetch(`/api/search/courses?q=${encodeURIComponent(searchQuery)}`).then(res => {
            if (!res.ok) throw new Error('Course search failed')
            return res.json()
          }),
          // Search users
          searchUsersByUsername(searchQuery, 5),
          // Search lists (we'll need to create this API endpoint)
          fetch(`/api/search/lists?q=${encodeURIComponent(searchQuery)}`).then(res => {
            if (!res.ok) throw new Error('List search failed')
            return res.json()
          }).catch(() => []) // Graceful fallback if lists search doesn't exist yet
        ])
        
        // Process course results
        const courses: CourseSearchResult[] = coursesResponse.status === 'fulfilled' 
          ? (coursesResponse.value || []).map((course: any) => ({
              type: 'course' as const,
              ...course
            }))
          : []
        
        // Process user results
        const users: UserSearchResult[] = usersData.status === 'fulfilled'
          ? (usersData.value || []).map((user: any) => ({
              type: 'user' as const,
              ...user
            }))
          : []
        
        // Process list results
        const lists: ListSearchResult[] = listsResponse.status === 'fulfilled'
          ? (listsResponse.value || []).map((list: any) => ({
              type: 'list' as const,
              ...list
            }))
          : []
        
        // Combine all results
        const all = [
          ...courses.slice(0, 3), // Limit each type in combined view
          ...users.slice(0, 3),
          ...lists.slice(0, 3)
        ]
        
        setResults({
          courses,
          users,
          lists,
          all
        })
        
      } catch (err) {
        console.error('Unified search error:', err)
        setError('Failed to search. Please try again.')
        setResults({
          courses: [],
          users: [],
          lists: [],
          all: []
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    performSearch()
  }, [debouncedSearchTerm])
  
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setResults({
      courses: [],
      users: [],
      lists: [],
      all: []
    })
    setError(null)
  }, [])
  
  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    clearSearch,
    hasResults: results.all.length > 0,
    isEmpty: !searchTerm || searchTerm.trim().length === 0
  }
} 