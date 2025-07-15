export interface TimelineEvent {
  time: string;        // e.g., "10:15 PM"
  action: string;      // What the suspect did
  location: string;    // Where they were
  observable: boolean; // Could others have seen this?
  witnesses?: string[];// Optional: Who could have witnessed this
}

export interface Suspect {
  id: string;
  name: string;
  emoji: string;
  title: string;
  bio: string;
  timeline?: TimelineEvent[]; // Add timeline array
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