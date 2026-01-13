'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Anchor, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CustomizeInput } from './customize-input'
import { cn } from '@/lib/utils'
import type { Anchor as AnchorType, AnchorCandidate } from '@/types'

interface AnchorsStepProps {
  chunks: { chunk: string; candidates: AnchorCandidate[] }[]
  selectedAnchors: AnchorType[]
  onSelectAnchor: (chunkIndex: number, candidate: AnchorCandidate) => void
  onConfirm: () => void
  onBack: () => void
  onCustomize: (customInstructions: string) => Promise<void>
  loading?: boolean
}

export function AnchorsStep({
  chunks,
  selectedAnchors,
  onSelectAnchor,
  onConfirm,
  onBack,
  onCustomize,
  loading,
}: AnchorsStepProps) {
  const allSelected = chunks.every((_, i) =>
    selectedAnchors.some(a => a.chunk === chunks[i].chunk)
  )

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Select Anchors
        </h2>
        <p className="text-gray-500 text-sm">
          Choose the best sound-alike word for each chunk
        </p>
      </div>

      <div className="mb-4">
        <CustomizeInput
          placeholder="e.g., 'Use more colorful objects' or 'Prefer animals over objects'"
          onSubmit={onCustomize}
          loading={loading}
          label="Customize Anchors"
        />
      </div>

      <div className="space-y-4 mb-6">
        {chunks.map((chunkData, chunkIndex) => {
          const selected = selectedAnchors.find(a => a.chunk === chunkData.chunk)

          return (
            <Card key={chunkIndex} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Anchor className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900">
                  {chunkData.chunk}
                </span>
                {selected && (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {chunkData.candidates.slice(0, 4).map((candidate, candidateIndex) => {
                  const isSelected = selected?.anchor_word === candidate.word

                  return (
                    <button
                      key={candidateIndex}
                      onClick={() => onSelectAnchor(chunkIndex, candidate)}
                      className={cn(
                        'w-full p-3 rounded-lg border-2 text-left transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {candidate.word}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {Math.round(candidate.phonetic_similarity * 100)}% match
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )
        })}
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
          disabled={!allSelected}
          loading={loading}
        >
          Build Scene
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
