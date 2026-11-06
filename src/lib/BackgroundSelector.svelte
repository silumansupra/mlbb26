<script>
  let { currentBg = 'abyss', onSelectBg, isVivid = true, onToggleVivid } = $props();

  const options = [
    { id: 'abyss', label: 'Abyss Series', url: '/backgrounds/bg-abyss.jpg' },
    { id: 'arena', label: 'Moonton Stadium', url: '/backgrounds/bg-arena.jpg' },
    { id: 'dark', label: 'Stealth Dark', url: '' }
  ];
</script>

<div class="bg-control-cluster" role="group" aria-label="Pengaturan Background">
  <!-- WALLPAPER SELECTOR PILLS -->
  <div class="bg-selector">
    <span class="bg-label">WALLPAPER:</span>
    <div class="bg-pills">
      {#each options as opt}
        <button
          type="button"
          class="bg-pill"
          class:active={currentBg === opt.id}
          onclick={() => onSelectBg(opt.id)}
        >
          <span class="indicator-dot"></span>
          <span class="pill-text">{opt.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- VIVID / BRIGHTNESS TOGGLE -->
  {#if currentBg !== 'dark'}
    <button
      type="button"
      class="vivid-toggle"
      class:is-vivid={isVivid}
      onclick={onToggleVivid}
      title="Atur transparansi agar gambar latar belakang semakin jelas / kontras"
    >
      <span class="toggle-icon">{isVivid ? '☀️' : '🌙'}</span>
      <span class="toggle-text">{isVivid ? 'VIVID (TERANG)' : 'DIM (MUTED)'}</span>
    </button>
  {/if}
</div>

<style>
  .bg-control-cluster {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
  }

  .bg-selector {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    background: rgba(4, 7, 14, 0.65);
    border: 1px solid var(--border-tech);
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-sm);
    backdrop-filter: blur(8px);
  }

  .bg-label {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 1px;
  }

  .bg-pills {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .bg-pill {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-xs);
    font-size: 0.72rem;
    font-weight: 600;
    font-family: var(--font-display);
    letter-spacing: 0.5px;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }

  .bg-pill:hover {
    color: var(--text-pure);
    background: rgba(255, 255, 255, 0.08);
  }

  .indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-dim);
    transition: all 0.15s ease;
  }

  .bg-pill.active {
    color: var(--gold-mythic);
    background: rgba(251, 191, 36, 0.15);
    border-color: rgba(251, 191, 36, 0.4);
  }

  .bg-pill.active .indicator-dot {
    background: var(--gold-mythic);
    box-shadow: 0 0 8px var(--gold-glow);
  }

  .vivid-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(4, 7, 14, 0.65);
    border: 1px solid var(--border-tech);
    padding: 0.25rem 0.65rem;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 0.5px;
    backdrop-filter: blur(8px);
    transition: all 0.15s ease;
  }

  .vivid-toggle:hover {
    border-color: var(--gold-mythic);
    color: var(--text-pure);
  }

  .vivid-toggle.is-vivid {
    border-color: var(--ally-cyan);
    color: var(--ally-cyan);
    background: rgba(14, 165, 233, 0.15);
    box-shadow: 0 0 10px var(--ally-glow);
  }

  .toggle-icon {
    font-size: 0.75rem;
  }
</style>
