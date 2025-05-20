-- SQL functions for featured courses

-- Function to get highest-rated courses (4.7+ stars with at least 3 reviews)
CREATE OR REPLACE FUNCTION get_highest_rated_courses()
RETURNS TABLE (
  id uuid,
  name text,
  location text,
  province text,
  avg_rating numeric,
  review_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.location,
    c.province,
    COALESCE(AVG(cr.rating)::numeric, 0) as avg_rating,
    COUNT(cr.id)::bigint as review_count
  FROM 
    courses c
  LEFT JOIN 
    course_reviews cr ON c.id = cr.course_id
  GROUP BY 
    c.id
  HAVING 
    COUNT(cr.id) >= 3 AND AVG(cr.rating) >= 4.7
  ORDER BY 
    avg_rating DESC, review_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending courses (most recent review activity)
CREATE OR REPLACE FUNCTION get_trending_courses()
RETURNS TABLE (
  id uuid,
  name text,
  location text,
  province text,
  latest_review timestamp with time zone,
  review_count bigint,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.location,
    c.province,
    MAX(cr.created_at) as latest_review,
    COUNT(cr.id)::bigint as review_count,
    COALESCE(AVG(cr.rating)::numeric, 0) as avg_rating
  FROM 
    courses c
  JOIN 
    course_reviews cr ON c.id = cr.course_id
  GROUP BY 
    c.id
  HAVING 
    COUNT(cr.id) >= 1
  ORDER BY 
    latest_review DESC, review_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to get hidden gem courses (high rating but fewer reviews)
CREATE OR REPLACE FUNCTION get_hidden_gem_courses()
RETURNS TABLE (
  id uuid,
  name text,
  location text,
  province text,
  avg_rating numeric,
  review_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.location,
    c.province,
    COALESCE(AVG(cr.rating)::numeric, 0) as avg_rating,
    COUNT(cr.id)::bigint as review_count
  FROM 
    courses c
  LEFT JOIN 
    course_reviews cr ON c.id = cr.course_id
  GROUP BY 
    c.id
  HAVING 
    COUNT(cr.id) BETWEEN 1 AND 5 AND AVG(cr.rating) >= 4.3
  ORDER BY 
    avg_rating DESC, review_count ASC;
END;
$$ LANGUAGE plpgsql; 