<script>
  import * as engine from './counterEngine.js';

  let {
    guide = null,
    allHeroes = [],
    enemyHeroes = [],
    customLoadout = null,
    onOpenPreparation,
    onSelectHero
  } = $props();

  let selectedEnemyHeroName = $state('');
  let activeSituationalTrigger = $state(null);

  // Auto-detect laning partner if none selected
  let laningOpponent = $derived.by(() => {
    if (!enemyHeroes || enemyHeroes.length === 0) return null;
    if (selectedEnemyHeroName) {
      return enemyHeroes.find(h => h.hero_name === selectedEnemyHeroName) || enemyHeroes[0];
    }
    const myLane = engine.normalizeLane(guide?.hero);
    const sameLaneEnemy = enemyHeroes.find(h => engine.normalizeLane(h) === myLane);
    return sameLaneEnemy || enemyHeroes[0];
  });

  let laneMatchup = $derived(
    guide?.hero && laningOpponent
      ? engine.getLaneMatchup(guide.hero, laningOpponent, engine.normalizeLane(guide.hero))
      : null
  );

  let situationalSwaps = $derived(
    guide?.hero ? engine.getSituationalSwaps(guide.hero) : []
  );

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

    <!-- SITUATIONAL ITEM SWAP SIMULATOR -->
    <div class="sub-cell item-swap-simulator">
      <div class="cell-head">
        <span class="cell-tag">IN-GAME ADAPTIVE PROTOCOL</span>
        <h4 class="cell-title">SITUATIONAL ITEM SWAP SIMULATOR</h4>
      </div>
      <p class="swap-desc">
        Musuh mulai membeli item pertahanan spesifik saat in-game? Klik skenario berikut untuk melihat rekomendasi item adaptif:
      </p>

      <div class="swap-triggers-grid">
        {#each situationalSwaps as trigger}
          <button
            type="button"
            class="trigger-chip"
            class:is-active={activeSituationalTrigger?.id === trigger.id}
            onclick={() => {
              activeSituationalTrigger = activeSituationalTrigger?.id === trigger.id ? null : trigger;
            }}
          >
            <img src={trigger.icon} alt={trigger.name} class="chip-ic" onerror={(e) => { e.target.style.display = 'none'; }} />
            <span>{trigger.name}</span>
          </button>
        {/each}
      </div>

      {#if activeSituationalTrigger}
        <div class="swap-result-box tech-bracket">
          <div class="swap-head">
            <span class="swap-badge">REKOMENDASI ADAPTASI ITEM</span>
            <span class="swap-trigger-name">{activeSituationalTrigger.name}</span>
          </div>

          <div class="swap-flow-row">
            <div class="swap-node replace-node">
              <span class="swap-label">GANTI ITEM INI:</span>
              <span class="swap-val-tag">{activeSituationalTrigger.suggestion.replaces}</span>
            </div>
            <div class="swap-arrow">➔</div>
            <div class="swap-node in-node">
              <span class="swap-label">DENGAN ITEM INI:</span>
              <div class="item-reco-row">
                <img src={engine.getItemIcon(activeSituationalTrigger.suggestion.swapIn)} alt="" class="reco-item-img" />
                <span class="swap-val-tag reco-name">{activeSituationalTrigger.suggestion.swapIn}</span>
              </div>
            </div>
          </div>

          <div class="swap-reason-box">
            <span class="reason-prefix">ALASAN TAKTIS:</span>
            <p class="reason-content">{activeSituationalTrigger.suggestion.reason}</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- 1V1 LANING MATCHUP GUIDE -->
    {#if laneMatchup}
      <div class="sub-cell laning-matchup-cell">
        <div class="cell-head between-head">
          <div>
            <span class="cell-tag">1V1 MICRO DIRECTIVE</span>
            <h4 class="cell-title">1V1 LANING MATCHUP ({laneMatchup.lane.toUpperCase()})</h4>
          </div>

          {#if enemyHeroes && enemyHeroes.length > 1}
            <div class="enemy-select-inline">
              <label for="enemy-lane-opponent" class="enemy-select-lbl">DUEL VS:</label>
              <select id="enemy-lane-opponent" class="enemy-dropdown" bind:value={selectedEnemyHeroName}>
                {#each enemyHeroes as eh}
                  <option value={eh.hero_name}>{eh.hero_name} ({eh.class})</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>

        <div class="laning-dossier-card">
          <div class="duel-profiles-row">
            <div class="duel-hero ally-duel">
              <img src={guide.hero.portrait || '/default-hero.webp'} alt={guide.hero.hero_name} class="duel-art" />
              <div class="duel-info">
                <span class="duel-name">{guide.hero.hero_name}</span>
                <span class="duel-side">ALLY</span>
              </div>
            </div>

            <div class="duel-verdict-box">
              <span class="verdict-tag verdict-{laneMatchup.advantage.toLowerCase()}">
                {laneMatchup.advantage === 'ADVANTAGE' ? 'UNGGUL LANING' : laneMatchup.advantage === 'DISADVANTAGE' ? 'WASPADA LANING' : 'LANING SEIMBANG'}
              </span>
              <span class="verdict-strategy">STRATEGI: {laneMatchup.waveStrategy.replace(/_/g, ' ')}</span>
            </div>

            <div class="duel-hero enemy-duel">
              <img src={laneMatchup.enemy.portrait || '/default-hero.webp'} alt={laneMatchup.enemy.hero_name} class="duel-art" />
              <div class="duel-info enemy-info">
                <span class="duel-name">{laneMatchup.enemy.hero_name}</span>
                <span class="duel-side enemy-side">OPPONENT</span>
              </div>
            </div>
          </div>

          <div class="spike-box">
            <span class="spike-header">⚡ ANALISIS POWER SPIKE LEVEL 1-3:</span>
            <p class="spike-text">{laneMatchup.earlySpikeVerdict}</p>
          </div>

          <div class="strategy-box">
            <span class="strategy-header">🛡️ PANDUAN WAVE MINION & ROTASI:</span>
            <p class="strategy-text">{laneMatchup.strategyText}</p>
          </div>

          {#if laneMatchup.analysisPoints.length > 0}
            <div class="tactical-notes-list">
              {#each laneMatchup.analysisPoints as pt}
                <div class="tactical-note-item">
                  <span class="bullet">//</span>
                  <span>{pt}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

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

  .spell-icon-box {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-xs);
    border: 1.5px solid var(--gold-mythic);
    overflow: hidden;
    background: #090e18;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel-spell-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

  .alt-spell-mini {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
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

  .node-icon-art {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    object-fit: contain;
    flex-shrink: 0;
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

  .item-visual-box {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-xs);
    background: #090e18;
    border: 1px solid var(--border-tech);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }

  .item-img-art {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

  /* ITEM SWAP SIMULATOR */
  .item-swap-simulator {
    border-color: rgba(245, 158, 11, 0.35);
    background: rgba(15, 23, 42, 0.4);
  }

  .swap-desc {
    font-size: 0.78rem;
    color: var(--text-dim);
    margin-bottom: 0.85rem;
    line-height: 1.4;
  }

  .swap-triggers-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.85rem;
  }

  .trigger-chip {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid var(--border-tech);
    padding: 0.35rem 0.65rem;
    border-radius: var(--radius-xs);
    font-family: var(--font-display);
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-dim);
    transition: all 0.15s ease;
  }

  .trigger-chip:hover {
    color: var(--text-pure);
    border-color: var(--border-tech-bright);
    transform: translateY(-1px);
  }

  .trigger-chip.is-active {
    background: rgba(245, 158, 11, 0.2);
    border-color: var(--gold-mythic);
    color: #fef08a;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
  }

  .chip-ic {
    width: 18px;
    height: 18px;
    border-radius: 2px;
    object-fit: cover;
  }

  .swap-result-box {
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid var(--gold-border);
    border-radius: var(--radius-xs);
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .swap-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0.45rem;
  }

  .swap-badge {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--gold-mythic);
    letter-spacing: 0.5px;
  }

  .swap-trigger-name {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: #e2e8f0;
  }

  .swap-flow-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .swap-node {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .swap-label {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  .swap-val-tag {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 700;
    color: #fca5a5;
  }

  .swap-arrow {
    color: var(--gold-mythic);
    font-size: 1.1rem;
    font-weight: bold;
  }

  .item-reco-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .reco-item-img {
    width: 26px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid var(--gold-mythic);
  }

  .reco-name {
    color: #4ade80;
  }

  .swap-reason-box {
    background: rgba(255, 255, 255, 0.03);
    border-left: 3px solid var(--gold-mythic);
    padding: 0.5rem 0.75rem;
    border-radius: 0 4px 4px 0;
  }

  .reason-prefix {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--gold-mythic);
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 2px;
  }

  .reason-content {
    font-size: 0.78rem;
    color: #e2e8f0;
    line-height: 1.4;
  }

  /* 1V1 LANING MATCHUP CELL */
  .laning-matchup-cell {
    border-color: rgba(56, 189, 248, 0.35);
  }

  .enemy-select-inline {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .enemy-select-lbl {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--text-dim);
    font-weight: 700;
  }

  .enemy-dropdown {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--enemy-border);
    color: var(--text-pure);
    font-family: var(--font-display);
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-xs);
    outline: none;
  }

  .laning-dossier-card {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .duel-profiles-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .duel-hero {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .duel-art {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-xs);
    object-fit: cover;
    border: 1.5px solid var(--border-tech);
  }

  .ally-duel .duel-art {
    border-color: var(--ally-cyan);
  }

  .enemy-duel .duel-art {
    border-color: var(--enemy-crimson);
  }

  .duel-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .duel-name {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-pure);
  }

  .duel-side {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--ally-cyan);
    letter-spacing: 0.5px;
  }

  .enemy-side {
    color: var(--enemy-crimson);
  }

  .duel-verdict-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .verdict-tag {
    font-family: var(--font-display);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 1px;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-xs);
  }

  .verdict-advantage {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.5);
  }

  .verdict-even {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.5);
  }

  .verdict-disadvantage {
    background: rgba(244, 63, 94, 0.2);
    color: #fb7185;
    border: 1px solid rgba(244, 63, 94, 0.5);
  }

  .verdict-strategy {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--gold-mythic);
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .spike-box, .strategy-box {
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-xs);
    padding: 0.6rem 0.85rem;
    border: 1px solid var(--border-tech);
  }

  .spike-header, .strategy-header {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--gold-mythic);
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 0.25rem;
  }

  .spike-text, .strategy-text {
    font-size: 0.8rem;
    color: #e2e8f0;
    line-height: 1.4;
  }

  .tactical-notes-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .tactical-note-item {
    font-size: 0.75rem;
    color: var(--text-dim);
    display: flex;
    gap: 0.4rem;
  }

  .bullet {
    color: var(--ally-cyan);
    font-family: var(--font-mono);
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .loadout-console {
      padding: 0.75rem;
      gap: 0.75rem;
    }

    .console-dossier-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.65rem;
      padding-bottom: 0.65rem;
    }

    .dossier-profile {
      gap: 0.65rem;
    }

    .dossier-avatar {
      width: 48px;
      height: 48px;
    }

    .dossier-name {
      font-size: 1.05rem;
    }

    .header-right-cluster {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .prep-modal-trigger {
      width: 100%;
      justify-content: center;
      padding: 0.45rem 0.75rem;
      font-size: 0.72rem;
    }

    .quick-switcher {
      width: 100%;
      align-items: stretch;
    }

    .hero-select-box {
      width: 100%;
      font-size: 0.78rem;
    }

    .meta-dossier-strip {
      grid-template-columns: repeat(4, 1fr);
      padding: 0.45rem 0.6rem;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
    }

    .meta-timestamp-item {
      display: none;
    }

    .meta-label {
      font-size: 0.52rem;
    }

    .meta-val {
      font-size: 0.82rem;
    }

    .tier-badge {
      font-size: 0.62rem;
      padding: 1px 5px;
    }

    .sub-cell {
      padding: 0.75rem;
    }

    .cell-head {
      margin-bottom: 0.65rem;
    }

    .cell-title {
      font-size: 0.85rem;
    }

    .spell-banner {
      gap: 0.5rem;
    }

    .spell-icon-box {
      width: 38px;
      height: 38px;
    }

    .spell-callsign {
      font-size: 0.95rem;
    }

    .inventory-slots {
      grid-template-columns: 1fr;
      gap: 0.45rem;
    }

    .slot-item {
      padding: 0.5rem 0.65rem;
      gap: 0.55rem;
    }

    .item-visual-box {
      width: 36px;
      height: 36px;
    }

    .item-callsign {
      font-size: 0.82rem;
    }

    .item-intel {
      font-size: 0.7rem;
      line-height: 1.35;
    }

    .swap-desc {
      font-size: 0.72rem;
      margin-bottom: 0.6rem;
    }

    .swap-triggers-grid {
      gap: 0.3rem;
    }

    .trigger-chip {
      font-size: 0.62rem;
      padding: 0.22rem 0.45rem;
    }

    .chip-ic {
      width: 15px;
      height: 15px;
    }

    .duel-profiles-row {
      padding: 0.5rem 0.65rem;
    }

    .duel-art {
      width: 36px;
      height: 36px;
    }

    .duel-name {
      font-size: 0.8rem;
    }

    .verdict-tag {
      font-size: 0.68rem;
      padding: 0.15rem 0.5rem;
    }
  }
</style>
