'use client'
import { useEffect, useState } from 'react'
import { getAllBookings } from '@/lib/api'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  completed: 'badge-green', pending: 'badge-yellow', assigned: 'badge-blue',
  cancelled: 'badge-red', in_progress: 'badge-blue', failed: 'badge-red',
  en_route: 'badge-blue', arrived: 'badge-blue'
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)

  const load = () => {
    setLoading(true)
    getAllBookings({ status: status || undefined, date: date || undefined, page, limit: 20 })
      .then(r => { setBookings(r.data.data.bookings); setTotal(r.data.data.total) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status, date, page])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500">{total} total bookings</p>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input type="date" className="input w-auto" value={date} onChange={e => { setDate(e.target.value); setPage(1) }} />
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Gardener</th>
                <th>Zone</th>
                <th>Scheduled</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No bookings found</td></tr>
              ) : bookings.map((b: any) => (
                <tr key={b.id} className="cursor-pointer" onClick={() => setSelected(b)}>
                  <td className="font-mono text-xs text-primary-600">{b.booking_number}</td>
                  <td><span className={b.booking_type === 'subscription' ? 'badge-blue' : 'badge-gray'}>{b.booking_type}</span></td>
                  <td>{b.customer?.name || '–'}</td>
                  <td>{b.gardener?.name || <span className="text-gray-400 text-xs">Unassigned</span>}</td>
                  <td>{b.zone?.name || '–'}</td>
                  <td className="text-xs">{b.scheduled_date}</td>
                  <td className="font-medium">₹{b.total_amount}</td>
                  <td><span className={statusColors[b.status] || 'badge-gray'}>{b.status}</span></td>
                  <td>{b.rating ? `⭐ ${b.rating}` : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Booking Detail</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Booking #</span><p className="font-mono font-medium">{selected.booking_number}</p></div>
              <div><span className="text-gray-400">Status</span><p><span className={statusColors[selected.status]}>{selected.status}</span></p></div>
              <div><span className="text-gray-400">Customer</span><p>{selected.customer?.name} ({selected.customer?.phone})</p></div>
              <div><span className="text-gray-400">Gardener</span><p>{selected.gardener?.name || 'Unassigned'}</p></div>
              <div><span className="text-gray-400">Scheduled</span><p>{selected.scheduled_date} {selected.scheduled_time || ''}</p></div>
              <div><span className="text-gray-400">Zone</span><p>{selected.zone?.name || '–'}</p></div>
              <div><span className="text-gray-400">Plants</span><p>{selected.plant_count} {selected.extra_plants > 0 ? `+${selected.extra_plants} extra` : ''}</p></div>
              <div><span className="text-gray-400">Amount</span><p className="font-bold text-green-700">₹{selected.total_amount}</p></div>
              {selected.rating && <div><span className="text-gray-400">Rating</span><p>{'⭐'.repeat(selected.rating)} {selected.rating}/5</p></div>}
              {selected.review && <div className="col-span-2"><span className="text-gray-400">Review</span><p>{selected.review}</p></div>}
              {selected.gardener_notes && <div className="col-span-2"><span className="text-gray-400">Gardener Notes</span><p>{selected.gardener_notes}</p></div>}
            </div>
            <div className="flex gap-3">
              {selected.before_image && <img src={selected.before_image} className="w-1/2 rounded-lg border" alt="Before" />}
              {selected.after_image && <img src={selected.after_image} className="w-1/2 rounded-lg border" alt="After" />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
