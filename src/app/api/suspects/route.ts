import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        suspects: {
          select: {
            id: true,
            name: true,
            emoji: true,
            title: true,
            bio: true,
            timeline: true  // Add timeline to the selection
          }
        }
      }
    });

    if (!activeCase) {
      return NextResponse.json({ error: 'No active case found' }, { status: 404 });
    }

    // Transform suspects to match frontend format
    const suspectsData = activeCase.suspects.reduce((acc, suspect) => {
      // Create a lowercase key for the suspect (used in frontend)
      const key = suspect.name.toLowerCase().split(' ')[0];
      acc[key] = {
        id: key,
        name: suspect.name,
        emoji: suspect.emoji,
        title: suspect.title,
        bio: suspect.bio,
        timeline: suspect.timeline, // Include timeline data
        chatLog: []
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(suspectsData);

  } catch (error) {
    console.error('Failed to fetch suspects:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch suspects' 
    }, { status: 500 });
  }
}