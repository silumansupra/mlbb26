import heroesData from '../data/heroes.json';
import itemsData from '../data/items.json';
import emblemsData from '../data/emblems.json';
import talentsData from '../data/talents.json';
import spellsData from '../data/spells.json';

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
    'Fanny', 'Ling', 'Joy', 'Benedetta', 'Chou', 'Lancelot', 'Nolan', 'Harith', 'Wanwan', 'Cici'
  ]
};

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

// 1. Analyze Threats from Enemy Team
export function analyzeEnemyThreats(enemyHeroes) {
  if (!enemyHeroes || enemyHeroes.length === 0) return [];
  const threats = [];

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
    // Diggie vs Heavy CC
    const hasHeavyCc = enemyHeroes.some(h => HERO_TRAITS.heavy_cc.includes(h.hero_name));
    if (hasHeavyCc && candidate.hero_name === 'Diggie') {
      score += 45;
      reasons.push('Ultimate Time Journey memberikan anti-CC massal terhadap kombo CC musuh.');
    }

    // Baxia vs High Regen
    const hasRegen = enemyHeroes.some(h => HERO_TRAITS.high_regen.includes(h.hero_name));
    if (hasRegen && candidate.hero_name === 'Baxia') {
      score += 40;
      reasons.push('Pasif Baxia memotong efek regen/shield musuh secara natural sejak level 1.');
    }

    // Karrie / Lunox vs High HP tanks
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

    // Khufra / Minsitthar / Phoveus vs Dash Spammers
    const hasMobility = enemyHeroes.filter(h => HERO_TRAITS.high_mobility.includes(h.hero_name)).length >= 2;
    if (hasMobility) {
      if (['Khufra', 'Minsitthar', 'Phoveus'].includes(candidate.hero_name)) {
        score += 40;
        reasons.push('Mengunci dan menghentikan hero musuh yang lincah/sering dash.');
      }
    }

    // Belerick / Lolita vs Attack Speed & Projectile
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

    if (score > 10) {
      recommendations.push({
        hero: candidate,
        score,
        lane: normalizeLane(candidate),
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
  const heroClass = (hero.class || '').toLowerCase();
  const heroName = hero.hero_name;

  // A. BATTLE SPELL RECOMMENDATION
  let spell = { id: 'flicker', name: 'Flicker', reason: 'Universal untuk reposisi, kejar musuh, atau kabur.' };
  
  const hasHeavyCc = threats.some(t => t.id === 'heavy_cc');
  const hasAamon = enemyHeroes.some(h => h.hero_name === 'Aamon');
  const hasTigreal = enemyHeroes.some(h => h.hero_name === 'Tigreal');
  const hasBadang = enemyHeroes.some(h => h.hero_name === 'Badang');

  if (hero.laning?.join(', ').toLowerCase().includes('jungle')) {
    spell = { id: 'retribution', name: 'Retribution', reason: 'Wajib untuk Jungler mengamankan buff, Turtle, dan Lord.' };
  } else if (hasHeavyCc || hasBadang || hasTigreal) {
    if (heroClass.includes('marksman') || heroClass.includes('mage') || ['Clint', 'Brody', 'Moskov', 'Layla', 'Miya'].includes(heroName)) {
      spell = {
        id: 'purify',
        name: 'Purify',
        reason: 'Sangat direkomendasikan! Melepaskan sedotan Tigreal, dinding Badang, dan rantai CC agar tidak mati sia-sia.'
      };
    }
  } else if (heroClass.includes('tank') || ['Ruby', 'Terizla', 'Gatotkaca', 'Belerick'].includes(heroName)) {
    spell = { id: 'vengeance', name: 'Vengeance', reason: 'Menyerap 35% damage dan memantulkannya kembali ke penyerang.' };
  } else if (heroClass.includes('mage')) {
    spell = { id: 'flameshot', name: 'Flameshot', reason: 'Menembak musuh sekarat dari jauh dan knockback saat disergap.' };
  }

  // B. EMBLEM & TALENTS SETUP
  let baseEmblem = 'Common';
  let tier1 = 'Swift';
  let tier2 = 'Bargain Hunter';
  let tier3 = 'Quantum Charge';
  let emblemRationale = '';

  if (heroClass.includes('marksman')) {
    if (['Clint', 'Brody', 'Lesley', 'Beatrix'].includes(heroName)) {
      baseEmblem = 'Assassin';
      tier1 = 'Rupture (+5 Adaptive Penetration)';
      tier2 = 'Weapons Master (+5% Extra Attack)';
      tier3 = 'Quantum Charge (HP Heal & 40% Movement Speed saat Basic Attack)';
      emblemRationale = 'Mengoptimalkan burst damage & penetration awal, dipadu Quantum Charge untuk kiting lincah.';
    } else {
      baseEmblem = 'Marksman';
      tier1 = 'Fatal (+5% Crit Chance & +10% Crit DMG)';
      tier2 = 'Bargain Hunter (Diskon 5% harga item)';
      tier3 = 'Quantum Charge (Heal & Movement Speed) atau Weakness Finder';
      emblemRationale = 'Fokus pada percepatan item dan lifesteal/attack speed untuk scaling late game.';
    }
  } else if (heroClass.includes('assassin')) {
    baseEmblem = 'Assassin';
    tier1 = 'Rupture (+5 Adaptive Penetration)';
    tier2 = 'Master Assassin (Bonus damage 7% saat duel 1v1)';
    tier3 = 'Killing Spree (Regen 8% HP & 20% MS setelah kill)';
    emblemRationale = 'Burst execution cepat dan sustain darah setelah mengeliminasi musuh.';
  } else if (heroClass.includes('mage')) {
    baseEmblem = 'Mage';
    tier1 = 'Inspire (+5% Cooldown Reduction)';
    tier2 = 'Bargain Hunter (Diskon harga item)';
    tier3 = 'Lethal Ignition (Bonus burn damage setelah 3x serangan berturut)';
    emblemRationale = 'Maksimalisasi Magic Penetration & burst damage kombo skill.';
  } else if (heroClass.includes('fighter')) {
    baseEmblem = 'Fighter';
    tier1 = 'Firmness (+6 Defense Fisik & Magic)';
    tier2 = 'Festival of Blood (Spell Vamp meningkat hingga 10%)';
    tier3 = 'Brave Smite (Skill memulihkan 4% Max HP)';
    emblemRationale = 'Sustain darah tebal saat adu pukul di garis depan EXP Lane.';
  } else if (heroClass.includes('tank')) {
    baseEmblem = 'Tank';
    tier1 = 'Vitality (+225 Max HP)';
    tier2 = 'Tenacity (Bonus +15 Defense saat HP di bawah 50%)';
    tier3 = 'Concussive Blast (Ledakan magic damage area berbasis HP)';
    emblemRationale = 'Daya tahan maksimal untuk inisiasi perang di garis depan.';
  } else if (heroClass.includes('support')) {
    baseEmblem = 'Support';
    tier1 = 'Agility (+4% Movement Speed)';
    tier2 = 'Pull Yourself Together (Cooldown Battle Spell -15%)';
    tier3 = 'Focusing Mark (Menambah damage tim ke target sebesar 6%)';
    emblemRationale = 'Rotasi cepat dan memperkuat damage tim pada target yang di-lock.';
  }

  // C. ADAPTIVE ITEM BUILD (6 ITEMS)
  const buildItems = [];

  // Boots selection
  if (hasHeavyCc) {
    buildItems.push({
      name: 'Tough Boots',
      reason: 'Wajib vs CC musuh: memotong durasi stun dan debuff sebesar 30%.',
      isCounter: true
    });
  } else if (heroClass.includes('marksman')) {
    buildItems.push({ name: 'Swift Boots', reason: 'Tambahan +15% Attack Speed untuk laning.', isCounter: false });
  } else if (heroClass.includes('mage')) {
    buildItems.push({ name: 'Arcane Boots', reason: 'Magic Penetration untuk tembus magic defense lawan.', isCounter: false });
  } else {
    buildItems.push({ name: 'Warrior Boots', reason: 'Meningkatkan Physical Defense saat terkena Basic Attack.', isCounter: false });
  }

  // Hero specific core items & reactive counters
  const hasRegen = threats.some(t => t.id === 'high_regen');
  const hasMagicBurst = threats.some(t => t.id === 'magic_burst');
  const hasPhysicalBurst = threats.some(t => t.id === 'physical_burst');
  const hasHighHp = threats.some(t => t.id === 'high_hp_tank');

  if (heroClass.includes('marksman')) {
    if (heroName === 'Clint') {
      buildItems.push({ name: 'Endless Battle', reason: 'Core utama Clint: True Damage dari pasif setiap mengeluarkan skill.', isCounter: false });
      buildItems.push({ name: "Blade of Despair", reason: 'Damage fisik masif untuk eksekusi musuh.', isCounter: false });
      
      // Reactive Counter 1: Anti-Regen or Armor Shred
      if (hasRegen) {
        buildItems.push({ name: 'Sea Halberd', reason: 'Counter Cici/Uranus: Anti-heal 50% + bonus damage ke hero berdarah tebal.', isCounter: true });
      } else {
        buildItems.push({ name: 'Malefic Roar', reason: 'Tembus armor tank & turret musuh.', isCounter: false });
      }

      // Reactive Counter 2: Defense vs Enemy Burst
      if (hasMagicBurst) {
        buildItems.push({ name: "Athena's Shield", reason: 'Counter Aamon/Burst Magic: Mengurangi magic burst 25% agar tidak one-shot mati.', isCounter: true });
      } else if (hasPhysicalBurst) {
        buildItems.push({ name: 'Wind of Nature', reason: 'Counter Badang/Physical burst: Kebal 2 detik dari physical damage.', isCounter: true });
      } else {
        buildItems.push({ name: 'Great Dragon Spear', reason: 'Crit Chance + Cooldown + bonus speed saat ultimate.', isCounter: false });
      }

      // Slot 6: WoN or Immortality
      if (!buildItems.some(i => i.name === 'Wind of Nature')) {
        buildItems.push({ name: 'Wind of Nature', reason: 'Penyelamat darurat saat duel dengan physical burst musuh.', isCounter: true });
      } else {
        buildItems.push({ name: 'Immortality', reason: 'Bangkit kembali setelah tereliminasi.', isCounter: false });
      }

    } else if (heroName === 'Brody') {
      buildItems.push({ name: 'Blade of the Heptaseas', reason: 'Burst damage tusukan pertama saat keluar dari bush.', isCounter: false });
      buildItems.push({ name: 'Malefic Roar', reason: 'Tembus physical defense musuh.', isCounter: false });
      if (hasRegen) {
        buildItems.push({ name: 'Sea Halberd', reason: 'Matikan lifesteal dan regen musuh.', isCounter: true });
      } else {
        buildItems.push({ name: 'Blade of Despair', reason: 'Damage eksekusi ekstra untuk ultimate.', isCounter: false });
      }
      if (hasMagicBurst) {
        buildItems.push({ name: "Athena's Shield", reason: 'Kebal dari instakill burst mage/assassin magic.', isCounter: true });
      }
      buildItems.push({ name: 'Wind of Nature', reason: 'Kebal fisik 2 detik saat diserang Badang atau MM musuh.', isCounter: true });
      buildItems.push({ name: 'Brute Force Breastplate', reason: 'Tambahan hybrid defense & pengurangan durasi CC.', isCounter: false });

    } else {
      // General Marksman (Miya, Moskov, Layla, Claude, Hanabi)
      buildItems.push({ name: 'Corrosion Scythe', reason: 'Attack Speed + efek slow berkelanjutan.', isCounter: false });
      if (hasHighHp) {
        buildItems.push({ name: 'Demon Hunter Sword', reason: 'Counter hero tebal: Damage tambahan berbasis % HP lawan.', isCounter: true });
      } else {
        buildItems.push({ name: "Berserker's Fury", reason: 'Crit damage & crit chance.', isCounter: false });
      }
      buildItems.push({ name: 'Golden Staff', reason: 'Mengubah crit menjadi kecepatan serang konstan.', isCounter: false });
      
      if (hasPhysicalBurst || enemyHeroes.some(h => ['Badang', 'Saber'].includes(h.hero_name))) {
        buildItems.push({ name: 'Wind of Nature', reason: 'Wajib: Kebal damage fisik 2 detik.', isCounter: true });
      }
      if (hasMagicBurst) {
        buildItems.push({ name: "Rose Gold Meteor", reason: 'Perisai darurat saat HP turun di bawah 30% dari magic burst.', isCounter: true });
      } else if (hasRegen) {
        buildItems.push({ name: 'Sea Halberd', reason: 'Anti-heal dan penambah damage ke hero bertubuh tebal.', isCounter: true });
      } else {
        buildItems.push({ name: 'Malefic Roar', reason: 'Penetrasi armor penembus tank.', isCounter: false });
      }
    }
  } else if (heroClass.includes('mage')) {
    buildItems.push({ name: 'Lightning Truncheon', reason: 'Burst damage memantul berbasis Mana.', isCounter: false });
    if (hasRegen) {
      buildItems.push({ name: 'Glowing Wand', reason: 'Counter regen: Efek bakar + memotong efek heal/shield 50%.', isCounter: true });
    } else {
      buildItems.push({ name: 'Holy Crystal', reason: 'Lonjakan Magic Power besar-besaran.', isCounter: false });
    }
    if (hasHighHp) {
      buildItems.push({ name: 'Wishing Lantern', reason: 'Setiap 800 damage magic menembakkan 10% target current HP.', isCounter: true });
    } else {
      buildItems.push({ name: 'Clock of Destiny', reason: 'Menambah Max Mana dan HP bertahap.', isCounter: false });
    }
    buildItems.push({ name: 'Divine Glaive', reason: 'Magic penetration memotong magic defense musuh.', isCounter: false });
    buildItems.push({ name: 'Winter Crown', reason: 'Membeku 2 detik untuk menghindari kombo maut musuh.', isCounter: true });

  } else if (heroClass.includes('tank') || heroClass.includes('fighter')) {
    if (hasRegen) {
      buildItems.push({ name: 'Dominance Ice', reason: 'Wajib lini depan: Mengurangi heal musuh 50% & potong attack speed.', isCounter: true });
    }
    if (hasMagicBurst) {
      buildItems.push({ name: "Athena's Shield", reason: 'Meredam 25% magic burst Aamon/Eudora.', isCounter: true });
    }
    if (hasPhysicalBurst) {
      buildItems.push({ name: 'Antique Cuirass', reason: 'Mereduksi Physical Attack musuh hingga 24% saat terkena skill.', isCounter: true });
    }
    buildItems.push({ name: 'Blade Armor', reason: 'Memantulkan 30% basic attack & meredam 20% critical damage musuh.', isCounter: true });
    buildItems.push({ name: 'Immortality', reason: 'Memberikan nyawa kedua di teamfight penting.', isCounter: false });
    if (buildItems.length < 6) {
      buildItems.push({ name: 'Radiant Armor', reason: 'Meredam damage magic beruntun.', isCounter: false });
    }
  } else {
    // Default fallback
    buildItems.push({ name: 'War Axe', reason: 'True damage & Spell Vamp berkelanjutan.', isCounter: false });
    buildItems.push({ name: 'Brute Force Breastplate', reason: 'Pertahanan hybrid & pengurangan durasi CC.', isCounter: false });
    if (hasRegen) buildItems.push({ name: 'Sea Halberd', reason: 'Anti-heal.', isCounter: true });
    if (hasMagicBurst) buildItems.push({ name: "Athena's Shield", reason: 'Anti-magic burst.', isCounter: true });
    buildItems.push({ name: 'Malefic Roar', reason: 'Armor shredder.', isCounter: false });
  }

  // Ensure 6 items exactly
  while (buildItems.length < 6) {
    buildItems.push({ name: 'Immortality', reason: 'Asuransi late game untuk bangkit kembali.', isCounter: false });
  }

  // D. STRATEGY & DANGER NOTES
  const tips = [];
  if (hasAamon) {
    tips.push('⚠️ Waspada Aamon saat HP di bawah 50%: Ulti pecahan pisaunya bersifat Execute (semakin sedikit HP-mu, semakin mematikan). Beli Athena\'s Shield sebelum menit 10.');
  }
  if (hasTigreal) {
    tips.push('⚠️ Jaga jarak dari Tigreal: Jangan berkumpul rapat di dekat teman satu tim. Simpan skill kabur atau Purify sampai Tigreal menggunakan flicker-ult.');
  }
  if (hasBadang) {
    tips.push('⚠️ Hindari pertarungan di lorong sempit / dekat dinding: Badang sangat butuh dinding untuk mengunci stun ultinya. Jika terjebak, segera pencet Purify/WoN.');
  }
  if (threats.some(t => t.id === 'high_regen')) {
    tips.push('⚠️ Selesaikan item Anti-Heal segera: Tanpa anti-heal, musuh tipe sustain akan memenangkan perang panjang (attrition fight).');
  }

  return {
    hero,
    battleSpell: spell,
    emblem: {
      name: baseEmblem,
      rationale: emblemRationale,
      tier1,
      tier2,
      tier3
    },
    build: buildItems.slice(0, 6),
    threats,
    tips
  };
}
