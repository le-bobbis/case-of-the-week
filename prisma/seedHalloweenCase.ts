import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHalloweenCase() {
  console.log('Seeding Halloween House Party case...');

  // First, set all existing cases to inactive
  await prisma.case.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  });

  // Create the Halloween House Party case
  const halloweenCase = await prisma.case.create({
    data: {
      title: 'The Halloween House Party',
      description: 'At the notorious off-campus Halloween party known as "The Blackout Bash," popular fraternity president Tyler Morrison (21) was found dead in the basement at 1:15 AM, stabbed multiple times with a kitchen knife. The party, hosted at a rented house on Maple Street, was packed with over 200 costumed students. Tyler had been seen arguing with several people throughout the night before disappearing around 12:45 AM. His body was discovered by party-goers looking for more beer. Security was lax, drinks were flowing, and in the chaos of costumes and intoxicated students, the killer had plenty of cover. The five main suspects all had recent conflicts with Tyler and suspicious gaps in their alibis.',
      setting: 'in the basement of an off-campus party house',
      victim: 'Tyler Morrison',
      murderWeapon: 'kitchen knife',
      murderTime: '1:15 AM',
      isActive: true
    }
  });

  console.log('Created case:', halloweenCase.title);

  // Create suspects with complete timelines
  const suspects = [
    {
      caseId: halloweenCase.id,
      name: 'Madison Chen',
      emoji: '🧛‍♀️',
      title: 'Vampire',
      bio: 'Pre-med Student (Age 21). Dressed as a vampire in a black cape, fangs, and dramatic makeup. Madison is Tyler\'s ex-girlfriend who broke up with him two weeks ago after discovering he cheated. She arrived at the party already drunk and has been making scenes all night, alternating between crying and angry outbursts.',
      personality: 'Emotionally volatile tonight, switching between rage and tears. Usually composed but alcohol has removed all filters.',
      background: 'Top pre-med student, dated Tyler for two years. Their breakup was explosive and public. She threatened him via text last week.',
      secrets: 'Found out Tyler had been sharing intimate photos of her with his frat brothers. She came to the party planning to humiliate him but found something worse.',
      alibi: 'Claims she was throwing up in the upstairs bathroom with her friend holding her hair.',
      isKiller: false,
      timeline: [
        {
          time: "11:00 PM",
          action: "Arrived already intoxicated, made a scene at entrance",
          location: "Front entrance",
          observable: true,
          witnesses: ["Jake Rivera", "Multiple party-goers"]
        },
        {
          time: "11:30 PM",
          action: "Loudly confronted Tyler near the beer pong table",
          location: "Main room",
          observable: true,
          witnesses: ["Emma Walsh", "Fraternity brothers"]
        },
        {
          time: "12:00 AM",
          action: "Threw a drink at Tyler, screaming about revenge",
          location: "Kitchen",
          observable: true,
          witnesses: ["Marcus Thompson", "Kitchen crowd"]
        },
        {
          time: "12:30 AM",
          action: "Crying in downstairs bathroom",
          location: "First floor bathroom",
          observable: true,
          witnesses: ["Her roommate Sarah"]
        },
        {
          time: "12:45 AM",
          action: "Went upstairs, visibly ill from drinking",
          location: "Upstairs bathroom",
          observable: true,
          witnesses: ["Sarah (friend)", "Couple waiting for bathroom"]
        },
        {
          time: "1:00 AM",
          action: "Still in bathroom being sick",
          location: "Upstairs bathroom",
          observable: true,
          witnesses: ["Sarah continuously with her"]
        }
      ]
    },
    {
      caseId: halloweenCase.id,
      name: 'Jake Rivera',
      emoji: '💀',
      title: 'Grim Reaper',
      bio: 'Business Major (Age 22). Wearing a black hooded robe and carrying a plastic scythe as the Grim Reaper. Jake is Tyler\'s fraternity brother and former best friend who was recently kicked out of the frat after Tyler accused him of stealing money from the house fund. He\'s been drinking heavily and telling anyone who\'ll listen that Tyler framed him.',
      personality: 'Bitter and aggressive when drunk. Keeps ranting about betrayal and justice.',
      background: 'Was Tyler\'s little brother in the frat, then best friend, then suddenly expelled from the fraternity last month. Lost his housing and scholarship.',
      secrets: 'Actually did steal the money but only because Tyler was blackmailing him about his family\'s immigration status.',
      alibi: 'Says he was outside on the back porch smoking weed with some guys from another frat.',
      isKiller: true,
      timeline: [
        {
          time: "10:30 PM",
          action: "Arrived in Grim Reaper costume, already drunk",
          location: "Front entrance",
          observable: true,
          witnesses: ["Door security", "Madison Chen"]
        },
        {
          time: "11:15 PM",
          action: "Got into shoving match with Tyler",
          location: "Living room",
          observable: true,
          witnesses: ["Multiple frat brothers", "Sophia Bennett"]
        },
        {
          time: "11:45 PM",
          action: "Telling people Tyler ruined his life",
          location: "Kitchen/keg area",
          observable: true,
          witnesses: ["Random party-goers", "Marcus Thompson"]
        },
        {
          time: "12:20 AM",
          action: "Went to back porch to smoke",
          location: "Back porch",
          observable: true,
          witnesses: ["Two guys from Sigma Chi"]
        },
        {
          time: "12:40 AM",
          action: "Left porch 'to find bathroom', actually followed Tyler",
          location: "Through kitchen to basement",
          observable: false
        },
        {
          time: "12:50 AM",
          action: "Confronted and stabbed Tyler in basement",
          location: "Basement",
          observable: false
        },
        {
          time: "1:00 AM",
          action: "Returned to porch, claimed he'd been in bathroom",
          location: "Back porch",
          observable: true,
          witnesses: ["Same Sigma Chi guys, noted he seemed agitated"]
        }
      ]
    },
    {
      caseId: halloweenCase.id,
      name: 'Emma Walsh',
      emoji: '😈',
      title: 'Devil',
      bio: 'Psychology Major (Age 20). Dressed as a devil in a red dress, horns, and carrying a pitchfork prop. Emma is a sorority sister who Tyler sexually assaulted at a mixer last month. She filed a report with the university but Tyler\'s dad\'s lawyers got it dismissed. She\'s been rallying other girls to come forward.',
      personality: 'Outwardly calm but seething with controlled anger. Stone-cold sober unlike most party-goers.',
      background: 'Junior in Delta Gamma, honor student, campus activist. Has been building a case against Tyler with other victims.',
      secrets: 'Has been recording Tyler all night trying to get him to admit to the assault. Has evidence on her phone that could destroy him.',
      alibi: 'Claims she was in the living room dancing with her sorority sisters.',
      isKiller: false,
      timeline: [
        {
          time: "11:00 PM",
          action: "Arrived sober with group of sorority sisters",
          location: "Front entrance",
          observable: true,
          witnesses: ["Sorority sisters", "Door security"]
        },
        {
          time: "11:30 PM",
          action: "Witnessed Madison confronting Tyler",
          location: "Main room",
          observable: true,
          witnesses: ["Madison Chen", "Crowd"]
        },
        {
          time: "12:00 AM",
          action: "Followed Tyler with phone, trying to record",
          location: "Various rooms",
          observable: true,
          witnesses: ["Sophia Bennett noticed her following"]
        },
        {
          time: "12:30 AM",
          action: "Dancing with sorority sisters",
          location: "Living room dance area",
          observable: true,
          witnesses: ["5-6 Delta Gamma sisters"]
        },
        {
          time: "12:45 AM",
          action: "Went to kitchen for water",
          location: "Kitchen",
          observable: true,
          witnesses: ["Marcus Thompson", "Others at sink"]
        },
        {
          time: "1:00 AM",
          action: "Back dancing with sisters",
          location: "Living room",
          observable: true,
          witnesses: ["Sorority sisters confirmed"]
        }
      ]
    },
    {
      caseId: halloweenCase.id,
      name: 'Marcus Thompson',
      emoji: '🧟',
      title: 'Zombie',
      bio: 'Computer Science Major (Age 21). Dressed as a zombie with torn clothes, fake blood, and grey makeup. Marcus is a drug dealer who Tyler owed $5,000 to. He\'s been trying to collect all semester but Tyler kept dodging him. Tonight he came to the party specifically to confront Tyler about the money.',
      personality: 'Seemingly chill but there\'s an edge underneath. Keeps checking his phone and watching exits.',
      background: 'Known campus dealer, usually sells party drugs and weed. Tyler was his biggest customer but hadn\'t paid in months.',
      secrets: 'Tyler was planning to turn Marcus in to campus police to avoid paying the debt. Marcus found out through a mutual friend.',
      alibi: 'Says he was in the garage playing beer pong and dealing to customers.',
      isKiller: false,
      timeline: [
        {
          time: "10:00 PM",
          action: "Arrived early to set up shop",
          location: "Garage/beer pong area",
          observable: true,
          witnesses: ["Early arrivals", "Beer pong players"]
        },
        {
          time: "11:00 PM",
          action: "Dealing to various customers",
          location: "Garage",
          observable: true,
          witnesses: ["Multiple customers throughout night"]
        },
        {
          time: "11:45 PM",
          action: "Jake Rivera ranting to him about Tyler",
          location: "Kitchen/keg area",
          observable: true,
          witnesses: ["Jake Rivera", "Others in kitchen"]
        },
        {
          time: "12:00 AM",
          action: "Witnessed Madison throwing drink at Tyler",
          location: "Kitchen",
          observable: true,
          witnesses: ["Madison Chen", "Tyler Morrison", "Kitchen crowd"]
        },
        {
          time: "12:30 AM",
          action: "Cornered Tyler about money owed",
          location: "Hallway near bathroom",
          observable: true,
          witnesses: ["Two customers waiting nearby"]
        },
        {
          time: "12:45 AM",
          action: "Back in garage, noted Tyler headed to basement",
          location: "Garage",
          observable: true,
          witnesses: ["Beer pong players", "Emma Walsh passed through"]
        },
        {
          time: "1:00 AM",
          action: "Still in garage dealing",
          location: "Garage",
          observable: true,
          witnesses: ["Continuous presence confirmed by multiple people"]
        }
      ]
    },
    {
      caseId: halloweenCase.id,
      name: 'Sophia Bennett',
      emoji: '🧙‍♀️',
      title: 'Witch',
      bio: 'Communications Major (Age 20). Dressed as a witch with a pointed hat, black dress, and green face paint. Sophia is Tyler\'s current girlfriend who just found out about his cheating with multiple girls, including her best friend. She\'s been acting strange all night, oscillating between clingy and distant.',
      personality: 'Putting on a cheerful facade but clearly devastated. Drinking more than usual, fake laughing too loud.',
      background: 'Started dating Tyler three months ago. Her sorority sisters tried to warn her but she didn\'t listen. Just found out the truth this afternoon.',
      secrets: 'Discovered she\'s pregnant with Tyler\'s baby. Hadn\'t told him yet and now doesn\'t know what to do.',
      alibi: 'Claims she was in the upstairs bedroom crying and calling her sister.',
      isKiller: false,
      timeline: [
        {
          time: "10:45 PM",
          action: "Arrived with Tyler, acting overly affectionate",
          location: "Front entrance",
          observable: true,
          witnesses: ["Tyler Morrison", "Door security", "Various guests"]
        },
        {
          time: "11:15 PM",
          action: "Witnessed Jake and Tyler\'s confrontation",
          location: "Living room",
          observable: true,
          witnesses: ["Jake Rivera", "Tyler Morrison", "Crowd"]
        },
        {
          time: "11:45 PM",
          action: "Drinking heavily at kitchen bar",
          location: "Kitchen",
          observable: true,
          witnesses: ["Madison Chen", "Bartender"]
        },
        {
          time: "12:00 AM",
          action: "Noticed Emma following Tyler with phone",
          location: "Hallway",
          observable: true,
          witnesses: ["Emma Walsh"]
        },
        {
          time: "12:20 AM",
          action: "Crying argument with Tyler about cheating",
          location: "Front porch",
          observable: true,
          witnesses: ["Smokers on porch", "People coming/going"]
        },
        {
          time: "12:40 AM",
          action: "Went upstairs to empty bedroom",
          location: "Upstairs bedroom",
          observable: true,
          witnesses: ["Couple who saw her enter alone"]
        },
        {
          time: "1:00 AM",
          action: "On phone with sister, crying",
          location: "Upstairs bedroom",
          observable: true,
          witnesses: ["Phone records", "Sister confirms call"]
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
      caseId: halloweenCase.id,
      killer: 'Jake Rivera (Grim Reaper)',
      killerMotives: 'Jake killed Tyler in a drunken rage over being framed and expelled from the fraternity. Tyler had discovered Jake stealing from the house fund but didn\'t know Jake only stole because Tyler was blackmailing him about his family\'s immigration status. The expulsion cost Jake his housing, his scholarship, and his future. When Jake saw Tyler heading to the basement alone, his Grim Reaper costume provided perfect cover - the hood obscured his face and the flowing robe hid his movements. The plastic scythe he\'d been carrying all night made people dismiss him as just another costumed drunk.',
      murderMethod: 'Jake followed Tyler to the basement when Tyler went down to get more beer from the backup cooler. In the dim basement light, Jake confronted Tyler one final time. When Tyler laughed at him and threatened to call immigration on his family, Jake snapped. He grabbed a kitchen knife from the prep area (the basement had been used for food prep earlier) and stabbed Tyler multiple times in a frenzy. The loud music from upstairs masked any sounds.',
      keyEvidence: 'Blood traces on Jake\'s costume hidden by the black fabric, kitchen knife with partial prints, witness saw him leave porch at 12:40 AM (contradicting alibi), Tyler\'s phone showing Jake\'s threatening texts, security footage showing only Jake and Tyler heading to basement in the critical timeframe.',
      timeline: '12:30 AM - Tyler last seen heading to basement. 12:40 AM - Jake leaves back porch. 12:45 AM - Confrontation in basement. 12:50 AM - Murder occurs. 1:00 AM - Jake returns to porch. 1:15 AM - Body discovered.'
    }
  });

  console.log('Created solution for killer:', solution.killer);
  console.log('Halloween House Party case seeded successfully!');
}

// Run the seed function
seedHalloweenCase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });