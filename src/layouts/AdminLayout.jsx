import logoCoopIA from '../assets/logo.png'
import { useEffect, useState, useRef, useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Archive,
  Users,
  TriangleAlert,
  BarChart3,
  Sparkles,
  Leaf,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import { cn } from '../utils/cn'
import { useRecoltesStore } from '../store/recoltesStore'
import { useAuth } from '../context/AuthContext'
import { REAL_COOP_PLANTERS } from '../data/plantersData'

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const pendingCount = useRecoltesStore((state) => state.getPendingCount())
  const searchQuery = useRecoltesStore((state) => state.searchQuery)
  const setSearchQuery = useRecoltesStore((state) => state.setSearchQuery)
  const bordereaux = useRecoltesStore((state) => state.bordereaux)
  const setSelectedId = useRecoltesStore((state) => state.setSelectedId)

  // Raccourci clavier global ⌘K / Ctrl+K et Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = document.getElementById('global-search')
        if (input) {
          input.focus()
          input.select()
          setIsSearchOpen(true)
        }
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        const input = document.getElementById('global-search')
        if (input) input.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Clic en dehors pour fermer le panneau de recherche
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrage combiné 100% dynamique (Planteurs, Bordereaux, Diagnostics)
  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()
    if (!q) return { planters: [], bordereaux: [], diagnostics: [], total: 0 }

    // 1. Planteurs
    const matchedPlanters = REAL_COOP_PLANTERS.filter((p) => {
      const nom = (p.nom || '').toLowerCase()
      const village = (p.village || '').toLowerCase()
      const phone = (p.phone || '').toLowerCase()
      const crop = (p.crop || '').toLowerCase()
      return nom.includes(q) || village.includes(q) || phone.includes(q) || crop.includes(q)
    }).slice(0, 4)

    // 2. Bordereaux
    const matchedBordereaux = (bordereaux || []).filter((b) => {
      const code = (b.code || '').toLowerCase()
      const codeFormatted = (b.codeFormatted || '').toLowerCase()
      const planteur = (b.planteur || '').toLowerCase()
      const village = (b.village || '').toLowerCase()
      const crop = (b.crop || '').toLowerCase()
      return (
        code.includes(q) ||
        codeFormatted.includes(q) ||
        planteur.includes(q) ||
        village.includes(q) ||
        crop.includes(q)
      )
    }).slice(0, 4)

    // 3. Diagnostics
    const ALL_DIAGS = [
      { name: 'Pourriture brune des cabosses', village: 'Pindikro', severity: 'Critique' },
      { name: 'Swollen Shoot (Virus CSSV)', village: 'Soubré', severity: 'Critique' },
      { name: 'Mirides (Sahlbergella singularis)', village: 'Bodokro', severity: 'Modérée' },
      { name: 'Rouille orangée du caféier', village: 'Man', severity: 'Modérée' },
      { name: "Anthracnose de l'anacardier", village: 'Abobo', severity: 'Modérée' },
    ]
    const matchedDiagnostics = ALL_DIAGS.filter((d) => {
      const name = d.name.toLowerCase()
      const village = d.village.toLowerCase()
      return name.includes(q) || village.includes(q)
    }).slice(0, 3)

    const total = matchedPlanters.length + matchedBordereaux.length + matchedDiagnostics.length
    return {
      planters: matchedPlanters,
      bordereaux: matchedBordereaux,
      diagnostics: matchedDiagnostics,
      total,
    }
  }, [searchQuery, bordereaux])

  const handleSelectPlanter = (planter) => {
    setSearchQuery(planter.nom)
    setIsSearchOpen(false)
    navigate('/planteurs')
  }

  const handleSelectBordereau = (slip) => {
    setSearchQuery(slip.codeFormatted || slip.code)
    setSelectedId(slip.id)
    setIsSearchOpen(false)
    navigate('/recoltes')
  }

  const handleSelectDiagnostic = (diag) => {
    setSearchQuery(diag.name.split(' ')[0])
    setIsSearchOpen(false)
    navigate('/diagnostics')
  }

  const navItems = [
    { id: 'nav-dashboard', name: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      id: 'nav-recoltes',
      name: 'Récoltes',
      path: '/recoltes',
      icon: Archive,
      count: pendingCount > 0 ? String(pendingCount) : null,
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

  // Ferme le tiroir à chaque navigation
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink antialiased">
      {/* Overlay mobile */}
      {drawerOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 z-40 bg-forest-900/50 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        id="sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-forest-800 text-white transition-transform duration-300 lg:translate-x-0',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <img src={logoCoopIA} alt="Logo CoopIA" className="h-10 w-10 rounded-[10px] object-cover bg-white/10 p-0.5 shadow-sm border border-white/20" />
            <div className="leading-tight">
              <span className="block text-[15px] font-semibold text-white">CoopIA</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
                MANAGER CI
              </span>
            </div>
          </div>
          <button
            id="sidebar-close"
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-white/75 hover:bg-white/10 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
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
                            className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-gold"
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
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-gold/40 bg-gold/20"
                            aria-hidden="true"
                          >
                            <Sparkles className="h-3 w-3 text-gold" strokeWidth={1.75} />
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

        <div className="p-4 space-y-2.5 border-t border-white/10">
          <div className="flex items-center justify-between rounded-[10px] bg-white/10 px-3.5 py-2.5 text-[13px]">
            <span className="text-white/70">Campagne</span>
            <span className="font-semibold text-white">2025 - 2026</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-[6px] bg-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/80">
              <span className="h-2 w-2 rounded-full bg-[#22C55E]" aria-hidden="true" />
              <span>Synchronisé</span>
            </span>
            <button
              id="btn-sidebar-logout"
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 px-2.5 py-1.5 text-[11px] font-semibold text-red-200 hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Déconnexion de la session gérant"
            >
              <LogOut className="h-3.5 w-3.5 text-red-300" strokeWidth={2} />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ZONE PRINCIPALE */}
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              id="menu-toggle"
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-2 text-ink hover:bg-[#F4F1EB] lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>

            <div ref={searchContainerRef} className="relative w-full max-w-[460px]">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <input
                id="global-search"
                type="text"
                autoComplete="off"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearchOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchResults.planters.length > 0) {
                      handleSelectPlanter(searchResults.planters[0])
                    } else if (searchResults.bordereaux.length > 0) {
                      handleSelectBordereau(searchResults.bordereaux[0])
                    } else if (searchResults.diagnostics.length > 0) {
                      handleSelectDiagnostic(searchResults.diagnostics[0])
                    }
                  }
                }}
                placeholder="Rechercher un planteur, un bordereau..."
                aria-label="Rechercher un planteur ou un bordereau"
                className="h-11 w-full rounded-xl border border-line bg-[#F4F1EB] pl-10 pr-20 text-sm text-ink placeholder:text-ink-muted focus:border-forest-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-800/15 transition-all shadow-2xs"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setIsSearchOpen(false)
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-300 hover:bg-stone-400 text-ink hover:text-black cursor-pointer transition-colors"
                    title="Effacer la recherche"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                )}
                <kbd
                  onClick={() => {
                    const input = document.getElementById('global-search')
                    if (input) { input.focus(); setIsSearchOpen(true); }
                  }}
                  className="hidden rounded-md border border-line bg-white px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-muted sm:inline-block shadow-2xs cursor-pointer hover:border-forest-700 transition-colors"
                >
                  ⌘K
                </kbd>
              </div>

              {/* RÉSULTATS DE RECHERCHE EN DIRECT (DROPDOWN OMNIBOX) */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full min-w-[340px] sm:min-w-[480px] rounded-2xl border border-line bg-white/98 backdrop-blur-md shadow-2xl z-50 overflow-hidden divide-y divide-line/60 animate-fade-in">
                  {searchResults.total > 0 ? (
                    <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
                      {/* Section Planteurs */}
                      {searchResults.planters.length > 0 && (
                        <div>
                          <p className="px-2.5 py-1 text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-forest-700" />
                            Planteurs sociétaires ({searchResults.planters.length})
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {searchResults.planters.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectPlanter(p)}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#F4F1EB] transition-colors group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={p.avatar}
                                    alt={p.nom}
                                    className="h-8 w-8 rounded-full object-cover shrink-0 border border-line"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-ink group-hover:text-forest-900 truncate">
                                      {p.nom}
                                    </p>
                                    <p className="text-[11px] text-ink-muted truncate">
                                      {p.village} • {p.phone || '+225 07 00 00 00'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                    p.crop === 'cafe' ? 'bg-amber-50 text-amber-800' : p.crop === 'anacarde' ? 'bg-yellow-50 text-yellow-800' : 'bg-emerald-50 text-emerald-800'
                                  }`}>
                                    {p.crop ? p.crop.toUpperCase() : 'CACAO'}
                                  </span>
                                  <ArrowRight className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section Bordereaux */}
                      {searchResults.bordereaux.length > 0 && (
                        <div>
                          <p className="px-2.5 py-1 text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Archive className="h-3 w-3 text-emerald-700" />
                            Bordereaux de récolte ({searchResults.bordereaux.length})
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {searchResults.bordereaux.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => handleSelectBordereau(b)}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#F4F1EB] transition-colors group cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-mono font-bold text-ink group-hover:text-forest-900 truncate">
                                    {b.codeFormatted || b.code}
                                  </p>
                                  <p className="text-[11px] text-ink-muted truncate">
                                    {b.planteur} ({b.village}) • {b.sacs} sacs ({(b.poidsKg || 0).toLocaleString('fr-FR')} kg)
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                    b.statut === 'Validé' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}>
                                    {b.statut}
                                  </span>
                                  <ArrowRight className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section Diagnostics */}
                      {searchResults.diagnostics.length > 0 && (
                        <div>
                          <p className="px-2.5 py-1 text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                            <TriangleAlert className="h-3 w-3 text-red-600" />
                            Diagnostics sanitaires ({searchResults.diagnostics.length})
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {searchResults.diagnostics.map((d, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectDiagnostic(d)}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#F4F1EB] transition-colors group cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-ink group-hover:text-forest-900 truncate">
                                    {d.name}
                                  </p>
                                  <p className="text-[11px] text-ink-muted truncate">
                                    Foyer : {d.village}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                    d.severity === 'Critique' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}>
                                    {d.severity}
                                  </span>
                                  <ArrowRight className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-ink-muted mb-2">
                        <Search className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-ink">
                        Aucun résultat pour « {searchQuery} »
                      </p>
                      <p className="text-[11px] text-ink-muted mt-1 max-w-[320px] mx-auto">
                        Essayez avec le nom d'un planteur (ex: Amadou, Koffi), un village (ex: Soubré, Divo) ou un bordereau.
                      </p>
                    </div>
                  )}

                  {/* Footer du dropdown */}
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#FAF8F5] text-[10px] text-ink-muted font-medium">
                    <span>Navigation instantanée CoopIA</span>
                    <span>Appuyez sur <kbd className="px-1 py-0.5 bg-white border border-line rounded">Échap</kbd> pour fermer</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              id="coop-pill"
              className="hidden items-center gap-2 rounded-full bg-[#F1EEE8] px-3.5 py-2 text-[13px] font-medium text-ink md:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-forest-900" aria-hidden="true" />
              {user?.cooperative_name || 'Coopérative CAPED'}
            </span>



            <div id="user-profile" className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-800 text-sm font-semibold text-white shadow-2xs"
                aria-hidden="true"
              >
                {user?.first_name ? user.first_name[0].toUpperCase() : 'N'}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-semibold text-ink">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Noel Koffi'}
                </p>
                <p className="text-xs text-ink-muted">
                  {user?.role === 'COOP_ADMIN' ? 'Gérant' : 'Administrateur'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
