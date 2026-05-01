'use client'
import { useEffect, useState } from 'react'
import { getSupervisorDashboard } from '@/lib/api'
import { UserCheck, Calendar, CheckCircle, Clock, Activity, Users } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  completed: 'badge-green', pending: 'badge-yellow', assigned: 'badge-blue',
  cancelled: 'badge-red', in_progress: 'badge-blue', failed: 'badge-red',
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
    </div>
  )
}

export default function SupervisorDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupervisorDashboard().then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  const stats = data?.stats || {}
  const team = data?.team || []
  const recent = data?.recentBookings || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="My Gardeners"      value={stats.totalGardeners}    color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={UserCheck}  label="Active"             value={stats.activeGardeners}   color="bg-green-50 text-green-600" />
        <StatCard icon={Clock}      label="Pending Approval"   value={stats.pendingGardeners}  color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={Calendar}   label="Today's Bookings"   value={stats.todayBookings}     color="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} label="Completed Today"   value={stats.completedToday}    color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Activity}    label="In Progress"        value={stats.inProgress}        color="bg-cyan-50 text-cyan-600" />
        <StatCard icon={Clock}       label="Pending Bookings"   value={stats.pendingBookings}   color="bg-orange-50 text-orange-600" />
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Team</h2>
          <Link href="/supervisor/gardeners" className="text-sm text-indigo-600 hover:underline">Manage</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Gardener</th><th>Phone</th><th>City</th><th>Status</th><th>Available</th></tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No gardeners assigned yet. Add some from <Link href="/supervisor/add-gardener" className="text-indigo-600 underline">Add Gardener</Link>.</td></tr>
              ) : team.map((g: any) => (
                <tr key={g.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">{g.name?.[0]}</div>
                      <span className="font-medium text-gray-900">{g.name}</span>
                    </div>
                  </td>
                  <td>{g.phone}</td>
                  <td>{g.city || '–'}</td>
                  <td>
                    {g.is_approved ? <span className="badge-green">Active</span>
                      : g.is_active ? <span className="badge-yellow">Pending</span>
                      : <span className="badge-red">Inactive</span>}
                  </td>
                  <td>{g.gardenerProfile?.is_available ? <span className="badge-green">Yes</span> : <span className="badge-gray">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/supervisor/bookings" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Booking #</th><th>Customer</th><th>Gardener</th><th>Date</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No bookings yet</td></tr>
              ) : recent.map((b: any) => (
                <tr key={b.id}>
                  <td className="font-mono text-xs">{b.booking_number}</td>
                  <td>{b.customer?.name || '–'}</td>
                  <td>{b.gardener?.name || '–'}</td>
                  <td>{b.scheduled_date}</td>
                  <td className="font-medium">₹{b.total_amount}</td>
                  <td><span className={statusColors[b.status] || 'badge-gray'}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
