'use client'

import { ArrowRight, ArrowLeft, Image as ImageIcon, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CustomizeInput } from './customize-input'
import type { Scene, Anchor } from '@/types'

interface SceneStepProps {
  scene: Scene
  anchors: Anchor[]
  onConfirm: () => void
  onBack: () => void
  onCustomize: (customInstructions: string) => Promise<void>
  loading?: boolean
}

export function SceneStep({ scene, anchors, onConfirm, onBack, onCustomize, loading }: SceneStepProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Scene Preview
        </h2>
        <p className="text-gray-500 text-sm">
          Review the mnemonic scene structure
        </p>
      </div>

      <div className="mb-4">
        <CustomizeInput
          placeholder="e.g., 'Make it more colorful' or 'Add a background scene'"
          onSubmit={onCustomize}
          loading={loading}
          label="Customize Scene"
        />
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900">Main Object</span>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-center mb-4">
          <p className="text-lg font-bold text-blue-700">
            {scene.main_object}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Bindings</span>
          </div>

          {scene.bindings.map((binding, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-orange-600">
                {binding.anchor}
              </span>
              <span className="text-gray-400 text-sm">
                {binding.relation.replace(/_/g, ' ')}
              </span>
              <span className="font-medium text-green-600">
                {binding.target}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Your anchors:</h4>
        <div className="flex flex-wrap gap-2">
          {anchors.map((anchor, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200"
            >
              <span className="text-gray-500">{anchor.chunk}</span>
              <span className="mx-1 text-gray-300">-</span>
              <span className="font-medium text-gray-900">{anchor.anchor_word}</span>
            </span>
          ))}
        </div>
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
          Generate Image
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
