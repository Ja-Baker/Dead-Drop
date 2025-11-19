import { useState } from 'react';
import { Button } from '../primitives/Button';
import './DeathSimulator.css';

const DEATH_SCENARIOS = [
  { cause: "CHOKED ON A MEME", probability: "87%", emoji: "🤣" },
  { cause: "FORGOT TO BREATHE (SCROLLING)", probability: "92%", emoji: "📱" },
  { cause: "TRIPPED OVER NOTHING", probability: "76%", emoji: "🚶" },
  { cause: "CRINGE OVERDOSE", probability: "94%", emoji: "😬" },
  { cause: "CANCELLED TO DEATH", probability: "69%", emoji: "❌" },
  { cause: "RATIO'D INTO OBLIVION", probability: "83%", emoji: "💀" },
  { cause: "MAIN CHARACTER SYNDROME", probability: "99%", emoji: "🎭" },
  { cause: "TOUCHED GRASS (ALLERGIC)", probability: "45%", emoji: "🌱" },
  { cause: "FORGOT TO DRINK WATER", probability: "88%", emoji: "💧" },
  { cause: "EMBARRASSMENT (TERMINAL)", probability: "91%", emoji: "😳" },
  { cause: "DIED OF BOREDOM", probability: "73%", emoji: "😴" },
  { cause: "LAUGHED AT OWN JOKE", probability: "81%", emoji: "😂" },
];

export const DeathSimulator = () => {
  const [scenario, setScenario] = useState<typeof DEATH_SCENARIOS[0] | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const simulate = () => {
    setIsSimulating(true);
    setScenario(null);

    // Dramatic pause
    setTimeout(() => {
      const randomScenario = DEATH_SCENARIOS[Math.floor(Math.random() * DEATH_SCENARIOS.length)];
      setScenario(randomScenario);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="death-simulator">
      <h3 className="simulator-title">DEATH SIMULATOR</h3>
      <p className="simulator-subtitle">HOW WILL YOU DIE?</p>

      {!scenario && !isSimulating && (
        <Button variant="danger" size="lg" fullWidth onClick={simulate}>
          SIMULATE MY DEATH
        </Button>
      )}

      {isSimulating && (
        <div className="simulating">
          <div className="simulating-text flicker">CALCULATING...</div>
          <div className="simulating-spinner screen-tear">💀</div>
        </div>
      )}

      {scenario && !isSimulating && (
        <div className="scenario-result slide-up">
          <div className="scenario-emoji heartbeat">{scenario.emoji}</div>
          <div className="scenario-cause">{scenario.cause}</div>
          <div className="scenario-probability">
            PROBABILITY: <span className="text-red">{scenario.probability}</span>
          </div>
          <Button variant="ghost" size="md" fullWidth onClick={simulate}>
            TRY AGAIN
          </Button>
        </div>
      )}
    </div>
  );
};
