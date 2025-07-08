'use client';

import { useState } from 'react';
import { suspects } from '@/data/suspects';
import { GameState, Suspect, ChatMessage } from '@/types/game';
import SuspectCard from './SuspectCard';
import SuspectModal from './SuspectModal';
import InspectModal from './InspectModal';
import SolutionModal from './SolutionModal';
import EvidenceGrid from './EvidenceGrid';

export default function GameInterface() {
  const [gameState, setGameState] = useState<GameState>({
    actionsRemaining: 20,
    evidence: [],
    currentSuspect: '',
    inspectLog: []
  });

  const [suspectsData, setSuspectsData] = useState(suspects);
  const [isCaseCollapsed, setIsCaseCollapsed] = useState(false);
  const [showSuspectModal, setShowSuspectModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  const currentSuspect = gameState.currentSuspect ? suspectsData[gameState.currentSuspect] : null;

  const useAction = () => {
    setGameState(prev => ({
      ...prev,
      actionsRemaining: Math.max(0, prev.actionsRemaining - 1)
    }));
  };

  const openSuspectModal = (suspectId: string) => {
    setGameState(prev => ({ ...prev, currentSuspect: suspectId }));
    setShowSuspectModal(true);
  };

  const handleAskQuestion = async (question: string) => {
    if (gameState.actionsRemaining <= 0) return;

    const suspect = suspectsData[gameState.currentSuspect];
    
    // Add player message immediately
    const playerMessage: ChatMessage = { type: 'player', text: `You: ${question}` };
    
    setSuspectsData(prev => ({
      ...prev,
      [gameState.currentSuspect]: {
        ...prev[gameState.currentSuspect],
        chatLog: [...prev[gameState.currentSuspect].chatLog, playerMessage]
      }
    }));

    try {
      // Call our API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspectId: gameState.currentSuspect,
          question,
          gameState
        })
      });

      const data = await response.json();
      
      // Add AI response
      const suspectMessage: ChatMessage = { 
        type: 'suspect', 
        text: `${suspect.name}: ${data.response}` 
      };

      setSuspectsData(prev => ({
        ...prev,
        [gameState.currentSuspect]: {
          ...prev[gameState.currentSuspect],
          chatLog: [...prev[gameState.currentSuspect].chatLog, suspectMessage]
        }
      }));

      // Add evidence if discovered
      if (data.evidenceDiscovered && data.evidence) {
        setGameState(prev => ({
          ...prev,
          evidence: [...prev.evidence, data.evidence]
        }));
      }

    } catch (error) {
      console.error('Error asking question:', error);
      // Fallback to placeholder response
      const fallbackResponse: ChatMessage = { 
        type: 'suspect', 
        text: `${suspect.name}: I'm not sure about that.` 
      };
      
      setSuspectsData(prev => ({
        ...prev,
        [gameState.currentSuspect]: {
          ...prev[gameState.currentSuspect],
          chatLog: [...prev[gameState.currentSuspect].chatLog, fallbackResponse]
        }
      }));
    }

    useAction();
  };

  const handleInspect = async (inspection: string) => {
    if (gameState.actionsRemaining <= 0) return;

    // Add inspection message immediately
    const inspectMessage: ChatMessage = { type: 'player', text: `Inspect... ${inspection}` };
    
    setGameState(prev => ({
      ...prev,
      inspectLog: [...prev.inspectLog, inspectMessage]
    }));

    try {
      // Call our API
      const response = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspection,
          gameState
        })
      });

      const data = await response.json();
      
      // Add AI result
      const resultMessage: ChatMessage = { type: 'suspect', text: `Result: ${data.result}` };

      setGameState(prev => ({
        ...prev,
        inspectLog: [...prev.inspectLog, resultMessage]
      }));

      // Add evidence if discovered
      if (data.evidenceDiscovered && data.evidence) {
        setGameState(prev => ({
          ...prev,
          evidence: [...prev.evidence, data.evidence]
        }));
      }

    } catch (error) {
      console.error('Error inspecting:', error);
      // Fallback response
      const fallbackMessage: ChatMessage = { type: 'suspect', text: 'Result: You find nothing of particular interest.' };
      
      setGameState(prev => ({
        ...prev,
        inspectLog: [...prev.inspectLog, fallbackMessage]
      }));
    }

    useAction();
  };

  return (
    <div className="container">
      {/* Case File */}
      <div className={`case-file-game ${isCaseCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="collapse-btn"
          onClick={() => setIsCaseCollapsed(!isCaseCollapsed)}
        >
          {isCaseCollapsed ? '▼' : '▲'}
        </button>
        <h2 className="case-title">The Vineyard Reunion</h2>
        <div className="case-description">
          During a 20-year college reunion at the exclusive Rosewood Vineyard estate, successful venture capitalist Marcus Thornfield (47) was found dead in the wine cellar at 11:30 PM, struck in the head with a vintage wine bottle. The reunion dinner had ended at 10 PM, with guests mingling throughout the estate's main house, gardens, and wine facilities until the body was discovered. Security cameras show all five remaining guests had access to the cellar area during the critical timeframe. The killer is among the reunion attendees, each harboring secrets from their shared college years.
        </div>
      </div>


      {/* Actions Banner */}
      <div className="actions-banner">
        Actions Remaining: {gameState.actionsRemaining}/20
      </div>

      {/* Investigate Section - NOW ABOVE SUSPECTS */}
      <div className="investigate-section">
        <div className="investigate-header">
          <h2 className="investigate-title">Search for Clues</h2>
        </div>
        <div className="investigate-button-container">
          <button className="investigate-main-btn" onClick={() => setShowInspectModal(true)}>
            <span className="investigate-icon">🔍</span>
            <span className="investigate-label">Investigate</span>
          </button>
        </div>
      </div>

      {/* Suspects Section */}
      <div className="suspects-section">
        <h2 className="section-title">Question Suspects</h2>
        <div className="suspects-grid">
          {Object.values(suspectsData).map((suspect) => (
            <SuspectCard
              key={suspect.id}
              suspect={suspect}
              onClick={() => openSuspectModal(suspect.id)}
            />
          ))}
        </div>
      </div>

      {/* Evidence Grid */}
      <EvidenceGrid evidence={gameState.evidence} />

      {/* Solve Case Banner */}
      <div className="solve-banner" onClick={() => setShowSolutionModal(true)}>
        🔍 SOLVE THE CASE 🔍
      </div>

      {/* Modals */}
      <SuspectModal
        suspect={currentSuspect}
        evidence={gameState.evidence}
        isOpen={showSuspectModal}
        onClose={() => setShowSuspectModal(false)}
        onAskQuestion={handleAskQuestion}
      />

      <InspectModal
        isOpen={showInspectModal}
        inspectLog={gameState.inspectLog}
        onClose={() => setShowInspectModal(false)}
        onInspect={handleInspect}
      />

      <SolutionModal
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
        gameState={gameState}
      />
    </div>
  );
}