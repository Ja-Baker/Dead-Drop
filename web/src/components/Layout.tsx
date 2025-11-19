import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { path: '/vaults', label: 'VAULTS' },
    { path: '/executors', label: 'EXECUTORS' },
    { path: '/settings', label: 'SETTINGS' },
    { path: '/profile', label: 'PROFILE' },
  ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-emoji">🪦</span>
            <span className="logo-text">DEAD DROP</span>
          </Link>
          <div className="header-right">
            {user && (
              <span className="user-tier">
                {user.subscriptionTier.toUpperCase()}
              </span>
            )}
            <button onClick={logout} className="logout-btn">
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

