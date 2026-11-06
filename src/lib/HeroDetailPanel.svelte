<script>
  import * as engine from './counterEngine.js';

  let {
    guide = null,
    allHeroes = [],
    customLoadout = null,
    onOpenPreparation,
    onSelectHero
  } = $props();

  function handleHeroChange(e) {
    const name = e.target.value;
    const hero = allHeroes.find(h => h.hero_name === name);
    if (hero && onSelectHero) {
      onSelectHero(hero);
    }
  }

  // Determine active spell, emblem, and build items taking customLoadout into account
  let effectiveSpellName = $derived(
    customLoadout?.spell?.name || customLoadout?.spell?.id || guide?.battleSpell?.name || 'Flicker'
  );

  let effectiveEmblemBase = $derived(
    customLoadout?.emblem?.base || guide?.emblem?.name || 'Common'
  );

  let effectiveTier1 = $derived(
    customLoadout?.emblem?.tier1?.name || customLoadout?.emblem?.tier1 || guide?.emblem?.tier1 || 'Thrill'
  );

  let effectiveTier2 = $derived(
    customLoadout?.emblem?.tier2?.name || customLoadout?.emblem?.tier2 || guide?.emblem?.tier2 || 'Master Assassin'
  );

  let effectiveTier3 = $derived(
    customLoadout?.emblem?.tier3?.name || customLoadout?.emblem?.tier3 || guide?.emblem?.tier3 || 'Killing Spree'
  );

  let effectiveBuild = $derived(
    customLoadout?.items?.length
      ? customLoadout.items.map((itemName, idx) => {
          const original = guide?.build?.find(b => b.name === itemName);
          return {
            name: itemName,
            reason: original ? original.reason : 'Pilihan kustom pemain untuk hero ini.',
            isCounter: original ? original.isCounter : false
          };
        })
      : guide?.build || []
  );

  let heroWr = $derived(guide?.hero ? engine.getHeroWinrate(guide.hero.hero_name) : null);
  const metaSync = engine.getWinrateMetadata();
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
            <span class="active-tag">HERO LOADOUT</span>
            {#if customLoadout}
              <span class="custom-badge">CUSTOM PREPARATION</span>
            {/if}
          </div>
          <span class="dossier-class">{guide.hero.class} // {guide.playstyle || 'TACTICAL ASSET'}</span>
        </div>
      </div>

      <!-- ACTIONS: QUICK PREPARATION TRIGGER & QUICK HERO SELECTOR -->
      <div class="header-right-cluster">
        {#if onOpenPreparation}
          <button
            type="button"
            class="prep-modal-trigger"
            onclick={() => onOpenPreparation(guide.hero, 'build')}
            title="Buka Menu Persiapan In-Game Lengkap"
          >
            <span class="btn-ic">⚙️</span>
            <span>CUSTOMIZE BUILD / EMBLEM</span>
          </button>
        {/if}

        {#if allHeroes && allHeroes.length > 0}
          <div class="quick-switcher">
            <label for="hero-select-input" class="switcher-label">INSPECT HERO:</label>
            <div class="select-wrapper">
              <select
                id="hero-select-input"
                class="hero-select-box"
                value={guide?.hero?.hero_name || ''}
                onchange={handleHeroChange}
              >
                {#each allHeroes as h}
                  <option value={h.hero_name}>{h.hero_name} ({h.class})</option>
                {/each}
              </select>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- CURRENT META STATS STRIP -->
    {#if heroWr}
      <div class="meta-dossier-strip">
        <div class="meta-strip-item tier-item">
          <span class="meta-label">META TIER</span>
          <span class="meta-val tier-badge tier-{heroWr.tier?.toLowerCase()}">{heroWr.tier} TIER</span>
        </div>
        <div class="meta-strip-item">
          <span class="meta-label">WINRATE</span>
          <span class="meta-val wr-val">{heroWr.winrate}</span>
        </div>
        <div class="meta-strip-item">
          <span class="meta-label">BANRATE</span>
          <span class="meta-val ban-val">{heroWr.banrate}</span>
        </div>
        <div class="meta-strip-item">
          <span class="meta-label">PICKRATE</span>
          <span class="meta-val pick-val">{heroWr.pickrate}</span>
        </div>
        <div class="meta-strip-item meta-timestamp-item">
          <span class="meta-label">MOONTON RANK DATA</span>
          <span class="meta-timestamp-val">
            <span class="meta-pulse-dot"></span>
            Update Terakhir: {metaSync.last_updated} ({metaSync.rank_scope})
          </span>
        </div>
      </div>
    {/if}

    <!-- SPELL & EMBLEM SPLIT CONSOLE -->
    <div class="console-subgrid">
      <!-- 1. BATTLE SPELL SELECTION -->
      <div class="sub-cell spell-cell">
        <div class="cell-head">
          <span class="cell-tag">TACTICAL SPELL</span>
          <h4 class="cell-title">BATTLE SPELL DIRECTIVE</h4>
        </div>

        <div class="spell-payload">
          <!-- Active Spell -->
          <div class="spell-banner">
            <div class="spell-icon-box">
              <img src={engine.getSpellIcon(effectiveSpellName)} alt={effectiveSpellName} class="panel-spell-img" />
            </div>
            <div class="spell-title-col">
              <span class="spell-callsign">{effectiveSpellName.toUpperCase()}</span>
              <span class="spell-status-tag">{customLoadout?.spell ? 'CUSTOM EQUIPPED' : 'MATCHUP CHOICE'}</span>
            </div>
            {#if onOpenPreparation}
              <button
                type="button"
                class="quick-slot-change"
                onclick={() => onOpenPreparation(guide.hero, 'spell')}
                title="Ganti Battle Spell"
              >
                GANTI
              </button>
            {/if}
          </div>
          <p class="spell-logic">{guide.battleSpell.reason}</p>

          <!-- Situational / Alternate Spell -->
          {#if guide.allSpells && guide.allSpells.situational && guide.allSpells.situational.name !== effectiveSpellName}
            <div class="alt-spell-box">
              <div class="alt-spell-head">
                <img src={engine.getSpellIcon(guide.allSpells.situational.name)} alt={guide.allSpells.situational.name} class="alt-spell-mini" />
                <span class="alt-tag">OPSI ALTERNATIF / SITUASIONAL:</span>
                <span class="alt-name">{guide.allSpells.situational.name} ({guide.allSpells.situational.cd || '90s'})</span>
              </div>
              <p class="alt-desc">{guide.allSpells.situational.reason}</p>
            </div>
          {/if}
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
            <div class="emblem-mini-icon">
              <img src={engine.getEmblemIcon(effectiveEmblemBase)} alt={effectiveEmblemBase} class="panel-emblem-img" />
            </div>
            <div class="emblem-name-col">
              <span class="base-lbl">BASE EMBLEM:</span>
              <span class="base-val">{effectiveEmblemBase.toUpperCase()}</span>
            </div>
            {#if onOpenPreparation}
              <button
                type="button"
                class="quick-slot-change"
                onclick={() => onOpenPreparation(guide.hero, 'emblem')}
                title="Atur Emblem & Talenta"
              >
                ATUR
              </button>
            {/if}
          </div>
          <p class="emblem-rationale">{guide.emblem.rationale}</p>

          <div class="talent-nodes">
            <div class="node-item">
              <img src={engine.getTalentIcon(effectiveTier1)} alt={effectiveTier1} class="node-icon-art" />
              <div class="node-texts">
                <span class="node-tier">T1</span>
                <span class="node-desc">{effectiveTier1}</span>
              </div>
            </div>
            <div class="node-item">
              <img src={engine.getTalentIcon(effectiveTier2)} alt={effectiveTier2} class="node-icon-art" />
              <div class="node-texts">
                <span class="node-tier">T2</span>
                <span class="node-desc">{effectiveTier2}</span>
              </div>
            </div>
            <div class="node-item t3-node">
              <img src={engine.getTalentIcon(effectiveTier3)} alt={effectiveTier3} class="node-icon-art" />
              <div class="node-texts">
                <span class="node-tier t3-tier">T3</span>
                <span class="node-desc t3-desc">{effectiveTier3}</span>
              </div>
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
        <div class="right-legend-group">
          {#if onOpenPreparation}
            <button
              type="button"
              class="quick-shop-btn"
              onclick={() => onOpenPreparation(guide.hero, 'build')}
              title="Buka Shop & Ganti Item"
            >
              SHOP & MODIFIKASI
            </button>
          {/if}
          <div class="legend-indicator">
            <span class="legend-bracket"></span>
            <span class="legend-text">GOLD = COUNTER</span>
          </div>
        </div>
      </div>

      <div class="inventory-slots">
        {#each effectiveBuild as item, index}
          <div class="slot-item" class:is-reactive={item.isCounter}>
            <div class="slot-sequence">0{index + 1}</div>
            <div class="item-visual-box">
              <img src={engine.getItemIcon(item.name)} alt={item.name} class="item-img-art" />
            </div>
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
          <h4 class="cell-title">HERO & MATCHUP EXECUTION DIRECTIVES</h4>
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
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

  .custom-badge {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: var(--radius-xs);
    background: rgba(168, 85, 247, 0.25);
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.5);
    letter-spacing: 0.5px;
  }

  .header-right-cluster {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .prep-modal-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.9rem;
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.35) 100%);
    border: 1px solid var(--gold-mythic);
    border-radius: var(--radius-xs);
    color: #ffffff;
    font-family: var(--font-display);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
    transition: all 0.15s ease;
  }

  .prep-modal-trigger:hover {
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.55) 100%);
    box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
    transform: translateY(-1px);
  }

  .btn-ic {
    font-size: 0.9rem;
  }

  .spell-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1.5px solid var(--gold-mythic);
    background: #000;
    overflow: hidden;
    flex-shrink: 0;
  }

  .panel-spell-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .alt-spell-mini {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
  }

  .quick-slot-change {
    margin-left: auto;
    padding: 0.2rem 0.6rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    color: #cbd5e1;
    font-size: 0.65rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.12s ease;
  }

  .quick-slot-change:hover {
    background: var(--gold-mythic);
    color: #000;
    border-color: var(--gold-mythic);
  }

  .emblem-mini-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1.5px solid var(--ally-cyan);
    background: #000;
    overflow: hidden;
    flex-shrink: 0;
  }

  .panel-emblem-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .emblem-name-col {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .node-icon-art {
    width: 24px;
    height: 24px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .node-texts {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
  }

  .right-legend-group {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .quick-shop-btn {
    padding: 0.25rem 0.65rem;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.4);
    border-radius: 3px;
    color: #d8b4fe;
    font-size: 0.68rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.12s ease;
  }

  .quick-shop-btn:hover {
    background: rgba(168, 85, 247, 0.35);
    color: #ffffff;
  }

  .item-visual-box {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: #000;
    overflow: hidden;
    flex-shrink: 0;
  }

  .item-img-art {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

  .quick-switcher {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .switcher-label {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--gold-mythic);
    letter-spacing: 1px;
  }

  .select-wrapper {
    position: relative;
  }

  .hero-select-box {
    background: rgba(5, 7, 13, 0.8);
    border: 1px solid var(--border-tech-bright);
    color: var(--text-pure);
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-xs);
    cursor: pointer;
    outline: none;
    transition: all 0.15s ease;
  }

  .hero-select-box:hover, .hero-select-box:focus {
    border-color: var(--ally-cyan);
    box-shadow: 0 0 12px var(--ally-glow);
  }

  .hero-select-box option {
    background: #0b101c;
    color: #e2e8f0;
  }

  /* CURRENT META STATS STRIP */
  .meta-dossier-strip {
    display: grid;
    grid-template-columns: auto repeat(3, 1fr) 2fr;
    gap: 0.75rem;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.65rem 1rem;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 768px) {
    .meta-dossier-strip {
      grid-template-columns: 1fr 1fr;
    }
    .meta-timestamp-item {
      grid-column: 1 / -1;
    }
  }

  .meta-strip-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .meta-label {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .meta-val {
    font-family: var(--font-mono);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .tier-badge {
    font-size: 0.72rem;
    padding: 2px 8px;
    border-radius: var(--radius-xs);
    font-family: var(--font-mono);
    font-weight: 700;
    width: fit-content;
  }

  .tier-badge.tier-s\+ {
    background: rgba(234, 179, 8, 0.2);
    color: #facc15;
    border: 1px solid rgba(250, 204, 21, 0.5);
    box-shadow: 0 0 10px rgba(250, 204, 21, 0.2);
  }

  .tier-badge.tier-s {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.4);
  }

  .tier-badge.tier-a {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }

  .tier-badge.tier-b {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .wr-val {
    color: #4ade80;
  }

  .ban-val {
    color: #fb7185;
  }

  .pick-val {
    color: #38bdf8;
  }

  .meta-timestamp-item {
    align-items: flex-end;
  }

  .meta-timestamp-val {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--gold-mythic);
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 600;
  }

  .meta-pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
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
    .quick-switcher {
      align-items: flex-start;
      width: 100%;
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
    gap: 0.65rem;
  }

  .spell-banner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .spell-title-col {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .alt-spell-box {
    background: rgba(5, 7, 13, 0.5);
    border: 1px solid var(--border-tech);
    padding: 0.5rem 0.65rem;
    border-radius: var(--radius-xs);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .alt-spell-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .alt-tag {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-dim);
  }

  .alt-name {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--ally-cyan);
  }

  .alt-desc {
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.35;
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
