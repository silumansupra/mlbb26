<script>
  let { threats = [] } = $props();
</script>

{#if threats.length > 0}
  <section class="telemetry-console">
    <div class="console-head">
      <div class="head-left">
        <span class="live-pulse"></span>
        <h3 class="head-title">TACTICAL THREAT RADAR</h3>
        <span class="threat-counter">{threats.length} HAZARDS IDENTIFIED</span>
      </div>
      <div class="head-right">
        <span class="protocol-code">SYS//REACTION_MATRIX_V2</span>
      </div>
    </div>

    <div class="telemetry-grid">
      {#each threats as threat}
        <div class="hazard-cell hazard-{threat.level.toLowerCase()}">
          <div class="hazard-meta">
            <span class="hazard-sev">{threat.level === 'CRITICAL' ? 'SEV-1 // CRITICAL' : 'SEV-2 // HIGH'}</span>
            <h4 class="hazard-title">{threat.title.toUpperCase()}</h4>
          </div>

          <div class="targets-band">
            <span class="band-tag">SOURCES:</span>
            <div class="targets-list">
              {#each threat.heroes as heroName}
                <span class="target-chip">{heroName}</span>
              {/each}
            </div>
          </div>

          <div class="directive-box">
            <div class="directive-accent"></div>
            <p class="directive-text">{threat.advice}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
  .telemetry-console {
    background: var(--bg-panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--enemy-border);
    border-radius: var(--radius-md);
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.75rem;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  }

  .console-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-tech);
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .head-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .live-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--enemy-red);
    box-shadow: 0 0 10px var(--enemy-red);
    animation: radarPulse 1.8s infinite ease-in-out;
  }

  @keyframes radarPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.4; }
  }

  .head-title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: var(--text-pure);
  }

  .threat-counter {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--enemy-crimson);
    background: rgba(244, 63, 94, 0.15);
    border: 1px solid var(--enemy-border);
    padding: 2px 7px;
    border-radius: var(--radius-xs);
    letter-spacing: 0.5px;
  }

  .protocol-code {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .telemetry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
  }

  .hazard-cell {
    background: var(--bg-card);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-sm);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    border-left: 3px solid var(--border-tech-bright);
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .hazard-critical {
    border-left-color: var(--enemy-red);
    background: linear-gradient(90deg, rgba(244, 63, 94, 0.08) 0%, var(--bg-card) 60%);
  }

  .hazard-high {
    border-left-color: var(--gold-mythic);
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.08) 0%, var(--bg-card) 60%);
  }

  .hazard-medium {
    border-left-color: var(--ally-cyan);
  }

  .hazard-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .hazard-sev {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .hazard-critical .hazard-sev {
    color: var(--enemy-crimson);
  }

  .hazard-high .hazard-sev {
    color: var(--gold-mythic);
  }

  .hazard-title {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--text-pure);
  }

  .targets-band {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .band-tag {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-dim);
  }

  .targets-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .target-chip {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    color: #fecdd3;
    background: rgba(244, 63, 94, 0.18);
    border: 1px solid rgba(244, 63, 94, 0.35);
    padding: 1px 7px;
    border-radius: var(--radius-xs);
    letter-spacing: 0.5px;
  }

  .directive-box {
    display: flex;
    gap: 0.6rem;
    background: rgba(5, 7, 13, 0.5);
    border: 1px solid var(--border-tech);
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius-xs);
  }

  .directive-accent {
    width: 2px;
    background: var(--gold-mythic);
    border-radius: 2px;
    flex-shrink: 0;
  }

  .directive-text {
    font-size: 0.8rem;
    color: #cbd5e1;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .telemetry-console {
      padding: 0.65rem 0.75rem;
      margin-bottom: 0.85rem;
    }

    .console-head {
      padding-bottom: 0.4rem;
      margin-bottom: 0.65rem;
    }

    .head-title {
      font-size: 0.85rem;
    }

    .protocol-code {
      display: none;
    }

    .telemetry-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .hazard-cell {
      padding: 0.65rem;
      gap: 0.45rem;
    }

    .hazard-title {
      font-size: 0.82rem;
    }

    .directive-box {
      padding: 0.45rem 0.6rem;
    }

    .directive-text {
      font-size: 0.72rem;
    }
  }
</style>
