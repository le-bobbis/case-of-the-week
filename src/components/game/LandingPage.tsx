import { useEffect, useState } from 'react';

interface Case {
  id: string;
  title: string;
  description: string;
}

interface LandingPageProps {
  onStartGame: (caseId: string) => void;
}

export default function LandingPage({ onStartGame }: LandingPageProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // Fetch all cases
        const response = await fetch('/api/cases');
        if (!response.ok) {
          throw new Error('Failed to fetch cases');
        }
        const data = await response.json();
        setCases(data);
        
        // Automatically select the most recent case (first in the list)
        if (data.length > 0) {
          const caseId = data[0].id;
          const caseResponse = await fetch(`/api/case/${caseId}`);
          if (caseResponse.ok) {
            const caseData = await caseResponse.json();
            setSelectedCase(caseData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cases');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (loading) {
    return (
      <div className="landing-page">
        <h1 className="game-title">Case of the Week</h1>
        <div className="case-file">
          <p style={{ color: '#666', textAlign: 'center' }}>Loading cases...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedCase) {
    return (
      <div className="landing-page">
        <h1 className="game-title">Case of the Week</h1>
        <div className="case-file">
          <p style={{ color: '#ff6b6b', textAlign: 'center' }}>
            {error || 'No cases available'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <h1 className="game-title">Case of the Week</h1>
      
      <div className="case-file">
        <h2 className="case-title">{selectedCase.title}</h2>
        <div className="case-description">
          {selectedCase.description}
        </div>
      </div>
      
      <button className="begin-btn" onClick={() => onStartGame(selectedCase.id)}>
        Begin Investigation
      </button>
    </div>
  );
}