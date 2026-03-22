'use client'
import { useEffect, useState } from 'react'
import { getPlans, createPlan, updatePlan, applyPriceHike, getZones, getPriceHikeSchedules, schedulePriceHike, deletePriceHikeSchedule } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Zap, Clock, Trash2 } from 'lucide-react'

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'plans' | 'hike' | 'scheduled'>('plans')

  // Plan form
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [editPlan, setEditPlan] = useState<any>(null)
  const [planForm, setPlanForm] = useState({ name: '', plan_type: 'subscription', visits_per_month: 8, price: '', duration_days: 30, max_plants: 20, description: '', is_active: true })

  // Immediate price hike
  const [hikeForm, setHikeForm] = useState({ percentage: '', reason: '', zone_ids: [] as number[], plan_ids: [] as number[] })
  const [hikeSaving, setHikeSaving] = useState(false)

  // Scheduled price hike
  const [schedForm, setSchedForm] = useState({ name: '', percentage: '', reason: '', scheduled_at: '', zone_ids: [] as number[], plan_ids: [] as number[] })
  const [schedSaving, setSchedSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getPlans(), getZones(), getPriceHikeSchedules()])
      .then(([p, z, s]) => { setPlans(p.data.data); setZones(z.data.data); setSchedules(s.data.data) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const savePlan = async () => {
    try {
      if (editPlan) await updatePlan(editPlan.id, planForm)
      else await createPlan(planForm)
      toast.success(editPlan ? 'Plan updated!' : 'Plan created!')
      setShowPlanForm(false); setEditPlan(null)
      load()
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const applyHike = async () => {
    if (!hikeForm.percentage) { toast.error('Enter a percentage'); return }
    if (!hikeForm.zone_ids.length && !hikeForm.plan_ids.length) { toast.error('Select at least one zone or plan'); return }
    setHikeSaving(true)
    try {
      const res = await applyPriceHike(hikeForm)
      toast.success(`Price hike applied to ${res.data.data.length} items!`)
      setHikeForm({ percentage: '', reason: '', zone_ids: [], plan_ids: [] })
      load()
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    setHikeSaving(false)
  }

  const scheduleHike = async () => {
    if (!schedForm.percentage || !schedForm.scheduled_at) { toast.error('Fill in all required fields'); return }
    if (!schedForm.zone_ids.length && !schedForm.plan_ids.length) { toast.error('Select at least one zone or plan'); return }
    setSchedSaving(true)
    try {
      await schedulePriceHike(schedForm)
      toast.success('Price hike scheduled!')
      setSchedForm({ name: '', percentage: '', reason: '', scheduled_at: '', zone_ids: [], plan_ids: [] })
      load()
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    setSchedSaving(false)
  }

  const deleteSchedule = async (id: number) => {
    if (!confirm('Delete this scheduled hike?')) return
    try { await deletePriceHikeSchedule(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const toggleId = (arr: number[], id: number): number[] =>
    arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans & Pricing</h1>
          <p className="text-sm text-gray-500">{plans.length} plans · {zones.length} zones</p>
        </div>
        {tab === 'plans' && (
          <button onClick={() => { setEditPlan(null); setPlanForm({ name: '', plan_type: 'subscription', visits_per_month: 8, price: '', duration_days: 30, max_plants: 20, description: '', is_active: true }); setShowPlanForm(true) }}
            className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Plan</button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-gray-100 pb-0">
        {[['plans','Plans'],['hike','Apply Price Hike'],['scheduled','Scheduled Hikes']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === k ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : plans.map((p: any) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-base">{p.name}</p>
                  <span className={p.plan_type === 'subscription' ? 'badge-blue' : 'badge-gray'}>{p.plan_type}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-primary-600">₹{p.price}</p>
                  <p className="text-xs text-gray-400">{p.plan_type === 'subscription' ? '/month' : '/visit'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{p.description}</p>
              <div className="space-y-1 text-xs text-gray-500 mb-4">
                {p.plan_type === 'subscription' && <>
                  <div className="flex justify-between"><span>Visits/month</span><span className="font-medium">{p.visits_per_month}</span></div>
                  <div className="flex justify-between"><span>Max plants</span><span className="font-medium">{p.max_plants}</span></div>
                  <div className="flex justify-between"><span>Duration</span><span className="font-medium">{p.duration_days} days</span></div>
                </>}
                <div className="flex justify-between"><span>Status</span><span className={p.is_active ? 'text-green-600 font-medium' : 'text-red-500'}>{p.is_active ? 'Active' : 'Inactive'}</span></div>
              </div>
              <button onClick={() => { setEditPlan(p); setPlanForm({ name: p.name, plan_type: p.plan_type, visits_per_month: p.visits_per_month, price: p.price, duration_days: p.duration_days, max_plants: p.max_plants, description: p.description, is_active: p.is_active }); setShowPlanForm(true) }}
                className="btn-outline w-full text-xs py-1.5">Edit Plan</button>
            </div>
          ))}
        </div>
      )}

      {/* Apply Immediate Price Hike Tab */}
      {tab === 'hike' && (
        <div className="card p-6 max-w-2xl space-y-5">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Apply Immediate Price Hike</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hike % *</label>
              <input className="input" type="number" min="0.1" max="100" step="0.1" placeholder="e.g. 10"
                value={hikeForm.percentage} onChange={e => setHikeForm({...hikeForm, percentage: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input className="input" placeholder="e.g. Fuel cost increase"
                value={hikeForm.reason} onChange={e => setHikeForm({...hikeForm, reason: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Zones</label>
            <div className="flex flex-wrap gap-2">
              {zones.map((z: any) => (
                <button key={z.id} onClick={() => setHikeForm({...hikeForm, zone_ids: toggleId(hikeForm.zone_ids, z.id)})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${hikeForm.zone_ids.includes(z.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'}`}>
                  {z.name} ({z.city})
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Plans</label>
            <div className="flex flex-wrap gap-2">
              {plans.map((p: any) => (
                <button key={p.id} onClick={() => setHikeForm({...hikeForm, plan_ids: toggleId(hikeForm.plan_ids, p.id)})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${hikeForm.plan_ids.includes(p.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={applyHike} disabled={hikeSaving}
            className="btn-primary bg-orange-600 hover:bg-orange-700 disabled:opacity-60 flex items-center gap-2 w-auto px-6">
            <Zap className="w-4 h-4" />{hikeSaving ? 'Applying...' : `Apply ${hikeForm.percentage || 0}% Hike Now`}
          </button>
        </div>
      )}

      {/* Scheduled Hikes Tab */}
      {tab === 'scheduled' && (
        <div className="space-y-5 max-w-2xl">
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 text-indigo-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Schedule a Future Price Hike</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name *</label>
                <input className="input" placeholder="e.g. Q2 2025 Hike"
                  value={schedForm.name} onChange={e => setSchedForm({...schedForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Run At *</label>
                <input className="input" type="datetime-local"
                  value={schedForm.scheduled_at} onChange={e => setSchedForm({...schedForm, scheduled_at: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hike % *</label>
                <input className="input" type="number" min="0.1" placeholder="e.g. 5"
                  value={schedForm.percentage} onChange={e => setSchedForm({...schedForm, percentage: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input className="input" placeholder="Reason for hike"
                  value={schedForm.reason} onChange={e => setSchedForm({...schedForm, reason: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zones</label>
              <div className="flex flex-wrap gap-2">
                {zones.map((z: any) => (
                  <button key={z.id} onClick={() => setSchedForm({...schedForm, zone_ids: toggleId(schedForm.zone_ids, z.id)})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${schedForm.zone_ids.includes(z.id) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {z.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plans</label>
              <div className="flex flex-wrap gap-2">
                {plans.map((p: any) => (
                  <button key={p.id} onClick={() => setSchedForm({...schedForm, plan_ids: toggleId(schedForm.plan_ids, p.id)})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${schedForm.plan_ids.includes(p.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={scheduleHike} disabled={schedSaving} className="btn-primary disabled:opacity-60 flex items-center gap-2 w-auto px-6">
              <Clock className="w-4 h-4" />{schedSaving ? 'Scheduling...' : 'Schedule Hike'}
            </button>
          </div>

          {/* Existing schedules */}
          <div className="card">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-900">Upcoming Scheduled Hikes</div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>%</th><th>Scheduled At</th><th>Targets</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {schedules.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No scheduled hikes</td></tr>
                  ) : schedules.map((s: any) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.name || '—'}</td>
                      <td><span className="font-bold text-orange-600">{s.percentage}%</span></td>
                      <td className="text-xs">{new Date(s.scheduled_at).toLocaleString()}</td>
                      <td className="text-xs text-gray-500">
                        {s.zone_ids?.length > 0 && `${s.zone_ids.length} zones`}
                        {s.zone_ids?.length > 0 && s.plan_ids?.length > 0 && ' · '}
                        {s.plan_ids?.length > 0 && `${s.plan_ids.length} plans`}
                      </td>
                      <td>{s.is_applied ? <span className="badge-green">Applied</span> : <span className="badge-yellow">Pending</span>}</td>
                      <td>{!s.is_applied && <button onClick={() => deleteSchedule(s.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Plan Form Modal */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
              <button onClick={() => setShowPlanForm(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: 'name', label: 'Plan Name', type: 'text', col: 2 },
                { k: 'price', label: 'Price (₹)', type: 'number', col: 1 },
                { k: 'visits_per_month', label: 'Visits/Month', type: 'number', col: 1 },
                { k: 'max_plants', label: 'Max Plants', type: 'number', col: 1 },
                { k: 'duration_days', label: 'Duration (days)', type: 'number', col: 1 },
              ].map(f => (
                <div key={f.k} className={f.col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input className="input" type={f.type} value={(planForm as any)[f.k]}
                    onChange={e => setPlanForm({...planForm, [f.k]: e.target.value})} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="input" value={planForm.plan_type} onChange={e => setPlanForm({...planForm, plan_type: e.target.value})}>
                  <option value="subscription">Subscription</option>
                  <option value="ondemand">On-Demand</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input" rows={2} value={planForm.description}
                  onChange={e => setPlanForm({...planForm, description: e.target.value})} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={planForm.is_active}
                  onChange={e => setPlanForm({...planForm, is_active: e.target.checked})} />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowPlanForm(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={savePlan} className="btn-primary flex-1">{editPlan ? 'Update Plan' : 'Create Plan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
