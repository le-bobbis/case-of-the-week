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

    console.log('🔍 INSPECT REQUEST:');
    console.log('- Inspection:', inspection);
    console.log('- Actions Remaining:', gameState.actionsRemaining);
    console.log('- Evidence Count:', gameState.evidence?.length || 0);

    // Validate input
    if (!inspection || !inspection.trim()) {
      return NextResponse.json({
        result: "You need to specify what you want to inspect.",
        evidenceDiscovered: false,
        evidence: null
      });
    }

    // Get the active case with all details
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        solution: true,
        suspects: true
      }
    });

    if (!activeCase) {
      return NextResponse.json({
        result: "Investigation area not available.",
        evidenceDiscovered: false,
        evidence: null
      });
    }

    // Build investigation history context
    const investigationHistory = gameState.inspectLog?.length > 0
      ? gameState.inspectLog.map((log: any) => log.text).join('\n')
      : 'No previous investigations.';

    // Build evidence context
    const evidenceContext = gameState.evidence?.length > 0
      ? gameState.evidence.map((e: any) => `${e.emoji} ${e.name}: ${e.description}`).join('\n')
      : 'No evidence discovered yet.';

    // Create the simplified prompt
    const prompt = `You are investigating "${activeCase.title}" murder mystery.

CASE DETAILS:
- Victim: ${activeCase.victim}
- Location: ${activeCase.setting}
- Murder Weapon: ${activeCase.murderWeapon}
- Time: ${activeCase.murderTime}
- Description: ${activeCase.description}

SUSPECTS:
${activeCase.suspects.map(s => `- ${s.name} (${s.title})`).join('\n')}

INVESTIGATION HISTORY:
${investigationHistory}

EVIDENCE DISCOVERED:
${evidenceContext}

The player wants to inspect: "${inspection}"

INSTRUCTIONS:
1. Describe what is observed in simple, neutral language
2. Maximum 25 words, in 1-3 COMPLETE sentences
3. Be purely descriptive - no speculation or conclusions
4. Stay consistent with previous observations
5. Focus on physical details only
6. Do not contradict any previous investigations OR suspect responses.

Describe what you observe:`;

    // Get AI response
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const result = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'You examine the area but find nothing noteworthy.';
    
    console.log('- Inspection Result:', result);

    // Return the result immediately
    return NextResponse.json({
      result,
      evidenceDiscovered: false, // Will be handled by separate endpoint
      evidence: null
    });

  } catch (error) {
    console.error('❌ Inspect API error:', error);
    return NextResponse.json({
      result: "Unable to inspect that area.",
      evidenceDiscovered: false,
      evidence: null
    });
  }
}