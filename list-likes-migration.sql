-- LIST LIKES FUNCTIONALITY
-- Run this script in your Supabase SQL Editor to add list likes functionality

-- 1. LIST LIKES TABLE
-- This table tracks which users have liked which lists

create table if not exists public.list_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  list_id uuid references public.lists on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, list_id)
);

-- Enable RLS
alter table public.list_likes enable row level security;

-- Create policies for list_likes
do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'list_likes' and policyname = 'List likes are viewable by everyone.') then
        create policy "List likes are viewable by everyone." on list_likes for select using (true);
    end if;
    
    if not exists (select 1 from pg_policies where tablename = 'list_likes' and policyname = 'Users can like lists.') then
        create policy "Users can like lists." on list_likes for insert with check (auth.uid() = user_id);
    end if;
    
    if not exists (select 1 from pg_policies where tablename = 'list_likes' and policyname = 'Users can unlike lists.') then
        create policy "Users can unlike lists." on list_likes for delete using (auth.uid() = user_id);
    end if;
end
$$;

-- Create indexes for better performance
create index if not exists idx_list_likes_user_id on public.list_likes(user_id);
create index if not exists idx_list_likes_list_id on public.list_likes(list_id);

-- 2. UTILITY FUNCTIONS

-- Function to get likes count for a list
create or replace function get_list_likes_count(list_uuid uuid)
returns bigint as $$
begin
  return (
    select count(*)
    from public.list_likes
    where list_id = list_uuid
  );
end;
$$ language plpgsql security definer;

-- Function to check if a user has liked a list
create or replace function has_user_liked_list(user_uuid uuid, list_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from public.list_likes
    where user_id = user_uuid and list_id = list_uuid
  );
end;
$$ language plpgsql security definer;

-- COMPLETED: The database is now ready for list likes functionality
-- - Users can like/unlike lists
-- - All necessary tables, constraints, and functions are in place 