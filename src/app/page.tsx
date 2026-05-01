'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('admin_user')
    const token = localStorage.getItem('admin_token')
    if (!raw || !token) { router.replace('/login'); return }
    try {
      const u = JSON.parse(raw)
      if (u.role === 'supervisor') router.replace('/supervisor/dashboard')
      else if (u.role === 'admin') router.replace('/admin/dashboard')
      else router.replace('/login')
    } catch { router.replace('/login') }
  }, [router])
  return <div className="min-h-screen bg-gray-50" />
}
