'use client';

import { useState, useEffect } from 'react';
import { GameState, Suspect, ChatMessage } from '@/types/game';
import SuspectCard from './SuspectCard';
import SuspectModal from './SuspectModal';
import InspectModal from './InspectModal';
import SolutionModal from './SolutionModal';
import EvidenceGrid from './EvidenceGrid';

interface CaseInfo {
  id: string;
  title: string;
  description: string;
  setting: string;
  victim: string;
  murderWeapon: string;
  murderTime: string;
}

export default function GameInterface() {
  const [gameState, setGameState] = useState<GameState>({
    actionsRemaining: 20,
    evidence: [],
    currentSuspect: '',
    inspectLog: []
  });

  const [currentCase, setCurrentCase] = useState<CaseInfo | null>(null);
  const [suspectsData, setSuspectsData] = useState<Record<string, Suspect>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCaseCollapsed, setIsCaseCollapsed] = useState(false);
  const [showSuspectModal, setShowSuspectModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  // Load case and suspects data on component mount
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Load current case
        const caseResponse = await fetch('/api/case/current');
        if (!caseResponse.ok) {
          throw new Error('Failed to load current case');
        }
        const caseData = await caseResponse.json();
        setCurrentCase(caseData);

        // Load suspects
        const suspectsResponse = await fetch('/api/suspects');
        if (!suspectsResponse.ok) {
          throw new Error('Failed to load suspects');
        }
        const suspectsData = await suspectsResponse.json();
        setSuspectsData(suspectsData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  const currentSuspect = gameState.currentSuspect ? suspectsData[gameState.currentSuspect] : null;

  const useAction = () => {
    setGameState(prev => ({
      ...prev,
      actionsRemaining: Math.max(0, prev.actionsRemaining - 1)
    }));
  };

  const checkForEvidence = async (evidenceParams: any) => {
  try {
    const response = await fetch('/api/evidence/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evidenceParams)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.evidenceGenerated && data.evidence) {
        // Add evidence to game state
        setGameState(prev => ({
          ...prev,
          evidence: [...prev.evidence, data.evidence]
        }));
        
        console.log('✨ Evidence discovered:', data.evidence.name);
      }
    }
  } catch (error) {
    console.error('Error checking for evidence:', error);
  }
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
      // Call our API for immediate response
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
      
      // Add AI response immediately
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

      // Check for evidence asynchronously
      checkForEvidence({
        playerQuestion: question,
        characterResponse: data.response,
        characterName: suspect.name,
        existingEvidence: gameState.evidence || [],
        conversationHistory: suspectsData[gameState.currentSuspect].chatLog
          .map(msg => msg.text)
          .slice(-10), // Last 10 exchanges
        actionsRemaining: gameState.actionsRemaining,
        evidenceCount: gameState.evidence?.length || 0
      });

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

  if (loading) {
    return (
      <div className="container">
        <div className="case-file-game">
          <p style={{ color: '#666', textAlign: 'center' }}>Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error || !currentCase) {
    return (
      <div className="container">
        <div className="case-file-game">
          <p style={{ color: '#ff6b6b', textAlign: 'center' }}>
            {error || 'Failed to load game data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Case File - Now Dynamic */}
      <div className={`case-file-game ${isCaseCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="collapse-btn"
          onClick={() => setIsCaseCollapsed(!isCaseCollapsed)}
        >
          {isCaseCollapsed ? '▼' : '▲'}
        </button>
        <h2 className="case-title">{currentCase.title}</h2>
        <div className="case-description">
          {currentCase.description}
        </div>
      </div>

      {/* Actions Banner */}
      <div className="actions-banner">
        Actions Remaining: {gameState.actionsRemaining}/20
      </div>

      {/* Investigate Section */}
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

      {/* Suspects Section - Now Dynamic */}
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
        evidence={gameState.evidence}  // Add this line
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