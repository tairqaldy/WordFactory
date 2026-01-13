'use client'

import { ArrowRight, ArrowLeft, BookOpen, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { WordAnalysis } from '@/types'

interface AnalysisStepProps {
  analysis: WordAnalysis
  onConfirm: () => void
  onBack: () => void
  loading?: boolean
}

export function AnalysisStep({ analysis, onConfirm, onBack, loading }: AnalysisStepProps) {
  const posLabels: Record<string, string> = {
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Word Analysis
        </h2>
        <p className="text-gray-500 text-sm">
          Review the analysis and confirm to continue
        </p>
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {analysis.normalized_word}
            </h3>
            <p className="text-gray-400 text-sm">{analysis.ipa}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            {posLabels[analysis.pos] || analysis.pos}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Translation</p>
              <p className="font-medium text-gray-900">{analysis.translation}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Meaning</p>
            <p className="text-gray-700">{analysis.basic_meaning}</p>
          </div>

          {analysis.example_usage && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Example</p>
              <p className="text-gray-700 italic">{analysis.example_usage}</p>
            </div>
          )}
        </div>
      </Card>

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
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
