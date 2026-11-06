<script>
  import { getAllHeroes, normalizeLane } from './counterEngine.js';

  let { isOpen = false, onClose, onSelect, title = 'CHOOSE HERO', excludedHeroes = [] } = $props();

  let searchQuery = $state('');
  let selectedRole = $state('ALL');

  const heroes = getAllHeroes();
  const roles = ['ALL', 'MARKSMAN', 'ASSASSIN', 'MAGE', 'FIGHTER', 'TANK', 'SUPPORT'];

  let filteredHeroes = $derived(
    heroes.filter(hero => {
      // Exclude already selected
      if (excludedHeroes.includes(hero.hero_name)) return false;

      // Filter by role
      if (selectedRole !== 'ALL') {
        const cls = (hero.class || '').toUpperCase();
        if (!cls.includes(selectedRole)) return false;
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
    class="modal-scrim"
    onclick={onClose}
    onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
    role="presentation"
  >
    <div
      class="modal-dossier tech-bracket"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-top">
        <div class="top-title-col">
          <span class="modal-sub-tag">MLBB ARSENAL // 133 HEROES</span>
          <h3 class="modal-heading">{title}</h3>
        </div>
        <button type="button" class="dismiss-btn" onclick={onClose} aria-label="Tutup">✕</button>
      </div>

      <div class="dossier-filters">
        <div class="search-terminal">
          <span class="terminal-prefix">></span>
          <input
            type="text"
            placeholder="Ketik nama hero, role, atau lane..."
            bind:value={searchQuery}
          />
          {#if searchQuery}
            <button type="button" class="purge-search" onclick={() => searchQuery = ''}>✕</button>
          {/if}
        </div>

        <div class="role-matrix">
          {#each roles as role}
            <button
              type="button"
              class="role-trigger"
              class:is-active={selectedRole === role}
              onclick={() => selectedRole = role}
            >
              {role}
            </button>
          {/each}
        </div>
      </div>

      <div class="arsenal-grid">
        {#each filteredHeroes as hero (hero.hero_name)}
          <button type="button" class="arsenal-card tech-bracket" onclick={() => handleSelect(hero)}>
            <div class="card-art-box">
              <img
                src={hero.portrait || '/default-hero.webp'}
                alt={hero.hero_name}
                loading="lazy"
                onerror={(e) => { e.target.style.display = 'none'; }}
              />
              <span class="card-lane-badge">{normalizeLane(hero)}</span>
            </div>
            <div class="card-caption">
              <span class="card-callsign">{hero.hero_name}</span>
              <span class="card-spec">{hero.class}</span>
            </div>
          </button>
        {/each}

        {#if filteredHeroes.length === 0}
          <div class="no-matches">
            <span class="no-match-code">QUERY_NOT_FOUND</span>
            <p>Tidak ada hero yang sesuai dengan kueri "{searchQuery}".</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-scrim {
    position: fixed;
    inset: 0;
    background: rgba(3, 5, 10, 0.88);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
  }

  .modal-dossier {
    background: var(--bg-panel);
    border: 1px solid var(--border-tech-bright);
    border-radius: var(--radius-md);
    width: 100%;
    max-width: 900px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.8);
    overflow: hidden;
  }

  .modal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid var(--border-tech);
    background: rgba(5, 7, 13, 0.4);
  }

  .top-title-col {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .modal-sub-tag {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--gold-mythic);
    letter-spacing: 1.5px;
  }

  .modal-heading {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-pure);
    letter-spacing: 1px;
  }

  .dismiss-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-xs);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-dim);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-tech);
    transition: all 0.15s ease;
  }

  .dismiss-btn:hover {
    background: rgba(244, 63, 94, 0.2);
    color: var(--enemy-crimson);
    border-color: var(--enemy-border);
  }

  .dossier-filters {
    padding: 1rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    border-bottom: 1px solid var(--border-tech);
    background: rgba(0, 0, 0, 0.25);
  }

  .search-terminal {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: var(--bg-card);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.6rem 0.9rem;
    transition: all 0.15s ease;
  }

  .search-terminal:focus-within {
    border-color: var(--ally-cyan);
    box-shadow: 0 0 16px var(--ally-glow);
  }

  .terminal-prefix {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 800;
    color: var(--ally-cyan);
  }

  .search-terminal input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-pure);
    font-size: 0.9rem;
    outline: none;
  }

  .purge-search {
    color: var(--text-dim);
    font-size: 0.85rem;
  }

  .role-matrix {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .role-trigger {
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-xs);
    background: var(--bg-card);
    color: var(--text-dim);
    border: 1px solid var(--border-tech);
    transition: all 0.15s ease;
  }

  .role-trigger:hover {
    color: var(--text-pure);
    border-color: var(--border-tech-bright);
  }

  .role-trigger.is-active {
    background: var(--ally-blue);
    color: white;
    border-color: var(--ally-cyan);
    box-shadow: 0 0 12px var(--ally-glow);
  }

  .arsenal-grid {
    padding: 1.5rem 1.75rem;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
    gap: 0.85rem;
    flex: 1;
  }

  .arsenal-card {
    background: var(--bg-card);
    border: 1px solid var(--border-tech);
    border-radius: var(--radius-xs);
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.15s ease;
  }

  .arsenal-card:hover {
    transform: translateY(-3px);
    border-color: var(--ally-cyan);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
  }

  .card-art-box {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: var(--radius-xs);
    overflow: hidden;
    margin-bottom: 0.45rem;
    border: 1px solid var(--border-tech);
    background: #090e18;
  }

  .card-art-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-lane-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(5, 7, 13, 0.9);
    font-family: var(--font-mono);
    font-size: 0.55rem;
    font-weight: 700;
    padding: 1px 0;
    color: var(--gold-mythic);
    letter-spacing: 0.5px;
  }

  .card-caption {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
  }

  .card-callsign {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-pure);
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-spec {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .no-matches {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 1rem;
  }

  .no-match-code {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-dim);
    letter-spacing: 2px;
    display: block;
    margin-bottom: 0.5rem;
  }

  .no-matches p {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
