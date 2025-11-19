import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/api';
import './MemorialPage.css';

export default function MemorialPage() {
  const { vaultId } = useParams();
  const [memorial, setMemorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vaultId) {
      loadMemorial();
    }
  }, [vaultId]);

  const loadMemorial = async () => {
    try {
      const response = await apiClient.get(`/memorial/${vaultId}`);
      setMemorial(response.data);
    } catch (err) {
      console.error('Failed to load memorial:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">LOADING YOUR DEATH...</div>;
  }

  if (!memorial) {
    return <div className="error-state">Memorial not found</div>;
  }

  return (
    <div className="memorial-page">
      <div className="memorial-header">
        <h1>{memorial.vault.name}</h1>
        {memorial.vault.icon && <span className="memorial-icon">{memorial.vault.icon}</span>}
      </div>

      <div className="memorial-content">
        {memorial.content.map((item: any) => (
          <div key={item.id} className="content-item">
            {item.type === 'image' && (
              <img src={item.filePath} alt="" className="content-image" />
            )}
            {item.type === 'text' && (
              <div className="content-text">{item.metadata?.text}</div>
            )}
          </div>
        ))}
      </div>

      <div className="memorial-reactions">
        <h2>REACTIONS</h2>
        <div className="reactions-bar">
          {Object.entries(memorial.reactions || {}).map(([emoji, count]: [string, any]) => (
            <button key={emoji} className="reaction-btn">
              {emoji} {count}
            </button>
          ))}
        </div>
      </div>

      <div className="memorial-comments">
        <h2>COMMENTS</h2>
        {memorial.comments.map((comment: any) => (
          <div key={comment.id} className="comment">
            <div className="comment-author">{comment.author}</div>
            <div className="comment-content">{comment.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

