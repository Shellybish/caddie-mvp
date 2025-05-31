import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FilterState } from '@/components/courses/course-filters'

export function useCourseFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Initialize filter state from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    province: searchParams.get('province') || '',
    minRating: parseInt(searchParams.get('minRating') || '0')
  })
  
  // Update filters and URL
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams)
    
    // Handle province filter
    if (newFilters.province) {
      params.set('province', newFilters.province)
    } else {
      params.delete('province')
    }
    
    // Handle rating filter
    if (newFilters.minRating > 0) {
      params.set('minRating', newFilters.minRating.toString())
    } else {
      params.delete('minRating')
    }
    
    // Update URL without causing navigation
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [searchParams])
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: FilterState = {
      province: '',
      minRating: 0
    }
    updateFilters(clearedFilters)
  }, [updateFilters])
  
  // Check if any filters are active
  const hasActiveFilters = filters.province !== '' || filters.minRating > 0
  
  // Get filter query string for API calls
  const getFilterParams = useCallback(() => {
    const params = new URLSearchParams()
    
    if (filters.province) {
      params.set('province', filters.province)
    }
    
    if (filters.minRating > 0) {
      params.set('minRating', filters.minRating.toString())
    }
    
    return params.toString()
  }, [filters])
  
  // Sync with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlProvince = searchParams.get('province') || ''
    const urlMinRating = parseInt(searchParams.get('minRating') || '0')
    
    if (urlProvince !== filters.province || urlMinRating !== filters.minRating) {
      setFilters({
        province: urlProvince,
        minRating: urlMinRating
      })
    }
  }, [searchParams, filters.province, filters.minRating])
  
  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    getFilterParams
  }
} 