import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Evidence } from '@/types/game'; 

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { solution, gameState } = await request.json();

    const evidenceContext = gameState.evidence?.length > 0 
      ? `Evidence discovered: ${gameState.evidence.map((e: { description: string }) => e.description).join(', ')}`
      : 'Limited evidence was discovered.';

    const prompt = `You are the game master for "The Vineyard Reunion" murder mystery.

CORRECT SOLUTION:
Elena Vasquez killed Marcus Thornfield. She struck him with a wine bottle in the cellar because Marcus was blackmailing her about embezzling funds from the college theater program 20 years ago. Elena needed to silence Marcus before her Broadway debut.

PLAYER'S SOLUTION:
"${solution}"

GAME CONTEXT:
- Actions used: ${20 - gameState.actionsRemaining}/20
- ${evidenceContext}

EVALUATION CRITERIA:
1. Did they correctly identify Elena as the killer?
2. Do they understand the blackmail motive?
3. How well did they use the evidence?

INSTRUCTIONS:
- If they got Elena correct: Congratulate them and explain the full solution
- If they got it wrong: Give constructive feedback without revealing the answer
- Reference specific evidence they found in your evaluation
- Keep response to 3-4 sentences maximum
- Be encouraging even when wrong

Provide your evaluation:`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const evaluation = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Check if solution is correct
    const isCorrect = solution.toLowerCase().includes('elena');
    
    let correctAnswer = null;
    if (isCorrect) {
      correctAnswer = "Elena Vasquez killed Marcus because he was blackmailing her about stealing money from the college theater fund. She used a wine bottle in the cellar to silence him before her Broadway debut could be ruined.";
    }

    return NextResponse.json({
      evaluation,
      isCorrect,
      correctAnswer
    });

  } catch (error) {
    console.error('Solve API error:', error);
    return NextResponse.json({ 
      evaluation: 'There was an error evaluating your solution. Please try again.',
      isCorrect: false,
      correctAnswer: null
    }, { status: 500 });
  }
}