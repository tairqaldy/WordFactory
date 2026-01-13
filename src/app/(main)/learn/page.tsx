import { createClient } from '@/lib/supabase/server'

export default async function LearnPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get cards due for review
  const { data: dueCards, count } = await supabase
    .from('learning_progress')
    .select('*, cards(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .lte('next_review', new Date().toISOString())
    .limit(10)

  const dueCount = count || 0

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Learn</h1>
      <p className="text-gray-500 mb-6">Review your cards with spaced repetition</p>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {dueCount > 0 ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">{dueCount}</span>
            </div>
            <p className="text-gray-900 font-medium mb-1">Cards to review</p>
            <p className="text-gray-500 text-sm mb-4">Keep your memory fresh!</p>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Start Review
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No cards to review right now.</p>
            <p className="text-gray-400 text-sm mt-1">Create some cards to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
