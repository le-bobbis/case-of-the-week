import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { suspectId, question, gameState } = await request.json();
    
    console.log('💬 CHAT REQUEST:');
    console.log('- Suspect:', suspectId);
    console.log('- Question:', question);
    
    // Get the active case with suspects
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        suspects: true
      }
    });

    if (!activeCase) {
      return NextResponse.json({ error: 'No active case found' }, { status: 404 });
    }

    // Find the specific suspect by their name (suspectId is lowercase name)
    const suspect = activeCase.suspects.find(s => 
      s.name.toLowerCase().includes(suspectId.toLowerCase())
    );

    if (!suspect) {
      return NextResponse.json({ error: 'Invalid suspect' }, { status: 400 });
    }

     // Build conversation history for context
    const conversationHistory = gameState.evidence?.length > 0 
      ? `Evidence discovered so far:
${gameState.evidence.map((e: { emoji: string, name: string, description: string }) => 
  `- ${e.emoji} ${e.name}: ${e.description}`
).join('\n')}`
      : 'No evidence has been discovered yet.';

    const prompt = `You are ${suspect.name}, a ${suspect.title} in the murder mystery case "${activeCase.title}".

CHARACTER PROFILE:
- Personality: ${suspect.personality}
- Background: ${suspect.background}
- Secret: ${suspect.secrets}
- Your alibi: ${suspect.alibi}

MURDER CONTEXT:
${activeCase.victim} was found dead in ${activeCase.setting} at ${activeCase.murderTime}, struck with ${activeCase.murderWeapon}. ${activeCase.description}

CURRENT SITUATION:
${conversationHistory}
Actions remaining: ${gameState.actionsRemaining}/20

IMPORTANT: The evidence above shows what has been discovered. You should:
- Acknowledge evidence that directly relates to you
- React appropriately if evidence implicates you
- Stay consistent with what evidence reveals
- Don't mention evidence that hasn't been discovered yet

The player just asked you: "${question}"

INSTRUCTIONS:
- Stay completely in character as ${suspect.name}
- Respond with ONLY direct speech - no actions, no *descriptions*, no narration
- Don't immediately reveal your secrets unless directly confronted with evidence
- Be helpful but also protective of yourself
- Keep responses to EXACTLY 1-2 sentences maximum
- CRITICAL: Each sentence must be complete with proper ending punctuation
- CRITICAL: Never end mid-sentence or with incomplete thoughts
- Show emotions through your words, not actions
- If asked about evidence, respond based on what your character would realistically know
- Be concise and direct
- NO asterisks (*), NO action descriptions, NO stage directions - just speak as the character
- NEVER use phrases like *sighs*, *looks away*, *nervously* etc.
- MENTION SPECIFIC OBJECTS when reasonable (wine, bottles, phones, keys, etc.)

Example of what NOT to do: 
- "*nervously fidgets* I don't know anything about that."
- "Well, I was just trying to... you know, I mean I didn't really see"
- "That's interesting, but I need to go check on something in the"

Example of what TO do: 
- "I don't know anything about that."
- "I was in the garden with James from 10:30 to 11:30."
- "That wine bottle? I haven't touched it."

Respond as ${suspect.name} with 1-2 complete sentences only:`;

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

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('- Character Response:', response);

    // Get conversation history for evidence generation
    const currentSuspect = gameState.suspectsData?.[suspectId];
    const conversationHistoryForEvidence = currentSuspect?.chatLog || [];

    // Call your existing evidence generation API
    let evidenceGenerated = false;
    let evidence = null;

    try {
      console.log('🧩 CALLING EVIDENCE API...');
      
      const evidenceResponse = await fetch('http://localhost:3000/api/evidence/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerQuestion: question,
          characterResponse: response,
          characterName: suspect.name,
          existingEvidence: gameState.evidence || [],
          conversationHistory: conversationHistoryForEvidence,
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
      response,
      evidenceDiscovered: evidenceGenerated,
      evidence: evidence
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 });
  }
}