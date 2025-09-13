-- Add subscription tracking columns to agents table
-- This script adds the necessary columns for subscription tracking

-- Add the required columns to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS current_plan_id text,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add comments to explain what each column is for
COMMENT ON COLUMN public.agents.current_plan_id IS 'Current subscription plan ID (mensual, semestral, anual)';
COMMENT ON COLUMN public.agents.subscription_expires_at IS 'When the current subscription expires';
COMMENT ON COLUMN public.agents.stripe_customer_id IS 'Stripe customer ID for this agent';
COMMENT ON COLUMN public.agents.stripe_subscription_id IS 'Stripe subscription ID for this agent';

-- Create an index for better performance when checking subscription status
CREATE INDEX IF NOT EXISTS idx_agents_subscription_expires_at ON public.agents(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_agents_current_plan_id ON public.agents(current_plan_id);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND column_name IN ('current_plan_id', 'subscription_expires_at', 'stripe_customer_id', 'stripe_subscription_id')
ORDER BY column_name;
