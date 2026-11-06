<script>
  let { currentBg = 'abyss', onSelectBg } = $props();

  const options = [
    { id: 'abyss', label: 'Abyss Series', url: '/backgrounds/bg-abyss.jfif' },
    { id: 'aurora', label: 'Arena 2', url: '/backgrounds/bg-aurora.jfif' },
    { id: 'dark', label: 'Stealth Dark', url: '' }
  ];
</script>

<div class="bg-selector" role="group" aria-label="Pilih Background">
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

<style>
  .bg-selector {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(0, 0, 0, 0.45);
    border: 1px solid var(--border-tech);
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-sm);
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
    background: rgba(255, 255, 255, 0.05);
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
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.35);
  }

  .bg-pill.active .indicator-dot {
    background: var(--gold-mythic);
    box-shadow: 0 0 8px var(--gold-glow);
  }
</style>
