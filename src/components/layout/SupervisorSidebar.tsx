'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, UserCheck, Calendar, MessageSquareWarning,
  LogOut, Leaf, ChevronLeft, ChevronRight, Gift, UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import Cookies from 'js-cookie'
import clsx from 'clsx'

const links = [
  { href: '/supervisor/dashboard',   icon: LayoutDashboard,      label: 'Dashboard' },
  { href: '/supervisor/gardeners',   icon: UserCheck,             label: 'My Gardeners' },
  { href: '/supervisor/add-gardener',icon: UserPlus,              label: 'Add Gardener' },
  { href: '/supervisor/bookings',    icon: Calendar,              label: 'Bookings' },
  { href: '/supervisor/complaints',  icon: MessageSquareWarning,  label: 'Complaints' },
  { href: '/supervisor/rewards',     icon: Gift,                  label: 'Rewards & Penalties' },
]

export default function SupervisorSidebar() {
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
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Ghar Ka Mali</p>
              <p className="text-xs text-gray-400">Supervisor</p>
            </div>
          </div>
        )}
        {collapsed && <Leaf className="w-6 h-6 text-indigo-600 mx-auto" />}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-gray-100 ml-auto">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700',
                collapsed && 'justify-center px-2'
              )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={logout}
          className={clsx('w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50', collapsed && 'justify-center px-2')}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
