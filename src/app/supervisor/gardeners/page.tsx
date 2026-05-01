'use client'
import { useEffect, useState } from 'react'
import {
  getMyGardeners, approveMyGardener, rejectMyGardener, toggleMyGardener,
  unassignMyGardener, updateMyGardener, getMyGardenerDetail,
  giveReward, getGeofences, assignGardenerZones,
} from '@/lib/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Search, Power, UserMinus, Pencil, Gift, MapPin, X } from 'lucide-react'

export default function MyGardenersPage() {
  const [gardeners, setGardeners] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [detail, setDetail] = useState<any>(null)
  const [editing, setEditing] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [rewarding, setRewarding] = useState<any>(null)
  const [rewardForm, setRewardForm] = useState({ type: 'reward', amount: '', reason: '' })
  const [zoning, setZoning] = useState<any>(null)
  const [geofences, setGeofences] = useState<any[]>([])
  const [selectedZones, setSelectedZones] = useState<number[]>([])

  const load = () => {
    setLoading(true)
    getMyGardeners({ status, search, page, limit: 20 })
      .then(r => { setGardeners(r.data.data.gardeners); setTotal(r.data.data.total) })
      .catch(() => toast.error('Failed to load gardeners'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [status, search, page])
  useEffect(() => { getGeofences().then(r => setGeofences(r.data.data || [])).catch(() => {}) }, [])

  const approve = async (id: number) => {
    try { await approveMyGardener(id); toast.success('Approved'); load() }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }
  const reject = async (id: number) => {
    if (!confirm('Reject this gardener?')) return
    try { await rejectMyGardener(id); toast.success('Rejected'); load() }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }
  const toggle = async (id: number, isActive: boolean) => {
    try { await toggleMyGardener(id, !isActive); toast.success('Updated'); load() }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }
  const unassign = async (id: number) => {
    if (!confirm('Remove this gardener from your team?')) return
    try { await unassignMyGardener(id); toast.success('Removed'); load() }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const openDetail = async (id: number) => {
    try { const r = await getMyGardenerDetail(id); setDetail(r.data.data) }
    catch { toast.error('Failed to load detail') }
  }

  const openEdit = (g: any) => {
    setEditForm({
      name: g.name || '',
      email: g.email || '',
      city: g.city || '',
      bio: g.gardenerProfile?.bio || '',
      experience_years: g.gardenerProfile?.experience_years || 0,
      is_available: g.gardenerProfile?.is_available ?? true,
    })
    setEditing(g)
  }
  const saveEdit = async () => {
    try {
      await updateMyGardener(editing.id, editForm)
      toast.success('Saved'); setEditing(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const submitReward = async () => {
    if (!rewardForm.amount) { toast.error('Enter amount'); return }
    try {
      await giveReward({ gardener_id: rewarding.id, ...rewardForm })
      toast.success('Recorded')
      setRewarding(null); setRewardForm({ type: 'reward', amount: '', reason: '' })
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const openZones = (g: any) => {
    setSelectedZones((g.assignedGeofences || []).map((z: any) => z.geofence?.id).filter(Boolean))
    setZoning(g)
  }
  const saveZones = async () => {
    try {
      await assignGardenerZones(zoning.id, selectedZones)
      toast.success('Zones updated'); setZoning(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Gardeners</h1>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="input border-0 bg-transparent p-0 flex-1" placeholder="Search name or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'active', 'inactive'].map(s => (
            <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Gardener</th><th>Phone</th><th>City</th><th>Exp</th><th>Rating</th><th>Jobs</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : gardeners.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No gardeners. Add some from "Add Gardener".</td></tr>
              ) : gardeners.map((g: any) => (
                <tr key={g.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">{g.name?.[0]}</div>
                      <div>
                        <p className="font-medium text-gray-900">{g.name}</p>
                        <p className="text-xs text-gray-400">{g.email || '–'}</p>
                      </div>
                    </div>
                  </td>
                  <td>{g.phone}</td>
                  <td>{g.city || '–'}</td>
                  <td>{g.gardenerProfile?.experience_years || 0} yrs</td>
                  <td>{g.gardenerProfile?.rating ? <span className="flex items-center gap-1">⭐ {Number(g.gardenerProfile.rating).toFixed(1)}</span> : '–'}</td>
                  <td>{g.gardenerProfile?.completed_jobs || 0}</td>
                  <td>
                    {g.is_approved ? <span className="badge-green">Active</span>
                      : g.is_active ? <span className="badge-yellow">Pending</span>
                      : <span className="badge-red">Inactive</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDetail(g.id)} className="p-1 hover:bg-gray-100 rounded" title="View"><Eye className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => openEdit(g)} className="p-1 hover:bg-gray-100 rounded" title="Edit"><Pencil className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => openZones(g)} className="p-1 hover:bg-gray-100 rounded" title="Zones"><MapPin className="w-4 h-4 text-gray-500" /></button>
                      <button onClick={() => setRewarding(g)} className="p-1 hover:bg-yellow-50 rounded" title="Reward / Penalty"><Gift className="w-4 h-4 text-yellow-600" /></button>
                      {!g.is_approved && g.is_active && (
                        <>
                          <button onClick={() => approve(g.id)} className="p-1 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="w-4 h-4 text-green-600" /></button>
                          <button onClick={() => reject(g.id)} className="p-1 hover:bg-red-50 rounded" title="Reject"><XCircle className="w-4 h-4 text-red-500" /></button>
                        </>
                      )}
                      {g.is_approved && (
                        <button onClick={() => toggle(g.id, g.is_active)} className="p-1 hover:bg-orange-50 rounded" title={g.is_active ? 'Deactivate' : 'Activate'}>
                          <Power className={`w-4 h-4 ${g.is_active ? 'text-orange-600' : 'text-gray-400'}`} />
                        </button>
                      )}
                      <button onClick={() => unassign(g.id)} className="p-1 hover:bg-red-50 rounded" title="Remove from team"><UserMinus className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {total === 0 ? 0 : (page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{detail.gardener.name}</h2>
              <button onClick={() => setDetail(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="card p-3"><span className="text-gray-400 text-xs">Total</span><p className="font-bold text-lg">{detail.stats.totalBookings}</p></div>
              <div className="card p-3"><span className="text-gray-400 text-xs">Completed</span><p className="font-bold text-lg text-green-600">{detail.stats.completed}</p></div>
              <div className="card p-3"><span className="text-gray-400 text-xs">Cancelled</span><p className="font-bold text-lg text-red-600">{detail.stats.cancelled}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Phone</span><p className="font-medium">{detail.gardener.phone}</p></div>
              <div><span className="text-gray-400">Email</span><p className="font-medium">{detail.gardener.email || '–'}</p></div>
              <div><span className="text-gray-400">City</span><p className="font-medium">{detail.gardener.city || '–'}</p></div>
              <div><span className="text-gray-400">Experience</span><p className="font-medium">{detail.gardener.gardenerProfile?.experience_years || 0} years</p></div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm">Recent Bookings</h3>
              <div className="space-y-1 text-sm">
                {(detail.recentBookings || []).length === 0 && <p className="text-gray-400">No bookings</p>}
                {(detail.recentBookings || []).map((b: any) => (
                  <div key={b.id} className="flex justify-between border-b border-gray-100 py-2">
                    <span className="font-mono text-xs">{b.booking_number}</span>
                    <span>{b.customer?.name || '–'}</span>
                    <span>{b.scheduled_date}</span>
                    <span className="font-medium">₹{b.total_amount}</span>
                    <span className="text-xs uppercase tracking-wide">{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Gardener</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {[
              { k: 'name', label: 'Name' }, { k: 'email', label: 'Email' }, { k: 'city', label: 'City' },
              { k: 'experience_years', label: 'Experience (yrs)', type: 'number' },
            ].map(f => (
              <div key={f.k}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input className="input" type={(f as any).type || 'text'} value={editForm[f.k] ?? ''} onChange={e => setEditForm({ ...editForm, [f.k]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea className="input" rows={3} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editForm.is_available} onChange={e => setEditForm({ ...editForm, is_available: e.target.checked })} />
              Available for jobs
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={saveEdit} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Reward / Penalty Modal */}
      {rewarding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Reward / Penalty — {rewarding.name}</h2>
              <button onClick={() => setRewarding(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input" value={rewardForm.type} onChange={e => setRewardForm({ ...rewardForm, type: e.target.value })}>
                <option value="reward">Reward</option>
                <option value="penalty">Penalty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input className="input" type="number" value={rewardForm.amount} onChange={e => setRewardForm({ ...rewardForm, amount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input className="input" value={rewardForm.reason} onChange={e => setRewardForm({ ...rewardForm, reason: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRewarding(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={submitReward} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Zones Modal */}
      {zoning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Service Zones — {zoning.name}</h2>
              <button onClick={() => setZoning(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {geofences.length === 0 && <p className="text-sm text-gray-400">No zones available</p>}
              {geofences.map((gf: any) => (
                <label key={gf.id} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selectedZones.includes(gf.id)} onChange={e => {
                    setSelectedZones(prev => e.target.checked ? [...prev, gf.id] : prev.filter(id => id !== gf.id))
                  }} />
                  <span className="text-sm font-medium">{gf.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{gf.city}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setZoning(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={saveZones} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
