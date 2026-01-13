import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      word,
      analysis,
      phonetics,
      anchors,
      scene,
      imagePrompt,
      imageUrl,
      learningLanguage,
      nativeLanguage,
    } = body

    if (!word || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        user_id: user.id,
        word: analysis.normalized_word || word,
        pos: analysis.pos,
        ipa: analysis.ipa,
        translation: analysis.translation,
        learning_language: learningLanguage,
        native_language: nativeLanguage,
        analysis: analysis,
        meaning_anchor: null, // Can be computed later
        phonetics: phonetics,
        scene: scene,
        image_prompt: imagePrompt,
        image_url: imageUrl,
        audio_url: null, // Will be added in audio step
        example: analysis.example_usage,
        example_translation: null,
      })
      .select()
      .single()

    if (cardError) {
      console.error('Error creating card:', cardError)
      return NextResponse.json(
        { error: 'Failed to create card' },
        { status: 500 }
      )
    }

    // Create anchor records
    if (anchors && anchors.length > 0) {
      const anchorRecords = anchors.map((anchor: { chunk: string; anchor_word: string; score: number; reason: string }) => ({
        card_id: card.id,
        chunk: anchor.chunk,
        chunk_ipa: phonetics?.chunks?.find((c: { chunk: string }) => c.chunk === anchor.chunk)?.ipa || null,
        anchor_word: anchor.anchor_word,
        score: anchor.score,
        reason: anchor.reason,
      }))

      const { error: anchorsError } = await supabase
        .from('anchors')
        .insert(anchorRecords)

      if (anchorsError) {
        console.error('Error creating anchors:', anchorsError)
      }
    }

    // Create binding records
    if (scene?.bindings && scene.bindings.length > 0) {
      const bindingRecords = scene.bindings.map((binding: { anchor: string; relation: string; target: string }) => ({
        card_id: card.id,
        anchor: binding.anchor,
        relation: binding.relation,
        target: binding.target,
      }))

      const { error: bindingsError } = await supabase
        .from('bindings')
        .insert(bindingRecords)

      if (bindingsError) {
        console.error('Error creating bindings:', bindingsError)
      }
    }

    // Create initial learning progress record
    const { error: progressError } = await supabase
      .from('learning_progress')
      .insert({
        user_id: user.id,
        card_id: card.id,
        repetitions: 0,
        ease_factor: 2.5,
        interval_days: 1,
        next_review: new Date().toISOString(),
      })

    if (progressError) {
      console.error('Error creating progress:', progressError)
    }

    return NextResponse.json({ card })
  } catch (error) {
    console.error('Error in cards API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: cards, error } = await supabase
      .from('cards')
      .select('*, anchors(*), bindings(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
