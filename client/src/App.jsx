import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { People } from './pages/People';
import { Vault } from './pages/Vault';
import { SplitAndCollect } from './pages/SplitAndCollect';
import { Planner } from './pages/Planner';
import { Settings } from './pages/Settings';

// Public root route: renders Landing if unauthenticated, redirects to /dashboard if authenticated
function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F766E] border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Root Route: Landing Page or Redirect to /dashboard */}
              <Route path="/" element={<HomeRoute />} />

              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Application Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/vault" element={<Vault />} />
                  <Route path="/segregation" element={<Navigate to="/vault" replace />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/split-collect" element={<SplitAndCollect />} />
                  <Route path="/people" element={<People />} />
                  <Route path="/contacts" element={<Navigate to="/people" replace />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Wildcard Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
