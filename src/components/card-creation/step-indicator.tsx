'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CardCreationStep } from '@/types'

const STEPS: { key: CardCreationStep; label: string }[] = [
  { key: 'input', label: 'Word' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'chunking', label: 'Chunks' },
  { key: 'anchors', label: 'Anchors' },
  { key: 'bindings', label: 'Scene' },
  { key: 'image', label: 'Image' },
  { key: 'complete', label: 'Done' },
]

interface StepIndicatorProps {
  currentStep: CardCreationStep
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep)

  return (
    <div className="flex items-center justify-between px-2">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = step.key === currentStep
        const isUpcoming = index > currentIndex

        return (
          <div key={step.key} className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                isCompleted && 'bg-green-500 text-white',
                isCurrent && 'bg-blue-600 text-white ring-4 ring-blue-100',
                isUpcoming && 'bg-gray-200 text-gray-500'
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                'text-xs mt-1 hidden sm:block',
                isCurrent ? 'text-blue-600 font-medium' : 'text-gray-400'
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
