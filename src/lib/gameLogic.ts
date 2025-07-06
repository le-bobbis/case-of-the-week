import { Evidence } from '@/types/game';

export const evidencePool = [
  { emoji: '🍷', description: 'Wine bottle with fingerprints' },
  { emoji: '🧤', description: 'Leather gloves found nearby' },
  { emoji: '📱', description: 'Phone with suspicious messages' },
  { emoji: '🔑', description: 'Key to the wine cellar' },
  { emoji: '👔', description: 'Torn piece of clothing' },
  { emoji: '💄', description: 'Lipstick mark on glass' },
  { emoji: '⌚', description: 'Expensive watch' },
  { emoji: '📷', description: 'Security camera footage' },
  { emoji: '🩸', description: 'Blood traces on the floor' },
  { emoji: '👟', description: 'Muddy footprints' }
];

export function getRandomEvidence(): Evidence {
  const randomIndex = Math.floor(Math.random() * evidencePool.length);
  return evidencePool[randomIndex];
}

export function getPlaceholderResponse(): string {
  const responses = [
    "I was in the garden during that time.",
    "I don't know anything about that.",
    "Marcus seemed troubled tonight.",
    "You should ask the others about their whereabouts.",
    "I noticed something strange earlier..."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}