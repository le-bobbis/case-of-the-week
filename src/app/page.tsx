'use client';

import { useState } from 'react';
import LandingPage from '@/components/game/LandingPage';
import GameInterface from '@/components/game/GameInterface';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState<string>('');

  const handleStartGame = (caseId: string) => {
    setCurrentCaseId(caseId);
    setGameStarted(true);
  };

  const handleCaseChange = (caseId: string) => {
    setCurrentCaseId(caseId);
  };

  return (
    <div className="container">
      {!gameStarted ? (
        <LandingPage onStartGame={handleStartGame} />
      ) : (
        <GameInterface caseId={currentCaseId} onCaseChange={handleCaseChange} />
      )}
    </div>
  );
}