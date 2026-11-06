<script>
  import { getAllHeroes, normalizeLane } from './counterEngine.js';

  let { isOpen = false, onClose, onSelect, title = 'Pilih Hero', excludedHeroes = [] } = $props();

  let searchQuery = $state('');
  let selectedRole = $state('All');

  const heroes = getAllHeroes();
  const roles = ['All', 'Marksman', 'Assassin', 'Mage', 'Fighter', 'Tank', 'Support'];

  let filteredHeroes = $derived(
    heroes.filter(hero => {
      // Exclude already selected
      if (excludedHeroes.includes(hero.hero_name)) return false;

      // Filter by role
      if (selectedRole !== 'All') {
        const cls = (hero.class || '').toLowerCase();
        if (!cls.includes(selectedRole.toLowerCase())) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = hero.hero_name.toLowerCase().includes(q);
        const roleMatch = (hero.class || '').toLowerCase().includes(q);
        const laneMatch = (hero.laning || []).some(l => l.toLowerCase().includes(q));
        return nameMatch || roleMatch || laneMatch;
      }

      return true;
    })
  );

  function handleSelect(hero) {
    onSelect(hero);
    searchQuery = '';
    onClose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="modal-backdrop"
    onclick={onClose}
    onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
    role="presentation"
  >
    <div
      class="modal-card"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-header">
        <div>
          <h3>{title}</h3>
          <p class="subtitle">Pilih hero dari database resmi MLBB</p>
        </div>
        <button class="close-btn" onclick={onClose} aria-label="Tutup">✕</button>
      </div>

      <div class="filter-controls">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari hero, role, atau lane..."
            bind:value={searchQuery}
          />
          {#if searchQuery}
            <button class="clear-search" onclick={() => searchQuery = ''}>✕</button>
          {/if}
        </div>

        <div class="role-chips">
          {#each roles as role}
            <button
              class="role-chip"
              class:active={selectedRole === role}
              onclick={() => selectedRole = role}
            >
              {role}
            </button>
          {/each}
        </div>
      </div>

      <div class="heroes-grid">
        {#each filteredHeroes as hero (hero.hero_name)}
          <button class="hero-item" onclick={() => handleSelect(hero)}>
            <div class="portrait-wrapper">
              <img
                src={hero.portrait || '/default-hero.webp'}
                alt={hero.hero_name}
                loading="lazy"
                onerror={(e) => { e.target.style.display = 'none'; }}
              />
              <span class="lane-tag">{normalizeLane(hero)}</span>
            </div>
            <div class="hero-meta">
              <span class="hero-name">{hero.hero_name}</span>
              <span class="hero-class">{hero.class}</span>
            </div>
          </button>
        {/each}

        {#if filteredHeroes.length === 0}
          <div class="no-results">
            <p>Tidak ada hero yang sesuai dengan pencarian "{searchQuery}"</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(4, 7, 14, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
  }

  .modal-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 860px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .subtitle {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .filter-controls {
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    background: rgba(0, 0, 0, 0.15);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.6rem 0.9rem;
  }

  .search-box:focus-within {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 2px var(--primary-blue-glow);
  }

  .search-icon {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .search-box input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-main);
    font-size: 0.95rem;
    outline: none;
  }

  .clear-search {
    color: var(--text-dim);
    font-size: 0.85rem;
  }

  .role-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .role-chip {
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    background: var(--bg-surface-elevated);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
  }

  .role-chip:hover {
    color: white;
    border-color: var(--border-light);
  }

  .role-chip.active {
    background: var(--primary-blue);
    color: white;
    border-color: var(--primary-blue);
    box-shadow: 0 0 10px var(--primary-blue-glow);
  }

  .heroes-grid {
    padding: 1.25rem 1.5rem;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 1rem;
    flex: 1;
  }

  .hero-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.5rem;
    text-align: center;
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .hero-item:hover {
    transform: translateY(-3px);
    border-color: var(--primary-blue);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }

  .portrait-wrapper {
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 0.4rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: #0f1523;
  }

  .portrait-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .lane-tag {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(10, 15, 26, 0.9);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 1px 0;
    color: var(--gold-accent);
    text-transform: uppercase;
  }

  .hero-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
  }

  .hero-name {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hero-class {
    font-size: 0.7rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-dim);
  }
</style>
