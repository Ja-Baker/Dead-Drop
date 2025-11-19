import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Try again or give up.');
    } finally {
      setLoading(false);
    }
  };

  // BYPASS BUTTON - REMOVE THIS FOR PRODUCTION
  const handleBypass = async () => {
    setLoading(true);
    try {
      // Create test account and login
      const testEmail = `test-${Date.now()}@test.com`;
      const testPassword = 'test123456';
      
      try {
        await authService.signup({
          email: testEmail,
          password: testPassword,
          ageVerified: true,
        });
      } catch (signupErr: any) {
        // Account might already exist, try login
        if (signupErr.response?.status !== 409) {
          throw signupErr;
        }
        await authService.login({
          email: testEmail,
          password: testPassword,
        });
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bypass failed. Try again or give up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🪦 DEAD DROP</h1>
          <p>Still alive?</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'LOADING YOUR DEATH...' : 'LOGIN'}
          </button>
        </form>

        {/* BYPASS BUTTON - REMOVE THIS ENTIRE SECTION FOR PRODUCTION */}
        <div style={{ marginTop: '20px', padding: '16px', border: '2px dashed #ff0000', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#ff0000', marginBottom: '12px', textTransform: 'uppercase' }}>
            ⚠️ TEST BYPASS - REMOVE IN PRODUCTION
          </p>
          <button 
            onClick={handleBypass} 
            className="btn btn-secondary" 
            disabled={loading}
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            {loading ? 'CREATING TEST ACCOUNT...' : 'BYPASS (CREATE TEST ACCOUNT)'}
          </button>
        </div>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <Link to="/signup">SIGN UP</Link>
        </div>
      </div>
    </div>
  );
}

