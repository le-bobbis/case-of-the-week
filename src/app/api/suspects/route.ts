// src/app/api/suspects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get caseId from query params
    const searchParams = request.nextUrl.searchParams;
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        suspects: {
          select: {
            id: true,
            name: true,
            emoji: true,
            title: true,
            bio: true,
            timeline: true
          }
        }
      }
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Transform suspects to match frontend format
    const suspectsData = caseData.suspects.reduce((acc, suspect) => {
      // Create a lowercase key for the suspect (used in frontend)
      const key = suspect.name.toLowerCase().split(' ')[0];
      acc[key] = {
        id: key,
        name: suspect.name,
        emoji: suspect.emoji,
        title: suspect.title,
        bio: suspect.bio,
        timeline: suspect.timeline,
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