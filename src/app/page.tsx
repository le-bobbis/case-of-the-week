'use client';

import { FormEvent, useMemo, useState } from 'react';

type MissionType = 'deliver' | 'rescue' | 'recover' | 'eliminate';

type Mission = {
  id: string;
  title: string;
  location: string;
  objective: string;
  briefing: string;
  threats: string[];
  reward: string;
  type: MissionType;
};

type PlayerProfile = {
  name: string;
  level: number;
  xp: number;
  xpToLevel: number;
  stats: Record<string, number>;
  inventory: { emoji: string; name: string; description: string }[];
};

type LogEntry =
  | { id: string; role: 'runner'; content: string }
  | {
      id: string;
      role: 'gm';
      narrative: string;
      facts: [string, string, string];
      actionsRemaining: number;
    };

type MissionStatus = 'progress' | 'success' | 'failure' | 'death' | 'forfeit';

type GMResult = {
  narrative: string;
  facts: [string, string, string];
  actionsRemaining: number;
  progressDelta?: number;
  status?: MissionStatus;
  triggerDanger?: boolean;
  dangerDescriptor?: string;
};

type DangerContext = {
  descriptor: string;
  foe: string;
};

const missions: Mission[] = [
  {
    id: 'mission-a',
    title: 'Run the Croix-Rousse Relay',
    location: 'Lyon Commune',
    objective: 'Deliver encoded communiqués to the watchtower above the flooded Croix-Rousse valley.',
    briefing:
      'The Lyon Commune clings to the heights while undead patrols roil through the drowned silk factories below. Take the communiqués before dawn and avoid the Prussian listening posts in the valley haze.',
    threats: ['Prussian saboteurs in the fog', 'Undead silk workers rising with the tide', 'Collapsing aqueduct spans'],
    reward: '280 Francs + 40 XP',
    type: 'deliver',
  },
  {
    id: 'mission-b',
    title: 'Rescue the Mireille Archivist',
    location: 'Ruined University of Montpellier',
    objective: 'Extract Archivist Mireille from the necromantic laboratory before the plaguefire spreads.',
    briefing:
      'A plaguefire ruptured beneath the old amphitheater, twisting cadavers into ash-stitched horrors. Mireille barricaded herself in the alchemical stacks. Reach her, stabilize the breach, and escape before the foundations liquefy.',
    threats: ['Ashbound revenants', 'Collapsing vault corridors', 'Toxic alchemical fumes'],
    reward: '320 Francs + 50 XP',
    type: 'rescue',
  },
  {
    id: 'mission-c',
    title: 'Recover the Black Box',
    location: 'Derelict Airship “La Hirondelle” near Metz',
    objective: 'Secure the crashed courier craft’s black box before scavenger guilds strip it.',
    briefing:
      'The courier aerostat ripped open over Metz when the meteor rains returned. Its wreckage dangles above flooded streets. Climb the rigging, extract the recorder, and survive the rival guild already on-site.',
    threats: ['Rival guild sharpshooters', 'Unstable rigging and ruptured gas sacs', 'Shambling infantry caught in the ropes'],
    reward: '340 Francs + 55 XP',
    type: 'recover',
  },
];

const playerProfile: PlayerProfile = {
  name: 'Éloi Marchand',
  level: 7,
  xp: 3120,
  xpToLevel: 3600,
  stats: {
    Strength: 5,
    Perception: 6,
    Precision: 5,
    Vitality: 4,
    Intelligence: 6,
    Charisma: 3,
    Menace: 4,
    Reflex: 6,
    Luck: 3,
  },
  inventory: [
    {
      emoji: '🗡️',
      name: 'Serrated Sabre',
      description: 'Bone-saw edge slices undead sinew cleanly.',
    },
    {
      emoji: '🪢',
      name: 'Petrified Rope',
      description: 'Stone-treated line anchors climbs on wet masonry.',
    },
    {
      emoji: '🧴',
      name: 'Voltaic Tonic',
      description: 'Jolts the heart to counter plague lethargy.',
    },
    {
      emoji: '📜',
      name: 'Ciphered Dispatch',
      description: 'Mission communiqués sealed with Commune wax.',
    },
  ],
};

const createIntro = (mission: Mission): GMResult => ({
  narrative:
    `Watchfires stain the ${mission.location} sky as you shoulder the charge. Commune quartermasters knot the mission satchel across your chest and usher you to the shattered gate. Ten moves to carve a path.`,
  facts: [
    'Watchfires flare above the mission staging ground.',
    'Quartermasters fasten the satchel against your chest.',
    'You step through the shattered gate to begin the run.',
  ],
  actionsRemaining: 10,
});

const sanitizeAction = (input: string) => input.trim().slice(0, 50);

const generateGMResponse = (
  action: string,
  mission: Mission,
  actionsRemaining: number,
  progress: number,
): GMResult => {
  const nextActions = Math.max(actionsRemaining - 1, 0);
  const normalized = action.toLowerCase();
  let status: MissionStatus | undefined;
  let progressDelta = 0;
  let triggerDanger = false;
  let dangerDescriptor: string | undefined;

  const respond = (
    narrative: string,
    facts: [string, string, string],
  ): GMResult => ({
    narrative,
    facts,
    actionsRemaining: nextActions,
    progressDelta,
    status,
    triggerDanger,
    dangerDescriptor,
  });

  if (!action.trim()) {
    return respond(
      'Wind rattles the broken shutters while you hesitate. The road does not forgive wasted motion.',
      [
        'Wind rattles the broken shutters around you.',
        'You lose precious seconds to indecision.',
        'The road’s dangers press tighter as you stall.',
      ],
    );
  }

  if (normalized.includes('survey') || normalized.includes('scout') || normalized.includes('observe')) {
    progressDelta = 1;
    return respond(
      'You scale a leaning chimney and rake the ruins below. Lantern knots trace the Commune pickets, and a hulking patrol of shamblers wades through the mire. You map a dry path between submerged workshops.',
      [
        'You climb the chimney to gain a vantage.',
        'You spot shamblers wading through the mire below.',
        'You chart a dry path threading the drowned workshops.',
      ],
    );
  }

  if (normalized.includes('deliver') || normalized.includes('hand') || normalized.includes('drop')) {
    if (mission.type === 'deliver' && progress >= 2) {
      status = 'success';
      return respond(
        'You breach the watchtower and press the sealed dispatch into the captain’s gloves. Signal rockets hiss skyward. The Commune line realigns before the horde can crest the ridge. Your run ends in breathless triumph.',
        [
          'You reach the watchtower captain and hand over the dispatch.',
          'Signal rockets streak skyward to realign the Commune line.',
          'The mission concludes in a hard-won success.',
        ],
      );
    }
    progressDelta = 1;
    return respond(
      'You weave between barricades and pass coded whispers to sentries clinging to their posts. Each handoff clears another checkpoint toward the tower, but the final ascent still waits.',
      [
        'You move through barricades to brief the waiting sentries.',
        'Coded whispers ripple along the defensive line.',
        'The final ascent to the tower still stands ahead.',
      ],
    );
  }

  if (normalized.includes('rescue') || normalized.includes('reach') || normalized.includes('free')) {
    if (mission.type === 'rescue' && progress >= 2) {
      status = 'success';
      return respond(
        'You batter through the warped lab door and pull Mireille into the hall. She clutches the sealed folios as you guide her toward daylight. Plaguefire hisses behind you, cut off by the collapsing seal.',
        [
          'You wrench Mireille out of the burning laboratory.',
          'She carries the folios as you drive toward the exit.',
          'The collapsing seal traps the plaguefire behind you.',
        ],
      );
    }
    progressDelta = 1;
    return respond(
      'You shoulder aside debris and call through the smoke. Mireille’s reply echoes from a barricaded stack. You carve a breathing channel through the fumes and mark a retreat route back to the surface.',
      [
        'You clear debris to reach Mireille’s barricade.',
        'Her voice guides you through the choking smoke.',
        'You trace a retreat corridor toward the surface.',
      ],
    );
  }

  if (normalized.includes('recover') || normalized.includes('secure') || normalized.includes('grab')) {
    if (mission.type === 'recover' && progress >= 2) {
      status = 'success';
      return respond(
        'You wrench the black box free from the tangled rigging and seal it inside your satchel. Rival bolts clatter wide as you drop to the flooded street and signal extraction. The recorder will reach Paris intact.',
        [
          'You free the black box from the aerostat’s rigging.',
          'Rival bolts sail wide as you descend to the street.',
          'The recorder is secured for transport to Paris.',
        ],
      );
    }
    progressDelta = 1;
    return respond(
      'You climb the torn envelope and pry panels apart until the recorder glints beneath cracked glass. Storm gusts sway the hull, but the objective is nearly within your grasp.',
      [
        'You scale the ruptured envelope toward the recorder.',
        'A shimmer of cracked glass reveals the black box.',
        'The hull groans, warning you that time runs thin.',
      ],
    );
  }

  if (normalized.includes('fight') || normalized.includes('strike') || normalized.includes('attack') || normalized.includes('charge')) {
    triggerDanger = true;
    dangerDescriptor = 'A plated revenant intercepts you with a cleaver raised for your throat.';
    return respond(
      'You drive into a plated revenant, sabre flashing in the torchglow. Sparks spray as steel skates across its cuirass. The brute slams you into a burned carriage and hauls a cleaver for your throat. Lethal seconds hang.',
      [
        'You clash with a plated revenant in the torchglow.',
        'The revenant hurls you into a burned carriage.',
        'A cleaver hangs inches from your exposed throat.',
      ],
    );
  }

  if (normalized.includes('talk') || normalized.includes('negotiate') || normalized.includes('parley')) {
    return respond(
      'You hail the scavenger captain and bargain over the roar of distant cannon. Franc coins and menace win a grudging truce long enough to share the road. No blades cross, but the pact will not hold for long.',
      [
        'You confront the scavenger captain to bargain passage.',
        'Francs and menace buy a brittle, temporary truce.',
        'You push onward before the pact splinters apart.',
      ],
    );
  }

  if (normalized.includes('hide') || normalized.includes('stealth') || normalized.includes('sneak')) {
    return respond(
      'You slip beneath collapsed beams and move with the rats. Rainwater drips through the stone ribs, masking your footfalls. Patrol lanterns pass inches overhead while you wait for their light to die.',
      [
        'You crawl beneath collapsed beams with the rats.',
        'Rainwater masks the sound of your movement.',
        'Patrol lanterns fade as you hold your breath.',
      ],
    );
  }

  if (normalized.includes('use rope') || normalized.includes('climb') || normalized.includes('ascend')) {
    progressDelta = 1;
    return respond(
      'You hammer the petrified rope into a cracked cornice and haul yourself skyward. Cold mist lashes your face while the city yawns below. From this perch, the route to the objective sharpens.',
      [
        'You anchor the petrified rope into the cornice.',
        'You climb through cold mist above the ruins below.',
        'A higher vantage reveals a sharper route ahead.',
      ],
    );
  }

  if (normalized.includes('tonic') || normalized.includes('drink')) {
    return respond(
      'You unstopper the voltaic tonic and swallow the bitter charge. Static crawls across your nerves, burning away exhaustion. Your pulse steadies even as the storm worsens around you.',
      [
        'You drink the voltaic tonic despite its bitterness.',
        'Electric warmth drives exhaustion from your limbs.',
        'You brace against the worsening storm around you.',
      ],
    );
  }

  if (normalized.includes('wait') || normalized.includes('rest')) {
    return respond(
      'You shelter in a collapsed arcade and count your breaths. The moans of the horde roll past like surf. When you emerge, the route ahead feels no safer, but your hands no longer shake.',
      [
        'You pause beneath a collapsed arcade to breathe.',
        'Undead moans roll past like distant surf.',
        'You steady your grip before moving again.',
      ],
    );
  }

  if (normalized.includes('report') || normalized.includes('signal') || normalized.includes('flare')) {
    progressDelta = 1;
    return respond(
      'You fire a cracked flare into the night. Commune spotters answer with shuttered lamps, confirming the extraction point. The horde shifts toward the light, buying you a clear lane.',
      [
        'You launch a flare that cuts through the night.',
        'Commune spotters answer with coded lamplight.',
        'The horde lurches toward the distraction you set.',
      ],
    );
  }

  if (normalized.includes('search') || normalized.includes('loot') || normalized.includes('scan')) {
    return respond(
      'You sweep the debris and uncover a waxed bundle of surgeon tools. The steel is clean and the handles steady. A fortunate salvage amid the wreckage.',
      [
        'You sift debris until a waxed bundle appears.',
        'Inside rests a set of pristine surgeon tools.',
        'The salvage may steady future field repairs.',
      ],
    );
  }

  if (nextActions === 0 && status !== 'success') {
    status = 'failure';
    return {
      narrative:
        'The final seconds bleed out as the horde seals every lane. Dispatch papers flutter into the flood while your lungs claw for air. The mission slips away in the crush.',
      facts: [
        'Seconds expire before you can force a breakthrough.',
        'The objective slips beneath flood and claw.',
        'Your run ends with the mission incomplete.',
      ],
      actionsRemaining: nextActions,
      status,
      progressDelta,
    };
  }

  return respond(
    'You press forward along the shattered road, instincts keeping you half a step ahead of ruin. Rain needles your coat. Somewhere ahead, the objective waits for a decisive strike.',
    [
      'You advance along the shattered road without faltering.',
      'Needle rain batters your coat and face.',
      'The objective still waits for a decisive strike.',
    ],
  );
};

const resolveDanger = (
  choice: 'recover' | 'flee',
  mission: Mission,
  actionsRemaining: number,
  progress: number,
): GMResult => {
  const nextActions = Math.max(actionsRemaining - 1, 0);
  if (choice === 'flee') {
    return {
      narrative:
        'You tear free from the revenant and dive through the barricade gap. Boots hammer mud as you sprint toward the safehouse. The mission dies behind you, but you live to run another day.',
      facts: [
        'You break contact and dive through the barricade gap.',
        'You sprint for the safehouse without looking back.',
        'The mission is forfeited to ensure survival.',
      ],
      actionsRemaining: nextActions,
      status: 'forfeit',
    };
  }

  const survival = actionsRemaining > 5 || progress >= 2;

  if (survival) {
    return {
      narrative:
        'You jam the sabre hilt against the revenant’s jaws and drive the voltaic tonic into its throat. Lightning blossoms. The corpse spasms, then falls. Breath ragged, you wrench free and push onward.',
      facts: [
        'You block the revenant’s bite with your sabre hilt.',
        'The voltaic tonic erupts lightning down its throat.',
        'You survive the clash and surge back into motion.',
      ],
      actionsRemaining: nextActions,
      progressDelta: 1,
    };
  }

  return {
    narrative:
      'You twist for a killing thrust, but the revenant’s cleaver cleaves through your guard. Cold mud fills your vision as the world narrows. The run ends here in silence.',
    facts: [
      'Your guard breaks beneath the revenant’s cleaver.',
      'Cold mud floods your vision as you collapse.',
      'The mission and your life end in the same breath.',
    ],
    actionsRemaining: 0,
    status: 'death',
  };
};

const Home = () => {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [actionsRemaining, setActionsRemaining] = useState(10);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [latestGM, setLatestGM] = useState<GMResult | null>(null);
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('progress');
  const [actionInput, setActionInput] = useState('');
  const [activePanel, setActivePanel] = useState<'xp' | 'log' | 'inventory' | 'brief'>('brief');
  const [dangerContext, setDangerContext] = useState<DangerContext | null>(null);

  const xpProgress = useMemo(() => {
    const percent = Math.min(100, Math.round((playerProfile.xp / playerProfile.xpToLevel) * 100));
    return { percent, remaining: playerProfile.xpToLevel - playerProfile.xp };
  }, []);

  const handleMissionStart = (mission: Mission) => {
    setSelectedMission(mission);
    setActionsRemaining(10);
    setProgress(0);
    const intro = createIntro(mission);
    setLatestGM(intro);
    setLog([
      {
        id: 'gm-intro',
        role: 'gm',
        narrative: intro.narrative,
        facts: intro.facts,
        actionsRemaining: intro.actionsRemaining,
      },
    ]);
    setMissionStatus('progress');
    setActionInput('');
    setActivePanel('brief');
    setDangerContext(null);
  };

  const pushGMResultToLog = (result: GMResult, prefixId: string) => {
    setLog((prev) => [
      ...prev,
      {
        id: `${prefixId}-gm-${Date.now()}`,
        role: 'gm',
        narrative: result.narrative,
        facts: result.facts,
        actionsRemaining: result.actionsRemaining,
      },
    ]);
    setLatestGM(result);
  };

  const handleActionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMission || missionStatus !== 'progress' || dangerContext) {
      return;
    }

    const cleaned = sanitizeAction(actionInput);
    if (!cleaned) {
      return;
    }

    setActionInput('');

    const result = generateGMResponse(cleaned, selectedMission, actionsRemaining, progress);

    setLog((prev) => [
      ...prev,
      { id: `runner-${Date.now()}`, role: 'runner', content: cleaned },
    ]);

    setActionsRemaining(result.actionsRemaining);
    if (result.progressDelta) {
      setProgress((prev) => prev + result.progressDelta!);
    }

    if (result.status && result.status !== 'progress') {
      setMissionStatus(result.status);
    }

    if (result.triggerDanger) {
      setDangerContext({
        descriptor: result.dangerDescriptor ?? 'A lethal strike crashes toward you.',
        foe: 'Plated Revenant',
      });
    }

    if (!result.triggerDanger || result.status === 'death') {
      pushGMResultToLog(result, 'action');
    } else {
      // Display the cliffhanger GM narration immediately.
      pushGMResultToLog(result, 'danger');
    }
  };

  const handleDangerResolution = (choice: 'recover' | 'flee') => {
    if (!selectedMission || !dangerContext) return;
    const result = resolveDanger(choice, selectedMission, actionsRemaining, progress);

    setLog((prev) => [
      ...prev,
      { id: `runner-choice-${Date.now()}`, role: 'runner', content: choice === 'recover' ? 'Recover' : 'Flee' },
    ]);

    setDangerContext(null);
    setActionsRemaining(result.actionsRemaining);
    if (result.progressDelta) {
      setProgress((prev) => prev + result.progressDelta!);
    }
    if (result.status && result.status !== 'progress') {
      setMissionStatus(result.status);
    }
    pushGMResultToLog(result, 'danger-resolution');
  };

  const currentMissionBrief = selectedMission?.briefing ?? '';

  return (
    <div className="lc-container">
      {!selectedMission ? (
        <div className="mission-select">
          <header className="mission-select__header">
            <h1 className="mission-select__title">LES COUREURS</h1>
            <p className="mission-select__subtitle">
              Daily contracts through a broken France. Choose the run before the sun rises.
            </p>
          </header>
          <div className="mission-grid">
            {missions.map((mission) => (
              <article key={mission.id} className="mission-card">
                <div className="mission-card__meta">
                  <span className="mission-card__location">{mission.location}</span>
                  <span className="mission-card__type">{mission.type.toUpperCase()}</span>
                </div>
                <h2 className="mission-card__title">{mission.title}</h2>
                <p className="mission-card__objective">{mission.objective}</p>
                <p className="mission-card__brief">{mission.briefing}</p>
                <ul className="mission-card__threats">
                  {mission.threats.map((threat) => (
                    <li key={threat}>⚠️ {threat}</li>
                  ))}
                </ul>
                <footer className="mission-card__footer">
                  <span className="mission-card__reward">{mission.reward}</span>
                  <button className="mission-card__start" onClick={() => handleMissionStart(mission)}>
                    Accept Run
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="game-shell">
          <header className="game-shell__header">
            <div>
              <h1 className="game-shell__title">LES COUREURS</h1>
              <p className="game-shell__mission">{selectedMission.title}</p>
            </div>
            <div className="game-shell__stats">
              <div className="game-shell__player">
                <span className="game-shell__label">Runner</span>
                <strong>{playerProfile.name}</strong>
                <span>Level {playerProfile.level}</span>
              </div>
              <div className="game-shell__actions">
                <span className="game-shell__label">Actions Remaining</span>
                <strong>{actionsRemaining}</strong>
              </div>
            </div>
          </header>

          {latestGM && (
            <section className="gm-response">
              <p className="gm-response__text">{latestGM.narrative}</p>
              <div className="gm-response__summary">
                <span>— Summary —</span>
                <ul>
                  {latestGM.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                  <li className="gm-response__actions">Actions remaining: {latestGM.actionsRemaining}</li>
                </ul>
              </div>
            </section>
          )}

          <section className="game-shell__core">
            <aside className="inventory-strip">
              <h2>Inventory</h2>
              <ul>
                {playerProfile.inventory.map((item) => (
                  <li key={item.name} title={item.description}>
                    <span className="inventory-strip__emoji">{item.emoji}</span>
                    <span className="inventory-strip__name">{item.name}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="action-panel">
              <form className="action-panel__form" onSubmit={handleActionSubmit}>
                <label htmlFor="action-input">Issue your action</label>
                <div className="action-panel__input-wrapper">
                  <input
                    id="action-input"
                    maxLength={50}
                    value={actionInput}
                    onChange={(event) => setActionInput(event.target.value)}
                    placeholder="≤ 50 characters"
                    disabled={missionStatus !== 'progress' || !!dangerContext}
                  />
                  <button type="submit" disabled={missionStatus !== 'progress' || !!dangerContext}>
                    Send
                  </button>
                </div>
              </form>

              <nav className="info-tabs">
                <button
                  className={activePanel === 'brief' ? 'active' : ''}
                  onClick={() => setActivePanel('brief')}
                >
                  Mission Brief
                </button>
                <button className={activePanel === 'log' ? 'active' : ''} onClick={() => setActivePanel('log')}>
                  Session Log
                </button>
                <button className={activePanel === 'xp' ? 'active' : ''} onClick={() => setActivePanel('xp')}>
                  XP Progress
                </button>
                <button
                  className={activePanel === 'inventory' ? 'active' : ''}
                  onClick={() => setActivePanel('inventory')}
                >
                  Inventory Details
                </button>
              </nav>

              <div className="info-panels">
                {activePanel === 'brief' && (
                  <div className="panel">
                    <h3>Mission Objective</h3>
                    <p>{selectedMission.objective}</p>
                    <h4>Briefing</h4>
                    <p>{currentMissionBrief}</p>
                    <h4>Threats</h4>
                    <ul>
                      {selectedMission.threats.map((threat) => (
                        <li key={threat}>⚠️ {threat}</li>
                      ))}
                    </ul>
                    <h4>Reward</h4>
                    <p>{selectedMission.reward}</p>
                  </div>
                )}
                {activePanel === 'log' && (
                  <div className="panel panel--log">
                    <ul>
                      {log.map((entry) => (
                        <li key={entry.id} className={`log-entry log-entry--${entry.role}`}>
                          {entry.role === 'runner' ? (
                            <>
                              <span className="log-entry__label">You</span>
                              <p>{entry.content}</p>
                            </>
                          ) : (
                            <>
                              <span className="log-entry__label">GM</span>
                              <p>{entry.narrative}</p>
                              <ul className="log-entry__summary">
                                {entry.facts.map((fact) => (
                                  <li key={fact}>{fact}</li>
                                ))}
                                <li>Actions remaining: {entry.actionsRemaining}</li>
                              </ul>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activePanel === 'xp' && (
                  <div className="panel">
                    <h3>Level {playerProfile.level}</h3>
                    <div className="progress-bar">
                      <div className="progress-bar__fill" style={{ width: `${xpProgress.percent}%` }} />
                    </div>
                    <p>{playerProfile.xp} / {playerProfile.xpToLevel} XP</p>
                    <p>{xpProgress.remaining} XP to Level {playerProfile.level + 1}</p>
                    <h4>Stats</h4>
                    <ul className="stats-grid">
                      {Object.entries(playerProfile.stats).map(([stat, value]) => (
                        <li key={stat}>
                          <span>{stat}</span>
                          <strong>{value}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {activePanel === 'inventory' && (
                  <div className="panel">
                    <h3>Carried Items</h3>
                    <ul className="inventory-detail">
                      {playerProfile.inventory.map((item) => (
                        <li key={item.name}>
                          <span className="inventory-detail__emoji">{item.emoji}</span>
                          <div>
                            <strong>{item.name}</strong>
                            <p>{item.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          {missionStatus !== 'progress' && (
            <div className="mission-complete">
              <div className="mission-complete__card">
                <h2>Mission Outcome</h2>
                <p className={`mission-complete__status mission-complete__status--${missionStatus}`}>
                  {missionStatus === 'success' && 'Success'}
                  {missionStatus === 'failure' && 'Failure'}
                  {missionStatus === 'death' && 'Death'}
                  {missionStatus === 'forfeit' && 'Forfeit'}
                </p>
                {missionStatus === 'success' ? (
                  <p>The dispatch is secured and the Commune endures another dawn.</p>
                ) : missionStatus === 'death' ? (
                  <p>Your run ends here. Another runner will carry the rumors of your stand.</p>
                ) : missionStatus === 'forfeit' ? (
                  <p>You survived at the cost of the contract. The safehouse scribe notes the failure.</p>
                ) : (
                  <p>The mission collapsed before the objective could be secured.</p>
                )}
                <button onClick={() => setSelectedMission(null)}>Return to Missions</button>
              </div>
            </div>
          )}

          {dangerContext && (
            <div className="fight-flight">
              <div className="fight-flight__card">
                <h2>Lethal Danger</h2>
                <p>{dangerContext.descriptor}</p>
                <div className="fight-flight__options">
                  <button onClick={() => handleDangerResolution('recover')}>Recover (1 action)</button>
                  <button onClick={() => handleDangerResolution('flee')}>Flee (forfeit)</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
