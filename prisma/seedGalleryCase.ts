import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGalleryCase() {
  console.log('Seeding Gallery Opening case...');

  // First, set all existing cases to inactive
  await prisma.case.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  // Create the Gallery Opening case
  const galleryCase = await prisma.case.create({
    data: {
      title: 'The Gallery Opening',
      description: 'During the exclusive opening night of the prestigious Whitmore Gallery\'s new modern art exhibition, renowned art critic Beatrice Ashford (52) was found dead in the sculpture garden at 9:45 PM, strangled with a silk scarf. The champagne reception had been in full swing when she excused herself for "fresh air" at 9:15 PM. Security footage shows all five remaining guests had opportunities to follow her outside during the critical 30-minute window. The killer is among the elite attendees, each with their own dark connection to the victim\'s scathing reviews.',
      setting: 'in the sculpture garden at Whitmore Gallery',
      victim: 'Beatrice Ashford',
      murderWeapon: 'silk scarf',
      murderTime: '9:45 PM',
      isActive: true
    }
  });

  console.log('Created case:', galleryCase.title);

  // Create suspects
  const suspects = [
    {
      caseId: galleryCase.id,
      name: 'Jasper Whitmore',
      emoji: '🎨',
      title: 'Gallery Owner',
      bio: 'Gallery Owner (Age 45). Charming proprietor of the prestigious Whitmore Gallery, hosting tonight\'s exhibition. Jasper appears sophisticated and welcoming, but there\'s tension in his smile when discussing certain pieces. He\'s been nervously checking his phone throughout the evening.',
      personality: 'Charming and sophisticated but increasingly nervous as the night progresses. Speaks with cultured refinement.',
      background: 'Built the gallery from nothing over 20 years. Known for discovering emerging artists. Recently expanded into modern art despite criticism.',
      secrets: 'Has been selling forgeries of famous works to private collectors. Beatrice discovered this and was planning to expose him in tomorrow\'s review.',
      alibi: 'Claims he was in his office making calls to collectors about sales from tonight.',
      isKiller: true,
      timeline: [
        {
          time: "8:30 PM",
          action: "Gave opening speech welcoming guests",
          location: "Main gallery",
          observable: true,
          witnesses: ["All attendees"]
        },
        {
          time: "9:00 PM",
          action: "Nervously pulled Beatrice aside for private chat",
          location: "Office hallway",
          observable: true,
          witnesses: ["Marina Chen", "Dr. Amelia Sterling"]
        },
        {
          time: "9:15 PM",
          action: "Saw Beatrice go outside, followed after a moment",
          location: "Gallery back entrance",
          observable: true,
          witnesses: ["Leo Winters (taking photos nearby)"]
        },
        {
          time: "9:25 PM",
          action: "Confronted and strangled Beatrice in sculpture garden",
          location: "Sculpture garden",
          observable: false
        },
        {
          time: "9:40 PM",
          action: "Returned through office entrance, claiming calls",
          location: "Private office",
          observable: true,
          witnesses: ["Dr. Amelia Sterling (saw him return)"]
        }
      ]
    },
    {
      caseId: galleryCase.id,
      name: 'Marina Chen',
      emoji: '🖼️',
      title: 'Featured Artist',
      bio: 'Featured Artist (Age 31). Rising star whose controversial installations are the centerpiece of tonight\'s exhibition. Marina seems confident but keeps glancing anxiously at the review section of the gallery. She\'s been drinking more than usual tonight.',
      personality: 'Outwardly confident but clearly anxious about reviews. Can be defensive about her work.',
      background: 'Young artist whose provocative work has divided critics. Tonight\'s show could make or break her career. Beatrice previously wrote a devastating review of her debut.',
      secrets: 'Plagiarized concepts from an unknown Eastern European artist. Only Beatrice knew the original source.',
      alibi: 'Says she was in the installation room adjusting her pieces and talking to potential buyers.',
      isKiller: false
    },
    {
      caseId: galleryCase.id,
      name: 'Victor Rothschild',
      emoji: '💰',
      title: 'Art Collector',
      bio: 'Art Collector (Age 58). Wealthy patron known for his extensive private collection and influence in the art world. Victor carries himself with old-money elegance but seems unusually agitated tonight, especially when Beatrice\'s name is mentioned.',
      personality: 'Aristocratic and reserved, but showing signs of agitation. Speaks with authority about art and money.',
      background: 'Inherited fortune and art collection from his family. Has been quietly selling pieces due to financial troubles. Major patron of the gallery.',
      secrets: 'Has been selling his family\'s collection to cover massive gambling debts. Beatrice was investigating the suspicious sales.',
      alibi: 'Claims he was in the main gallery examining the paintings and discussing purchases with other collectors.',
      isKiller: false
    },
    {
      caseId: galleryCase.id,
      name: 'Dr. Amelia Sterling',
      emoji: '📚',
      title: 'Art History Professor',
      bio: 'Art History Professor (Age 48). Respected academic who literally wrote the book on contemporary art criticism. Amelia maintains her professional composure but there\'s ice in her voice whenever she mentions Beatrice\'s "popular" reviews.',
      personality: 'Intellectual and composed, but barely concealed disdain for Beatrice. Speaks in academic terms.',
      background: 'Published professor at prestigious university. Her academic book was overshadowed by Beatrice\'s popular art guide. Long-standing professional rivalry.',
      secrets: 'Has been having an affair with Jasper and helped authenticate some of his forgeries. Beatrice recently discovered this.',
      alibi: 'Says she was in the library alcove reading the exhibition catalog and making notes.',
      isKiller: false
    },
    {
      caseId: galleryCase.id,
      name: 'Leo Winters',
      emoji: '📸',
      title: 'Art Photographer',
      bio: 'Art Photographer (Age 28). Up-and-coming photographer specializing in documenting gallery openings and art events. Leo seems eager and professional but becomes visibly uncomfortable when asked about his past work with Beatrice.',
      personality: 'Eager and professional but nervous around authority. Becomes defensive about his past.',
      background: 'Young photographer trying to establish himself in the art world. Previously worked as Beatrice\'s assistant before a bitter falling out.',
      secrets: 'Beatrice destroyed his first exhibition with a cruel review after he refused her romantic advances. Has been planning revenge.',
      alibi: 'Claims he was taking photos throughout the gallery and has timestamps to prove it.',
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
      caseId: galleryCase.id,
      killer: 'Jasper Whitmore',
      killerMotives: 'Jasper was running a sophisticated forgery operation, selling fake masterpieces to private collectors while displaying the "originals" in his gallery. Beatrice discovered this through her extensive connections and was planning to publish an exposé in tomorrow\'s review that would have destroyed his gallery, reputation, and landed him in prison. He couldn\'t let twenty years of building his empire crumble.',
      murderMethod: 'Jasper followed Beatrice to the sculpture garden after she mentioned wanting "fresh air." He strangled her with his own silk scarf (a nervous habit of his to always carry one), then left it to make it look like a crime of passion rather than calculated murder.',
      keyEvidence: 'Jasper\'s silk scarf with his cologne, security footage showing him leaving his office at 9:20 PM (contradicting his alibi), fake authentication documents in his office safe, Beatrice\'s draft review on her phone exposing the forgery ring.',
      timeline: '9:00 PM - Reception in full swing. 9:15 PM - Beatrice steps out for air. 9:20 PM - Jasper seen leaving office. 9:25 PM - Marina in installation room (verified). 9:30 PM - Victor in main gallery (witnessed). 9:45 PM - Body discovered by Leo.'
    }
  });

  console.log('Created solution for killer:', solution.killer);
  console.log('Gallery Opening case seeded successfully!');
}

// Run the seed function
seedGalleryCase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });