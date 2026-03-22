'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { ShieldCheck, AlertTriangle, Clock, Settings } from 'lucide-react'

const breachLabels: Record<string,string> = {
  late_arrival: 'Late Arrival', service_overtime: 'Service Overtime',
  no_start: 'No Start', no_completion: 'No Completion'
}

export default function SLAPage() {
  const [config, setConfig] = useState<any>({ max_arrival_delay_mins: 30, max_service_duration_hrs: 3, response_time_hrs: 24 })
  const [breaches, setBreaches] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [openBreaches, setOpenBreaches] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'breaches'|'config'>('breaches')
  const [savingConfig, setSavingConfig] = useState(false)
  const [resolvedFilter, setResolvedFilter] = useState('false')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/sla/config'),
      api.get('/admin/sla/breaches', { params: { is_resolved: resolvedFilter, limit: 25 } }),
      api.get('/admin/sla/breaches', { params: { is_resolved: 'false', limit: 1 } }),
    ]).then(([cfg, b, open]) => {
      setConfig(cfg.data.data)
      setBreaches(b.data.data.breaches)
      setTotal(b.data.data.total)
      setOpenBreaches(open.data.data.total)
    }).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [resolvedFilter])

  const saveConfig = async () => {
    setSavingConfig(true)
    try {
      await api.put('/admin/sla/config', config)
      toast.success('SLA config saved!')
    } catch { toast.error('Failed to save') }
    setSavingConfig(false)
  }

  const resolveBreach = async (id: number) => {
    try {
      await api.put(`/admin/sla/breaches/${id}/resolve`, {})
      toast.success('Breach resolved')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SLA Monitoring</h1>
          <p className="text-sm text-gray-500">Service Level Agreement breach tracking</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Open Breaches', value: openBreaches, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
          { label: 'Max Arrival Delay', value: `${config.max_arrival_delay_mins} min`, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Max Service Duration', value: `${config.max_service_duration_hrs} hrs`, icon: ShieldCheck, color: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {[['breaches','SLA Breaches'],['config','SLA Config']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===k?'border-primary-600 text-primary-600':'border-transparent text-gray-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Breaches tab */}
      {tab === 'breaches' && (
        <>
          <div className="flex gap-2">
            {[['false','Open'],['true','Resolved'],['','All']].map(([v,l]) => (
              <button key={v} onClick={() => setResolvedFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${resolvedFilter===v?'bg-primary-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Booking</th><th>Breach Type</th><th>Gardener</th><th>Delay</th><th>Detected</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                  ) : breaches.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">
                      {resolvedFilter === 'false' ? '✅ No open SLA breaches!' : 'No breaches found'}
                    </td></tr>
                  ) : breaches.map((b: any) => (
                    <tr key={b.id}>
                      <td className="font-mono text-xs text-primary-600">{b.booking?.booking_number}</td>
                      <td><span className="badge-red text-xs">{breachLabels[b.breach_type]||b.breach_type}</span></td>
                      <td className="text-sm">{b.gardener?.name||'–'}</td>
                      <td className="text-sm font-medium text-red-600">{b.delay_minutes ? `${b.delay_minutes} min` : '–'}</td>
                      <td className="text-xs text-gray-400">{new Date(b.detected_at).toLocaleString()}</td>
                      <td>{b.is_resolved ? <span className="badge-green">Resolved</span> : <span className="badge-red">Open</span>}</td>
                      <td>
                        {!b.is_resolved && (
                          <button onClick={() => resolveBreach(b.id)} className="text-xs text-primary-600 hover:underline font-medium">
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">{total} total breaches</p>
            </div>
          </div>
        </>
      )}

      {/* Config tab */}
      {tab === 'config' && (
        <div className="card p-6 max-w-lg space-y-5">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Settings className="w-5 h-5" />
            <span className="font-semibold">SLA Thresholds</span>
          </div>
          <p className="text-sm text-gray-500">Breaches are automatically detected when these thresholds are exceeded.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Arrival Delay (minutes)
              <span className="text-gray-400 font-normal ml-1">— gardener must arrive within this time of scheduled slot</span>
            </label>
            <input className="input" type="number" min="5" max="120"
              value={config.max_arrival_delay_mins}
              onChange={e => setConfig({...config, max_arrival_delay_mins: parseInt(e.target.value)})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Service Duration (hours)
              <span className="text-gray-400 font-normal ml-1">— flag if visit runs over this many hours</span>
            </label>
            <input className="input" type="number" min="0.5" max="12" step="0.5"
              value={config.max_service_duration_hrs}
              onChange={e => setConfig({...config, max_service_duration_hrs: parseFloat(e.target.value)})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complaint Response Time (hours)
              <span className="text-gray-400 font-normal ml-1">— target SLA for complaint resolution</span>
            </label>
            <input className="input" type="number" min="1" max="72"
              value={config.response_time_hrs}
              onChange={e => setConfig({...config, response_time_hrs: parseInt(e.target.value)})} />
          </div>

          <button onClick={saveConfig} disabled={savingConfig} className="btn-primary disabled:opacity-60">
            {savingConfig ? 'Saving...' : 'Save SLA Config'}
          </button>
        </div>
      )}
    </div>
  )
}
