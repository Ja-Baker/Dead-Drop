import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import './VaultDetailPage.css';

export const VaultDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVault, deleteVault, addContentToVault } = useStore();

  const vault = id ? getVault(id) : null;

  if (!vault) {
    return (
      <div className="vault-detail-page">
        <TopBar title="VAULT NOT FOUND" showBack />
        <div className="vault-error">
          <p>🪦</p>
          <p>THIS VAULT DOESN'T EXIST</p>
          <Button onClick={() => navigate('/dashboard')}>GO BACK</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('DELETE THIS VAULT FOREVER?')) {
      deleteVault(vault.id);
      navigate('/dashboard');
    }
  };

  const handleAddContent = () => {
    // Mock adding content
    const contentTypes = ['image', 'text', 'video', 'audio'] as const;
    const randomType = contentTypes[Math.floor(Math.random() * contentTypes.length)];

    addContentToVault(vault.id, {
      type: randomType,
      name: `Mock ${randomType} ${Date.now()}`,
    });
  };

  return (
    <div className="vault-detail-page">
      <TopBar title={vault.name} showBack />

      <div className="vault-detail-content">
        <div className="vault-header">
          <div className="vault-header-emoji">{vault.emoji}</div>
          <div className="vault-header-info">
            <h2 className="vault-header-name">{vault.name}</h2>
            <div className="vault-header-meta">
              <span>{vault.contentCount} ITEMS</span>
              <span>•</span>
              <span>{vault.triggerDays}D TRIGGER</span>
            </div>
          </div>
        </div>

        <div className="vault-section">
          <h3 className="section-title">CONTENT</h3>

          {vault.contents.length === 0 ? (
            <div className="vault-empty">
              <p className="vault-empty-icon">📁</p>
              <p className="vault-empty-text">NO CONTENT UPLOADED</p>
              <p className="vault-empty-subtext">SAY SOMETHING</p>
            </div>
          ) : (
            <div className="content-list">
              {vault.contents.map((content) => (
                <Card key={content.id} className="content-item">
                  <div className="content-type">{content.type.toUpperCase()}</div>
                  <div className="content-name">{content.name}</div>
                </Card>
              ))}
            </div>
          )}

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleAddContent}
          >
            + ADD CONTENT (DEMO)
          </Button>
        </div>

        <div className="vault-danger-zone">
          <h3 className="section-title text-red">DANGER ZONE</h3>
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={handleDelete}
          >
            DELETE VAULT FOREVER
          </Button>
        </div>
      </div>
    </div>
  );
};
