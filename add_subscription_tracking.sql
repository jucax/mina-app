-- Add subscription tracking columns to agents table
ALTER TABLE public.agents
ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'expired', 'cancelled')),
ADD COLUMN subscription_plan TEXT,
ADD COLUMN subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN auto_renew BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.agents.subscription_status IS 'Current status of the agent subscription: inactive, active, expired, cancelled';
COMMENT ON COLUMN public.agents.subscription_plan IS 'Type of subscription plan: monthly, semiannual, yearly';
COMMENT ON COLUMN public.agents.subscription_start_date IS 'When the current subscription period started';
COMMENT ON COLUMN public.agents.subscription_end_date IS 'When the current subscription period ends';
COMMENT ON COLUMN public.agents.stripe_subscription_id IS 'Stripe subscription ID for managing the subscription';
COMMENT ON COLUMN public.agents.auto_renew IS 'Whether the subscription should auto-renew';

-- Create an index for faster queries
CREATE INDEX idx_agents_subscription_status ON public.agents(subscription_status);
CREATE INDEX idx_agents_subscription_end_date ON public.agents(subscription_end_date);

-- Update existing agents to have inactive status
UPDATE public.agents 
SET subscription_status = 'inactive' 
WHERE subscription_status IS NULL;
