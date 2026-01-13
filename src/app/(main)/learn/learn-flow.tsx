'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus, Eye, Check, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface CardData {
  id: string
  word: string
  pos: string
  ipa: string
  translation: string
  image_url: string | null
  example: string | null
}

interface CardWithProgress {
  id: string
  card_id: string
  repetitions: number
  ease_factor: number
  interval_days: number
  next_review: string
  cards: CardData
}

interface LearnFlowProps {
  dueCount: number
  cardsToReview: CardWithProgress[]
}

type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export function LearnFlow({ dueCount, cardsToReview }: LearnFlowProps) {
  const router = useRouter()
  const [reviewing, setReviewing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(0)

  const currentCard = cardsToReview[currentIndex]
  const remainingCards = cardsToReview.length - currentIndex

  const handleStartReview = () => {
    setReviewing(true)
    setCurrentIndex(0)
    setRevealed(false)
    setCompleted(0)
  }

  const handleReveal = () => {
    setRevealed(true)
  }

  const handleRating = async (rating: ReviewRating) => {
    if (!currentCard) return
    
    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // Calculate new spaced repetition values using SM-2 algorithm
      let { repetitions, ease_factor, interval_days } = currentCard
      
      switch (rating) {
        case 'again':
          repetitions = 0
          interval_days = 1
          ease_factor = Math.max(1.3, ease_factor - 0.2)
          break
        case 'hard':
          interval_days = Math.max(1, Math.round(interval_days * 1.2))
          ease_factor = Math.max(1.3, ease_factor - 0.15)
          break
        case 'good':
          if (repetitions === 0) {
            interval_days = 1
          } else if (repetitions === 1) {
            interval_days = 6
          } else {
            interval_days = Math.round(interval_days * ease_factor)
          }
          repetitions += 1
          break
        case 'easy':
          if (repetitions === 0) {
            interval_days = 4
          } else {
            interval_days = Math.round(interval_days * ease_factor * 1.3)
          }
          repetitions += 1
          ease_factor += 0.15
          break
      }

      const nextReview = new Date()
      nextReview.setDate(nextReview.getDate() + interval_days)

      await supabase
        .from('learning_progress')
        .update({
          repetitions,
          ease_factor,
          interval_days,
          next_review: nextReview.toISOString(),
          last_reviewed: new Date().toISOString(),
        })
        .eq('id', currentCard.id)

      setCompleted(prev => prev + 1)
      
      // Move to next card
      if (currentIndex < cardsToReview.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setRevealed(false)
      } else {
        // All done
        setReviewing(false)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    } finally {
      setLoading(false)
    }
  }

  // Idle state - show start screen
  if (!reviewing) {
    if (dueCount === 0 && completed === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h2>
          <p className="text-gray-500 mb-6">No cards to review right now</p>
          <Link href="/create">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create New Card
            </Button>
          </Link>
        </div>
      )
    }

    if (completed > 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Complete!</h2>
          <p className="text-gray-500 mb-6">You reviewed {completed} cards</p>
          <div className="space-y-3">
            <Button size="lg" onClick={() => router.refresh()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Check for More
            </Button>
            <Link href="/create" className="block">
              <Button variant="outline" size="lg" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Card
              </Button>
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Learn</h1>
        <p className="text-gray-500 mb-6">Review your cards with spaced repetition</p>
        
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-600">{dueCount}</span>
          </div>
          <p className="text-gray-900 font-medium mb-1">Cards to review</p>
          <p className="text-gray-500 text-sm mb-6">Keep your memory fresh!</p>
          <Button size="lg" onClick={handleStartReview}>
            <BookOpen className="w-4 h-4 mr-2" />
            Start Review
          </Button>
        </Card>
      </div>
    )
  }

  // Review mode
  if (!currentCard) return null
  const card = currentCard.cards

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {completed + 1} / {cardsToReview.length}
        </span>
        <span className="text-sm text-gray-500">
          {remainingCards} remaining
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full mb-6">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${((completed + 1) / cardsToReview.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <Card className="flex-1 flex flex-col p-6">
        {/* Image */}
        {card.image_url && (
          <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden mb-4">
            <img
              src={card.image_url}
              alt={card.word}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Question side */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {revealed ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{card.word}</h2>
              <p className="text-gray-400 mb-4">{card.ipa}</p>
              <p className="text-xl text-gray-700 mb-2">{card.translation}</p>
              {card.example && (
                <p className="text-gray-500 italic text-sm">{card.example}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">What is this word?</p>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">?</span>
              </div>
              <p className="text-lg text-gray-700">{card.translation}</p>
            </>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-6">
        {!revealed ? (
          <Button size="lg" className="w-full" onClick={handleReveal}>
            <Eye className="w-4 h-4 mr-2" />
            Show Answer
          </Button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="flex-col py-3 h-auto text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleRating('again')}
              disabled={loading}
            >
              <X className="w-5 h-5 mb-1" />
              <span className="text-xs">Again</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col py-3 h-auto text-orange-600 border-orange-200 hover:bg-orange-50"
              onClick={() => handleRating('hard')}
              disabled={loading}
            >
              <span className="text-lg mb-1">??</span>
              <span className="text-xs">Hard</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col py-3 h-auto text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => handleRating('good')}
              disabled={loading}
            >
              <Check className="w-5 h-5 mb-1" />
              <span className="text-xs">Good</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col py-3 h-auto text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => handleRating('easy')}
              disabled={loading}
            >
              <span className="text-lg mb-1">??</span>
              <span className="text-xs">Easy</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
