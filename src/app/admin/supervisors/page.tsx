'use client'
import { useEffect, useState } from 'react'
import { getSupervisors, createSupervisor } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, X } from 'lucide-react'

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getSupervisors().then(r => setSupervisors(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createSupervisor(form)
      toast.success('Supervisor created!')
      setShowModal(false)
      setForm({ name: '', phone: '', email: '', password: '' })
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supervisors</h1>
          <p className="text-sm text-gray-500">{supervisors.length} supervisors</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
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
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg">
                {s.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.phone}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Email</span><span>{s.email || '–'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">City</span><span>{s.city || '–'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Joined</span><span>{new Date(s.created_at).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span>
                <span className={s.is_active ? 'badge-green' : 'badge-red'}>{s.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Add Supervisor</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
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
                  <input
                    className="input" type={f.type} required={f.required}
                    value={(form as any)[f.k]}
                    onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                  />
                </div>
              ))}
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create Supervisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
