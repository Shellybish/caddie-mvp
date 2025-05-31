-- Allow 0 ratings in course_reviews to track "played" status
-- This enables us to mark courses as "played" without requiring a rating

-- Drop the existing constraint that requires rating to be between 1 and 5
alter table public.course_reviews drop constraint if exists course_reviews_rating_check;

-- Add a new constraint that allows ratings between 0 and 5
-- 0 = played but not rated, 1-5 = played and rated
alter table public.course_reviews 
add constraint course_reviews_rating_check 
check (rating >= 0 and rating <= 5);

-- Update the unique constraint to allow multiple 0-rated entries per user per course
-- but only one rated entry (1-5) per user per course per date
-- First drop the existing unique constraint
alter table public.course_reviews drop constraint if exists course_reviews_user_id_course_id_date_played_key;

-- Create a new unique constraint that excludes 0-rated entries
-- This allows multiple "played" entries but only one rated review per user per course per date
create unique index course_reviews_user_course_date_rated_unique 
on public.course_reviews (user_id, course_id, date_played) 
where rating > 0;

-- Create a function to check if a course has been played (rated or unrated)
create or replace function has_course_been_played(user_uuid uuid, course_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.course_reviews
    where user_id = user_uuid and course_id = course_uuid
  );
end;
$$ language plpgsql security definer; 