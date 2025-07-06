export interface Suspect {
  id: string;
  name: string;
  emoji: string;
  title: string;
  bio: string;
  chatLog: ChatMessage[];
}

export interface ChatMessage {
  type: 'player' | 'suspect';
  text: string;
}

export interface Evidence {
  id: string;        // Unique identifier to prevent duplicates
  name: string;      // For suspect modal hover
  emoji: string;     // Visual representation
  description: string; // For main game screen hover
}

export interface GameState {
  actionsRemaining: number;
  evidence: Evidence[];
  currentSuspect: string;
  inspectLog: ChatMessage[];
}