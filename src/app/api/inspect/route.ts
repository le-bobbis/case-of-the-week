import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { inspection, gameState } = await request.json();

    // Fetch active case with suspects from database
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        suspects: true,
        solution: true
      }
    });

    if (!activeCase) {
      return NextResponse.json({ error: 'No active case found' }, { status: 404 });
    }

    // Build suspect names for context
    const suspectNames = activeCase.suspects.map(s => `${s.name} (${s.title})`).join(', ');

    const prompt = `You are the game master for "${activeCase.title}" murder mystery. 

CASE DETAILS:
- Victim: ${activeCase.victim} was found dead ${activeCase.setting}
- Murder weapon: ${activeCase.murderWeapon} at ${activeCase.murderTime}
- Setting: ${activeCase.setting}
- Suspects: ${suspectNames}

BACKGROUND: ${activeCase.description}

The player wants to inspect: "${inspection}"

INSTRUCTIONS:
- Provide a brief description of what they find during their investigation
- Keep responses to EXACTLY 1-3 sentences maximum
- Be concise and descriptive
- Use the ACTUAL suspect names and case details provided above
- Do NOT make up different characters or details
- Do NOT include any actions, asterisks, or stage directions - just describe what is observed
- Stay within this specific murder mystery setting

Current game context: ${gameState.actionsRemaining} actions remaining, ${gameState.evidence?.length || 0} pieces of evidence found.

Describe what the player observes when inspecting "${inspection}":`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('🔍 INSPECT DEBUG:');
    console.log('- Inspection:', inspection);
    console.log('- AI Result:', result);
    
    // Call AI evidence generation
    let evidenceGenerated = false;
    let newEvidence = null;
    
    try {
      const evidenceResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/evidence/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerQuestion: `Inspect ${inspection}`,
          characterResponse: result,
          existingEvidence: gameState.evidence || [],
          conversationHistory: gameState.inspectLog || []
        })
      });

      if (evidenceResponse.ok) {
        const evidenceData = await evidenceResponse.json();
        evidenceGenerated = evidenceData.evidenceGenerated;
        newEvidence = evidenceData.evidence;
        
        console.log('- Evidence Generated:', evidenceGenerated);
        if (newEvidence) {
          console.log('- New Evidence:', newEvidence.emoji, newEvidence.name);
        }
      }
    } catch (evidenceError) {
      console.error('Evidence generation failed:', evidenceError);
      // Continue without evidence generation
    }

    return NextResponse.json({
      result,
      evidenceDiscovered: evidenceGenerated,
      evidence: newEvidence
    });

  } catch (error) {
    console.error('Inspect API error:', error);
    return NextResponse.json({
      result: "You examine the area carefully but find nothing particularly noteworthy.",
      evidenceDiscovered: false,
      evidence: null
    });
  }
}