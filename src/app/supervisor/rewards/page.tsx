'use client'
import { useEffect, useState } from 'react'
import { getMyRewards, giveReward, getMyGardeners } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, X } from 'lucide-react'

export default function MyRewardsPage() {
  const [items, setItems] = useState<any[]>([])
  const [gardeners, setGardeners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ gardener_id: '', type: 'reward', amount: '', reason: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getMyRewards().then(r => setItems(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    load()
    getMyGardeners({ limit: 100 }).then(r => setGardeners(r.data.data.gardeners || [])).catch(() => {})
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.gardener_id || !form.amount) { toast.error('Fill all fields'); return }
    setSaving(true)
    try {
      await giveReward({ ...form, gardener_id: Number(form.gardener_id) })
      toast.success('Recorded')
      setShow(false); setForm({ gardener_id: '', type: 'reward', amount: '', reason: '' })
      load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards & Penalties</h1>
          <p className="text-sm text-gray-500">{items.length} entries for your team</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Gardener</th><th>Type</th><th>Amount</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No entries yet</td></tr>
              ) : items.map((r: any) => (
                <tr key={r.id}>
                  <td className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>{r.gardener?.name || '–'}</td>
                  <td><span className={r.type === 'reward' ? 'badge-green' : 'badge-red'}>{r.type}</span></td>
                  <td className="font-medium">₹{r.amount}</td>
                  <td className="max-w-md truncate">{r.reason}</td>
                  <td><span className="badge-gray">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Entry</h2>
              <button onClick={() => setShow(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gardener</label>
                <select className="input" value={form.gardener_id} onChange={e => setForm({ ...form, gardener_id: e.target.value })} required>
                  <option value="">Select gardener</option>
                  {gardeners.map((g: any) => <option key={g.id} value={g.id}>{g.name} — {g.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="reward">Reward</option>
                  <option value="penalty">Penalty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input className="input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input className="input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShow(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
