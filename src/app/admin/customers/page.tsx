'use client'
import { useEffect, useState } from 'react'
import { getCustomers } from '@/lib/api'
import { Search } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<any>(null)

  const load = () => {
    setLoading(true)
    getCustomers({ search: search || undefined, page, limit: 20 })
      .then(r => { setCustomers(r.data.data.customers); setTotal(r.data.data.total) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, page])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">{total} registered customers</p>
      </div>

      <div className="card p-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input className="input border-0 bg-transparent p-0 flex-1" placeholder="Search by name or phone..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Customer</th><th>Phone</th><th>City</th><th>Total Spent</th><th>Wallet</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No customers found</td></tr>
              ) : customers.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">{c.name?.[0]}</div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email || '–'}</p>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.city || '–'}</td>
                  <td className="font-medium text-green-700">₹{Number(c.total_spent || 0).toLocaleString()}</td>
                  <td>₹{Number(c.wallet_balance || 0).toLocaleString()}</td>
                  <td className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => setSelected(c)} className="text-xs text-primary-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-xs disabled:opacity-40">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-outline text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Customer Profile</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Name', selected.name], ['Phone', selected.phone], ['Email', selected.email || '–'],
                ['City', selected.city || '–'], ['State', selected.state || '–'], ['Pincode', selected.pincode || '–'],
                ['Total Spent', `₹${Number(selected.total_spent || 0).toLocaleString()}`],
                ['Wallet', `₹${Number(selected.wallet_balance || 0).toLocaleString()}`],
                ['Referral Code', selected.referral_code || '–'],
                ['Joined', new Date(selected.created_at).toLocaleDateString()]
              ].map(([label, val]) => (
                <div key={label}><span className="text-gray-400 text-xs">{label}</span><p className="font-medium">{val}</p></div>
              ))}
              {selected.address && <div className="col-span-2"><span className="text-gray-400 text-xs">Address</span><p>{selected.address}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
