import { useState } from 'react';
import { useStore } from '../../store/useStore';
import './ProofOfLifeButton.css';

export const ProofOfLifeButton = () => {
  const { checkIn } = useStore();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    checkIn();
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  };

  return (
    <div className="proof-container">
      <button
        className={`proof-button ${clicked ? 'clicked' : ''} ${!clicked ? 'pulse' : ''}`}
        onClick={handleClick}
      >
        <span className="proof-icon">💀</span>
        <span className="proof-text">
          {clicked ? "NOTED" : "STILL ALIVE?"}
        </span>
        <span className="proof-subtext">
          {clicked ? "see you tomorrow" : "click if alive"}
        </span>
      </button>
    </div>
  );
};
