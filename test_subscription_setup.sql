-- Test script to verify subscription setup
-- Run this after the main setup script

-- 1. Check if tables exist
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agent_subscriptions', 'agents');

-- 2. Check if function exists
SELECT 
    routine_name,
    CASE WHEN routine_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'check_agent_subscription_validity';

-- 3. Check if columns exist in agents table
SELECT 
    column_name,
    CASE WHEN column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'agents' 
AND column_name IN ('subscription_status', 'current_plan', 'subscription_expires_at');

-- 4. Test the function with a dummy UUID
SELECT * FROM check_agent_subscription_validity('00000000-0000-0000-0000-000000000000');

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'agent_subscriptions';

SELECT 'Test completed!' as status;
