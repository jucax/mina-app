-- Ensure all subscription tracking columns exist in agents table
-- This script is idempotent and can be run multiple times safely

-- Add subscription tracking columns if they don't exist
DO $$ 
BEGIN
    -- Add subscription_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.agents 
        ADD COLUMN subscription_status TEXT DEFAULT 'inactive' 
        CHECK (subscription_status IN ('inactive', 'active', 'expired', 'cancelled'));
    END IF;

    -- Add subscription_plan column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'subscription_plan') THEN
        ALTER TABLE public.agents 
        ADD COLUMN subscription_plan TEXT;
    END IF;

    -- Add subscription_start_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'subscription_start_date') THEN
        ALTER TABLE public.agents 
        ADD COLUMN subscription_start_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add subscription_end_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'subscription_end_date') THEN
        ALTER TABLE public.agents 
        ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add stripe_customer_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.agents 
        ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- Add stripe_subscription_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE public.agents 
        ADD COLUMN stripe_subscription_id TEXT;
    END IF;

    -- Add auto_renew column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'agents' AND column_name = 'auto_renew') THEN
        ALTER TABLE public.agents 
        ADD COLUMN auto_renew BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.agents.subscription_status IS 'Current status of the agent subscription: inactive, active, expired, cancelled';
COMMENT ON COLUMN public.agents.subscription_plan IS 'Type of subscription plan: mensual, semestral, anual';
COMMENT ON COLUMN public.agents.subscription_start_date IS 'When the current subscription period started';
COMMENT ON COLUMN public.agents.subscription_end_date IS 'When the current subscription period ends';
COMMENT ON COLUMN public.agents.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN public.agents.stripe_subscription_id IS 'Stripe subscription ID for managing the subscription';
COMMENT ON COLUMN public.agents.auto_renew IS 'Whether the subscription should auto-renew';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_subscription_status ON public.agents(subscription_status);
CREATE INDEX IF NOT EXISTS idx_agents_subscription_end_date ON public.agents(subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_agents_stripe_customer_id ON public.agents(stripe_customer_id);

-- Update existing agents to have inactive status if null
UPDATE public.agents 
SET subscription_status = 'inactive' 
WHERE subscription_status IS NULL;

-- Create a function to check if subscription is active
CREATE OR REPLACE FUNCTION is_subscription_active(agent_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    SELECT subscription_status, subscription_end_date
    INTO subscription_record
    FROM public.agents
    WHERE id = agent_id_param;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if subscription is active and not expired
    RETURN subscription_record.subscription_status = 'active' 
           AND (subscription_record.subscription_end_date IS NULL 
                OR subscription_record.subscription_end_date > NOW());
END;
$$ LANGUAGE plpgsql;

-- Create a function to get subscription days remaining
CREATE OR REPLACE FUNCTION get_subscription_days_remaining(agent_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    end_date TIMESTAMP WITH TIME ZONE;
    days_remaining INTEGER;
BEGIN
    SELECT subscription_end_date
    INTO end_date
    FROM public.agents
    WHERE id = agent_id_param;
    
    IF end_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    days_remaining := EXTRACT(DAY FROM (end_date - NOW()));
    
    -- Return 0 if expired, otherwise return days remaining
    RETURN CASE 
        WHEN days_remaining < 0 THEN 0
        ELSE days_remaining
    END;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_subscription_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_days_remaining(UUID) TO authenticated;

-- Add RLS policies for subscription data
-- Allow agents to read their own subscription data
CREATE POLICY IF NOT EXISTS "Agents can read own subscription data" ON public.agents
    FOR SELECT USING (auth.uid()::text = id::text);

-- Allow agents to update their own subscription data
CREATE POLICY IF NOT EXISTS "Agents can update own subscription data" ON public.agents
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow service role to update subscription data (for payment processing)
CREATE POLICY IF NOT EXISTS "Service role can update subscription data" ON public.agents
    FOR UPDATE USING (auth.role() = 'service_role');

-- Allow service role to insert subscription data
CREATE POLICY IF NOT EXISTS "Service role can insert subscription data" ON public.agents
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow service role to read subscription data
CREATE POLICY IF NOT EXISTS "Service role can read subscription data" ON public.agents
    FOR SELECT USING (auth.role() = 'service_role');
