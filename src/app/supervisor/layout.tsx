'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SupervisorSidebar from '@/components/layout/SupervisorSidebar'
import Header from '@/components/layout/Header'

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    if (!raw || !token) { router.replace('/login'); return }
    try {
      const u = JSON.parse(raw)
      if (u.role !== 'supervisor') {
        router.replace(u.role === 'admin' ? '/admin/dashboard' : '/login')
        return
      }
      setReady(true)
    } catch {
      router.replace('/login')
    }
  }, [router])

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
