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

  // Create suspects
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
    {
      caseId: vineyardCase.id,
      name: 'David Chen',
      emoji: '💻',
      title: 'Software Engineer',
      bio: 'Software Engineer (Age 46). Senior engineer at a major tech company. The quiet, analytical type who keeps detailed mental notes about everything. David was Marcus\'s college roommate and closest friend. He seems genuinely shocked by the death.',
      personality: 'Quiet, analytical type who keeps detailed mental notes. Genuinely shocked by the death.',
      background: 'Marcus\'s college roommate and closest friend. Senior engineer at a major tech company.',
      secrets: 'None - he\'s genuinely innocent and devastated.',
      alibi: 'Was debugging code on his laptop during the party, saw Elena near the wine cellar at 10:45 PM.',
      isKiller: false
    },
    {
      caseId: vineyardCase.id,
      name: 'Sarah Mitchell',
      emoji: '⚖️',
      title: 'Corporate Lawyer',
      bio: 'Corporate Lawyer (Age 47). High-powered attorney at a prestigious firm. Known for her sharp tongue and competitive nature. She and Marcus had a complicated romantic history in college. She\'s been drinking heavily tonight.',
      personality: 'Sharp tongue, competitive nature. Has been drinking heavily tonight.',
      background: 'High-powered attorney. Had a complicated romantic history with Marcus in college.',
      secrets: 'Still harbors feelings for Marcus but he rejected her advances earlier tonight.',
      alibi: 'Was talking with James in the garden from 10:30-11:30 PM.',
      isKiller: false
    },
    {
      caseId: vineyardCase.id,
      name: 'James Wright',
      emoji: '📚',
      title: 'English Literature Professor',
      bio: 'English Literature Professor (Age 48). Academic who never left the college town. Organized this reunion and chose the venue. He appears nervous and keeps checking his watch. Was Marcus\'s academic rival in college.',
      personality: 'Nervous, keeps checking his watch. Feels responsible as the organizer.',
      background: 'Academic who never left the college town. Organized this reunion. Was Marcus\'s academic rival.',
      secrets: 'Jealous of Marcus\'s financial success but not murderous.',
      alibi: 'Was giving tours of the wine facilities and can verify Sarah\'s whereabouts.',
      isKiller: false
    },
    {
      caseId: vineyardCase.id,
      name: 'Rebecca Torres',
      emoji: '🏥',
      title: 'Emergency Room Physician',
      bio: 'Emergency Room Physician (Age 46). Trauma surgeon who works intense hours. She\'s been the group\'s unofficial therapist, always helping others with their problems. She discovered the body and immediately called 911.',
      personality: 'Professional, clinical. The group\'s unofficial therapist who helps others with problems.',
      background: 'Trauma surgeon who works intense hours. Discovered the body and called 911.',
      secrets: 'Has been struggling with debt from her medical practice.',
      alibi: 'Was helping other guests with minor issues, discovered the body at 11:30 PM.',
      isKiller: false
    }
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

  // Create core evidence (guaranteed clues)
  const coreEvidence = [
    {
      caseId: vineyardCase.id,
      name: 'Wine Bottle Fingerprints',
      emoji: '🍷',
      description: 'Murder weapon with Elena\'s fingerprints clearly visible',
      triggerWords: 'wine,bottle,fingerprint,weapon,murder',
      importance: 10
    },
    {
      caseId: vineyardCase.id,
      name: 'Torn Fabric',
      emoji: '👔',
      description: 'Piece of Elena\'s distinctive scarf caught on cellar door',
      triggerWords: 'door,fabric,torn,scarf,clothing',
      importance: 8
    },
    {
      caseId: vineyardCase.id,
      name: 'Financial Records',
      emoji: '💰',
      description: 'Documents showing Elena\'s college fund embezzlement',
      triggerWords: 'money,financial,embezzle,theater,college',
      importance: 9
    },
    {
      caseId: vineyardCase.id,
      name: 'Threatening Messages',
      emoji: '📱',
      description: 'Marcus\'s phone showing blackmail texts from Elena',
      triggerWords: 'phone,message,text,threat,blackmail',
      importance: 9
    },
    {
      caseId: vineyardCase.id,
      name: 'Security Footage',
      emoji: '📷',
      description: 'Camera showing Elena entering cellar at 10:45 PM',
      triggerWords: 'camera,video,security,footage,time',
      importance: 7
    }
  ];

  for (const evidenceData of coreEvidence) {
    const evidence = await prisma.coreEvidence.create({
      data: evidenceData
    });
    console.log('Created core evidence:', evidence.name);
  }

  // Create red herrings (misleading clues)
  const redHerrings = [
    {
      caseId: vineyardCase.id,
      name: 'Lipstick Mark',
      emoji: '💄',
      description: 'Sarah\'s lipstick on Marcus\'s wine glass from earlier conversation',
      triggerWords: 'lipstick,makeup,glass,sarah,romantic',
      suspectTarget: 'Sarah Mitchell'
    },
    {
      caseId: vineyardCase.id,
      name: 'Laptop Activity',
      emoji: '💻',
      description: 'David\'s computer showing he was coding during the murder',
      triggerWords: 'computer,laptop,coding,david,alibi',
      suspectTarget: 'David Chen'
    },
    {
      caseId: vineyardCase.id,
      name: 'Medical Supplies',
      emoji: '🏥',
      description: 'Rebecca\'s medical bag found near the scene',
      triggerWords: 'medical,doctor,supplies,rebecca,hospital',
      suspectTarget: 'Dr. Rebecca Torres'
    }
  ];

  for (const herringData of redHerrings) {
    const herring = await prisma.redHerring.create({
      data: herringData
    });
    console.log('Created red herring:', herring.name);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });