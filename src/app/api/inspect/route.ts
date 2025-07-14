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

    // Get the active case with solution and suspects for context
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        solution: true,
        suspects: true,
        coreEvidence: true,
        redHerrings: true
      }
    });

    if (!activeCase || !activeCase.solution) {
      return NextResponse.json({
        result: "Investigation area not available.",
        evidenceDiscovered: false,
        evidence: null
      });
    }

    // Determine if we should bias toward killer (30% chance)
    const shouldBiasTowardKiller = Math.random() < 0.3;
    
    console.log('🎯 Bias Decision:', shouldBiasTowardKiller ? 'KILLER BIAS' : 'NEUTRAL/RED HERRING');

    // Get killer information
    const killer = activeCase.suspects.find(s => s.name === activeCase.solution!.killer);
    const killerFirstName = killer ? killer.name.split(' ')[0] : '';

    // Build evidence context for what hasn't been discovered yet
    const discoveredEvidenceIds = new Set(gameState.evidence?.map((e: any) => e.id) || []);
    const availableCoreEvidence = activeCase.coreEvidence.filter(e => !discoveredEvidenceIds.has(e.name.toLowerCase().replace(/\s+/g, '_')));
    const availableRedHerrings = activeCase.redHerrings.filter(e => !discoveredEvidenceIds.has(e.name.toLowerCase().replace(/\s+/g, '_')));

    // Create contextual guidance for the AI
    const biasGuidance = shouldBiasTowardKiller 
      ? `BIAS TOWARD KILLER (${killerFirstName}): Look for ways to subtly connect this inspection to evidence that points toward ${killerFirstName}. Available killer evidence: ${availableCoreEvidence.map(e => `${e.emoji} ${e.name} - ${e.description}`).join(', ')}`
      : `NEUTRAL/RED HERRING BIAS: Look for ways to connect this inspection to misleading evidence or general scene details. Available red herrings: ${availableRedHerrings.map(e => `${e.emoji} ${e.name} - ${e.description}`).join(', ')}`;

    const prompt = `You are the game master for the murder mystery "${activeCase.title}". 
${activeCase.victim} was found dead in ${activeCase.setting}, struck with ${activeCase.murderWeapon}.

CASE CONTEXT:
${activeCase.description}

SOLUTION CONTEXT (for bias guidance only):
- Killer: ${activeCase.solution.killer}
- Method: ${activeCase.solution.murderMethod}
- Motive: ${activeCase.solution.killerMotives}

BIAS INSTRUCTION:
${biasGuidance}

SUSPECTS:
${activeCase.suspects.map(s => `- ${s.name} (${s.title}): ${s.emoji}`).join('\n')}

The player wants to inspect: "${inspection}"

INSTRUCTIONS:
- Provide a brief description of what they find during their investigation
- Keep responses to EXACTLY 1-3 FULL sentences, no more than 25 words.
- Be concise and descriptive
- Do NOT include any actions, asterisks, or stage directions - just describe what is observed
- Stay within the murder mystery setting described above
- MENTION SPECIFIC OBJECTS when possible (bottles, phones, fabric, keys, etc.)
- ${shouldBiasTowardKiller 
    ? `Subtly favor descriptions that could lead to evidence pointing toward ${killerFirstName}` 
    : 'Favor neutral observations or subtle misdirection toward other suspects'}

Current game context: ${gameState.actionsRemaining} actions remaining, ${gameState.evidence?.length || 0} pieces of evidence found.

Describe what the player observes when inspecting "${inspection}":`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 120,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : 'You examine the area carefully but find nothing particularly noteworthy.';
    
    console.log('- Inspection Result:', result);
    console.log('- Bias Applied:', shouldBiasTowardKiller ? 'Killer-focused' : 'Neutral/Misleading');

    // Call your existing evidence generation API with enhanced context
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
          characterName: shouldBiasTowardKiller ? killerFirstName : 'Investigation',
          existingEvidence: gameState.evidence || [],
          conversationHistory: gameState.inspectLog || [],
          actionsRemaining: gameState.actionsRemaining,
          evidenceCount: gameState.evidence?.length || 0,
          // Add bias context for evidence generation (without triggerWords)
          biasContext: {
            shouldBiasTowardKiller,
            killerName: activeCase.solution.killer,
            availableKillerEvidence: availableCoreEvidence,
            availableRedHerrings: availableRedHerrings
          }
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
      evidence: evidence,
      // Optional: Include debug info in development
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          biasApplied: shouldBiasTowardKiller ? 'killer' : 'neutral',
          targetSuspect: shouldBiasTowardKiller ? killerFirstName : 'none'
        }
      })
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