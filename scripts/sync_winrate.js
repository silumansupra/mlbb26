import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WINRATE_URL = 'https://raw.githubusercontent.com/Pren7/MLBB-Winrate/refs/heads/main/winrate.json';
const HEROES_PATH = path.resolve(__dirname, '../src/data/heroes.json');
const OUTPUT_PATH = path.resolve(__dirname, '../src/data/winrate.json');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node-MLBB-Sync/1.0' } }, (res) => {
      let data = '';
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP Status ${res.statusCode}`));
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function cleanStr(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log('Fetching latest MLBB hero winrates from Moonton data feed...');
  const rawWinrates = await fetchJson(WINRATE_URL);
  const heroes = JSON.parse(fs.readFileSync(HEROES_PATH, 'utf-8'));

  const rawMap = new Map();
  for (const entry of rawWinrates) {
    rawMap.set(cleanStr(entry.name), entry);
  }

  // Indonesian WIB Date Formatter (UTC + 7)
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibDate = new Date(utcMs + (7 * 3600000));
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = String(wibDate.getDate()).padStart(2, '0');
  const month = months[wibDate.getMonth()];
  const year = wibDate.getFullYear();
  const hours = String(wibDate.getHours()).padStart(2, '0');
  const mins = String(wibDate.getMinutes()).padStart(2, '0');
  const formattedDate = `${day} ${month} ${year}, ${hours}:${mins} WIB`;

  const heroStats = {};
  for (const h of heroes) {
    const hname = h.hero_name;
    const ckey = cleanStr(hname);
    const matched = rawMap.get(ckey);

    const wrStr = matched?.winrate || '50.00%';
    const brStr = matched?.banrate || '0.00%';
    const prStr = matched?.pickrate || '0.00%';

    const wrNum = parseFloat(wrStr.replace(/[^0-9.]/g, '')) || 50.0;
    const brNum = parseFloat(brStr.replace(/[^0-9.]/g, '')) || 0.0;
    const prNum = parseFloat(prStr.replace(/[^0-9.]/g, '')) || 0.0;

    let tier = 'B';
    if (wrNum >= 54.5 || (wrNum >= 52.0 && brNum >= 20.0)) {
      tier = 'S+';
    } else if (wrNum >= 52.0 || (wrNum >= 50.5 && brNum >= 8.0)) {
      tier = 'S';
    } else if (wrNum >= 49.0) {
      tier = 'A';
    }

    heroStats[ckey] = {
      name: hname,
      winrate: wrStr,
      winrate_num: wrNum,
      banrate: brStr,
      banrate_num: brNum,
      pickrate: prStr,
      pickrate_num: prNum,
      tier
    };
  }

  const output = {
    metadata: {
      last_updated: formattedDate,
      timestamp_iso: wibDate.toISOString(),
      source: 'https://m.mobilelegends.com/rank',
      source_provider: 'Pren7/MLBB-Winrate via Official Moonton GMS API',
      rank_scope: 'All Rank (Past 1 Day)',
      total_heroes: Object.keys(heroStats).length
    },
    heroes: heroStats
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Success! Updated ${OUTPUT_PATH}`);
  console.log(`Update Terakhir: ${formattedDate}`);
}

run().catch(err => {
  console.error('Failed to sync winrates:', err);
  process.exit(1);
});
