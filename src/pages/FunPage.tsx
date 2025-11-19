import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { DeathSimulator } from '../components/features/DeathSimulator';
import { LastWordsGenerator } from '../components/features/LastWordsGenerator';
import { LegacyScore } from '../components/features/LegacyScore';
import { useStore } from '../store/useStore';
import './FunPage.css';

export const FunPage = () => {
  const { vaults, getDaysSinceCheckIn } = useStore();
  const daysSinceCheckIn = getDaysSinceCheckIn();
  const contentCount = vaults.reduce((sum, v) => sum + v.contentCount, 0);

  return (
    <div className="fun-page">
      <TopBar title="DEATH GAMES" />

      <div className="fun-content">
        <div className="fun-header">
          <h2 className="fun-title rgb-split">EMBRACE THE VOID</h2>
          <p className="fun-subtitle">DARK HUMOR & CHAOS</p>
        </div>

        {/* Legacy Score */}
        <LegacyScore
          vaultCount={vaults.length}
          contentCount={contentCount}
          daysSinceCheckIn={daysSinceCheckIn}
        />

        {/* Death Simulator */}
        <DeathSimulator />

        {/* Last Words Generator */}
        <LastWordsGenerator />

        {/* Death Facts */}
        <div className="death-facts">
          <h3 className="facts-title">MORBID FACTS</h3>
          <div className="facts-list">
            <div className="fact-item">
              💀 7 PEOPLE DIE EVERY SECOND
            </div>
            <div className="fact-item">
              ⚰️ YOU'RE CLOSER TO DEATH THAN BIRTH
            </div>
            <div className="fact-item">
              🪦 100 BILLION HUMANS HAVE DIED
            </div>
            <div className="fact-item">
              💀 YOU'LL BE FORGOTTEN IN 3 GENERATIONS
            </div>
          </div>
        </div>

        {/* Coming Soon Teasers */}
        <div className="coming-soon">
          <h3 className="coming-soon-title">COMING SOON</h3>
          <div className="teaser-grid">
            <div className="teaser-card">
              <div className="teaser-emoji">🎵</div>
              <div className="teaser-name">FUNERAL PLAYLIST</div>
            </div>
            <div className="teaser-card">
              <div className="teaser-emoji">🎯</div>
              <div className="teaser-name">MORTALITY QUIZ</div>
            </div>
            <div className="teaser-card">
              <div className="teaser-emoji">👻</div>
              <div className="teaser-name">GHOST MODE</div>
            </div>
            <div className="teaser-card">
              <div className="teaser-emoji">📊</div>
              <div className="teaser-name">DEATH STATS</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
