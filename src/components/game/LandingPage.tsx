interface LandingPageProps {
  onStartGame: () => void;
}

export default function LandingPage({ onStartGame }: LandingPageProps) {
  return (
    <div className="landing-page">
      <h1 className="game-title">Case of the Week</h1>
      
      <div className="case-file">
        <h2 className="case-title">The Vineyard Reunion</h2>
        <div className="case-description">
          During a 20-year college reunion at the exclusive Rosewood Vineyard estate, successful venture capitalist Marcus Thornfield (47) was found dead in the wine cellar at 11:30 PM, struck in the head with a vintage wine bottle. The reunion dinner had ended at 10 PM, with guests mingling throughout the estate's main house, gardens, and wine facilities until the body was discovered. Security cameras show all five remaining guests had access to the cellar area during the critical timeframe. The killer is among the reunion attendees, each harboring secrets from their shared college years.
        </div>
      </div>
      
      <button className="begin-btn" onClick={onStartGame}>
        Begin Investigation
      </button>
    </div>
  );
}