'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, CreditCard, BarChart3, MapPin,
  Package, Gift, FileText, LogOut, Leaf, UserCheck, ChevronLeft,
  ChevronRight, Wallet, UserCog, MessageSquareWarning, ShieldCheck, Sparkles
} from 'lucide-react'
import { useState } from 'react'
import Cookies from 'js-cookie'
import clsx from 'clsx'

const links = [
  { href: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/analytics',    icon: BarChart3,        label: 'Analytics' },
  { href: '/admin/gardeners',    icon: UserCheck,        label: 'Gardeners' },
  { href: '/admin/supervisors',  icon: UserCog,          label: 'Supervisors' },
  { href: '/admin/customers',    icon: Users,            label: 'Customers' },
  { href: '/admin/bookings',     icon: Calendar,         label: 'Bookings' },
  { href: '/admin/subscriptions',icon: CreditCard,       label: 'Subscriptions' },
  { href: '/admin/payments',     icon: Wallet,           label: 'Payments' },
  { href: '/admin/zones',        icon: MapPin,           label: 'Service Zones' },
  { href: '/admin/plans',        icon: Package,          label: 'Plans & Pricing' },
  { href: '/admin/rewards',      icon: Gift,             label: 'Rewards & Penalties' },
  { href: '/admin/complaints',   icon: MessageSquareWarning, label: 'Complaints' },
  { href: '/admin/sla',           icon: ShieldCheck,          label: 'SLA Monitor' },
  { href: '/admin/addons',        icon: Sparkles,             label: 'Add-On Services' },
  { href: '/admin/content',      icon: FileText,         label: 'Content & SEO' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const logout = () => {
    Cookies.remove('admin_token')
    localStorage.clear()
    router.push('/login')
  }

  return (
    <aside className={clsx('h-screen flex flex-col bg-white border-r border-gray-100 transition-all duration-300 flex-shrink-0', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Ghar Ka Mali</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        )}
        {collapsed && <Leaf className="w-6 h-6 text-primary-600 mx-auto" />}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-gray-100 ml-auto">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={clsx('sidebar-link', pathname.startsWith(href) && 'active', collapsed && 'justify-center px-2')}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{label}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={logout}
          className={clsx('sidebar-link w-full text-red-600 hover:bg-red-50', collapsed && 'justify-center px-2')}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
