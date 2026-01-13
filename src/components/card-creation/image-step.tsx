'use client'

import { ArrowRight, ArrowLeft, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CustomizeInput } from './customize-input'
import { Spinner } from '@/components/ui/spinner'

interface ImageStepProps {
  imageUrl: string | null
  imagePrompt: string
  generating: boolean
  onRegenerate: () => void
  onCustomize: (customInstructions: string) => Promise<void>
  onConfirm: () => void
  onBack: () => void
  loading?: boolean
}

export function ImageStep({
  imageUrl,
  imagePrompt,
  generating,
  onRegenerate,
  onCustomize,
  onConfirm,
  onBack,
  loading,
}: ImageStepProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Generated Image
        </h2>
        <p className="text-gray-500 text-sm">
          Visual scene to help you remember
        </p>
      </div>

      <div className="mb-4">
        <CustomizeInput
          placeholder="e.g., 'Make it more vibrant' or 'Add more detail to the background'"
          onSubmit={onCustomize}
          loading={loading || generating}
          label="Customize Image"
        />
      </div>

      <Card className="p-4 mb-6">
        <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
          {generating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-sm text-gray-500">Generating image...</p>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Mnemonic scene"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No image generated</p>
            </div>
          )}
        </div>

        {imageUrl && !generating && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3"
            onClick={onRegenerate}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        )}
      </Card>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-500 mb-1">Image prompt:</p>
        <p className="text-sm text-gray-700 line-clamp-3">{imagePrompt}</p>
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
          disabled={!imageUrl || generating}
          loading={loading}
        >
          Save Card
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
