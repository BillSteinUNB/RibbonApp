-- Migration: Create error_logs table for client-side error reporting
-- Purpose: Centralize error logging to Supabase for better monitoring
-- Issue: GitHub #53 - No Error Reporting to Backend

-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  error_type TEXT,           -- e.g., 'AppError', 'TypeError', 'NetworkError'
  error_code TEXT,            -- e.g., 'STORAGE_ERROR', 'AUTHORIZATION_ERROR'
  stack_trace TEXT,           -- Optional: Stack trace for debugging
  context JSONB,              -- Optional: Additional context (user action, screen, etc.)
  component TEXT,             -- e.g., 'TrialService', 'RecipientService'
  method TEXT,               -- e.g., 'loadData', 'saveItem'
  platform TEXT NOT NULL,      -- e.g., 'ios', 'android', 'web'
  app_version TEXT,            -- App version
  device_info JSONB,          -- Optional: Device model, OS version, etc.
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_error_type_idx ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS error_logs_is_resolved_idx ON public.error_logs(is_resolved);

-- Enable Row Level Security (RLS)
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own errors
CREATE POLICY "Users can view own error logs"
  ON public.error_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Authenticated users can insert error logs
CREATE POLICY "Users can insert error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

-- RLS Policy: Only service role or users can update (for marking as resolved)
CREATE POLICY "Users can update own error logs"
  ON public.error_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function: Insert error log
CREATE OR REPLACE FUNCTION public.log_error(
  p_error_message TEXT,
  p_error_type TEXT DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL,
  p_stack_trace TEXT DEFAULT NULL,
  p_context JSONB DEFAULT NULL,
  p_component TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL,
  p_app_version TEXT DEFAULT NULL,
  p_device_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_error_id UUID;
BEGIN
  -- Get current user (may be NULL if not authenticated)
  v_user_id := auth.uid();

  -- Insert error log
  INSERT INTO public.error_logs (
    user_id,
    error_message,
    error_type,
    error_code,
    stack_trace,
    context,
    component,
    method,
    platform,
    app_version,
    device_info
  ) VALUES (
    v_user_id,
    p_error_message,
    p_error_type,
    p_error_code,
    p_stack_trace,
    p_context,
    p_component,
    p_method,
    p_platform,
    p_app_version,
    p_device_info
  )
  RETURNING id INTO v_error_id;

  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get error logs for current user (with pagination)
CREATE OR REPLACE FUNCTION public.get_user_error_logs(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  error_message TEXT,
  error_type TEXT,
  error_code TEXT,
  component TEXT,
  method TEXT,
  is_resolved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    error_message,
    error_type,
    error_code,
    component,
    method,
    is_resolved,
    created_at
  FROM public.error_logs
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark error as resolved
CREATE OR REPLACE FUNCTION public.mark_error_resolved(p_error_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.error_logs
  SET is_resolved = TRUE
  WHERE id = p_error_id
    AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete old error logs (cleanup - call periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_error_logs(p_days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.error_logs
  WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.log_error(
  TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT, JSONB
) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_error_logs(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_error_resolved(UUID) TO authenticated;

-- Grant cleanup to service role only (admin function)
-- This should be called via a database function or admin interface
GRANT EXECUTE ON FUNCTION public.cleanup_old_error_logs(INTEGER) TO postgres;
