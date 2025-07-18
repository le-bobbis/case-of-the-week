'use client';

import { useState, useEffect } from 'react';
import { GameState, Suspect, ChatMessage } from '@/types/game';
import SuspectCard from './SuspectCard';
import SuspectModal from './SuspectModal';
import InspectModal from './InspectModal';
import SolutionModal from './SolutionModal';
import EvidenceGrid from './EvidenceGrid';
import CaseNavigation from './CaseNavigation';

interface CaseInfo {
  id: string;
  title: string;
  description: string;
  setting: string;
  victim: string;
  murderWeapon: string;
  murderTime: string;
  navigation: {
    prevCaseId: string | null;
    nextCaseId: string | null;
    currentIndex: number;
    totalCases: number;
  };
}

interface GameInterfaceProps {
  caseId: string;
  onCaseChange: (caseId: string) => void;
}

export default function GameInterface({ caseId, onCaseChange }: GameInterfaceProps) {
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

  // Load case and suspects data when caseId changes
  useEffect(() => {
    const loadGameData = async () => {
      console.log('🎮 GameInterface - Loading data for caseId:', caseId);
      
      if (!caseId) {
        console.error('❌ No caseId provided to GameInterface');
        setError('No case selected');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Reset game state when switching cases
      setGameState({
        actionsRemaining: 20,
        evidence: [],
        currentSuspect: '',
        inspectLog: []
      });
      
      try {
        // Load specific case
        console.log('📡 Fetching case from:', `/api/case/${caseId}`);
        const caseResponse = await fetch(`/api/case/${caseId}`);
        
        if (!caseResponse.ok) {
          const errorData = await caseResponse.text();
          console.error('❌ Case fetch failed:', caseResponse.status, errorData);
          throw new Error(`Failed to load case: ${caseResponse.status}`);
        }
        
        const caseData = await caseResponse.json();
        console.log('✅ Case loaded:', caseData.title);
        setCurrentCase(caseData);

        // Load suspects for this case
        console.log('📡 Fetching suspects from:', `/api/suspects?caseId=${caseId}`);
        const suspectsResponse = await fetch(`/api/suspects?caseId=${caseId}`);
        
        if (!suspectsResponse.ok) {
          const errorData = await suspectsResponse.text();
          console.error('❌ Suspects fetch failed:', suspectsResponse.status, errorData);
          throw new Error(`Failed to load suspects: ${suspectsResponse.status}`);
        }
        
        const suspectsData = await suspectsResponse.json();
        console.log('✅ Suspects loaded:', Object.keys(suspectsData));
        setSuspectsData(suspectsData);

      } catch (err) {
        console.error('❌ Error in loadGameData:', err);
        setError(err instanceof Error ? err.message : 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [caseId]);

  // Rest of the component remains the same...
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
        body: JSON.stringify({
          ...evidenceParams,
          caseId // Include caseId in evidence check
        })
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
          gameState: {
            ...gameState,
            suspectsData // Include suspects data for chat history
          },
          caseId // Include caseId
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
      // Call our API for immediate response
      const response = await fetch('/api/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspection,
          gameState,
          caseId // Include caseId
        })
      });

      const data = await response.json();
      
      // Add AI result immediately
      const resultMessage: ChatMessage = { type: 'suspect', text: `Result: ${data.result}` };

      setGameState(prev => ({
        ...prev,
        inspectLog: [...prev.inspectLog, resultMessage]
      }));

      // Check for evidence asynchronously
      checkForEvidence({
        playerQuestion: `Investigate ${inspection}`,
        characterResponse: data.result,
        characterName: 'Investigation',
        existingEvidence: gameState.evidence || [],
        conversationHistory: gameState.inspectLog
          .map(msg => msg.text)
          .slice(-10), // Last 10 exchanges
        actionsRemaining: gameState.actionsRemaining,
        evidenceCount: gameState.evidence?.length || 0
      });

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
        <h2 className="case-title">🗂️ {currentCase.title}</h2>
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

      {/* Solve Case Section - Updated to match Investigate button */}
      <div className="investigate-section">
        <div className="investigate-header">
        </div>
        <div className="investigate-button-container">
          <button className="investigate-main-btn solve-button" onClick={() => setShowSolutionModal(true)}>
            <span className="investigate-icon">🎯</span>
            <span className="investigate-label">Solve the Case</span>
          </button>
        </div>
      </div>

      {/* Case Navigation */}
      <CaseNavigation 
        prevCaseId={currentCase.navigation.prevCaseId}
        nextCaseId={currentCase.navigation.nextCaseId}
        currentIndex={currentCase.navigation.currentIndex}
        totalCases={currentCase.navigation.totalCases}
        onNavigate={onCaseChange}
      />

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
        evidence={gameState.evidence}
        onClose={() => setShowInspectModal(false)}
        onInspect={handleInspect}
      />

      <SolutionModal
        isOpen={showSolutionModal}
        onClose={() => setShowSolutionModal(false)}
        gameState={gameState}
        caseId={caseId}
      />
    </div>
  );
}