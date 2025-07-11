import { useEffect, useState } from 'react';

interface Case {
  id: string;
  title: string;
  description: string;
}

interface LandingPageProps {
  onStartGame: () => void;
}

export default function LandingPage({ onStartGame }: LandingPageProps) {
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentCase = async () => {
      try {
        const response = await fetch('/api/case/current');
        if (!response.ok) {
          throw new Error('Failed to fetch current case');
        }
        const data = await response.json();
        setCurrentCase(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentCase();
  }, []);

  if (loading) {
    return (
      <div className="landing-page">
        <h1 className="game-title">Case of the Week</h1>
        <div className="case-file">
          <p style={{ color: '#666', textAlign: 'center' }}>Loading current case...</p>
        </div>
      </div>
    );
  }

  if (error || !currentCase) {
    return (
      <div className="landing-page">
        <h1 className="game-title">Case of the Week</h1>
        <div className="case-file">
          <p style={{ color: '#ff6b6b', textAlign: 'center' }}>
            {error || 'No active case found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <h1 className="game-title">Case of the Week</h1>
      
      <div className="case-file">
        <h2 className="case-title">{currentCase.title}</h2>
        <div className="case-description">
          {currentCase.description}
        </div>
      </div>
      
      <button className="begin-btn" onClick={onStartGame}>
        Begin Investigation
      </button>
    </div>
  );
}