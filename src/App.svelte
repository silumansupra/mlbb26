<script>
  import DraftBoard from './lib/DraftBoard.svelte';
  import ThreatBanner from './lib/ThreatBanner.svelte';
  import CounterRecommendations from './lib/CounterRecommendations.svelte';
  import HeroDetailPanel from './lib/HeroDetailPanel.svelte';
  import HeroPickerModal from './lib/HeroPickerModal.svelte';
  import BackgroundSelector from './lib/BackgroundSelector.svelte';

  import * as engine from './lib/counterEngine.js';

  // State: Active Background with LocalStorage persistence
  const savedBg = typeof localStorage !== 'undefined' ? localStorage.getItem('mlbb_draft_bg') : null;
  let activeBg = $state(savedBg || 'abyss');

  function handleSelectBg(bgId) {
    activeBg = bgId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mlbb_draft_bg', bgId);
    }
  }

  // Derived background URL
  let bgStyleUrl = $derived(
    activeBg === 'abyss' ? "url('/backgrounds/bg-abyss.jfif')" :
    activeBg === 'aurora' ? "url('/backgrounds/bg-aurora.jfif')" : 'none'
  );

  // State: My Team (5 slots) and Enemy Team (5 slots)
  let myTeam = $state([null, null, null, null, null]);
  let enemyTeam = $state([null, null, null, null, null]);

  // Selected slot for active view in HeroDetailPanel
  let activeHeroIndex = $state(0);

  // Modal State
  let isModalOpen = $state(false);
  let activeSlotToPick = $state(null); // { team: 'my' | 'enemy', index: 0..4 }

  // Derived: Filtered lists of heroes
  let selectedEnemyHeroes = $derived(enemyTeam.filter(Boolean));
  let selectedMyHeroes = $derived(myTeam.filter(Boolean));

  // Derived: Active Ally Hero for Matchup Guide
  let activeAllyHero = $derived(
    myTeam[activeHeroIndex] || selectedMyHeroes[0] || null
  );

  // Derived: Threat analysis from enemy team
  let enemyThreats = $derived(
    engine.analyzeEnemyThreats(selectedEnemyHeroes)
  );

  // Derived: Top Counter Recommendations
  let counterRecommendations = $derived(
    engine.calculateCounterRecommendations(selectedEnemyHeroes, selectedMyHeroes)
  );

  // Derived: Detailed guide for active hero vs enemy
  let matchupGuide = $derived(
    activeAllyHero ? engine.getHeroMatchupGuide(activeAllyHero, selectedEnemyHeroes) : null
  );

  // Excluded hero names for picker
  let excludedHeroNames = $derived([
    ...selectedMyHeroes.map(h => h.hero_name),
    ...selectedEnemyHeroes.map(h => h.hero_name)
  ]);

  // Handler: Click slot to open modal
  function handleSlotClick(team, index) {
    activeSlotToPick = { team, index };
    isModalOpen = true;
    if (team === 'my') {
      activeHeroIndex = index;
    }
  }

  // Handler: Select hero from modal
  function handleHeroSelected(hero) {
    if (!activeSlotToPick) return;
    const { team, index } = activeSlotToPick;

    if (team === 'my') {
      const next = [...myTeam];
      next[index] = hero;
      myTeam = next;
      activeHeroIndex = index;
    } else {
      const next = [...enemyTeam];
      next[index] = hero;
      enemyTeam = next;
    }
  }

  // Handler: Remove hero from slot
  function handleRemoveHero(team, index) {
    if (team === 'my') {
      const next = [...myTeam];
      next[index] = null;
      myTeam = next;
    } else {
      const next = [...enemyTeam];
      next[index] = null;
      enemyTeam = next;
    }
  }

  // Quick Action: Load Preset (Tigreal, Aamon, Cici, Badang)
  function handleLoadPreset() {
    const tigreal = engine.getHeroByName('Tigreal');
    const aamon = engine.getHeroByName('Aamon');
    const cici = engine.getHeroByName('Cici');
    const badang = engine.getHeroByName('Badang');
    
    enemyTeam = [tigreal, aamon, cici, badang, null];

    // Suggest Clint in Gold Lane if empty
    if (!myTeam[0]) {
      const clint = engine.getHeroByName('Clint');
      myTeam = [clint, null, null, null, null];
      activeHeroIndex = 0;
    }
  }

  // Quick Action: Reset All
  function handleReset() {
    myTeam = [null, null, null, null, null];
    enemyTeam = [null, null, null, null, null];
    activeHeroIndex = 0;
  }

  // Quick Action: Pick recommended counter into My Team
  function handlePickToMyTeam(hero) {
    const next = [...myTeam];
    const emptyIdx = next.findIndex(slot => slot === null);
    if (emptyIdx !== -1) {
      next[emptyIdx] = hero;
      activeHeroIndex = emptyIdx;
    } else {
      next[activeHeroIndex] = hero;
    }
    myTeam = next;
  }
</script>

<!-- DYNAMIC WALLPAPER VIEWPORT LAYERS -->
<div class="bg-viewport-layer" style:background-image={bgStyleUrl}></div>
<div class="bg-scrim-layer"></div>

<div class="broadcast-shell">
  <!-- TOP TOURNAMENT STATUS HUD -->
  <header class="broadcast-header">
    <div class="header-inner">
      <div class="brand-tactical">
        <div class="brand-crest">
          <span class="crest-accent">MLBB</span>
        </div>
        <div class="brand-text">
          <div class="brand-headline">
            <span class="status-live-dot"></span>
            <h1 class="brand-title">TACTICAL DRAFT INTELLIGENCE</h1>
          </div>
          <span class="brand-telemetry">SEASON 2026 // ADAPTIVE COUNTER PROTOCOL</span>
        </div>
      </div>

      <div class="header-hud-right">
        <BackgroundSelector
          currentBg={activeBg}
          onSelectBg={handleSelectBg}
        />
        <div class="hud-stat-pill">
          <span class="pill-k">DB:</span>
          <span class="pill-v">133 HEROES</span>
        </div>
      </div>
    </div>
  </header>

  <!-- MAIN DRAFT STAGE -->
  <main class="main-viewport">
    <!-- Draft Arena (Blue Ally vs Red Enemy) -->
    <DraftBoard
      {myTeam}
      {enemyTeam}
      selectedSlot={activeSlotToPick}
      onSlotClick={handleSlotClick}
      onRemoveHero={handleRemoveHero}
      onLoadPreset={handleLoadPreset}
      onReset={handleReset}
    />

    <!-- Threat Analysis Radar -->
    <ThreatBanner threats={enemyThreats} />

    <!-- Split Screen: Scouting Report vs Hero Tactical Console -->
    <div class="split-viewport">
      <!-- Left Column: Counter Scouting Recommendations -->
      <div class="viewport-col">
        <CounterRecommendations
          recommendations={counterRecommendations}
          onPickToMyTeam={handlePickToMyTeam}
        />
      </div>

      <!-- Right Column: Hero Matchup Console -->
      <div class="viewport-col">
        {#if matchupGuide}
          <HeroDetailPanel guide={matchupGuide} />
        {:else}
          <div class="empty-dossier tech-bracket">
            <span class="empty-dossier-code">AWAITING_ACTIVE_HERO_SELECTION</span>
            <h3 class="empty-title">PILOH HERO PADA TIM ALLY</h3>
            <p class="empty-desc">
              Pilih salah satu hero di slot <strong>Ally Roster</strong> (misal: Clint / Brody) untuk mengaktifkan kalkulasi konsol taktis: <strong>Battle Spell</strong>, <strong>Emblem Matrix</strong>, dan <strong>6 Item Counter Adaptif</strong>.
            </p>
            <button type="button" class="preset-cta-trigger" onclick={handleLoadPreset}>
              <span>⚡</span> UJI CONTOH KASUS VS (TIGREAL, AAMON, CICI, BADANG)
            </button>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <!-- Broadcast Footer -->
  <footer class="broadcast-footer">
    <div class="footer-inner">
      <div class="footer-legal">
        <span>MLBB DRAFT & COUNTER ASSISTANT © 2026</span>
        <span class="divider">/</span>
        <span>OPEN SOURCE TACTICAL TOOL</span>
      </div>
      <div class="footer-attribution">
        Basis data resmi didukung oleh
        <a href="https://github.com/p3hndrx/MLBB-API" target="_blank" rel="noopener noreferrer" class="credit-anchor">
          p3hndrx/MLBB-API
        </a>. Seluruh intellectual property & aset visual milik Shanghai Moonton Technology Co., Ltd.
      </div>
    </div>
  </footer>

  <!-- Hero Picker Modal -->
  <HeroPickerModal
    isOpen={isModalOpen}
    title={activeSlotToPick?.team === 'my' ? `SELECT ALLY (SLOT 0${activeSlotToPick?.index + 1})` : `SELECT OPPONENT (SLOT 0${activeSlotToPick?.index + 1})`}
    excludedHeroes={excludedHeroNames}
    onClose={() => isModalOpen = false}
    onSelect={handleHeroSelected}
  />
</div>

<style>
  .broadcast-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
  }

  .broadcast-header {
    background: rgba(5, 8, 16, 0.88);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border-tech);
    padding: 0.85rem 1.75rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brand-tactical {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .brand-crest {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-xs);
    background: linear-gradient(135deg, var(--gold-mythic) 0%, #b45309 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 16px var(--gold-glow);
  }

  .crest-accent {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 900;
    color: #05070d;
    letter-spacing: 0.5px;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .brand-headline {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--emerald-live);
    box-shadow: 0 0 8px var(--emerald-live);
  }

  .brand-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text-pure);
  }

  .brand-telemetry {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .header-hud-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .hud-stat-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid var(--border-tech);
    padding: 0.3rem 0.65rem;
    border-radius: var(--radius-xs);
    font-family: var(--font-mono);
    font-size: 0.68rem;
  }

  .pill-k {
    color: var(--text-dim);
    font-weight: 700;
  }

  .pill-v {
    color: var(--ally-cyan);
    font-weight: 700;
  }

  .main-viewport {
    max-width: 1440px;
    margin: 0 auto;
    padding: 1.5rem;
    width: 100%;
    flex: 1;
  }

  .split-viewport {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 1080px) {
    .split-viewport {
      grid-template-columns: 1fr;
    }
  }

  .viewport-col {
    display: flex;
    flex-direction: column;
  }

  .empty-dossier {
    background: var(--bg-panel);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-md);
    padding: 3rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  }

  .empty-dossier-code {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--gold-mythic);
    letter-spacing: 2px;
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-pure);
    letter-spacing: 1px;
  }

  .empty-desc {
    font-size: 0.85rem;
    color: var(--text-muted);
    max-width: 440px;
    line-height: 1.5;
  }

  .preset-cta-trigger {
    margin-top: 0.5rem;
    padding: 0.65rem 1.25rem;
    border-radius: var(--radius-xs);
    background: var(--ally-blue);
    color: white;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 1px;
    box-shadow: 0 4px 18px var(--ally-glow);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
  }

  .preset-cta-trigger:hover {
    background: #0284c7;
    transform: translateY(-2px);
    box-shadow: 0 6px 24px var(--ally-glow);
  }

  .broadcast-footer {
    border-top: 1px solid var(--border-tech);
    background: rgba(5, 7, 13, 0.88);
    backdrop-filter: blur(10px);
    padding: 1.25rem 1.75rem;
    margin-top: auto;
  }

  .footer-inner {
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .footer-legal {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-dim);
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .divider {
    opacity: 0.4;
  }

  .footer-attribution {
    font-size: 0.75rem;
    color: var(--text-dim);
  }

  .credit-anchor {
    color: var(--gold-mythic);
    text-decoration: underline;
    font-weight: 600;
  }

  .credit-anchor:hover {
    color: #fef08a;
  }
</style>
