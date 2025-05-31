// Client-side API functions for fetching data

/**
 * Fetch a course by ID (client-side)
 */
export async function fetchCourse(id: string) {
  try {
    const response = await fetch(`/api/courses/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

/**
 * Log a round of golf (client-side)
 */
export async function logRound(courseId: string, formData: {
  date: string;
  rating?: number;
  notes?: string;
}) {
  try {
    const formattedData = {
      date: formData.date,
      rating: formData.rating || 0,
      notes: formData.notes || ''
    };
    
    const response = await fetch(`/api/courses/${courseId}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const responseData = await response.json();
      console.error("API error response:", responseData);
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error logging round:", error);
    throw error;
  }
}

/**
 * Submit a course review (client-side)
 */
export async function submitReview(courseId: string, formData: {
  rating: number;
  review_text?: string;
  date_played?: string;
}) {
  try {
    const formattedData = {
      rating: formData.rating,
      review_text: formData.review_text || '',
      date_played: formData.date_played
    };
    
    const response = await fetch(`/api/courses/${courseId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const responseData = await response.json();
      console.error("API error response:", responseData);
      throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
} 