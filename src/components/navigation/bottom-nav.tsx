'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PlusCircle, BookOpen, Layers, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/create', label: 'Create', icon: PlusCircle },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/cards', label: 'Cards', icon: Layers },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
