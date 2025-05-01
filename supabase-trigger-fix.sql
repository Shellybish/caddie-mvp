-- Fix for handle_new_user function
-- Copy and paste this into the Supabase SQL Editor

-- Drop the existing function and trigger if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create the corrected function
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    user_id, 
    username, 
    full_name, 
    location
  )
  values (
    new.id, 
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'location', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 