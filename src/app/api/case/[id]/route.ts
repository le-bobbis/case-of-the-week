// src/app/api/case/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params in Next.js 15
    const { id } = await params;
    
    const caseData = await prisma.case.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        setting: true,
        victim: true,
        murderWeapon: true,
        murderTime: true,
        createdAt: true
      }
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Get previous and next case IDs for navigation
    const allCases = await prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    });

    const currentIndex = allCases.findIndex(c => c.id === id);
    const prevCaseId = currentIndex < allCases.length - 1 ? allCases[currentIndex + 1].id : null;
    const nextCaseId = currentIndex > 0 ? allCases[currentIndex - 1].id : null;

    return NextResponse.json({
      ...caseData,
      navigation: {
        prevCaseId,
        nextCaseId,
        currentIndex: currentIndex + 1,
        totalCases: allCases.length
      }
    });

  } catch (error) {
    console.error('Failed to fetch case:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch case' 
    }, { status: 500 });
  }
}