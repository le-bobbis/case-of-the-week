import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🌱 Seeding Vineyard Reunion case...');

    // First, deactivate any existing active cases
    await prisma.case.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create the main case
    const vineyardCase = await prisma.case.create({
      data: {
        title: "The Vineyard Reunion",
        description: "During a 20-year college reunion at the exclusive Rosewood Vineyard estate, successful venture capitalist Marcus Thornfield (47) was found dead in the wine cellar at 11:30 PM, struck in the head with a vintage wine bottle.",
        setting: "Rosewood Vineyard estate during a 20-year college reunion",
        victim: "Marcus Thornfield",
        murderWeapon: "vintage wine bottle",
        murderTime: "11:30 PM",
        isActive: true
      }
    });

    // Create the solution
    const solution = await prisma.solution.create({
      data: {
        caseId: vineyardCase.id,
        killer: "Elena Vasquez",
        killerMotives: "Marcus was blackmailing Elena about embezzling funds from the college theater program 20 years ago. Elena needed to silence Marcus before her Broadway debut could be ruined.",
        murderMethod: "Struck Marcus with a vintage wine bottle in the wine cellar",
        keyEvidence: "Wine bottle with Elena's fingerprints, torn fabric from Elena's scarf, security footage showing Elena at cellar at 10:45 PM",
        timeline: "10:00 PM - Dinner ends, guests mingle. 10:45 PM - Elena seen entering wine cellar area. 11:30 PM - Body discovered by Dr. Rebecca Torres."
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Vineyard Reunion case seeded successfully!',
      caseId: vineyardCase.id,
      solutionId: solution.id
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Seeding failed' 
    }, { status: 500 });
  }
}