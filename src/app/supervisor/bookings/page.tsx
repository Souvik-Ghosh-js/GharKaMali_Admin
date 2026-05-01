'use client'
import { useEffect, useState } from 'react'
import { getMyBookings } from '@/lib/api'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  completed: 'badge-green', pending: 'badge-yellow', assigned: 'badge-blue',
  cancelled: 'badge-red', in_progress: 'badge-blue', failed: 'badge-red',
  en_route: 'badge-blue', arrived: 'badge-green',
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const load = () => {
    setLoading(true)
    getMyBookings({ status, page, limit: 20 })
      .then(r => { setBookings(r.data.data.bookings); setTotal(r.data.data.total) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [status, page])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500">{total} total bookings for your team</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-2">
        {['', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map(s => (
          <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s.replace('_', ' ') || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Booking #</th><th>Customer</th><th>Gardener</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No bookings</td></tr>
              ) : bookings.map((b: any) => (
                <tr key={b.id}>
                  <td className="font-mono text-xs">{b.booking_number}</td>
                  <td>{b.customer?.name || '–'}<div className="text-xs text-gray-400">{b.customer?.phone}</div></td>
                  <td>{b.gardener?.name || '–'}</td>
                  <td>{b.scheduled_date}</td>
                  <td>{b.scheduled_time || '–'}</td>
                  <td className="font-medium">₹{b.total_amount}</td>
                  <td><span className={statusColors[b.status] || 'badge-gray'}>{b.status?.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {total === 0 ? 0 : (page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
