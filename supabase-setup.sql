-- CADDIE MVP DATABASE SETUP
-- Run these statements in Supabase SQL Editor

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  username text unique,
  full_name text,
  location text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = user_id );

-- 2. COURSES TABLE
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  province text not null,
  address text,
  description text,
  latitude numeric,
  longitude numeric,
  phone text,
  website text,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.courses enable row level security;

-- Create policies
create policy "Courses are viewable by everyone."
  on courses for select
  using ( true );

-- 3. COURSE_REVIEWS TABLE
create table public.course_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text,
  date_played date not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, course_id, date_played)
);

-- Enable RLS
alter table public.course_reviews enable row level security;

-- Create policies
create policy "Reviews are viewable by everyone."
  on course_reviews for select
  using ( true );

create policy "Users can insert their own reviews."
  on course_reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews."
  on course_reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews."
  on course_reviews for delete
  using ( auth.uid() = user_id );

-- 4. LISTS TABLE
create table public.lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  is_public boolean default true not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.lists enable row level security;

-- Create policies
create policy "Public lists are viewable by everyone."
  on lists for select
  using ( is_public = true or auth.uid() = user_id );

create policy "Users can insert their own lists."
  on lists for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own lists."
  on lists for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own lists."
  on lists for delete
  using ( auth.uid() = user_id );

-- 5. LIST_COURSES TABLE
create table public.list_courses (
  id uuid default uuid_generate_v4() primary key,
  list_id uuid references public.lists on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  position integer not null,
  created_at timestamp with time zone default now() not null,
  unique(list_id, course_id)
);

-- Enable RLS
alter table public.list_courses enable row level security;

-- Create policies
create policy "List courses are viewable by everyone for public lists or list owner."
  on list_courses for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_id and (lists.is_public or lists.user_id = auth.uid())
    )
  );

create policy "Users can insert into their own lists."
  on list_courses for insert
  with check (
    exists (
      select 1 from public.lists
      where lists.id = list_id and lists.user_id = auth.uid()
    )
  );

create policy "Users can update their own list courses."
  on list_courses for update
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_id and lists.user_id = auth.uid()
    )
  );

create policy "Users can delete from their own lists."
  on list_courses for delete
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_id and lists.user_id = auth.uid()
    )
  );

-- 6. FOLLOWS TABLE
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references auth.users on delete cascade not null,
  following_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(follower_id, following_id)
);

-- Enable RLS
alter table public.follows enable row level security;

-- Create policies
create policy "Follows are viewable by everyone."
  on follows for select
  using ( true );

create policy "Users can follow others."
  on follows for insert
  with check ( auth.uid() = follower_id );

create policy "Users can unfollow others."
  on follows for delete
  using ( auth.uid() = follower_id );

-- 7. AUTOMATIC PROFILE CREATION TRIGGER
-- This creates a trigger that automatically creates a user profile when a new user signs up

-- Create the function that will be called by the trigger
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, user_id, username, full_name, location)
  values (
    new.id, 
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'location'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. FAVORITE_COURSES TABLE
create table public.favorite_courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  position integer not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, course_id)
);

-- Enable RLS
alter table public.favorite_courses enable row level security;

-- Create policies
create policy "Favorite courses are viewable by everyone."
  on favorite_courses for select
  using ( true );

create policy "Users can insert their own favorite courses."
  on favorite_courses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own favorite courses."
  on favorite_courses for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own favorite courses."
  on favorite_courses for delete
  using ( auth.uid() = user_id );

-- 9. BUCKET_LIST_COURSES TABLE
create table public.bucket_list_courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  position integer not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, course_id)
);

-- Enable RLS
alter table public.bucket_list_courses enable row level security;

-- Create policies
create policy "Bucket list courses are viewable by everyone."
  on bucket_list_courses for select
  using ( true );

create policy "Users can insert their own bucket list courses."
  on bucket_list_courses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own bucket list courses."
  on bucket_list_courses for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own bucket list courses."
  on bucket_list_courses for delete
  using ( auth.uid() = user_id );

-- 10. RPC FUNCTIONS FOR UPDATING POSITIONS

-- Function to update favorite course positions
create or replace function update_favorite_positions(updates jsonb[])
returns void as $$
declare
  update_item jsonb;
begin
  for update_item in select * from jsonb_array_elements(updates)
  loop
    update public.favorite_courses
    set position = (update_item->>'position')::integer
    where user_id = (update_item->>'user_id')::uuid
    and course_id = (update_item->>'course_id')::uuid;
  end loop;
end;
$$ language plpgsql security definer;

-- Function to update bucket list positions
create or replace function update_bucket_list_positions(updates jsonb[])
returns void as $$
declare
  update_item jsonb;
begin
  for update_item in select * from jsonb_array_elements(updates)
  loop
    update public.bucket_list_courses
    set position = (update_item->>'position')::integer
    where user_id = (update_item->>'user_id')::uuid
    and course_id = (update_item->>'course_id')::uuid;
  end loop;
end;
$$ language plpgsql security definer; 