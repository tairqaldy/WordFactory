import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CardCreationFlow } from './card-creation-flow'

export default async function CreatePage() {
  const supabase = await createClient()
  
  // Check if user has completed onboarding
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!settings?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col px-4 py-6">
      <CardCreationFlow 
        learningLanguage={settings.learning_language}
        nativeLanguage={settings.native_language}
      />
    </div>
  )
}
