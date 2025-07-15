import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      playerQuestion, 
      characterResponse, 
      characterName,
      existingEvidence, 
      conversationHistory,
      actionsRemaining,
      evidenceCount
    } = await request.json();

    console.log('🧩 EVIDENCE GENERATION REQUEST:');
    console.log('- Character Response:', characterResponse);
    console.log('- Evidence Count:', evidenceCount);

    // Get the active case
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        solution: true,
        suspects: true
      }
    });

    if (!activeCase || !activeCase.solution) {
      console.error('❌ No active case found');
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

    // Build existing evidence tracking for duplicate prevention
    const existingTypes = new Set();
    const existingEmojis = new Set();
    const existingNames = new Set();
    
    const existingEvidenceList = existingEvidence.map((e: any) => {
      // Track by emoji
      existingEmojis.add(e.emoji);
      
      // Track by name (case-insensitive)
      existingNames.add(e.name.toLowerCase());
      
      // Track object types from emojis
      if (['📱', '📞', '☎️'].includes(e.emoji)) existingTypes.add('phone');
      if (['🍷', '🍾', '🥂', '🍼'].includes(e.emoji)) existingTypes.add('wine/bottle');
      if (['👔', '🧵', '👗', '🧣', '🧥'].includes(e.emoji)) existingTypes.add('clothing/fabric');
      if (['📋', '📄', '📝', '💰'].includes(e.emoji)) existingTypes.add('document/paper');
      if (['🔑', '🗝️'].includes(e.emoji)) existingTypes.add('key');
      if (['👟', '👠', '👞', '👢'].includes(e.emoji)) existingTypes.add('footwear');
      if (['💻', '🖥️'].includes(e.emoji)) existingTypes.add('computer');
      if (['🩸', '🔴', '💧', '🩹'].includes(e.emoji)) existingTypes.add('blood');
      if (['📷', '📹'].includes(e.emoji)) existingTypes.add('camera');
      if (['⏰', '⌚'].includes(e.emoji)) existingTypes.add('time/watch');
      if (['👆', '🖐️', '✋', '🤚'].includes(e.emoji)) existingTypes.add('fingerprints');
      if (['🌿', '🏡', '🌳', '🌷'].includes(e.emoji)) existingTypes.add('location/garden');
      
      return `${e.emoji} ${e.name}`;
    }).join(', ');

    const prompt = `You are managing evidence for "${activeCase.title}" murder mystery.

CASE CONTEXT:
- Victim: ${activeCase.victim}
- Weapon: ${activeCase.murderWeapon}
- Killer: ${activeCase.solution.killer}
- Valid Characters: ${activeCase.suspects.map(s => s.name).join(', ')}, ${activeCase.victim}

RESPONSE TO ANALYZE: "${characterResponse}"
SOURCE: ${characterName === 'Investigation' ? 'INSPECT function' : `${characterName} (suspect)`}

EXISTING EVIDENCE: ${existingEvidenceList || 'None'}
FORBIDDEN TYPES: ${Array.from(existingTypes).join(', ') || 'None'}

STRICT RULES:
1. ONLY create evidence if a physical object was EXPLICITLY NAMED in the response
2. Evidence description must be ONE SENTENCE, maximum 10 words
3. Description must be purely factual - no interpretation or speculation
4. Do NOT create evidence of any type that already exists (see FORBIDDEN TYPES)
5. Do NOT infer or imagine objects that weren't directly mentioned
6. ONLY use character names from VALID CHARACTERS list - no new people
7. Inspect responses CAN generate evidence just like suspect responses

VALID EXAMPLES:
- Suspect: "I dropped my phone near the door" → CREATE phone evidence
- Inspect: "A broken wine bottle lies on the floor" → CREATE wine bottle evidence
- Suspect: "I saw Elena's torn scarf" → CREATE scarf/fabric evidence (Elena is valid character)
- Inspect: "Marcus's wallet sits on the table" → CREATE wallet evidence (Marcus is valid character)

INVALID EXAMPLES:
- "I was nervous" → NO EVIDENCE (no object mentioned)
- "The room was dark" → NO EVIDENCE (no specific object)
- "Something fell" → NO EVIDENCE (object not specified)
- "John's keys were there" → NO EVIDENCE (John not in valid characters)

CRITICAL: 
- Generate ONLY ONE piece of evidence per response
- If multiple objects are mentioned, pick the FIRST valid one
- Response must be COMPLETE JSON - no truncation

Analyze the response. If it contains an explicit physical object not in forbidden types, respond with ONLY valid JSON:
{
  "shouldGenerate": true,
  "evidence": {
    "id": "unique_id",
    "name": "Object Name",
    "emoji": "📱",
    "description": "Brief factual description under 10 words"
  }
}

If no valid evidence should be generated, respond with EXACTLY: NO_EVIDENCE`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      temperature: 0.3, // Lower temperature for more consistent decisions
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('- AI Decision:', response.trim());
    
    // Handle NO_EVIDENCE response
    if (response.trim() === 'NO_EVIDENCE') {
      console.log('✅ No evidence to generate');
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

    // Parse JSON response
    try {
      // Extract JSON from response
      let jsonString = response.trim();
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
      }
      
      const parsedResponse = JSON.parse(jsonString);
      
      if (parsedResponse.shouldGenerate && parsedResponse.evidence) {
        const evidence = parsedResponse.evidence;
        
        // Validate evidence structure
        if (evidence.id && evidence.name && evidence.emoji && evidence.description) {
          // Triple-check duplicates
          if (existingEmojis.has(evidence.emoji)) {
            console.log('❌ Duplicate emoji blocked:', evidence.emoji);
            return NextResponse.json({ evidenceGenerated: false, evidence: null });
          }
          
          if (existingNames.has(evidence.name.toLowerCase())) {
            console.log('❌ Duplicate name blocked:', evidence.name);
            return NextResponse.json({ evidenceGenerated: false, evidence: null });
          }
          
          const evidenceType = getEvidenceType(evidence.emoji);
          if (existingTypes.has(evidenceType)) {
            console.log('❌ Duplicate type blocked:', evidenceType);
            return NextResponse.json({ evidenceGenerated: false, evidence: null });
          }
          
          console.log('✅ Evidence generated:', evidence.name);
          return NextResponse.json({
            evidenceGenerated: true,
            evidence: evidence
          });
        }
      }
      
      console.log('❌ Invalid evidence structure');
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
      
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

  } catch (error) {
    console.error('❌ Evidence generation error:', error);
    return NextResponse.json({
      evidenceGenerated: false,
      evidence: null
    });
  }
}

// Helper function to determine evidence type from emoji
function getEvidenceType(emoji: string): string {
  const typeMap: Record<string, string[]> = {
    'phone': ['📱', '📞', '☎️'],
    'wine/bottle': ['🍷', '🍾', '🥂', '🍼'],
    'clothing/fabric': ['👔', '🧵', '👗', '🧣', '🧥'],
    'document/paper': ['📋', '📄', '📝', '💰'],
    'key': ['🔑', '🗝️'],
    'footwear': ['👟', '👠', '👞', '👢'],
    'computer': ['💻', '🖥️'],
    'blood': ['🩸', '🔴', '💧', '🩹'],
    'camera': ['📷', '📹'],
    'time/watch': ['⏰', '⌚'],
    'fingerprints': ['👆', '🖐️', '✋', '🤚'],
    'location/garden': ['🌿', '🏡', '🌳', '🌷']
  };

  for (const [type, emojis] of Object.entries(typeMap)) {
    if (emojis.includes(emoji)) {
      return type;
    }
  }
  
  return emoji; // Return emoji itself as type if not mapped
}