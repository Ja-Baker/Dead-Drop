import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/primitives/Button';
import './MemorialPage.css';

const REACTIONS = ['💀', '😭', '🕊️', '😂', '🖤', '⚰️', '🪦', '🥀'];

export const MemorialPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVault, user } = useStore();

  const vault = id ? getVault(id) : null;

  if (!vault) {
    return (
      <div className="memorial-page">
        <TopBar title="404" showBack />
        <div className="memorial-error">
          <p className="memorial-error-icon">🪦</p>
          <p className="memorial-error-text">NOTHING HERE YET</p>
          <Button onClick={() => navigate('/dashboard')}>BACK TO LIFE</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="memorial-page">
      <TopBar title="PREVIEW: AFTER DEATH" showBack />

      <div className="memorial-content">
        {/* Death Notice */}
        <div className="death-notice">
          <div className="death-notice-icon">💀</div>
          <h1 className="death-notice-title">IN MEMORY OF</h1>
          <h2 className="death-notice-name">{user?.name.toUpperCase()}</h2>
          <p className="death-notice-date">LAST SEEN: TODAY</p>
          <p className="death-notice-tagline">THEY DEAD. HERE'S THEIR SHIT.</p>
        </div>

        {/* Vault Info */}
        <div className="memorial-vault-header">
          <div className="memorial-vault-emoji">{vault.emoji}</div>
          <h3 className="memorial-vault-name">{vault.name}</h3>
          <p className="memorial-vault-meta">
            {vault.contentCount} items released • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content Display */}
        <div className="memorial-content-section">
          <h4 className="memorial-section-title">FINAL DROP</h4>
          {vault.contents.length === 0 ? (
            <div className="memorial-empty">
              <p>NO CONTENT</p>
              <p className="memorial-empty-sub">(they had nothing to say)</p>
            </div>
          ) : (
            <div className="memorial-items">
              {vault.contents.map((content) => (
                <div key={content.id} className="memorial-item">
                  <div className="memorial-item-type">{content.type.toUpperCase()}</div>
                  <div className="memorial-item-name">{content.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="memorial-reactions-section">
          <h4 className="memorial-section-title">REACTIONS</h4>
          <div className="memorial-reactions">
            {REACTIONS.map((emoji) => (
              <button key={emoji} className="memorial-reaction-btn" disabled>
                <span className="memorial-reaction-emoji">{emoji}</span>
                <span className="memorial-reaction-count">{Math.floor(Math.random() * 100)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="memorial-comments-section">
          <h4 className="memorial-section-title">COMMENTS</h4>
          <div className="memorial-comments-empty">
            <p>NO COMMENTS YET</p>
            <p className="memorial-comments-empty-sub">(nobody cares yet)</p>
          </div>
        </div>

        {/* CTA */}
        <div className="memorial-cta">
          <p className="memorial-cta-text">THIS IS WHAT PEOPLE SEE WHEN YOU'RE GONE</p>
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={() => navigate('/dashboard')}
          >
            BACK TO LIVING
          </Button>
        </div>
      </div>
    </div>
  );
};
