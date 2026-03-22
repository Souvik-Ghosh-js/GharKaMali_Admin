'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Edit2 } from 'lucide-react'

export default function AddonsPage() {
  const [addons, setAddons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const blank = { name:'', description:'', price:'', duration_mins:30, icon:'🌿', category:'care', is_active:true }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/addons').then(r => setAddons(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      if (editing) await api.put(`/admin/addons/${editing.id}`, form)
      else await api.post('/admin/addons', form)
      toast.success(editing ? 'Updated!' : 'Add-on created!')
      setShowForm(false); setEditing(null); setForm(blank); load()
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    setSaving(false)
  }

  const grouped = addons.reduce((g: any, a) => { const c = a.category||'other'; (g[c]=g[c]||[]).push(a); return g }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Add-On Services</h1><p className="text-sm text-gray-500">{addons.length} services</p></div>
        <button onClick={() => { setEditing(null); setForm(blank); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4"/>Add Service
        </button>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"/></div>
      : Object.entries(grouped).map(([cat, items]: any) => (
        <div key={cat}>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((a: any) => (
              <div key={a.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{a.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.duration_mins} min · {a.category}</p>
                    </div>
                  </div>
                  <button onClick={() => { setEditing(a); setForm({name:a.name,description:a.description,price:a.price,duration_mins:a.duration_mins,icon:a.icon,category:a.category,is_active:a.is_active}); setShowForm(true) }}
                    className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <Edit2 className="w-4 h-4 text-gray-400"/>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{a.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary-600">₹{a.price}</span>
                  <span className={a.is_active ? 'badge-green' : 'badge-red'}>{a.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit Add-On' : 'New Add-On Service'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {k:'icon',label:'Icon (emoji)',col:1},{k:'name',label:'Service Name *',col:1},
                {k:'price',label:'Price (₹) *',type:'number',col:1},{k:'duration_mins',label:'Duration (min)',type:'number',col:1},
                {k:'category',label:'Category',col:2},
              ].map(f => (
                <div key={f.k} className={f.col===2?'col-span-2':''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input className="input" type={f.type||'text'} value={(form as any)[f.k]}
                    onChange={e => setForm({...form,[f.k]:e.target.value})} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm({...form,description:e.target.value})}/>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form,is_active:e.target.checked})}/>
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving?'Saving...':editing?'Update':'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
