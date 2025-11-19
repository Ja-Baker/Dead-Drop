import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import './VaultsPage.css';

interface Vault {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  triggerType: string;
  contentCount: number;
  createdAt: string;
}

export default function VaultsPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVaults();
  }, []);

  const loadVaults = async () => {
    try {
      const response = await apiClient.get('/vaults');
      setVaults(response.data.vaults);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="vaults-page">
        <div className="loading">LOADING YOUR DEATH...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vaults-page">
        <div className="error-state">THIS FUCKED UP: {error}</div>
      </div>
    );
  }

  return (
    <div className="vaults-page">
      <div className="page-header">
        <h1>VAULTS</h1>
        <Link to="/vaults/new" className="btn btn-primary">
          CREATE VAULT
        </Link>
      </div>

      {vaults.length === 0 ? (
        <div className="empty-state">
          <p>No vaults yet. Immortal?</p>
          <Link to="/vaults/new" className="btn btn-primary">
            CREATE YOUR FIRST VAULT
          </Link>
        </div>
      ) : (
        <div className="vaults-grid">
          {vaults.map((vault) => (
            <Link key={vault.id} to={`/vaults/${vault.id}`} className="vault-card">
              <div className="vault-icon">{vault.icon || '📦'}</div>
              <div className="vault-name">{vault.name}</div>
              <div className="vault-meta">
                <span>{vault.contentCount} items</span>
                <span>{vault.triggerType}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

