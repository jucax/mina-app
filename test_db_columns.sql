-- Test script to check if subscription_status column exists and has data
-- Run this in your Supabase SQL editor

-- Check if the column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND column_name LIKE '%subscription%'
ORDER BY column_name;

-- Check actual data in the agents table
SELECT id, current_plan_id, subscription_status, subscription_expires_at, created_at
FROM agents 
ORDER BY created_at DESC 
LIMIT 5;
