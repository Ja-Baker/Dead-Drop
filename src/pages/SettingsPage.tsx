import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { Button } from '../components/primitives/Button';
import './SettingsPage.css';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();

  const handleLogout = () => {
    if (confirm('ABANDON YOUR VAULTS?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="settings-page">
      <TopBar title="SETTINGS" />

      <div className="settings-content">
        <div className="settings-section">
          <h3 className="settings-title">ACCOUNT</h3>
          <div className="settings-item">
            <span className="settings-label">EMAIL</span>
            <span className="settings-value">{user?.email}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">NAME</span>
            <span className="settings-value">{user?.name}</span>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-title">DANGER ZONE</h3>
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={handleLogout}
          >
            LOGOUT
          </Button>
        </div>

        <div className="settings-footer">
          <p className="settings-version">DEAD DROP v0.1.0</p>
          <p className="settings-tagline">YOUR FINAL DROP</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
