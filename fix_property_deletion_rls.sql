-- Check current RLS policies on properties table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'properties';

-- Check if RLS is enabled on properties table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'properties';

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own properties" ON "public"."properties";
DROP POLICY IF EXISTS "Users can insert own properties" ON "public"."properties";
DROP POLICY IF EXISTS "Users can update own properties" ON "public"."properties";
DROP POLICY IF EXISTS "Users can delete own properties" ON "public"."properties";

-- Create new policies that allow proper deletion
CREATE POLICY "Users can view own properties" ON "public"."properties"
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own properties" ON "public"."properties"
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own properties" ON "public"."properties"
    FOR UPDATE USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own properties" ON "public"."properties"
    FOR DELETE USING (auth.uid() = owner_id);

-- Also allow agents to view all properties (for browsing)
CREATE POLICY "Agents can view all properties" ON "public"."properties"
    FOR SELECT USING (true);

-- Check the policies again
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'properties';
