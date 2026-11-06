import os
import re
import json
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
from io import BytesIO

HEROES_JSON_PATH = 'src/data/heroes.json'
OUTPUT_DIR = 'public/heroes'

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(HEROES_JSON_PATH, 'r', encoding='utf-8') as f:
    heroes = json.load(f)

def get_hero_slug(name):
    clean = re.sub(r'[^a-zA-Z0-9]', '_', name.lower().strip())
    clean = re.sub(r'_+', '_', clean).strip('_')
    return clean

# Special URL for Sora
SORA_URL = 'https://static.wikia.nocookie.net/mobile-legends/images/0/00/Hero1311-portrait.png'

def process_hero(hero):
    name = hero['hero_name']
    slug = get_hero_slug(name)
    dst_filename = f"{slug}.webp"
    dst_path = os.path.join(OUTPUT_DIR, dst_filename)
    local_url = f"/heroes/{dst_filename}"

    # Sora special handling
    url = hero.get('portrait')
    if name.lower() == 'sora' or not url:
        url = SORA_URL

    if not url:
        print(f"[{name}] No URL found")
        hero['portrait'] = '/default-hero.webp'
        return

    # If already downloaded and valid
    if os.path.exists(dst_path) and os.path.getsize(dst_path) > 1000:
        hero['portrait'] = local_url
        return

    # Download
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            im = Image.open(BytesIO(data))
            
            # Convert to RGBA or RGB
            if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                im = im.convert('RGBA')
            else:
                im = im.convert('RGB')
            
            # Resize if bigger than 300x300
            if im.width > 300 or im.height > 300:
                im.thumbnail((300, 300), Image.Resampling.LANCZOS)
                
            im.save(dst_path, 'WEBP', quality=85)
            hero['portrait'] = local_url
            print(f"[OK] {name} -> {dst_filename} ({os.path.getsize(dst_path)} bytes)")
    except Exception as e:
        print(f"[FAIL] {name} ({url}): {e}")

print(f"Starting download of {len(heroes)} hero portraits into {OUTPUT_DIR}...")

with ThreadPoolExecutor(max_workers=8) as executor:
    list(executor.map(process_hero, heroes))

# Also create a default hero fallback webp if none
default_fallback = os.path.join(OUTPUT_DIR, 'default.webp')
if not os.path.exists(default_fallback):
    img = Image.new('RGB', (200, 200), color=(17, 24, 39))
    img.save(default_fallback, 'WEBP')

# Write updated src/data/heroes.json
with open(HEROES_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(heroes, f, ensure_ascii=False, indent=2)

print("\nSuccessfully updated src/data/heroes.json with local assets!")
