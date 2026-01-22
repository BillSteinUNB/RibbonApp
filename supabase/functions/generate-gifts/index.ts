import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MINIMAX_API_KEY = Deno.env.get('MINIMAX_API_KEY')

    if (!MINIMAX_API_KEY) {
      throw new Error('MINIMAX_API_KEY not configured')
    }

    const { systemPrompt, userPrompt } = await req.json()

    if (!systemPrompt || !userPrompt) {
      return new Response(
        JSON.stringify({ error: 'systemPrompt and userPrompt are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(MINIMAX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tokens_to_generate: 2000,
        temperature: 0.7,
        top_p: 0.95,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.base_resp?.status_msg || `MiniMax API error: ${response.status}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.messages?.[0]?.content

    if (!content) {
      throw new Error('No content in MiniMax response')
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
