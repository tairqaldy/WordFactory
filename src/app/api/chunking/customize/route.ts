import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, parseJsonResponse } from '@/lib/gemini/client'
import type { Phonetics } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { word, learningLanguage, nativeLanguage, customInstructions, currentChunks } = await request.json()

    if (!word || !learningLanguage || !nativeLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const model = getGeminiModel()

    const currentChunksInfo = currentChunks
      ? `Current chunks: ${currentChunks.map((c: { chunk: string }) => c.chunk).join(', ')}\n`
      : ''

    const prompt = `You are a phonetic chunking system for a mnemonic learning app.

Analyze the ${learningLanguage} word "${word}" and split it into phonetic chunks for mnemonic purposes.

${currentChunksInfo}${customInstructions ? `\nCustom instructions: ${customInstructions}\n` : ''}

Rules for phonetic chunking:
- Each chunk should be 1-3 syllables
- Chunks must be continuous and pronounceable
- Chunks should be maximally distinct from each other
- For short words (1-2 syllables), use the whole word as one chunk
${customInstructions ? `- Additional requirements: ${customInstructions}` : ''}

Return a JSON object with this structure:
{
  "phonetics": {
    "ipa": "string - full IPA transcription",
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

    const data = parseJsonResponse<{ phonetics: Phonetics }>(text)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error customizing chunking:', error)
    
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
      { error: 'Failed to customize chunking', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
