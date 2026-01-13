import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

export default async function CardsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: cards, count } = await supabase
    .from('cards')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalCards = count || 0

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
          <p className="text-gray-500">{totalCards} cards created</p>
        </div>
      </div>
      
      {cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} className="p-4">
              <div className="flex items-start gap-4">
                {card.image_url && (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img 
                      src={card.image_url} 
                      alt={card.word}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{card.word}</h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {card.pos}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{card.translation}</p>
                  {card.ipa && (
                    <p className="text-gray-400 text-xs mt-1">{card.ipa}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No cards yet.</p>
          <p className="text-gray-400 text-sm mt-1">Create your first card to get started!</p>
        </Card>
      )}
    </div>
  )
}
