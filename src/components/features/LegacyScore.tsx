import { useEffect, useState } from 'react';
import './LegacyScore.css';

interface LegacyScoreProps {
  vaultCount: number;
  contentCount: number;
  daysSinceCheckIn: number;
}

export const LegacyScore = ({ vaultCount, contentCount, daysSinceCheckIn }: LegacyScoreProps) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Calculate legacy score (max 100)
    let calculatedScore = 0;

    // Vaults contribute
    calculatedScore += Math.min(vaultCount * 15, 45);

    // Content contributes
    calculatedScore += Math.min(contentCount * 2, 30);

    // Recent activity contributes
    if (daysSinceCheckIn === 0) calculatedScore += 25;
    else if (daysSinceCheckIn <= 7) calculatedScore += 15;
    else if (daysSinceCheckIn <= 30) calculatedScore += 5;

    setScore(Math.min(calculatedScore, 100));
  }, [vaultCount, contentCount, daysSinceCheckIn]);

  const getScoreClass = () => {
    if (score >= 70) return 'legendary';
    if (score >= 40) return 'memorable';
    if (score >= 20) return 'forgettable';
    return 'pathetic';
  };

  const getScoreLabel = () => {
    if (score >= 70) return 'LEGENDARY';
    if (score >= 40) return 'MEMORABLE';
    if (score >= 20) return 'FORGETTABLE';
    return 'PATHETIC';
  };

  const getScoreMessage = () => {
    if (score >= 70) return "THEY'LL REMEMBER YOU";
    if (score >= 40) return "MAYBE THEY'LL CARE";
    if (score >= 20) return 'PROBABLY FORGOTTEN IN A WEEK';
    return 'WHO EVEN ARE YOU?';
  };

  return (
    <div className={`legacy-score ${getScoreClass()}`}>
      <div className="legacy-header">
        <h3 className="legacy-title">LEGACY SCORE</h3>
        <p className="legacy-subtitle">HOW MEMORABLE ARE YOU?</p>
      </div>

      <div className="legacy-display">
        <div className={`legacy-number ${score < 20 ? 'shake' : ''}`}>
          {score}
        </div>
        <div className="legacy-label">{getScoreLabel()}</div>
      </div>

      <div className="legacy-bar">
        <div
          className="legacy-fill"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="legacy-message">{getScoreMessage()}</p>

      <div className="legacy-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label">VAULTS:</span>
          <span className="breakdown-value">{vaultCount}</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">CONTENT:</span>
          <span className="breakdown-value">{contentCount}</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">ACTIVITY:</span>
          <span className="breakdown-value">
            {daysSinceCheckIn === 0 ? 'TODAY' : `${daysSinceCheckIn}D AGO`}
          </span>
        </div>
      </div>
    </div>
  );
};
