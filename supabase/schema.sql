-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  email text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- Repair Posts
create table repair_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  item_name text not null,
  issue_description text,
  repair_steps text,
  success boolean default false not null,
  date date default CURRENT_DATE not null,
  images jsonb, -- Storing image URLs/metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table repair_posts enable row level security;

create policy "Repair Posts are viewable by everyone." on repair_posts
  for select using (true);

create policy "Users can insert their own repair posts." on repair_posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own repair posts." on repair_posts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own repair posts." on repair_posts
  for delete using (auth.uid() = user_id);

-- Guides
create table guides (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  item_name text not null,
  guide_content text not null,
  date date default CURRENT_DATE not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table guides enable row level security;

create policy "Guides are viewable by everyone." on guides
  for select using (true);

create policy "Users can insert their own guides." on guides
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own guides." on guides
  for update using (auth.uid() = user_id);

create policy "Users can delete their own guides." on guides
  for delete using (auth.uid() = user_id);

-- Comments
create table comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  repair_post_id uuid references repair_posts(id) on delete cascade not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table comments enable row level security;

create policy "Comments are viewable by everyone." on comments
  for select using (true);

create policy "Users can insert their own comments." on comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments." on comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments." on comments
  for delete using (auth.uid() = user_id);

-- Badges
create table badges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  variant text not null check (variant in ('DEFAULT', 'SECONDARY', 'OUTLINE'))
);
alter table badges enable row level security;

create policy "Badges are viewable by everyone." on badges
  for select using (true);
-- Only admins/service role should insert badges, so no public insert policy for now.

-- User Badges
create table user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  badge_id uuid references badges(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table user_badges enable row level security;

create policy "User Badges are viewable by everyone." on user_badges
  for select using (true);

-- Enable Realtime
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table repair_posts;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage Bucket for Images
insert into storage.buckets (id, name, public) values ('repair-images', 'repair-images', true);

create policy "Images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'repair-images' );

create policy "Users can upload images."
  on storage.objects for insert
  with check ( bucket_id = 'repair-images' and auth.role() = 'authenticated' );
