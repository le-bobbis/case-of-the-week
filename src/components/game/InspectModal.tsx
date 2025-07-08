'use client';

import { ChatMessage } from '@/types/game';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';

interface InspectModalProps {
  isOpen: boolean;
  inspectLog: ChatMessage[];
  onClose: () => void;
  onInspect: (inspection: string) => void;
}

export default function InspectModal({ isOpen, inspectLog, onClose, onInspect }: InspectModalProps) {
  const [inspection, setInspection] = useState('');

  const handleSubmit = () => {
    if (inspection.trim()) {
      onInspect(inspection.trim());
      setInspection('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 style={{ fontSize: '2rem', fontWeight: '600', color: '#ffffff', marginBottom: '24px', textAlign: 'center' }}>
        🔍 Investigate
      </h2>

      {/* Inspect Log - Shows recent messages first */}
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
        {inspectLog.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '24px' }}>No investigations yet...</p>
        ) : (
          inspectLog.slice().reverse().map((entry, index) => (
            <div
              key={inspectLog.length - 1 - index}
              style={{
                margin: '8px 0',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: entry.type === 'player' 
                  ? 'rgba(78, 205, 196, 0.15)' 
                  : 'rgba(255, 107, 107, 0.1)',
                marginLeft: entry.type === 'player' ? '48px' : '0',
                marginRight: entry.type === 'suspect' ? '48px' : '0',
                color: '#e0e0e0',
                fontSize: '0.95rem'
              }}
            >
              {entry.text}
            </div>
          ))
        )}
      </div>

      {/* Investigation Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>Investigate...</span>
        <input
          type="text"
          value={inspection}
          onChange={(e) => setInspection(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={50}
          placeholder="What do you want to investigate? (50 chars max)"
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#e0e0e0',
            fontSize: '0.95rem',
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
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={!inspection.trim()}
        style={{
          width: '100%',
          padding: '14px',
          border: 'none',
          borderRadius: '8px',
          background: inspection.trim() 
            ? 'linear-gradient(135deg, #ff6b6b 0%, #f06595 100%)' 
            : '#333',
          color: 'white',
          cursor: inspection.trim() ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
      >
        Investigate
      </button>
    </Modal>
  );
}