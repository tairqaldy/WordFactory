import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, parseJsonResponse } from '@/lib/gemini/client'
import type { Phonetics, AnchorCandidate } from '@/types'

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
    const { word, phonetics, nativeLanguage } = await request.json()

    if (!word || !phonetics || !nativeLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const model = getGeminiModel()
    const nativeLangName = LANGUAGE_NAMES[nativeLanguage] || nativeLanguage

    const chunksInfo = (phonetics as Phonetics).chunks
      .map((c, i) => `Chunk ${i + 1}: "${c.chunk}" (IPA: ${c.ipa})`)
      .join('\n')

    const prompt = `You are a phonetic association generator for a mnemonic learning app.

For the word "${word}", generate phonetically similar words in ${nativeLangName} for each chunk:

${chunksInfo}

For each chunk, find 3-5 words in ${nativeLangName} that:
1. Sound similar to the chunk (phonetic similarity is most important)
2. Are concrete, easily visualizable nouns (not abstract concepts)
3. Are common, familiar words (high frequency)
4. Are distinct from each other

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
  } catch (error) {
    console.error('Error generating anchors:', error)
    return NextResponse.json(
      { error: 'Failed to generate anchors' },
      { status: 500 }
    )
  }
}
