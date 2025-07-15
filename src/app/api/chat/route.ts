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
    console.log('- Actions Remaining:', gameState.actionsRemaining);
    
    // Get the active case with all details
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

    // Find the specific suspect
    const suspect = activeCase.suspects.find(s => 
      s.name.toLowerCase().includes(suspectId.toLowerCase())
    );

    if (!suspect) {
      return NextResponse.json({ error: 'Invalid suspect' }, { status: 400 });
    }

     // Build conversation history
    const conversationHistory = gameState.suspectsData?.[suspectId]?.chatLog?.length > 0
      ? gameState.suspectsData[suspectId].chatLog.map((msg: any) => msg.text).join('\n')
      : 'No previous conversation.';

    // Build evidence context
    const evidenceContext = gameState.evidence?.length > 0
      ? gameState.evidence.map((e: any) => `${e.emoji} ${e.name}: ${e.description}`).join('\n')
      : 'No evidence discovered yet.';

    // Build inspection history
    const inspectionHistory = gameState.inspectLog?.length > 0
      ? gameState.inspectLog.map((log: any) => log.text).join('\n')
      : 'No inspections conducted.';

    // Format timeline for the prompt
    const timelineContext = suspect.timeline && suspect.timeline.length > 0
      ? suspect.timeline.map((event: any) => 
          `${event.time}: ${event.action} at ${event.location}${event.witnesses?.length > 0 ? ` (witnessed by: ${event.witnesses.join(', ')})` : ''}`
        ).join('\n')
      : 'No timeline available.';

    const prompt = `You are ${suspect.name}, a ${suspect.title} in "${activeCase.title}".

CASE FACTS:
- Victim: ${activeCase.victim}
- Location: ${activeCase.setting}
- Time: ${activeCase.murderTime}
- Weapon: ${activeCase.murderWeapon}

YOUR CHARACTER:
- Name: ${suspect.name}
- Role: ${suspect.title}
- Personality: ${suspect.personality}
- Background: ${suspect.background}
- Secret: ${suspect.secrets}
- Alibi: ${suspect.alibi}
${suspect.isKiller ? '- YOU ARE THE KILLER' : '- You are innocent'}

YOUR TIMELINE:
${timelineContext}

GAME STATE:
EVIDENCE DISCOVERED:
${evidenceContext}

INSPECTION FINDINGS:
${inspectionHistory}

CONVERSATION HISTORY:
${conversationHistory}

The player asks: "${question}"

STRICT RULES:
1. Stay completely in character as ${suspect.name}
2. Maximum 25 words, in 1-3 COMPLETE sentences
3. Use only direct speech - no actions, no *descriptions*
4. Be consistent with all evidence, inspections, and previous statements
5. Don't contradict established facts or your previous answers
6. Reference evidence/inspections naturally if relevant
7. Protect your secrets unless directly confronted with proof
8. If innocent, you genuinely don't know who did it
9. NEVER contradict your timeline - if asked about your whereabouts, reference specific times and locations from your timeline
10. If witnesses are mentioned in your timeline, acknowledge them appropriately

Respond as ${suspect.name}:`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 80,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const response = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'I need a moment to think about that.';
    
    console.log('- Character Response:', response);

    // Return the response immediately
    return NextResponse.json({
      response,
      evidenceDiscovered: false, // Will be handled by separate endpoint
      evidence: null
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process question' 
    }, { status: 500 });
  }
}