import { NextRequest, NextResponse } from 'next/server'

// Use free dictionary API for audio (supports English)
// Alternative: Google Text-to-Speech via Cloud API
const FREE_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries'

const LANGUAGE_CODES: Record<string, string> = {
  en: 'en',
  ru: 'ru',
  de: 'de',
  fr: 'fr',
  es: 'es',
  nl: 'nl',
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const word = searchParams.get('word')
    const language = searchParams.get('language') || 'en'

    if (!word) {
      return NextResponse.json(
        { error: 'Missing word parameter' },
        { status: 400 }
      )
    }

    const langCode = LANGUAGE_CODES[language] || 'en'

    // Try free dictionary API for English
    if (langCode === 'en') {
      try {
        const response = await fetch(`${FREE_DICTIONARY_API}/${langCode}/${encodeURIComponent(word)}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // Look for audio URL in phonetics
          if (data && data[0]?.phonetics) {
            const phonetic = data[0].phonetics.find(
              (p: { audio?: string }) => p.audio && p.audio.length > 0
            )
            
            if (phonetic?.audio) {
              return NextResponse.json({
                audioUrl: phonetic.audio,
                source: 'free-dictionary-api'
              })
            }
          }
        }
      } catch (error) {
        console.error('Free Dictionary API error:', error)
      }
    }

    // Fallback: Use Google Text-to-Speech URL (unofficial but works for basic TTS)
    // This creates a URL that can be used to get audio from Google Translate
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(word)}`

    return NextResponse.json({
      audioUrl: googleTtsUrl,
      source: 'google-tts-fallback'
    })
  } catch (error) {
    console.error('Error fetching audio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audio' },
      { status: 500 }
    )
  }
}
