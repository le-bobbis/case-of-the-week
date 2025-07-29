import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPyramidSchemeCase() {
  console.log('Seeding The Pyramid Scheme case...');

  // First, set all existing cases to inactive
  await prisma.case.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  // Create The Pyramid Scheme case
  const pyramidCase = await prisma.case.create({
    data: {
      title: 'The Pyramid Scheme',
      description: 'The monthly EverFresh party at the Kaufman residence takes a deadly turn when chapter president Sadie Kaufman is found dead in her kitchen, her skull crushed by the company\'s flagship product—an EverFresh "No-Break" Goliath storage container. The incident occurred during the evening\'s product demonstration, while eight women were gathered in the living room for Sadie\'s presentation on "Revolutionary Kitchen Solutions." A loud crash from the kitchen at 8:45 PM interrupted her pitch about the Goliath\'s "unbreakable durability," and guests discovered Sadie\'s body moments later. The killer struck during a 10-minute window when guests were distracted by refreshments and socializing.',
      setting: 'in the kitchen of the Kaufman family home during an EverFresh party',
      victim: 'Sadie Kaufman',
      murderWeapon: 'EverFresh "No-Break" Goliath storage container',
      murderTime: '8:45 PM',
      isActive: true
    }
  });

  console.log('Created case:', pyramidCase.title);

  // Create suspects with complete timelines
  const suspects = [
    {
      caseId: pyramidCase.id,
      name: 'Carol Reynolds',
      emoji: '👩‍💼',
      title: 'Ambitious Sales Rep',
      bio: 'EverFresh Sales Representative (Age 42). The region\'s top performer with perfectly styled blonde hair and an aggressive smile. Carol arrived early to help set up, wearing her signature EverFresh blazer covered in achievement pins. She\'s been eyeing Sadie\'s chapter presidency for months and isn\'t shy about her ambitions.',
      personality: 'Cutthroat beneath a bubbly exterior, talks in corporate jargon and motivational speak. Treats every conversation like a sales pitch.',
      background: 'EverFresh\'s top regional performer for three years running. Joined the company after being laid off from pharmaceutical sales. Single, lives for the business.',
      secrets: 'Has been skimming commission from her downline recruits to inflate her own numbers. Sadie discovered this and threatened to report her.',
      alibi: 'Claims she was in the dining room helping arrange the refreshment table and talking to potential recruits.',
      isKiller: true,
      timeline: [
        {
          time: "7:00 PM",
          action: "Arrived early to help set up demonstration table",
          location: "Living room",
          observable: true,
          witnesses: ["Sadie Kaufman", "Yvonne Torres"]
        },
        {
          time: "7:30 PM",
          action: "Greeted arriving guests, handed out business cards",
          location: "Front entrance",
          observable: true,
          witnesses: ["Linda Martinez", "Jessica Kaufman"]
        },
        {
          time: "8:00 PM",
          action: "Participated in Sadie\'s product demonstration",
          location: "Living room",
          observable: true,
          witnesses: ["All party guests"]
        },
        {
          time: "8:30 PM",
          action: "Offered to help with refreshments during break",
          location: "Dining room",
          observable: true,
          witnesses: ["Multiple guests"]
        },
        {
          time: "8:35 PM",
          action: "Slipped into kitchen claiming to get more napkins",
          location: "Kitchen",
          observable: false
        },
        {
          time: "8:45 PM",
          action: "Confronted Sadie about the commission investigation",
          location: "Kitchen",
          observable: false
        },
        {
          time: "8:45 PM",
          action: "Struck Sadie with Goliath container in rage",
          location: "Kitchen",
          observable: false
        },
        {
          time: "8:46 PM",
          action: "Quickly returned to dining room, acting shocked at crash",
          location: "Dining room",
          observable: true,
          witnesses: ["Linda Martinez", "Other guests"]
        }
      ]
    },
    {
      caseId: pyramidCase.id,
      name: 'Linda Martinez',
      emoji: '🏠',
      title: 'Struggling Single Mom',
      bio: 'Single Mother (Age 35). Recent EverFresh recruit who looks exhausted and overwhelmed. Linda joined six months ago hoping to supplement her income as a part-time nurse, but she\'s drowning in unsold inventory that fills her small apartment. She constantly apologizes and seems on the verge of tears.',
      personality: 'Anxious and overwhelmed, apologizes constantly. Speaks quietly and avoids eye contact when discussing her EverFresh "business."',
      background: 'Part-time nurse and single mother of two young children. Joined EverFresh six months ago after Carol\'s aggressive recruitment pitch promised financial freedom.',
      secrets: 'Considering bankruptcy due to EverFresh debt. Her children may have to change schools if she can\'t pay rent. Sadie pressured her into massive orders she couldn\'t afford.',
      alibi: 'Was in the bathroom during the critical time, having an anxiety attack about her financial situation.',
      isKiller: false,
      timeline: [
        {
          time: "7:15 PM",
          action: "Arrived late, apologizing profusely to Sadie",
          location: "Front entrance",
          observable: true,
          witnesses: ["Sadie Kaufman", "Carol Reynolds"]
        },
        {
          time: "7:45 PM",
          action: "Sat quietly during presentation, looking stressed",
          location: "Living room",
          observable: true,
          witnesses: ["All party guests"]
        },
        {
          time: "8:15 PM",
          action: "Declined to participate in product demonstration",
          location: "Living room",
          observable: true,
          witnesses: ["Multiple guests"]
        },
        {
          time: "8:30 PM",
          action: "Excused herself, looking upset about finances",
          location: "Living room",
          observable: true,
          witnesses: ["Jessica Kaufman"]
        },
        {
          time: "8:35 PM",
          action: "Had anxiety attack in bathroom, crying quietly",
          location: "Bathroom",
          observable: false
        },
        {
          time: "8:47 PM",
          action: "Emerged from bathroom to find crowd around kitchen",
          location: "Hallway",
          observable: true,
          witnesses: ["Roger Kaufman"]
        }
      ]
    },
    {
      caseId: pyramidCase.id,
      name: 'Roger Kaufman',
      emoji: '👨‍💼',
      title: 'Fed-Up Husband',
      bio: 'Accountant (Age 50). Sadie\'s husband of 25 years who has grown increasingly resentful of EverFresh consuming their marriage and finances. Roger is a quiet, methodical man who keeps detailed records of their spending. He stays in his home office during parties but tonight seemed more agitated than usual.',
      personality: 'Quiet resentment hidden behind a polite facade. Speaks in measured tones but his jaw tightens when discussing EverFresh.',
      background: 'Married to Sadie for 25 years, works as an accountant for a local firm. Watched their retirement savings disappear into EverFresh inventory over the past three years.',
      secrets: 'Already consulted a divorce lawyer about recovering his money. Has been secretly documenting Sadie\'s EverFresh expenses for the legal proceedings.',
      alibi: 'Was in his home office working on client tax returns, avoiding the party as usual.',
      isKiller: false,
      timeline: [
        {
          time: "7:00 PM",
          action: "Greeted early arrivals politely then retreated",
          location: "Front entrance",
          observable: true,
          witnesses: ["Carol Reynolds", "Yvonne Torres"]
        },
        {
          time: "7:30 PM",
          action: "Closed office door to block out party noise",
          location: "Home office",
          observable: true,
          witnesses: ["Jessica Kaufman (saw him close door)"]
        },
        {
          time: "8:00 PM",
          action: "Worked on tax returns, door closed",
          location: "Home office",
          observable: false
        },
        {
          time: "8:30 PM",
          action: "Reviewed divorce lawyer\'s documentation requirements",
          location: "Home office",
          observable: false
        },
        {
          time: "8:45 PM",
          action: "Heard crash from kitchen, rushed out of office",
          location: "Home office to hallway",
          observable: true,
          witnesses: ["Linda Martinez (saw him in hallway)"]
        },
        {
          time: "8:47 PM",
          action: "Discovered Sadie\'s body with other guests",
          location: "Kitchen",
          observable: true,
          witnesses: ["All present guests"]
        }
      ]
    },
    {
      caseId: pyramidCase.id,
      name: 'Jessica Kaufman',
      emoji: '👩‍🎓',
      title: 'Estranged Daughter',
      bio: 'College Student (Age 22). Sadie and Roger\'s daughter who came home for the weekend. Jessica is bitter about her mother\'s EverFresh obsession and embarrassed by the constant parties. She wears all black and makes sarcastic comments about "pyramid schemes" whenever possible, much to her mother\'s frustration.',
      personality: 'Bitter and sarcastic, rolls her eyes at everything EverFresh-related. Sharp-tongued but ultimately still loves her family.',
      background: 'Senior at State University studying communications. Has watched EverFresh destroy her family\'s finances and relationships over the past three years.',
      secrets: 'Dropped out of college last semester but hasn\'t told her parents yet. Her college fund was spent on EverFresh inventory, leaving her unable to afford tuition.',
      alibi: 'Was in her old bedroom texting friends and avoiding the party, only came downstairs when she heard the crash.',
      isKiller: false,
      timeline: [
        {
          time: "6:45 PM",
          action: "Argued with Sadie about attending the party",
          location: "Kitchen",
          observable: true,
          witnesses: ["Sadie Kaufman", "Roger Kaufman"]
        },
        {
          time: "7:30 PM",
          action: "Reluctantly greeted guests with eye rolls",
          location: "Living room",
          observable: true,
          witnesses: ["Carol Reynolds", "Linda Martinez"]
        },
        {
          time: "7:45 PM",
          action: "Made sarcastic comments during presentation",
          location: "Living room",  
          observable: true,
          witnesses: ["All party guests"]
        },
        {
          time: "8:00 PM",
          action: "Escaped upstairs to her bedroom",
          location: "Upstairs bedroom",
          observable: true,
          witnesses: ["Yvonne Torres (saw her go upstairs)"]
        },
        {
          time: "8:30 PM",
          action: "Texted friends about college dropout situation",
          location: "Upstairs bedroom",
          observable: false
        },
        {
          time: "8:45 PM",
          action: "Heard crash and rushed downstairs",
          location: "Stairs to kitchen",
          observable: true,
          witnesses: ["Roger Kaufman (saw her on stairs)"]
        }
      ]
    },
    {
      caseId: pyramidCase.id,
      name: 'Yvonne Torres',
      emoji: '🧹',
      title: 'The House Cleaner',
      bio: 'House Cleaner (Age 45). Has cleaned the Kaufman home for three years and knows all the family secrets. Yvonne is a sharp, observant woman who speaks little but misses nothing. She was working late tonight to clean up after the party, moving quietly through the house during the event.',
      personality: 'Observant and sharp, speaks little but misses nothing. Moves through the house like a ghost, seeing everything.',
      background: 'Professional house cleaner who works for several families in the neighborhood. Immigrated from El Salvador 15 years ago, supports her own family.',
      secrets: 'Witnessed Roger meeting with a divorce lawyer at a coffee shop last week. Also knows about Jessica\'s college situation from overhearing phone calls.',
      alibi: 'Was cleaning the upstairs bedrooms during the party, preparing for post-party cleanup.',
      isKiller: false,
      timeline: [
        {
          time: "6:30 PM",
          action: "Arrived early to prepare house for party",
          location: "Kitchen",
          observable: true,
          witnesses: ["Sadie Kaufman"]
        },
        {
          time: "7:00 PM",
          action: "Helped Carol set up demonstration table",
          location: "Living room",
          observable: true,
          witnesses: ["Carol Reynolds", "Sadie Kaufman"]
        },
        {
          time: "7:30 PM",
          action: "Retreated upstairs to clean bedrooms",
          location: "Upstairs",
          observable: true,
          witnesses: ["Jessica Kaufman (saw her with cleaning supplies)"]
        },
        {
          time: "8:00 PM",
          action: "Cleaned master bedroom, could hear presentation below",
          location: "Master bedroom",
          observable: false
        },
        {
          time: "8:30 PM",
          action: "Organized Jessica\'s old bedroom",
          location: "Jessica\'s bedroom",
          observable: true,
          witnesses: ["Jessica Kaufman (briefly saw her)"]
        },
        {
          time: "8:45 PM",
          action: "Heard crash from kitchen while in guest bedroom",
          location: "Guest bedroom",
          observable: false
        },
        {
          time: "8:48 PM",
          action: "Came downstairs to investigate commotion",
          location: "Kitchen",
          observable: true,
          witnesses: ["All present guests"]
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
      caseId: pyramidCase.id,
      killer: 'Carol Reynolds',
      killerMotives: 'Sadie discovered Carol was skimming commission from her downline recruits to inflate her own sales numbers. Carol was desperate to become chapter president and couldn\'t let Sadie expose her fraud, which would end her EverFresh career and reputation.',
      murderMethod: 'During the refreshment break, Carol slipped into the kitchen claiming to get napkins. She confronted Sadie about the commission investigation, and when Sadie threatened to report her immediately, Carol grabbed the Goliath storage container and struck Sadie in the head.',
      keyEvidence: 'Carol\'s fingerprints on the cracked Goliath container, EverFresh sales records showing commission discrepancies, threatening text messages between Carol and Sadie, timeline showing Carol was unaccounted for during the critical window.',
      timeline: '8:30 PM - Refreshment break begins. 8:35 PM - Carol enters kitchen alone. 8:45 PM - Murder occurs during confrontation. 8:46 PM - Carol returns to dining room acting shocked.'
    }
  });

  console.log('Created solution for killer:', solution.killer);
  console.log('Database seeded successfully! Evidence will be generated dynamically during gameplay.');
}

seedPyramidSchemeCase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });