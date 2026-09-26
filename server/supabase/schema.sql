-- AI-Powered Meal Decision & Anti-Fatigue Assistant
-- Production PostgreSQL Database Schema with Row Level Security (RLS)

create extension if not exists "uuid-ossp";

-- Users table handled by Supabase Auth (auth.users)

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.anchor_themes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  day_of_week text not null, -- 'Monday', 'Tuesday', etc.
  theme_name text not null,
  default_recipe text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.pantry_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_name text not null,
  category text not null, -- 'canned', 'frozen', 'pantry', 'fresh'
  is_lazy_backup boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.weekly_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start_date date not null,
  meal_ideas jsonb not null, -- Array of 3 core ideas (Rule of Three)
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.anchor_themes enable row level security;
alter table public.pantry_items enable row level security;
alter table public.weekly_plans enable row level security;

-- Policies for profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Policies for anchor_themes
drop policy if exists "Users manage own anchor themes" on public.anchor_themes;
create policy "Users manage own anchor themes" on public.anchor_themes for all using (auth.uid() = user_id);

-- Policies for pantry_items
drop policy if exists "Users manage own pantry items" on public.pantry_items;
create policy "Users manage own pantry items" on public.pantry_items for all using (auth.uid() = user_id);

-- Policies for weekly_plans
drop policy if exists "Users manage own weekly plans" on public.weekly_plans;
create policy "Users manage own weekly plans" on public.weekly_plans for all using (auth.uid() = user_id);

-- Trigger to auto-create public.profiles upon auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
