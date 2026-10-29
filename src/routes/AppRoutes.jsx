import React from 'react'
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import RecoltesManagement from '../pages/admin/RecoltesManagement'
import PlantersManagement from '../pages/admin/PlantersManagement'
import DiagnosticsManagement from '../pages/admin/DiagnosticsManagement'
import Analytics from '../pages/admin/Analytics'
import PredictionsManagement from '../pages/admin/PredictionsManagement'
import Login from '../pages/auth/Login'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

// Détection de l'environnement Desktop (file:// ou Electron)
const isDesktopOrFile = typeof window !== 'undefined' && (
  Boolean(window.electronAPI) || window.location.protocol === 'file:'
);

const Router = isDesktopOrFile ? HashRouter : BrowserRouter;

export default function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          {/* Page d'authentification Gérant */}
          <Route path="/login" element={<Login />} />

          {/* Espace d'administration protégé */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="recoltes" element={<RecoltesManagement />} />
            <Route path="planteurs" element={<PlantersManagement />} />
            <Route path="diagnostics" element={<DiagnosticsManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="predictions" element={<PredictionsManagement />} />
            {/* Redirection vers le tableau de bord */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}
