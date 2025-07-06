'use client';

import { useState } from 'react';
import LandingPage from '@/components/game/LandingPage';
import GameInterface from '@/components/game/GameInterface';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="container">
      {!gameStarted ? (
        <LandingPage onStartGame={() => setGameStarted(true)} />
      ) : (
        <GameInterface />
      )}
    </div>
  );
}