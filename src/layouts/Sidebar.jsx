import { memo, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChart3, Coins, FileText, Gem, Tags, Users, X } from 'lucide-react'
import { cn } from '../utils/cn'
import { routePaths } from '../routes/routePaths'
import { useClickOutside } from '../hooks/useClickOutside'
import { useRef } from 'react'

export const Sidebar = memo(function Sidebar({ className, isOpen, onClose }) {
  const sidebarRef = useRef(null)
  useClickOutside(sidebarRef, () => {
    if (isOpen && onClose) onClose()
  })

  const items = useMemo(
    () => [
      { to: routePaths.analytics, label: 'Analytics', icon: BarChart3 },
      { to: routePaths.treasures, label: 'Treasures', icon: Gem },
      { to: routePaths.categories, label: 'Categories', icon: Tags },
      { to: routePaths.contents, label: 'Contents', icon: FileText },
      { to: routePaths.users, label: 'Users', icon: Users },
      { to: routePaths.transactions, label: 'Tips', icon: Coins },
    ],
    [],
  )

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-48 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 md:hidden">
          <p className="font-semibold text-slate-900">Menu</p>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <nav className="space-y-1">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === routePaths.analytics}
                onClick={() => isOpen && onClose && onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100',
                  )
                }
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
})
