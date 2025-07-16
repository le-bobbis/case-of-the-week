import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Evidence } from '@/types/game';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { solution, gameState, caseId } = await request.json();

    if (!caseId) {
      return NextResponse.json({ 
        evaluation: 'Case information not available.',
        isCorrect: false,
        correctAnswer: null
      }, { status: 400 });
    }

    // Get the specific case and its solution
    const activeCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        solution: true
      }
    });

    if (!activeCase || !activeCase.solution) {
      return NextResponse.json({ 
        evaluation: 'Case information not available.',
        isCorrect: false,
        correctAnswer: null
      }, { status: 500 });
    }

    const evidenceContext = gameState.evidence?.length > 0 
      ? `Evidence discovered: ${gameState.evidence.map((e: { description: string }) => e.description).join(', ')}`
      : 'Limited evidence was discovered.';

    const prompt = `You are the game master for "${activeCase.title}" murder mystery.

CORRECT SOLUTION:
Killer: ${activeCase.solution.killer}
Motive: ${activeCase.solution.killerMotives}
Method: ${activeCase.solution.murderMethod}
Key Evidence: ${activeCase.solution.keyEvidence}

PLAYER'S SOLUTION:
"${solution}"

GAME CONTEXT:
- Actions used: ${20 - gameState.actionsRemaining}/20
- ${evidenceContext}

EVALUATION CRITERIA:
1. Did they correctly identify ${activeCase.solution.killer} as the killer?
2. Do they understand the motive?
3. How well did they use the evidence?

INSTRUCTIONS:
- If they got the killer correct: Congratulate them and explain the full solution
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
    
    // Check if solution is correct (case-insensitive check for killer name)
    const killerFirstName = activeCase.solution.killer.split(' ')[0].toLowerCase();
    const isCorrect = solution.toLowerCase().includes(killerFirstName);
    
    let correctAnswer = null;
    if (isCorrect) {
      correctAnswer = `${activeCase.solution.killer} committed the murder. ${activeCase.solution.killerMotives} ${activeCase.solution.murderMethod}`;
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