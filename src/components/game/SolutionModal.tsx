'use client';

import Modal from '@/components/ui/Modal';
import { useState } from 'react';

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: any; // We'll pass the full game state for AI evaluation
}

export default function SolutionModal({ isOpen, onClose, gameState }: SolutionModalProps) {
  const [solution, setSolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    feedback: string;
    isCorrect: boolean;
    correctAnswer?: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!solution.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solution: solution.trim(),
          gameState
        })
      });

      const data = await response.json();
      setEvaluation({
        feedback: data.evaluation,
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer
      });
      
    } catch (error) {
      console.error('Error submitting solution:', error);
      setEvaluation({
        feedback: 'There was an error processing your solution. Please try again.',
        isCorrect: false
      });
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setSolution('');
    setEvaluation(null);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#d4af37', marginBottom: '20px', textAlign: 'center' }}>
        🔍 Solve the Case
      </h2>
      
      {!evaluation ? (
        <>
          <p style={{ marginBottom: '20px', color: '#d4af37', textAlign: 'center' }}>
            Who do you think committed the murder? Enter the name of the killer and explain your reasoning.
          </p>

          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your solution... Who is the killer and why?"
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: '120px',
              padding: '15px',
              border: '2px solid #d4af37',
              borderRadius: '10px',
              background: 'rgba(139, 69, 19, 0.2)',
              color: 'white',
              fontSize: '1em',
              marginBottom: '20px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={handleSubmit}
              disabled={!solution.trim() || isSubmitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: isSubmitting ? '#666' : 'linear-gradient(45deg, #8b0000, #a52a2a)',
                color: 'white',
                cursor: (!solution.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                opacity: (!solution.trim() || isSubmitting) ? 0.5 : 1,
                fontSize: '1em'
              }}
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
            </button>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #4682b4, #5f9ea0)',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                fontSize: '1em'
              }}
            >
              Return
            </button>
          </div>
        </>
      ) : (
        <>
          {/* AI Evaluation Results */}
          <div style={{
            background: evaluation.isCorrect ? 'rgba(0, 100, 0, 0.2)' : 'rgba(139, 69, 19, 0.2)',
            border: `2px solid ${evaluation.isCorrect ? '#228b22' : '#d4af37'}`,
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              color: evaluation.isCorrect ? '#90EE90' : '#d4af37', 
              marginBottom: '15px',
              textAlign: 'center',
              fontSize: '1.5em'
            }}>
              {evaluation.isCorrect ? '🎉 Correct!' : '🤔 Not Quite...'}
            </h3>
            
            <p style={{ 
              color: 'white', 
              lineHeight: '1.6',
              marginBottom: evaluation.correctAnswer ? '15px' : '0'
            }}>
              {evaluation.feedback}
            </p>

            {evaluation.correctAnswer && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '15px'
              }}>
                <h4 style={{ color: '#d4af37', marginBottom: '10px' }}>The Solution:</h4>
                <p style={{ color: '#f4f1e8' }}>{evaluation.correctAnswer}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            {!evaluation.isCorrect && (
              <button
                onClick={() => setEvaluation(null)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, #8b0000, #a52a2a)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1em'
                }}
              >
                Try Again
              </button>
            )}
            <button
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #4682b4, #5f9ea0)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1em'
              }}
            >
              {evaluation.isCorrect ? 'Close' : 'Return'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}