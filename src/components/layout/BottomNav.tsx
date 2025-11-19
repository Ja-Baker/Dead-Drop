import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'VAULTS', path: '/dashboard', icon: '🪦' },
  { label: 'GAMES', path: '/fun', icon: '💀' },
  { label: 'EXECUTORS', path: '/executors', icon: '⚰️' },
  { label: 'SETTINGS', path: '/settings', icon: '⚙️' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
