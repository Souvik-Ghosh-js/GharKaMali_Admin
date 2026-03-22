'use client'
import { useEffect, useState } from 'react'
import { getAllPayments } from '@/lib/api'

const statusColors: Record<string, string> = {
  success: 'badge-green', failed: 'badge-red', pending: 'badge-yellow', refunded: 'badge-blue'
}
const typeLabels: Record<string, string> = {
  booking: 'Booking', subscription: 'Subscription', wallet_topup: 'Wallet Top-up', refund: 'Refund'
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const totalRevenue = payments
    .filter((p: any) => p.status === 'success')
    .reduce((s: number, p: any) => s + Number(p.amount), 0)

  const load = () => {
    setLoading(true)
    getAllPayments({ status: status || undefined, type: type || undefined, page, limit: 25 })
      .then(r => { setPayments(r.data.data.payments); setTotal(r.data.data.total) })
      .catch(console.error).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [status, type, page])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">{total} transactions · ₹{totalRevenue.toLocaleString()} collected (this view)</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: total, color: 'text-blue-600' },
          { label: 'Revenue (Page)', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-green-600' },
          { label: 'Powered By', value: 'PayU', color: 'text-orange-500' },
          { label: 'Currency', value: 'INR', color: 'text-purple-600' },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {['', 'success', 'pending', 'failed', 'refunded'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All Status'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['', 'booking', 'subscription', 'wallet_topup'].map(t => (
            <button key={t} onClick={() => { setType(t); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${type === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t ? typeLabels[t] : 'All Types'}
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
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No payments found</td></tr>
              ) : payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-primary-600">{p.transaction_id}</td>
                  <td>
                    <div>
                      <p className="font-medium">{p.user?.name || '–'}</p>
                      <p className="text-xs text-gray-400">{p.user?.phone}</p>
                    </div>
                  </td>
                  <td>
                    <span className="badge-blue">{typeLabels[p.type] || p.type}</span>
                  </td>
                  <td className="capitalize">{p.payment_method || 'payu'}</td>
                  <td className="font-bold text-gray-900">₹{Number(p.amount).toLocaleString()}</td>
                  <td><span className={statusColors[p.status] || 'badge-gray'}>{p.status}</span></td>
                  <td className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{Math.min((page-1)*25+1,total)}–{Math.min(page*25,total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page*25>=total} onClick={() => setPage(p=>p+1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
