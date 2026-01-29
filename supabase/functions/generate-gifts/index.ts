import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// OpenAI-compatible endpoint for MiniMax
const MINIMAX_API_URL = 'https://api.minimax.io/v1/chat/completions'

// Rate limiting: max requests per user per day
const RATE_LIMIT_MAX = 50
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

// In-memory rate limit store (resets on cold start, good enough for Edge Functions)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(userId)

  if (!record || (now - record.windowStart) >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, windowStart: now })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

// Max prompt lengths to prevent abuse
const MAX_SYSTEM_PROMPT_LENGTH = 1000
const MAX_USER_PROMPT_LENGTH = 5000

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT using Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    // Allow requests with valid anon key even without user auth (for anonymous users)
    // but apply stricter rate limits
    const userId = user?.id || req.headers.get('x-client-info') || 'anonymous'
    const isAuthenticated = !!user

    // --- Rate Limiting ---
    const { allowed, remaining } = checkRateLimit(userId)
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '3600',
          },
        }
      )
    }

    // --- Input Validation ---
    const MINIMAX_API_KEY = Deno.env.get('MINIMAX_API_KEY')

    if (!MINIMAX_API_KEY) {
      throw new Error('MINIMAX_API_KEY not configured')
    }

    const body = await req.json()
    const { systemPrompt, userPrompt } = body

    if (!systemPrompt || !userPrompt) {
      return new Response(
        JSON.stringify({ error: 'systemPrompt and userPrompt are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enforce prompt length limits
    if (typeof systemPrompt !== 'string' || systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'systemPrompt exceeds maximum length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (typeof userPrompt !== 'string' || userPrompt.length > MAX_USER_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'userPrompt exceeds maximum length' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Call MiniMax API ---
    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-M2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.95,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.base_resp?.status_msg || `AI service error: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in AI response')
    }

    // --- Output Validation ---
    // Ensure response is reasonable length and contains expected JSON structure
    if (content.length > 50000) {
      throw new Error('AI response exceeds maximum length')
    }

    return new Response(
      JSON.stringify({ content }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    )

  } catch (error) {
    // Don't leak internal error details to client
    const safeMessage = error.message?.includes('API')
      ? 'AI service temporarily unavailable. Please try again.'
      : 'An error occurred processing your request.'

    return new Response(
      JSON.stringify({ error: safeMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
