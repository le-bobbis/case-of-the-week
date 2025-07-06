import { Suspect } from '@/types/game';

interface SuspectCardProps {
  suspect: Suspect;
  onClick: () => void;
}

export default function SuspectCard({ suspect, onClick }: SuspectCardProps) {
  return (
    <div 
      className="suspect-card"
      onClick={onClick}
      title={`${suspect.name} - ${suspect.title}`}
    >
      <span className="suspect-emoji">{suspect.emoji}</span>
      <div className="suspect-name">{suspect.name.split(' ')[0]}</div>
    </div>
  );
}