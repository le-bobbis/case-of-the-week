import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Character personalities and backgrounds
const characterProfiles = {
  elena: {
    name: "Elena Vasquez",
    role: "Theater Director",
    personality: "Confident and charismatic but has been unusually quiet tonight. Speaks with dramatic flair.",
    background: "Close friends with Marcus in college, both involved in dramatic arts. Now a successful off-Broadway director recently chosen for a major Broadway production.",
    secrets: "Was treasurer of the college theater program and embezzled funds. Marcus discovered this and has been blackmailing her.",
    alibi: "Claims she was working on production notes most of the evening."
  },
  david: {
    name: "David Chen", 
    role: "Software Engineer",
    personality: "Quiet, analytical type who keeps detailed mental notes. Genuinely shocked by the death.",
    background: "Marcus's college roommate and closest friend. Senior engineer at a major tech company.",
    secrets: "None - he's genuinely innocent and devastated.",
    alibi: "Was debugging code on his laptop during the party, saw Elena near the wine cellar at 10:45 PM."
  },
  sarah: {
    name: "Sarah Mitchell",
    role: "Corporate Lawyer", 
    personality: "Sharp tongue, competitive nature. Has been drinking heavily tonight.",
    background: "High-powered attorney. Had a complicated romantic history with Marcus in college.",
    secrets: "Still harbors feelings for Marcus but he rejected her advances earlier tonight.",
    alibi: "Was talking with James in the garden from 10:30-11:30 PM."
  },
  james: {
    name: "Professor James Wright",
    role: "English Literature Professor",
    personality: "Nervous, keeps checking his watch. Feels responsible as the organizer.",
    background: "Academic who never left the college town. Organized this reunion. Was Marcus's academic rival.",
    secrets: "Jealous of Marcus's financial success but not murderous.",
    alibi: "Was giving tours of the wine facilities and can verify Sarah's whereabouts."
  },
  rebecca: {
    name: "Dr. Rebecca Torres",
    role: "Emergency Room Physician",
    personality: "Professional, clinical. The group's unofficial therapist who helps others with problems.",
    background: "Trauma surgeon who works intense hours. Discovered the body and called 911.",
    secrets: "Has been struggling with debt from her medical practice.",
    alibi: "Was helping other guests with minor issues, discovered the body at 11:30 PM."
  }
};

export async function POST(request: NextRequest) {
  try {
    const { suspectId, question, gameState } = await request.json();
    
    console.log('💬 CHAT REQUEST:');
    console.log('- Suspect:', suspectId);
    console.log('- Question:', question);
    
    const character = characterProfiles[suspectId as keyof typeof characterProfiles];
    if (!character) {
      return NextResponse.json({ error: 'Invalid suspect' }, { status: 400 });
    }

    // Build conversation history for context
    const conversationHistory = gameState.evidence?.length > 0 
      ? `Evidence discovered so far: ${gameState.evidence.map((e: { description: string }) => e.description).join(', ')}`
      : 'No evidence has been discovered yet.';

    const prompt = `You are ${character.name}, a ${character.role} at a college reunion murder mystery.

CHARACTER PROFILE:
- Personality: ${character.personality}
- Background: ${character.background}
- Secret: ${character.secrets}
- Your alibi: ${character.alibi}

MURDER CONTEXT:
Marcus Thornfield was found dead in the wine cellar at 11:30 PM, struck with a vintage wine bottle. This happened during a 20-year college reunion at Rosewood Vineyard estate.

CURRENT SITUATION:
${conversationHistory}
Actions remaining: ${gameState.actionsRemaining}/20

The player just asked you: "${question}"

INSTRUCTIONS:
- Stay completely in character as ${character.name}
- Respond with ONLY direct speech - no actions, no *descriptions*, no narration
- Don't immediately reveal your secrets unless directly confronted with evidence
- Be helpful but also protective of yourself
- Keep responses to EXACTLY 1-3 sentences maximum
- Show emotions through your words, not actions
- If asked about evidence, respond based on what your character would realistically know
- Be concise and direct
- NO asterisks, NO action descriptions, NO stage directions - just speak as the character
- MENTION SPECIFIC OBJECTS when reasonable (wine, bottles, phones, keys, etc.)

Example of what NOT to do: "*nervously fidgets* I don't know anything about that."
Example of what TO do: "I don't know anything about that."

Respond as ${character.name} with direct speech only:`;

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
          existingEvidence: gameState.evidence || [],
          conversationHistory: conversationHistoryForEvidence
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