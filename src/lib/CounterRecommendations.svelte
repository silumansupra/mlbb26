<script>
  let { recommendations = [], onPickToMyTeam } = $props();

  let selectedLane = $state('Semua Lane');
  const lanes = ['Semua Lane', 'Gold Lane', 'EXP Lane', 'Mid Lane', 'Roam', 'Jungle'];

  let filteredRecommendations = $derived(
    recommendations.filter(rec => {
      if (selectedLane === 'Semua Lane') return true;
      return rec.lane.toLowerCase() === selectedLane.toLowerCase();
    })
  );
</script>

<div class="counters-section">
  <div class="section-header">
    <div class="header-title">
      <span class="icon">🎯</span>
      <h3>Rekomendasi Hero Counter Terbaik</h3>
      <span class="badge-total">{filteredRecommendations.length} Hero</span>
    </div>
    <div class="lane-filter-tabs">
      {#each lanes as lane}
        <button
          class="lane-tab"
          class:active={selectedLane === lane}
          onclick={() => selectedLane = lane}
        >
          {lane}
        </button>
      {/each}
    </div>
  </div>

  <div class="recommendations-grid">
    {#each filteredRecommendations.slice(0, 8) as rec (rec.hero.hero_name)}
      <div class="rec-card">
        <div class="rec-hero-banner">
          <div class="portrait-box">
            <img src={rec.hero.portrait || '/default-hero.webp'} alt={rec.hero.hero_name} />
          </div>
          <div class="hero-id">
            <div class="name-lane-row">
              <span class="hero-name">{rec.hero.hero_name}</span>
              <span class="lane-badge">{rec.lane}</span>
            </div>
            <span class="hero-role">{rec.hero.class}</span>
          </div>
          <div class="score-badge" title="Tingkat efektivitas counter">
            <span class="score-num">+{rec.score}</span>
            <span class="score-label">COUNTER PTS</span>
          </div>
        </div>

        <div class="rec-reasons">
          {#each rec.reasons as reason}
            <div class="reason-row">
              <span class="check-icon">✓</span>
              <span class="reason-text">{reason}</span>
            </div>
          {/each}
        </div>

        <button
          class="pick-btn"
          onclick={() => onPickToMyTeam(rec.hero)}
        >
          <span>⚔️</span> Masukkan ke Tim Kamu
        </button>
      </div>
    {/each}

    {#if filteredRecommendations.length === 0}
      <div class="empty-rec">
        <p>Pilih hero di tim musuh untuk melihat rekomendasi counter otomatis!</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .counters-section {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .header-title .icon {
    font-size: 1.25rem;
  }

  .header-title h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .badge-total {
    font-size: 0.75rem;
    background: var(--bg-surface-elevated);
    color: var(--gold-accent);
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 700;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  .lane-filter-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .lane-tab {
    padding: 0.35rem 0.8rem;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
    background: var(--bg-surface-elevated);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
  }

  .lane-tab:hover {
    color: white;
    border-color: var(--border-light);
  }

  .lane-tab.active {
    background: var(--gold-accent);
    color: #0b0e14;
    font-weight: 700;
    border-color: var(--gold-accent);
    box-shadow: 0 0 10px var(--gold-glow);
  }

  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }

  .rec-card {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .rec-card:hover {
    border-color: var(--gold-accent);
    transform: translateY(-2px);
  }

  .rec-hero-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .portrait-box {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--gold-accent);
    flex-shrink: 0;
  }

  .portrait-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-id {
    flex: 1;
    min-width: 0;
  }

  .name-lane-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .hero-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .lane-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .hero-role {
    font-size: 0.75rem;
    color: var(--text-dim);
  }

  .score-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .score-num {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--green-accent);
  }

  .score-label {
    font-size: 0.55rem;
    font-weight: 800;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  .rec-reasons {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.6rem 0.8rem;
    border-radius: var(--radius-sm);
    min-height: 55px;
  }

  .reason-row {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: #cbd5e1;
    line-height: 1.35;
  }

  .check-icon {
    color: var(--green-accent);
    font-weight: 800;
    font-size: 0.8rem;
  }

  .pick-btn {
    width: 100%;
    padding: 0.55rem;
    border-radius: var(--radius-sm);
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.3);
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-top: auto;
  }

  .pick-btn:hover {
    background: var(--primary-blue);
    color: white;
    box-shadow: 0 0 12px var(--primary-blue-glow);
  }

  .empty-rec {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-dim);
  }
</style>
