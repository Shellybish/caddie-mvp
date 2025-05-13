import { NextResponse } from 'next/server'
import { getCourseById } from '@/lib/api/courses'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fix for Next.js warning about using params synchronously 
    const resolvedParams = await Promise.resolve(params)
    const courseId = resolvedParams.id
    const course = await getCourseById(courseId)
    
    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
} 