import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, parseJsonResponse } from '@/lib/gemini/client'
import type { AnchorCandidate } from '@/types'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  nl: 'Dutch',
  kz: 'Kazakh',
}

export async function POST(request: NextRequest) {
  try {
    const { word, phonetics, nativeLanguage, customInstructions, currentAnchors } = await request.json()

    if (!word || !phonetics || !nativeLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const model = getGeminiModel()
    const nativeLangName = LANGUAGE_NAMES[nativeLanguage] || nativeLanguage

    const chunksInfo = (phonetics.chunks || [])
      .map((c: { chunk: string; ipa: string }, i: number) => `Chunk ${i + 1}: "${c.chunk}" (IPA: ${c.ipa})`)
      .join('\n')

    const currentAnchorsInfo = currentAnchors 
      ? `Current anchors:\n${currentAnchors.map((a: { chunk: string; anchor_word: string }) => `- "${a.chunk}" -> "${a.anchor_word}"`).join('\n')}\n`
      : ''

    const prompt = `You are a phonetic association generator for a mnemonic learning app.

For the word "${word}", generate phonetically similar words in ${nativeLangName} for each chunk:

${chunksInfo}

${currentAnchorsInfo}${customInstructions ? `\nCustom instructions: ${customInstructions}\n` : ''}

For each chunk, find 3-5 words in ${nativeLangName} that:
1. Sound similar to the chunk (phonetic similarity is most important)
2. Are concrete, easily visualizable nouns (not abstract concepts)
3. Are common, familiar words (high frequency)
4. Are distinct from each other
${customInstructions ? '5. Follow these additional requirements: ' + customInstructions : ''}

Score each candidate on phonetic_similarity from 0.0 to 1.0 (1.0 = perfect match).

Return a JSON object with this structure:
{
  "candidates": [
    {
      "chunk": "string - the original chunk",
      "candidates": [
        {
          "word": "string - ${nativeLangName} word",
          "phonetic_similarity": 0.0,
          "imageable": true,
          "frequency": "high | medium | low"
        }
      ]
    }
  ]
}

Sort candidates by phonetic_similarity (highest first).
Only return valid JSON, no additional text.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    const data = parseJsonResponse<{ candidates: { chunk: string; candidates: AnchorCandidate[] }[] }>(text)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error customizing anchors:', error)
    
    if (error?.status === 403 || error?.message?.includes('SERVICE_DISABLED')) {
      return NextResponse.json(
        { 
          error: 'Generative Language API is not enabled. Please enable it in Google Cloud Console.',
          details: error.message
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to customize anchors', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
