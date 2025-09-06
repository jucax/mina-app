-- =====================================================
-- Fix Agents RLS Policies for Mina App (Fixed Syntax)
-- =====================================================
-- This script fixes the overly restrictive RLS policies on the agents table
-- that prevent owners from viewing agent profiles from proposals

-- 1. Drop existing restrictive policies (using correct Supabase syntax)
DROP POLICY "Agents can insert own profile" ON "public"."agents";
DROP POLICY "Agents can update own profile" ON "public"."agents";
DROP POLICY "Agents can update their own profile" ON "public"."agents";
DROP POLICY "Agents can view own profile" ON "public"."agents";

-- 2. Create new policies that allow:
--    - Agents to manage their own profiles
--    - Anyone to view agent profiles (for proposal viewing)
--    - Only authenticated users to insert/update

-- Allow anyone to view agent profiles (needed for proposal viewing)
CREATE POLICY "Anyone can view agent profiles" ON "public"."agents"
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert their own agent profile
CREATE POLICY "Authenticated users can insert own agent profile" ON "public"."agents"
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Allow agents to update their own profile
CREATE POLICY "Agents can update own profile" ON "public"."agents"
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow agents to delete their own profile
CREATE POLICY "Agents can delete own profile" ON "public"."agents"
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- 3. Verify the new policies
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'agents'
ORDER BY policyname;
