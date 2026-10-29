import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: {
    id: 'mgr-001',
    name: 'Marc Yao',
    email: 'marc.yao@caped-soubre.ci',
    role: 'Gérant Principal',
    cooperative: {
      id: 'coop-caped',
      name: 'Coopérative CAPED',
      fullName: 'Coopérative Agricole des Producteurs de l\'Éléphant et du Divo (CAPED)',
      locality: 'Soubré, Région de la Nawa',
      country: 'Côte d\'Ivoire',
      code: 'CAPED-SBR-01',
    },
    activeCampaign: 'Campagne Principale 2025 - 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  notifications: 3,
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  markNotificationsAsRead: () => set({ notifications: 0 }),
}))
