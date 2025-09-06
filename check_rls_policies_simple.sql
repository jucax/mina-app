-- =====================================================
-- RLS Policy Check Script for Mina App
-- =====================================================
-- This script checks all RLS policies that might affect data access
-- Run this in Supabase SQL Editor to diagnose RLS issues

-- 1. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('agents', 'owners', 'proposals', 'properties', 'user_auth')
ORDER BY tablename;

-- 2. Check all RLS policies on relevant tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('agents', 'owners', 'proposals', 'properties', 'user_auth')
ORDER BY tablename, policyname;

-- 3. Check storage policies (for profile images)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
ORDER BY policyname;

-- 4. Check if storage buckets exist and their policies
SELECT 
    name as bucket_name,
    public as is_public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name IN ('profile-images', 'property-images');

-- 5. Check current user and role
SELECT 
    current_user as current_user,
    current_role as current_role,
    session_user as session_user;

-- 6. Check if there are any policies that might be too restrictive
-- Look for policies that might block anonymous access
SELECT 
    'Potential Issue: Policy blocks anonymous access' as issue_type,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('agents', 'owners', 'proposals', 'properties', 'user_auth')
    AND NOT ('anon' = ANY(roles) OR 'authenticated' = ANY(roles))
ORDER BY tablename, policyname;

-- 7. Check for policies that might block data retrieval
SELECT 
    'Potential Issue: Policy might block data retrieval' as issue_type,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('agents', 'owners', 'proposals', 'properties', 'user_auth')
    AND cmd IN ('SELECT', 'ALL')
    AND (qual LIKE '%auth.uid()%' OR qual LIKE '%auth.role()%')
ORDER BY tablename, policyname;

-- 8. Check if there are any policies that require specific conditions
SELECT 
    'Policy with conditions' as policy_type,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('agents', 'owners', 'proposals', 'properties', 'user_auth')
    AND (qual IS NOT NULL OR with_check IS NOT NULL)
ORDER BY tablename, policyname;

-- 9. Check if tables have any data (this will help confirm if RLS is blocking)
-- Note: This might return empty if RLS is blocking, but it's worth checking
SELECT 
    'agents' as table_name,
    COUNT(*) as row_count
FROM agents
UNION ALL
SELECT 
    'owners' as table_name,
    COUNT(*) as row_count
FROM owners
UNION ALL
SELECT 
    'proposals' as table_name,
    COUNT(*) as row_count
FROM proposals
UNION ALL
SELECT 
    'properties' as table_name,
    COUNT(*) as row_count
FROM properties
UNION ALL
SELECT 
    'user_auth' as table_name,
    COUNT(*) as row_count
FROM user_auth;

-- 10. Summary of all policies by table
SELECT 
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
    COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as all_policies
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('agents', 'owners', 'proposals', 'properties', 'user_auth')
GROUP BY tablename
ORDER BY tablename;
