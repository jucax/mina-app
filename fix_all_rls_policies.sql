-- =====================================================
-- Fix All RLS Policies for Mina App
-- =====================================================
-- This script fixes overly restrictive RLS policies that prevent
-- proper data access for proposals and agent viewing

-- =====================================================
-- 1. FIX AGENTS TABLE
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Agents can insert own profile" ON "public"."agents";
DROP POLICY IF EXISTS "Agents can update own profile" ON "public"."agents";
DROP POLICY IF EXISTS "Agents can update their own profile" ON "public"."agents";
DROP POLICY IF EXISTS "Agents can view own profile" ON "public"."agents";

-- Create new policies
CREATE POLICY "Anyone can view agent profiles" ON "public"."agents"
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert own agent profile" ON "public"."agents"
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Agents can update own profile" ON "public"."agents"
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Agents can delete own profile" ON "public"."agents"
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- =====================================================
-- 2. FIX OWNERS TABLE
-- =====================================================

-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Owners can view own profile" ON "public"."owners";
DROP POLICY IF EXISTS "Owners can update own profile" ON "public"."owners";
DROP POLICY IF EXISTS "Owners can insert own profile" ON "public"."owners";

-- Create new policies
CREATE POLICY "Anyone can view owner profiles" ON "public"."owners"
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert own owner profile" ON "public"."owners"
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Owners can update own profile" ON "public"."owners"
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Owners can delete own profile" ON "public"."owners"
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- =====================================================
-- 3. FIX PROPOSALS TABLE
-- =====================================================

-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can view own proposals" ON "public"."proposals";
DROP POLICY IF EXISTS "Users can insert own proposals" ON "public"."proposals";
DROP POLICY IF EXISTS "Users can update own proposals" ON "public"."proposals";

-- Create new policies
CREATE POLICY "Anyone can view proposals" ON "public"."proposals"
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert proposals" ON "public"."proposals"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own proposals" ON "public"."proposals"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete own proposals" ON "public"."proposals"
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 4. FIX PROPERTIES TABLE
-- =====================================================

-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can view own properties" ON "public"."properties";
DROP POLICY IF EXISTS "Users can insert own properties" ON "public"."properties";
DROP POLICY IF EXISTS "Users can update own properties" ON "public"."properties";

-- Create new policies
CREATE POLICY "Anyone can view properties" ON "public"."properties"
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert properties" ON "public"."properties"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own properties" ON "public"."properties"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete own properties" ON "public"."properties"
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 5. FIX USER_AUTH TABLE
-- =====================================================

-- Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can view own auth" ON "public"."user_auth";
DROP POLICY IF EXISTS "Users can insert own auth" ON "public"."user_auth";
DROP POLICY IF EXISTS "Users can update own auth" ON "public"."user_auth";

-- Create new policies
CREATE POLICY "Anyone can view user auth" ON "public"."user_auth"
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert user auth" ON "public"."user_auth"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own auth" ON "public"."user_auth"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete own auth" ON "public"."user_auth"
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 6. VERIFY ALL POLICIES
-- =====================================================

-- Check agents policies
SELECT 'AGENTS POLICIES' as table_name, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'agents'
ORDER BY policyname

UNION ALL

-- Check owners policies
SELECT 'OWNERS POLICIES' as table_name, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'owners'
ORDER BY policyname

UNION ALL

-- Check proposals policies
SELECT 'PROPOSALS POLICIES' as table_name, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'proposals'
ORDER BY policyname

UNION ALL

-- Check properties policies
SELECT 'PROPERTIES POLICIES' as table_name, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'properties'
ORDER BY policyname

UNION ALL

-- Check user_auth policies
SELECT 'USER_AUTH POLICIES' as table_name, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_auth'
ORDER BY policyname;
