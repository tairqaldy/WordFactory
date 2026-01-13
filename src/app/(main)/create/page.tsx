import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CreatePage() {
  const supabase = await createClient()
  
  // Check if user has completed onboarding
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('user_settings')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (!settings?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Card</h1>
      <p className="text-gray-500 mb-6">Enter a word to create a mnemonic card</p>
      
      {/* Card creation UI will be implemented in card-ui task */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-gray-400 text-center py-8">
          Card creation interface coming soon...
        </p>
      </div>
    </div>
  )
}
