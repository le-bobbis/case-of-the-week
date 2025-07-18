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

  // Create suspects with timelines
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
      isKiller: true,
      timeline: [
        {
          time: "9:30 PM",
          action: "Gave toast at dinner about college memories",
          location: "Main dining room",
          observable: true,
          witnesses: ["All attendees"]
        },
        {
          time: "10:00 PM",
          action: "Left dining room claiming to get production notes from car",
          location: "Main entrance",
          observable: true,
          witnesses: ["Sarah Mitchell", "Rebecca Chen"]
        },
        {
          time: "10:20 PM",
          action: "Secretly met Marcus in the garden",
          location: "Rose garden",
          observable: false
        },
        {
          time: "10:45 PM",
          action: "Entered wine cellar through side entrance",
          location: "Wine cellar",
          observable: true,
          witnesses: ["David Park (glimpsed from window)"]
        },
        {
          time: "11:15 PM",
          action: "Returned to main house, claimed to have been making calls",
          location: "Main lounge",
          observable: true,
          witnesses: ["Victor Rothwell"]
        }
      ]
    },
    {
      caseId: vineyardCase.id,
      name: 'Sarah Mitchell',
      emoji: '⚖️',
      title: 'Corporate Lawyer',
      bio: 'Corporate Lawyer (Age 46). Partner at prestigious law firm specializing in corporate acquisitions. Sarah dated Marcus briefly in college but they parted on bad terms. She\'s been avoiding him all evening and drinking more than usual.',
      personality: 'Usually composed but clearly on edge tonight. Deflects personal questions.',
      background: 'Dated Marcus in college, messy breakup. Now a successful corporate lawyer handling major mergers.',
      secrets: 'Had a secret affair with Marcus recently while married. He threatened to tell her husband.',
      alibi: 'Says she was in the library making work calls.',
      isKiller: false,
      timeline: [
        {
          time: "9:45 PM",
          action: "Excused herself during dessert, visibly upset",
          location: "Main dining room",
          observable: true,
          witnesses: ["All attendees"]
        },
        {
          time: "10:00 PM",
          action: "Went to library to make work calls",
          location: "Library",
          observable: true,
          witnesses: ["Rebecca Chen (saw her enter)"]
        },
        {
          time: "10:30 PM",
          action: "Had emotional phone call with husband",
          location: "Library",
          observable: false
        },
        {
          time: "11:00 PM",
          action: "Found crying in the powder room",
          location: "First floor powder room",
          observable: true,
          witnesses: ["Rebecca Chen"]
        },
        {
          time: "11:20 PM",
          action: "Returned to main group, makeup smudged",
          location: "Main lounge",
          observable: true,
          witnesses: ["Elena Vasquez", "Victor Rothwell"]
        }
      ]
    },
    {
      caseId: vineyardCase.id,
      name: 'David Park',
      emoji: '💻',
      title: 'Tech Entrepreneur',
      bio: 'Tech Entrepreneur (Age 45). Founded a successful AI startup that Marcus\'s firm funded. David has been nervously checking his phone all evening and seems jumpy whenever Marcus speaks to him. His company recently hit financial troubles.',
      personality: 'Anxious and distracted. Keeps checking phone obsessively.',
      background: 'College roommate of Marcus. Built AI startup with Marcus\'s venture funding. Company struggling financially.',
      secrets: 'Has been embezzling investor funds to cover gambling debts. Marcus recently discovered this.',
      alibi: 'Claims he was on the terrace taking a conference call.',
      isKiller: false,
      timeline: [
        {
          time: "9:00 PM",
          action: "Arrived late to dinner, apologizing profusely",
          location: "Main dining room",
          observable: true,
          witnesses: ["All attendees"]
        },
        {
          time: "10:15 PM",
          action: "Stepped out to terrace for 'urgent call'",
          location: "East terrace",
          observable: true,
          witnesses: ["Victor Rothwell"]
        },
        {
          time: "10:45 PM",
          action: "Saw figure entering wine cellar from terrace",
          location: "East terrace",
          observable: false
        },
        {
          time: "11:00 PM",
          action: "Returned inside, claimed call ran long",
          location: "Main lounge",
          observable: true,
          witnesses: ["Sarah Mitchell", "Victor Rothwell"]
        },
        {
          time: "11:25 PM",
          action: "Suggested checking on Marcus",
          location: "Main lounge",
          observable: true,
          witnesses: ["All present"]
        }
      ]
    },
    {
      caseId: vineyardCase.id,
      name: 'Rebecca Chen',
      emoji: '📸',
      title: 'Journalist',
      bio: 'Investigative Journalist (Age 44). Award-winning reporter who covered Silicon Valley scandals. Rebecca has been asking probing questions all evening, making others uncomfortable. She keeps taking notes on her phone.',
      personality: 'Inquisitive and persistent. Always observing and documenting.',
      background: 'College newspaper editor with Marcus. Now investigates corporate corruption. Working on a big story.',
      secrets: 'Is investigating Marcus\'s firm for insider trading. He found out and threatened to ruin her career.',
      alibi: 'Was interviewing other guests for a reunion article.',
      isKiller: false,
      timeline: [
        {
          time: "9:00 PM",
          action: "Taking photos and notes during dinner",
          location: "Main dining room",
          observable: true,
          witnesses: ["All attendees"]
        },
        {
          time: "10:00 PM",
          action: "Saw Elena leaving, followed briefly",
          location: "Main entrance to parking area",
          observable: true,
          witnesses: ["Sarah Mitchell"]
        },
        {
          time: "10:30 PM",
          action: "Found Sarah crying in powder room",
          location: "First floor powder room",
          observable: true,
          witnesses: ["Sarah Mitchell"]
        },
        {
          time: "11:00 PM",
          action: "Interviewing Victor about his art collection",
          location: "Portrait gallery",
          observable: true,
          witnesses: ["Victor Rothwell"]
        },
        {
          time: "11:30 PM",
          action: "Discovered Marcus's body while looking for him",
          location: "Wine cellar",
          observable: true,
          witnesses: ["First on scene"]
        }
      ]
    },
    {
      caseId: vineyardCase.id,
      name: 'Victor Rothwell',
      emoji: '🎨',
      title: 'Art Dealer',
      bio: 'Art Dealer (Age 48). Owns a chain of high-end galleries and was Marcus\'s client. Victor seems pleasant but there\'s tension when he and Marcus interact. He\'s been admiring the estate\'s art collection all evening.',
      personality: 'Cultured and articulate but subtly condescending. Name-drops frequently.',
      background: 'Wasn\'t in their college circle but knows Marcus through business. Major art dealer with galleries in three cities.',
      secrets: 'Sold Marcus a forged painting for millions. Marcus recently discovered this and demanded his money back.',
      alibi: 'Was examining paintings in the portrait gallery.',
      isKiller: false,
      timeline: [
        {
          time: "9:15 PM",
          action: "Complimented wine selection, discussing vintages",
          location: "Main dining room",
          observable: true,
          witnesses: ["All attendees"]
        },
        {
          time: "10:00 PM",
          action: "Toured portrait gallery alone",
          location: "Portrait gallery",
          observable: true,
          witnesses: ["David Park (saw him enter)"]
        },
        {
          time: "10:30 PM",
          action: "Had tense phone conversation about authentication",
          location: "Portrait gallery",
          observable: false
        },
        {
          time: "11:00 PM",
          action: "Rebecca Chen found him for interview",
          location: "Portrait gallery",
          observable: true,
          witnesses: ["Rebecca Chen"]
        },
        {
          time: "11:15 PM",
          action: "Returned to lounge, noticed Elena had returned",
          location: "Main lounge",
          observable: true,
          witnesses: ["Elena Vasquez", "Sarah Mitchell"]
        }
      ]
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