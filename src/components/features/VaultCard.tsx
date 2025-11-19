import { useNavigate } from 'react-router-dom';
import './VaultCard.css';

interface VaultCardProps {
  id: string;
  emoji: string;
  name: string;
  contentCount: number;
  triggerDays: number;
}

export const VaultCard = ({ id, emoji, name, contentCount, triggerDays }: VaultCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="vault-card"
      onClick={() => navigate(`/vault/${id}`)}
    >
      <div className="vault-emoji">{emoji}</div>
      <div className="vault-info">
        <h3 className="vault-name">{name}</h3>
        <div className="vault-meta">
          <span className="vault-count">{contentCount} items</span>
          <span className="vault-trigger">{triggerDays}d trigger</span>
        </div>
      </div>
    </div>
  );
};
