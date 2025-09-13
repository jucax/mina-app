-- Add the missing subscription_status column to agents table
-- This script adds the subscription_status column that was missing

-- Add the subscription_status column
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

-- Add comment to explain what this column is for
COMMENT ON COLUMN public.agents.subscription_status IS 'Current subscription status (active, inactive, expired, canceled)';

-- Create an index for better performance when checking subscription status
CREATE INDEX IF NOT EXISTS idx_agents_subscription_status ON public.agents(subscription_status);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND column_name IN ('current_plan_id', 'subscription_status', 'subscription_expires_at', 'stripe_customer_id', 'stripe_subscription_id')
ORDER BY column_name;
