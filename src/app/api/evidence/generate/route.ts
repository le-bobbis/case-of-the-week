import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Evidence, ChatMessage } from '@/types/game';
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
      existingEvidence, 
      conversationHistory 
    } = await request.json();

    // Fetch the active case and its solution from database
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        solution: true
      }
    });

    if (!activeCase || !activeCase.solution) {
      console.error('No active case or solution found');
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

    // Build context for existing evidence to prevent duplicates
    const existingEvidenceContext = existingEvidence.length > 0 
      ? `Already discovered evidence: ${existingEvidence.map((e: Evidence) => `${e.emoji} ${e.name} - ${e.description}`).join(', ')}`
      : 'No evidence discovered yet.';

    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0
      ? `Recent conversation: ${conversationHistory.slice(-6).map((msg: ChatMessage) => msg.text).join(' ')}`
      : 'First interaction.';

    const prompt = `You are the evidence manager for "${activeCase.title}" murder mystery game.

CASE CONTEXT:
- Victim: ${activeCase.victim}, killed with ${activeCase.murderWeapon} at ${activeCase.murderTime}
- Setting: ${activeCase.setting}
- Killer: ${activeCase.solution.killer}
- Motive: ${activeCase.solution.killerMotives}
- Method: ${activeCase.solution.murderMethod}

CURRENT SITUATION:
Player asked: "${playerQuestion}"
Character responded: "${characterResponse}"

GAME STATE:
${existingEvidenceContext}
${conversationContext}

YOUR TASK:
Analyze the character's response. Does it contain any interesting nouns, objects, or concepts that could become a physical piece of evidence? 

EVIDENCE GENERATION RULES:
1. BE AGGRESSIVE - If ANY physical object is mentioned, strongly consider generating evidence
2. Objects that should ALWAYS generate evidence: weapons, bottles, phones, keys, clothing items, documents, cameras, etc.
3. Locations can generate evidence if they contain specific details (scratches on door, stains on floor, etc.)
4. Maximum ONE piece of evidence per response
5. Evidence should feel natural and connected to what was just discussed
6. Can be either a REAL CLUE (points toward the killer) or RED HERRING (misleading)
7. Must not duplicate existing evidence concepts
8. Evidence must be realistic for this murder scene investigation

DESCRIPTION RULES:
- Describe ONLY what is physically observed
- NO interpretations, conclusions, or speculation
- NO phrases like "likely murder weapon", "suspicious", "probably", "appears to be"
- Use neutral, factual language
- Focus on physical characteristics: size, color, condition, location

GOOD EXAMPLES:
- "A shattered vintage wine bottle found next to the victim's body"
- "A torn piece of fabric caught on the cellar door handle"
- "A smartphone with several missed calls on the screen"

BAD EXAMPLES:
- "A wine bottle that appears to be the murder weapon"
- "Suspicious fabric that likely belongs to the killer"
- "A phone with threatening messages (clearly evidence of blackmail)"

RESPONSE FORMAT:
If no evidence should be generated, respond with: NO_EVIDENCE

If evidence should be generated, respond with valid JSON:
{
  "shouldGenerate": true,
  "evidence": {
    "id": "unique_evidence_id",
    "name": "Evidence Name",
    "emoji": "📱",
    "description": "Brief factual description with no interpretation"
  }
}

Generate evidence based on the character response:`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('🧩 EVIDENCE GENERATION DEBUG:');
    console.log('- Player Question:', playerQuestion);
    console.log('- Character Response:', characterResponse);
    console.log('- AI Decision:', response.trim());
    
    // Handle NO_EVIDENCE response
    if (response.trim() === 'NO_EVIDENCE') {
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

    // Try to parse JSON response
    try {
      const parsedResponse = JSON.parse(response);
      
      if (parsedResponse.shouldGenerate && parsedResponse.evidence) {
        // Validate evidence structure
        const evidence = parsedResponse.evidence;
        if (evidence.id && evidence.name && evidence.emoji && evidence.description) {
          return NextResponse.json({
            evidenceGenerated: true,
            evidence: evidence
          });
        }
      }
      
      // Invalid structure
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
      
    } catch (parseError) {
      console.error('Failed to parse AI evidence response:', parseError);
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

  } catch (error) {
    console.error('Evidence generation API error:', error);
    return NextResponse.json({
      evidenceGenerated: false,
      evidence: null
    });
  }
}