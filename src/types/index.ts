// Database types
export interface User {
  id: string
  email: string
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  learning_language: string
  native_language: string
  preferences: {
    imagery?: 'high' | 'medium' | 'low'
    preferred_modalities?: ('audio' | 'text' | 'visual')[]
  }
  created_at: string
  updated_at: string
}

// Card creation types
export type PartOfSpeech = 'noun' | 'verb' | 'adjective'
export type SemanticClass = 'object' | 'action' | 'quality'

export interface WordAnalysis {
  normalized_word: string
  pos: PartOfSpeech
  ipa: string
  translation: string
  basic_meaning: string
  semantic_class: SemanticClass
  example_usage: string
}

export interface MeaningAnchor {
  type: SemanticClass
  main_entity: string
  action: string | null
  attribute: string | null
  context: string
}

export interface PhoneticChunk {
  chunk: string
  ipa: string
}

export interface Phonetics {
  ipa: string
  chunks: PhoneticChunk[]
}

export interface AnchorCandidate {
  word: string
  phonetic_similarity: number
  imageable: boolean
  frequency: 'high' | 'medium' | 'low'
}

export interface Anchor {
  chunk: string
  anchor_word: string
  score: number
  reason: string
}

export type BindingRelation = 
  | 'on' 
  | 'inside' 
  | 'attached_to' 
  | 'holding' 
  | 'wearing' 
  | 'embedded_in' 
  | 'label_on' 
  | 'orbiting'
  | 'sitting_on'
  | 'standing_on'

export interface Binding {
  anchor: string
  relation: BindingRelation
  target: string
}

export interface Scene {
  main_object: string
  bindings: Binding[]
  style: {
    visual: string
    background: string
    no_text: boolean
  }
}

export interface ImagePrompt {
  prompt: string
  negative_prompt: string
}

export interface Card {
  id: string
  user_id: string
  word: string
  pos: PartOfSpeech
  ipa: string
  translation: string
  analysis: WordAnalysis
  meaning_anchor: MeaningAnchor
  phonetics: Phonetics
  anchors: Anchor[]
  bindings: Binding[]
  scene: Scene
  image_url: string | null
  audio_url: string | null
  example: string
  example_translation: string
  created_at: string
}

export interface LearningProgress {
  id: string
  user_id: string
  card_id: string
  repetitions: number
  ease_factor: number
  interval: number
  next_review: string
  last_reviewed: string | null
}

// Card creation pipeline state
export type CardCreationStep = 
  | 'input'
  | 'analysis'
  | 'chunking'
  | 'anchors'
  | 'bindings'
  | 'scene'
  | 'image'
  | 'audio'
  | 'complete'

export interface CardCreationState {
  step: CardCreationStep
  word: string
  learning_language: string
  native_language: string
  analysis: WordAnalysis | null
  meaning_anchor: MeaningAnchor | null
  phonetics: Phonetics | null
  anchor_candidates: { chunk: string; candidates: AnchorCandidate[] }[] | null
  selected_anchors: Anchor[] | null
  bindings: Binding[] | null
  scene: Scene | null
  image_prompt: ImagePrompt | null
  image_url: string | null
  audio_url: string | null
}
