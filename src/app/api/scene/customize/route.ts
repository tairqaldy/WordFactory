import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, parseJsonResponse } from '@/lib/gemini/client'
import type { WordAnalysis, Anchor, Scene, ImagePrompt } from '@/types'

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
    const { word, analysis, anchors, nativeLanguage, customInstructions, currentScene } = await request.json()

    if (!word || !analysis || !anchors || !nativeLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const model = getGeminiModel()
    const nativeLangName = LANGUAGE_NAMES[nativeLanguage] || nativeLanguage
    
    const wordAnalysis = analysis as WordAnalysis
    const selectedAnchors = anchors as Anchor[]

    const anchorsInfo = selectedAnchors
      .map(a => `"${a.chunk}" -> ${nativeLangName} word: "${a.anchor_word}"`)
      .join('\n')

    const currentSceneInfo = currentScene
      ? `Current scene:\nMain object: ${currentScene.main_object}\nBindings: ${currentScene.bindings?.map((b: { anchor: string; relation: string; target: string }) => `${b.anchor} ${b.relation} ${b.target}`).join(', ')}\n`
      : ''

    const prompt = `You are a mnemonic scene builder for a vocabulary learning app.

Build a visual scene that connects these elements:
- Target word: "${word}" (${wordAnalysis.pos})
- Meaning: "${wordAnalysis.translation}" (${wordAnalysis.basic_meaning})
- Phonetic anchors:
${anchorsInfo}

${currentSceneInfo}${customInstructions ? `\nCustom instructions: ${customInstructions}\n` : ''}

Scene building rules:
1. The main object represents the MEANING of the word (translation)
2. Each anchor word must be physically connected to the main object
3. Use spatial relationships: on, inside, attached_to, holding, wearing, sitting_on, standing_on
4. The scene must be visually coherent (all elements in one unified image)
5. Keep it simple - one main scene, clear relationships
6. No abstract symbols, only concrete objects
${customInstructions ? `7. Follow these custom requirements: ${customInstructions}` : ''}

Return a JSON object with this structure:
{
  "scene": {
    "main_object": "string - the visual representation of the word meaning",
    "bindings": [
      {
        "anchor": "string - the ${nativeLangName} anchor word",
        "relation": "string - spatial relationship",
        "target": "string - what it relates to"
      }
    ],
    "style": {
      "visual": "clean, realistic 3D",
      "background": "simple",
      "no_text": true
    }
  },
  "imagePrompt": {
    "prompt": "string - detailed image generation prompt in English, describing the scene",
    "negative_prompt": "text, letters, watermark, blur, multiple scenes, abstract symbols"
  }
}

The image prompt should be in English and describe the scene vividly for an image generation model.
Only return valid JSON, no additional text.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    const data = parseJsonResponse<{ scene: Scene; imagePrompt: ImagePrompt }>(text)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error customizing scene:', error)
    
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
      { error: 'Failed to customize scene', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
