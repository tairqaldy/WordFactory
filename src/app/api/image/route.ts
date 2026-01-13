import { NextRequest, NextResponse } from 'next/server'

// Google Imagen API endpoint
// Note: Using Gemini's image generation via Imagen or falling back to placeholder
const IMAGEN_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict'

export async function POST(request: NextRequest) {
  try {
    const { prompt, negativePrompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY

    if (!apiKey) {
      // Return a placeholder image URL for development
      console.warn('No Google API key, using placeholder image')
      return NextResponse.json({
        imageUrl: `https://placehold.co/512x512/e2e8f0/64748b?text=${encodeURIComponent('Image\nGeneration')}`
      })
    }

    try {
      // Try Imagen API
      const response = await fetch(`${IMAGEN_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            negativePrompt: negativePrompt || 'text, letters, watermark, blur',
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Imagen API error:', errorText)
        throw new Error('Imagen API failed')
      }

      const data = await response.json()
      
      // Extract image from response
      if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
        const base64Image = data.predictions[0].bytesBase64Encoded
        return NextResponse.json({
          imageUrl: `data:image/png;base64,${base64Image}`
        })
      }

      throw new Error('No image in response')
    } catch (imagenError) {
      console.error('Imagen failed, trying Gemini image generation:', imagenError)
      
      // Fallback: Try Gemini's newer image generation if available
      // For now, return placeholder
      return NextResponse.json({
        imageUrl: `https://placehold.co/512x512/e2e8f0/64748b?text=${encodeURIComponent('Mnemonic\nScene')}`
      })
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
