import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        setting: true,
        victim: true,
        murderWeapon: true,
        murderTime: true
      }
    });

    if (!activeCase) {
      return NextResponse.json({ error: 'No active case found' }, { status: 404 });
    }

    return NextResponse.json(activeCase);

  } catch (error) {
    console.error('Failed to fetch current case:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch current case' 
    }, { status: 500 });
  }
}