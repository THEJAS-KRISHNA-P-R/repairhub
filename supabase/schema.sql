-- REPAIRHUB FULL DATABASE SCHEMA
-- This file contains the complete schema including all migrations (v1, v2, v3).
-- Run this entire script in the Supabase SQL Editor to set up the database from scratch.

-- =====================================================
-- SECTION 1: INITIAL SCHEMA (v1)
-- =====================================================

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

-- =====================================================
-- SECTION 2: MIGRATION V2 (Categories, Votes, Bookmarks, Admin)
-- =====================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  icon text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- 2. Add category_id to repair_posts
ALTER TABLE repair_posts ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

-- 3. Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  repair_post_id uuid REFERENCES repair_posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, repair_post_id)
);
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- 4. Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  repair_post_id uuid REFERENCES repair_posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, repair_post_id)
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 5. Add is_admin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 6. Admin helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Admin override policies for repair_posts
DROP POLICY IF EXISTS "Admins can update any repair post" ON repair_posts;
CREATE POLICY "Admins can update any repair post" ON repair_posts
  FOR UPDATE USING (is_admin());
  
DROP POLICY IF EXISTS "Admins can delete any repair post" ON repair_posts;
CREATE POLICY "Admins can delete any repair post" ON repair_posts
  FOR DELETE USING (is_admin());

-- 8. Admin override policies for guides
DROP POLICY IF EXISTS "Admins can update any guide" ON guides;
CREATE POLICY "Admins can update any guide" ON guides
  FOR UPDATE USING (is_admin());
  
DROP POLICY IF EXISTS "Admins can delete any guide" ON guides;
CREATE POLICY "Admins can delete any guide" ON guides
  FOR DELETE USING (is_admin());

-- 9. Admin override policies for comments
DROP POLICY IF EXISTS "Admins can delete any comment" ON comments;
CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE USING (is_admin());

-- 10. Admin can manage categories
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (is_admin());
  
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (is_admin());
  
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (is_admin());

-- 11. Seed default categories
INSERT INTO categories (name, icon) VALUES
  ('Electronics', '📱'),
  ('Appliances', '🔌'),
  ('Computers', '💻'),
  ('Audio/Video', '🎧'),
  ('Furniture', '🪑'),
  ('Vehicles', '🚗'),
  ('Clothing', '👕'),
  ('Other', '🔧')
ON CONFLICT (name) DO NOTHING;

-- 12. Assign existing posts to "Other" category
UPDATE repair_posts 
SET category_id = (SELECT id FROM categories WHERE name = 'Other')
WHERE category_id IS NULL;

-- 13. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- 14. BAN FEATURE - Add is_banned column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Helper function to check if user is banned
CREATE OR REPLACE FUNCTION is_banned(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND is_banned = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Update repair_posts INSERT policy to check ban status
DROP POLICY IF EXISTS "Users can insert their own repair posts" ON repair_posts;
CREATE POLICY "Users can insert their own repair posts" ON repair_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND NOT is_banned(auth.uid())
  );

-- 16. Update guides INSERT policy to check ban status
DROP POLICY IF EXISTS "Users can insert their own guides" ON guides;
CREATE POLICY "Users can insert their own guides" ON guides
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND NOT is_banned(auth.uid())
  );

-- 17. Update comments INSERT policy to check ban status
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND NOT is_banned(auth.uid())
  );

-- 18. Admin can update profiles (for banning)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (is_admin());


-- =====================================================
-- SECTION 3: MIGRATION V3 (Advanced Features: Follows, Notifications, Reports)
-- =====================================================

-- 1. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see all follows"
ON follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
ON follows FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id AND follower_id != following_id);

CREATE POLICY "Users can unfollow"
ON follows FOR DELETE TO authenticated
USING (auth.uid() = follower_id);

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'upvote', 'comment', 'reply', 'follow'
    title TEXT NOT NULL,
    message TEXT,
    link TEXT, -- URL to navigate to
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    repair_post_id UUID REFERENCES repair_posts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their notifications"
ON notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can mark their notifications as read"
ON notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- 3. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'post', 'comment', 'user'
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON reports FOR SELECT TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update reports"
ON reports FOR UPDATE TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 4. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
