import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import './ExecutorsPage.css';

export default function ExecutorsPage() {
  const [executors, setExecutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutors();
  }, []);

  const loadExecutors = async () => {
    try {
      const response = await apiClient.get('/executors');
      setExecutors(response.data.executors);
    } catch (err) {
      console.error('Failed to load executors:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">LOADING YOUR DEATH...</div>;
  }

  return (
    <div className="executors-page">
      <div className="page-header">
        <h1>EXECUTORS</h1>
        <button className="btn btn-primary">INVITE EXECUTOR</button>
      </div>

      {executors.length === 0 ? (
        <div className="empty-state">
          <p>No executors assigned. Trust issues?</p>
          <button className="btn btn-primary">INVITE YOUR FIRST EXECUTOR</button>
        </div>
      ) : (
        <div className="executors-list">
          {executors.map((executor) => (
            <div key={executor.id} className="executor-card">
              <div className="executor-info">
                <div className="executor-email">{executor.email}</div>
                <div className="executor-meta">
                  <span>{executor.accessLevel}</span>
                  <span>{executor.status}</span>
                  <span>{executor.vaultCount} vaults</span>
                </div>
              </div>
              <div className="executor-actions">
                <button className="btn-small">EDIT</button>
                <button className="btn-small btn-danger">REMOVE</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

