<script>
  let { recommendations = [], onPickToMyTeam } = $props();

  let selectedLane = $state('ALL LANES');
  const lanes = ['ALL LANES', 'GOLD LANE', 'EXP LANE', 'MID LANE', 'ROAM', 'JUNGLE'];

  let filteredRecommendations = $derived(
    recommendations.filter(rec => {
      if (selectedLane === 'ALL LANES') return true;
      return rec.lane.toUpperCase() === selectedLane;
    })
  );
</script>

<section class="scout-console">
  <div class="console-head">
    <div class="head-left">
      <h3 class="head-title">TACTICAL COUNTER SCOUTING</h3>
      <span class="count-badge">{filteredRecommendations.length} MATCHES</span>
    </div>

    <div class="lane-tabs" role="tablist">
      {#each lanes as lane}
        <button
          type="button"
          class="lane-tab"
          class:is-active={selectedLane === lane}
          onclick={() => selectedLane = lane}
        >
          {lane}
        </button>
      {/each}
    </div>
  </div>

  <div class="scout-grid">
    {#each filteredRecommendations.slice(0, 8) as rec (rec.hero.hero_name)}
      <div class="scout-card tech-bracket">
        <div class="card-hero-row">
          <div class="avatar-frame">
            <img src={rec.hero.portrait || '/default-hero.webp'} alt={rec.hero.hero_name} class="avatar-img" />
          </div>

          <div class="hero-credentials">
            <div class="name-lane-line">
              <span class="hero-name">{rec.hero.hero_name}</span>
              <span class="lane-tag">{rec.lane.toUpperCase()}</span>
            </div>
            <div class="role-meta-line">
              <span class="hero-role-text">{rec.hero.class.toUpperCase()}</span>
              {#if rec.winrate}
                <span class="rec-meta-badge tier-{rec.tier?.toLowerCase()}" title="Winrate: {rec.winrate} | Banrate: {rec.banrate}">
                  WR {rec.winrate} ({rec.tier})
                </span>
              {/if}
            </div>
          </div>

          <div class="rating-box" title="Index keunggulan matchup">
            <span class="rating-value">+{rec.score}</span>
            <span class="rating-label">RATING</span>
          </div>
        </div>

        <div class="tactical-reasons">
          {#each rec.reasons as reason}
            <div class="reason-item">
              <span class="reason-bullet">//</span>
              <span class="reason-text">{reason}</span>
            </div>
          {/each}
        </div>

        <button
          type="button"
          class="lock-in-trigger"
          onclick={() => onPickToMyTeam(rec.hero)}
        >
          <span class="trigger-text">ASSIGN TO ALLY ROSTER</span>
          <span class="trigger-arrow">→</span>
        </button>
      </div>
    {/each}

    {#if filteredRecommendations.length === 0}
      <div class="scout-empty">
        <span class="empty-code">AWAITING_OPPONENT_PICKS</span>
        <p>Pilih minimal 1 hero lawan untuk memicu kalkulasi counter otomatis dari 133 hero database.</p>
      </div>
    {/if}
  </div>
</section>

<style>
  .scout-console {
    background: var(--bg-panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-md);
    padding: 1.25rem 1.5rem;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  }

  .console-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-tech);
    padding-bottom: 0.85rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .head-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .head-title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text-pure);
  }

  .count-badge {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--gold-mythic);
    background: rgba(251, 191, 36, 0.12);
    border: 1px solid var(--gold-border);
    padding: 2px 7px;
    border-radius: var(--radius-xs);
  }

  .lane-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .lane-tab {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    padding: 0.25rem 0.65rem;
    border-radius: var(--radius-xs);
    background: var(--bg-card);
    color: var(--text-dim);
    border: 1px solid var(--border-tech);
    letter-spacing: 0.5px;
    transition: all 0.15s ease;
  }

  .lane-tab:hover {
    color: var(--text-pure);
    border-color: var(--border-tech-bright);
  }

  .lane-tab.is-active {
    background: var(--gold-mythic);
    color: #05070d;
    border-color: var(--gold-mythic);
    box-shadow: 0 0 12px var(--gold-glow);
  }

  .scout-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }

  .scout-card {
    background: var(--bg-card);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-sm);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .scout-card:hover {
    border-color: var(--gold-border);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .card-hero-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar-frame {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    border: 1px solid var(--gold-border);
    background: #090e18;
    flex-shrink: 0;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-credentials {
    flex: 1;
    min-width: 0;
  }

  .name-lane-line {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .hero-name {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-pure);
    letter-spacing: 0.5px;
  }

  .lane-tag {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: var(--radius-xs);
    background: rgba(14, 165, 233, 0.15);
    color: var(--ally-cyan);
    border: 1px solid var(--ally-border);
  }

  .hero-role-text {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  .role-meta-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2px;
  }

  .rec-meta-badge {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .rec-meta-badge.tier-s\+ {
    color: #facc15;
    border-color: rgba(250, 204, 21, 0.5);
    background: rgba(234, 179, 8, 0.15);
  }

  .rec-meta-badge.tier-s {
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.4);
    background: rgba(34, 197, 94, 0.15);
  }

  .rec-meta-badge.tier-a {
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.3);
  }

  .rec-meta-badge.tier-b {
    color: #94a3b8;
  }

  .rating-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .rating-value {
    font-family: var(--font-mono);
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--emerald-live);
    line-height: 1;
  }

  .rating-label {
    font-family: var(--font-mono);
    font-size: 0.55rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .tactical-reasons {
    background: rgba(5, 7, 13, 0.45);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.55rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-height: 52px;
  }

  .reason-item {
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    font-size: 0.78rem;
    color: #cbd5e1;
    line-height: 1.35;
  }

  .reason-bullet {
    font-family: var(--font-mono);
    font-weight: 800;
    color: var(--gold-mythic);
    font-size: 0.7rem;
    flex-shrink: 0;
  }

  .lock-in-trigger {
    width: 100%;
    padding: 0.5rem;
    border-radius: var(--radius-xs);
    background: rgba(14, 165, 233, 0.12);
    color: var(--ally-cyan);
    border: 1px solid var(--ally-border);
    font-family: var(--font-display);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: auto;
    transition: all 0.15s ease;
  }

  .lock-in-trigger:hover {
    background: var(--ally-blue);
    color: white;
    box-shadow: 0 0 16px var(--ally-glow);
  }

  .trigger-arrow {
    transition: transform 0.15s ease;
  }

  .lock-in-trigger:hover .trigger-arrow {
    transform: translateX(3px);
  }

  .scout-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 1.5rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px dashed var(--border-tech);
    border-radius: var(--radius-sm);
  }

  .empty-code {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 2px;
    display: block;
    margin-bottom: 0.5rem;
  }

  .scout-empty p {
    font-size: 0.85rem;
    color: var(--text-muted);
    max-width: 440px;
    margin: 0 auto;
  }
</style>
