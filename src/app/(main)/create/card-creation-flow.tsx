'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/card-creation/step-indicator'
import { WordInputStep } from '@/components/card-creation/word-input-step'
import { AnalysisStep } from '@/components/card-creation/analysis-step'
import { ChunkingStep } from '@/components/card-creation/chunking-step'
import { AnchorsStep } from '@/components/card-creation/anchors-step'
import { SceneStep } from '@/components/card-creation/scene-step'
import { ImageStep } from '@/components/card-creation/image-step'
import { CompleteStep } from '@/components/card-creation/complete-step'
import type {
  CardCreationStep,
  WordAnalysis,
  Phonetics,
  Anchor,
  AnchorCandidate,
  Scene,
  ImagePrompt,
} from '@/types'

interface CardCreationFlowProps {
  learningLanguage: string
  nativeLanguage: string
}

export function CardCreationFlow({ learningLanguage, nativeLanguage }: CardCreationFlowProps) {
  const router = useRouter()
  
  // State machine
  const [step, setStep] = useState<CardCreationStep>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [word, setWord] = useState('')
  const [analysis, setAnalysis] = useState<WordAnalysis | null>(null)
  const [phonetics, setPhonetics] = useState<Phonetics | null>(null)
  const [anchorCandidates, setAnchorCandidates] = useState<{ chunk: string; candidates: AnchorCandidate[] }[]>([])
  const [selectedAnchors, setSelectedAnchors] = useState<Anchor[]>([])
  const [scene, setScene] = useState<Scene | null>(null)
  const [imagePrompt, setImagePrompt] = useState<ImagePrompt | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  // Step handlers
  const handleWordSubmit = async (inputWord: string) => {
    setLoading(true)
    setError(null)
    setWord(inputWord)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: inputWord,
          learningLanguage,
          nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze word')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setPhonetics(data.phonetics)
      setStep('analysis')
    } catch (err) {
      setError('Failed to analyze word. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalysisConfirm = async () => {
    setStep('chunking')
  }

  const handleChunkingConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/anchors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          phonetics,
          nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate anchors')
      }

      const data = await response.json()
      setAnchorCandidates(data.candidates)
      
      // Auto-select best candidates
      const autoSelected = data.candidates.map((c: { chunk: string; candidates: AnchorCandidate[] }) => ({
        chunk: c.chunk,
        anchor_word: c.candidates[0]?.word || '',
        score: c.candidates[0]?.phonetic_similarity || 0,
        reason: 'Auto-selected best match',
      }))
      setSelectedAnchors(autoSelected)
      
      setStep('anchors')
    } catch (err) {
      setError('Failed to generate anchors. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnchor = (chunkIndex: number, candidate: AnchorCandidate) => {
    const chunk = anchorCandidates[chunkIndex].chunk
    setSelectedAnchors(prev => {
      const filtered = prev.filter(a => a.chunk !== chunk)
      return [...filtered, {
        chunk,
        anchor_word: candidate.word,
        score: candidate.phonetic_similarity,
        reason: 'User selected',
      }]
    })
  }

  const handleAnchorsConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          analysis,
          anchors: selectedAnchors,
          nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to build scene')
      }

      const data = await response.json()
      setScene(data.scene)
      setImagePrompt(data.imagePrompt)
      setStep('bindings')
    } catch (err) {
      setError('Failed to build scene. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSceneConfirm = async () => {
    setStep('image')
    generateImage()
  }

  const generateImage = async () => {
    if (!imagePrompt) return
    
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.prompt,
          negativePrompt: imagePrompt.negative_prompt,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      setImageUrl(data.imageUrl)
    } catch (err) {
      setError('Failed to generate image. Please try again.')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleImageConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          analysis,
          phonetics,
          anchors: selectedAnchors,
          scene,
          imagePrompt,
          imageUrl,
          learningLanguage,
          nativeLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save card')
      }

      setStep('complete')
    } catch (err) {
      setError('Failed to save card. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('input')
    setWord('')
    setAnalysis(null)
    setPhonetics(null)
    setAnchorCandidates([])
    setSelectedAnchors([])
    setScene(null)
    setImagePrompt(null)
    setImageUrl(null)
    setError(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      {step !== 'complete' && (
        <div className="mb-6">
          <StepIndicator currentStep={step} />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {step === 'input' && (
        <WordInputStep onSubmit={handleWordSubmit} loading={loading} />
      )}

      {step === 'analysis' && analysis && (
        <AnalysisStep
          analysis={analysis}
          onConfirm={handleAnalysisConfirm}
          onBack={handleReset}
          loading={loading}
        />
      )}

      {step === 'chunking' && phonetics && (
        <ChunkingStep
          word={word}
          phonetics={phonetics}
          onConfirm={handleChunkingConfirm}
          onBack={() => setStep('analysis')}
          loading={loading}
        />
      )}

      {step === 'anchors' && anchorCandidates.length > 0 && (
        <AnchorsStep
          chunks={anchorCandidates}
          selectedAnchors={selectedAnchors}
          onSelectAnchor={handleSelectAnchor}
          onConfirm={handleAnchorsConfirm}
          onBack={() => setStep('chunking')}
          loading={loading}
        />
      )}

      {step === 'bindings' && scene && (
        <SceneStep
          scene={scene}
          anchors={selectedAnchors}
          onConfirm={handleSceneConfirm}
          onBack={() => setStep('anchors')}
          loading={loading}
        />
      )}

      {step === 'image' && imagePrompt && (
        <ImageStep
          imageUrl={imageUrl}
          imagePrompt={imagePrompt.prompt}
          generating={generating}
          onRegenerate={generateImage}
          onConfirm={handleImageConfirm}
          onBack={() => setStep('bindings')}
          loading={loading}
        />
      )}

      {step === 'complete' && analysis && (
        <CompleteStep
          word={word}
          analysis={analysis}
          anchors={selectedAnchors}
          imageUrl={imageUrl}
          onCreateAnother={handleReset}
        />
      )}
    </div>
  )
}
