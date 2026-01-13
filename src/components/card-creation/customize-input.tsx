'use client'

import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CustomizeInputProps {
  placeholder?: string
  onSubmit: (instruction: string) => Promise<void>
  loading?: boolean
  label?: string
}

export function CustomizeInput({ 
  placeholder = "Add custom instructions...", 
  onSubmit, 
  loading,
  label = "Customize"
}: CustomizeInputProps) {
  const [instruction, setInstruction] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instruction.trim() || loading) return

    const instructionText = instruction.trim()
    setInstruction('')
    await onSubmit(instructionText)
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={placeholder}
            className="text-sm"
            autoFocus
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!instruction.trim() || loading}
          loading={loading}
        >
          <Send className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsExpanded(false)
            setInstruction('')
          }}
        >
          Cancel
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Example: "Use a cat instead of a dog" or "Make the scene more colorful"
      </p>
    </form>
  )
}
