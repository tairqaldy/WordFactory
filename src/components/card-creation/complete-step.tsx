'use client'

import Link from 'next/link'
import { Check, Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { WordAnalysis, Anchor } from '@/types'

interface CompleteStepProps {
  word: string
  analysis: WordAnalysis
  anchors: Anchor[]
  imageUrl: string | null
  onCreateAnother: () => void
}

export function CompleteStep({
  word,
  analysis,
  anchors,
  imageUrl,
  onCreateAnother,
}: CompleteStepProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Card Created!
        </h2>
        <p className="text-gray-500 text-sm">
          Your mnemonic card is ready for review
        </p>
      </div>

      <Card className="p-4 mb-6">
        {imageUrl && (
          <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden mb-4">
            <img
              src={imageUrl}
              alt={word}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{word}</h3>
          <p className="text-gray-500">{analysis.ipa}</p>
          <p className="text-lg text-gray-700 mt-1">{analysis.translation}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {anchors.map((anchor, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {anchor.chunk} = {anchor.anchor_word}
            </span>
          ))}
        </div>
      </Card>

      <div className="space-y-3 mt-auto">
        <Button
          className="w-full"
          size="lg"
          onClick={onCreateAnother}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Another Card
        </Button>

        <Link href="/learn" className="block">
          <Button variant="outline" className="w-full" size="lg">
            <BookOpen className="w-4 h-4 mr-2" />
            Start Learning
          </Button>
        </Link>
      </div>
    </div>
  )
}
