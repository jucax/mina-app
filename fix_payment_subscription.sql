-- Fix payment subscription flow
-- First, let's check if the agent_subscriptions table exists and create it if needed

-- Create agent_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.agent_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan_type text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL,
    cancel_at_period_end boolean DEFAULT false,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agent_subscriptions_pkey PRIMARY KEY (id)
);

-- Add RLS policies for agent_subscriptions
ALTER TABLE public.agent_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for agents to view their own subscriptions
CREATE POLICY IF NOT EXISTS "Agents can view own subscriptions" ON public.agent_subscriptions
    FOR SELECT USING (
        agent_id IN (
            SELECT id FROM public.agents 
            WHERE id = agent_id
        )
    );

-- Policy for agents to insert their own subscriptions
CREATE POLICY IF NOT EXISTS "Agents can insert own subscriptions" ON public.agent_subscriptions
    FOR INSERT WITH CHECK (
        agent_id IN (
            SELECT id FROM public.agents 
            WHERE id = agent_id
        )
    );

-- Policy for agents to update their own subscriptions
CREATE POLICY IF NOT EXISTS "Agents can update own subscriptions" ON public.agent_subscriptions
    FOR UPDATE USING (
        agent_id IN (
            SELECT id FROM public.agents 
            WHERE id = agent_id
        )
    );

-- Add columns to agents table if they don't exist
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS current_plan_id text,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_agent_id ON public.agent_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_status ON public.agent_subscriptions(status);

-- Add comments
COMMENT ON TABLE public.agent_subscriptions IS 'Tracks agent subscription payments and status';
COMMENT ON COLUMN public.agent_subscriptions.plan_type IS 'Type of subscription: monthly, semiannual, yearly';
COMMENT ON COLUMN public.agent_subscriptions.status IS 'Subscription status: active, canceled, past_due, etc.';
