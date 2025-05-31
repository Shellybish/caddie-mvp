import { NextResponse } from 'next/server'
import { addBucketListCourse, removeBucketListCourse, getBucketListCourses } from '@/lib/api/profiles'
import { cookies } from 'next/headers'
import { getUserIdFromCookies } from '@/lib/auth/session'

// Add course to bucket list
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fix for Next.js warning about using params synchronously
    const resolvedParams = await Promise.resolve(params)
    const courseId = resolvedParams.id
    
    // Get user ID from cookies
    const cookieStore = cookies()
    const userId = await getUserIdFromCookies(cookieStore)
    
    // Return error if user is not authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // Add course to bucket list
    const result = await addBucketListCourse(userId, courseId)
    
    return NextResponse.json({
      success: true,
      message: "Course added to bucket list successfully",
      data: result
    })
  } catch (error) {
    console.error("Error adding course to bucket list:", error)
    
    return NextResponse.json(
      { error: "Failed to add course to bucket list" },
      { status: 500 }
    )
  }
}

// Remove course from bucket list
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fix for Next.js warning about using params synchronously
    const resolvedParams = await Promise.resolve(params)
    const courseId = resolvedParams.id
    
    // Get user ID from cookies
    const cookieStore = cookies()
    const userId = await getUserIdFromCookies(cookieStore)
    
    // Return error if user is not authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // Remove course from bucket list
    const result = await removeBucketListCourse(userId, courseId)
    
    return NextResponse.json({
      success: true,
      message: "Course removed from bucket list successfully",
      data: result
    })
  } catch (error) {
    console.error("Error removing course from bucket list:", error)
    
    return NextResponse.json(
      { error: "Failed to remove course from bucket list" },
      { status: 500 }
    )
  }
}

// Check if course is in bucket list
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fix for Next.js warning about using params synchronously
    const resolvedParams = await Promise.resolve(params)
    const courseId = resolvedParams.id
    
    // Get user ID from cookies
    const cookieStore = cookies()
    const userId = await getUserIdFromCookies(cookieStore)
    
    // Return error if user is not authenticated
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    // Get bucket list and check if course is in it
    const bucketList = await getBucketListCourses(userId)
    const isInBucketList = bucketList.some(item => item.course_id === courseId)
    
    return NextResponse.json({
      success: true,
      inBucketList: isInBucketList
    })
  } catch (error) {
    console.error("Error checking bucket list status:", error)
    
    return NextResponse.json(
      { error: "Failed to check bucket list status" },
      { status: 500 }
    )
  }
} 