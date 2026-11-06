<script>
  import { untrack } from 'svelte';
  import * as engine from './counterEngine.js';

  let {
    isOpen = false,
    hero = null,
    initialTab = 'build', // 'build' | 'emblem' | 'spell'
    customLoadout = null, // optional existing custom loadout
    enemyHeroes = [],
    onClose,
    onSave
  } = $props();

  // Active Tab: 'build' | 'emblem' | 'spell'
  let activeTab = $state('build');

  // Load hero default or current custom loadout
  let activeBuild = $state([]);
  let activeEmblem = $state('Common');
  let activeTier1 = $state('Thrill');
  let activeTier2 = $state('Master Assassin');
  let activeTier3 = $state('Killing Spree');
  let activeSpell = $state('Flicker');
  let selectedSlotIndex = $state(0);
  let selectedShopItem = $state(null);
  let selectedTalentTier = $state(null); // 'tier1' | 'tier2' | 'tier3' | null

  // Shop filter
  let shopCategory = $state('ALL');
  let shopSearch = $state('');

  const allItems = engine.getAllItems();
  const allSpells = engine.getAllSpells();
  const allEmblems = engine.getAllEmblems();
  const allTalents = engine.getAllTalents();

  // Keep track of the last hero loaded to avoid unnecessary re-initializations
  let lastHeroName = null;
  let wasOpen = false;

  // When hero changes or modal opens, initialize loadout safely inside untrack()
  $effect(() => {
    const isModalOpen = isOpen;
    const heroName = hero?.hero_name;
    const tab = initialTab;

    if (isModalOpen && heroName) {
      if (!wasOpen || heroName !== lastHeroName) {
        lastHeroName = heroName;
        wasOpen = true;

        untrack(() => {
          activeTab = tab || 'build';

          let items = [];
          if (customLoadout?.items?.length) {
            items = [...customLoadout.items];
            activeEmblem = customLoadout.emblem?.base || 'Common';
            activeTier1 = customLoadout.emblem?.tier1?.name || customLoadout.emblem?.tier1 || 'Thrill';
            activeTier2 = customLoadout.emblem?.tier2?.name || customLoadout.emblem?.tier2 || 'Master Assassin';
            activeTier3 = customLoadout.emblem?.tier3?.name || customLoadout.emblem?.tier3 || 'Killing Spree';
            activeSpell = customLoadout.spell?.name || customLoadout.spell?.id || 'Flicker';
          } else {
            const guide = engine.getHeroMatchupGuide(hero, enemyHeroes);
            items = guide ? guide.build.map(b => b.name) : [];
            activeEmblem = guide?.emblem?.name || 'Common';
            activeTier1 = guide?.emblem?.tier1 || 'Thrill';
            activeTier2 = guide?.emblem?.tier2 || 'Master Assassin';
            activeTier3 = guide?.emblem?.tier3 || 'Killing Spree';
            activeSpell = guide?.battleSpell?.name || 'Flicker';
          }

          while (items.length < 6) {
            items.push('Dagger');
          }
          activeBuild = items.slice(0, 6);
          selectedSlotIndex = 0;
          selectedShopItem = engine.getItemByName(activeBuild[0]) || allItems[0];
          selectedTalentTier = null;
        });
      } else if (tab && tab !== activeTab) {
        untrack(() => {
          activeTab = tab;
        });
      }
    } else if (!isModalOpen) {
      wasOpen = false;
    }
  });

  // Filtered Shop Items
  let filteredShopItems = $derived(
    allItems.filter(item => {
      const matchCat =
        shopCategory === 'ALL' ? true :
        shopCategory === 'ATTACK' ? item.item_category.includes('Attack') :
        shopCategory === 'MAGIC' ? item.item_category.includes('Magic') :
        shopCategory === 'DEFENSE' ? item.item_category.includes('Defense') :
        shopCategory === 'MOVEMENT' ? item.item_category.includes('Movement') :
        shopCategory === 'ROAM' ? item.item_category.includes('Roam') :
        shopCategory === 'JUNGLE' ? item.item_category.includes('Jungle') : true;

      const matchSearch = shopSearch.trim() === '' ? true :
        item.item_name.toLowerCase().includes(shopSearch.toLowerCase());

      return matchCat && matchSearch;
    })
  );

  function handleEquipShopItem(item) {
    if (!item) return;
    activeBuild[selectedSlotIndex] = item.item_name;
    selectedShopItem = item;
  }

  function handleSlotSelect(index) {
    selectedSlotIndex = index;
    const itemName = activeBuild[index];
    if (itemName) {
      selectedShopItem = engine.getItemByName(itemName);
    }
  }

  function handleSelectEmblemBase(name) {
    activeEmblem = name;
  }

  function handleSelectTalent(tier, talent) {
    if (tier === 'tier1') activeTier1 = talent.name;
    if (tier === 'tier2') activeTier2 = talent.name;
    if (tier === 'tier3') activeTier3 = talent.name;
    selectedTalentTier = null;
  }

  function handleSelectSpell(spell) {
    activeSpell = spell.name;
  }

  function handleResetDefault() {
    if (!hero) return;
    const guide = engine.getHeroMatchupGuide(hero, enemyHeroes);
    if (guide) {
      activeBuild = guide.build.map(b => b.name);
      while (activeBuild.length < 6) activeBuild.push('Dagger');
      activeBuild = activeBuild.slice(0, 6);
      activeEmblem = guide.emblem.name || 'Common';
      activeTier1 = guide.emblem.tier1 || 'Thrill';
      activeTier2 = guide.emblem.tier2 || 'Master Assassin';
      activeTier3 = guide.emblem.tier3 || 'Killing Spree';
      activeSpell = guide.battleSpell.name || 'Flicker';
      selectedShopItem = engine.getItemByName(activeBuild[0]);
    }
  }

  function handleSave() {
    if (onSave) {
      onSave({
        hero,
        items: activeBuild,
        emblem: {
          base: activeEmblem,
          tier1: activeTier1,
          tier2: activeTier2,
          tier3: activeTier3
        },
        spell: engine.getSpellByNameOrId(activeSpell) || { name: activeSpell }
      });
    }
    if (onClose) onClose();
  }

  // Active Emblem Object
  let activeEmblemObj = $derived(engine.getEmblemByName(activeEmblem) || allEmblems[0]);
  let activeSpellObj = $derived(engine.getSpellByNameOrId(activeSpell) || allSpells[0]);
  let t1Obj = $derived(engine.getTalentByIdOrName(activeTier1));
  let t2Obj = $derived(engine.getTalentByIdOrName(activeTier2));
  let t3Obj = $derived(engine.getTalentByIdOrName(activeTier3));
</script>

{#if isOpen && hero}
  <div
    class="prep-backdrop"
    onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    onkeydown={(e) => { if (e.key === 'Escape') onClose(); }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="prep-window tech-bracket">
      
      <!-- TOP PROTOCOL BAR -->
      <div class="prep-header">
        <div class="hero-id-cluster">
          <div class="hero-crest">
            <img src={hero.portrait || '/default-hero.webp'} alt={hero.hero_name} class="hero-face" />
            <span class="crest-level">LV.15</span>
          </div>
          <div class="hero-titles">
            <div class="tag-row">
              <span class="prep-pill">BATTLE PREPARATION</span>
              <span class="role-pill">{hero.class}</span>
            </div>
            <h2 class="hero-name">{hero.hero_name.toUpperCase()}</h2>
          </div>
        </div>

        <!-- 3 GAMEPLAY TABS -->
        <div class="prep-tabs">
          <button
            type="button"
            class="tab-btn"
            class:is-active={activeTab === 'build'}
            onclick={() => activeTab = 'build'}
          >
            <span class="tab-icon">⚔️</span>
            <span class="tab-label">EQUIPMENT</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            class:is-active={activeTab === 'emblem'}
            onclick={() => activeTab = 'emblem'}
          >
            <span class="tab-icon">🛡️</span>
            <span class="tab-label">EMBLEM</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            class:is-active={activeTab === 'spell'}
            onclick={() => activeTab = 'spell'}
          >
            <span class="tab-icon">⚡</span>
            <span class="tab-label">BATTLE SPELL</span>
          </button>
        </div>

        <!-- CLOSE BUTTON -->
        <button type="button" class="close-btn" onclick={onClose} title="Tutup">✕</button>
      </div>

      <!-- MAIN TAB VIEWPORT -->
      <div class="prep-body">

        <!-- ================= TAB 1: EQUIPMENT BUILD ================= -->
        {#if activeTab === 'build'}
          <div class="tab-layout build-layout">
            
            <!-- LEFT: 6 EQUIPPED SLOTS -->
            <div class="equipped-panel">
              <div class="panel-tag-header">
                <span class="panel-subtitle">EQUIPPED SLOTS (6 ITEMS)</span>
                <span class="panel-cue">CLICK SLOT TO REPLACE</span>
              </div>

              <div class="slots-grid">
                {#each [0, 1, 2, 3, 4, 5] as slotIdx}
                  {@const itName = activeBuild[slotIdx]}
                  {@const itObj = engine.getItemByName(itName)}
                  {@const isSelected = selectedSlotIndex === slotIdx}
                  <button
                    type="button"
                    class="slot-card"
                    class:is-selected={isSelected}
                    onclick={() => handleSlotSelect(slotIdx)}
                  >
                    <div class="slot-badge">0{slotIdx + 1}</div>
                    <div class="slot-art-wrap">
                      <img src={engine.getItemIcon(itName)} alt={itName} class="slot-art" />
                    </div>
                    <div class="slot-info">
                      <span class="slot-name">{itName || 'Slot Kosong'}</span>
                      <span class="slot-cost">💰 {itObj?.data?.[0]?.cost || '2000'}</span>
                    </div>
                  </button>
                {/each}
              </div>

              <!-- SELECTED ITEM STATS INSPECTOR -->
              {#if selectedShopItem}
                <div class="item-inspector tech-bracket">
                  <div class="inspect-top">
                    <img src={engine.getItemIcon(selectedShopItem.item_name)} alt={selectedShopItem.item_name} class="inspect-icon" />
                    <div class="inspect-meta">
                      <h4 class="inspect-title">{selectedShopItem.item_name}</h4>
                      <div class="inspect-tags">
                        <span class="category-tag">{selectedShopItem.item_category}</span>
                        <span class="cost-tag">💰 {selectedShopItem.data?.[0]?.cost || 0} Gold</span>
                      </div>
                    </div>
                  </div>

                  <!-- Item Modifiers / Attributes -->
                  <div class="inspect-stats">
                    {#if selectedShopItem.data?.[0]?.modifiers}
                      {#each selectedShopItem.data[0].modifiers as mod}
                        {#each Object.entries(mod) as [k, v]}
                          <div class="stat-pill">
                            <span class="stat-key">{k.replace(/_/g, ' ')}:</span>
                            <span class="stat-val">+{v}</span>
                          </div>
                        {/each}
                      {/each}
                    {/if}
                  </div>

                  <!-- Passives / Actives -->
                  <div class="inspect-passives">
                    {#if selectedShopItem.data?.[0]?.unique_passive}
                      {#each selectedShopItem.data[0].unique_passive as p}
                        {#if p.description && p.description !== 'null'}
                          <div class="passive-row">
                            <span class="passive-name">⚡ {p.unique_passive_name || 'Pasif Unik'}:</span>
                            <p class="passive-desc">{p.description}</p>
                          </div>
                        {/if}
                      {/each}
                    {/if}
                    {#if selectedShopItem.data?.[0]?.active}
                      {#each selectedShopItem.data[0].active as a}
                        {#if a.description && a.description !== 'null'}
                          <div class="passive-row active-row">
                            <span class="passive-name">✨ {a.active_name || 'Aktif'}:</span>
                            <p class="passive-desc">{a.description}</p>
                          </div>
                        {/if}
                      {/each}
                    {/if}
                  </div>

                  <button
                    type="button"
                    class="equip-trigger-btn"
                    onclick={() => handleEquipShopItem(selectedShopItem)}
                  >
                    EQUIP KE SLOT 0{selectedSlotIndex + 1}
                  </button>
                </div>
              {/if}
            </div>

            <!-- RIGHT: IN-GAME SHOP CATALOG -->
            <div class="shop-panel">
              <div class="shop-nav-bar">
                <div class="shop-categories">
                  {#each ['ALL', 'ATTACK', 'MAGIC', 'DEFENSE', 'MOVEMENT', 'ROAM', 'JUNGLE'] as cat}
                    <button
                      type="button"
                      class="cat-filter-btn"
                      class:is-active={shopCategory === cat}
                      onclick={() => shopCategory = cat}
                    >
                      {cat}
                    </button>
                  {/each}
                </div>
                <div class="shop-search-box">
                  <input
                    type="text"
                    bind:value={shopSearch}
                    placeholder="Cari item..."
                    class="search-input"
                  />
                  {#if shopSearch}
                    <button type="button" class="clear-search" onclick={() => shopSearch = ''}>✕</button>
                  {/if}
                </div>
              </div>

              <!-- ITEM ICONS GRID -->
              <div class="shop-grid">
                {#each filteredShopItems as item}
                  {@const isEquippedInBuild = activeBuild.includes(item.item_name)}
                  <button
                    type="button"
                    class="shop-item-btn"
                    class:is-active={selectedShopItem?.item_name === item.item_name}
                    class:is-equipped={isEquippedInBuild}
                    onclick={() => {
                      selectedShopItem = item;
                      handleEquipShopItem(item);
                    }}
                    title="{item.item_name} ({item.item_category})"
                  >
                    <div class="shop-art-box">
                      <img src={engine.getItemIcon(item.item_name)} alt={item.item_name} class="shop-art" />
                      {#if isEquippedInBuild}
                        <span class="equipped-flag">EQ</span>
                      {/if}
                    </div>
                    <span class="shop-cost">{item.data?.[0]?.cost || '0'}</span>
                    <span class="shop-name">{item.item_name}</span>
                  </button>
                {/each}
              </div>
            </div>

          </div>

        <!-- ================= TAB 2: EMBLEM MATRIX ================= -->
        {:else if activeTab === 'emblem'}
          <div class="tab-layout emblem-layout">
            
            <!-- TOP: 7 BASE EMBLEMS SELECTOR -->
            <div class="emblems-selector-bar">
              <span class="bar-headline">CHOOSE BASE EMBLEM:</span>
              <div class="emblem-chips">
                {#each allEmblems as emb}
                  {@const isSelected = activeEmblem.toLowerCase() === emb.emblem_name.toLowerCase() || activeEmblem.toLowerCase() === emb.emblem_role.toLowerCase()}
                  <button
                    type="button"
                    class="emblem-chip"
                    class:is-active={isSelected}
                    onclick={() => handleSelectEmblemBase(emb.emblem_name)}
                  >
                    <img src={emb.icon || engine.getEmblemIcon(emb.emblem_name)} alt={emb.emblem_name} class="chip-icon" />
                    <span class="chip-name">{emb.emblem_name.toUpperCase()}</span>
                    {#if isSelected}
                      <span class="chip-check">✓</span>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>

            <!-- EMBLEM CORE & 3 TALENT TIERS INTERFACE -->
            <div class="emblem-matrix-board">
              
              <!-- LEFT: EMBLEM BASE PEDESTAL -->
              <div class="emblem-pedestal tech-bracket">
                <div class="pedestal-halo">
                  <img src={activeEmblemObj?.icon || engine.getEmblemIcon(activeEmblem)} alt={activeEmblem} class="pedestal-emblem-art" />
                </div>
                <div class="pedestal-meta">
                  <h3 class="pedestal-title">{activeEmblem.toUpperCase()} EMBLEM</h3>
                  <span class="pedestal-tier">TALENT MATRIX // LEVEL 60</span>
                </div>

                <!-- Innate Modifiers -->
                <div class="pedestal-stats">
                  {#if activeEmblemObj?.modifiers?.[0]}
                    {#each Object.entries(activeEmblemObj.modifiers[0]) as [stat, val]}
                      <div class="mod-line">
                        <span class="mod-label">{stat.replace(/_/g, ' ')}:</span>
                        <span class="mod-val">+{val}</span>
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>

              <!-- RIGHT: 3 TALENT TIERS SELECTION -->
              <div class="talents-configuration-panel">
                <div class="config-header">
                  <h4 class="config-title">UNIVERSAL TALENT SLOTS</h4>
                  <span class="config-cue">Customize Tier 1, Tier 2, and Core Passive</span>
                </div>

                <div class="talent-tiers-stack">
                  
                  <!-- TIER 1 -->
                  <div class="tier-card" class:is-picking={selectedTalentTier === 'tier1'}>
                    <div class="tier-identity">
                      <span class="tier-badge">TIER 1</span>
                      <span class="tier-role">ATTRIBUTE BOOST</span>
                    </div>
                    <div class="tier-slot-view">
                      <button
                        type="button"
                        class="slot-circle-btn"
                        onclick={() => selectedTalentTier = selectedTalentTier === 'tier1' ? null : 'tier1'}
                      >
                        <img src={engine.getTalentIcon(activeTier1)} alt={activeTier1} class="talent-circle-art" />
                      </button>
                      <div class="talent-text-col">
                        <span class="talent-name">{activeTier1}</span>
                        <span class="talent-desc">{t1Obj?.description || '+Adaptive Stats'}</span>
                      </div>
                      <button
                        type="button"
                        class="change-talent-btn"
                        onclick={() => selectedTalentTier = selectedTalentTier === 'tier1' ? null : 'tier1'}
                      >
                        {selectedTalentTier === 'tier1' ? 'TUTUP' : 'GANTI'}
                      </button>
                    </div>

                    <!-- TIER 1 PICKER ACCORDION -->
                    {#if selectedTalentTier === 'tier1'}
                      <div class="picker-tray">
                        {#each allTalents.tier1 || [] as talent}
                          <button
                            type="button"
                            class="talent-option-pill"
                            class:is-active={activeTier1.toLowerCase() === talent.name.toLowerCase()}
                            onclick={() => handleSelectTalent('tier1', talent)}
                          >
                            <img src={talent.icon || engine.getTalentIcon(talent.id)} alt={talent.name} class="pill-art" />
                            <div class="pill-body">
                              <span class="pill-title">{talent.name}</span>
                              <span class="pill-desc">{talent.description}</span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <!-- TIER 2 -->
                  <div class="tier-card" class:is-picking={selectedTalentTier === 'tier2'}>
                    <div class="tier-identity">
                      <span class="tier-badge">TIER 2</span>
                      <span class="tier-role">TACTICAL UTILITY</span>
                    </div>
                    <div class="tier-slot-view">
                      <button
                        type="button"
                        class="slot-circle-btn"
                        onclick={() => selectedTalentTier = selectedTalentTier === 'tier2' ? null : 'tier2'}
                      >
                        <img src={engine.getTalentIcon(activeTier2)} alt={activeTier2} class="talent-circle-art" />
                      </button>
                      <div class="talent-text-col">
                        <span class="talent-name">{activeTier2}</span>
                        <span class="talent-desc">{t2Obj?.description || 'Combat Enhancement'}</span>
                      </div>
                      <button
                        type="button"
                        class="change-talent-btn"
                        onclick={() => selectedTalentTier = selectedTalentTier === 'tier2' ? null : 'tier2'}
                      >
                        {selectedTalentTier === 'tier2' ? 'TUTUP' : 'GANTI'}
                      </button>
                    </div>

                    <!-- TIER 2 PICKER ACCORDION -->
                    {#if selectedTalentTier === 'tier2'}
                      <div class="picker-tray">
                        {#each allTalents.tier2 || [] as talent}
                          <button
                            type="button"
                            class="talent-option-pill"
                            class:is-active={activeTier2.toLowerCase() === talent.name.toLowerCase()}
                            onclick={() => handleSelectTalent('tier2', talent)}
                          >
                            <img src={talent.icon || engine.getTalentIcon(talent.id)} alt={talent.name} class="pill-art" />
                            <div class="pill-body">
                              <span class="pill-title">{talent.name}</span>
                              <span class="pill-desc">{talent.description}</span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <!-- TIER 3 (CORE TALENT) -->
                  <div class="tier-card core-tier-card" class:is-picking={selectedTalentTier === 'tier3'}>
                    <div class="tier-identity">
                      <span class="tier-badge core-badge">TIER 3</span>
                      <span class="tier-role core-role">CORE PASSIVE</span>
                    </div>
                    <div class="tier-slot-view">
                      <button
                        type="button"
                        class="slot-circle-btn core-circle-btn"
                        onclick={() => selectedTalentTier = selectedTalentTier === 'tier3' ? null : 'tier3'}
                      >
                        <img src={engine.getTalentIcon(activeTier3)} alt={activeTier3} class="talent-circle-art" />
                      </button>
                      <div class="talent-text-col">
                        <span class="talent-name core-name">{activeTier3}</span>
                        <span class="talent-desc">{t3Obj?.description || 'Signature Combat Passive'}</span>
                      </div>
                      <button
                        type="button"
                        class="change-talent-btn core-change-btn"
                        onclick={() => selectedTalentTier = selectedTalentTier === 'tier3' ? null : 'tier3'}
                      >
                        {selectedTalentTier === 'tier3' ? 'TUTUP' : 'GANTI'}
                      </button>
                    </div>

                    <!-- TIER 3 PICKER ACCORDION -->
                    {#if selectedTalentTier === 'tier3'}
                      <div class="picker-tray">
                        {#each allTalents.tier3 || [] as talent}
                          <button
                            type="button"
                            class="talent-option-pill"
                            class:is-active={activeTier3.toLowerCase() === talent.name.toLowerCase()}
                            onclick={() => handleSelectTalent('tier3', talent)}
                          >
                            <img src={talent.icon || engine.getTalentIcon(talent.id)} alt={talent.name} class="pill-art" />
                            <div class="pill-body">
                              <span class="pill-title">{talent.name}</span>
                              <span class="pill-desc">{talent.description}</span>
                            </div>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>

                </div>
              </div>

            </div>

          </div>

        <!-- ================= TAB 3: BATTLE SPELLS ================= -->
        {:else if activeTab === 'spell'}
          <div class="tab-layout spell-layout">
            
            <!-- LEFT: 12 BATTLE SPELLS GRID -->
            <div class="spells-deck">
              <div class="deck-head">
                <span class="deck-tag">SPELL SELECTION (12 AVAILABLE)</span>
                <span class="deck-cue">PILIH BATTLE SPELL UNTUK PERTANDINGAN</span>
              </div>

              <div class="spells-hex-grid">
                {#each allSpells as sp}
                  {@const isEquipped = activeSpell.toLowerCase() === sp.name.toLowerCase() || activeSpell.toLowerCase() === sp.id.toLowerCase()}
                  <button
                    type="button"
                    class="spell-hex-card"
                    class:is-active={isEquipped}
                    onclick={() => handleSelectSpell(sp)}
                  >
                    <div class="spell-circle-frame">
                      <img src={sp.icon || engine.getSpellIcon(sp.id)} alt={sp.name} class="spell-art" />
                      {#if isEquipped}
                        <div class="equip-indicator">✓</div>
                      {/if}
                    </div>
                    <span class="spell-name-tag">{sp.name.toUpperCase()}</span>
                    <span class="spell-cd-tag">{sp.cd || 'CD'}</span>
                  </button>
                {/each}
              </div>
            </div>

            <!-- RIGHT: ACTIVE SPELL INTEL & COMBAT USAGE -->
            <div class="spell-dossier-panel tech-bracket">
              <div class="dossier-heroic">
                <div class="spell-big-art">
                  <img src={activeSpellObj?.icon || engine.getSpellIcon(activeSpell)} alt={activeSpell} class="big-spell-img" />
                </div>
                <div class="spell-meta-head">
                  <span class="spell-cooldown-badge">COOLDOWN: {activeSpellObj?.cd || '60s'}</span>
                  <h3 class="spell-full-name">{activeSpell.toUpperCase()}</h3>
                </div>
              </div>

              <div class="spell-text-container">
                <div class="intel-block">
                  <span class="intel-tag">EFEK & DESKRIPSI RESMI:</span>
                  <p class="intel-text">{activeSpellObj?.description || 'Kemampuan aktif pertempuran.'}</p>
                </div>

                {#if activeSpellObj?.best_against}
                  <div class="intel-block counter-intel">
                    <span class="intel-tag alert-txt">REKOMENDASI PENGGUNAAN:</span>
                    <p class="intel-text">{activeSpellObj.best_against}</p>
                  </div>
                {/if}
              </div>

              <button
                type="button"
                class="equip-spell-trigger"
                onclick={() => handleSelectSpell(activeSpellObj)}
              >
                EQUIP {activeSpell.toUpperCase()}
              </button>
            </div>

          </div>
        {/if}

      </div>

      <!-- BOTTOM CONTROL BAR -->
      <div class="prep-footer">
        <button type="button" class="action-btn default-btn" onclick={handleResetDefault}>
          RESET KE REKOMENDASI META
        </button>
        <div class="footer-right">
          <button type="button" class="action-btn cancel-btn" onclick={onClose}>
            BATAL
          </button>
          <button type="button" class="action-btn save-btn" onclick={handleSave}>
            SIMPAN & TERAPKAN
          </button>
        </div>
      </div>

    </div>
  </div>
{/if}

<style>
  .prep-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(3, 7, 18, 0.85);
    backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }

  .prep-window {
    width: 100%;
    max-width: 1150px;
    height: 88vh;
    max-height: 820px;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(8, 12, 24, 0.99) 100%);
    border: 1px solid rgba(245, 158, 11, 0.4);
    box-shadow: 0 0 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* HEADER */
  .prep-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: rgba(6, 11, 25, 0.9);
    border-bottom: 1px solid rgba(245, 158, 11, 0.25);
    gap: 1.5rem;
  }

  .hero-id-cluster {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hero-crest {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid #f59e0b;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
    overflow: hidden;
  }

  .hero-face {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .crest-level {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.85);
    font-size: 0.55rem;
    font-weight: 900;
    color: #fbbf24;
    text-align: center;
    letter-spacing: 0.05em;
  }

  .tag-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
  }

  .prep-pill {
    font-size: 0.62rem;
    font-weight: 800;
    color: #38bdf8;
    letter-spacing: 0.08em;
  }

  .role-pill {
    font-size: 0.62rem;
    font-weight: 700;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.07);
    padding: 0.05rem 0.4rem;
    border-radius: 3px;
  }

  .hero-name {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.06em;
    font-family: inherit;
  }

  /* TABS */
  .prep-tabs {
    display: flex;
    gap: 0.6rem;
    background: rgba(15, 23, 42, 0.7);
    padding: 0.3rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1.1rem;
    border: 1px solid transparent;
    background: transparent;
    color: #94a3b8;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s ease;
  }

  .tab-btn:hover {
    color: #f1f5f9;
    background: rgba(255, 255, 255, 0.05);
  }

  .tab-btn.is-active {
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.45) 100%);
    border: 1px solid #f59e0b;
    color: #ffffff;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
  }

  .close-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #94a3b8;
    font-size: 1.1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: #ef4444;
    color: #ffffff;
  }

  /* BODY VIEWPORT */
  .prep-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem 1.5rem;
    position: relative;
  }

  .tab-layout {
    display: grid;
    gap: 1.5rem;
    height: 100%;
  }

  /* BUILD TAB */
  .build-layout {
    grid-template-columns: 360px 1fr;
  }

  .equipped-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-tag-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.4rem;
  }

  .panel-subtitle {
    font-size: 0.72rem;
    font-weight: 800;
    color: #f59e0b;
    letter-spacing: 0.06em;
  }

  .panel-cue {
    font-size: 0.62rem;
    color: #64748b;
  }

  .slots-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .slot-card {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .slot-card:hover {
    border-color: rgba(245, 158, 11, 0.5);
    background: rgba(15, 23, 42, 0.85);
  }

  .slot-card.is-selected {
    border: 1px solid #f59e0b;
    background: rgba(245, 158, 11, 0.15);
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
  }

  .slot-badge {
    font-size: 0.65rem;
    font-weight: 900;
    color: #f59e0b;
  }

  .slot-art-wrap {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.15);
    overflow: hidden;
    flex-shrink: 0;
  }

  .slot-art {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .slot-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .slot-name {
    font-size: 0.78rem;
    font-weight: 700;
    color: #f8fafc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .slot-cost {
    font-size: 0.68rem;
    color: #fbbf24;
    font-weight: 600;
  }

  /* ITEM INSPECTOR */
  .item-inspector {
    background: rgba(10, 16, 30, 0.85);
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .inspect-top {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .inspect-icon {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    border: 1px solid #f59e0b;
  }

  .inspect-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #ffffff;
  }

  .inspect-tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.2rem;
  }

  .category-tag {
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border-radius: 2px;
  }

  .cost-tag {
    font-size: 0.65rem;
    color: #fbbf24;
    font-weight: 700;
  }

  .inspect-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .stat-pill {
    font-size: 0.68rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stat-key {
    color: #94a3b8;
    text-transform: capitalize;
  }

  .stat-val {
    color: #4ade80;
    font-weight: 700;
    margin-left: 0.2rem;
  }

  .inspect-passives {
    max-height: 120px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .passive-row {
    font-size: 0.7rem;
    line-height: 1.35;
  }

  .passive-name {
    color: #f59e0b;
    font-weight: 700;
  }

  .passive-desc {
    margin: 0.1rem 0 0;
    color: #cbd5e1;
  }

  .equip-trigger-btn {
    width: 100%;
    padding: 0.6rem;
    background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
    border: 1px solid #fbbf24;
    color: #ffffff;
    font-size: 0.82rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.15s ease;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
  }

  .equip-trigger-btn:hover {
    filter: brightness(1.15);
  }

  /* SHOP PANEL */
  .shop-panel {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    overflow: hidden;
  }

  .shop-nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: rgba(15, 23, 42, 0.6);
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .shop-categories {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .cat-filter-btn {
    padding: 0.3rem 0.65rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 700;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.12s ease;
  }

  .cat-filter-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
  }

  .cat-filter-btn.is-active {
    background: #f59e0b;
    border-color: #fbbf24;
    color: #000000;
    font-weight: 900;
  }

  .shop-search-box {
    position: relative;
    width: 170px;
  }

  .search-input {
    width: 100%;
    padding: 0.3rem 0.6rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    color: #ffffff;
    font-size: 0.75rem;
  }

  .clear-search {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
  }

  .shop-grid {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
    gap: 0.6rem;
    padding-right: 0.3rem;
  }

  .shop-item-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.4rem 0.2rem;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.12s ease;
  }

  .shop-item-btn:hover {
    border-color: #38bdf8;
    transform: translateY(-2px);
    background: rgba(15, 23, 42, 0.85);
  }

  .shop-item-btn.is-active {
    border-color: #f59e0b;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
    background: rgba(245, 158, 11, 0.15);
  }

  .shop-art-box {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 4px;
    background: #000000;
    overflow: hidden;
  }

  .shop-art {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .equipped-flag {
    position: absolute;
    top: 0;
    right: 0;
    background: #22c55e;
    color: #000;
    font-size: 0.5rem;
    font-weight: 900;
    padding: 0 0.2rem;
    border-bottom-left-radius: 3px;
  }

  .shop-cost {
    font-size: 0.62rem;
    font-weight: 700;
    color: #fbbf24;
    margin-top: 0.2rem;
  }

  .shop-name {
    font-size: 0.62rem;
    color: #cbd5e1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  /* EMBLEM TAB */
  .emblem-layout {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .emblems-selector-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(15, 23, 42, 0.7);
    padding: 0.6rem 1rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .bar-headline {
    font-size: 0.72rem;
    font-weight: 800;
    color: #f59e0b;
    letter-spacing: 0.06em;
  }

  .emblem-chips {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .emblem-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.12s ease;
  }

  .emblem-chip:hover {
    border-color: #38bdf8;
    background: rgba(30, 41, 59, 0.8);
  }

  .emblem-chip.is-active {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.2);
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
  }

  .chip-icon {
    width: 24px;
    height: 24px;
  }

  .chip-name {
    font-size: 0.72rem;
    font-weight: 800;
    color: #f8fafc;
  }

  .chip-check {
    font-size: 0.7rem;
    color: #fbbf24;
    font-weight: 900;
  }

  .emblem-matrix-board {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
    flex: 1;
  }

  .emblem-pedestal {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1rem;
    background: radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15) 0%, rgba(10, 16, 30, 0.8) 70%);
    border: 1px solid rgba(245, 158, 11, 0.35);
  }

  .pedestal-halo {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    border: 2px solid #f59e0b;
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000000;
    margin-bottom: 1rem;
  }

  .pedestal-emblem-art {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .pedestal-title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 900;
    color: #ffffff;
    text-align: center;
  }

  .pedestal-tier {
    font-size: 0.65rem;
    color: #38bdf8;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .pedestal-stats {
    width: 100%;
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 0.8rem;
  }

  .mod-line {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
  }

  .mod-label {
    color: #94a3b8;
    text-transform: capitalize;
  }

  .mod-val {
    color: #4ade80;
    font-weight: 800;
  }

  .talents-configuration-panel {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .config-title {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 800;
    color: #f8fafc;
  }

  .config-cue {
    font-size: 0.68rem;
    color: #64748b;
  }

  .talent-tiers-stack {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .tier-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    transition: all 0.15s ease;
  }

  .tier-card.is-picking {
    border-color: #f59e0b;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
  }

  .tier-identity {
    display: flex;
    gap: 0.6rem;
    align-items: center;
  }

  .tier-badge {
    font-size: 0.62rem;
    font-weight: 900;
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    padding: 0.1rem 0.4rem;
    border-radius: 2px;
  }

  .core-badge {
    background: rgba(245, 158, 11, 0.25);
    color: #fbbf24;
  }

  .tier-role {
    font-size: 0.65rem;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.05em;
  }

  .tier-slot-view {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .slot-circle-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #000000;
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .slot-circle-btn:hover {
    border-color: #f59e0b;
  }

  .core-circle-btn {
    border-color: #f59e0b;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
  }

  .talent-circle-art {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }

  .talent-text-col {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .talent-name {
    font-size: 0.88rem;
    font-weight: 800;
    color: #ffffff;
  }

  .core-name {
    color: #fbbf24;
  }

  .talent-desc {
    font-size: 0.72rem;
    color: #cbd5e1;
    line-height: 1.3;
  }

  .change-talent-btn {
    padding: 0.35rem 0.8rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #e2e8f0;
    font-size: 0.7rem;
    font-weight: 800;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.12s ease;
  }

  .change-talent-btn:hover {
    background: #f59e0b;
    border-color: #fbbf24;
    color: #000;
  }

  .picker-tray {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 0.6rem;
  }

  .talent-option-pill {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.6rem;
    background: rgba(10, 16, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    transition: all 0.12s ease;
  }

  .talent-option-pill:hover {
    border-color: #38bdf8;
    background: rgba(10, 16, 30, 0.95);
  }

  .talent-option-pill.is-active {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.15);
  }

  .pill-art {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .pill-title {
    display: block;
    font-size: 0.74rem;
    font-weight: 800;
    color: #ffffff;
  }

  .pill-desc {
    display: block;
    font-size: 0.65rem;
    color: #94a3b8;
    line-height: 1.25;
  }

  /* SPELL TAB */
  .spell-layout {
    grid-template-columns: 1fr 340px;
  }

  .spells-deck {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .deck-head {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.4rem;
  }

  .deck-tag {
    font-size: 0.72rem;
    font-weight: 800;
    color: #f59e0b;
    letter-spacing: 0.06em;
  }

  .deck-cue {
    font-size: 0.62rem;
    color: #64748b;
  }

  .spells-hex-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.8rem;
  }

  .spell-hex-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .spell-hex-card:hover {
    border-color: #38bdf8;
    transform: translateY(-2px);
    background: rgba(15, 23, 42, 0.85);
  }

  .spell-hex-card.is-active {
    border: 1px solid #f59e0b;
    background: rgba(245, 158, 11, 0.18);
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
  }

  .spell-circle-frame {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    background: #000000;
    margin-bottom: 0.4rem;
  }

  .spell-hex-card.is-active .spell-circle-frame {
    border-color: #f59e0b;
  }

  .spell-art {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .equip-indicator {
    position: absolute;
    inset: 0;
    background: rgba(245, 158, 11, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    color: #ffffff;
    font-weight: 900;
  }

  .spell-name-tag {
    font-size: 0.74rem;
    font-weight: 800;
    color: #ffffff;
  }

  .spell-cd-tag {
    font-size: 0.65rem;
    color: #38bdf8;
    font-weight: 700;
  }

  .spell-dossier-panel {
    background: rgba(10, 16, 30, 0.85);
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.25rem;
  }

  .dossier-heroic {
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 1rem;
  }

  .spell-big-art {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid #f59e0b;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
    background: #000;
    overflow: hidden;
    flex-shrink: 0;
  }

  .big-spell-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .spell-cooldown-badge {
    font-size: 0.65rem;
    font-weight: 800;
    color: #38bdf8;
    letter-spacing: 0.08em;
  }

  .spell-full-name {
    margin: 0.2rem 0 0;
    font-size: 1.2rem;
    font-weight: 900;
    color: #ffffff;
  }

  .spell-text-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .intel-block {
    font-size: 0.74rem;
    line-height: 1.4;
  }

  .intel-tag {
    display: block;
    font-weight: 800;
    color: #94a3b8;
    margin-bottom: 0.25rem;
    font-size: 0.65rem;
    letter-spacing: 0.06em;
  }

  .alert-txt {
    color: #f59e0b;
  }

  .intel-text {
    margin: 0;
    color: #f1f5f9;
  }

  .equip-spell-trigger {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
    border: 1px solid #fbbf24;
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.35);
    transition: all 0.15s ease;
  }

  .equip-spell-trigger:hover {
    filter: brightness(1.15);
  }

  /* FOOTER */
  .prep-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.5rem;
    background: rgba(6, 11, 25, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-right {
    display: flex;
    gap: 0.75rem;
  }

  .action-btn {
    padding: 0.55rem 1.1rem;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.12s ease;
  }

  .default-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #94a3b8;
  }

  .default-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  .cancel-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #94a3b8;
  }

  .cancel-btn:hover {
    color: #ffffff;
  }

  .save-btn {
    background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
    border: 1px solid #fbbf24;
    color: #000000;
    font-weight: 900;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
  }

  .save-btn:hover {
    filter: brightness(1.15);
  }

  @media (max-width: 900px) {
    .build-layout, .emblem-matrix-board, .spell-layout {
      grid-template-columns: 1fr;
    }
    .prep-window {
      height: 96vh;
    }
  }
</style>
