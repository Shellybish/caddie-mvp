-- Review Likes Table
-- This table tracks which users have liked which reviews

create table public.review_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  review_id uuid references public.course_reviews on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, review_id)
);

-- Enable RLS
alter table public.review_likes enable row level security;

-- Create policies
create policy "Review likes are viewable by everyone."
  on review_likes for select
  using ( true );

create policy "Users can like reviews."
  on review_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can unlike reviews."
  on review_likes for delete
  using ( auth.uid() = user_id );

-- Create indexes for better performance
create index idx_review_likes_user_id on public.review_likes(user_id);
create index idx_review_likes_review_id on public.review_likes(review_id);

-- Add a function to get likes count for a review
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

-- Add a function to check if a user has liked a review
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