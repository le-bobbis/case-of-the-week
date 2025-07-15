'use client';

import { Suspect, Evidence, ChatMessage } from '@/types/game';
import Modal from '@/components/ui/Modal';
import TypewriterText from '@/components/ui/TypewriterText';
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

  const handleEvidenceClick = (evidenceItem: Evidence) => {
    console.log('Evidence clicked:', evidenceItem);
    
    // Safety check
    if (!evidenceItem || !evidenceItem.description) {
      console.error('Invalid evidence item:', evidenceItem);
      return;
    }
    
    const newValue = question + (question ? ' ' : '') + evidenceItem.name;
    console.log('New value would be:', newValue);
    
    if (newValue.length <= 100) {
      setQuestion(newValue);
    } else {
      console.log('Text too long, not adding');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: '24px', color: 'white' }}>
        <span style={{ fontSize: '4rem', marginBottom: '16px', display: 'block' }}>{suspect.emoji}</span>
        <h2 style={{ fontSize: '2rem', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>{suspect.name}</h2>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '20px', 
          borderRadius: '12px', 
          lineHeight: '1.6',
          color: '#b0b0b0',
          fontSize: '0.95rem'
        }}>
          {suspect.bio}
        </div>
      </div>

      {/* Chat Log */}
      <div style={{ 
        background: 'rgba(0, 0, 0, 0.3)', 
        borderRadius: '12px', 
        padding: '16px', 
        margin: '24px 0', 
        maxHeight: '200px', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}>
        {suspect.chatLog.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '24px' }}>No conversation yet...</p>
        ) : (
          suspect.chatLog.slice().reverse().map((message, index) => (
            <div
              key={suspect.chatLog.length - 1 - index}
              style={{
                margin: '8px 0',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: message.type === 'player' 
                  ? 'rgba(78, 205, 196, 0.15)' 
                  : 'rgba(255, 107, 107, 0.1)',
                marginLeft: message.type === 'player' ? '48px' : '0',
                marginRight: message.type === 'suspect' ? '48px' : '0',
                color: '#e0e0e0',
                fontSize: '0.95rem'
              }}
            >
              {message.text}
            </div>
          ))
        )}
      </div>

      {/* Evidence Display */}
      <div style={{ margin: '20px 0' }}>
        <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '12px', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Evidence</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '48px', alignItems: 'center' }}>
          {evidence.length === 0 ? (
            <div style={{ 
              color: '#666', 
              border: '2px dashed rgba(255, 255, 255, 0.1)', 
              padding: '12px 20px', 
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              No evidence collected yet
            </div>
          ) : (
            evidence.map((item, index) => (
              <button
                key={index}
                style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#fff'
                }}
                onClick={() => handleEvidenceClick(item)}
                title={`${item.name}: ${item.description}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {item.emoji}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Question Input */}
      <div style={{ marginTop: '24px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={100}
          placeholder="Ask a question..."
          style={{
            width: '100%',
            padding: '14px 18px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#e0e0e0',
            fontSize: '1rem',
            marginBottom: '16px',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(255, 107, 107, 0.5)';
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.background = 'rgba(255, 255, 255, 0.03)';
          }}
        />
        
        <button
          onClick={handleSubmit}
          disabled={!question.trim()}
          style={{
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            background: question.trim() 
              ? 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)' 
              : '#333',
            color: 'white',
            cursor: question.trim() ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
        >
          Ask Question
        </button>
      </div>
    </Modal>
  );
}