'use client'
import { useEffect, useState } from 'react'
import { getDashboard } from '@/lib/api'
import { Users, UserCheck, Calendar, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  completed: 'badge-green', pending: 'badge-yellow', assigned: 'badge-blue',
  cancelled: 'badge-red', in_progress: 'badge-blue', failed: 'badge-red'
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>

  const stats = data?.stats || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Customers" value={stats.totalCustomers} color="bg-blue-50 text-blue-600" />
        <StatCard icon={UserCheck} label="Active Gardeners" value={stats.totalGardeners} sub={`${stats.pendingGardeners || 0} pending approval`} color="bg-green-50 text-green-600" />
        <StatCard icon={CreditCard} label="Active Subscriptions" value={stats.activeSubscriptions} color="bg-purple-50 text-purple-600" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Today's Bookings" value={stats.todayBookings} color="bg-cyan-50 text-cyan-600" />
        <StatCard icon={CheckCircle} label="Completed Today" value={stats.completedToday} color="bg-green-50 text-green-600" />
        <StatCard icon={Clock} label="Pending Bookings" value={stats.pendingBookings} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={AlertCircle} label="Supervisors" value={stats.totalSupervisors} color="bg-indigo-50 text-indigo-600" />
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <a href="/admin/bookings" className="text-sm text-primary-600 hover:underline">View all</a>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Customer</th>
                <th>Gardener</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentBookings || []).map((b: any) => (
                <tr key={b.id}>
                  <td className="font-mono text-xs">{b.booking_number}</td>
                  <td>{b.customer?.name || '–'}</td>
                  <td>{b.gardener?.name || 'Unassigned'}</td>
                  <td>{b.scheduled_date}</td>
                  <td className="font-medium">₹{b.total_amount}</td>
                  <td><span className={statusColors[b.status] || 'badge-gray'}>{b.status}</span></td>
                </tr>
              ))}
              {!data?.recentBookings?.length && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
