import logoCoopIA from '../../assets/logo.png'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Archive,
  Users,
  TriangleAlert,
  BarChart3,
  Sparkles,
  Leaf,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useRecoltesStore } from '../../store/recoltesStore'

export default function Sidebar({ drawerOpen, setDrawerOpen }) {
  const pendingCount = useRecoltesStore((state) => state.getPendingCount())

  const navItems = [
    { id: 'nav-dashboard', name: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      id: 'nav-recoltes',
      name: 'Récoltes',
      path: '/recoltes',
      icon: Archive,
      count: String(pendingCount),
    },
    { id: 'nav-planteurs', name: 'Planteurs', path: '/planteurs', icon: Users },
    {
      id: 'nav-diagnostics',
      name: 'Diagnostics',
      path: '/diagnostics',
      icon: TriangleAlert,
      dot: true,
    },
    {
      id: 'nav-analytics',
      name: 'Analyses BI',
      path: '/analytics',
      icon: BarChart3,
    },
    {
      id: 'nav-predictions',
      name: 'IA Prédiction',
      path: '/predictions',
      icon: Sparkles,
      sparkleBadge: true,
    },
  ]

  return (
    <aside
      id="sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0B1B13] text-white transition-transform duration-300 lg:translate-x-0',
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-[72px] items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <img
            src={logoCoopIA}
            alt="Logo CoopIA"
            className="h-10 w-10 rounded-[10px] object-cover bg-white/10 p-0.5 shadow-sm border border-white/20"
          />
          <div className="leading-tight">
            <span className="block text-[15px] font-semibold text-white">CoopIA</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
              MANAGER CI
            </span>
          </div>
        </div>
        {setDrawerOpen && (
          <button
            id="sidebar-close"
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-white/75 hover:bg-white/10 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <nav aria-label="Navigation principale" className="mt-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path} className="relative px-3">
                <NavLink
                  id={item.id}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/75 hover:bg-white/[0.06]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-[#C89D3C]"
                        />
                      )}
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                      <span className="flex-1">{item.name}</span>
                      {item.count && (
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white">
                          {item.count}
                        </span>
                      )}
                      {item.dot && (
                        <span
                          className="h-2 w-2 rounded-full bg-[#D92D20]"
                          role="img"
                          aria-label="Alertes à traiter"
                        />
                      )}
                      {item.sparkleBadge && (
                        <span
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-[#C89D3C]/40 bg-[#C89D3C]/20"
                          aria-hidden="true"
                        >
                          <Sparkles className="h-3 w-3 text-[#C89D3C]" strokeWidth={1.75} />
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between rounded-[10px] bg-white/10 px-3.5 py-3 text-[13px]">
          <span className="text-white/70">Campagne</span>
          <span className="font-semibold text-white">2025 - 2026</span>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 rounded-[6px] bg-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" aria-hidden="true" />
            <span>Synchronisé</span>
          </span>
        </div>
      </div>
    </aside>
  )
}
