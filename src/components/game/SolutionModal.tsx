'use client';

import Modal from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { Suspect } from '@/types/game';

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: any;
  caseId: string;
}

export default function SolutionModal({ isOpen, onClose, gameState, caseId }: SolutionModalProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suspects, setSuspects] = useState<Record<string, Suspect>>({});
  const [evaluation, setEvaluation] = useState<{
    feedback: string;
    isCorrect: boolean;
    suspectName?: string;
  } | null>(null);

  // Load suspects when modal opens
  useEffect(() => {
    const loadSuspects = async () => {
      if (isOpen && caseId) {
        try {
          const response = await fetch(`/api/suspects?caseId=${caseId}`);
          if (response.ok) {
            const data = await response.json();
            setSuspects(data);
          }
        } catch (error) {
          console.error('Failed to load suspects:', error);
        }
      }
    };
    loadSuspects();
  }, [isOpen, caseId]);

  const handleSubmit = async () => {
    if (!selectedSuspect || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/solve-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspectId: selectedSuspect,
          caseId
        })
      });

      const data = await response.json();
      setEvaluation({
        feedback: data.feedback,
        isCorrect: data.isCorrect,
        suspectName: data.suspectName
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
    setSelectedSuspect('');
    setEvaluation(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 style={{ fontSize: '2rem', fontWeight: '600', color: '#ffffff', marginBottom: '24px', textAlign: 'center' }}>
        🔍 Who is the Killer?
      </h2>
      
      {!evaluation ? (
        <>
          <p style={{ marginBottom: '24px', color: '#b0b0b0', textAlign: 'center' }}>
            Select the suspect you believe committed the murder.
          </p>

          {/* Suspect Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {Object.values(suspects).map((suspect) => (
              <button
                key={suspect.id}
                onClick={() => setSelectedSuspect(suspect.id)}
                style={{
                  background: selectedSuspect === suspect.id 
                    ? 'rgba(255, 107, 107, 0.2)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: selectedSuspect === suspect.id 
                    ? '2px solid rgba(255, 107, 107, 0.6)' 
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (selectedSuspect !== suspect.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSuspect !== suspect.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{suspect.emoji}</div>
                <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                  {suspect.name}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '4px' }}>
                  {suspect.title}
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedSuspect || isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderRadius: '8px',
              background: (!selectedSuspect || isSubmitting) 
                ? '#333' 
                : 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)',
              color: 'white',
              cursor: (!selectedSuspect || isSubmitting) ? 'not-allowed' : 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              opacity: (!selectedSuspect || isSubmitting) ? 0.5 : 1
            }}
          >
            {isSubmitting ? 'Checking...' : 'Confirm Accusation'}
          </button>
        </>
      ) : (
        <>
          {/* Results */}
          <div style={{
            background: evaluation.isCorrect 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${evaluation.isCorrect ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            borderRadius: '12px',
            padding: '32px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '2rem',
              marginBottom: '16px'
            }}>
              {evaluation.isCorrect ? '🎉' : '❌'}
            </h3>
            
            <p style={{ 
              color: '#ffffff', 
              fontSize: '1.125rem',
              lineHeight: '1.6'
            }}>
              {evaluation.feedback}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {!evaluation.isCorrect && (
              <button
                onClick={() => setEvaluation(null)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Try Again
              </button>
            )}
            <button
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}