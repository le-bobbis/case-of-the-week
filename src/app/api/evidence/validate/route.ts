// src/app/api/evidence/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      proposedEvidence,
      existingEvidence
    } = await request.json();

    console.log('🔍 EVIDENCE UNIQUENESS CHECK:');
    console.log('- Proposed:', proposedEvidence);
    console.log('- Existing Count:', existingEvidence.length);

    // Build existing evidence context
    const existingEvidenceList = existingEvidence.map((e: any) => 
      `${e.emoji} ${e.name}: ${e.description}`
    ).join('\n');

    const prompt = `You are evaluating whether new evidence is meaningfully different from existing evidence.

EXISTING EVIDENCE:
${existingEvidenceList || 'None'}

PROPOSED EVIDENCE:
${proposedEvidence.emoji} ${proposedEvidence.name}: ${proposedEvidence.description}

EVALUATION CRITERIA:
1. Is this evidence conceptually different from existing evidence?
2. Does it provide new information about the case?
3. Would a detective consider this a separate clue?

Consider these as SIMILAR (should reject):
- "Wine bottle with fingerprints" vs "Bottle with Elena's prints" 
- "Torn fabric from scarf" vs "Piece of Elena's clothing"
- "Security footage of Elena" vs "Camera showing Elena at 10:45"

Consider these as DIFFERENT (should accept):
- "Wine bottle with fingerprints" vs "Empty wine glass"
- "Security footage" vs "Witness testimony"
- "Torn fabric" vs "Muddy footprints"

CRITICAL: Also check if the EMOJI is already used. Each piece of evidence must have a unique emoji.

Existing emojis: ${existingEvidence.map((e: any) => e.emoji).join(', ') || 'None'}

Respond with ONLY valid JSON:
{
  "isUnique": true/false,
  "reason": "Brief explanation",
  "suggestedEmoji": "🔍" // Only if current emoji is duplicate
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    
    try {
      const result = JSON.parse(response);
      console.log('- Uniqueness Result:', result);
      
      return NextResponse.json({
        isUnique: result.isUnique,
        reason: result.reason,
        suggestedEmoji: result.suggestedEmoji
      });
      
    } catch (parseError) {
      console.error('Failed to parse uniqueness response:', parseError);
      return NextResponse.json({
        isUnique: false,
        reason: 'Failed to validate uniqueness'
      });
    }

  } catch (error) {
    console.error('Evidence validation error:', error);
    return NextResponse.json({
      isUnique: false,
      reason: 'Validation error occurred'
    });
  }
}