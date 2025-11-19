import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import './AuthPage.css';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { login, signup } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('FILL OUT THE DAMN FORM');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('WE NEED YOUR NAME');
      return;
    }

    if (mode === 'login') {
      login(email, password);
    } else {
      signup(email, password, name);
    }

    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">💀 DEAD DROP</h1>
          <p className="auth-tagline">
            {mode === 'login' ? 'STILL ALIVE?' : 'PREPARE TO DIE'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            LOGIN
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            SIGNUP
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Input
              type="text"
              label="NAME"
              placeholder="What should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <Input
            type="email"
            label="EMAIL"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            label="PASSWORD"
            placeholder="Make it good"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <Button type="submit" variant="primary" size="lg" fullWidth>
            {mode === 'login' ? 'ENTER' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        <button className="auth-back" onClick={() => navigate('/')}>
          ← BACK TO VOID
        </button>
      </div>
    </div>
  );
};
