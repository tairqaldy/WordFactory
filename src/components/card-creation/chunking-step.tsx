'use client'

import { ArrowRight, ArrowLeft, Puzzle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Phonetics } from '@/types'

interface ChunkingStepProps {
  word: string
  phonetics: Phonetics
  onConfirm: () => void
  onBack: () => void
  loading?: boolean
}

export function ChunkingStep({ word, phonetics, onConfirm, onBack, loading }: ChunkingStepProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Phonetic Chunks
        </h2>
        <p className="text-gray-500 text-sm">
          The word is split into memorable sound segments
        </p>
      </div>

      <Card className="p-5 mb-6">
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-gray-900 tracking-wide">
            {word}
          </p>
          <p className="text-gray-400 text-sm">{phonetics.ipa}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {phonetics.chunks.map((chunk, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-1 mb-1">
                <Puzzle className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-400">Chunk {index + 1}</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {chunk.chunk}
              </span>
              <span className="text-xs text-gray-400">{chunk.ipa}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">
          Each chunk will get a sound-alike word in your native language to create memorable associations.
        </p>
      </div>

      <div className="flex gap-3 mt-auto">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          className="flex-1"
          size="lg"
          onClick={onConfirm}
          loading={loading}
        >
          Generate Anchors
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
