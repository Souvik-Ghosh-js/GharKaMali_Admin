'use client'
import { useEffect, useState } from 'react'
import { getAllSubscriptions } from '@/lib/api'

const statusColors: Record<string, string> = { active: 'badge-green', expired: 'badge-gray', cancelled: 'badge-red', paused: 'badge-yellow' }

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    getAllSubscriptions({ status: status || undefined, page, limit: 20 })
      .then(r => { setSubs(r.data.data.subscriptions); setTotal(r.data.data.total) })
      .catch(console.error).finally(() => setLoading(false))
  }, [status, page])

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1><p className="text-sm text-gray-500">{total} total</p></div>

      <div className="card p-4 flex gap-2">
        {['', 'active', 'expired', 'cancelled', 'paused'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Customer</th><th>Plan</th><th>Start</th><th>End</th><th>Visits</th><th>Amount</th><th>Auto Renew</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No subscriptions found</td></tr>
              ) : subs.map((s: any) => (
                <tr key={s.id}>
                  <td>
                    <p className="font-medium">{s.customer?.name}</p>
                    <p className="text-xs text-gray-400">{s.customer?.phone}</p>
                  </td>
                  <td><span className="badge-blue">{s.plan?.name}</span></td>
                  <td className="text-xs">{s.start_date}</td>
                  <td className="text-xs">{s.end_date}</td>
                  <td>{s.visits_used}/{s.visits_total}</td>
                  <td className="font-medium text-green-700">₹{s.amount_paid}</td>
                  <td>{s.auto_renew ? <span className="badge-green">Yes</span> : <span className="badge-gray">No</span>}</td>
                  <td><span className={statusColors[s.status] || 'badge-gray'}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} · {total} total</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
