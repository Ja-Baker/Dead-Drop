import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { Button } from '../components/primitives/Button';
import './ExecutorsPage.css';

export const ExecutorsPage = () => {
  return (
    <div className="executors-page">
      <TopBar title="EXECUTORS" />

      <div className="executors-content">
        <div className="executors-empty">
          <p className="executors-icon">⚰️</p>
          <p className="executors-text">NO EXECUTORS ASSIGNED</p>
          <p className="executors-subtext">TRUST ISSUES?</p>
          <div className="executors-cta">
            <Button variant="primary" size="md" disabled>
              + INVITE EXECUTOR
            </Button>
            <p className="executors-note">(Coming soon)</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
