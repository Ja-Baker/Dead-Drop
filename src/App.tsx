import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { MobileContainer } from './components/layout/MobileContainer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { VaultCreatePage } from './pages/VaultCreatePage';
import { VaultDetailPage } from './pages/VaultDetailPage';
import { ExecutorsPage } from './pages/ExecutorsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MemorialPage } from './pages/MemorialPage';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

// Public route wrapper (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <MobileContainer>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault/create"
            element={
              <ProtectedRoute>
                <VaultCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault/:id"
            element={
              <ProtectedRoute>
                <VaultDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executors"
            element={
              <ProtectedRoute>
                <ExecutorsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/memorial/:id"
            element={
              <ProtectedRoute>
                <MemorialPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileContainer>
    </BrowserRouter>
  );
}

export default App;
