'use client'
import { Bell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const u = localStorage.getItem('admin_user')
    if (u) setUser(JSON.parse(u))
  }, [])

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="bg-gray-50 border-0 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Search..." />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{user?.name?.[0] || 'A'}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
