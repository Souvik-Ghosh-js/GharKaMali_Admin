'use client'
import { useEffect, useState } from 'react'
import { getGardeners, approveGardener, rejectGardener, getSupervisors } from '@/lib/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react'

export default function GardenersPage() {
  const [gardeners, setGardeners] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [supervisorId, setSupervisorId] = useState('')

  const load = () => {
    setLoading(true)
    getGardeners({ status, search, page, limit: 20 })
      .then(r => { setGardeners(r.data.data.gardeners); setTotal(r.data.data.total) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status, search, page])
  useEffect(() => { getSupervisors().then(r => setSupervisors(r.data.data)).catch(console.error) }, [])

  const approve = async (userId: number) => {
    try {
      await approveGardener({ user_id: userId, supervisor_id: supervisorId ? Number(supervisorId) : undefined })
      toast.success('Gardener approved!')
      load()
    } catch { toast.error('Failed to approve') }
  }

  const reject = async (userId: number) => {
    if (!confirm('Reject this gardener?')) return
    try {
      await rejectGardener({ user_id: userId })
      toast.success('Gardener rejected')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gardeners</h1>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-gray-400" />
          <input className="input border-0 bg-transparent p-0 flex-1" placeholder="Search name or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex gap-2">
          {['pending', 'active', 'inactive', ''].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Gardener</th>
                <th>Phone</th>
                <th>City</th>
                <th>Experience</th>
                <th>Rating</th>
                <th>Jobs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : gardeners.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No gardeners found</td></tr>
              ) : gardeners.map((g: any) => (
                <tr key={g.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm">
                        {g.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{g.name}</p>
                        <p className="text-xs text-gray-400">{g.email || '–'}</p>
                      </div>
                    </div>
                  </td>
                  <td>{g.phone}</td>
                  <td>{g.city || '–'}</td>
                  <td>{g.gardenerProfile?.experience_years || 0} yrs</td>
                  <td>
                    {g.gardenerProfile?.rating ? (
                      <span className="flex items-center gap-1">⭐ {Number(g.gardenerProfile.rating).toFixed(1)}</span>
                    ) : '–'}
                  </td>
                  <td>{g.gardenerProfile?.completed_jobs || 0}</td>
                  <td>
                    {g.is_approved ? (
                      <span className="badge-green">Active</span>
                    ) : g.is_active ? (
                      <span className="badge-yellow">Pending</span>
                    ) : (
                      <span className="badge-red">Rejected</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(g)} className="p-1 hover:bg-gray-100 rounded" title="View">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      {!g.is_approved && g.is_active && (
                        <>
                          <button onClick={() => approve(g.id)} className="p-1 hover:bg-green-50 rounded" title="Approve">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                          <button onClick={() => reject(g.id)} className="p-1 hover:bg-red-50 rounded" title="Reject">
                            <XCircle className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Gardener Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-400">Name</span><p className="font-medium">{selected.name}</p></div>
                <div><span className="text-gray-400">Phone</span><p className="font-medium">{selected.phone}</p></div>
                <div><span className="text-gray-400">Email</span><p className="font-medium">{selected.email || '–'}</p></div>
                <div><span className="text-gray-400">City</span><p className="font-medium">{selected.city || '–'}</p></div>
                <div><span className="text-gray-400">Experience</span><p className="font-medium">{selected.gardenerProfile?.experience_years || 0} years</p></div>
                <div><span className="text-gray-400">Rating</span><p className="font-medium">{selected.gardenerProfile?.rating || 'N/A'}</p></div>
                <div><span className="text-gray-400">Total Jobs</span><p className="font-medium">{selected.gardenerProfile?.total_jobs || 0}</p></div>
                <div><span className="text-gray-400">Completed</span><p className="font-medium">{selected.gardenerProfile?.completed_jobs || 0}</p></div>
              </div>
              {selected.gardenerProfile?.bio && <div><span className="text-gray-400">Bio</span><p>{selected.gardenerProfile.bio}</p></div>}
            </div>
            {!selected.is_approved && selected.is_active && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700">Assign Supervisor (optional)</label>
                  <select className="input mt-1" value={supervisorId} onChange={e => setSupervisorId(e.target.value)}>
                    <option value="">No supervisor</option>
                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { approve(selected.id); setSelected(null) }} className="btn-primary flex-1">✓ Approve</button>
                  <button onClick={() => { reject(selected.id); setSelected(null) }} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">✗ Reject</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
