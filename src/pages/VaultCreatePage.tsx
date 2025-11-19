import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/primitives/Button';
import { Input } from '../components/primitives/Input';
import './VaultCreatePage.css';

const EMOJI_OPTIONS = ['💀', '⚰️', '🪦', '⛓️', '🩸', '🔥', '⚡', '💣', '🗡️', '🖤'];
const TRIGGER_OPTIONS = [
  { days: 90, label: '90 DAYS DEAD' },
  { days: 180, label: '180 DAYS DEAD' },
  { days: 365, label: '1 YEAR DEAD' },
  { days: 999, label: 'NEVER (COWARD)' },
];

export const VaultCreatePage = () => {
  const navigate = useNavigate();
  const { addVault } = useStore();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💀');
  const [triggerDays, setTriggerDays] = useState(180);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      setError('NAME YOUR VAULT');
      return;
    }

    addVault({
      name: name.trim(),
      emoji,
      triggerDays,
      contentCount: 0,
    });

    navigate('/dashboard');
  };

  return (
    <div className="vault-create-page">
      <TopBar title="CREATE VAULT" showBack />

      <div className="vault-create-content">
        <div className="create-section">
          <h3 className="create-label">NAME THIS VAULT</h3>
          <Input
            type="text"
            placeholder="My Final Words"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
          />
        </div>

        <div className="create-section">
          <h3 className="create-label">CHOOSE ICON</h3>
          <div className="emoji-grid">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                className={`emoji-option ${emoji === em ? 'selected' : ''}`}
                onClick={() => setEmoji(em)}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="create-section">
          <h3 className="create-label">WHEN TO DROP</h3>
          <div className="trigger-options">
            {TRIGGER_OPTIONS.map((option) => (
              <button
                key={option.days}
                className={`trigger-option ${triggerDays === option.days ? 'selected' : ''}`}
                onClick={() => setTriggerDays(option.days)}
              >
                <span className="trigger-radio">
                  {triggerDays === option.days ? '●' : '○'}
                </span>
                <span className="trigger-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="create-actions">
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={() => navigate('/dashboard')}
          >
            CANCEL (COWARD)
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCreate}
          >
            CREATE VAULT
          </Button>
        </div>
      </div>
    </div>
  );
};
