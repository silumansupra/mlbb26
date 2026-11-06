import os
import json
import urllib.request
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def download_file(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 100:
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            with open(target_path, 'wb') as f:
                f.write(content)
        print(f"Downloaded: {os.path.basename(target_path)} ({len(content)} bytes)")
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

# 1. DOWNLOAD ITEMS
def sync_items():
    print("\n--- SYNCING EQUIPMENT ITEMS ---")
    list_url = 'https://api.github.com/repos/Ceplin03/database-mlbb.Mobile-Legends-Bang-Bang/contents/logo-equipment'
    req = urllib.request.Request(list_url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        files = json.loads(resp.read().decode('utf-8'))
    
    file_map = {}
    for f in files:
        name = f['name']
        download_url = f['download_url']
        target = os.path.join('public', 'items', name)
        download_file(download_url, target)
        clean_key = re.sub(r'[^a-z0-9]', '', name.lower().replace('.png', ''))
        file_map[clean_key] = name

    # Load items.json and map icon paths
    items_path = os.path.join('src', 'data', 'items.json')
    with open(items_path, 'r', encoding='utf-8') as f:
        items = json.load(f)
    
    for item in items:
        raw_name = item.get('item_name', '')
        clean_name = re.sub(r'[^a-z0-9]', '', raw_name.lower())
        matched_file = file_map.get(clean_name)
        if not matched_file:
            # try fuzzy matching
            for k, fn in file_map.items():
                if k in clean_name or clean_name in k:
                    matched_file = fn
                    break
        if matched_file:
            item['icon'] = f"/items/{matched_file}"
        else:
            item['icon'] = f"/items/{raw_name.replace(' ', '_').lower()}.png"
            
    with open(items_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)
    print(f"Updated {len(items)} items in items.json")

# 2. DOWNLOAD BATTLE SPELLS
def sync_spells():
    print("\n--- SYNCING BATTLE SPELLS ---")
    spell_names = [
        "Execute", "Retribution", "Inspire", "Sprint", "Revitalize", 
        "Aegis", "Petrify", "Purify", "Flame_Retribution", "Flicker", 
        "Arrival", "Vengeance", "Flameshot"
    ]
    titles = "|".join([f"File:{s}.png" for s in spell_names])
    api_url = f"https://mobile-legends.fandom.com/api.php?action=query&titles={titles}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(api_url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    
    downloaded_spells = {}
    pages = data.get('query', {}).get('pages', {})
    for pid, pdata in pages.items():
        title = pdata.get('title', '').replace('File:', '').replace('.png', '')
        if 'imageinfo' in pdata and len(pdata['imageinfo']) > 0:
            img_url = pdata['imageinfo'][0]['url']
            clean_id = title.lower().replace('_', '-')
            target = os.path.join('public', 'spells', f"{clean_id}.png")
            download_file(img_url, target)
            downloaded_spells[title.lower().replace('_', '')] = f"/spells/{clean_id}.png"

    # Update spells.json
    spells_path = os.path.join('src', 'data', 'spells.json')
    with open(spells_path, 'r', encoding='utf-8') as f:
        spells = json.load(f)

    for spell in spells:
        s_id = spell.get('id', '').lower().replace('-', '')
        for k, icon_path in downloaded_spells.items():
            if k == s_id or s_id in k or k in s_id:
                spell['icon'] = icon_path
                break
        if 'icon' not in spell:
            spell['icon'] = f"/spells/{spell.get('id')}.png"

    with open(spells_path, 'w', encoding='utf-8') as f:
        json.dump(spells, f, indent=2)
    print(f"Updated {len(spells)} spells in spells.json")

# 3. DOWNLOAD EMBLEMS & TALENTS
def sync_emblems_and_talents():
    print("\n--- SYNCING EMBLEMS & TALENTS ---")
    EMBLEM_ICON_SLUGS = {
        "common": "basic-common",
        "tank": "custom-tank",
        "assassin": "custom-assassin",
        "mage": "custom-mage",
        "fighter": "custom-fighter",
        "support": "custom-support",
        "marksman": "custom-marksman",
    }
    
    for role, slug in EMBLEM_ICON_SLUGS.items():
        url = f"https://mlbb.tools/emblems/{slug}.webp"
        target = os.path.join('public', 'emblems', f"{slug}.webp")
        download_file(url, target)
        
    talents_path = os.path.join('src', 'data', 'talents.json')
    with open(talents_path, 'r', encoding='utf-8') as f:
        talent_data = json.load(f)

    tiers = talent_data if isinstance(talent_data, dict) else {}
    for tier, talents in tiers.items():
        for t in talents:
            tid = t.get('id', '')
            t['icon'] = f"/talents/{tid}.webp"
            url = f"https://mlbb.tools/emblems/talents/{tid}.webp"
            target = os.path.join('public', 'talents', f"{tid}.webp")
            download_file(url, target)

    with open(talents_path, 'w', encoding='utf-8') as f:
        json.dump(talent_data, f, indent=2)
    print("Updated emblems and talents")

if __name__ == '__main__':
    sync_items()
    sync_spells()
    sync_emblems_and_talents()
    print("\nALL ASSETS SYNC COMPLETED SUCCESSFULLY!")
