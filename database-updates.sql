-- DATABASE UPDATES FOR COURSE ACTIONS COMPONENT
-- Run this script in your Supabase SQL Editor to apply all the necessary changes

-- 1. REVIEW LIKES TABLE
-- This table tracks which users have liked which reviews

create table if not exists public.review_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  review_id uuid references public.course_reviews on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, review_id)
);

-- Enable RLS
alter table public.review_likes enable row level security;

-- Create policies for review_likes
do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'review_likes' and policyname = 'Review likes are viewable by everyone.') then
        create policy "Review likes are viewable by everyone." on review_likes for select using (true);
    end if;
    
    if not exists (select 1 from pg_policies where tablename = 'review_likes' and policyname = 'Users can like reviews.') then
        create policy "Users can like reviews." on review_likes for insert with check (auth.uid() = user_id);
    end if;
    
    if not exists (select 1 from pg_policies where tablename = 'review_likes' and policyname = 'Users can unlike reviews.') then
        create policy "Users can unlike reviews." on review_likes for delete using (auth.uid() = user_id);
    end if;
end
$$;

-- Create indexes for better performance
create index if not exists idx_review_likes_user_id on public.review_likes(user_id);
create index if not exists idx_review_likes_review_id on public.review_likes(review_id);

-- 2. UPDATE COURSE_REVIEWS TO ALLOW 0 RATINGS (for "played" without rating)

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
drop index if exists course_reviews_user_course_date_rated_unique;
create unique index course_reviews_user_course_date_rated_unique 
on public.course_reviews (user_id, course_id, date_played) 
where rating > 0;

-- 3. UTILITY FUNCTIONS

-- Function to get likes count for a review
create or replace function get_review_likes_count(review_uuid uuid)
returns bigint as $$
begin
  return (
    select count(*)
    from public.review_likes
    where review_id = review_uuid
  );
end;
$$ language plpgsql security definer;

-- Function to check if a user has liked a review
create or replace function has_user_liked_review(user_uuid uuid, review_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.review_likes
    where user_id = user_uuid and review_id = review_uuid
  );
end;
$$ language plpgsql security definer;

-- Function to check if a course has been played (rated or unrated)
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

-- COMPLETED: The database is now ready for the new course actions functionality
-- - Users can mark courses as "played" without rating (rating = 0)
-- - Users can like/unlike reviews
-- - Bucket list functionality was already implemented
-- - All necessary tables, constraints, and functions are in place 