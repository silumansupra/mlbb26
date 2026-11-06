import urllib.request
import json
import re
from datetime import datetime, timezone, timedelta

def build_winrate_data():
    url = 'https://raw.githubusercontent.com/Pren7/MLBB-Winrate/refs/heads/main/winrate.json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw_winrates = json.loads(resp.read().decode('utf-8'))
        
    with open('src/data/heroes.json', 'r', encoding='utf-8') as f:
        heroes = json.load(f)

    clean_str = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
    
    # Map raw entries by cleaned name
    raw_map = {}
    for entry in raw_winrates:
        raw_map[clean_str(entry['name'])] = entry

    # Current UTC & WIB timestamp
    wib_tz = timezone(timedelta(hours=7))
    now_wib = datetime.now(wib_tz)
    timestamp_iso = now_wib.isoformat()
    formatted_date = now_wib.strftime("%d %b %Y, %H:%M WIB")

    hero_stats = {}
    for h in heroes:
        hname = h['hero_name']
        ckey = clean_str(hname)
        matched = raw_map.get(ckey)
        
        if matched:
            wr_str = matched.get('winrate', '50.00%')
            br_str = matched.get('banrate', '0.00%')
            pr_str = matched.get('pickrate', '0.00%')
        else:
            # Fallback for new hero or slight spelling diff
            wr_str = '50.00%'
            br_str = '1.00%'
            pr_str = '1.00%'

        wr_num = float(re.sub(r'[^0-9\.]', '', wr_str) or 50.0)
        br_num = float(re.sub(r'[^0-9\.]', '', br_str) or 0.0)
        pr_num = float(re.sub(r'[^0-9\.]', '', pr_str) or 0.0)

        # Tier calculation based on MLBB Meta:
        # Tier S+: Winrate >= 54% or (Winrate >= 52% and Banrate >= 20%)
        # Tier S: Winrate >= 52% or (Winrate >= 50% and Banrate >= 10%)
        # Tier A: Winrate >= 49%
        # Tier B: Winrate < 49%
        if wr_num >= 54.5 or (wr_num >= 52.0 and br_num >= 20.0):
            tier = 'S+'
        elif wr_num >= 52.0 or (wr_num >= 50.5 and br_num >= 8.0):
            tier = 'S'
        elif wr_num >= 49.0:
            tier = 'A'
        else:
            tier = 'B'

        hero_stats[ckey] = {
            "name": hname,
            "winrate": wr_str,
            "winrate_num": wr_num,
            "banrate": br_str,
            "banrate_num": br_num,
            "pickrate": pr_str,
            "pickrate_num": pr_num,
            "tier": tier
        }

    output = {
        "metadata": {
            "last_updated": formatted_date,
            "timestamp_iso": timestamp_iso,
            "source": "https://m.mobilelegends.com/rank",
            "source_provider": "Pren7/MLBB-Winrate via Official Moonton GMS API",
            "rank_scope": "All Rank (Past 1 Day)",
            "total_heroes": len(hero_stats)
        },
        "heroes": hero_stats
    }

    out_path = 'src/data/winrate.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {out_path} with {len(hero_stats)} heroes!")
    print(f"Timestamp: {formatted_date}")

if __name__ == '__main__':
    build_winrate_data()
