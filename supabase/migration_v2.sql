-- =====================================================
-- REPAIRHUB FEATURE MIGRATION v2
-- Run this in your Supabase SQL Editor
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

-- =====================================================
-- 14. BAN FEATURE - Add is_banned column to profiles
-- =====================================================
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
-- TO CREATE AN ADMIN USER, run this separately:
-- Replace 'your_user_id_here' with actual user UUID
-- =====================================================
-- UPDATE profiles SET is_admin = true WHERE id = 'your_user_id_here';
-- OR by email:
-- UPDATE profiles SET is_admin = true WHERE email = 'admin@example.com';

-- =====================================================
-- TO BAN A USER:
-- =====================================================
-- UPDATE profiles SET is_banned = true WHERE email = 'user@example.com';

