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
      <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#d4af37', marginBottom: '20px', textAlign: 'center' }}>
        🔍 Inspect
      </h2>

      {/* Inspect Log - Shows recent messages first */}
      <div style={{ 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: '8px', 
        padding: '15px', 
        margin: '20px 0', 
        maxHeight: '200px', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}>
        {inspectLog.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No inspections yet...</p>
        ) : (
          inspectLog.slice().reverse().map((entry, index) => (
            <div
              key={inspectLog.length - 1 - index}
              style={{
                margin: '10px 0',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: entry.type === 'player' ? 'rgba(0, 100, 0, 0.3)' : 'rgba(139, 69, 19, 0.3)',
                marginLeft: entry.type === 'player' ? '20px' : '0',
                marginRight: entry.type === 'suspect' ? '20px' : '0',
                color: 'white'
              }}
            >
              {entry.text}
            </div>
          ))
        )}
      </div>

      {/* Inspection Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap' }}>Inspect...</span>
        <input
          type="text"
          value={inspection}
          onChange={(e) => setInspection(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={50}
          placeholder="What do you want to inspect? (50 characters max)"
          style={{
            flex: 1,
            padding: '10px',
            border: '2px solid #8b4513',
            borderRadius: '8px',
            background: 'rgba(139, 69, 19, 0.2)',
            color: 'white',
            fontSize: '1em'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={!inspection.trim()}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(45deg, #8b0000, #a52a2a)',
            color: 'white',
            cursor: inspection.trim() ? 'pointer' : 'not-allowed',
            opacity: inspection.trim() ? 1 : 0.5,
            fontSize: '1em'
          }}
        >
          Inspect
        </button>
        <button
          onClick={onClose}
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
          Return
        </button>
      </div>
    </Modal>
  );
}