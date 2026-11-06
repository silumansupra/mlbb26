<script>
  let { threats = [] } = $props();
</script>

{#if threats.length > 0}
  <div class="threats-container">
    <div class="threats-header">
      <div class="title-with-badge">
        <span class="warning-icon">⚡</span>
        <h3>Analisis Ancaman Draft Musuh ({threats.length})</h3>
      </div>
      <p class="threat-subtitle">Deteksi otomatis bahaya utama dan respon strategi tim</p>
    </div>

    <div class="threats-grid">
      {#each threats as threat}
        <div class="threat-card threat-{threat.level.toLowerCase()}">
          <div class="threat-top">
            <span class="threat-badge">{threat.level} THREAT</span>
            <span class="threat-title">{threat.title}</span>
          </div>

          <div class="threat-heroes">
            <span class="heroes-label">Hero Musuh:</span>
            <div class="heroes-chips">
              {#each threat.heroes as heroName}
                <span class="hero-chip">{heroName}</span>
              {/each}
            </div>
          </div>

          <div class="threat-advice">
            <span class="advice-icon">💡</span>
            <p>{threat.advice}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .threats-container {
    background: linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(17, 23, 38, 0.9) 100%);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: var(--radius-lg);
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .threats-header {
    margin-bottom: 1rem;
  }

  .title-with-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .warning-icon {
    font-size: 1.25rem;
    color: var(--primary-red);
  }

  .title-with-badge h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .threat-subtitle {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .threats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
  }

  .threat-card {
    background: var(--bg-surface-elevated);
    border-radius: var(--radius-md);
    padding: 1rem;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    border-left: 4px solid var(--border-light);
  }

  .threat-card.threat-critical {
    border-left-color: var(--primary-red);
    background: linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-surface-elevated) 100%);
  }

  .threat-card.threat-high {
    border-left-color: var(--gold-accent);
    background: linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-surface-elevated) 100%);
  }

  .threat-card.threat-medium {
    border-left-color: var(--primary-blue);
  }

  .threat-top {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .threat-badge {
    font-size: 0.65rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    letter-spacing: 0.5px;
  }

  .threat-critical .threat-badge {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }

  .threat-high .threat-badge {
    background: rgba(245, 158, 11, 0.2);
    color: #fcd34d;
  }

  .threat-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .threat-heroes {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .heroes-label {
    font-size: 0.75rem;
    color: var(--text-dim);
    font-weight: 600;
  }

  .heroes-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .hero-chip {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .threat-advice {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.25);
    padding: 0.6rem 0.8rem;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    color: #e2e8f0;
    line-height: 1.4;
  }

  .advice-icon {
    font-size: 0.9rem;
    flex-shrink: 0;
  }
</style>
