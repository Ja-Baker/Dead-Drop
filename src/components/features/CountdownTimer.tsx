import { useEffect, useState } from 'react';
import './CountdownTimer.css';

interface CountdownTimerProps {
  days: number;
  label?: string;
}

export const CountdownTimer = ({ days, label = "DAYS UNTIL TRIGGER" }: CountdownTimerProps) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getUrgencyClass = () => {
    if (days <= 30) return 'urgent';
    if (days <= 90) return 'warning';
    return 'safe';
  };

  return (
    <div className={`countdown-timer ${getUrgencyClass()} ${glitch ? 'rgb-split' : ''}`}>
      <div className="countdown-display">
        <span className="countdown-number">{days}</span>
        <span className="countdown-label">{label}</span>
      </div>
      {days <= 30 && <div className="countdown-pulse" />}
    </div>
  );
};
