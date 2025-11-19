import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { ProofOfLifeButton } from '../components/features/ProofOfLifeButton';
import { VaultCard } from '../components/features/VaultCard';
import { CountdownTimer } from '../components/features/CountdownTimer';
import { Button } from '../components/primitives/Button';
import './DashboardPage.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { vaults, getDaysSinceCheckIn } = useStore();
  const daysSinceCheckIn = getDaysSinceCheckIn();

  // Calculate next trigger (shortest vault trigger)
  const nextTrigger = vaults.length > 0
    ? Math.min(...vaults.map(v => v.triggerDays))
    : 180;

  return (
    <div className="dashboard-page">
      <TopBar title="DEAD DROP" />

      <div className="dashboard-content">
        {/* Status Banner */}
        <div className="dashboard-status">
          <h2 className="status-title rgb-split">STATUS: ALIVE (FOR NOW)</h2>
          <p className="status-subtitle">
            Last seen:{' '}
            <span className={daysSinceCheckIn > 5 ? 'text-red heartbeat' : ''}>
              {daysSinceCheckIn === 0 ? 'today' : `${daysSinceCheckIn} days ago`}
            </span>
            {daysSinceCheckIn > 5 && ' (concerning)'}
          </p>
        </div>

        {/* Proof of Life */}
        <ProofOfLifeButton />

        {/* Countdown Timer */}
        {vaults.length > 0 && (
          <CountdownTimer days={nextTrigger} />
        )}

        {/* Stats Grid */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{vaults.length}</div>
            <div className="stat-label">VAULTS</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {vaults.reduce((sum, v) => sum + v.contentCount, 0)}
            </div>
            <div className="stat-label">ITEMS</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{daysSinceCheckIn}</div>
            <div className="stat-label">DAYS QUIET</div>
          </div>
        </div>

        {/* Your Vaults */}
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

          <div className="dashboard-actions">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/vault/create')}
            >
              + CREATE VAULT
            </Button>

            {vaults.length > 0 && (
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => navigate(`/memorial/${vaults[0].id}`)}
              >
                👁️ PREVIEW YOUR DEATH
              </Button>
            )}
          </div>
        </div>

        {/* Dark Humor Section */}
        <div className="dashboard-reminder">
          <p className="reminder-text">
            YOU HAVEN'T CHECKED IN FOR {daysSinceCheckIn} {daysSinceCheckIn === 1 ? 'DAY' : 'DAYS'}
          </p>
          <p className="reminder-subtext">
            {daysSinceCheckIn === 0 && "GOOD. KEEP IT UP."}
            {daysSinceCheckIn > 0 && daysSinceCheckIn <= 7 && "WE'RE WATCHING."}
            {daysSinceCheckIn > 7 && daysSinceCheckIn <= 30 && "GETTING SUSPICIOUS."}
            {daysSinceCheckIn > 30 && daysSinceCheckIn <= 90 && "ARE YOU OK?"}
            {daysSinceCheckIn > 90 && "PROBABLY DEAD TBH."}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
