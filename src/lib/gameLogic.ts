import { Evidence } from '@/types/game';


export const evidencePool: Evidence[] = [
  { id: 'wine_bottle', name: 'Wine Bottle', emoji: '🍷', description: 'Wine bottle with fingerprints' },
  { id: 'leather_gloves', name: 'Leather Gloves', emoji: '🧤', description: 'Leather gloves found nearby' },
  { id: 'phone_messages', name: 'Phone Messages', emoji: '📱', description: 'Phone with suspicious messages' },
  { id: 'cellar_key', name: 'Cellar Key', emoji: '🔑', description: 'Key to the wine cellar' },
  { id: 'torn_fabric', name: 'Torn Fabric', emoji: '👔', description: 'Torn piece of clothing' },
  { id: 'lipstick_mark', name: 'Lipstick Mark', emoji: '💄', description: 'Lipstick mark on glass' },
  { id: 'expensive_watch', name: 'Expensive Watch', emoji: '⌚', description: 'Expensive watch' },
  { id: 'security_footage', name: 'Security Footage', emoji: '📷', description: 'Security camera footage' },
  { id: 'blood_traces', name: 'Blood Traces', emoji: '🩸', description: 'Blood traces on the floor' },
  { id: 'muddy_footprints', name: 'Muddy Footprints', emoji: '👟', description: 'Muddy footprints' }
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