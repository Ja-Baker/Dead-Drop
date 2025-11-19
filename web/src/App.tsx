import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VaultsPage from './pages/VaultsPage';
import VaultDetailPage from './pages/VaultDetailPage';
import ExecutorsPage from './pages/ExecutorsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import MemorialPage from './pages/MemorialPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth } = useAuthStore();
  
  // DEV BYPASS - REMOVE THIS FOR PRODUCTION
  useEffect(() => {
    if (!isAuthenticated) {
      const devBypass = async () => {
        try {
          const testEmail = `dev-${Date.now()}@test.com`;
          const testPassword = 'dev123456';
          
          try {
            const response = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                ageVerified: true,
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              setAuth(data.user, data.accessToken, data.refreshToken);
              return;
            }
          } catch (e) {
            // Signup failed, try login with existing test account
          }
          
          // Try login with a known test account
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'dev@test.com',
              password: 'dev123456',
            }),
          });
          
          if (loginResponse.ok) {
            const data = await loginResponse.json();
            setAuth(data.user, data.accessToken, data.refreshToken);
          }
        } catch (error) {
          console.error('Dev bypass failed:', error);
        }
      };
      
      devBypass();
    }
  }, [isAuthenticated, setAuth]);
  
  // Show loading while bypassing, or show content if authenticated
  if (!isAuthenticated) {
    return <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontSize: '18px',
    }}>AUTO-LOGGING IN...</div>;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/memorial/:vaultId" element={<MemorialPage />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="vaults" element={<VaultsPage />} />
        <Route path="vaults/:id" element={<VaultDetailPage />} />
        <Route path="executors" element={<ExecutorsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;

