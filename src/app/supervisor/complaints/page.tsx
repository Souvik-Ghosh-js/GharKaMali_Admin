'use client'
import { useEffect, useState } from 'react'
import { getMyComplaints, updateComplaint } from '@/lib/api'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  open: 'badge-yellow', in_progress: 'badge-blue', resolved: 'badge-green', closed: 'badge-gray',
}

export default function MyComplaintsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ status: 'in_progress', resolution_note: '' })

  const load = () => {
    setLoading(true)
    getMyComplaints().then(r => setItems(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const open = (c: any) => {
    setForm({ status: c.status || 'in_progress', resolution_note: c.resolution_note || '' })
    setEditing(c)
  }
  const save = async () => {
    try {
      await updateComplaint(editing.id, form)
      toast.success('Updated')
      setEditing(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <p className="text-sm text-gray-500">{items.length} complaints involving your gardeners</p>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Customer</th><th>Gardener</th><th>Subject</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No complaints</td></tr>
              ) : items.map((c: any) => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                  <td>{c.customer?.name || '–'}</td>
                  <td>{c.gardener?.name || '–'}</td>
                  <td className="max-w-sm truncate">{c.subject || c.description || '–'}</td>
                  <td><span className={statusColors[c.status] || 'badge-gray'}>{c.status}</span></td>
                  <td className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td><button onClick={() => open(c)} className="text-indigo-600 text-sm hover:underline">Update</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Update Complaint #{editing.id}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Note</label>
              <textarea className="input" rows={4} value={form.resolution_note} onChange={e => setForm({ ...form, resolution_note: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
