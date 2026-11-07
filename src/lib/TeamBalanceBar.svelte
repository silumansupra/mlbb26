<script>
  let { allyComp = null, enemyComp = null } = $props();
</script>

{#if allyComp || enemyComp}
  <section class="balance-radar tech-bracket">
    <div class="radar-header">
      <div class="header-tag-group">
        <span class="radar-dot"></span>
        <h3 class="radar-title">TEAM COMPOSITION & DAMAGE PROFILE</h3>
      </div>
      <span class="radar-subtitle">SYS//BALANCE_ANALYZER</span>
    </div>

    <div class="split-comp-grid">
      <!-- ALLY COMPOSITION (BLUE) -->
      <div class="comp-col ally-comp-col">
        <div class="comp-col-top">
          <span class="side-tag ally-side-tag">BLUE SIDE COMP</span>
          <span class="hero-counter">{allyComp?.heroCount || 0}/5 HEROES</span>
        </div>

        {#if allyComp && allyComp.heroCount > 0}
          <!-- Damage Split Bar -->
          <div class="damage-bar-wrap">
            <div class="bar-labels">
              <span class="dmg-lbl phys">Fisik {allyComp.damageSplit.physical}%</span>
              <span class="dmg-lbl magic">Magic {allyComp.damageSplit.magic}%</span>
              {#if allyComp.damageSplit.trueDamage > 0}
                <span class="dmg-lbl true-dmg">True {allyComp.damageSplit.trueDamage}%</span>
              {/if}
            </div>
            <div class="damage-bar-track">
              <div class="bar-fill fill-phys" style="width: {allyComp.damageSplit.physical}%" title="Physical Damage"></div>
              <div class="bar-fill fill-magic" style="width: {allyComp.damageSplit.magic}%" title="Magic Damage"></div>
              <div class="bar-fill fill-true" style="width: {allyComp.damageSplit.trueDamage}%" title="True Damage"></div>
            </div>
          </div>

          <!-- Attributes (Frontline, CC, Scaling) -->
          <div class="attr-pills-row">
            <div class="attr-pill" class:pill-good={allyComp.frontlineCount >= 1} class:pill-warn={allyComp.frontlineCount === 0 && allyComp.heroCount >= 3}>
              <span class="attr-k">FRONTLINE:</span>
              <span class="attr-v">{allyComp.frontlineCount} HERO</span>
            </div>
            <div class="attr-pill" class:pill-good={allyComp.ccCount >= 1} class:pill-warn={allyComp.ccCount === 0 && allyComp.heroCount >= 3}>
              <span class="attr-k">HARD CC:</span>
              <span class="attr-v">{allyComp.ccCount} HERO</span>
            </div>
            <div class="attr-pill">
              <span class="attr-k">EARLY/LATE:</span>
              <span class="attr-v">{allyComp.earlyGameCount}E / {allyComp.lateGameCount}L</span>
            </div>
          </div>

          <!-- Warnings or Strengths -->
          {#if allyComp.warnings.length > 0}
            <div class="warnings-box">
              {#each allyComp.warnings as warn}
                <div class="warn-chip sev-{warn.severity.toLowerCase()}">
                  <span class="warn-icon">⚠️</span>
                  <span class="warn-text"><strong>{warn.title}:</strong> {warn.description}</span>
                </div>
              {/each}
            </div>
          {:else if allyComp.strengths.length > 0 && allyComp.heroCount >= 3}
            <div class="strengths-box">
              {#each allyComp.strengths as str}
                <div class="str-chip">
                  <span class="str-icon">✓</span>
                  <span>{str}</span>
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="empty-side-cue">
            <span>PILIH HERO ALLY UNTUK MEMUNCULKAN ANALISIS</span>
          </div>
        {/if}
      </div>

      <!-- ENEMY COMPOSITION (RED) -->
      <div class="comp-col enemy-comp-col">
        <div class="comp-col-top">
          <span class="side-tag enemy-side-tag">RED SIDE COMP</span>
          <span class="hero-counter">{enemyComp?.heroCount || 0}/5 HEROES</span>
        </div>

        {#if enemyComp && enemyComp.heroCount > 0}
          <!-- Damage Split Bar -->
          <div class="damage-bar-wrap">
            <div class="bar-labels">
              <span class="dmg-lbl phys">Fisik {enemyComp.damageSplit.physical}%</span>
              <span class="dmg-lbl magic">Magic {enemyComp.damageSplit.magic}%</span>
              {#if enemyComp.damageSplit.trueDamage > 0}
                <span class="dmg-lbl true-dmg">True {enemyComp.damageSplit.trueDamage}%</span>
              {/if}
            </div>
            <div class="damage-bar-track">
              <div class="bar-fill fill-phys" style="width: {enemyComp.damageSplit.physical}%" title="Physical Damage"></div>
              <div class="bar-fill fill-magic" style="width: {enemyComp.damageSplit.magic}%" title="Magic Damage"></div>
              <div class="bar-fill fill-true" style="width: {enemyComp.damageSplit.trueDamage}%" title="True Damage"></div>
            </div>
          </div>

          <!-- Attributes (Frontline, CC, Scaling) -->
          <div class="attr-pills-row">
            <div class="attr-pill" class:pill-good={enemyComp.frontlineCount >= 1} class:pill-warn={enemyComp.frontlineCount === 0 && enemyComp.heroCount >= 3}>
              <span class="attr-k">FRONTLINE:</span>
              <span class="attr-v">{enemyComp.frontlineCount} HERO</span>
            </div>
            <div class="attr-pill" class:pill-good={enemyComp.ccCount >= 1} class:pill-warn={enemyComp.ccCount === 0 && enemyComp.heroCount >= 3}>
              <span class="attr-k">HARD CC:</span>
              <span class="attr-v">{enemyComp.ccCount} HERO</span>
            </div>
            <div class="attr-pill">
              <span class="attr-k">EARLY/LATE:</span>
              <span class="attr-v">{enemyComp.earlyGameCount}E / {enemyComp.lateGameCount}L</span>
            </div>
          </div>

          <!-- Enemy Warnings / Flaws to Exploit -->
          {#if enemyComp.warnings.length > 0}
            <div class="warnings-box exploit-box">
              <span class="exploit-header">CELAH KELEMAHAN MUSUH:</span>
              {#each enemyComp.warnings as warn}
                <div class="warn-chip exploit-chip">
                  <span class="warn-icon">🎯</span>
                  <span class="warn-text"><strong>{warn.title}:</strong> {warn.description}</span>
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="empty-side-cue">
            <span>PILIH HERO LAWAN UNTUK MEMUNCULKAN ANALISIS</span>
          </div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<style>
  .balance-radar {
    background: var(--bg-panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-md);
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
  }

  .radar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-tech);
    padding-bottom: 0.6rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header-tag-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .radar-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--gold-mythic);
    box-shadow: 0 0 8px var(--gold-mythic);
  }

  .radar-title {
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-pure);
    letter-spacing: 1px;
  }

  .radar-subtitle {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .split-comp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  @media (max-width: 860px) {
    .split-comp-grid {
      grid-template-columns: 1fr;
    }
  }

  .comp-col {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ally-comp-col {
    border-color: rgba(14, 165, 233, 0.3);
  }

  .enemy-comp-col {
    border-color: rgba(244, 63, 94, 0.3);
  }

  .comp-col-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .side-tag {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .ally-side-tag {
    color: var(--ally-cyan);
  }

  .enemy-side-tag {
    color: var(--enemy-crimson);
  }

  .hero-counter {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-dim);
  }

  .damage-bar-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .bar-labels {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 600;
  }

  .dmg-lbl.phys {
    color: #f97316;
  }

  .dmg-lbl.magic {
    color: #38bdf8;
  }

  .dmg-lbl.true-dmg {
    color: #facc15;
  }

  .damage-bar-track {
    height: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
    display: flex;
  }

  .bar-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .fill-phys {
    background: #f97316;
  }

  .fill-magic {
    background: #0284c7;
  }

  .fill-true {
    background: #facc15;
  }

  .attr-pills-row {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .attr-pill {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.25rem 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    display: flex;
    gap: 0.35rem;
  }

  .attr-k {
    color: var(--text-dim);
  }

  .attr-v {
    color: var(--text-pure);
    font-weight: 700;
  }

  .attr-pill.pill-good {
    border-color: rgba(74, 222, 128, 0.4);
    background: rgba(34, 197, 94, 0.1);
  }

  .attr-pill.pill-good .attr-v {
    color: #4ade80;
  }

  .attr-pill.pill-warn {
    border-color: rgba(244, 63, 94, 0.4);
    background: rgba(244, 63, 94, 0.1);
  }

  .attr-pill.pill-warn .attr-v {
    color: #fb7185;
  }

  .warnings-box {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .warn-chip {
    display: flex;
    gap: 0.45rem;
    background: rgba(244, 63, 94, 0.12);
    border: 1px solid rgba(244, 63, 94, 0.3);
    border-radius: var(--radius-xs);
    padding: 0.35rem 0.6rem;
    font-size: 0.68rem;
    line-height: 1.35;
    color: #fda4af;
  }

  .warn-icon {
    flex-shrink: 0;
  }

  .exploit-header {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--gold-mythic);
    letter-spacing: 0.5px;
  }

  .exploit-chip {
    background: rgba(234, 179, 8, 0.12);
    border-color: rgba(234, 179, 8, 0.3);
    color: #fde047;
  }

  .strengths-box {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .str-chip {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: #4ade80;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .empty-side-cue {
    text-align: center;
    padding: 1.25rem 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    .balance-radar {
      padding: 0.65rem 0.75rem;
      margin-bottom: 0.85rem;
    }

    .radar-header {
      padding-bottom: 0.4rem;
      margin-bottom: 0.65rem;
    }

    .radar-title {
      font-size: 0.82rem;
    }

    .comp-col {
      padding: 0.65rem;
      gap: 0.55rem;
    }

    .attr-pills-row {
      gap: 0.3rem;
    }

    .attr-pill {
      font-size: 0.58rem;
      padding: 0.2rem 0.4rem;
    }

    .warn-chip {
      padding: 0.3rem 0.45rem;
      font-size: 0.65rem;
    }
  }
</style>
