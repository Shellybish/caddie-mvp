import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const province = searchParams.get('province')
    const minRatingParam = searchParams.get('minRating')
    const sortParam = searchParams.get('sort') || 'rating_desc'
    const minRating = minRatingParam ? parseInt(minRatingParam) : 0
    
    // Check if we have any meaningful search criteria
    const hasSearchQuery = query && query.trim().length > 0
    const hasProvinceFilter = province && province.trim() !== ''
    const hasRatingFilter = minRating > 0
    
    // If no search query and no filters, return empty array
    // This prevents returning all courses when searching for empty/whitespace terms
    if (!hasSearchQuery && !hasProvinceFilter && !hasRatingFilter) {
      return NextResponse.json([])
    }
    
    // Start building the query
    let queryBuilder = supabase
      .from('courses')
      .select(`
        id,
        name,
        location,
        province,
        description,
        created_at
      `)
    
    // Apply search filter if query exists
    if (hasSearchQuery) {
      const searchTerm = query.trim().toLowerCase()
      queryBuilder = queryBuilder.or(
        `name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,province.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
    }
    
    // Apply province filter
    if (hasProvinceFilter) {
      queryBuilder = queryBuilder.eq('province', province)
    }
    
    // Execute the query
    const { data, error } = await queryBuilder.limit(50) // Increased limit for filtering
    
    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Failed to search courses' },
        { status: 500 }
      )
    }
    
    // Get average ratings and review counts for each course
    const enhancedResults = await Promise.all(
      (data || []).map(async (course) => {
        try {
          // Get average rating
          const { data: ratingData } = await supabase
            .from('course_reviews')
            .select('rating')
            .eq('course_id', course.id)
            .gt('rating', 0) // Only include actual ratings (not 0 = played without rating)
          
          const ratings = ratingData || []
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length
            : 0
          
          // Calculate relevance score for search queries only
          let relevanceScore = 0
          
          if (hasSearchQuery) {
            const searchTerm = query.trim().toLowerCase()
            const lowerName = course.name.toLowerCase()
            const lowerLocation = course.location?.toLowerCase() || ''
            const lowerProvince = course.province?.toLowerCase() || ''
            const lowerDescription = course.description?.toLowerCase() || ''
            
            // Exact matches get highest score
            if (lowerName === searchTerm) relevanceScore += 100
            else if (lowerLocation === searchTerm) relevanceScore += 90
            else if (lowerProvince === searchTerm) relevanceScore += 80
            
            // Starts with matches get medium-high score
            if (lowerName.startsWith(searchTerm)) relevanceScore += 50
            else if (lowerLocation.startsWith(searchTerm)) relevanceScore += 40
            else if (lowerProvince.startsWith(searchTerm)) relevanceScore += 30
            
            // Contains matches get lower score
            if (lowerName.includes(searchTerm)) relevanceScore += 20
            if (lowerLocation.includes(searchTerm)) relevanceScore += 15
            if (lowerProvince.includes(searchTerm)) relevanceScore += 10
            if (lowerDescription.includes(searchTerm)) relevanceScore += 5
          }
          
          return {
            id: course.id,
            name: course.name,
            location: course.location,
            province: course.province,
            created_at: course.created_at,
            average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            total_reviews: ratings.length,
            relevance_score: relevanceScore
          }
        } catch (err) {
          console.error(`Error processing course ${course.id}:`, err)
          return {
            id: course.id,
            name: course.name,
            location: course.location,
            province: course.province,
            created_at: course.created_at,
            average_rating: 0,
            total_reviews: 0,
            relevance_score: 0
          }
        }
      })
    )
    
    // Apply rating filter after calculating averages
    let filteredResults = enhancedResults
    if (minRating > 0) {
      filteredResults = enhancedResults.filter(course => course.average_rating >= minRating)
    }
    
    // Apply sorting based on sort parameter
    let sortedResults = [...filteredResults]
    
    switch (sortParam) {
      case 'rating_desc':
        sortedResults.sort((a, b) => {
          if (a.average_rating === b.average_rating) {
            return a.name.localeCompare(b.name)
          }
          return b.average_rating - a.average_rating
        })
        break
        
      case 'rating_asc':
        sortedResults.sort((a, b) => {
          if (a.average_rating === b.average_rating) {
            return a.name.localeCompare(b.name)
          }
          return a.average_rating - b.average_rating
        })
        break
        
      case 'name_asc':
        sortedResults.sort((a, b) => a.name.localeCompare(b.name))
        break
        
      case 'name_desc':
        sortedResults.sort((a, b) => b.name.localeCompare(a.name))
        break
        
      case 'created_desc':
        sortedResults.sort((a, b) => {
          const aDate = new Date(a.created_at || 0)
          const bDate = new Date(b.created_at || 0)
          if (aDate.getTime() === bDate.getTime()) {
            return a.name.localeCompare(b.name)
          }
          return bDate.getTime() - aDate.getTime()
        })
        break
        
      case 'review_count_desc':
        sortedResults.sort((a, b) => {
          if (a.total_reviews === b.total_reviews) {
            return a.name.localeCompare(b.name)
          }
          return b.total_reviews - a.total_reviews
        })
        break
        
      default:
        // For search queries, fall back to relevance score
        if (hasSearchQuery) {
          sortedResults.sort((a, b) => b.relevance_score - a.relevance_score)
        } else {
          // For filter-only queries, default to rating_desc
          sortedResults.sort((a, b) => {
            if (a.average_rating === b.average_rating) {
              return a.name.localeCompare(b.name)
            }
            return b.average_rating - a.average_rating
          })
        }
        break
    }
    
    // Limit final results for search queries, but allow more for filter-only requests
    const finalLimit = query && query.trim().length > 0 ? 10 : 20
    const finalResults = sortedResults.slice(0, finalLimit)
    
    return NextResponse.json(finalResults)
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 