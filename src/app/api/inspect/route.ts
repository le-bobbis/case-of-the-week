import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { generateContextualEvidence } from '@/lib/evidenceSystem';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { inspection, gameState } = await request.json();

    const prompt = `You are the game master for a murder mystery at Rosewood Vineyard estate. 
Marcus Thornfield was found dead in the wine cellar, struck with a vintage wine bottle.

The player wants to inspect: "${inspection}"

Provide a brief description of what they find during their investigation.
Keep responses to EXACTLY 1-3 sentences maximum.
Be concise and descriptive.
Do NOT include any actions, asterisks, or stage directions - just describe what is observed.
Stay within the murder mystery setting.

Examples:
- If inspecting "wine cellar": "The stone walls are damp and several bottles lie shattered on the floor. A pool of dark red wine mingles ominously with something else."
- If inspecting "door": "The heavy wooden door shows fresh scratches around the lock. A small piece of torn fabric clings to the rough wood."

Current game context: ${gameState.actionsRemaining} actions remaining, ${gameState.evidence?.length || 0} pieces of evidence found.

Describe what the player observes when inspecting "${inspection}":`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const result = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Use contextual evidence generation
    const evidence = generateContextualEvidence(
      inspection + ' ' + result, // Combine inspection and result for context
      'inspect',
      undefined, // No specific suspect for inspections
      gameState.evidence || []
    );

    return NextResponse.json({
      result,
      evidenceDiscovered: evidence !== null,
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