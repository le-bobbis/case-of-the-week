import { Evidence } from '@/types/game';

interface EvidenceGridProps {
  evidence: Evidence[];
}

export default function EvidenceGrid({ evidence }: EvidenceGridProps) {
  return (
    <div className="evidence-section">
      <h2 className="section-title">Evidence</h2>
      <div className="evidence-grid">
        {Array.from({ length: 20 }, (_, index) => {
          const evidenceItem = evidence[index];
          return (
            <div
              key={index}
              className={`evidence-slot ${evidenceItem ? 'filled' : ''}`}
              title={evidenceItem?.description || ''} // Use description for hover in main game
            >
              {evidenceItem ? evidenceItem.emoji : '?'}
            </div>
          );
        })}
      </div>
    </div>
  );
}