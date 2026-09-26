-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
do $$ begin
    create type user_role as enum ('farmer', 'agronomist', 'admin');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type urgency_level as enum ('low', 'moderate', 'high', 'critical');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type advisory_status as enum ('open', 'monitoring', 'resolved');
exception
    when duplicate_object then null;
end $$;

-- Profiles Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    full_name text,
    role user_role default 'farmer',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Farms Table
create table if not exists public.farms (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    location text not null,
    size_acres numeric(10,2),
    soil_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Advisories Table
create table if not exists public.advisories (
    id uuid default uuid_generate_v4() primary key,
    farm_id uuid references public.farms(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    crop_type text not null,
    growth_stage text not null,
    symptom_description text not null,
    image_url text,
    diagnosis_json jsonb not null,
    urgency urgency_level not null,
    status advisory_status default 'open' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.advisories enable row level security;

-- Profiles Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Farms Policies
drop policy if exists "Users can CRUD own farms" on public.farms;
create policy "Users can CRUD own farms" on public.farms for all using (auth.uid() = user_id);

-- Advisories Policies
drop policy if exists "Users can CRUD own advisories" on public.advisories;
create policy "Users can CRUD own advisories" on public.advisories for all using (auth.uid() = user_id);

-- Automated profile creation trigger on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'farmer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
