import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create the Vineyard Reunion case
  const vineyardCase = await prisma.case.create({
    data: {
      title: 'The Vineyard Reunion',
      description: 'During a 20-year college reunion at the exclusive Rosewood Vineyard estate, successful venture capitalist Marcus Thornfield (47) was found dead in the wine cellar at 11:30 PM, struck in the head with a vintage wine bottle. The reunion dinner had ended at 10 PM, with guests mingling throughout the estate\'s main house, gardens, and wine facilities until the body was discovered. Security cameras show all five remaining guests had access to the cellar area during the critical timeframe. The killer is among the reunion attendees, each harboring secrets from their shared college years.',
      setting: 'in the wine cellar at Rosewood Vineyard estate',
      victim: 'Marcus Thornfield',
      murderWeapon: 'vintage wine bottle',
      murderTime: '11:30 PM',
      isActive: true
    }
  });

  console.log('Created case:', vineyardCase.title);

  // Create suspects (same as before)
  const suspects = [
    {
      caseId: vineyardCase.id,
      name: 'Elena Vasquez',
      emoji: '🎭',
      title: 'Theater Director',
      bio: 'Theater Director (Age 47). Successful off-Broadway director recently chosen to helm a major Broadway production. Elena and Marcus were close friends in college, both involved in dramatic arts. She appears confident and charismatic but has been unusually quiet tonight.',
      personality: 'Confident and charismatic but has been unusually quiet tonight. Speaks with dramatic flair.',
      background: 'Close friends with Marcus in college, both involved in dramatic arts. Now a successful off-Broadway director recently chosen for a major Broadway production.',
      secrets: 'Was treasurer of the college theater program and embezzled funds. Marcus discovered this and has been blackmailing her.',
      alibi: 'Claims she was working on production notes most of the evening.',
      isKiller: true
    },
    // ... rest of suspects
  ];

  for (const suspectData of suspects) {
    const suspect = await prisma.suspect.create({
      data: suspectData
    });
    console.log('Created suspect:', suspect.name);
  }

  // Create the solution
  const solution = await prisma.solution.create({
    data: {
      caseId: vineyardCase.id,
      killer: 'Elena Vasquez',
      killerMotives: 'Marcus was blackmailing Elena about embezzling funds from the college theater program 20 years ago. Elena needed to silence Marcus before her Broadway debut could be ruined by the scandal.',
      murderMethod: 'Struck Marcus with a vintage wine bottle in the wine cellar during the reunion.',
      keyEvidence: 'Wine bottle with Elena\'s fingerprints, torn fabric from her scarf, financial records showing embezzlement, threatening messages on Marcus\'s phone.',
      timeline: '10:00 PM - Dinner ends, guests mingle. 10:45 PM - Elena seen near wine cellar by David. 11:30 PM - Body discovered by Rebecca.'
    }
  });

  console.log('Created solution for killer:', solution.killer);

  // NO MORE EVIDENCE CREATION - Everything will be dynamically generated!
  console.log('Database seeded successfully! Evidence will be generated dynamically during gameplay.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });