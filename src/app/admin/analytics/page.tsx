'use client'
import { useEffect, useState } from 'react'
import { getAnalytics, getUtilizationReport } from '@/lib/api'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#16a34a', '#4ade80', '#86efac', '#bbf7d0', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444']

function ChartCard({ title, children, className = '' }: any) {
  return (
    <div className={`card p-5 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [utilization, setUtilization] = useState<any>(null)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    setLoading(true)
    getAnalytics({ period }).then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false))
    getUtilizationReport({ period }).then(r => setUtilization(r.data.data)).catch(console.error)
  }, [period])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>

  const revenueByDay = data?.revenueByDay || []
  const bookingsByZone = data?.bookingsByZone || []
  const bookingsByCity = data?.bookingsByCity || []
  const statusDist = data?.bookingStatusDist || []
  const planDist = data?.planDist || []
  const topGardeners = data?.topGardeners || []
  const customerLocations = data?.customerLocations || []
  const newUsersTrend = data?.newUsersTrend || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Traffic, bookings, and revenue insights</p>
        </div>
        <select className="input w-auto" value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${revenueByDay.reduce((s: number, d: any) => s + Number(d.revenue || 0), 0).toLocaleString()}`, color: 'text-green-600' },
          { label: 'Total Bookings', value: revenueByDay.reduce((s: number, d: any) => s + Number(d.bookings || 0), 0), color: 'text-blue-600' },
          { label: 'Active Cities', value: bookingsByCity.length, color: 'text-purple-600' },
          { label: 'Repeat Customers', value: data?.repeatCustomers || 0, color: 'text-orange-600' }
        ].map(c => (
          <div key={c.label} className="card p-4">
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue over time */}
      <ChartCard title="Revenue Over Time">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} name="Revenue (₹)" />
            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} name="Bookings" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookings by Zone */}
        <ChartCard title="Bookings by Zone">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsByZone.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="zone" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="total" fill="#16a34a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Booking Status Distribution */}
        <ChartCard title="Booking Status Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusDist} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status}: ${count}`}>
                {statusDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue by City */}
        <ChartCard title="Revenue by City">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsByCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="city" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Plan Distribution */}
        <ChartCard title="Subscription Plans Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={planDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, count }) => `${name}: ${count}`}>
                {planDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Customer Locations */}
      <ChartCard title="Customer Locations (Top Cities)">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>City</th>
                <th>State</th>
                <th>Customers</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {customerLocations.map((loc: any, i: number) => {
                const maxCount = customerLocations[0]?.count || 1
                const pct = Math.round((loc.count / maxCount) * 100)
                return (
                  <tr key={i}>
                    <td className="text-gray-400">{i + 1}</td>
                    <td className="font-medium">{loc.city || 'Unknown'}</td>
                    <td>{loc.state || '–'}</td>
                    <td className="font-semibold text-primary-600">{loc.count}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-primary-500 rounded-full h-2" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!customerLocations.length && <tr><td colSpan={5} className="text-center py-6 text-gray-400">No location data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Gardener Utilization */}
      {utilization && (
        <ChartCard title={`Gardener Utilization Rate (Last ${period} days)`}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Avg Utilization', value: `${utilization.summary?.avg_utilization_pct}%`, color: 'text-blue-600' },
              { label: 'Overloaded (>80%)', value: utilization.summary?.overloaded, color: 'text-red-600' },
              { label: 'Underutilized (<30%)', value: utilization.summary?.underutilized, color: 'text-yellow-600' },
            ].map(c => (
              <div key={c.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">{c.label}</p>
              </div>
            ))}
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Gardener</th><th>City</th><th>Utilization</th><th>Completed</th><th>Earnings</th><th>Rating</th></tr></thead>
              <tbody>
                {(utilization.gardeners || []).map((g: any) => {
                  const pct = Number(g.utilization_pct || 0)
                  const barColor = pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-gray-300'
                  return (
                    <tr key={g.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">{g.name?.[0]}</div>
                          <div><p className="font-medium text-sm">{g.name}</p><p className="text-xs text-gray-400">{g.phone}</p></div>
                        </div>
                      </td>
                      <td className="text-sm">{g.city || '–'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
                            <div className={`${barColor} h-2 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs font-semibold w-10">{pct}%</span>
                        </div>
                      </td>
                      <td className="text-sm">{g.completed} / {g.total_assigned}</td>
                      <td className="font-medium text-green-700">₹{Number(g.earnings || 0).toLocaleString()}</td>
                      <td>{g.rating ? <span className="flex items-center gap-1">⭐ {Number(g.rating).toFixed(1)}</span> : '–'}</td>
                    </tr>
                  )
                })}
                {!utilization.gardeners?.length && <tr><td colSpan={6} className="text-center py-6 text-gray-400">No data yet</td></tr>}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {/* Top Gardeners */}
      <ChartCard title="Top Performing Gardeners">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Gardener</th><th>Jobs Completed</th><th>Rating</th><th>Total Earnings</th></tr>
            </thead>
            <tbody>
              {topGardeners.map((g: any, i: number) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">{g.name?.[0]}</div>
                      {g.name}
                    </div>
                  </td>
                  <td>{g.completed_jobs}</td>
                  <td>
                    <span className="flex items-center gap-1">
                      ⭐ <span className="font-medium">{Number(g.rating).toFixed(1)}</span>
                    </span>
                  </td>
                  <td className="font-medium text-green-700">₹{Number(g.total_earnings || 0).toLocaleString()}</td>
                </tr>
              ))}
              {!topGardeners.length && <tr><td colSpan={4} className="text-center py-6 text-gray-400">No data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
