-- Create subscription tracking table
CREATE TABLE IF NOT EXISTS public.agent_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'semiannual', 'yearly')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_agent_id ON public.agent_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_status ON public.agent_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_period_end ON public.agent_subscriptions(current_period_end);

-- Add RLS policies
ALTER TABLE public.agent_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view their own subscriptions
CREATE POLICY "Agents can view own subscriptions" ON public.agent_subscriptions
    FOR SELECT USING (agent_id = (SELECT id FROM public.agents WHERE id = auth.uid()::text));

-- Policy for agents to insert their own subscriptions
CREATE POLICY "Agents can insert own subscriptions" ON public.agent_subscriptions
    FOR INSERT WITH CHECK (agent_id = (SELECT id FROM public.agents WHERE id = auth.uid()::text));

-- Policy for agents to update their own subscriptions
CREATE POLICY "Agents can update own subscriptions" ON public.agent_subscriptions
    FOR UPDATE USING (agent_id = (SELECT id FROM public.agents WHERE id = auth.uid()::text));

-- Add subscription status to agents table if not exists
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired', 'canceled'));

-- Add subscription plan to agents table if not exists
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS current_plan TEXT CHECK (current_plan IN ('monthly', 'semiannual', 'yearly'));

-- Add subscription expiry date to agents table if not exists
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to check subscription validity
CREATE OR REPLACE FUNCTION check_agent_subscription_validity(agent_uuid UUID)
RETURNS TABLE (
    is_valid BOOLEAN,
    plan_type TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN s.status = 'active' AND s.current_period_end > NOW() THEN TRUE
            ELSE FALSE
        END as is_valid,
        s.plan_type,
        s.current_period_end as expires_at,
        EXTRACT(DAY FROM (s.current_period_end - NOW()))::INTEGER as days_remaining
    FROM public.agent_subscriptions s
    WHERE s.agent_id = agent_uuid
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update agent subscription status
CREATE OR REPLACE FUNCTION update_agent_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the agents table with current subscription status
    UPDATE public.agents 
    SET 
        subscription_status = CASE 
            WHEN NEW.status = 'active' AND NEW.current_period_end > NOW() THEN 'active'
            WHEN NEW.status = 'canceled' OR NEW.current_period_end <= NOW() THEN 'expired'
            ELSE 'inactive'
        END,
        current_plan = NEW.plan_type,
        subscription_expires_at = NEW.current_period_end,
        updated_at = NOW()
    WHERE id = NEW.agent_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update agent subscription status
DROP TRIGGER IF EXISTS trigger_update_agent_subscription_status ON public.agent_subscriptions;
CREATE TRIGGER trigger_update_agent_subscription_status
    AFTER INSERT OR UPDATE ON public.agent_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_subscription_status();

-- Add comments for documentation
COMMENT ON TABLE public.agent_subscriptions IS 'Tracks agent subscription details and billing information';
COMMENT ON COLUMN public.agent_subscriptions.plan_type IS 'Type of subscription plan: monthly, semiannual, or yearly';
COMMENT ON COLUMN public.agent_subscriptions.status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN public.agent_subscriptions.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN public.agent_subscriptions.current_period_end IS 'End of current billing period';
COMMENT ON COLUMN public.agent_subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at period end';

COMMENT ON COLUMN public.agents.subscription_status IS 'Current subscription status: active, inactive, expired, or canceled';
COMMENT ON COLUMN public.agents.current_plan IS 'Current subscription plan type';
COMMENT ON COLUMN public.agents.subscription_expires_at IS 'When the current subscription expires';
