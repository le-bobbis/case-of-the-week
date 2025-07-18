import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { GameState, Suspect } from '@/types/game';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatRequestBody {
  suspectId: string;
  question: string;
  gameState: GameState & { suspectsData?: Record<string, Suspect> };
  caseId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { suspectId, question, gameState, caseId } =
      await request.json() as ChatRequestBody;
    
    console.log('💬 CHAT REQUEST:');
    console.log('- Case:', caseId);
    console.log('- Suspect:', suspectId);
    console.log('- Question:', question);
    console.log('- Actions Remaining:', gameState.actionsRemaining);
    
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    // Get the specific case with all details
    const activeCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        suspects: true,
        solution: true
      }
    });

    if (!activeCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
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

    // Analyze conversation history for evidence mentions
    const conversationText = conversationHistory.toLowerCase();
    const currentQuestionLower = question.toLowerCase();
    
    // Track which evidence has been brought up in conversation
    const evidenceMenutionedInConversation = gameState.evidence?.filter((e: any) => {
      const emojiMentioned = conversationText.includes(e.emoji) || currentQuestionLower.includes(e.emoji);
      const nameMentioned = conversationText.includes(e.name.toLowerCase()) || currentQuestionLower.includes(e.name.toLowerCase());
      const descriptionTerms = e.description.toLowerCase().split(' ').filter((word: string) => word.length > 4);
      const descriptionMentioned = descriptionTerms.some((term: string) => 
        conversationText.includes(term) || currentQuestionLower.includes(term)
      );
      return emojiMentioned || nameMentioned || descriptionMentioned;
    }) || [];

    // Count how many times evidence has been brought up against them
    const evidencePressureCount = evidenceMenutionedInConversation.length;
    const isKillerUnderPressure = suspect.isKiller && evidencePressureCount >= 2;
    const hasSecretEvidence = evidencePressureCount >= 1;

    // Build evidence context with emphasis on what's being asked about
    const evidenceContext = gameState.evidence?.length > 0
      ? gameState.evidence.map((e: any) => {
          const hasBeenMentioned = evidenceMenutionedInConversation.some((mentioned: any) => mentioned.id === e.id);
          return `${e.emoji} ${e.name}: ${e.description}${hasBeenMentioned ? ' [PREVIOUSLY DISCUSSED]' : ''}`;
        }).join('\n')
      : 'No evidence discovered yet.';

    // Build inspection history
    const inspectionHistory = gameState.inspectLog?.length > 0
      ? gameState.inspectLog.map((log: any) => log.text).join('\n')
      : 'No inspections conducted.';

    // Build timeline context
    const timelineContext = suspect.timeline && Array.isArray(suspect.timeline) 
      ? (suspect.timeline as any[]).map((event: any) => 
          `${event.time}: ${event.action} at ${event.location}${event.witnesses?.length > 0 ? ` (witnessed by: ${event.witnesses.join(', ')})` : ''}`
        ).join('\n')
      : 'No timeline available';

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

CUMULATIVE PRESSURE:
- Evidence pieces mentioned against you so far: ${evidencePressureCount}
- Evidence discussed: ${evidenceMenutionedInConversation.map((e: any) => e.emoji).join(', ') || 'None'}
${suspect.isKiller ? `- Murder confession threshold: ${isKillerUnderPressure ? 'REACHED - The weight of evidence is overwhelming' : `Not yet (${evidencePressureCount}/2 pieces)`}` : ''}
${hasSecretEvidence ? '- Secret-related evidence has been brought up' : ''}

The player asks: "${question}"

STRICT RULES:
1. Stay completely in character as ${suspect.name}
2. Use only dialogue - no actions, mannerisms, or descriptions. DO NOT REPLY  IN *ASTERISKS*
3. Maximum 25 words, in 1-3 COMPLETE sentences
4. Be consistent with all evidence, inspections, and previous statements
5. Don't contradict established facts or your previous answers
6. Don't repeat previous statements word-for-word. Prioritize unique statements over repitition. 
7. Reference evidence/inspections naturally if relevant
8. Protect your secrets unless directly confronted with proof
9. If innocent, you genuinely don't know who did it
10. NEVER contradict your timeline events
11. Reference specific times from your timeline when asked about whereabouts

CONFESSION GUIDELINES:
12. If the player directly confronts you with specific evidence that clearly proves your secret, you should nervously confess to that secret
13. ${suspect.isKiller ? `If confronted with multiple pieces of evidence that clearly prove you killed ${activeCase.victim}, break down and confess to the murder` : 'Never confess to the murder - you didn\'t do it'}
14. Look for questions that reference specific evidence by name, emoji, or description
15. Confessions should feel natural and emotional - show the pressure getting to you
16. Once you've confessed to something, be more honest about that specific topic going forward
17. Before confessing, show increasing nervousness if evidence is mounting against you
18. CUMULATIVE PRESSURE: Consider ALL evidence brought up across the entire conversation, not just the current question
19. ${suspect.isKiller ? 'As more evidence accumulates against you (2+ pieces), your composure should gradually break down' : 'Show anxiety when evidence relates to your secret, but maintain innocence about the murder'}

EVIDENCE AWARENESS:
When the player mentions evidence (by emoji, name, or description), consider:
- Does this evidence directly implicate you in your secret or the murder?
- Are they connecting multiple pieces of evidence against you?
- Is the pressure of their questioning with proof becoming unbearable?
- Would a real person crack under this specific line of questioning?
- How many different pieces of evidence have they confronted you with so far?

CUMULATIVE CONFESSION TRIGGERS:
- Each new piece of evidence adds to the pressure from previous questions
- You remember what evidence has already been discussed
- ${suspect.isKiller ? 'After 2+ different evidence pieces have been raised against you, strongly consider confessing' : 'If evidence proving your secret has been raised, consider confessing to the secret (but never the murder)'}
- Show gradual breakdown: confident → defensive → nervous → desperate → confession

Examples of confession triggers:
- Being shown evidence that directly contradicts your alibi
- Multiple pieces of evidence that create an undeniable pattern
- Evidence that only you could have left behind
- Being caught in a clear lie with proof

Remember: Confessions should feel earned through clever questioning and evidence, not given away easily.

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