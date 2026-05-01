'use client'
import { useEffect, useState } from 'react'
import { getUnassignedGardeners, assignMyGardener } from '@/lib/api'
import toast from 'react-hot-toast'
import { UserPlus, Search } from 'lucide-react'

export default function AddGardenerPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    getUnassignedGardeners()
      .then(r => setList(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const assign = async (id: number) => {
    setBusy(id)
    try {
      await assignMyGardener(id)
      toast.success('Added to your team')
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed')
    } finally {
      setBusy(null)
    }
  }

  const filtered = list.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (p.user?.name || '').toLowerCase().includes(q)
      || (p.user?.phone || '').toLowerCase().includes(q)
      || (p.user?.city || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Gardener to Your Team</h1>
        <p className="text-sm text-gray-500">Browse unassigned gardeners and bring them under your supervision.</p>
      </div>

      <div className="card p-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="input border-0 bg-transparent p-0 flex-1" placeholder="Search name, phone or city..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">No unassigned gardeners.</div>
        ) : filtered.map((p: any) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg">{p.user?.name?.[0]}</div>
              <div>
                <p className="font-semibold text-gray-900">{p.user?.name}</p>
                <p className="text-sm text-gray-500">{p.user?.phone}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between"><span className="text-gray-400">City</span><span>{p.user?.city || '–'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Experience</span><span>{p.experience_years || 0} yrs</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Rating</span><span>{p.rating ? `⭐ ${Number(p.rating).toFixed(1)}` : '–'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span>
                <span>{p.user?.is_approved ? <span className="badge-green">Active</span> : <span className="badge-yellow">Pending</span>}</span>
              </div>
            </div>
            <button
              onClick={() => assign(p.user.id)}
              disabled={busy === p.user.id}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> {busy === p.user.id ? 'Adding...' : 'Add to Team'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
