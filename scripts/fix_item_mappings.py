import os
import json
import shutil

# 1. Duplicate / alias files in public/items
base_items_dir = os.path.join('public', 'items')

copies = [
    ('haass_claws.png', 'haas_claws.png'),
    ('haass_claws.png', "haas'_claws.png"),
    ('demon_boots.png', 'demon_shoes.png'),
    ('magic_boots.png', 'magic_shoes.png'),
]

for src, dst in copies:
    src_path = os.path.join(base_items_dir, src)
    dst_path = os.path.join(base_items_dir, dst)
    if os.path.exists(src_path):
        shutil.copyfile(src_path, dst_path)
        print(f"Copied {src} -> {dst}")

# 2. Update items.json
items_path = os.path.join('src', 'data', 'items.json')
with open(items_path, 'r', encoding='utf-8') as f:
    items = json.load(f)

for it in items:
    name = it['item_name']
    if "Haas" in name:
        it['icon'] = '/items/haas_claws.png'
    elif name == 'Demon Shoes':
        it['icon'] = '/items/demon_shoes.png'
    elif name == 'Magic Shoes':
        it['icon'] = '/items/magic_shoes.png'

with open(items_path, 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2)

print("Updated items.json")

# 3. Verify all items in items.json have existing files
missing = []
for it in items:
    path = os.path.join('public', it['icon'].lstrip('/'))
    if not os.path.exists(path):
        missing.append((it['item_name'], it['icon']))

print(f"Missing items in items.json: {len(missing)}")

# 4. Verify all items in heroBuilds.json have valid images
builds_path = os.path.join('src', 'data', 'heroBuilds.json')
with open(builds_path, 'r', encoding='utf-8') as f:
    builds = json.load(f)

missing_build_items = set()
for hname, b in builds.items():
    for item in b.get('items', {}).get('core', []):
        iname = item['name']
        # check file existence via common slug
        slug1 = iname.lower().replace("'", "").replace(" ", "_") + ".png"
        slug2 = iname.lower().replace("'", "_").replace(" ", "_") + ".png"
        if not os.path.exists(os.path.join(base_items_dir, slug1)) and not os.path.exists(os.path.join(base_items_dir, slug2)):
            missing_build_items.add(iname)

print(f"Missing build items across all 133 heroes: {missing_build_items}")
