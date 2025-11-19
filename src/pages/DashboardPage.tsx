import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { ProofOfLifeButton } from '../components/features/ProofOfLifeButton';
import { VaultCard } from '../components/features/VaultCard';
import { Button } from '../components/primitives/Button';
import './DashboardPage.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { vaults, getDaysSinceCheckIn } = useStore();
  const daysSinceCheckIn = getDaysSinceCheckIn();

  return (
    <div className="dashboard-page">
      <TopBar title="DEAD DROP" />

      <div className="dashboard-content">
        <div className="dashboard-status">
          <h2 className="status-title">STATUS: ALIVE (FOR NOW)</h2>
          <p className="status-subtitle">
            Last seen:{' '}
            <span className={daysSinceCheckIn > 5 ? 'text-red' : ''}>
              {daysSinceCheckIn === 0 ? 'today' : `${daysSinceCheckIn} days ago`}
            </span>
            {daysSinceCheckIn > 5 && ' (concerning)'}
          </p>
        </div>

        <ProofOfLifeButton />

        <div className="dashboard-section">
          <div className="section-header">
            <h3 className="section-title">YOUR VAULTS</h3>
            <span className="section-count">{vaults.length}</span>
          </div>

          {vaults.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">🪦</p>
              <p className="empty-text">NO VAULTS YET</p>
              <p className="empty-subtext">IMMORTAL?</p>
            </div>
          ) : (
            <div className="vaults-grid">
              {vaults.map((vault) => (
                <VaultCard
                  key={vault.id}
                  id={vault.id}
                  emoji={vault.emoji}
                  name={vault.name}
                  contentCount={vault.contentCount}
                  triggerDays={vault.triggerDays}
                />
              ))}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/vault/create')}
          >
            + CREATE VAULT
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
