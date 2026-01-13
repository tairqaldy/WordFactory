'use client'

import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WordInputStepProps {
  onSubmit: (word: string) => void
  loading?: boolean
}

export function WordInputStep({ onSubmit, loading }: WordInputStepProps) {
  const [word, setWord] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (word.trim()) {
      onSubmit(word.trim().toLowerCase())
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Enter a word to learn
        </h2>
        <p className="text-gray-500 text-sm">
          We will create a mnemonic card to help you remember it
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="word"
          type="text"
          placeholder="e.g. caterpillar, beautiful, remember"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="text-lg py-4 text-center"
          autoFocus
          autoComplete="off"
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!word.trim()}
          loading={loading}
        >
          Analyze Word
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Tip: Start with common nouns, verbs, or adjectives
        </p>
      </div>
    </div>
  )
}
