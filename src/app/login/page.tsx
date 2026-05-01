'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { adminLogin } from '@/lib/api'
import Cookies from 'js-cookie'
import { Shield, UserCog } from 'lucide-react'

type Role = 'admin' | 'supervisor'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('admin')
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await adminLogin(form)
      const { token, user } = res.data.data

      // Enforce role match: tab choice must match account role
      if (user.role !== role) {
        toast.error(`This account is a ${user.role}. Switch the tab to "${user.role === 'admin' ? 'Admin' : 'Supervisor'}" to log in.`)
        setLoading(false)
        return
      }

      Cookies.set('admin_token', token, { expires: 30 })
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      toast.success(`Welcome, ${user.name}!`)
      router.push(user.role === 'supervisor' ? '/supervisor/dashboard' : '/admin/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const isSup = role === 'supervisor'

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
      isSup
        ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900'
        : 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900'
    }`}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
            isSup ? 'bg-indigo-600' : 'bg-primary-600'
          }`}>
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ghar Ka Mali</h1>
          <p className="text-gray-500 text-sm mt-1">{isSup ? 'Supervisor Portal' : 'Admin Portal'}</p>
        </div>

        {/* Slider tabs */}
        <div className="relative bg-gray-100 rounded-xl p-1 mb-6 flex">
          <div
            className={`absolute top-1 bottom-1 w-1/2 rounded-lg shadow transition-all duration-300 ${
              isSup ? 'left-1/2 bg-indigo-600' : 'left-1 bg-primary-600'
            }`}
            style={{ width: 'calc(50% - 4px)' }}
          />
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
              role === 'admin' ? 'text-white' : 'text-gray-600'
            }`}
          >
            <Shield className="w-4 h-4" /> Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('supervisor')}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
              role === 'supervisor' ? 'text-white' : 'text-gray-600'
            }`}
          >
            <UserCog className="w-4 h-4" /> Supervisor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input className="input" type="tel" placeholder="9999999999" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-base font-semibold text-white transition-colors disabled:opacity-60 ${
              isSup ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {loading ? 'Signing in...' : `Sign in as ${isSup ? 'Supervisor' : 'Admin'}`}
          </button>
        </form>

        {!isSup && (
          <p className="text-center text-xs text-gray-400 mt-6">Default: 9999999999 / Admin@123</p>
        )}
        {isSup && (
          <p className="text-center text-xs text-gray-400 mt-6">Supervisor accounts are created by an admin.</p>
        )}
      </div>
    </div>
  )
}
