import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, parseJsonResponse } from '@/lib/gemini/client'
import type { WordAnalysis, Phonetics } from '@/types'

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
    const { word, learningLanguage, nativeLanguage } = await request.json()

    if (!word || !learningLanguage || !nativeLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const model = getGeminiModel()
    const learningLangName = LANGUAGE_NAMES[learningLanguage] || learningLanguage
    const nativeLangName = LANGUAGE_NAMES[nativeLanguage] || nativeLanguage

    const prompt = `You are a linguistic analysis system for a mnemonic learning app.

Analyze the ${learningLangName} word "${word}" and provide:
1. Word analysis (normalized form, part of speech, IPA transcription, translation to ${nativeLangName}, basic meaning, semantic class, example usage)
2. Phonetic chunking (split into 1-3 pronounceable segments for mnemonic purposes)

Rules for phonetic chunking:
- Each chunk should be 1-3 syllables
- Chunks must be continuous and pronounceable
- Chunks should be maximally distinct from each other
- For short words (1-2 syllables), use the whole word as one chunk

Return a JSON object with this exact structure:
{
  "analysis": {
    "normalized_word": "string - the normalized form of the word",
    "pos": "noun | verb | adjective",
    "ipa": "string - IPA transcription",
    "translation": "string - translation to ${nativeLangName}",
    "basic_meaning": "string - simple explanation of the meaning",
    "semantic_class": "object | action | quality",
    "example_usage": "string - example sentence in ${learningLangName}"
  },
  "phonetics": {
    "ipa": "string - full IPA",
    "chunks": [
      {
        "chunk": "string - the text chunk",
        "ipa": "string - IPA for this chunk"
      }
    ]
  }
}

Only return valid JSON, no additional text.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    const data = parseJsonResponse<{ analysis: WordAnalysis; phonetics: Phonetics }>(text)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error analyzing word:', error)
    return NextResponse.json(
      { error: 'Failed to analyze word' },
      { status: 500 }
    )
  }
}
