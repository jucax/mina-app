-- Check if an agent already has a subscription
-- Replace 'YOUR_AGENT_ID_HERE' with the actual agent ID from the logs

-- 1. Check agent_subscriptions table
SELECT 
    id,
    agent_id,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    created_at
FROM agent_subscriptions 
WHERE agent_id = 'YOUR_AGENT_ID_HERE'
ORDER BY created_at DESC;

-- 2. Check agents table subscription status
SELECT 
    id,
    full_name,
    email,
    subscription_status,
    current_plan,
    subscription_expires_at
FROM agents 
WHERE id = 'YOUR_AGENT_ID_HERE';

-- 3. Test the subscription validity function
SELECT * FROM check_agent_subscription_validity('YOUR_AGENT_ID_HERE');

-- 4. Check all subscriptions for debugging
SELECT 
    a.full_name,
    a.email,
    a.subscription_status,
    a.current_plan,
    s.plan_type,
    s.status,
    s.current_period_end
FROM agents a
LEFT JOIN agent_subscriptions s ON a.id = s.agent_id
ORDER BY s.created_at DESC
LIMIT 10;
