<script>
  import DraftBoard from './lib/DraftBoard.svelte';
  import ThreatBanner from './lib/ThreatBanner.svelte';
  import CounterRecommendations from './lib/CounterRecommendations.svelte';
  import HeroDetailPanel from './lib/HeroDetailPanel.svelte';
  import HeroPickerModal from './lib/HeroPickerModal.svelte';

  import * as engine from './lib/counterEngine.js';

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

  // Quick Action: Load User's Enemy Matchup (Tigreal, Aamon, Cici, Badang)
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
    // Find first empty slot or replace current active slot
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

<div class="app-container">
  <!-- Top Navigation Bar -->
  <header class="app-header">
    <div class="header-content">
      <div class="brand">
        <span class="brand-icon">⚔️</span>
        <div>
          <h1 class="brand-title">MLBB DRAFT & COUNTER ASSISTANT</h1>
          <p class="brand-subtitle">Strategi Counter Hero, Emblem, Battle Spell & Item Adaptif Otomatis</p>
        </div>
      </div>

      <div class="header-badges">
        <span class="patch-badge">Season Meta 2026</span>
        <span class="db-badge">133 Hero DB</span>
      </div>
    </div>
  </header>

  <main class="main-content">
    <!-- Draft Board (Blue vs Red) -->
    <DraftBoard
      {myTeam}
      {enemyTeam}
      selectedSlot={activeSlotToPick}
      onSlotClick={handleSlotClick}
      onRemoveHero={handleRemoveHero}
      onLoadPreset={handleLoadPreset}
      onReset={handleReset}
    />

    <!-- Enemy Threat Alerts -->
    <ThreatBanner threats={enemyThreats} />

    <!-- Two-column or dynamic view: Counter Recommendations & Hero Detail Guide -->
    <div class="dashboard-grid">
      <!-- Left: Counter Hero Recommendations -->
      <section class="grid-col">
        <CounterRecommendations
          recommendations={counterRecommendations}
          onPickToMyTeam={handlePickToMyTeam}
        />
      </section>

      <!-- Right: Detailed Hero Guide (Item, Spell, Emblem) -->
      <section class="grid-col">
        {#if matchupGuide}
          <HeroDetailPanel guide={matchupGuide} />
        {:else}
          <div class="placeholder-guide">
            <div class="placeholder-icon">🛡️</div>
            <h3>Pilih Hero di Tim Kamu</h3>
            <p>Pilih salah satu hero di slot Tim Kamu (Ally) untuk melihat rekomendasi <strong>Battle Spell</strong>, <strong>Emblem & Talent</strong>, serta <strong>6 Item Counter Adaptif</strong> yang paling efektif melawan musuh.</p>
            <button class="cta-preset-btn" onclick={handleLoadPreset}>
              🚀 Coba Contoh Kasus: Lawan Tigreal, Aamon, Cici, Badang
            </button>
          </div>
        {/if}
      </section>
    </div>
  </main>

  <!-- Footer with Credits -->
  <footer class="app-footer">
    <div class="footer-content">
      <p class="copyright">
        MLBB Draft & Counter Assistant © 2026 • Dirilis di bawah lisensi MIT.
      </p>
      <p class="credits-text">
        Basis data hero, item, dan emblem didukung oleh repositori open-source
        <a href="https://github.com/p3hndrx/MLBB-API" target="_blank" rel="noopener noreferrer" class="credit-link">
          p3hndrx/MLBB-API
        </a>. Seluruh aset gambar dan IP adalah hak cipta milik Moonton.
      </p>
    </div>
  </footer>

  <!-- Hero Picker Modal -->
  <HeroPickerModal
    isOpen={isModalOpen}
    title={activeSlotToPick?.team === 'my' ? `Pilih Hero Tim Kamu (Slot ${activeSlotToPick?.index + 1})` : `Pilih Hero Tim Musuh (Slot ${activeSlotToPick?.index + 1})`}
    excludedHeroes={excludedHeroNames}
    onClose={() => isModalOpen = false}
    onSelect={handleHeroSelected}
  />
</div>

<style>
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app-header {
    background: rgba(17, 23, 38, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 1.5rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .brand-icon {
    font-size: 2rem;
    filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4));
  }

  .brand-title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: linear-gradient(90deg, #f8fafc 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .brand-subtitle {
    font-size: 0.78rem;
    color: var(--text-dim);
  }

  .header-badges {
    display: flex;
    gap: 0.5rem;
  }

  .patch-badge {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    background: rgba(245, 158, 11, 0.15);
    color: var(--gold-accent);
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .db-badge {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    width: 100%;
    flex: 1;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  .grid-col {
    display: flex;
    flex-direction: column;
  }

  .placeholder-guide {
    background: var(--bg-surface);
    border: 1px dashed var(--border-light);
    border-radius: var(--radius-lg);
    padding: 3rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--text-muted);
  }

  .placeholder-icon {
    font-size: 3rem;
    opacity: 0.5;
  }

  .placeholder-guide h3 {
    font-size: 1.25rem;
    color: var(--text-main);
  }

  .placeholder-guide p {
    font-size: 0.88rem;
    max-width: 440px;
    line-height: 1.5;
  }

  .cta-preset-btn {
    margin-top: 0.5rem;
    padding: 0.65rem 1.25rem;
    border-radius: var(--radius-md);
    background: var(--primary-blue);
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
    box-shadow: 0 4px 15px var(--primary-blue-glow);
  }

  .cta-preset-btn:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }

  .app-footer {
    border-top: 1px solid var(--border-color);
    background: rgba(10, 15, 26, 0.7);
    padding: 1.5rem;
    margin-top: auto;
    text-align: center;
  }

  .footer-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .copyright {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .credits-text {
    font-size: 0.75rem;
    color: var(--text-dim);
    line-height: 1.5;
  }

  .credit-link {
    color: var(--gold-accent);
    text-decoration: underline;
    font-weight: 600;
  }

  .credit-link:hover {
    color: #fbbf24;
  }
</style>
