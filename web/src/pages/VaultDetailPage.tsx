import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import './VaultDetailPage.css';

export default function VaultDetailPage() {
  const { id } = useParams();
  const [vault, setVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVault();
    }
  }, [id]);

  const loadVault = async () => {
    try {
      const response = await apiClient.get(`/vaults/${id}`);
      setVault(response.data);
    } catch (err: any) {
      console.error('Failed to load vault:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">LOADING YOUR DEATH...</div>;
  }

  if (!vault) {
    return <div className="error-state">Vault not found</div>;
  }

  return (
    <div className="vault-detail-page">
      <div className="vault-header">
        <Link to="/vaults" className="back-link">← BACK TO VAULTS</Link>
        <h1>{vault.name}</h1>
      </div>

      <div className="vault-info">
        <div className="info-item">
          <label>TRIGGER TYPE</label>
          <span>{vault.triggerType}</span>
        </div>
        <div className="info-item">
          <label>CONTENT COUNT</label>
          <span>{vault.contentCount || 0}</span>
        </div>
        <div className="info-item">
          <label>ENCRYPTED</label>
          <span>{vault.isEncrypted ? 'YES' : 'NO'}</span>
        </div>
      </div>

      <div className="vault-actions">
        <button className="btn btn-primary">ADD CONTENT</button>
        <button className="btn btn-secondary">EDIT VAULT</button>
        <Link to={`/vaults/${id}/preview`} className="btn btn-secondary">
          PREVIEW
        </Link>
      </div>
    </div>
  );
}

