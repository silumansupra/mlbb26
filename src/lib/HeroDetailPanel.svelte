<script>
  let { guide = null } = $props();
</script>

{#if guide}
  <div class="loadout-console">
    <!-- HERO PROFILE HEADER -->
    <div class="console-dossier-bar">
      <div class="dossier-profile">
        <div class="dossier-avatar tech-bracket">
          <img src={guide.hero.portrait || '/default-hero.webp'} alt={guide.hero.hero_name} />
        </div>
        <div class="dossier-meta">
          <div class="dossier-title-line">
            <h2 class="dossier-name">{guide.hero.hero_name.toUpperCase()}</h2>
            <span class="active-tag">ACTIVE HERO LOADOUT</span>
          </div>
          <span class="dossier-class">{guide.hero.class} // {guide.hero.speciality?.join(' • ') || 'TACTICAL ASSET'}</span>
        </div>
      </div>
    </div>

    <!-- SPELL & EMBLEM SPLIT CONSOLE -->
    <div class="console-subgrid">
      <!-- 1. BATTLE SPELL SELECTION -->
      <div class="sub-cell spell-cell">
        <div class="cell-head">
          <span class="cell-tag">TACTICAL SPELL</span>
          <h4 class="cell-title">COMBAT SPELL DIRECTIVE</h4>
        </div>

        <div class="spell-payload">
          <div class="spell-banner">
            <span class="spell-callsign">{guide.battleSpell.name.toUpperCase()}</span>
            <span class="spell-status-tag">RECOMMENDED</span>
          </div>
          <p class="spell-logic">{guide.battleSpell.reason}</p>
        </div>
      </div>

      <!-- 2. EMBLEM MATRIX -->
      <div class="sub-cell emblem-cell">
        <div class="cell-head">
          <span class="cell-tag">EMBLEM MATRIX</span>
          <h4 class="cell-title">3-TIER TALENT CONFIG</h4>
        </div>

        <div class="emblem-payload">
          <div class="base-emblem-indicator">
            <span class="base-lbl">BASE EMBLEM:</span>
            <span class="base-val">{guide.emblem.name.toUpperCase()}</span>
          </div>
          <p class="emblem-rationale">{guide.emblem.rationale}</p>

          <div class="talent-nodes">
            <div class="node-item">
              <span class="node-tier">T1</span>
              <span class="node-desc">{guide.emblem.tier1}</span>
            </div>
            <div class="node-item">
              <span class="node-tier">T2</span>
              <span class="node-desc">{guide.emblem.tier2}</span>
            </div>
            <div class="node-item t3-node">
              <span class="node-tier t3-tier">T3</span>
              <span class="node-desc t3-desc">{guide.emblem.tier3}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. ADAPTIVE 6-ITEM BUILD -->
    <div class="sub-cell items-cell">
      <div class="cell-head between-head">
        <div>
          <span class="cell-tag">EQUIPMENT PROTOCOL</span>
          <h4 class="cell-title">ADAPTIVE 6-ITEM COUNTER BUILD</h4>
        </div>
        <div class="legend-indicator">
          <span class="legend-bracket"></span>
          <span class="legend-text">GOLD BORDER = REACTIVE COUNTERMEASURE</span>
        </div>
      </div>

      <div class="inventory-slots">
        {#each guide.build as item, index}
          <div class="slot-item" class:is-reactive={item.isCounter}>
            <div class="slot-sequence">0{index + 1}</div>
            <div class="slot-details">
              <div class="item-title-row">
                <span class="item-callsign">{item.name}</span>
                {#if item.isCounter}
                  <span class="counter-stamp">COUNTERMEASURE</span>
                {/if}
              </div>
              <p class="item-intel">{item.reason}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- 4. COMBAT DIRECTIVES -->
    {#if guide.tips && guide.tips.length > 0}
      <div class="sub-cell directives-cell">
        <div class="cell-head">
          <span class="cell-tag alert-tag">TACTICAL INTEL</span>
          <h4 class="cell-title">MATCHUP EXECUTION DIRECTIVES</h4>
        </div>

        <div class="directives-stack">
          {#each guide.tips as tip, idx}
            <div class="directive-entry">
              <span class="directive-num">DIR//0{idx + 1}</span>
              <p class="directive-body">{tip}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .loadout-console {
    background: var(--bg-panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  }

  .console-dossier-bar {
    border-bottom: 1px solid var(--border-tech);
    padding-bottom: 1rem;
  }

  .dossier-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .dossier-avatar {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    border: 2px solid var(--ally-cyan);
    background: #090e18;
    flex-shrink: 0;
  }

  .dossier-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .dossier-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dossier-title-line {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
  }

  .dossier-name {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--text-pure);
  }

  .active-tag {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: var(--radius-xs);
    background: rgba(14, 165, 233, 0.18);
    color: var(--ally-cyan);
    border: 1px solid var(--ally-border);
    letter-spacing: 1px;
  }

  .dossier-class {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  .console-subgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 820px) {
    .console-subgrid {
      grid-template-columns: 1fr;
    }
  }

  .sub-cell {
    background: var(--bg-card);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-sm);
    padding: 1.15rem;
  }

  .cell-head {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 0.85rem;
  }

  .between-head {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .cell-tag {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 1.5px;
  }

  .alert-tag {
    color: var(--enemy-crimson);
  }

  .cell-title {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--text-pure);
  }

  .spell-payload {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .spell-banner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .spell-callsign {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--gold-mythic);
    letter-spacing: 1px;
    text-shadow: 0 0 10px var(--gold-glow);
  }

  .spell-status-tag {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    background: rgba(251, 191, 36, 0.15);
    color: var(--gold-mythic);
    border: 1px solid var(--gold-border);
  }

  .spell-logic {
    font-size: 0.8rem;
    color: #cbd5e1;
    line-height: 1.4;
  }

  .emblem-payload {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .base-emblem-indicator {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .base-lbl {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  .base-val {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--ally-cyan);
    letter-spacing: 0.5px;
  }

  .emblem-rationale {
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.35;
  }

  .talent-nodes {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.25rem;
  }

  .node-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(5, 7, 13, 0.4);
    border: 1px solid var(--border-tech);
    padding: 0.3rem 0.55rem;
    border-radius: var(--radius-xs);
  }

  .node-tier {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 800;
    color: var(--text-dim);
    background: rgba(255, 255, 255, 0.05);
    padding: 1px 5px;
    border-radius: 2px;
  }

  .node-desc {
    font-size: 0.78rem;
    color: #e2e8f0;
  }

  .t3-node {
    border-color: rgba(251, 191, 36, 0.35);
    background: rgba(251, 191, 36, 0.06);
  }

  .t3-tier {
    color: var(--gold-mythic);
    background: rgba(251, 191, 36, 0.2);
  }

  .t3-desc {
    color: #fef08a;
    font-weight: 600;
  }

  .legend-indicator {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .legend-bracket {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold-mythic);
    box-shadow: 0 0 8px var(--gold-mythic);
  }

  .legend-text {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  .inventory-slots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.75rem;
  }

  .slot-item {
    background: rgba(5, 7, 13, 0.45);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.7rem 0.85rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    transition: all 0.15s ease;
  }

  .slot-item.is-reactive {
    border-color: var(--gold-border);
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(5, 7, 13, 0.6) 100%);
    box-shadow: 0 0 16px rgba(251, 191, 36, 0.12);
  }

  .slot-sequence {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--text-dim);
    width: 22px;
  }

  .slot-details {
    flex: 1;
    min-width: 0;
  }

  .item-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  .item-callsign {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-pure);
    letter-spacing: 0.5px;
  }

  .counter-stamp {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 2px;
    background: rgba(251, 191, 36, 0.2);
    color: var(--gold-mythic);
    border: 1px solid var(--gold-border);
    letter-spacing: 0.5px;
  }

  .item-intel {
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.35;
  }

  .directives-stack {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .directive-entry {
    background: rgba(244, 63, 94, 0.08);
    border: 1px solid rgba(244, 63, 94, 0.25);
    border-radius: var(--radius-xs);
    padding: 0.65rem 0.85rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .directive-num {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--enemy-crimson);
    letter-spacing: 1px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .directive-body {
    font-size: 0.8rem;
    color: #fecdd3;
    line-height: 1.4;
  }
</style>
