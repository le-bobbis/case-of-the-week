import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Evidence, ChatMessage } from '@/types/game';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      playerQuestion, 
      characterResponse, 
      characterName,
      existingEvidence, 
      conversationHistory,
      actionsRemaining,
      evidenceCount,
      biasContext // New parameter from inspect API
    } = await request.json();

    // Fetch the active case and its solution from database
    const activeCase = await prisma.case.findFirst({
      where: { isActive: true },
      include: {
        solution: true,
        suspects: true,
        coreEvidence: true,
        redHerrings: true
      }
    });

    if (!activeCase || !activeCase.solution) {
      console.error('No active case or solution found');
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

    // Build suspect names list from database
    const suspectNames = activeCase.suspects.map(s => s.name).join(', ');

    // Build context for existing evidence to prevent duplicates
    const existingCategories = new Set();
    const existingEvidenceContext = existingEvidence.length > 0 
      ? `Already discovered evidence: ${existingEvidence.map((e: Evidence) => {
          // Track categories
          if (e.emoji === '📱') existingCategories.add('PHONE');
          if (e.emoji === '🍷' || e.emoji === '🍾') existingCategories.add('WINE');
          if (e.emoji === '👔' || e.emoji === '🧵' || e.emoji === '👗') existingCategories.add('FABRIC');
          if (e.emoji === '📋' || e.emoji === '📄' || e.emoji === '📝') existingCategories.add('DOCUMENT');
          if (e.emoji === '🔑') existingCategories.add('KEY');
          if (e.emoji === '👟' || e.emoji === '👠') existingCategories.add('FOOTWEAR');
          if (e.emoji === '💻') existingCategories.add('COMPUTER');
          
          return `${e.emoji} ${e.name} - ${e.description}`;
        }).join(', ')}

CRITICAL: These evidence CATEGORIES already exist and MUST NOT be duplicated: ${Array.from(existingCategories).join(', ')}
Do NOT create ANY new evidence in these categories, even with different names or descriptions.`
      : 'No evidence discovered yet.';

    // Build conversation context
    const conversationContext = conversationHistory && conversationHistory.length > 0
      ? `Recent conversation: ${conversationHistory.slice(-6).map((msg: ChatMessage) => msg.text).join(' ')}`
      : 'First interaction.';

    // Build bias context for evidence generation
    let biasInstructions = '';
    if (biasContext?.shouldBiasTowardKiller && biasContext.availableKillerEvidence?.length > 0) {
      biasInstructions = `
BIAS TOWARD KILLER EVIDENCE: This interaction has been flagged to favor evidence pointing toward ${biasContext.killerName}. 
Available killer evidence to potentially discover:
${biasContext.availableKillerEvidence.map((e: any) => `- ${e.emoji} ${e.name}: ${e.description} (triggers: ${e.triggerWords})`).join('\n')}

Increase generation probability for killer evidence by 40% if trigger words match.`;
    } else if (biasContext?.availableRedHerrings?.length > 0) {
      biasInstructions = `
NEUTRAL/RED HERRING BIAS: This interaction favors neutral or misleading evidence.
Available red herring evidence:
${biasContext.availableRedHerrings.map((e: any) => `- ${e.emoji} ${e.name}: ${e.description} (triggers: ${e.triggerWords})`).join('\n')}

Favor red herring evidence generation if appropriate.`;
    }

    const prompt = `You are the evidence manager for "${activeCase.title}" murder mystery game.

CASE CONTEXT:
- Victim: ${activeCase.victim}, killed with ${activeCase.murderWeapon} at ${activeCase.murderTime}
- Setting: ${activeCase.setting}
- Killer: ${activeCase.solution.killer}
- Motive: ${activeCase.solution.killerMotives}
- Method: ${activeCase.solution.murderMethod}

CURRENT SITUATION:
Player asked: "${playerQuestion}"
Character (${characterName}) responded: "${characterResponse}"

GAME STATE:
${existingEvidenceContext}
${conversationContext}
Actions remaining: ${actionsRemaining}/20
Evidence already found: ${evidenceCount}/20

${biasInstructions}

GENERATION FREQUENCY:
- If evidence count is 0-3: Be more generous (help player get started)
- If evidence count is 4-10: Be selective (only strong mentions)
- If evidence count is 11-15: Be very selective (only critical evidence)
- If evidence count is 16+: Almost never generate (player has enough)

YOUR TASK:
Analyze the character's response. Does it contain any interesting nouns, objects, or concepts that could become a physical piece of evidence? 

EVIDENCE GENERATION THRESHOLD:
- Only generate evidence if there's a STRONG, DIRECT mention of a physical object
- Vague descriptions, emotions, or general scene-setting should NOT generate evidence
- Consider evidence generation probability:
  * Direct object mention with details: 70% chance
  * Vague object reference: 20% chance  
  * Scene description only: 5% chance
  * Emotional/character descriptions: 0% chance
  * ${biasContext?.shouldBiasTowardKiller ? 'Killer evidence with matching triggers: +40% chance' : ''}

Examples that SHOULD generate evidence:
- "I saw Elena drop her scarf near the door"
- "There was a phone on the table with missed calls"
- "Marcus's wallet fell out during the struggle"
- "A broken wine bottle lies at the foot of the bed"

Examples that should NOT generate evidence:
- "The room smelled musty" (too vague)
- "Elena looked nervous" (not physical)
- "It was a chaotic scene" (general description)
- "Wine was everywhere" (too general unless specific bottle mentioned) 

CRITICAL: Do NOT generate evidence for objects of the same TYPE already discovered. Check these categories:
- FABRIC/CLOTHING: torn fabric, scarves, jackets, buttons, threads, fibers
- WINE/BOTTLES: wine bottles, broken glass, corks, wine stains
- ELECTRONICS: phones, laptops, tablets, cameras
- KEYS/LOCKS: any keys, keychains, lock picks
- DOCUMENTS: papers, notes, letters, records
- PERSONAL ITEMS: watches, jewelry, wallets, glasses
- FOOTWEAR: shoes, footprints, shoe marks
- BLOOD/BODILY: blood, hair, fingerprints

If ANY evidence in a category exists, do NOT create more in that category.

EVIDENCE GENERATION RULES:
1. If ANY physical object is mentioned, consider generating evidence
2. Objects to consider when generating evidence: weapons (real or potential), personal electronics, keys, clothing items, documents, cameras, setting features, etc.
3. Locations can generate evidence if they contain specific details (scratches on door, stains on floor, etc.)
4. Maximum ONE piece of evidence per response
5. Evidence should feel natural and connected to what was just discussed
6. Can be either a REAL CLUE (points toward the killer) or RED HERRING (misleading)
7. Must not duplicate existing evidence CATEGORIES - check the category list above
8. Evidence must be realistic for this murder scene investigation
9. When in doubt about duplicates, choose NO_EVIDENCE rather than risk creating similar evidence
10. ONLY use character names from this case: ${suspectNames}, ${activeCase.victim} (victim)
11. Do NOT invent new characters - stick to the established suspects from the database
12. INSPECT commands should generate evidence RARELY - only if something very specific and important is discovered
13. Evidence should be SIGNIFICANT - not trivial details like smells or general descriptions
14. Prefer NO_EVIDENCE over weak or marginal evidence

DESCRIPTION RULES:
- Describe ONLY what is physically observed
- NO interpretations, conclusions, or speculation
- NO phrases like "likely murder weapon", "suspicious", "probably", "appears to be"
- Use neutral, factual language
- Focus on physical characteristics: size, color, condition, location

GOOD EXAMPLES:
- "A shattered vintage wine bottle found next to the victim's body"
- "A torn piece of fabric caught on the cellar door handle"
- "A smartphone with several missed calls on the screen"

BAD EXAMPLES:
- "A wine bottle that appears to be the murder weapon"
- "Suspicious fabric that likely belongs to the killer"
- "A phone with threatening messages (clearly evidence of blackmail)"

RESPONSE FORMAT:
If no evidence should be generated, respond with EXACTLY: NO_EVIDENCE

If evidence should be generated, respond with ONLY valid JSON (no extra text):
{
  "shouldGenerate": true,
  "evidence": {
    "id": "unique_evidence_id",
    "name": "Evidence Name",
    "emoji": "📱",
    "description": "Brief factual description with no interpretation"
  }
}

IMPORTANT: Respond with ONLY the JSON or "NO_EVIDENCE" - no explanations or extra text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('🧩 EVIDENCE GENERATION DEBUG:');
    console.log('- Player Question:', playerQuestion);
    console.log('- Character Response:', characterResponse);
    console.log('- Bias Context:', biasContext?.shouldBiasTowardKiller ? 'KILLER BIAS' : 'NEUTRAL');
    console.log('- AI Decision:', response.trim());
    
    // Handle NO_EVIDENCE response
    if (response.trim() === 'NO_EVIDENCE') {
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

    // Extract JSON from response (in case AI adds extra text)
    let jsonString = response.trim();
    
    // Try to find JSON object boundaries
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonString = jsonString.substring(jsonStart, jsonEnd);
    }
    
    // Try to parse JSON response
    try {
      const parsedResponse = JSON.parse(jsonString);
      
      if (parsedResponse.shouldGenerate && parsedResponse.evidence) {
        // Validate evidence structure
        const evidence = parsedResponse.evidence;
        if (evidence.id && evidence.name && evidence.emoji && evidence.description) {
          
          // Additional validation: check for duplicate categories
          const phoneEmojis = ['📱', '📞', '☎️'];
          const documentEmojis = ['📋', '📄', '📝', '📃', '📑'];
          const fabricEmojis = ['👔', '🧵', '👗', '👚', '🧥'];
          
          // Check if this category already exists
          for (const existing of existingEvidence) {
            // Phone category check
            if (phoneEmojis.includes(evidence.emoji) && phoneEmojis.includes(existing.emoji)) {
              console.log('❌ Duplicate phone evidence blocked');
              return NextResponse.json({ evidenceGenerated: false, evidence: null });
            }
            // Document category check
            if (documentEmojis.includes(evidence.emoji) && documentEmojis.includes(existing.emoji)) {
              console.log('❌ Duplicate document evidence blocked');
              return NextResponse.json({ evidenceGenerated: false, evidence: null });
            }
            // Fabric category check
            if (fabricEmojis.includes(evidence.emoji) && fabricEmojis.includes(existing.emoji)) {
              console.log('❌ Duplicate fabric evidence blocked');
              return NextResponse.json({ evidenceGenerated: false, evidence: null });
            }
          }
          
          console.log('✅ Evidence successfully generated:', evidence.name);
          console.log('- Bias influenced:', biasContext?.shouldBiasTowardKiller ? 'Yes (toward killer)' : 'No');
          return NextResponse.json({
            evidenceGenerated: true,
            evidence: evidence
          });
        }
      }
      
      // Invalid structure
      console.log('❌ Invalid evidence structure');
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI evidence response:', parseError);
      console.log('Raw response that failed to parse:', response);
      return NextResponse.json({
        evidenceGenerated: false,
        evidence: null
      });
    }

  } catch (error) {
    console.error('Evidence generation API error:', error);
    return NextResponse.json({
      evidenceGenerated: false,
      evidence: null
    });
  }
}