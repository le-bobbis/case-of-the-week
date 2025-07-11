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

    if (!inspection || !inspection.trim()) {
      return NextResponse.json({
        result: "You need to specify what you want to inspect.",
        evidenceDiscovered: false,
        evidence: null
      });
    }

    // Get the active case for context
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      select: {
        title: true,
        victim: true,
        murderWeapon: true,
        setting: true,
        description: true
      }
    });

    if (!activeCase) {
      return NextResponse.json({
        result: "Investigation area not available.",
        evidenceDiscovered: false,
        evidence: null
      });
    }

    const prompt = `You are the game master for the murder mystery "${activeCase.title}". 
${activeCase.victim} was found dead in ${activeCase.setting}, struck with ${activeCase.murderWeapon}.

Setting context: ${activeCase.description}

The player wants to inspect: "${inspection}"

Provide a brief description of what they find during their investigation.
Keep responses to EXACTLY 1-3 sentences maximum.
Be concise and descriptive.
Do NOT include any actions, asterisks, or stage directions - just describe what is observed.
Stay within the murder mystery setting described above.
MENTION SPECIFIC OBJECTS when possible (bottles, phones, fabric, keys, etc.)

Current game context: ${gameState.actionsRemaining} actions remaining, ${gameState.evidence?.length || 0} pieces of evidence found.

Describe what the player observes when inspecting "${inspection}":`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : 'You examine the area carefully but find nothing particularly noteworthy.';
    
    console.log('- Inspection Result:', result);

    // Call your existing evidence generation API
    let evidenceGenerated = false;
    let evidence = null;

    try {
      console.log('🧩 CALLING EVIDENCE API...');
      
      const evidenceResponse = await fetch('http://localhost:3000/api/evidence/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerQuestion: `Inspect ${inspection}`,
          characterResponse: result,
          existingEvidence: gameState.evidence || [],
          conversationHistory: gameState.inspectLog || [],
          actionsRemaining: gameState.actionsRemaining,
          evidenceCount: gameState.evidence?.length || 0
        })
      });

      console.log('- Evidence API Status:', evidenceResponse.status);

      if (evidenceResponse.ok) {
        const evidenceData = await evidenceResponse.json();
        console.log('- Evidence API Response:', evidenceData);
        
        evidenceGenerated = evidenceData.evidenceGenerated;
        evidence = evidenceData.evidence;
        
        console.log('- Evidence Generated:', evidenceGenerated);
        console.log('- Evidence Object:', evidence);
      } else {
        console.error('Evidence API error:', evidenceResponse.status, await evidenceResponse.text());
      }
    } catch (evidenceError) {
      console.error('❌ Evidence generation failed:', evidenceError);
    }

    return NextResponse.json({
      result,
      evidenceDiscovered: evidenceGenerated,
      evidence: evidence
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