// Client-side API functions for fetching data

/**
 * Fetch a course by ID (client-side)
 */
export async function fetchCourseById(id: string) {
  try {
    const response = await fetch(`/api/courses/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

/**
 * Log a round of golf (client-side)
 */
export async function logRound(courseId: string, data: { 
  date: Date | string, 
  rating?: number, 
  notes?: string 
}) {
  try {
    // Prepare the data - ensure date is properly formatted
    const formattedData = {
      ...data,
      date: data.date instanceof Date 
        ? data.date.toISOString() 
        : new Date(data.date).toISOString(),
    };
    
    console.log("Logging round with data:", formattedData);
    
    const response = await fetch(`/api/courses/${courseId}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("API error response:", responseData);
      throw new Error(responseData.error || `Failed to log round: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error("Error logging round:", error);
    throw error;
  }
}

/**
 * Submit a course review (client-side)
 */
export async function submitReview(courseId: string, data: {
  rating: number,
  review_text: string,
  date_played?: Date | string
}) {
  try {
    // Prepare the data - ensure date is properly formatted if provided
    const formattedData = {
      ...data,
      date_played: data.date_played instanceof Date 
        ? data.date_played.toISOString() 
        : data.date_played ? new Date(data.date_played).toISOString() : undefined,
    };
    
    console.log("Submitting review with data:", formattedData);
    
    const response = await fetch(`/api/courses/${courseId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("API error response:", responseData);
      throw new Error(responseData.error || `Failed to submit review: ${response.status}`);
    }
    
    return responseData;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
} 