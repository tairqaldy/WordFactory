'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Globe, BookOpen, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'ru', name: 'Russian', flag: 'RU' },
  { code: 'de', name: 'German', flag: 'DE' },
  { code: 'fr', name: 'French', flag: 'FR' },
  { code: 'es', name: 'Spanish', flag: 'ES' },
  { code: 'nl', name: 'Dutch', flag: 'NL' },
  { code: 'kz', name: 'Kazakh', flag: 'KZ' },
]

type Step = 'native' | 'learning' | 'welcome'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('native')
  const [nativeLanguage, setNativeLanguage] = useState('ru')
  const [learningLanguage, setLearningLanguage] = useState('en')
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      await supabase
        .from('user_settings')
        .update({
          native_language: nativeLanguage,
          learning_language: learningLanguage,
          onboarding_completed: true,
        })
        .eq('user_id', user.id)

      router.push('/create')
      router.refresh()
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLearningLanguages = LANGUAGES.filter(l => l.code !== nativeLanguage)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-6 py-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['native', 'learning', 'welcome'].map((s, i) => (
          <div
            key={s}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              step === s ? 'bg-blue-600 w-6' : 'bg-gray-300'
            )}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {step === 'native' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your native language
              </h1>
              <p className="text-gray-500">
                We will use this for creating associations
              </p>
            </div>

            <div className="space-y-2 mb-8">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setNativeLanguage(lang.code)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all',
                    nativeLanguage === lang.code
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <span className="text-2xl">{getFlagEmoji(lang.flag)}</span>
                  <span className="font-medium text-gray-900">{lang.name}</span>
                  {nativeLanguage === lang.code && (
                    <Check className="w-5 h-5 text-blue-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => setStep('learning')}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {step === 'learning' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Language to learn
              </h1>
              <p className="text-gray-500">
                Choose the language you want to master
              </p>
            </div>

            <div className="space-y-2 mb-8">
              {filteredLearningLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLearningLanguage(lang.code)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all',
                    learningLanguage === lang.code
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <span className="text-2xl">{getFlagEmoji(lang.flag)}</span>
                  <span className="font-medium text-gray-900">{lang.name}</span>
                  {learningLanguage === lang.code && (
                    <Check className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep('native')}
              >
                Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setStep('welcome')}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {step === 'welcome' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                You are all set!
              </h1>
              <p className="text-gray-500">
                Ready to create your first mnemonic card
              </p>
            </div>

            <Card className="p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">How it works:</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <span>Enter a word you want to learn</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <span>AI creates phonetic associations in your native language</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <span>A unique visual scene is generated to help you remember</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  <span>Review with spaced repetition for long-term memory</span>
                </li>
              </ol>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep('learning')}
              >
                Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleComplete}
                loading={loading}
              >
                Start Creating
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
