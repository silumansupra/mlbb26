<script>
  import DraftBoard from './lib/DraftBoard.svelte';
  import ThreatBanner from './lib/ThreatBanner.svelte';
  import CounterRecommendations from './lib/CounterRecommendations.svelte';
  import HeroDetailPanel from './lib/HeroDetailPanel.svelte';
  import HeroPickerModal from './lib/HeroPickerModal.svelte';
  import BackgroundSelector from './lib/BackgroundSelector.svelte';
  import PreparationModal from './lib/PreparationModal.svelte';
  import TeamBalanceBar from './lib/TeamBalanceBar.svelte';
  import { exportDraftCard } from './lib/draftExporter.js';

  import * as engine from './lib/counterEngine.js';

  // Winrate metadata
  const winrateMeta = engine.getWinrateMetadata();

  // State: Active Background with LocalStorage persistence
  const savedBg = typeof localStorage !== 'undefined' ? localStorage.getItem('mlbb_draft_bg') : null;
  let activeBg = $state(savedBg || 'abyss');

  const savedVivid = typeof localStorage !== 'undefined' ? localStorage.getItem('mlbb_draft_vivid') : null;
  let isVivid = $state(savedVivid !== null ? savedVivid === 'true' : true);

  function handleSelectBg(bgId) {
    activeBg = bgId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mlbb_draft_bg', bgId);
    }
  }

  function handleToggleVivid() {
    isVivid = !isVivid;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mlbb_draft_vivid', String(isVivid));
    }
  }

  // Derived background URL
  let bgStyleUrl = $derived(
    activeBg === 'abyss' ? "url('/backgrounds/bg-abyss.jpg')" :
    activeBg === 'aurora' ? "url('/backgrounds/bg-aurora.jpg')" :
    activeBg === 'arena' ? "url('/backgrounds/bg-arena.jpg')" :
    activeBg === 'battlefield' ? "url('/backgrounds/bg-battlefield.jpg')" : 'none'
  );

  // State: Toast notification
  let toastMessage = $state('');
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage = msg;
    toastTimer = setTimeout(() => {
      toastMessage = '';
    }, 3000);
  }

  // State: My Team (5 slots) and Enemy Team (5 slots)
  let initialBlue = [null, null, null, null, null];
  let initialRed = [null, null, null, null, null];

  // Initialize from URL params if present
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const blueParam = params.get('blue');
    const redParam = params.get('red');

    if (blueParam) {
      const names = blueParam.split(',');
      names.slice(0, 5).forEach((n, idx) => {
        const h = engine.getHeroByName(n.trim());
        if (h) initialBlue[idx] = h;
      });
    }

    if (redParam) {
      const names = redParam.split(',');
      names.slice(0, 5).forEach((n, idx) => {
        const h = engine.getHeroByName(n.trim());
        if (h) initialRed[idx] = h;
      });
    }
  }

  let myTeam = $state(initialBlue);
  let enemyTeam = $state(initialRed);

  // Reactive URL Synchronization
  $effect(() => {
    if (typeof window === 'undefined') return;
    const blueNames = myTeam.filter(Boolean).map(h => h.hero_name.toLowerCase()).join(',');
    const redNames = enemyTeam.filter(Boolean).map(h => h.hero_name.toLowerCase()).join(',');

    const params = new URLSearchParams();
    if (blueNames) params.set('blue', blueNames);
    if (redNames) params.set('red', redNames);

    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  });

  // Selected slot for active view in HeroDetailPanel
  let activeHeroIndex = $state(0);
  let inspectedHero = $state(null);

  // Modal State: Hero Picker
  let isModalOpen = $state(false);
  let activeSlotToPick = $state(null); // { team: 'my' | 'enemy', index: 0..4 }

  // Modal State: Preparation (Build, Emblem, Spell)
  let isPrepModalOpen = $state(false);
  let prepTargetHero = $state(null);
  let prepInitialTab = $state('build'); // 'build' | 'emblem' | 'spell'
  let customLoadouts = $state({}); // { [hero_name]: { items, emblem, spell } }

  function handleOpenPreparation(hero, tab = 'build') {
    if (!hero) return;
    prepTargetHero = hero;
    prepInitialTab = tab;
    isPrepModalOpen = true;
  }

  function handleSavePreparation(loadout) {
    if (!loadout?.hero) return;
    customLoadouts = {
      ...customLoadouts,
      [loadout.hero.hero_name]: {
        items: loadout.items,
        emblem: loadout.emblem,
        spell: loadout.spell
      }
    };
  }

  // Derived: Filtered lists of heroes
  let selectedEnemyHeroes = $derived(enemyTeam.filter(Boolean));
  let selectedMyHeroes = $derived(myTeam.filter(Boolean));

  // Derived: Team Balance Compositions
  let allyComp = $derived(engine.analyzeTeamComposition(myTeam));
  let enemyComp = $derived(engine.analyzeTeamComposition(enemyTeam));

  // Derived: Active Ally Hero for Matchup Guide (defaults to Clint if none selected)
  let activeAllyHero = $derived(
    inspectedHero || myTeam[activeHeroIndex] || selectedMyHeroes[0] || engine.getHeroByName('Clint')
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
    if (team === 'my' && myTeam[index]) {
      inspectedHero = null;
      activeHeroIndex = index;
    } else {
      inspectedHero = null;
      activeSlotToPick = { team, index };
      isModalOpen = true;
      if (team === 'my') {
        activeHeroIndex = index;
      }
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
      inspectedHero = hero;
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
    inspectedHero = null;
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

  // Quick Action: Share Draft Link
  function handleShareLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Tautan Draft berhasil disalin ke clipboard!');
    } else {
      showToast('Salin tautan dari address bar browser Anda.');
    }
  }

  // Quick Action: Export Tournament Draft Card PNG
  async function handleExportCard() {
    showToast('📸 Menggenerate Infografis Draft PNG...');
    try {
      await exportDraftCard({
        myTeam,
        enemyTeam,
        winrateMeta,
        allyComp,
        enemyComp
      });
      showToast('✓ Berhasil mendownload Draft Card PNG!');
    } catch (e) {
      console.error(e);
      showToast('Gagal mendownload infografis draft.');
    }
  }

  // Mobile View Tab: 'console' | 'counters' | 'radar'
  let activeMobileTab = $state('console');
</script>

<!-- DYNAMIC WALLPAPER VIEWPORT LAYERS -->
<div class="bg-viewport-layer" style="background-image: {bgStyleUrl};"></div>
<div class="bg-scrim-layer" class:scrim-vivid={isVivid} class:scrim-dim={!isVivid}></div>

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
        <div class="header-quick-actions">
          <button type="button" class="header-action-btn export-btn" onclick={handleExportCard} title="Export Draft Card PNG">
            <span>📸</span> <span class="action-btn-text">EXPORT CARD</span>
          </button>
          <button type="button" class="header-action-btn share-btn" onclick={handleShareLink} title="Salin Tautan Draft">
            <span>🔗</span> <span class="action-btn-text">SHARE</span>
          </button>
        </div>

        <BackgroundSelector
          currentBg={activeBg}
          onSelectBg={handleSelectBg}
          {isVivid}
          onToggleVivid={handleToggleVivid}
        />
        <div class="hud-stat-pill meta-live-pill" title="Data Rank Moonton: {winrateMeta.rank_scope}">
          <span class="live-dot-mini"></span>
          <span class="pill-k">DATA:</span>
          <span class="pill-v">{winrateMeta.last_updated}</span>
        </div>
        <div class="hud-stat-pill desktop-only-pill">
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
      {customLoadouts}
      onSlotClick={handleSlotClick}
      onRemoveHero={handleRemoveHero}
      onLoadPreset={handleLoadPreset}
      onReset={handleReset}
      onOpenPreparation={handleOpenPreparation}
      onExportCard={handleExportCard}
      onShareLink={handleShareLink}
    />

    <!-- MOBILE CONSOLE TABS (Visible only on screens <= 1080px) -->
    <div class="mobile-console-tabs" role="tablist">
      <button
        type="button"
        class="mobile-tab"
        class:is-active={activeMobileTab === 'console'}
        onclick={() => activeMobileTab = 'console'}
      >
        <span class="tab-ic">🛡️</span>
        <span class="tab-text">HERO LOADOUT</span>
      </button>
      <button
        type="button"
        class="mobile-tab"
        class:is-active={activeMobileTab === 'counters'}
        onclick={() => activeMobileTab = 'counters'}
      >
        <span class="tab-ic">⚡</span>
        <span class="tab-text">COUNTERS</span>
        {#if counterRecommendations.length > 0}
          <span class="tab-count-pill">{counterRecommendations.length}</span>
        {/if}
      </button>
      <button
        type="button"
        class="mobile-tab"
        class:is-active={activeMobileTab === 'radar'}
        onclick={() => activeMobileTab = 'radar'}
      >
        <span class="tab-ic">⚠️</span>
        <span class="tab-text">RADAR & COMP</span>
        {#if enemyThreats.length > 0}
          <span class="tab-threat-pill">{enemyThreats.length}</span>
        {/if}
      </button>
    </div>

    <!-- RADAR & TEAM BALANCE VIEW -->
    <div class="radar-comp-section" class:mobile-hidden={activeMobileTab !== 'radar'}>
      <TeamBalanceBar {allyComp} {enemyComp} />
      <ThreatBanner threats={enemyThreats} />
    </div>

    <!-- Split Screen: Scouting Report vs Hero Tactical Console -->
    <div class="split-viewport">
      <!-- Left Column: Counter Scouting Recommendations -->
      <div class="viewport-col counters-col" class:mobile-hidden={activeMobileTab !== 'counters'}>
        <CounterRecommendations
          recommendations={counterRecommendations}
          onPickToMyTeam={handlePickToMyTeam}
        />
      </div>

      <!-- Right Column: Hero Matchup Console -->
      <div class="viewport-col console-col" class:mobile-hidden={activeMobileTab !== 'console'}>
        {#if matchupGuide}
          <HeroDetailPanel
            guide={matchupGuide}
            allHeroes={engine.getAllHeroes()}
            enemyHeroes={selectedEnemyHeroes}
            customLoadout={activeAllyHero ? customLoadouts[activeAllyHero.hero_name] : null}
            onOpenPreparation={handleOpenPreparation}
            onSelectHero={(h) => inspectedHero = h}
          />
        {:else}
          <div class="empty-dossier tech-bracket">
            <span class="empty-dossier-code">AWAITING_ACTIVE_HERO_SELECTION</span>
            <h3 class="empty-title">PILIH HERO TIM ALLY</h3>
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
        <span class="footer-meta-sync">
          <span class="sync-dot"></span>
          <span>Update Terakhir: {winrateMeta.last_updated} ({winrateMeta.rank_scope})</span>
        </span>
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

  <!-- Preparation Modal (Build Items, Emblem Matrix, Battle Spell) -->
  <PreparationModal
    isOpen={isPrepModalOpen}
    hero={prepTargetHero}
    initialTab={prepInitialTab}
    customLoadout={prepTargetHero ? customLoadouts[prepTargetHero.hero_name] : null}
    enemyHeroes={selectedEnemyHeroes}
    onClose={() => isPrepModalOpen = false}
    onSave={handleSavePreparation}
  />

  <!-- Floating Toast Notification -->
  {#if toastMessage}
    <div class="toast-alert" role="status">
      <span>{toastMessage}</span>
    </div>
  {/if}
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

  .header-quick-actions {
    display: flex;
    gap: 0.4rem;
  }

  .header-action-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-family: var(--font-display);
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.32rem 0.65rem;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-tech);
    transition: all 0.15s ease;
  }

  .header-action-btn.export-btn {
    background: rgba(245, 158, 11, 0.15);
    color: var(--gold-mythic);
    border-color: var(--gold-border);
  }

  .header-action-btn.export-btn:hover {
    background: var(--gold-mythic);
    color: #05070d;
    box-shadow: 0 0 12px var(--gold-glow);
  }

  .header-action-btn.share-btn {
    background: rgba(168, 85, 247, 0.15);
    color: #c084fc;
    border-color: rgba(168, 85, 247, 0.4);
  }

  .header-action-btn.share-btn:hover {
    background: #9333ea;
    color: white;
    box-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
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

  .meta-live-pill {
    border-color: rgba(56, 189, 248, 0.4);
    background: rgba(8, 47, 73, 0.4);
  }

  .live-dot-mini {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 8px #38bdf8;
    animation: livePulse 2s infinite ease-in-out;
  }

  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
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

  /* MOBILE CONSOLE TABS */
  .mobile-console-tabs {
    display: none;
    gap: 0.35rem;
    margin-bottom: 0.85rem;
    position: sticky;
    top: 50px;
    z-index: 90;
    background: rgba(5, 8, 16, 0.95);
    backdrop-filter: blur(12px);
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--border-tech);
  }

  .mobile-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.45rem 0.3rem;
    border-radius: var(--radius-xs);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-tech);
    color: var(--text-dim);
    font-family: var(--font-display);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    transition: all 0.15s ease;
  }

  .mobile-tab.is-active {
    background: var(--gold-mythic);
    color: #05070d;
    border-color: var(--gold-mythic);
    box-shadow: 0 0 10px var(--gold-glow);
  }

  .tab-count-pill, .tab-threat-pill {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    padding: 1px 4px;
    border-radius: 2px;
    font-weight: 800;
  }

  .tab-count-pill {
    background: rgba(0, 0, 0, 0.5);
    color: var(--gold-mythic);
  }

  .tab-threat-pill {
    background: var(--enemy-red);
    color: white;
  }

  .mobile-tab.is-active .tab-count-pill {
    background: #000000;
    color: #fef08a;
  }

  .radar-comp-section {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .split-viewport {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 1080px) {
    .mobile-console-tabs {
      display: flex;
    }

    .mobile-hidden {
      display: none !important;
    }

    .main-viewport {
      padding: 0.65rem 0.5rem;
    }

    .broadcast-header {
      padding: 0.45rem 0.75rem;
    }

    .brand-title {
      font-size: 0.92rem;
      letter-spacing: 1px;
    }

    .brand-telemetry {
      display: none;
    }

    .desktop-only-pill {
      display: none;
    }

    .action-btn-text {
      display: none;
    }

    .header-action-btn {
      padding: 0.3rem 0.5rem;
      font-size: 0.75rem;
    }

    .split-viewport {
      grid-template-columns: 1fr;
      gap: 0.85rem;
    }

    .radar-comp-section {
      gap: 0.85rem;
      margin-bottom: 0.85rem;
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
    flex-wrap: wrap;
  }

  .footer-meta-sync {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--gold-mythic);
    font-weight: 600;
  }

  .sync-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold-mythic);
    box-shadow: 0 0 6px var(--gold-mythic);
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

  /* FLOATING TOAST NOTIFICATION */
  .toast-alert {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid var(--gold-mythic);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(245, 158, 11, 0.3);
    color: #ffffff;
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-xs);
    animation: toastSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes toastSlide {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
