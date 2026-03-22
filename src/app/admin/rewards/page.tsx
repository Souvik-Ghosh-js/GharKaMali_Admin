'use client'
import { useEffect, useState } from 'react'
import { getRewards, createReward, getGardeners } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'

export default function RewardsPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [gardeners, setGardeners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ gardener_id: '', type: 'reward', amount: '', reason: '', description: '' })

  const load = () => {
    setLoading(true)
    getRewards({ type: type || undefined, page, limit: 20 })
      .then(r => { setItems(r.data.data.items); setTotal(r.data.data.total) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [type, page])
  useEffect(() => {
    getGardeners({ status: 'active', limit: 100 }).then(r => setGardeners(r.data.data.gardeners)).catch(console.error)
  }, [])

  const save = async () => {
    try {
      await createReward(form)
      toast.success(`${form.type === 'reward' ? 'Reward' : 'Penalty'} applied!`)
      setShowForm(false); setForm({ gardener_id: '', type: 'reward', amount: '', reason: '', description: '' }); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Rewards & Penalties</h1><p className="text-sm text-gray-500">{total} records</p></div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Entry</button>
      </div>

      <div className="card p-4 flex gap-2">
        {[['', 'All'], ['reward', 'Rewards'], ['penalty', 'Penalties']].map(([v, l]) => (
          <button key={v} onClick={() => { setType(v); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${type === v ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Gardener</th><th>Type</th><th>Amount</th><th>Reason</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                : items.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No records found</td></tr>
                : items.map((item: any) => (
                  <tr key={item.id}>
                    <td><p className="font-medium">{item.gardener?.name}</p><p className="text-xs text-gray-400">{item.gardener?.phone}</p></td>
                    <td>
                      <span className={`flex items-center gap-1 ${item.type === 'reward' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'reward' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {item.type}
                      </span>
                    </td>
                    <td className={`font-bold ${item.type === 'reward' ? 'text-green-700' : 'text-red-700'}`}>
                      {item.type === 'reward' ? '+' : '-'}₹{item.amount}
                    </td>
                    <td>{item.reason}</td>
                    <td><span className={item.status === 'applied' ? 'badge-green' : 'badge-yellow'}>{item.status}</span></td>
                    <td className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} · {total} total</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Reward / Penalty</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Gardener</label>
                <select className="input mt-1" value={form.gardener_id} onChange={e => setForm({ ...form, gardener_id: e.target.value })}>
                  <option value="">Select gardener</option>
                  {gardeners.map(g => <option key={g.id} value={g.id}>{g.name} ({g.phone})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Type</label>
                <div className="flex gap-3 mt-1">
                  {['reward', 'penalty'].map(t => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium ${form.type === t ? (t === 'reward' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600') : 'border-gray-200 text-gray-600'}`}>
                      {t === 'reward' ? '🎉 Reward' : '⚠️ Penalty'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Amount (₹)</label>
                <input type="number" className="input mt-1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Reason</label>
                <input className="input mt-1" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="High performance / Late arrival..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Description (optional)</label>
                <textarea className="input mt-1" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={save} className="btn-primary flex-1">Apply</button>
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
