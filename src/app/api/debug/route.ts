import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        solution: true
      }
    });

    return NextResponse.json({
      hasActiveCase: !!activeCase,
      caseDetails: activeCase ? {
        id: activeCase.id,
        title: activeCase.title,
        victim: activeCase.victim,
        murderWeapon: activeCase.murderWeapon,
        hasSolution: !!activeCase.solution
      } : null,
      solution: activeCase?.solution || null
    });

  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
}