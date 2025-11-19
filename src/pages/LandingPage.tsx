import { useNavigate } from 'react-router-dom';
import { Button } from '../components/primitives/Button';
import './LandingPage.css';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="skull-container pulse">
          <span className="skull">💀</span>
        </div>

        <h1 className="landing-title">
          YOU WILL DIE
        </h1>

        <p className="landing-subtitle">
          YOUR PHONE WON'T
        </p>

        <div className="landing-description">
          <p>500GB of screenshots.</p>
          <p>10,000 memes.</p>
          <p>Inside jokes nobody will understand.</p>
          <p className="text-red">Where does it go?</p>
        </div>

        <div className="landing-cta">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={() => navigate('/auth')}
          >
            PREPARE YOUR DROP
          </Button>
        </div>

        <p className="landing-disclaimer">
          or don't. see if we care.
        </p>
      </div>
    </div>
  );
};
