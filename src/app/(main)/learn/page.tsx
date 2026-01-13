import { createClient } from '@/lib/supabase/server'
import { LearnFlow } from './learn-flow'

interface CardWithProgress {
  id: string
  card_id: string
  repetitions: number
  ease_factor: number
  interval_days: number
  next_review: string
  cards: {
    id: string
    word: string
    pos: string
    ipa: string
    translation: string
    image_url: string | null
    example: string | null
  }
}

export default async function LearnPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get cards due for review
  const { data: dueCards, count } = await supabase
    .from('learning_progress')
    .select('*, cards(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .lte('next_review', new Date().toISOString())
    .order('next_review', { ascending: true })
    .limit(20)

  const dueCount = count || 0
  const cardsToReview = (dueCards || []) as CardWithProgress[]

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col px-4 py-6">
      <LearnFlow 
        dueCount={dueCount}
        cardsToReview={cardsToReview}
      />
    </div>
  )
}
