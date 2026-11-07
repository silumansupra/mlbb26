<script>
  import * as engine from './counterEngine.js';

  let {
    myTeam = [],
    enemyTeam = [],
    selectedSlot = null,
    customLoadouts = {},
    onSlotClick,
    onRemoveHero,
    onLoadPreset,
    onReset,
    onOpenPreparation,
    onExportCard,
    onShareLink
  } = $props();

  const laneLabels = ['GOLD LANE', 'EXP LANE', 'MID LANE', 'ROAM', 'JUNGLE'];
  const laneCodes = ['GLD', 'EXP', 'MID', 'ROM', 'JGL'];

  function getHeroEmblemIcon(hero) {
    if (!hero) return '/emblems/basic-common.webp';
    const custom = customLoadouts[hero.hero_name];
    if (custom?.emblem?.base) {
      return engine.getEmblemIcon(custom.emblem.base);
    }
    const guide = engine.getHeroBuild(hero.hero_name);
    return engine.getEmblemIcon(guide?.emblem?.base || 'Common');
  }

  function getHeroSpellIcon(hero) {
    if (!hero) return '/spells/flicker.png';
    const custom = customLoadouts[hero.hero_name];
    if (custom?.spell?.name || custom?.spell?.id) {
      return engine.getSpellIcon(custom.spell.name || custom.spell.id);
    }
    const guide = engine.getHeroBuild(hero.hero_name);
    return engine.getSpellIcon(guide?.spells?.primary?.name || 'Flicker');
  }

  function getHeroBuildIcon(hero) {
    if (!hero) return '/items/blade_of_despair.png';
    const custom = customLoadouts[hero.hero_name];
    if (custom?.items?.[0]) {
      return engine.getItemIcon(custom.items[0]);
    }
    const guide = engine.getHeroBuild(hero.hero_name);
    const firstItem = guide?.items?.core?.[0]?.name;
    return engine.getItemIcon(firstItem || 'Blade of Despair');
  }
</script>

<div class="draft-arena">
  <!-- ALLY SIDE (BLUE) -->
  <div class="team-stage ally-stage">
    <div class="stage-bar">
      <div class="team-label">
        <span class="team-badge ally-badge">BLUE SIDE</span>
        <h2 class="team-title">ALLY ROSTER</h2>
      </div>
      <div class="team-telemetry">
        <span class="telemetry-count">{myTeam.filter(Boolean).length} / 5 LOCKED</span>
      </div>
    </div>

    <div class="cards-deck">
      {#each [0, 1, 2, 3, 4] as index}
        {@const hero = myTeam[index]}
        {@const lane = laneLabels[index]}
        {@const code = laneCodes[index]}
        <div
          role="button"
          tabindex="0"
          class="draft-card ally-card tech-bracket"
          class:is-empty={!hero}
          class:is-active={selectedSlot?.team === 'my' && selectedSlot?.index === index}
          onclick={() => onSlotClick('my', index)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSlotClick('my', index); } }}
        >
          <div class="card-lane-strip" class:has-hero={!!hero}>
            <div class="lane-strip-left">
              <span class="lane-code">{code}</span>
              <span class="lane-name">{lane}</span>
            </div>
            {#if hero}
              <div class="lane-strip-setup" role="group" aria-label="Setup Buttons">
                <button
                  type="button"
                  class="setup-icon-btn emblem-btn"
                  title="Setup Emblem ({hero.hero_name})"
                  onclick={(e) => { e.stopPropagation(); onOpenPreparation && onOpenPreparation(hero, 'emblem'); }}
                >
                  <img src={getHeroEmblemIcon(hero)} alt="Emblem" class="strip-icon" />
                </button>
                <button
                  type="button"
                  class="setup-icon-btn spell-btn"
                  title="Setup Battle Spell ({hero.hero_name})"
                  onclick={(e) => { e.stopPropagation(); onOpenPreparation && onOpenPreparation(hero, 'spell'); }}
                >
                  <img src={getHeroSpellIcon(hero)} alt="Spell" class="strip-icon" />
                </button>
                <button
                  type="button"
                  class="setup-icon-btn build-btn"
                  title="Setup Build Items ({hero.hero_name})"
                  onclick={(e) => { e.stopPropagation(); onOpenPreparation && onOpenPreparation(hero, 'build'); }}
                >
                  <img src={getHeroBuildIcon(hero)} alt="Build Items" class="strip-icon" />
                </button>
              </div>
            {/if}
          </div>

          {#if hero}
            {@const wr = engine.getHeroWinrate(hero.hero_name)}
            <div class="hero-art-frame">
              <img src={hero.portrait || '/default-hero.webp'} alt={hero.hero_name} class="hero-art" />
              <button
                type="button"
                class="eject-btn"
                onclick={(e) => { e.stopPropagation(); onRemoveHero('my', index); }}
                title="Batalkan Pick"
              >
                ✕
              </button>
            </div>
            <div class="hero-dossier">
              <span class="hero-callsign">{hero.hero_name}</span>
              <div class="hero-subline">
                <span class="hero-type">{hero.class}</span>
                {#if wr}
                  <span class="card-wr-tag tier-{wr.tier?.toLowerCase()}" title="Winrate: {wr.winrate} | Banrate: {wr.banrate}">
                    WR {wr.winrate}
                  </span>
                {/if}
              </div>
            </div>
          {:else}
            <div class="placeholder-node">
              <div class="reticle-box">
                <span class="reticle-plus">+</span>
              </div>
              <span class="pick-cue">SELECT HERO</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- CENTER VERSUS NEXUS -->
  <div class="nexus-column">
    <div class="nexus-emblem">
      <div class="vs-text">VS</div>
      <span class="phase-tag">LIVE DRAFT</span>
    </div>

    <div class="tactical-actions">
      {#if onExportCard}
        <button type="button" class="action-trigger export-trigger" onclick={onExportCard} title="Download gambar infografis draft PNG turnamen">
          <span class="trigger-label">📸 EXPORT CARD</span>
        </button>
      {/if}
      {#if onShareLink}
        <button type="button" class="action-trigger share-trigger" onclick={onShareLink} title="Salin link draft ini ke clipboard">
          <span class="trigger-label">🔗 SHARE LINK</span>
        </button>
      {/if}
      <button type="button" class="action-trigger preset-trigger" onclick={onLoadPreset} title="Muat kasus musuh: Tigreal, Aamon, Cici, Badang">
        <span class="trigger-label">PRESET MATCH</span>
      </button>
      <button type="button" class="action-trigger reset-trigger" onclick={onReset} title="Kosongkan seluruh draft">
        <span class="trigger-label">RESET ALL</span>
      </button>
    </div>
  </div>

  <!-- ENEMY SIDE (RED) -->
  <div class="team-stage enemy-stage">
    <div class="stage-bar">
      <div class="team-label">
        <span class="team-badge enemy-badge">RED SIDE</span>
        <h2 class="team-title">OPPONENT SQUAD</h2>
      </div>
      <div class="team-telemetry">
        <span class="telemetry-count">{enemyTeam.filter(Boolean).length} / 5 LOCKED</span>
      </div>
    </div>

    <div class="cards-deck">
      {#each [0, 1, 2, 3, 4] as index}
        {@const hero = enemyTeam[index]}
        <div
          role="button"
          tabindex="0"
          class="draft-card enemy-card tech-bracket"
          class:is-empty={!hero}
          class:is-active={selectedSlot?.team === 'enemy' && selectedSlot?.index === index}
          onclick={() => onSlotClick('enemy', index)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSlotClick('enemy', index); } }}
        >
          <div class="card-lane-strip enemy-strip" class:has-hero={!!hero}>
            <div class="lane-strip-left">
              <span class="lane-code">SLOT</span>
              <span class="lane-name">ENEMY 0{index + 1}</span>
            </div>
            {#if hero}
              <div class="lane-strip-setup" role="group" aria-label="Setup Buttons">
                <button
                  type="button"
                  class="setup-icon-btn emblem-btn"
                  title="Setup Emblem ({hero.hero_name})"
                  onclick={(e) => { e.stopPropagation(); onOpenPreparation && onOpenPreparation(hero, 'emblem'); }}
                >
                  <img src={getHeroEmblemIcon(hero)} alt="Emblem" class="strip-icon" />
                </button>
                <button
                  type="button"
                  class="setup-icon-btn spell-btn"
                  title="Setup Battle Spell ({hero.hero_name})"
                  onclick={(e) => { e.stopPropagation(); onOpenPreparation && onOpenPreparation(hero, 'spell'); }}
                >
                  <img src={getHeroSpellIcon(hero)} alt="Spell" class="strip-icon" />
                </button>
                <button
                  type="button"
                  class="setup-icon-btn build-btn"
                  title="Setup Build Items ({hero.hero_name})"
                  onclick={(e) => { e.stopPropagation(); onOpenPreparation && onOpenPreparation(hero, 'build'); }}
                >
                  <img src={getHeroBuildIcon(hero)} alt="Build Items" class="strip-icon" />
                </button>
              </div>
            {/if}
          </div>

          {#if hero}
            {@const wr = engine.getHeroWinrate(hero.hero_name)}
            <div class="hero-art-frame">
              <img src={hero.portrait || '/default-hero.webp'} alt={hero.hero_name} class="hero-art" />
              <button
                type="button"
                class="eject-btn"
                onclick={(e) => { e.stopPropagation(); onRemoveHero('enemy', index); }}
                title="Batalkan Pick"
              >
                ✕
              </button>
            </div>
            <div class="hero-dossier">
              <span class="hero-callsign">{hero.hero_name}</span>
              <div class="hero-subline">
                <span class="hero-type">{hero.class}</span>
                {#if wr}
                  <span class="card-wr-tag tier-{wr.tier?.toLowerCase()}" title="Winrate: {wr.winrate} | Banrate: {wr.banrate}">
                    WR {wr.winrate}
                  </span>
                {/if}
              </div>
            </div>
          {:else}
            <div class="placeholder-node enemy-node">
              <div class="reticle-box">
                <span class="reticle-plus">+</span>
              </div>
              <span class="pick-cue">SELECT ENEMY</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .draft-arena {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1.25rem;
    align-items: stretch;
    margin-bottom: 1.75rem;
  }

  @media (max-width: 1180px) {
    .draft-arena {
      grid-template-columns: 1fr;
    }
    .nexus-column {
      flex-direction: row;
      justify-content: center;
      padding: 0.5rem 0;
    }
  }

  .team-stage {
    background: var(--bg-panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  }

  .ally-stage {
    border-top: 2px solid var(--ally-blue);
    background: linear-gradient(180deg, rgba(14, 165, 233, 0.08) 0%, var(--bg-panel) 40%);
  }

  .enemy-stage {
    border-top: 2px solid var(--enemy-red);
    background: linear-gradient(180deg, rgba(244, 63, 94, 0.08) 0%, var(--bg-panel) 40%);
  }

  .stage-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-tech);
    padding-bottom: 0.75rem;
  }

  .team-label {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .team-badge {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: var(--radius-xs);
    letter-spacing: 1px;
  }

  .ally-badge {
    background: rgba(14, 165, 233, 0.2);
    color: var(--ally-cyan);
    border: 1px solid var(--ally-border);
  }

  .enemy-badge {
    background: rgba(244, 63, 94, 0.2);
    color: var(--enemy-crimson);
    border: 1px solid var(--enemy-border);
  }

  .team-title {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text-pure);
  }

  .telemetry-count {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .cards-deck {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.65rem;
  }

  .draft-card {
    background: var(--bg-card);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    min-height: 160px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .draft-card:hover {
    transform: translateY(-3px);
  }

  .ally-card:hover {
    border-color: var(--ally-cyan);
    box-shadow: 0 8px 24px var(--ally-glow);
  }

  .enemy-card:hover {
    border-color: var(--enemy-crimson);
    box-shadow: 0 8px 24px var(--enemy-glow);
  }

  .draft-card.is-active {
    border-color: var(--gold-mythic) !important;
    box-shadow: 0 0 20px var(--gold-glow) !important;
  }

  .card-lane-strip {
    background: rgba(5, 8, 16, 0.92);
    border-bottom: 1px solid var(--border-tech);
    padding: 0.3rem 0.45rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
    min-height: 28px;
    gap: 0.4rem;
  }

  .lane-strip-left {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
    overflow: hidden;
  }

  .lane-code {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--ally-cyan);
    flex-shrink: 0;
  }

  .enemy-strip .lane-code {
    color: var(--enemy-crimson);
  }

  .lane-name {
    font-family: var(--font-mono);
    font-size: 0.56rem;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lane-strip-setup {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .setup-icon-btn {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.15s ease;
  }

  .setup-icon-btn:hover {
    transform: scale(1.15);
    z-index: 10;
  }

  .emblem-btn:hover {
    border-color: #38bdf8;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  }

  .spell-btn:hover {
    border-color: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
  }

  .build-btn:hover {
    border-color: #a855f7;
    box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
  }

  .strip-icon {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-art-frame {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: #090e18;
    min-height: 90px;
  }

  .hero-art {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    transition: transform 0.3s ease;
  }

  .draft-card:hover .hero-art {
    transform: scale(1.08);
  }

  .eject-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    border-radius: var(--radius-xs);
    background: rgba(5, 7, 13, 0.85);
    color: var(--enemy-crimson);
    border: 1px solid var(--enemy-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    opacity: 0;
    transition: opacity 0.15s ease, background 0.15s ease;
    z-index: 3;
  }

  .draft-card:hover .eject-btn {
    opacity: 1;
  }

  .eject-btn:hover {
    background: var(--enemy-red);
    color: white;
  }

  .hero-dossier {
    background: linear-gradient(180deg, rgba(5, 8, 16, 0.8) 0%, rgba(5, 8, 16, 0.98) 100%);
    border-top: 1px solid var(--border-tech);
    padding: 0.45rem 0.5rem;
    display: flex;
    flex-direction: column;
    z-index: 2;
  }

  .hero-callsign {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--text-pure);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hero-type {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hero-subline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem;
  }

  .card-wr-tag {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-wr-tag.tier-s\+ {
    color: #facc15;
    border-color: rgba(250, 204, 21, 0.5);
    background: rgba(234, 179, 8, 0.15);
  }

  .card-wr-tag.tier-s {
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.4);
    background: rgba(34, 197, 94, 0.15);
  }

  .card-wr-tag.tier-a {
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.3);
  }

  .card-wr-tag.tier-b {
    color: #94a3b8;
  }

  .placeholder-node {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
    background: rgba(0, 0, 0, 0.2);
  }

  .reticle-box {
    width: 38px;
    height: 38px;
    border: 1px dashed var(--ally-border);
    border-radius: var(--radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .enemy-node .reticle-box {
    border-color: var(--enemy-border);
  }

  .reticle-plus {
    font-size: 1.25rem;
    color: var(--ally-cyan);
    font-weight: 300;
    line-height: 1;
  }

  .enemy-node .reticle-plus {
    color: var(--enemy-crimson);
  }

  .draft-card:hover .reticle-box {
    border-style: solid;
    background: rgba(14, 165, 233, 0.15);
  }

  .pick-cue {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 1px;
    color: var(--text-dim);
  }

  /* NEXUS CENTER */
  .nexus-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
  }

  .nexus-emblem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .vs-text {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 900;
    letter-spacing: 2px;
    color: var(--gold-mythic);
    text-shadow: 0 0 15px var(--gold-glow);
    font-style: italic;
  }

  .phase-tag {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 1.5px;
    background: rgba(255, 255, 255, 0.04);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-tech);
  }

  .tactical-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-trigger {
    padding: 0.45rem 0.85rem;
    border-radius: var(--radius-xs);
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .export-trigger {
    background: rgba(245, 158, 11, 0.15);
    color: var(--gold-mythic);
    border: 1px solid var(--gold-border);
  }

  .export-trigger:hover {
    background: var(--gold-mythic);
    color: #05070d;
    box-shadow: 0 0 16px var(--gold-glow);
  }

  .share-trigger {
    background: rgba(168, 85, 247, 0.15);
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.4);
  }

  .share-trigger:hover {
    background: #9333ea;
    color: white;
    box-shadow: 0 0 16px rgba(168, 85, 247, 0.6);
  }

  .preset-trigger {
    background: rgba(14, 165, 233, 0.15);
    color: var(--ally-cyan);
    border: 1px solid var(--ally-border);
  }

  .preset-trigger:hover {
    background: var(--ally-blue);
    color: white;
    box-shadow: 0 0 16px var(--ally-glow);
  }

  .reset-trigger {
    background: rgba(244, 63, 94, 0.1);
    color: var(--enemy-crimson);
    border: 1px solid var(--enemy-border);
  }

  .reset-trigger:hover {
    background: var(--enemy-red);
    color: white;
  }

  @media (max-width: 768px) {
    .draft-arena {
      gap: 0.65rem;
      margin-bottom: 0.85rem;
    }

    .team-stage {
      padding: 0.65rem;
      gap: 0.5rem;
      border-radius: var(--radius-xs);
    }

    .stage-bar {
      padding-bottom: 0.4rem;
    }

    .team-title {
      font-size: 0.88rem;
      letter-spacing: 1px;
    }

    .team-badge {
      font-size: 0.58rem;
      padding: 1px 5px;
    }

    .telemetry-count {
      font-size: 0.62rem;
    }

    .cards-deck {
      gap: 0.25rem;
    }

    .draft-card {
      min-height: 110px;
      border-radius: 4px;
    }

    .card-lane-strip {
      min-height: 22px;
      padding: 2px 3px;
      gap: 2px;
    }

    .lane-name {
      display: none;
    }

    .lane-code {
      font-size: 0.55rem;
    }

    .lane-strip-setup {
      gap: 2px;
    }

    .setup-icon-btn {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }

    .hero-art-frame {
      min-height: 52px;
    }

    .hero-dossier {
      padding: 2px 3px;
    }

    .hero-callsign {
      font-size: 0.68rem;
      line-height: 1.2;
    }

    .hero-type {
      font-size: 0.52rem;
    }

    .card-wr-tag {
      font-size: 0.5rem;
      padding: 0 2px;
    }

    .eject-btn {
      width: 18px;
      height: 18px;
      font-size: 0.65rem;
      top: 2px;
      right: 2px;
      opacity: 0.9;
    }

    .placeholder-node {
      gap: 2px;
    }

    .reticle-box {
      width: 22px;
      height: 22px;
    }

    .reticle-plus {
      font-size: 0.8rem;
    }

    .pick-cue {
      font-size: 0.52rem;
    }

    .nexus-column {
      gap: 0.4rem;
      padding: 0.2rem 0;
    }

    .nexus-emblem {
      display: none;
    }

    .tactical-actions {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.35rem;
      width: 100%;
    }

    .action-trigger {
      padding: 0.3rem 0.55rem;
      font-size: 0.65rem;
      flex: 1;
      min-width: 70px;
      max-width: 140px;
    }
  }
</style>
