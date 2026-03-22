'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { AlertTriangle, CheckCircle, Clock, Flame } from 'lucide-react'

const statusColors: Record<string,string> = {
  open: 'badge-red', in_review: 'badge-yellow', resolved: 'badge-green', closed: 'badge-gray'
}
const priorityColors: Record<string,string> = {
  high: 'text-red-600 bg-red-50', medium: 'text-yellow-700 bg-yellow-50', low: 'text-gray-600 bg-gray-100'
}
const typeLabels: Record<string,string> = {
  service_quality:'Service Quality', late_arrival:'Late Arrival', no_show:'No Show',
  rude_behavior:'Rude Behavior', billing:'Billing Issue', damage:'Property Damage', other:'Other'
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const [resolveForm, setResolveForm] = useState({ status: '', resolution_notes: '', assigned_to: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/complaints', { params: { status: statusFilter||undefined, priority: priorityFilter||undefined, page, limit: 20 } }),
      api.get('/complaints/stats'),
    ]).then(([c, s]) => {
      setComplaints(c.data.data.complaints)
      setTotal(c.data.data.total)
      setStats(s.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [statusFilter, priorityFilter, page])

  const update = async () => {
    if (!resolveForm.status) { toast.error('Select a status'); return }
    setSaving(true)
    try {
      await api.put(`/complaints/${selected.id}`, resolveForm)
      toast.success('Complaint updated!')
      setSelected(null)
      setResolveForm({ status: '', resolution_notes: '', assigned_to: '' })
      load()
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <p className="text-sm text-gray-500">{total} total complaints</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Open', value: stats.open, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
            { label: 'In Review', value: stats.inReview, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            { label: 'High Priority', value: stats.highPriority, icon: Flame, color: 'text-orange-600 bg-orange-50' },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {['','open','in_review','resolved','closed'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter===s?'bg-primary-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s||'All Status'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['','high','medium','low'].map(p => (
            <button key={p} onClick={() => { setPriorityFilter(p); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${priorityFilter===p?'bg-indigo-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p||'All Priority'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>ID</th><th>Customer</th><th>Type</th><th>Priority</th><th>Gardener</th><th>Assigned To</th><th>Status</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
              ) : complaints.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No complaints found</td></tr>
              ) : complaints.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-mono text-xs text-primary-600">#{c.id}</td>
                  <td>
                    <div><p className="font-medium text-sm">{c.customer?.name}</p><p className="text-xs text-gray-400">{c.customer?.phone}</p></div>
                  </td>
                  <td className="text-sm">{typeLabels[c.type]||c.type}</td>
                  <td><span className={`text-xs font-semibold px-2 py-1 rounded-md ${priorityColors[c.priority]}`}>{c.priority}</span></td>
                  <td className="text-sm">{c.gardener?.name||'–'}</td>
                  <td className="text-sm">{c.assignedTo?.name||<span className="text-gray-400">Unassigned</span>}</td>
                  <td><span className={statusColors[c.status]||'badge-gray'}>{c.status.replace('_',' ')}</span></td>
                  <td className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => { setSelected(c); setResolveForm({ status: c.status, resolution_notes: c.resolution_notes||'', assigned_to: c.assigned_to||'' }) }}
                      className="text-xs text-primary-600 hover:underline font-medium">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{Math.min((page-1)*20+1,total)}–{Math.min(page*20,total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page*20>=total} onClick={() => setPage(p=>p+1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {/* Detail / Resolve Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Complaint #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="font-medium">{typeLabels[selected.type]}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Customer</span><span className="font-medium">{selected.customer?.name} ({selected.customer?.phone})</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Gardener</span><span className="font-medium">{selected.gardener?.name||'–'}</span></div>
              {selected.booking && <div className="flex justify-between"><span className="text-gray-400">Booking</span><span className="font-medium">{selected.booking?.booking_number}</span></div>}
              <div className="flex justify-between"><span className="text-gray-400">Raised</span><span className="font-medium">{new Date(selected.created_at).toLocaleString()}</span></div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Customer Description</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">{selected.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select className="input" value={resolveForm.status} onChange={e => setResolveForm({...resolveForm, status: e.target.value})}>
                  <option value="">Select status</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
                <textarea className="input" rows={3} placeholder="Describe how this was resolved..."
                  value={resolveForm.resolution_notes}
                  onChange={e => setResolveForm({...resolveForm, resolution_notes: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setSelected(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={update} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? 'Saving...' : 'Update Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
