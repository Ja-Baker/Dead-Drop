import { useNavigate } from 'react-router-dom';
import './TopBar.css';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const TopBar = ({ title = 'DEAD DROP', showBack = false, onBack, rightElement }: TopBarProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {showBack && (
          <button className="back-button" onClick={handleBack}>
            ←
          </button>
        )}
      </div>
      <div className="top-bar-center">
        <h1 className="top-bar-title">{title} 💀</h1>
      </div>
      <div className="top-bar-right">
        {rightElement}
      </div>
    </div>
  );
};
