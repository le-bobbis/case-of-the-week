// src/app/api/solve-simple/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { suspectId, caseId } = await request.json();

    if (!caseId || !suspectId) {
      return NextResponse.json({ 
        feedback: 'Please select a suspect.',
        isCorrect: false,
        suspectName: null
      }, { status: 400 });
    }

    // Get the case and solution
    const activeCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        solution: true,
        suspects: true
      }
    });

    if (!activeCase || !activeCase.solution) {
      return NextResponse.json({ 
        feedback: 'Case information not available.',
        isCorrect: false,
        suspectName: null
      }, { status: 500 });
    }

    // Find the selected suspect
    const selectedSuspect = activeCase.suspects.find(s => {
      // Match by the suspect's ID (lowercase first name)
      const suspectKey = s.name.toLowerCase().split(' ')[0];
      return suspectKey === suspectId;
    });

    if (!selectedSuspect) {
      return NextResponse.json({ 
        feedback: 'Invalid suspect selection.',
        isCorrect: false,
        suspectName: null
      }, { status: 400 });
    }

    // Check if the solution is correct
    const isCorrect = selectedSuspect.isKiller;

    let feedback;
    if (isCorrect) {
      feedback = `Excellent work, detective! ${selectedSuspect.name} was indeed the killer. ${activeCase.solution.killerMotives} The evidence pointed clearly to their guilt.`;
    } else {
      // Provide a hint without revealing the answer
      const hints = [
        `${selectedSuspect.name} had an alibi that checks out. Consider reviewing the timeline of events more carefully.`,
        `While ${selectedSuspect.name} had secrets, they weren't the killer. Look for someone with a stronger motive for murder.`,
        `The evidence doesn't support ${selectedSuspect.name} as the killer. Who had both means and opportunity?`,
        `${selectedSuspect.name} is innocent. Review the evidence again - who left physical traces at the scene?`,
        `You accused ${selectedSuspect.name}, but they're not the killer. Think about who had the most to lose if Marcus revealed their secret.`,
        `${selectedSuspect.name} couldn't have done it. Check the timeline - who was seen near the crime scene at the critical moment?`
      ];
      
      feedback = hints[Math.floor(Math.random() * hints.length)];
    }

    return NextResponse.json({
      feedback,
      isCorrect,
      suspectName: selectedSuspect.name
    });

  } catch (error) {
    console.error('Solve API error:', error);
    return NextResponse.json({ 
      feedback: 'There was an error processing your accusation. Please try again.',
      isCorrect: false,
      suspectName: null
    }, { status: 500 });
  }
}