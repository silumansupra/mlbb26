import json, os

with open('src/data/heroes.json', 'r', encoding='utf-8') as f:
    heroes = json.load(f)

builds = {}

# Specific tailored builds for prominent heroes, plus systematic archetype definitions
def determine_hero_build(hero):
    name = hero['hero_name']
    cls = (hero.get('class') or '').lower()
    lanes = [l.lower() for l in hero.get('laning', [])]
    lane_str = ', '.join(lanes)
    spec = [s.lower() for s in hero.get('speciality', [])]
    spec_str = ', '.join(spec)

    is_exp = 'exp' in lane_str or ('fighter' in cls and 'jungle' not in lane_str)
    is_jungle = 'jungle' in lane_str or ('assassin' in cls and 'exp' not in lane_str and 'gold' not in lane_str)
    is_roam = 'roam' in lane_str or 'support' in cls or ('tank' in cls and 'exp' not in lane_str and 'jungle' not in lane_str)
    is_mid = 'mid' in lane_str or ('mage' in cls and not is_jungle)
    is_gold = 'gold' in lane_str or 'marksman' in cls

    # Specific hero overrides
    if name == 'Sora':
        return {
            "hero_name": "Sora",
            "role_lane": "EXP Lane / Jungle",
            "playstyle": "Shifting Skies Duelist (Thunder Burst / Torrent Sustain)",
            "spells": {
                "primary": {"name": "Vengeance", "cd": "75s", "reason": "Sangat kuat saat mode Torrent: menyerap 35% damage saat diving ke kerumunan musuh."},
                "situational": {"name": "Petrify", "cd": "90s", "reason": "Mengunci musuh seketika sebelum melancarkan kombo Heaven's Wrath."}
            },
            "emblem": {
                "base": "Fighter",
                "rationale": "Spell Vamp 10% dan Hybrid Defense memaksimalkan sustain duel saat mengumpulkan stack Cloudstep.",
                "tier1": {"name": "Firmness", "desc": "+6 Physical & Magic Defense"},
                "tier2": {"name": "Festival of Blood", "desc": "Spell Vamp bertambah hingga 10% dari kill/assist"},
                "tier3": {"name": "Brave Smite", "desc": "Skill memulihkan 4% Max HP setiap mengenai hero musuh"}
            },
            "items": {
                "core": [
                    {"name": "Tough Boots", "desc": "Ketahanan crowd control 30% saat duel di lini depan."},
                    {"name": "War Axe", "desc": "Item inti: Memberikan True Damage bertumpuk dan Spell Vamp deras."},
                    {"name": "Hunter Strike", "desc": "Cooldown Reduction, Armor Penetration, dan bonus kecepatan gerak."},
                    {"name": "Brute Force Breastplate", "desc": "Hybrid Defense dan ketahanan CC bertumpuk saat melancarkan kombo."},
                    {"name": "Malefic Roar", "desc": "Armor Buster untuk menembus physical defense tank."},
                    {"name": "Immortality", "desc": "Nyawa kedua untuk membalikkan keadaan di teamfight."}
                ],
                "counter_substitutions": [
                    {"name": "Athena's Shield", "trigger": "magic_burst", "replaces": "Hunter Strike", "reason": "Menangkal burst magic assassin lawan."},
                    {"name": "Sea Halberd", "trigger": "high_regen", "replaces": "Brute Force Breastplate", "reason": "Anti-heal efektif saat melawan sesama hero sustain EXP."},
                    {"name": "Rose Gold Meteor", "trigger": "clutch_shield", "replaces": "Immortality", "reason": "Perisai darurat dan lifesteal saat HP kritis."}
                ]
            },
            "gameplay_tips": [
                "Gunakan Skill 1 untuk mengumpulkan 5 stack Cloudstep sebelum mengaktifkan True Art.",
                "Swipe kiri pada Ultimate untuk masuk mode Thunder (gaya Assassin burst), atau swipe kanan untuk mode Torrent (gaya Tank sustain).",
                "Manfaatkan skill mobilitas untuk melompati rintangan dan mengincar lini belakang lawan."
            ]
        }

    # 1. MARKSMAN BUILDS
    if 'marksman' in cls or is_gold:
        if name in ['Clint', 'Brody', 'Lesley', 'Beatrix', 'Granger', 'Ixia']:
            # Burst MM
            return {
                "hero_name": name,
                "role_lane": "Gold Lane",
                "playstyle": "Burst & Physical Penetration",
                "spells": {
                    "primary": {"name": "Flicker", "cd": "120s", "reason": "Reposisi instan untuk kiting atau melepaskan burst mematikan."},
                    "situational": {"name": "Purify", "cd": "90s", "reason": "Wajib dibawa saat musuh memiliki banyak CC keras (Tigreal, Badang, Chou)."}
                },
                "emblem": {
                    "base": "Assassin",
                    "rationale": "Adaptive Penetration (+14) membuat damage skill dan pasif burst tembus armor di early game.",
                    "tier1": {"name": "Rupture", "desc": "+5 Adaptive Penetration"},
                    "tier2": {"name": "Weapons Master", "desc": "+5% Extra Physical Attack dari equipment"},
                    "tier3": {"name": "Quantum Charge", "desc": "Basic Attack memberi HP heal & +40% Movement Speed untuk kiting"}
                },
                "items": {
                    "core": [
                        {"name": "Swift Boots", "desc": "Attack speed awal laning."},
                        {"name": "Endless Battle" if name == "Clint" else "Blade of the Heptaseas", "desc": "True damage ekstra / burst pembuka dari bush."},
                        {"name": "Hunter Strike", "desc": "Cooldown Reduction, Armor Penetration, dan bonus speed saat memukul."},
                        {"name": "Blade of Despair", "desc": "Physical Attack masif untuk eksekusi musuh sekarat."},
                        {"name": "Malefic Roar", "desc": "Armor Buster mutlak untuk menembus tank tebal."},
                        {"name": "Wind of Nature", "desc": "2 detik kebal damage fisik saat duel atau disergap."}
                    ],
                    "counter_substitutions": [
                        {"name": "Athena's Shield", "trigger": "magic_burst", "replaces": "Hunter Strike", "reason": "Meredam 25% magic burst Aamon/Eudora agar tidak one-shot."},
                        {"name": "Sea Halberd", "trigger": "high_regen", "replaces": "Blade of Despair", "reason": "Memotong 50% regen/lifesteal Cici/Uranus/Estes."},
                        {"name": "Immortality", "trigger": "late_game", "replaces": "Wind of Nature", "reason": "Asuransi nyawa kedua saat teamfight krusial Lord."}
                    ]
                },
                "gameplay_tips": [
                    "Jangan pernah mendekati bush tanpa membuka vision dengan skill terlebih dahulu.",
                    "Fokus amankan minion dan gerobak turret di 5 menit pertama sebelum bergabung teamfight.",
                    "Selalu simpan skill kabur dan spell sampai assassin musuh muncul di map."
                ]
            }
        elif name in ['Claude', 'Karrie', 'Wanwan']:
            # Attack Speed On-hit Trinity
            return {
                "hero_name": name,
                "role_lane": "Gold Lane",
                "playstyle": "Attack Speed & On-Hit Shredder",
                "spells": {
                    "primary": {"name": "Vengeance" if name == "Claude" else "Flicker", "cd": "75s", "reason": "Damage reduction 35% saat ulti atau reposisi cepat."},
                    "situational": {"name": "Purify", "cd": "90s", "reason": "Melepaskan efek stun agar ulti tidak terputus sia-sia."}
                },
                "emblem": {
                    "base": "Basic Common" if name == "Claude" else "Marksman",
                    "rationale": "Hybrid Regen menghemat mana atau Attack Speed + Lifesteal untuk sustain laning.",
                    "tier1": {"name": "Swift", "desc": "+10% Attack Speed"},
                    "tier2": {"name": "Bargain Hunter", "desc": "Diskon harga equipment 5% agar item core jadi lebih cepat"},
                    "tier3": {"name": "Quantum Charge", "desc": "Bonus speed & heal darah konstan saat menyerang"}
                },
                "items": {
                    "core": [
                        {"name": "Tough Boots", "desc": "Mengurangi durasi CC 30% saat masuk ke kerumunan."},
                        {"name": "Demon Hunter Sword", "desc": "Damage berbasis persentase Max HP musuh (shredder tank)."},
                        {"name": "Golden Staff", "desc": "Menggandakan efek pasif on-hit item menjadi beruntun."},
                        {"name": "Corrosion Scythe", "desc": "Attack speed bertumpuk dan efek slow ke target."},
                        {"name": "Wind of Nature", "desc": "Kebal 2 detik damage fisik saat diserang musuh."},
                        {"name": "Brute Force Breastplate", "desc": "Hybrid Defense dan ketahanan CC ekstra."}
                    ],
                    "counter_substitutions": [
                        {"name": "Athena's Shield", "trigger": "magic_burst", "replaces": "Brute Force Breastplate", "reason": "Mencegah mati instan dari burst magic assassin."},
                        {"name": "Sea Halberd", "trigger": "high_regen", "replaces": "Corrosion Scythe", "reason": "Anti-heal efektif melawan hero bertubuh tebal."}
                    ]
                },
                "gameplay_tips": [
                    "Kumpulkan stack sebelum melompat ke dalam pertempuran besar.",
                    "Gunakan Wind of Nature tepat saat MM atau Fighter musuh mengunci serangan ke kamu.",
                    "Jangan terburu-buru war jika item Demon Hunter Sword belum selesai."
                ]
            }
        else:
            # Critical / Standard Marksman (Miya, Moskov, Layla, Bruno, Irithel, Hanabi, Popol)
            return {
                "hero_name": name,
                "role_lane": "Gold Lane",
                "playstyle": "Critical Strike & Sustained DPS",
                "spells": {
                    "primary": {"name": "Inspire" if name in ['Miya', 'Moskov'] else "Flicker", "cd": "60s", "reason": "Lonjakan Attack Speed gila-gilaan & pemulihan HP saat duel."},
                    "situational": {"name": "Purify", "cd": "90s", "reason": "Penyelamat mutlak jika musuh memiliki banyak disable/stun."}
                },
                "emblem": {
                    "base": "Marksman",
                    "rationale": "Kombinasi Critical Chance dan Attack Speed tertinggi di late game.",
                    "tier1": {"name": "Fatal", "desc": "+5% Critical Chance & +10% Critical Damage"},
                    "tier2": {"name": "Weapons Master", "desc": "+5% Extra Physical Attack dari total item"},
                    "tier3": {"name": "Quantum Charge", "desc": "Kecepatan gerak dan lifesteal gratis saat basic attack"}
                },
                "items": {
                    "core": [
                        {"name": "Swift Boots", "desc": "Attack Speed awal game."},
                        {"name": "Haas' Claws", "desc": "Lifesteal deras dan Critical Chance."},
                        {"name": "Berserker's Fury", "desc": "Ledakan damage kritikal tertinggi."},
                        {"name": "Great Dragon Spear", "desc": "Cooldown Reduction, Crit Chance, dan lari kencang saat Ultimate."},
                        {"name": "Malefic Roar", "desc": "Penembus physical defense tank dan turret."},
                        {"name": "Wind of Nature", "desc": "2 detik kebal damage fisik saat diserang assassin."}
                    ],
                    "counter_substitutions": [
                        {"name": "Athena's Shield", "trigger": "magic_burst", "replaces": "Great Dragon Spear", "reason": "Perisai magic vs burst Aamon/Eudora."},
                        {"name": "Sea Halberd", "trigger": "high_regen", "replaces": "Great Dragon Spear", "reason": "Anti-heal memotong lifesteal musuh."}
                    ]
                },
                "gameplay_tips": [
                    "Bermain sabar di belakang garis tank, hit musuh terdekat (front-to-back).",
                    "Perhatikan mini map setiap 3 detik; jika mid/jungler musuh hilang, segera mundur ke bawah turret.",
                    "Manfaatkan pasif lifesteal untuk farming hutan dan minion tanpa perlu bolak-balik recall."
                ]
            }

    # 2. MAGE / MID LANE BUILDS
    elif 'mage' in cls or is_mid:
        if name in ['Valir', "Chang'e", 'Yve', 'Gord', 'Zhask', 'Cyclops', 'Lylia', 'Kimmy']:
            # Poke / Continuous DPS Mage
            return {
                "hero_name": name,
                "role_lane": "Mid Lane",
                "playstyle": "Continuous Magic Poke & Zoning",
                "spells": {
                    "primary": {"name": "Sprint" if name in ['Valir', "Chang'e"] else "Flameshot", "cd": "100s", "reason": "Kebal efek slow dan lari cepat untuk kiting konstan."},
                    "situational": {"name": "Purify", "cd": "90s", "reason": "Lepaskan stun saat disergap inisiator lawan."}
                },
                "emblem": {
                    "base": "Mage",
                    "rationale": "Magic Penetration dan Cooldown Reduction untuk spam skill tiada henti.",
                    "tier1": {"name": "Inspire", "desc": "+5% Cooldown Reduction"},
                    "tier2": {"name": "Bargain Hunter", "desc": "Diskon harga equipment 5%"},
                    "tier3": {"name": "Impure Rage", "desc": "Memberi ekstra magic damage & memulihkan Mana"}
                },
                "items": {
                    "core": [
                        {"name": "Arcane Boots", "desc": "Penetrasi magic untuk tembus pertahanan awal."},
                        {"name": "Glowing Wand", "desc": "Bakar persentase HP lawan + efek Anti-Heal 50%."},
                        {"name": "Ice Queen Wand", "desc": "Efek slow bertumpuk membuat musuh sulit bergerak."},
                        {"name": "Wishing Lantern", "desc": "Setiap 800 magic damage menembakkan 10% Max HP lawan."},
                        {"name": "Holy Crystal", "desc": "Lonjakan Magic Power besar-besaran."},
                        {"name": "Winter Crown", "desc": "Membeku 2 detik untuk menghindari kombo maut musuh."}
                    ],
                    "counter_substitutions": [
                        {"name": "Divine Glaive", "trigger": "high_magic_def", "replaces": "Wishing Lantern", "reason": "Tembus Radiant Armor musuh."},
                        {"name": "Athena's Shield", "trigger": "magic_burst", "replaces": "Holy Crystal", "reason": "Pertahanan darurat jika musuh punya assassin penculik."}
                    ]
                },
                "gameplay_tips": [
                    "Jaga jarak maksimal di belakang tank, gunakan skill untuk menghalau laju musuh (zoning).",
                    "Selalu cicil Lord atau Turtle dari jarak aman.",
                    "Rotasi ke Gold Lane setelah membersihkan gelombang minion di Mid."
                ]
            }
        else:
            # Burst Mage (Eudora, Aurora, Kadita, Kagura, Xavier, Pharsa, Cecilion, Nana, Vale, Vexana, Lunox, Valentina, Novaria, Zhuxin)
            return {
                "hero_name": name,
                "role_lane": "Mid Lane",
                "playstyle": "Burst Execution & AoE Lockdown",
                "spells": {
                    "primary": {"name": "Flameshot", "cd": "50s", "reason": "Sniping jarak jauh dan knockback saat disergap assassin."},
                    "situational": {"name": "Flicker", "cd": "120s", "reason": "Kombo surprise ulti atau kabur melompati dinding."}
                },
                "emblem": {
                    "base": "Mage",
                    "rationale": "Magic Penetration (+8) dan Magic Power (+30) untuk satu kali kombo maut.",
                    "tier1": {"name": "Inspire", "desc": "+5% Cooldown Reduction"},
                    "tier2": {"name": "Bargain Hunter", "desc": "Diskon equipment agar Clock/Truncheon cepat jadi"},
                    "tier3": {"name": "Lethal Ignition", "desc": "Bonus ledakan terbakar setelah melancarkan kombo 3 hit"}
                },
                "items": {
                    "core": [
                        {"name": "Arcane Boots", "desc": "Magic Penetration awal."},
                        {"name": "Clock of Destiny", "desc": "Menambah Max Mana dan HP tebal bertahap."},
                        {"name": "Lightning Truncheon", "desc": "Ledakan damage memantul berbasis Max Mana."},
                        {"name": "Holy Crystal", "desc": "Peningkatan Magic Power hingga 35%."},
                        {"name": "Divine Glaive", "desc": "Penembus magic defense hingga 40%."},
                        {"name": "Winter Crown", "desc": "Membeku 2 detik saat ulti musuh mengarah ke kamu."}
                    ],
                    "counter_substitutions": [
                        {"name": "Glowing Wand", "trigger": "high_regen", "replaces": "Clock of Destiny", "reason": "Anti-heal wajib vs healer lawan."},
                        {"name": "Blood Wings", "trigger": "late_game", "replaces": "Winter Crown", "reason": "Perisai magic tebal dan pergerakan lincah."}
                    ]
                },
                "gameplay_tips": [
                    "Tunggu di bush yang sering dilewati musuh (ambush), jangan pernah buka posisi sebelum target empuk muncul.",
                    "Kunci MM atau Mage musuh, jangan buang kombo ke arah tank lini depan.",
                    "Manfaatkan Flameshot untuk menyelesaikan target berdarah sekarat yang kabur."
                ]
            }

    # 3. TANK & ROAMER BUILDS
    elif 'tank' in cls or 'support' in cls or is_roam:
        if name in ['Angela', 'Estes', 'Floryn', 'Rafaela', 'Mathilda', 'Diggie', 'Faramis']:
            # Healer & Enchanter Support
            return {
                "hero_name": name,
                "role_lane": "Roam",
                "playstyle": "Healer & Utility Buffs",
                "spells": {
                    "primary": {"name": "Revitalize" if name == "Estes" else "Flicker", "cd": "100s", "reason": "Regen area masif untuk tim atau reposisi aman."},
                    "situational": {"name": "Purify", "cd": "90s", "reason": "Bebas dari CC agar bisa mengeluarkan skill heal/buff."}
                },
                "emblem": {
                    "base": "Support",
                    "rationale": "Healing Effect (+12%), Cooldown Reduction (+10%), dan Movement Speed (+6%).",
                    "tier1": {"name": "Agility", "desc": "+4% Movement Speed untuk rotasi kilat"},
                    "tier2": {"name": "Pull Yourself Together", "desc": "Cooldown Battle Spell & Aktif Item berkurang 15%"},
                    "tier3": {"name": "Focusing Mark", "desc": "Menambah damage teman ke target sebesar 6%"}
                },
                "items": {
                    "core": [
                        {"name": "Tough Boots", "desc": "Roam Favor/Encourage untuk tambahan heal & perlindungan."},
                        {"name": "Flask of the Oasis", "desc": "Item wajib healer: Perisai darurat bagi teman sekarat."},
                        {"name": "Fleeting Time", "desc": "Reset cooldown Ultimate 30% setelah mendapatkan kill/assist."},
                        {"name": "Dominance Ice", "desc": "Anti-heal dan aura pemotong attack speed lawan."},
                        {"name": "Oracle", "desc": "Meningkatkan efek heal dan shield yang diterima sebesar 30%."},
                        {"name": "Immortality", "desc": "Bangkit kembali untuk terus menyuplai heal ke tim."}
                    ],
                    "counter_substitutions": [
                        {"name": "Athena's Shield", "trigger": "magic_burst", "replaces": "Oracle", "reason": "Menahan tusukan burst magic lawan."},
                        {"name": "Antique Cuirass", "trigger": "physical_burst", "replaces": "Oracle", "reason": "Mengurangi damage skill assassin fisik."}
                    ]
                },
                "gameplay_tips": [
                    "Jangan pernah berjalan sendirian; selalu tempel Jungler atau Gold Lane di momen krusial.",
                    "Simpan ultimate untuk momen inisiasi besar atau ketika teman satu tim sekarat di-burst.",
                    "Beli Flask of the Oasis sebagai item pertama setelah sepatu."
                ]
            }
        else:
            # Frontline Tank & Initiator (Tigreal, Atlas, Khufra, Minotaur, Akai, Grock, Baxia, Hylos, Belerick, Gatotkaca, Fredrinn, Barats, Edith)
            return {
                "hero_name": name,
                "role_lane": "Roam / Jungle" if is_jungle else "Roam",
                "playstyle": "Crowd Control & Frontline Meatshield",
                "spells": {
                    "primary": {"name": "Flicker" if not is_jungle else "Retribution", "cd": "120s", "reason": "Flicker-Ultimate surprise initiation atau Retribution Jungler."},
                    "situational": {"name": "Vengeance", "cd": "75s", "reason": "Menyerap 35% damage dan memantulkannya ke penyerang."}
                },
                "emblem": {
                    "base": "Tank",
                    "rationale": "Max HP (+500) dan Hybrid Defense (+10) untuk menahan gempuran awal.",
                    "tier1": {"name": "Vitality", "desc": "+225 Max HP"},
                    "tier2": {"name": "Tenacity", "desc": "Mendapat +15 Hybrid Defense saat HP di bawah 50%"},
                    "tier3": {"name": "Concussive Blast", "desc": "Ledakan magic area berbasis Max HP setiap beberapa detik"}
                },
                "items": {
                    "core": [
                        {"name": "Tough Boots", "desc": "Roam Conceal untuk kamuflase inisiasi tim mendadak."},
                        {"name": "Dominance Ice", "desc": "Wajib: Anti-heal 50% dan potong 70% base attack speed musuh."},
                        {"name": "Athena's Shield", "desc": "Perisai peredam 25% magic burst selama 3 detik."},
                        {"name": "Antique Cuirass", "desc": "Mengurangi Physical Attack lawan hingga 24% saat terkena skill."},
                        {"name": "Blade Armor", "desc": "Memantulkan 30% basic attack & meredam 20% critical damage lawan."},
                        {"name": "Immortality", "desc": "Nyawa kedua untuk memancing seluruh skill musuh terbuang."}
                    ],
                    "counter_substitutions": [
                        {"name": "Radiant Armor", "trigger": "continuous_magic", "replaces": "Athena's Shield", "reason": "Menumpuk magic damage reduction vs Chang'e/Valir."},
                        {"name": "Guardian Helmet", "trigger": "sustain", "replaces": "Blade Armor", "reason": "Regen darah sangat cepat di luar combat tanpa perlu recall."}
                    ]
                },
                "gameplay_tips": [
                    "Buka semak (check bush) sebelum teman tim masuk ke area sungai atau Lord.",
                    "Jangan gunakan skill inisiasi jika teman tim masih berada di jarak yang terlalu jauh.",
                    "Gunakan Conceal saat tim siap melakukan ganking mendadak."
                ]
            }

    # 4. ASSASSIN / PHYSICAL JUNGLER BUILDS
    elif 'assassin' in cls or (is_jungle and 'mage' not in cls):
        return {
            "hero_name": name,
            "role_lane": "Jungle",
            "playstyle": "High Mobility & Pick-off Execution",
            "spells": {
                "primary": {"name": "Retribution", "cd": "35s", "reason": "Wajib Jungler untuk mengamankan monster buff, Turtle, dan Lord."},
                "situational": {"name": "Petrify" if not is_jungle else "Retribution", "cd": "90s", "reason": "Stun mendadak saat kombo jika dimainkan di lane."}
            },
            "emblem": {
                "base": "Assassin",
                "rationale": "Adaptive Penetration (+14) dan Movement Speed (+3%) untuk tempo farming & ganking tinggi.",
                "tier1": {"name": "Rupture", "desc": "+5 Adaptive Penetration"},
                "tier2": {"name": "Seasoned Hunter" if is_jungle else "Master Assassin", "desc": "Damage ekstra ke Lord/Turtle atau bonus damage duel 1v1"},
                "tier3": {"name": "Killing Spree", "desc": "Memulihkan 8% HP & memberi +20% Movement Speed setelah eliminasi"}
            },
            "items": {
                "core": [
                    {"name": "Tough Boots", "desc": "Ice Retribution untuk mencuri Movement Speed lawan."},
                    {"name": "Blade of the Heptaseas", "desc": "Tusukan burst damage pertama saat keluar dari bush."},
                    {"name": "Hunter Strike", "desc": "Penetrasi armor dan bonus lari kencang saat memukul skill berturut."},
                    {"name": "Sky Piercer", "desc": "Eksekusi instan musuh sekarat di bawah 4% - 12% Max HP."},
                    {"name": "Malefic Roar", "desc": "Tembus armor tank dan turret."},
                    {"name": "Blade of Despair", "desc": "Damage pamungkas untuk memastikan target mati sekali kombo."}
                ],
                "counter_substitutions": [
                    {"name": "Rose Gold Meteor", "trigger": "magic_burst", "replaces": "Sky Piercer", "reason": "Perisai darurat agar tidak mati counter-burst."},
                    {"name": "Sea Halberd", "trigger": "high_regen", "replaces": "Blade of Despair", "reason": "Anti-heal dan damage ekstra vs hero tebal."},
                    {"name": "Immortality", "trigger": "late_game", "replaces": "Blade of the Heptaseas", "reason": "Nyawa cadangan saat diving ke lini belakang musuh."}
                ]
            },
            "gameplay_tips": [
                "Prioritaskan objektif Turtle di menit 2, 4, dan 6 untuk keunggulan gold seluruh tim.",
                "Incar target yang paling rapuh terlebih dahulu (Mage atau Marksman musuh).",
                "Jangan pernah menginisiasi perang jika skill escape kamu masih dalam masa cooldown."
            ]
        }

    # 5. EXP FIGHTER / BRUISER BUILDS
    else:
        # Default EXP Bruiser / Fighter (Cici, Yu Zhong, Ruby, Terizla, Alpha, Martis, Paquito, Dyrroth, Thamuz, Khaleed, Lapu, Arlott, Sora, Lukas, etc.)
        return {
            "hero_name": name,
            "role_lane": "EXP Lane",
            "playstyle": "Sustain Bruiser & Flank Disrupter",
            "spells": {
                "primary": {"name": "Vengeance", "cd": "75s", "reason": "Menyerap 35% damage dan memantulkannya ke penyerang saat adu pukul."},
                "situational": {"name": "Petrify" if name in ['Yu Zhong', 'Benedetta'] else "Flicker", "cd": "90s", "reason": "Kunci stun kombo mendadak atau reposisi melompati rintangan."}
            },
            "emblem": {
                "base": "Fighter",
                "rationale": "Spell Vamp (+10%), Adaptive Attack (+22), dan Hybrid Defense (+6) untuk laning sustain.",
                "tier1": {"name": "Firmness", "desc": "+6 Physical & Magic Defense"},
                "tier2": {"name": "Festival of Blood", "desc": "Spell Vamp bertambah hingga 10% setiap mengumpulkan kill/assist"},
                "tier3": {"name": "Brave Smite", "desc": "Skill memulihkan 4% Max HP setiap mengenai hero musuh"}
            },
            "items": {
                "core": [
                    {"name": "Warrior Boots" if 'physical' in spec_str else "Tough Boots", "desc": "Pertahanan dasar dan pengurangan durasi crowd control."},
                    {"name": "War Axe", "desc": "True damage bertumpuk dan Spell Vamp berkelanjutan."},
                    {"name": "Brute Force Breastplate", "desc": "Hybrid Defense dan pengurangan durasi CC bertumpuk."},
                    {"name": "Dominance Ice", "desc": "Wajib EXP: Potong 50% heal musuh dan kurangi kecepatan serangnya."},
                    {"name": "Athena's Shield", "desc": "Perisai penangkal magic burst dari Mage lawan."},
                    {"name": "Immortality", "desc": "Bangkit kembali untuk mengacaukan formasi musuh di garis belakang."}
                ],
                "counter_substitutions": [
                    {"name": "Sea Halberd", "trigger": "high_regen_offense", "replaces": "Brute Force Breastplate", "reason": "Versi agresif anti-heal untuk menghabisi hero sustain lawan."},
                    {"name": "Radiant Armor", "trigger": "continuous_magic", "replaces": "Athena's Shield", "reason": "Meredam magic berkelanjutan seperti Valir/Chang'e."},
                    {"name": "Queen's Wings", "trigger": "low_hp_clutch", "replaces": "Immortality", "reason": "Pengurangan damage masif dan lonjakan lifesteal saat sekarat."}
                ]
            },
            "gameplay_tips": [
                "Menangkan laning phase di menit awal, lalu potong wave minion (cut lane) untuk membantu kontes Turtle.",
                "Saat teamfight, jangan serang tank musuh; cari jalan memutar (flank) langsung ke arah Mage atau Marksman lawan.",
                "Manfaatkan pasif War Axe dan Spell Vamp untuk membalikkan keadaan saat duel darah sekarat."
            ]
        }

for h in heroes:
    b = determine_hero_build(h)
    builds[h['hero_name'].lower()] = b

print(f"Generated tailored builds for {len(builds)} heroes!")

with open('src/data/heroBuilds.json', 'w', encoding='utf-8') as f:
    json.dump(builds, f, ensure_ascii=False, indent=2)

print("Saved src/data/heroBuilds.json successfully!")
