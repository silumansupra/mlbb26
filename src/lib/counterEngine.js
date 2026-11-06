import heroesData from '../data/heroes.json';
import itemsData from '../data/items.json';
import emblemsData from '../data/emblems.json';
import talentsData from '../data/talents.json';
import spellsData from '../data/spells.json';
import heroBuildsData from '../data/heroBuilds.json';
import winrateData from '../data/winrate.json';

export function getWinrateMetadata() {
  return winrateData?.metadata || {
    last_updated: '07 Nov 2026, 00:00 WIB',
    source: 'https://m.mobilelegends.com/rank',
    rank_scope: 'All Rank (Past 1 Day)'
  };
}

export function getHeroWinrate(heroName) {
  if (!heroName) return null;
  const clean = heroName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return winrateData?.heroes?.[clean] || null;
}

export function getAllWinrates() {
  return winrateData?.heroes || {};
}

// Archetype Tags for deeper contextual countering
export const HERO_TRAITS = {
  // Heavy CC / Hard Lockdown
  heavy_cc: [
    'Tigreal', 'Atlas', 'Chou', 'Akai', 'Guinevere', 'Badang', 'Franco', 'Kaja',
    'Khufra', 'Minotaur', 'Ruby', 'Lolita', 'Belerick', 'Gloo', 'Fredrinn', 'Arlott',
    'Edith', 'Jawhead', 'Nana', 'Selena', 'Johnson', 'Silvanna', 'Valir', 'Vexana', 'Aurora'
  ],
  // High Magic Burst
  magic_burst: [
    'Aamon', 'Harley', 'Eudora', 'Kadita', 'Aurora', 'Kagura', 'Lunox', 'Gusion',
    'Karina', 'Julian', 'Valentina', 'Xavier', 'Pharsa', 'Cecilion', 'Novaria', 'Vale'
  ],
  // Continuous Magic / Poke
  continuous_magic: [
    'Valir', "Chang'e", 'Yve', 'Kimmy', 'Gord', 'Zhask', 'Cyclops', 'Lylia', 'Alice'
  ],
  // High Regen / Spell Vamp / Sustain
  high_regen: [
    'Cici', 'Uranus', 'Estes', 'Floryn', 'Yu Zhong', 'Ruby', 'Esmeralda', 'Alucard',
    'Alpha', 'Alice', 'Terizla', 'Dyrroth', 'Khaleed', 'Thamuz', 'Barats', 'Hylos', 'Masha'
  ],
  // High Physical Burst / Assassination
  physical_burst: [
    'Badang', 'Aldous', 'Yin', 'Paquito', 'Saber', 'Hayabusa', 'Ling', 'Helcurt',
    'Natalia', 'Fanny', 'Brody', 'Clint', 'Lesley', 'Lancelot', 'Martis', 'Nolan', 'Suyou'
  ],
  // High Attack Speed / Crit Basic Attack
  attack_speed_crit: [
    'Miya', 'Moskov', 'Claude', 'Wanwan', 'Bruno', 'Irithel', 'Layla', 'Hanabi',
    'Roger', 'Sun', 'Zilong', 'Argus', 'Freya', 'Karrie', 'Natan', 'Beatrix', 'Melissa'
  ],
  // High HP / Tanky Frontline
  high_hp_tank: [
    'Barats', 'Fredrinn', 'Hylos', 'Tigreal', 'Belerick', 'Baxia', 'Minotaur',
    'Akai', 'Grock', 'Uranus', 'Gatotkaca', 'Johnson', 'Edith', 'Hilda'
  ],
  // Stealth / Camouflage
  stealth: [
    'Aamon', 'Natalia', 'Lesley', 'Miya'
  ],
  // High Mobility / Dash Spammers
  high_mobility: [
    'Fanny', 'Ling', 'Joy', 'Benedetta', 'Chou', 'Lancelot', 'Nolan', 'Harith', 'Wanwan', 'Cici', 'Sora'
  ]
};

// Hero Damage Classification
export const HERO_DAMAGE_TYPE = {
  magic: [
    'Aamon', 'Alice', 'Angela', 'Aurora', 'Baxia', 'Belerick', 'Carmilla', 'Cecilion',
    "Chang'e", 'Cyclops', 'Diggie', 'Esmeralda', 'Estes', 'Eudora', 'Faramis', 'Floryn',
    'Gatotkaca', 'Gloo', 'Gord', 'Guinevere', 'Gusion', 'Harith', 'Harley', 'Hylos',
    'Johnson', 'Joy', 'Julian', 'Kadita', 'Kagura', 'Kaja', 'Karina', 'Kimmy', 'Lolita',
    'Lunox', 'Luo Yi', 'Lylia', 'Mathilda', 'Minotaur', 'Natan', 'Nana', 'Novaria',
    'Odette', 'Pharsa', 'Phoveus', 'Rafaela', 'Selena', 'Silvanna', 'Uranus', 'Vale',
    'Valentina', 'Valir', 'Vexana', 'Xavier', 'Yve', 'Zhask', 'Zhuxin'
  ],
  true_damage: [
    'Karrie', 'Lesley', 'Alpha', 'X.Borg', 'Martis'
  ]
};

export const EARLY_GAME_HEROES = [
  'Selena', 'Franco', 'Hilda', 'Grock', 'Jawhead', 'Fanny', 'Martis', 'Dyrroth',
  'Thamuz', 'Valir', 'Luo Yi', 'Chou', 'Paquito', 'Mathilda', 'Joy', 'Nolan',
  'Yu Zhong', 'Terizla', 'Khaleed', 'Saber', 'Helcurt'
];

export const LATE_GAME_HEROES = [
  'Miya', 'Layla', 'Claude', 'Moskov', 'Wanwan', 'Lesley', 'Cecilion', 'Aldous',
  'Aulus', 'Xavier', 'Lunox', 'Natan', 'Irithel', 'Hanabi', 'Bruno', 'Melissa',
  'Karrie', 'Alice'
];

// Lane mapping normalization
export function normalizeLane(hero) {
  const laning = (hero.laning || []).join(', ').toLowerCase();
  const cls = (hero.class || '').toLowerCase();

  if (laning.includes('gold') || cls.includes('marksman')) return 'Gold Lane';
  if (laning.includes('exp') || cls.includes('fighter')) return 'EXP Lane';
  if (laning.includes('mid') || cls.includes('mage')) return 'Mid Lane';
  if (laning.includes('roam') || cls.includes('tank') || cls.includes('support')) return 'Roam';
  if (laning.includes('jungle') || cls.includes('assassin')) return 'Jungle';
  return 'Flexible';
}

// Map hero ID to Hero Name
const idToHeroMap = new Map();
const nameToHeroMap = new Map();
heroesData.forEach(h => {
  if (h.mlid) idToHeroMap.set(parseInt(h.mlid), h);
  nameToHeroMap.set(h.hero_name.toLowerCase(), h);
});

export function getHeroByName(name) {
  if (!name) return null;
  return nameToHeroMap.get(name.toLowerCase()) || null;
}

export function getAllHeroes() {
  return heroesData;
}

export function getAllItems() {
  return itemsData;
}

export function getAllSpells() {
  return spellsData;
}

export function getAllEmblems() {
  return emblemsData;
}

export function getAllTalents() {
  return talentsData;
}

export function getItemByName(name) {
  if (!name) return null;
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.includes('haas')) {
    return itemsData.find(i => i.item_name.toLowerCase().includes('haas')) || null;
  }
  return itemsData.find(i => i.item_name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean) || null;
}

export function getItemIcon(name) {
  if (!name) return '/items/dagger.png';
  if (name.toLowerCase().includes('haas')) return '/items/haas_claws.png';
  const item = getItemByName(name);
  if (item && item.icon) return item.icon;
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `/items/${slug}.png`;
}

export function getSpellByNameOrId(nameOrId) {
  if (!nameOrId) return null;
  const clean = nameOrId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return spellsData.find(s => 
    s.id.toLowerCase().replace(/[^a-z0-9]/g, '') === clean || 
    s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  ) || null;
}

export function getSpellIcon(nameOrId) {
  const spell = getSpellByNameOrId(nameOrId);
  if (spell && spell.icon) return spell.icon;
  if (!nameOrId) return '/spells/flicker.png';
  const slug = nameOrId.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `/spells/${slug}.png`;
}

export function getEmblemByName(name) {
  if (!name) return null;
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return emblemsData.find(e => 
    e.emblem_name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
    e.emblem_role.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
    ('custom' + e.emblem_role.toLowerCase()).replace(/[^a-z0-9]/g, '') === clean
  ) || null;
}

export function getEmblemIcon(name) {
  const emblem = getEmblemByName(name);
  if (emblem && emblem.icon) return emblem.icon;
  return '/emblems/basic-common.webp';
}

export function getTalentByIdOrName(key) {
  if (!key) return null;
  const clean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const tier of ['tier1', 'tier2', 'tier3']) {
    const list = talentsData[tier] || [];
    const found = list.find(t => 
      t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
    );
    if (found) return found;
  }
  return null;
}

export function getTalentIcon(key) {
  const talent = getTalentByIdOrName(key);
  if (talent && talent.icon) return talent.icon;
  return '/talents/thrill.webp';
}

export function getHeroBuild(heroName) {
  if (!heroName) return null;
  return heroBuildsData[heroName.toLowerCase()] || null;
}

// 1. Analyze Threats from Enemy Team
export function analyzeEnemyThreats(enemyHeroes) {
  if (!enemyHeroes || enemyHeroes.length === 0) return [];
  const threats = [];

  // 0. High Meta Threat Detection (Power picks / High WR / High Banrate)
  const metaThreatHeroes = enemyHeroes.map(h => {
    const wr = getHeroWinrate(h.hero_name);
    return wr ? { hero: h, wr } : null;
  }).filter(x => x && (x.wr.winrate_num >= 55.0 || x.wr.banrate_num >= 20.0 || x.wr.tier === 'S+'));

  if (metaThreatHeroes.length > 0) {
    threats.push({
      id: 'meta_threat',
      level: 'CRITICAL',
      title: 'High Meta & Power Pick Alert',
      heroes: metaThreatHeroes.map(t => `${t.hero.hero_name} (WR ${t.wr.winrate}, Ban ${t.wr.banrate})`),
      advice: 'Musuh mengamankan hero meta/power-pick dengan winrate atau banrate tinggi di patch ini. Disiplin positioning, batasi ruang farming mereka, dan amankan item counter utama.',
      recommendedItems: ['Dominance Ice', 'Sea Halberd', "Athena's Shield", 'Antique Cuirass']
    });
  }

  const checkCount = (tag) => {
    return enemyHeroes.filter(h => HERO_TRAITS[tag]?.includes(h.hero_name));
  };

  const heavyCcList = checkCount('heavy_cc');
  if (heavyCcList.length > 0) {
    threats.push({
      id: 'heavy_cc',
      level: heavyCcList.length >= 2 ? 'CRITICAL' : 'HIGH',
      title: 'Crowd Control & Lock Rantai',
      heroes: heavyCcList.map(h => h.hero_name),
      advice: 'Bawa Battle Spell PURIFY atau Flicker. Beli Tough Boots untuk memotong durasi stun sebesar 30%.',
      recommendedSpell: 'purify',
      recommendedItems: ['Tough Boots']
    });
  }

  const magicBurstList = checkCount('magic_burst');
  if (magicBurstList.length > 0) {
    threats.push({
      id: 'magic_burst',
      level: 'HIGH',
      title: 'Magic Burst Damage (One-Shot)',
      heroes: magicBurstList.map(h => h.hero_name),
      advice: "Wajib beli Athena's Shield (mengurangi magic burst 25% selama 3 detik) atau Rose Gold Meteor untuk MM.",
      recommendedItems: ["Athena's Shield", "Rose Gold Meteor"]
    });
  }

  const continuousMagicList = checkCount('continuous_magic');
  if (continuousMagicList.length > 0) {
    threats.push({
      id: 'continuous_magic',
      level: 'MEDIUM',
      title: 'Continuous Magic Poke',
      heroes: continuousMagicList.map(h => h.hero_name),
      advice: 'Beli Radiant Armor untuk menumpuk Magic Damage Reduction hingga 6 stack saat terkena magic berkelanjutan.',
      recommendedItems: ['Radiant Armor']
    });
  }

  const highRegenList = checkCount('high_regen');
  if (highRegenList.length > 0) {
    threats.push({
      id: 'high_regen',
      level: 'CRITICAL',
      title: 'High Regen / Lifesteal / Spell Vamp',
      heroes: highRegenList.map(h => h.hero_name),
      advice: 'Prioritaskan Anti-Heal di item ke-1 atau ke-2: Sea Halberd (Fisik/MM), Dominance Ice (Tank/EXP), atau Glowing Wand (Mage).',
      recommendedItems: ['Sea Halberd', 'Dominance Ice', 'Glowing Wand']
    });
  }

  const physicalBurstList = checkCount('physical_burst');
  if (physicalBurstList.length > 0) {
    threats.push({
      id: 'physical_burst',
      level: 'HIGH',
      title: 'Physical Burst & Assassin Ganker',
      heroes: physicalBurstList.map(h => h.hero_name),
      advice: 'Marksman wajib beli Wind of Nature (WoN) untuk 2 detik kebal fisik. Tank/Fighter gunakan Antique Cuirass.',
      recommendedItems: ['Wind of Nature', 'Antique Cuirass']
    });
  }

  const atkSpeedList = checkCount('attack_speed_crit');
  if (atkSpeedList.length > 0) {
    threats.push({
      id: 'attack_speed_crit',
      level: 'MEDIUM',
      title: 'High Attack Speed & Crit DPS',
      heroes: atkSpeedList.map(h => h.hero_name),
      advice: 'Dominance Ice memotong Attack Speed musuh sebesar 70% base. Blade Armor memantulkan 30% basic attack & meredam 20% crit damage.',
      recommendedItems: ['Blade Armor', 'Dominance Ice', 'Wind of Nature']
    });
  }

  const highHpList = checkCount('high_hp_tank');
  if (highHpList.length >= 2) {
    threats.push({
      id: 'high_hp_tank',
      level: 'HIGH',
      title: 'Frontline Tebal / High HP Comps',
      heroes: highHpList.map(h => h.hero_name),
      advice: 'Beli Demon Hunter Sword (DHS) + Malefic Roar untuk hero physical, atau Wishing Lantern + Divine Glaive untuk hero magic.',
      recommendedItems: ['Demon Hunter Sword', 'Malefic Roar', 'Wishing Lantern', 'Divine Glaive']
    });
  }

  const stealthList = checkCount('stealth');
  if (stealthList.length > 0) {
    threats.push({
      id: 'stealth',
      level: 'MEDIUM',
      title: 'Stealth & Camouflage Flankers',
      heroes: stealthList.map(h => h.hero_name),
      advice: 'Gunakan skill area untuk mengecek semak dan membatalkan kamuflase musuh sebelum mereka mendekat.',
      recommendedItems: ["Athena's Shield", 'Antique Cuirass']
    });
  }

  const highMobilityList = checkCount('high_mobility');
  if (highMobilityList.length >= 2) {
    threats.push({
      id: 'high_mobility',
      level: 'HIGH',
      title: 'High Mobility / Dash Spammers',
      heroes: highMobilityList.map(h => h.hero_name),
      advice: 'Gunakan hero dengan efek Knock-up, Grounded, atau Suppression (Khufra, Phoveus, Minsitthar, Kaja, Franco).',
      recommendedItems: ['Corrosion Scythe', 'Ice Queen Wand']
    });
  }

  return threats;
}

// 2. Score & Recommend Best Counters vs Enemy Team
export function calculateCounterRecommendations(enemyHeroes, myHeroes = []) {
  if (!enemyHeroes || enemyHeroes.length === 0) return [];

  const myHeroNames = new Set(myHeroes.map(h => h.hero_name.toLowerCase()));
  const enemyHeroNames = new Set(enemyHeroes.map(h => h.hero_name.toLowerCase()));

  const recommendations = [];

  heroesData.forEach(candidate => {
    // Skip if already in my team or enemy team
    if (myHeroNames.has(candidate.hero_name.toLowerCase())) return;
    if (enemyHeroNames.has(candidate.hero_name.toLowerCase())) return;

    let score = 0;
    const reasons = [];

    // Analyze vs each enemy hero
    enemyHeroes.forEach(enemy => {
      // 1. Direct weak_against in enemy relations
      const weakHeroids = enemy.relations?.weak_against?.heroids || [];
      if (candidate.mlid && weakHeroids.includes(parseInt(candidate.mlid))) {
        score += 35;
        reasons.push(`Direct Counter resmi vs ${enemy.hero_name} (${enemy.relations.weak_against.description.split('.')[0]})`);
      }

      // 2. Direct counters list in candidate
      const candidateCounters = (candidate.counters || []).map(c => c.heroname.toLowerCase());
      if (candidateCounters.includes(enemy.hero_name.toLowerCase())) {
        score += 30;
        reasons.push(`Unggul statistik vs ${enemy.hero_name}`);
      }

      // 3. Candidate relations strong_against
      const strongHeroids = candidate.relations?.strong_against?.heroids || [];
      if (enemy.mlid && strongHeroids.includes(parseInt(enemy.mlid))) {
        score += 35;
        reasons.push(`Keahlian spesifik mengungguli ${enemy.hero_name}`);
      }

      // 4. Enemy relations strong_against (candidate is weak against enemy)
      const enemyStrong = enemy.relations?.strong_against?.heroids || [];
      if (candidate.mlid && enemyStrong.includes(parseInt(candidate.mlid))) {
        score -= 25;
      }
    });

    // 5. Special Archetype Counters
    const hasHeavyCc = enemyHeroes.some(h => HERO_TRAITS.heavy_cc.includes(h.hero_name));
    if (hasHeavyCc && candidate.hero_name === 'Diggie') {
      score += 45;
      reasons.push('Ultimate Time Journey memberikan anti-CC massal terhadap kombo CC musuh.');
    }

    const hasRegen = enemyHeroes.some(h => HERO_TRAITS.high_regen.includes(h.hero_name));
    if (hasRegen && candidate.hero_name === 'Baxia') {
      score += 40;
      reasons.push('Pasif Baxia memotong efek regen/shield musuh secara natural sejak level 1.');
    }

    const hasTanks = enemyHeroes.filter(h => HERO_TRAITS.high_hp_tank.includes(h.hero_name)).length >= 2;
    if (hasTanks) {
      if (candidate.hero_name === 'Karrie') {
        score += 40;
        reasons.push('True Damage persentase Max HP menghancurkan tank musuh tanpa ampun.');
      }
      if (candidate.hero_name === 'Lunox') {
        score += 35;
        reasons.push('Chaos Assault menghasilkan damage magic % HP yang tembus armor tank.');
      }
    }

    const hasMobility = enemyHeroes.filter(h => HERO_TRAITS.high_mobility.includes(h.hero_name)).length >= 2;
    if (hasMobility) {
      if (['Khufra', 'Minsitthar', 'Phoveus'].includes(candidate.hero_name)) {
        score += 40;
        reasons.push('Mengunci dan menghentikan hero musuh yang lincah/sering dash.');
      }
    }

    const hasAtkSpeed = enemyHeroes.some(h => HERO_TRAITS.attack_speed_crit.includes(h.hero_name));
    if (hasAtkSpeed && candidate.hero_name === 'Belerick') {
      score += 30;
      reasons.push('Memantulkan serangan basic attack cepat dari MM musuh.');
    }

    // Synergies with My Team
    myHeroes.forEach(myHero => {
      const synergyHeroids = myHero.relations?.synergy?.heroids || [];
      if (candidate.mlid && synergyHeroids.includes(parseInt(candidate.mlid))) {
        score += 15;
        reasons.push(`Sinergi kuat dengan teman satu tim (${myHero.hero_name})`);
      }
    });

    // 6. Meta Winrate & Tier Weighting
    const wr = getHeroWinrate(candidate.hero_name);
    if (wr) {
      // Score bonus: +2.5 per 1% above 50% WR, or penalty if below 50%
      const wrDelta = Math.round((wr.winrate_num - 50) * 2.5);
      score += wrDelta;

      if (wr.tier === 'S+') {
        score += 12;
        reasons.push(`Meta Tier S+ (${wr.winrate} WR, ${wr.banrate} Ban)`);
      } else if (wr.tier === 'S' && wr.winrate_num >= 53.5) {
        score += 6;
        reasons.push(`Meta Tier S (${wr.winrate} WR)`);
      }
    }

    if (score > 10) {
      recommendations.push({
        hero: candidate,
        score,
        lane: normalizeLane(candidate),
        winrate: wr ? wr.winrate : null,
        winrate_num: wr ? wr.winrate_num : null,
        banrate: wr ? wr.banrate : null,
        pickrate: wr ? wr.pickrate : null,
        tier: wr ? wr.tier : null,
        reasons: Array.from(new Set(reasons)).slice(0, 3)
      });
    }
  });

  return recommendations.sort((a, b) => b.score - a.score);
}

// 3. Adaptive Build, Emblem, Spell Guide for a Chosen Hero vs Enemy Team
export function getHeroMatchupGuide(hero, enemyHeroes = []) {
  if (!hero) return null;

  const threats = analyzeEnemyThreats(enemyHeroes);
  const heroName = hero.hero_name;
  const baseBuild = heroBuildsData[heroName.toLowerCase()] || heroBuildsData['clint'];

  const hasHeavyCc = threats.some(t => t.id === 'heavy_cc');
  const hasAamon = enemyHeroes.some(h => h.hero_name === 'Aamon');
  const hasTigreal = enemyHeroes.some(h => h.hero_name === 'Tigreal');
  const hasBadang = enemyHeroes.some(h => h.hero_name === 'Badang');
  const hasRegen = threats.some(t => t.id === 'high_regen');
  const hasMagicBurst = threats.some(t => t.id === 'magic_burst');
  const hasPhysicalBurst = threats.some(t => t.id === 'physical_burst');

  // A. BATTLE SPELL SELECTION (Hero Primary vs Matchup Situational)
  let spell = { ...baseBuild.spells.primary };
  if ((hasHeavyCc || hasBadang || hasTigreal) && baseBuild.spells.situational?.name === 'Purify') {
    spell = {
      name: 'Purify',
      reason: `Sangat direkomendasikan vs musuh saat ini: Menghindari sedotan Tigreal dan jebakan tembok Badang!`
    };
  } else if (hasMagicBurst && baseBuild.spells.situational?.name === 'Flicker') {
    spell = { ...baseBuild.spells.situational };
  }

  // B. EMBLEM & TALENTS SETUP
  const emblem = {
    name: baseBuild.emblem.base,
    rationale: baseBuild.emblem.rationale,
    tier1: `${baseBuild.emblem.tier1.name} (${baseBuild.emblem.tier1.desc})`,
    tier2: `${baseBuild.emblem.tier2.name} (${baseBuild.emblem.tier2.desc})`,
    tier3: `${baseBuild.emblem.tier3.name} (${baseBuild.emblem.tier3.desc})`
  };

  // C. ADAPTIVE 6-ITEM BUILD
  // Start with the hero's 6 tailored core items
  const items = baseBuild.items.core.map(item => ({
    name: item.name,
    reason: item.desc,
    isCounter: false
  }));

  // Apply dynamic reactive substitutions based on enemy threats
  if (baseBuild.items.counter_substitutions) {
    baseBuild.items.counter_substitutions.forEach(sub => {
      let shouldApply = false;
      if (sub.trigger === 'magic_burst' && hasMagicBurst) shouldApply = true;
      if (sub.trigger === 'high_regen' && hasRegen) shouldApply = true;
      if (sub.trigger === 'continuous_magic' && threats.some(t => t.id === 'continuous_magic')) shouldApply = true;
      if (sub.trigger === 'physical_burst' && hasPhysicalBurst) shouldApply = true;

      if (shouldApply) {
        // Find index of item to replace
        let replaceIdx = items.findIndex(i => i.name === sub.replaces);
        if (replaceIdx === -1 && items.length >= 5) {
          replaceIdx = 4; // replace slot 5
        }
        if (replaceIdx !== -1 && !items.some(i => i.name === sub.name)) {
          items[replaceIdx] = {
            name: sub.name,
            reason: sub.reason,
            isCounter: true
          };
        }
      }
    });
  }

  // If heavy CC present and slot 1 is boots, emphasize Tough Boots
  if (hasHeavyCc && items[0] && items[0].name.includes('Boots') && items[0].name !== 'Tough Boots') {
    items[0] = {
      name: 'Tough Boots',
      reason: 'Wajib vs CC musuh: Memotong durasi stun dan debuff sebesar 30%.',
      isCounter: true
    };
  }

  // D. TACTICAL DIRECTIVES (Combine hero base tips + match specific warnings)
  const tips = [...(baseBuild.gameplay_tips || [])];
  if (hasAamon) {
    tips.push('WASPADA AAMON: Ulti pecahan pisaunya bersifat Execute saat darah di bawah 50%. Selesaikan Athena\'s Shield sesegera mungkin.');
  }
  if (hasTigreal) {
    tips.push('SPACING TIGREAL: Jangan berkumpul rapat dengan rekan setim agar tidak tersedot bersamaan oleh Flicker-Ultimate Tigreal.');
  }
  if (hasBadang) {
    tips.push('ZONING BADANG: Hindari lorong sempit dekat tebing/dinding agar tidak terkena knockback stun beruntun.');
  }
  if (hasRegen) {
    tips.push('ANTI-HEAL PRIORITY: Amankan item Anti-Heal sebelum memasuki teamfight perebutan Lord.');
  }

  return {
    hero,
    playstyle: baseBuild.playstyle,
    battleSpell: spell,
    allSpells: baseBuild.spells,
    emblem,
    build: items.slice(0, 6),
    threats,
    tips
  };
}

// 4. Team Composition & Balance Analyzer
export function analyzeTeamComposition(teamHeroes) {
  const activeHeroes = (teamHeroes || []).filter(Boolean);
  if (activeHeroes.length === 0) return null;

  let physicalCount = 0;
  let magicCount = 0;
  let trueDamageCount = 0;

  let frontlineCount = 0;
  let ccCount = 0;
  let earlyGameCount = 0;
  let lateGameCount = 0;

  activeHeroes.forEach(hero => {
    const name = hero.hero_name;
    const cls = (hero.class || '').toLowerCase();

    if (HERO_DAMAGE_TYPE.true_damage.includes(name)) {
      trueDamageCount += 1;
      physicalCount += 0.5;
    } else if (HERO_DAMAGE_TYPE.magic.includes(name)) {
      magicCount += 1;
    } else {
      physicalCount += 1;
    }

    if (
      cls.includes('tank') ||
      HERO_TRAITS.high_hp_tank.includes(name) ||
      ['Terizla', 'Yu Zhong', 'Ruby', 'Thamuz', 'Hilda', 'Fredrinn', 'Barats', 'Edith', 'Masha'].includes(name)
    ) {
      frontlineCount += 1;
    }

    if (HERO_TRAITS.heavy_cc.includes(name)) {
      ccCount += 1;
    }

    if (EARLY_GAME_HEROES.includes(name)) earlyGameCount += 1;
    if (LATE_GAME_HEROES.includes(name)) lateGameCount += 1;
  });

  const totalDmgWeight = (physicalCount + magicCount + trueDamageCount) || 1;
  const physPct = Math.round((physicalCount / totalDmgWeight) * 100);
  const magicPct = Math.round((magicCount / totalDmgWeight) * 100);
  const truePct = Math.max(0, 100 - physPct - magicPct);

  const warnings = [];
  const strengths = [];

  if (activeHeroes.length >= 3) {
    if (magicCount === 0) {
      warnings.push({
        id: 'no_magic',
        severity: 'CRITICAL',
        title: '100% Physical Damage (Tanpa Magic)',
        description: 'Musuh sangat mudah stacking armor (Blade Armor + Antique Cuirass). Pertimbangkan menambah Mage/Magic dealer!'
      });
    } else if (physicalCount === 0 && activeHeroes.length >= 4) {
      warnings.push({
        id: 'no_physical',
        severity: 'CRITICAL',
        title: '100% Magic Damage (Tanpa Fisik)',
        description: "Lawan cukup membeli Athena's Shield + Radiant Armor untuk meredam hampir seluruh damage tim."
      });
    }

    if (frontlineCount === 0 && activeHeroes.length >= 3) {
      warnings.push({
        id: 'no_frontline',
        severity: 'HIGH',
        title: 'Tanpa Frontline / Badan Tebal',
        description: 'Seluruh anggota tim squishy. Sangat rentan di-dive oleh Assassin atau ditarik inisiator lawan.'
      });
    }

    if (ccCount === 0 && activeHeroes.length >= 3) {
      warnings.push({
        id: 'no_cc',
        severity: 'HIGH',
        title: 'Minim Crowd Control (Hard Stun)',
        description: 'Tidak ada hard stun / lock rantai untuk menghentikan hero lincah (Fanny, Ling, Joy, Harith).'
      });
    }

    if (lateGameCount >= 3) {
      warnings.push({
        id: 'heavy_late',
        severity: 'MEDIUM',
        title: 'Komposisi Sangat Late Game',
        description: 'Early game (menit 1-6) lemah. Main aman dan jangan terburu-buru kontes objektif berisiko.'
      });
    } else if (earlyGameCount >= 3 && lateGameCount === 0 && activeHeroes.length >= 4) {
      warnings.push({
        id: 'heavy_early',
        severity: 'MEDIUM',
        title: 'Komposisi Early Rush',
        description: 'Harus mendominasi dan akhiri sebelum menit 14 sebelum scaling hero musuh melampaui tim.'
      });
    }
  }

  if (magicCount >= 1 && physicalCount >= 1) {
    strengths.push('Damage Hybrid Seimbang (Fisik + Magic)');
  }
  if (frontlineCount >= 1 && ccCount >= 1) {
    strengths.push('Setup Frontline & Inisiasi CC Solid');
  }
  if (activeHeroes.length === 5 && warnings.length === 0) {
    strengths.push('Komposisi Ideal Siap Tempur!');
  }

  return {
    heroCount: activeHeroes.length,
    damageSplit: {
      physical: physPct,
      magic: magicPct,
      trueDamage: truePct
    },
    frontlineCount,
    ccCount,
    earlyGameCount,
    lateGameCount,
    warnings,
    strengths
  };
}

// 5. 1v1 Laning Matchup Guide
export function getLaneMatchup(allyHero, enemyHero, lane = 'Gold Lane') {
  if (!allyHero || !enemyHero) return null;

  const allyName = allyHero.hero_name;
  const enemyName = enemyHero.hero_name;

  let advantage = 'EVEN'; // 'ADVANTAGE' | 'EVEN' | 'DISADVANTAGE'
  let score = 0;
  const analysisPoints = [];

  // 1. Direct counter relationship check
  const allyWeakAgainst = (allyHero.relations?.weak_against?.heroids || []);
  const allyStrongAgainst = (allyHero.relations?.strong_against?.heroids || []);
  const enemyWeakAgainst = (enemyHero.relations?.weak_against?.heroids || []);
  const enemyStrongAgainst = (enemyHero.relations?.strong_against?.heroids || []);

  if (allyHero.mlid && enemyWeakAgainst.includes(parseInt(allyHero.mlid))) {
    score += 3;
    analysisPoints.push(`${allyName} adalah counter resmi dari ${enemyName}.`);
  }
  if (enemyHero.mlid && allyStrongAgainst.includes(parseInt(enemyHero.mlid))) {
    score += 2;
    analysisPoints.push(`Keahlian spesifik ${allyName} mengungguli ${enemyName}.`);
  }
  if (enemyHero.mlid && allyWeakAgainst.includes(parseInt(enemyHero.mlid))) {
    score -= 3;
    analysisPoints.push(`${allyName} lemah secara alami berhadapan dengan ${enemyName}.`);
  }
  if (allyHero.mlid && enemyStrongAgainst.includes(parseInt(allyHero.mlid))) {
    score -= 2;
    analysisPoints.push(`${enemyName} memiliki kit yang menekan ${allyName}.`);
  }

  // 2. Early Level 1-3 Power Spike Evaluation
  const allyIsEarly = EARLY_GAME_HEROES.includes(allyName);
  const enemyIsEarly = EARLY_GAME_HEROES.includes(enemyName);
  const allyIsLate = LATE_GAME_HEROES.includes(allyName);
  const enemyIsLate = LATE_GAME_HEROES.includes(enemyName);

  let earlySpikeVerdict = '';
  if (allyIsEarly && !enemyIsEarly) {
    score += 2;
    earlySpikeVerdict = `${allyName} memiliki keunggulan power spike kuat di Level 1-3. Main agresif dan tekan minion gold!`;
  } else if (!allyIsEarly && enemyIsEarly) {
    score -= 2;
    earlySpikeVerdict = `Waspada! ${enemyName} sangat berbahaya di Level 1-3. Jangan adu trade pukulan langsung sebelum punya skill kabur.`;
  } else if (allyIsLate && !enemyIsLate) {
    earlySpikeVerdict = `${allyName} butuh farming item core. Fokus last-hit minion dan amankan siege minion di bawah tower.`;
  } else {
    earlySpikeVerdict = `Kekuatan Level 1-3 relatif seimbang. Pemenang laning ditentukan oleh spacing dan positioning.`;
  }

  // 3. Recommended Wave Strategy
  let waveStrategy = 'POKE_AND_BAIT';
  let strategyText = '';

  if (score > 1) {
    advantage = 'ADVANTAGE';
    waveStrategy = 'FAST_CLEAR_ROTATE';
    strategyText = `Manfaatkan dominasi laning: Habisi minion cepat, cicil HP ${enemyName}, lalu segera rotasi bantu Turtle / Mid.`;
  } else if (score < -1) {
    advantage = 'DISADVANTAGE';
    waveStrategy = 'FREEZE_WAVE';
    strategyText = `Tahan minion dekat tower Anda (Freeze Wave). Jangan overextend dan tunggu roamer/jungler melakukan gank.`;
  } else {
    advantage = 'EVEN';
    waveStrategy = 'POKE_AND_BAIT';
    strategyText = `Fokus poke dari jarak aman saat ${enemyName} mengambil last-hit minion. Hindari commit all-in tanpa info posisi roamer musuh.`;
  }

  return {
    ally: allyHero,
    enemy: enemyHero,
    lane,
    advantage,
    score,
    earlySpikeVerdict,
    waveStrategy,
    strategyText,
    analysisPoints
  };
}

// 6. Interactive Situational Item Swap Simulator
export const SITUATIONAL_ITEM_TRIGGERS = [
  {
    id: 'athena_shield',
    name: "Musuh Beli Athena's Shield",
    icon: '/items/athenas_shield.png',
    description: 'Musuh memperoleh 25% Magic Damage Reduction selama 3 detik.',
    appliesTo: ['Mage', 'Assassin', 'Marksman'],
    suggestion: {
      swapIn: 'Divine Glaive',
      replaces: 'Genius Wand',
      reason: "Magic RES tebal dari Athena membuat flat PEN Genius Wand tidak efektif. Divine Glaive memberi +40% Magic PEN persentase untuk menembus shield."
    }
  },
  {
    id: 'radiant_armor',
    name: 'Musuh Beli Radiant Armor',
    icon: '/items/radiant_armor.png',
    description: 'Musuh meredam Magic Damage bertahap (continuous poke) hingga 6 stack.',
    appliesTo: ['Mage'],
    suggestion: {
      swapIn: 'Holy Crystal',
      replaces: 'Glowing Wand',
      reason: "Glowing Wand memicu stack Radiant musuh makin tebal. Ganti ke Raw Magic Power tinggi (Holy Crystal / Blood Wings) untuk one-shot burst."
    }
  },
  {
    id: 'blade_armor',
    name: 'Musuh Beli Blade Armor',
    icon: '/items/blade_armor.png',
    description: 'Musuh memantulkan 30% Basic Attack fisik dan meredam 20% Critical Damage.',
    appliesTo: ['Marksman', 'Fighter', 'Assassin'],
    suggestion: {
      swapIn: 'Demon Hunter Sword',
      replaces: "Berserker's Fury",
      reason: "Blade Armor meng-counter Critical build. Ganti dengan Demon Hunter Sword (DHS) + Malefic Roar untuk True % Current HP damage."
    }
  },
  {
    id: 'high_regen_enemy',
    name: 'Musuh High Regen / Estes / Floryn',
    icon: '/items/sea_halberd.png',
    description: 'Regen dan lifesteal musuh terlalu deras di setiap teamfight.',
    appliesTo: ['Marksman', 'Fighter', 'Mage', 'Tank'],
    suggestion: {
      swapIn: 'Sea Halberd',
      replaces: 'Slot Item 2 / 3',
      reason: "Wajib percepat item Anti-Heal (Sea Halberd / Dominance Ice / Glowing Wand) memotong 50% HP regen musuh seketika."
    }
  },
  {
    id: 'wind_of_nature',
    name: 'Musuh Beli Wind of Nature (WoN)',
    icon: '/items/wind_of_nature.png',
    description: 'Marksman musuh memiliki kekebalan Physical Damage selama 2 detik penuh.',
    appliesTo: ['Marksman', 'Assassin'],
    suggestion: {
      swapIn: 'Rose Gold Meteor',
      replaces: 'Boots / Late Item',
      reason: "Jangan buang skill pamungkas saat WoN menyala. Siapkan Rose Gold Meteor untuk shield darurat saat terkena trade balik."
    }
  },
  {
    id: 'immortality_switch',
    name: 'Cadangan Late-Game (Winter / Immortality)',
    icon: '/items/immortality.png',
    description: 'Situasi late game perebutan Lord krusial (menit 15+).',
    appliesTo: ['All'],
    suggestion: {
      swapIn: 'Winter Crown',
      replaces: 'Immortality (setelah pecah)',
      reason: "Trik pro: Setelah pasif Immortality pecah (cooldown 210 detik), jual dan langsung beli Winter Crown untuk 2 detik invulnerable tambahan!"
    }
  }
];

export function getSituationalSwaps(hero) {
  if (!hero) return SITUATIONAL_ITEM_TRIGGERS;
  const cls = (hero.class || '').toLowerCase();
  return SITUATIONAL_ITEM_TRIGGERS.filter(trigger => {
    if (trigger.appliesTo.includes('All')) return true;
    return trigger.appliesTo.some(c => cls.includes(c.toLowerCase()));
  });
}
