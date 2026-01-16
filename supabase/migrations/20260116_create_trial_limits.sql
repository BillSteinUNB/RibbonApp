-- Migration: Create trial_limits table for server-side trial validation
-- Purpose: Prevent client-side tampering with trial usage
-- Issue: GitHub #47 - Trial Limits Enforced Client-Side Only

-- Create trial_limits table
CREATE TABLE IF NOT EXISTS public.trial_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uses_remaining INTEGER NOT NULL DEFAULT 5,
  total_uses INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS trial_limits_user_id_idx ON public.trial_limits(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trial_limits_updated_at
  BEFORE UPDATE ON public.trial_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.trial_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own trial limits
CREATE POLICY "Users can view own trial limits"
  ON public.trial_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own trial limits (on first use)
CREATE POLICY "Users can insert own trial limits"
  ON public.trial_limits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own trial limits
CREATE POLICY "Users can update own trial limits"
  ON public.trial_limits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Prevent deletion (trial limits should be managed by system)
CREATE POLICY "Users cannot delete trial limits"
  ON public.trial_limits
  FOR DELETE
  USING (false);

-- Function: Get trial limits for a user (server-side)
CREATE OR REPLACE FUNCTION public.get_trial_limits(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  uses_remaining INTEGER,
  total_uses INTEGER,
  last_reset_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uses_remaining,
    total_uses,
    last_reset_date
  FROM public.trial_limits
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Initialize trial limits for a new user
CREATE OR REPLACE FUNCTION public.initialize_trial_limits()
RETURNS TABLE (
  success BOOLEAN,
  uses_remaining INTEGER
) AS $$
DECLARE
  v_trial_limit INTEGER := 5;  -- Default 5 uses
BEGIN
  -- Check if user already has trial limits
  IF EXISTS (
    SELECT 1 FROM public.trial_limits
    WHERE user_id = auth.uid()
  ) THEN
    -- Return existing data
    RETURN QUERY
    SELECT true, uses_remaining
    FROM public.trial_limits
    WHERE user_id = auth.uid();
  ELSE
    -- Insert new trial limits
    INSERT INTO public.trial_limits (
      user_id,
      uses_remaining,
      total_uses,
      last_reset_date
    ) VALUES (
      auth.uid(),
      v_trial_limit,
      0,
      NOW()
    );

    RETURN QUERY
    SELECT true, v_trial_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Decrement trial uses (server-side)
CREATE OR REPLACE FUNCTION public.decrement_trial_uses()
RETURNS TABLE (
  success BOOLEAN,
  uses_remaining INTEGER,
  total_uses INTEGER
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_limit RECORD;
  v_success BOOLEAN := false;
BEGIN
  -- Get current trial limits
  SELECT * INTO v_limit
  FROM public.trial_limits
  WHERE user_id = v_user_id;

  -- If no record exists, initialize one
  IF NOT FOUND THEN
    INSERT INTO public.trial_limits (
      user_id,
      uses_remaining,
      total_uses,
      last_reset_date
    ) VALUES (
      v_user_id,
      5,
      0,
      NOW()
    );

    -- Now decrement
    UPDATE public.trial_limits
    SET uses_remaining = uses_remaining - 1,
        total_uses = total_uses + 1
    WHERE user_id = v_user_id;

    v_success := true;
  ELSE
    -- Check if user has remaining uses
    IF v_limit.uses_remaining > 0 THEN
      -- Decrement uses
      UPDATE public.trial_limits
      SET uses_remaining = uses_remaining - 1,
          total_uses = total_uses + 1
      WHERE user_id = v_user_id;

      v_success := true;
    END IF;
  END IF;

  -- Return result
  RETURN QUERY
  SELECT
    v_success AS success,
    uses_remaining,
    total_uses
  FROM public.trial_limits
  WHERE user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user can use trial feature (server-side)
CREATE OR REPLACE FUNCTION public.can_use_trial_feature()
RETURNS BOOLEAN AS $$
DECLARE
  v_uses_remaining INTEGER;
BEGIN
  SELECT uses_remaining INTO v_uses_remaining
  FROM public.trial_limits
  WHERE user_id = auth.uid();

  -- Return true if has remaining uses or no record (new user)
  RETURN COALESCE(v_uses_remaining, 5) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reset trial limits (for testing or periodic resets)
CREATE OR REPLACE FUNCTION public.reset_trial_limits()
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.trial_limits
  SET uses_remaining = 5,
      total_uses = total_uses,
      last_reset_date = NOW()
  WHERE user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_trial_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_trial_limits() TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_trial_uses() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_use_trial_feature() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_trial_limits() TO authenticated;

-- Grant select on trial_limits (RLS handles access control)
GRANT SELECT ON public.trial_limits TO authenticated;
GRANT INSERT ON public.trial_limits TO authenticated;
GRANT UPDATE ON public.trial_limits TO authenticated;
