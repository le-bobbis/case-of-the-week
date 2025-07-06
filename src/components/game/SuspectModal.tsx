'use client';

import { Suspect, Evidence, ChatMessage } from '@/types/game';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';

interface SuspectModalProps {
  suspect: Suspect | null;
  evidence: Evidence[];
  isOpen: boolean;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export default function SuspectModal({ suspect, evidence, isOpen, onClose, onAskQuestion }: SuspectModalProps) {
  const [question, setQuestion] = useState('');

  if (!suspect) return null;

  const handleSubmit = () => {
    if (question.trim()) {
      onAskQuestion(question.trim());
      setQuestion('');
    }
  };

  const handleEvidenceClick = (evidenceEmoji: string) => {
    const newValue = question + (question ? ' ' : '') + evidenceEmoji;
    if (newValue.length <= 100) {
      setQuestion(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: '20px', color: 'white' }}>
        <span style={{ fontSize: '4em', marginBottom: '15px', display: 'block' }}>{suspect.emoji}</span>
        <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#d4af37', marginBottom: '15px' }}>{suspect.name}</h2>
        <div style={{ 
          background: 'rgba(139, 69, 19, 0.2)', 
          padding: '15px', 
          borderRadius: '8px', 
          lineHeight: '1.5',
          color: '#f4f1e8'
        }}>
          {suspect.bio}
        </div>
      </div>

      {/* Chat Log */}
      <div style={{ 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: '8px', 
        padding: '15px', 
        margin: '20px 0', 
        maxHeight: '200px', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'  // This reverses the order
      }}>
        {suspect.chatLog.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No conversation yet...</p>
        ) : (
          suspect.chatLog.slice().reverse().map((message, index) => (  // Reverse the array
            <div
              key={suspect.chatLog.length - 1 - index}  // Adjust key to maintain React stability
              style={{
                margin: '10px 0',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: message.type === 'player' ? 'rgba(0, 100, 0, 0.3)' : 'rgba(139, 69, 19, 0.3)',
                marginLeft: message.type === 'player' ? '20px' : '0',
                marginRight: message.type === 'suspect' ? '20px' : '0',
                color: 'white'
              }}
            >
              {message.text}
            </div>
          ))
        )}
      </div>

      {/* Evidence Display */}
      <div style={{ margin: '15px 0' }}>
        <div style={{ fontWeight: 'bold', color: '#d4af37', marginBottom: '10px' }}>Evidence:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px', alignItems: 'center' }}>
          {evidence.length === 0 ? (
            <div style={{ 
              color: '#888', 
              border: '2px dashed #666', 
              padding: '10px 15px', 
              borderRadius: '8px',
              fontSize: '0.9em'
            }}>
              No evidence collected yet
            </div>
          ) : (
            evidence.map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(139, 69, 19, 0.4)',
                  border: '2px solid #d4af37',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '1.2em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleEvidenceClick(item.emoji)}
                title={item.description}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {item.emoji}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Question Input */}
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyPress={handleKeyPress}
        maxLength={100}
        placeholder="Ask a question (100 characters max)"
        style={{
          width: '100%',
          padding: '10px',
          border: '2px solid #8b4513',
          borderRadius: '8px',
          background: 'rgba(139, 69, 19, 0.2)',
          color: 'white',
          fontSize: '1em',
          margin: '10px 0'
        }}
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={!question.trim()}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(45deg, #8b0000, #a52a2a)',
            color: 'white',
            cursor: question.trim() ? 'pointer' : 'not-allowed',
            opacity: question.trim() ? 1 : 0.5
          }}
        >
          Ask Question
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(45deg, #4682b4, #5f9ea0)',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Return
        </button>
      </div>
    </Modal>
  );
}