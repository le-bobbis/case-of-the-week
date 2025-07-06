import { Evidence } from '@/types/game';

export function generateContextualEvidence(
  context: string,
  method: 'chat' | 'inspect',
  suspectId?: string,
  existingEvidence: Evidence[] = []
): Evidence | null {
  
  // Get existing evidence IDs to prevent duplicates
  const existingIds = existingEvidence.map(e => e.id);
  
  // Normalize context for matching
  const normalizedContext = context.toLowerCase();
  
  // Evidence generation rules based on context
  const evidenceRules = [
    // Wine/bottle related
    {
      triggers: ['wine', 'bottle', 'glass', 'drinking'],
      evidence: {
        id: 'wine_bottle_fingerprints',
        name: 'Wine Bottle Fingerprints',
        emoji: '🍷',
        description: 'Murder weapon with Elena\'s fingerprints'
      }
    },
    {
      triggers: ['wine', 'spilled', 'stain', 'red'],
      evidence: {
        id: 'wine_stains',
        name: 'Wine Stains',
        emoji: '🍇',
        description: 'Fresh wine stains on suspect\'s clothing'
      }
    },
    
    // Door/entrance related
    {
      triggers: ['door', 'entrance', 'cellar', 'lock'],
      evidence: {
        id: 'torn_fabric',
        name: 'Torn Fabric',
        emoji: '👔',
        description: 'Piece of Elena\'s scarf caught on door'
      }
    },
    {
      triggers: ['key', 'locked', 'unlock', 'access'],
      evidence: {
        id: 'cellar_key',
        name: 'Cellar Key',
        emoji: '🔑',
        description: 'Wine cellar key with fresh scratches'
      }
    },
    
    // Phone/communication related
    {
      triggers: ['phone', 'message', 'text', 'call', 'threatening'],
      evidence: {
        id: 'threatening_messages',
        name: 'Threatening Messages',
        emoji: '📱',
        description: 'Marcus\'s phone showing blackmail texts'
      }
    },
    
    // Physical traces
    {
      triggers: ['blood', 'bleeding', 'injury'],
      evidence: {
        id: 'blood_traces',
        name: 'Blood Traces',
        emoji: '🩸',
        description: 'Small blood droplets leading from scene'
      }
    },
    {
      triggers: ['footprint', 'shoe', 'print', 'track'],
      evidence: {
        id: 'footprints',
        name: 'Muddy Footprints',
        emoji: '👟',
        description: 'Size 7 footprints matching Elena\'s shoes'
      }
    },
    {
      triggers: ['glove', 'hand', 'finger'],
      evidence: {
        id: 'leather_gloves',
        name: 'Leather Gloves',
        emoji: '🧤',
        description: 'Discarded gloves near the scene'
      }
    },
    
    // Elena-specific evidence
    {
      triggers: ['theater', 'drama', 'acting', 'production'],
      evidence: {
        id: 'theater_program',
        name: 'Theater Program',
        emoji: '🎭',
        description: 'Program showing Elena\'s financial troubles'
      }
    },
    {
      triggers: ['money', 'financial', 'debt', 'embezzle'],
      evidence: {
        id: 'financial_records',
        name: 'Financial Records',
        emoji: '💰',
        description: 'Evidence of Elena\'s college fund theft'
      }
    },
    
    // Security/surveillance
    {
      triggers: ['camera', 'video', 'footage', 'security'],
      evidence: {
        id: 'security_footage',
        name: 'Security Footage',
        emoji: '📷',
        description: 'Camera showing Elena at cellar at 10:45 PM'
      }
    },
    
    // Time-related evidence
    {
      triggers: ['time', 'when', 'clock', 'watch'],
      evidence: {
        id: 'timeline_evidence',
        name: 'Timeline Evidence',
        emoji: '⏰',
        description: 'Witness statements confirming Elena\'s movements'
      }
    },
    
    // Red herring evidence for other suspects
    {
      triggers: ['sarah', 'lawyer', 'romantic'],
      evidence: {
        id: 'sarah_lipstick',
        name: 'Lipstick Mark',
        emoji: '💄',
        description: 'Sarah\'s lipstick on Marcus\'s wine glass'
      }
    },
    {
      triggers: ['david', 'computer', 'laptop', 'coding'],
      evidence: {
        id: 'laptop_alibi',
        name: 'Laptop Activity Log',
        emoji: '💻',
        description: 'David\'s computer showing active coding during murder'
      }
    }
  ];
  
  // Find matching evidence based on context
  for (const rule of evidenceRules) {
    // Check if any trigger words match the context
    if (rule.triggers.some(trigger => normalizedContext.includes(trigger))) {
      // Check if this evidence hasn't been discovered yet
      if (!existingIds.includes(rule.evidence.id)) {
        return rule.evidence;
      }
    }
  }
  
  return null; // No new evidence to discover
}