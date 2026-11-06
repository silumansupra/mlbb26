<script>
  let {
    myTeam = [],
    enemyTeam = [],
    selectedSlot = null,
    onSlotClick,
    onRemoveHero,
    onLoadPreset,
    onReset
  } = $props();

  const laneLabels = ['Gold Lane', 'EXP Lane', 'Mid Lane', 'Roam', 'Jungle'];
</script>

<div class="draft-board">
  <!-- Team Blue (My Team) -->
  <div class="team-panel team-blue">
    <div class="team-header">
      <div class="team-identity">
        <span class="team-indicator blue-indicator"></span>
        <h2>TIM KAMU (ALLY)</h2>
      </div>
      <span class="count-badge">{myTeam.filter(Boolean).length}/5 Terpilih</span>
    </div>

    <div class="slots-row">
      {#each [0, 1, 2, 3, 4] as index}
        {@const hero = myTeam[index]}
        {@const lane = laneLabels[index]}
        <div
          role="button"
          tabindex="0"
          class="slot-card"
          class:filled={!!hero}
          class:active={selectedSlot?.team === 'my' && selectedSlot?.index === index}
          onclick={() => onSlotClick('my', index)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSlotClick('my', index); } }}
        >
          <span class="slot-lane">{lane}</span>

          {#if hero}
            <div class="portrait-container">
              <img src={hero.portrait || '/default-hero.webp'} alt={hero.hero_name} />
              <button
                type="button"
                class="remove-slot-btn"
                onclick={(e) => { e.stopPropagation(); onRemoveHero('my', index); }}
                title="Hapus Hero"
              >✕</button>
            </div>
            <div class="slot-info">
              <span class="slot-hero-name">{hero.hero_name}</span>
              <span class="slot-hero-class">{hero.class}</span>
            </div>
          {:else}
            <div class="empty-slot">
              <span class="plus-icon">+</span>
              <span class="empty-text">Pilih Hero</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Center VS Divider -->
  <div class="vs-column">
    <div class="vs-badge">VS</div>
    <div class="quick-actions">
      <button class="action-btn preset-btn" onclick={onLoadPreset} title="Muat draft lawan: Tigreal, Aamon, Cici, Badang">
        <span>⚡</span> Preset Musuh
      </button>
      <button class="action-btn reset-btn" onclick={onReset} title="Kosongkan semua slot">
        <span>🔄</span> Reset
      </button>
    </div>
  </div>

  <!-- Team Red (Enemy Team) -->
  <div class="team-panel team-red">
    <div class="team-header">
      <div class="team-identity">
        <span class="team-indicator red-indicator"></span>
        <h2>TIM MUSUH (ENEMY)</h2>
      </div>
      <span class="count-badge">{enemyTeam.filter(Boolean).length}/5 Terpilih</span>
    </div>

    <div class="slots-row">
      {#each [0, 1, 2, 3, 4] as index}
        {@const hero = enemyTeam[index]}
        <div
          role="button"
          tabindex="0"
          class="slot-card red-slot"
          class:filled={!!hero}
          class:active={selectedSlot?.team === 'enemy' && selectedSlot?.index === index}
          onclick={() => onSlotClick('enemy', index)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSlotClick('enemy', index); } }}
        >
          <span class="slot-lane">Enemy {index + 1}</span>

          {#if hero}
            <div class="portrait-container">
              <img src={hero.portrait || '/default-hero.webp'} alt={hero.hero_name} />
              <button
                type="button"
                class="remove-slot-btn"
                onclick={(e) => { e.stopPropagation(); onRemoveHero('enemy', index); }}
                title="Hapus Hero"
              >✕</button>
            </div>
            <div class="slot-info">
              <span class="slot-hero-name">{hero.hero_name}</span>
              <span class="slot-hero-class">{hero.class}</span>
            </div>
          {:else}
            <div class="empty-slot">
              <span class="plus-icon red-plus">+</span>
              <span class="empty-text">Pilih Musuh</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .draft-board {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1.25rem;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 1024px) {
    .draft-board {
      grid-template-columns: 1fr;
    }
    .vs-column {
      flex-direction: row;
      justify-content: center;
      padding: 0.5rem 0;
    }
  }

  .team-panel {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .team-blue {
    border-top: 3px solid var(--primary-blue);
  }

  .team-red {
    border-top: 3px solid var(--primary-red);
  }

  .team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .team-identity {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .team-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .blue-indicator {
    background: var(--primary-blue);
    box-shadow: 0 0 10px var(--primary-blue);
  }

  .red-indicator {
    background: var(--primary-red);
    box-shadow: 0 0 10px var(--primary-red);
  }

  .team-header h2 {
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: var(--text-main);
  }

  .count-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-dim);
    background: var(--bg-surface-elevated);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .slots-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.6rem;
  }

  .slot-card {
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.5rem 0.3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 120px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  }

  .slot-card:hover {
    border-color: var(--primary-blue);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .slot-card.red-slot:hover {
    border-color: var(--primary-red);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }

  .slot-card.active {
    border-color: var(--gold-accent) !important;
    box-shadow: 0 0 12px var(--gold-glow) !important;
  }

  .slot-lane {
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-dim);
    margin-bottom: 0.35rem;
    text-transform: uppercase;
  }

  .portrait-container {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.15);
    background: #0f1523;
  }

  .portrait-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-slot-btn {
    position: absolute;
    top: 0;
    right: 0;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    font-size: 0.65rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .slot-card:hover .remove-slot-btn {
    opacity: 1;
  }

  .slot-info {
    margin-top: 0.35rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .slot-hero-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
  }

  .slot-hero-class {
    font-size: 0.65rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
  }

  .empty-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 0.2rem;
  }

  .plus-icon {
    font-size: 1.4rem;
    color: var(--primary-blue);
    line-height: 1;
  }

  .red-plus {
    color: var(--primary-red);
  }

  .empty-text {
    font-size: 0.65rem;
    color: var(--text-dim);
    font-weight: 600;
  }

  .vs-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
  }

  .vs-badge {
    font-size: 1.1rem;
    font-weight: 900;
    letter-spacing: 2px;
    color: var(--gold-accent);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .action-btn {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }

  .preset-btn {
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .preset-btn:hover {
    background: var(--primary-blue);
    color: white;
  }

  .reset-btn {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .reset-btn:hover {
    background: var(--primary-red);
    color: white;
  }
</style>
