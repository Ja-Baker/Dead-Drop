import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>YOUR FINAL DROP</h1>
        <p className="home-subtitle">
          You're gonna die. Your phone won't.
        </p>
        <p className="home-description">
          500GB of screenshots. 10,000 memes. Inside jokes nobody will understand.
          The real story of what happened that night. Your actual personality,
          compressed into folders labeled "if u see this im dead lol"
        </p>
      </div>

      <div className="home-actions">
        <Link to="/vaults" className="btn btn-primary">
          CREATE VAULT
        </Link>
        <Link to="/executors" className="btn btn-secondary">
          MANAGE EXECUTORS
        </Link>
      </div>

      <div className="home-stats">
        <div className="stat">
          <div className="stat-value">0</div>
          <div className="stat-label">VAULTS</div>
        </div>
        <div className="stat">
          <div className="stat-value">0</div>
          <div className="stat-label">EXECUTORS</div>
        </div>
        <div className="stat">
          <div className="stat-value">0</div>
          <div className="stat-label">DAYS ALIVE</div>
        </div>
      </div>

      {user && (
        <div className="home-tier">
          <p>TIER: {user.subscriptionTier.toUpperCase()}</p>
          {user.subscriptionTier === 'free' && (
            <Link to="/settings" className="upgrade-link">
              UPGRADE TO PREMIUM
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

