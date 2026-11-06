<script>
  let { guide = null } = $props();
</script>

{#if guide}
  <div class="guide-panel">
    <!-- Header Hero Bar -->
    <div class="hero-top-bar">
      <div class="hero-identity">
        <div class="hero-avatar">
          <img src={guide.hero.portrait || '/default-hero.webp'} alt={guide.hero.hero_name} />
        </div>
        <div class="hero-texts">
          <div class="name-status">
            <h2>Panduan Matchup: {guide.hero.hero_name}</h2>
            <span class="active-badge">Hero Terpilih</span>
          </div>
          <p class="role-desc">{guide.hero.class} • {guide.hero.speciality?.join(', ') || 'Specialist'}</p>
        </div>
      </div>
    </div>

    <!-- Matchup Strategy Cards Grid -->
    <div class="guide-grid">
      <!-- 1. Battle Spell Card -->
      <div class="card-box spell-box">
        <div class="box-title">
          <span class="box-icon">⚡</span>
          <h4>Battle Spell Wajib</h4>
        </div>
        <div class="spell-content">
          <div class="spell-badge-wrap">
            <span class="spell-badge">{guide.battleSpell.name}</span>
          </div>
          <div class="spell-info">
            <p class="spell-reason">{guide.battleSpell.reason}</p>
          </div>
        </div>
      </div>

      <!-- 2. Emblem & Talents Card -->
      <div class="card-box emblem-box">
        <div class="box-title">
          <span class="box-icon">🛡️</span>
          <h4>Setup Emblem & Talent Optimal</h4>
        </div>
        <div class="emblem-content">
          <div class="base-emblem-badge">
            <span class="emblem-label">Base Emblem:</span>
            <span class="emblem-name">{guide.emblem.name}</span>
          </div>
          <p class="emblem-rationale">{guide.emblem.rationale}</p>
          
          <div class="talents-list">
            <div class="talent-row">
              <span class="tier-tag">T1</span>
              <span class="talent-text">{guide.emblem.tier1}</span>
            </div>
            <div class="talent-row">
              <span class="tier-tag">T2</span>
              <span class="talent-text">{guide.emblem.tier2}</span>
            </div>
            <div class="talent-row">
              <span class="tier-tag highlight-t3">T3</span>
              <span class="talent-text">{guide.emblem.tier3}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Adaptive 6-Item Build -->
    <div class="card-box build-box">
      <div class="box-title">
        <div class="title-with-extra">
          <span class="box-icon">⚔️</span>
          <h4>Rekomendasi 6 Item Adaptif (Counter Build)</h4>
        </div>
        <span class="counter-legend"><span class="glow-dot"></span> Item Berbingkai Emas = Item Penolak / Counter Musuh</span>
      </div>

      <div class="items-grid">
        {#each guide.build as item, index}
          <div class="item-card" class:is-counter={item.isCounter}>
            <div class="item-slot-num">{index + 1}</div>
            <div class="item-body">
              <div class="item-name-row">
                <span class="item-name">{item.name}</span>
                {#if item.isCounter}
                  <span class="counter-tag">COUNTER</span>
                {/if}
              </div>
              <p class="item-reason">{item.reason}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- 4. Danger Warnings & In-Game Tips -->
    {#if guide.tips && guide.tips.length > 0}
      <div class="card-box tips-box">
        <div class="box-title">
          <span class="box-icon">⚠️</span>
          <h4>Peringatan Bahaya & Trik Menghadapi Lawan di Match Ini</h4>
        </div>
        <div class="tips-list">
          {#each guide.tips as tip}
            <div class="tip-card">
              <p>{tip}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .guide-panel {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .hero-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
  }

  .hero-identity {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hero-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--primary-blue);
    box-shadow: 0 0 15px var(--primary-blue-glow);
  }

  .hero-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .name-status {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .name-status h2 {
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--text-main);
  }

  .active-badge {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.4);
    letter-spacing: 0.5px;
  }

  .role-desc {
    font-size: 0.85rem;
    color: var(--text-dim);
  }

  .guide-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    .guide-grid {
      grid-template-columns: 1fr;
    }
  }

  .card-box {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1.15rem;
  }

  .box-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.85rem;
  }

  .title-with-extra {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .box-icon {
    font-size: 1.1rem;
  }

  .box-title h4 {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .spell-content {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .spell-badge-wrap {
    display: flex;
  }

  .spell-badge {
    background: rgba(245, 158, 11, 0.15);
    color: var(--gold-accent);
    border: 1px solid rgba(245, 158, 11, 0.4);
    padding: 0.35rem 0.85rem;
    border-radius: var(--radius-sm);
    font-weight: 800;
    font-size: 0.95rem;
    box-shadow: 0 0 10px var(--gold-glow);
  }

  .spell-reason {
    font-size: 0.82rem;
    color: #cbd5e1;
    line-height: 1.4;
  }

  .base-emblem-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  }

  .emblem-label {
    font-size: 0.78rem;
    color: var(--text-dim);
  }

  .emblem-name {
    font-weight: 800;
    color: var(--primary-blue);
    font-size: 0.9rem;
  }

  .emblem-rationale {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
  }

  .talents-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .talent-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.35rem 0.6rem;
    border-radius: var(--radius-sm);
  }

  .tier-tag {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-dim);
  }

  .highlight-t3 {
    background: rgba(245, 158, 11, 0.2);
    color: var(--gold-accent);
    border: 1px solid rgba(245, 158, 11, 0.4);
  }

  .talent-text {
    font-size: 0.8rem;
    color: #e2e8f0;
  }

  .counter-legend {
    font-size: 0.72rem;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .glow-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold-accent);
    box-shadow: 0 0 8px var(--gold-accent);
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.75rem;
  }

  .item-card {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 0.75rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .item-card.is-counter {
    border-color: var(--gold-accent);
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(0, 0, 0, 0.25) 100%);
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
  }

  .item-slot-num {
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--text-dim);
    width: 20px;
    text-align: center;
  }

  .item-body {
    flex: 1;
  }

  .item-name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  .item-name {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .counter-tag {
    font-size: 0.6rem;
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 3px;
    background: rgba(245, 158, 11, 0.2);
    color: var(--gold-accent);
    border: 1px solid rgba(245, 158, 11, 0.4);
    letter-spacing: 0.5px;
  }

  .item-reason {
    font-size: 0.76rem;
    color: #94a3b8;
    line-height: 1.35;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tip-card {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    font-size: 0.82rem;
    color: #fca5a5;
    line-height: 1.4;
  }
</style>
