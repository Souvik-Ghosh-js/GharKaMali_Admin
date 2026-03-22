'use client'
import { useEffect, useState } from 'react'
import { getZones, createZone, updateZone, applyPriceHike, getPlans } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Edit2, TrendingUp } from 'lucide-react'

const emptyZone = { name: '', city: '', state: '', base_price: '', price_per_plant: '', min_plants: 5, radius_km: 5, description: '', is_active: true }

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(emptyZone)
  const [editId, setEditId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showHike, setShowHike] = useState(false)
  const [hike, setHike] = useState({ percentage: '', reason: '', zone_ids: [] as number[], plan_ids: [] as number[] })

  const load = () => {
    setLoading(true)
    Promise.all([getZones(), getPlans()])
      .then(([z, p]) => { setZones(z.data.data); setPlans(p.data.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (editId) await updateZone(editId, form)
      else await createZone(form)
      toast.success(editId ? 'Zone updated' : 'Zone created')
      setShowForm(false); setForm(emptyZone); setEditId(null); load()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error') }
  }

  const startEdit = (z: any) => { setForm(z); setEditId(z.id); setShowForm(true) }

  const doHike = async () => {
    try {
      await applyPriceHike(hike)
      toast.success('Price hike applied!'); setShowHike(false); load()
    } catch { toast.error('Failed to apply hike') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Service Zones</h1><p className="text-sm text-gray-500">{zones.length} zones configured</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowHike(true)} className="btn-outline flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Price Hike</button>
          <button onClick={() => { setForm(emptyZone); setEditId(null); setShowForm(true) }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Zone</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => <div key={i} className="card p-5 h-32 animate-pulse bg-gray-50" />) :
          zones.map(z => (
            <div key={z.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{z.name}</h3>
                  <p className="text-sm text-gray-500">{z.city}, {z.state}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={z.is_active ? 'badge-green' : 'badge-red'}>{z.is_active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => startEdit(z)} className="p-1 hover:bg-gray-100 rounded ml-1"><Edit2 className="w-3.5 h-3.5 text-gray-500" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400 text-xs">Base Price</span><p className="font-bold text-green-700">₹{z.base_price}</p></div>
                <div><span className="text-gray-400 text-xs">Per Plant</span><p className="font-medium">₹{z.price_per_plant}</p></div>
                <div><span className="text-gray-400 text-xs">Min Plants</span><p>{z.min_plants}</p></div>
                <div><span className="text-gray-400 text-xs">Radius</span><p>{z.radius_km} km</p></div>
              </div>
            </div>
          ))}
      </div>

      {/* Zone Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editId ? 'Edit Zone' : 'Add Zone'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['name', 'Zone Name', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text'],
                ['base_price', 'Base Price (₹)', 'number'], ['price_per_plant', 'Price Per Plant (₹)', 'number'],
                ['min_plants', 'Min Plants', 'number'], ['radius_km', 'Radius (km)', 'number']
              ].map(([key, label, type]) => (
                <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                  <label className="text-xs font-medium text-gray-600">{label}</label>
                  <input type={type} className="input mt-1" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Description</label>
                <textarea className="input mt-1" rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="is_active" className="text-sm">Active</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={save} className="btn-primary flex-1">Save Zone</button>
              <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Price Hike Modal */}
      {showHike && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Apply Price Hike</h2>
              <button onClick={() => setShowHike(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Hike Percentage (%)</label>
                <input type="number" className="input mt-1" value={hike.percentage} onChange={e => setHike({ ...hike, percentage: e.target.value })} placeholder="e.g. 10" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Reason</label>
                <input className="input mt-1" value={hike.reason} onChange={e => setHike({ ...hike, reason: e.target.value })} placeholder="Inflation adjustment" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Select Zones</label>
                <div className="mt-1 space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {zones.map(z => (
                    <label key={z.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={hike.zone_ids.includes(z.id)}
                        onChange={e => setHike({ ...hike, zone_ids: e.target.checked ? [...hike.zone_ids, z.id] : hike.zone_ids.filter(id => id !== z.id) })} />
                      {z.name} ({z.city}) — ₹{z.base_price}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Select Plans</label>
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto border rounded-lg p-2">
                  {plans.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={hike.plan_ids.includes(p.id)}
                        onChange={e => setHike({ ...hike, plan_ids: e.target.checked ? [...hike.plan_ids, p.id] : hike.plan_ids.filter(id => id !== p.id) })} />
                      {p.name} — ₹{p.price}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={doHike} className="btn-primary flex-1">Apply Hike</button>
              <button onClick={() => setShowHike(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
