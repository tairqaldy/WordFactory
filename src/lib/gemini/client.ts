import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini client
// Uses GOOGLE_CLOUD_API_KEY from environment
const apiKey = process.env.GOOGLE_CLOUD_API_KEY

if (!apiKey) {
  console.warn('GOOGLE_CLOUD_API_KEY is not set. AI features will not work.')
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export function getGeminiModel(modelName: string = 'gemini-1.5-flash') {
  if (!genAI) {
    throw new Error('Gemini API key not configured')
  }
  return genAI.getGenerativeModel({ model: modelName })
}

// Helper to parse JSON from Gemini response
export function parseJsonResponse<T>(text: string): T {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim())
  }
  
  // Try to parse as raw JSON
  return JSON.parse(text.trim())
}
