// src/app/api/cases/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });

    return NextResponse.json(cases);

  } catch (error) {
    console.error('Failed to fetch cases:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch cases' 
    }, { status: 500 });
  }
}