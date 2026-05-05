import OpenAI from 'openai'

const OPENAI_MODEL = 'gpt-4o-mini'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICallOptions {
  max_tokens?: number
  temperature?: number
  response_format?: { type: 'json_object' | 'text' }
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY)
}

/**
 * Calls Groq API first (primary), falling back to OpenAI if Groq fails or is unavailable.
 * Returns null only if both providers are unconfigured or both fail.
 */
export async function callAIChatCompletion(
  messages: ChatMessage[],
  options: AICallOptions = {}
): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (groqKey) {
    try {
      const client = new OpenAI({ apiKey: groqKey, baseURL: GROQ_BASE_URL })
      const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        ...options,
      })
      return completion.choices[0]?.message?.content ?? null
    } catch (err) {
      if (!openaiKey) throw err
      console.warn(
        '[AI] Groq failed, falling back to OpenAI:',
        err instanceof Error ? err.message : String(err)
      )
    }
  }

  if (openaiKey) {
    const client = new OpenAI({ apiKey: openaiKey })
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      ...options,
    })
    return completion.choices[0]?.message?.content ?? null
  }

  return null
}
