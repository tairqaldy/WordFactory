'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Your Account</p>
              <p className="text-sm text-gray-500">Manage your settings</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <button className="flex items-center gap-4 w-full text-left">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Language Settings</p>
              <p className="text-sm text-gray-500">Change learning preferences</p>
            </div>
          </button>
        </Card>

        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
            loading={loading}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
