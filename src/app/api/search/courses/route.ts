import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    // Handle empty queries gracefully
    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }
    
    const searchTerm = query.trim().toLowerCase()
    
    // Search across course name, city, province, and description
    // Using ILIKE for case-insensitive search with basic relevance scoring
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        name,
        location,
        province,
        description,
        created_at
      `)
      .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,province.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(10)
    
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
          
          const ratings = ratingData || []
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length
            : 0
          
          // Calculate relevance score (exact matches first, then partial)
          let relevanceScore = 0
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
          
          return {
            id: course.id,
            name: course.name,
            location: course.location,
            province: course.province,
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
            average_rating: 0,
            total_reviews: 0,
            relevance_score: 0
          }
        }
      })
    )
    
    // Sort by relevance score (highest first)
    const sortedResults = enhancedResults.sort((a, b) => b.relevance_score - a.relevance_score)
    
    return NextResponse.json(sortedResults)
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 