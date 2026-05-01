'use client'
import { useEffect, useState } from 'react'
import { getSupervisors, createSupervisor, updateSupervisor, deleteSupervisor, getGardeners } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, X, Pencil, Trash2, Users } from 'lucide-react'

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [allGardeners, setAllGardeners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [createForm, setCreateForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [editForm, setEditForm] = useState<any>({ name: '', phone: '', email: '', password: '', gardener_ids: [] as number[] })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getSupervisors().then(r => setSupervisors(r.data.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    load()
    getGardeners({ status: 'active', limit: 200 }).then(r => setAllGardeners(r.data.data.gardeners || [])).catch(() => {})
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createSupervisor(createForm)
      toast.success('Supervisor created')
      setShowCreate(false)
      setCreateForm({ name: '', phone: '', email: '', password: '' })
      load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const openEdit = (s: any) => {
    const teamIds = (s.team || []).map((t: any) => t.user_id).filter(Boolean)
    setEditForm({ name: s.name || '', phone: s.phone || '', email: s.email || '', password: '', gardener_ids: teamIds })
    setEditing(s)
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = { name: editForm.name, phone: editForm.phone, email: editForm.email, gardener_ids: editForm.gardener_ids }
      if (editForm.password) payload.password = editForm.password
      await updateSupervisor(editing.id, payload)
      toast.success('Supervisor updated')
      setEditing(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const remove = async (s: any) => {
    if (!confirm(`Delete supervisor "${s.name}"? Their team members will be unassigned.`)) return
    try {
      await deleteSupervisor(s.id)
      toast.success('Deleted'); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisors</h1>
          <p className="text-sm text-gray-500">{supervisors.length} supervisors</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Supervisor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : supervisors.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">No supervisors yet</div>
        ) : supervisors.map((s: any) => (
          <div key={s.id} className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg">{s.name?.[0]}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.phone}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><Pencil className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => remove(s)} className="p-1.5 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="truncate">{s.email || '–'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Joined</span><span>{new Date(s.created_at).toLocaleDateString()}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">Team</span>
                <span className="flex items-center gap-1 font-semibold"><Users className="w-3.5 h-3.5" /> {s.team_size || 0}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span>
                <span className={s.is_active ? 'badge-green' : 'badge-red'}>{s.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Add Supervisor</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { k: 'name', label: 'Full Name', type: 'text', required: true },
                { k: 'phone', label: 'Phone Number', type: 'tel', required: true },
                { k: 'email', label: 'Email', type: 'email', required: false },
                { k: 'password', label: 'Password', type: 'password', required: true },
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input className="input" type={f.type} required={f.required}
                    value={(createForm as any)[f.k]}
                    onChange={e => setCreateForm({ ...createForm, [f.k]: e.target.value })} />
                </div>
              ))}
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Edit Supervisor</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input className="input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="input" type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep)</label>
                <input className="input" type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Gardeners</label>
                <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto p-2 space-y-1">
                  {allGardeners.length === 0 && <p className="text-sm text-gray-400 p-2">No active gardeners</p>}
                  {allGardeners.map((g: any) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox"
                        checked={editForm.gardener_ids.includes(g.id)}
                        onChange={e => {
                          const ids = e.target.checked
                            ? [...editForm.gardener_ids, g.id]
                            : editForm.gardener_ids.filter((id: number) => id !== g.id)
                          setEditForm({ ...editForm, gardener_ids: ids })
                        }} />
                      <span>{g.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{g.phone}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
