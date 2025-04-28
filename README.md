# Caddie MVP - Golf Social Platform

A social platform for golfers to discover, rate, review, log plays, and create/share lists of golf courses. Inspired by Letterboxd's model but for golf courses.

## Features

- Course Directory: Searchable database of golf courses
- User Profiles: Create accounts and view personal stats
- Rate/Review/Log Play: Record your experiences at courses
- List Creation: Create and share custom lists of courses
- Social Feed: Follow other users and see their activity
- Authentication: Secure user accounts

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Backend & Authentication)
- Shadcn UI Components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Shellybish/caddie-mvp.git
   cd caddie-mvp
   ```

2. Install dependencies
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install --no-frozen-lockfile
   ```

3. Create a Supabase project
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get your Supabase URL and anon key from the project settings

4. Create a `.env.local` file in the root directory with your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

5. Set up your Supabase database tables
   
   Create the following tables in your Supabase dashboard:

   **profiles**
   ```sql
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
   ```

   **courses**
   ```sql
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
   ```

   **course_reviews**
   ```sql
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
   ```

   **lists**
   ```sql
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
   ```

   **list_courses**
   ```sql
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
   ```

   **follows**
   ```sql
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
   ```

6. Start the development server
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The project can be deployed on Vercel or any platform that supports Next.js applications.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 