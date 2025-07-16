// src/components/game/CaseNavigation.tsx
interface CaseNavigationProps {
  prevCaseId: string | null;
  nextCaseId: string | null;
  currentIndex: number;
  totalCases: number;
  onNavigate: (caseId: string) => void;
}

export default function CaseNavigation({ 
  prevCaseId, 
  nextCaseId, 
  currentIndex, 
  totalCases, 
  onNavigate 
}: CaseNavigationProps) {
  return (
    <div className="case-navigation">
      <button 
        onClick={() => prevCaseId && onNavigate(prevCaseId)}
        disabled={!prevCaseId}
        className="nav-arrow prev"
      >
        ← Previous Case
      </button>
      
      <span className="case-counter">
        Case {currentIndex} of {totalCases}
      </span>
      
      <button 
        onClick={() => nextCaseId && onNavigate(nextCaseId)}
        disabled={!nextCaseId}
        className="nav-arrow next"
      >
        Next Case →
      </button>
    </div>
  );
}