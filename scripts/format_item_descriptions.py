import json
import re

def clean_and_format_description(text):
    if not text or text == "null":
        return text

    t = text.strip()

    # Special dedicated formatting for Lifeline (Magic Blade & Rose Gold Meteor)
    if "reduces HP below 30%" in t and "shield" in t:
        shield_match = re.search(r'gains a \(([^)]+)\) shield \(increases with level\)', t)
        shield_val = shield_match.group(1) if shield_match else "+60*Hero Level"
        return (
            "Saat menerima damage yang mengurangi HP di bawah 30%:\n"
            f"• Memperoleh ({shield_val}) Shield (berskala dengan level)\n"
            "• Memperoleh 50% Movement Speed yang berkurang cepat dalam 3 detik\n"
            "⏱️ Cooldown: 60 detik"
        )

    # Queen's Wings
    if "When HP drops below 40%" in t:
        return (
            "Saat HP turun di bawah 40%:\n"
            "• Memperoleh 30% Damage Reduction selama 3 detik\n"
            "• Mengurangi cooldown skill sebesar 2 detik\n"
            "⏱️ Cooldown: 60 detik"
        )

    # Athena's Shield
    if "Upon taking Magic Damage" in t:
        return (
            "Saat menerima Magic Damage dari skill atau Basic Attack musuh:\n"
            "• Mengurangi Magic Damage yang diterima sebesar 25% selama 3 detik\n"
            "• Efek aktif kembali 5 detik setelah keluar dari pertarungan"
        )

    # Immortality
    if "Resurrect 2.5 seconds upon death" in t:
        return (
            "Bangkit kembali 2.5 detik setelah tereliminasi:\n"
            "• Mendapatkan 16% Max HP\n"
            "• Mendapatkan Shield 150 (+70*Hero Level) selama 3 detik\n"
            "⏱️ Cooldown: 210 detik"
        )

    # Wind of Nature
    if "Become immune to all Physical Damage" in t:
        return (
            "Aktif - Wind Chant:\n"
            "• Kebal terhadap seluruh Physical Damage selama 2 detik\n"
            "• Durasi berkurang menjadi 1 detik untuk hero non-Marksman\n"
            "⏱️ Cooldown: 90 detik"
        )

    # Winter Crown
    if "Becomes frozen" in t:
        return (
            "Aktif - Frozen:\n"
            "• Menjadi beku, untargetable, dan kebal dari segala jenis damage selama 2 detik\n"
            "• Tidak dapat bergerak/mengecor skill, namun skill yang sedang berjalan tidak terhenti\n"
            "⏱️ Cooldown: 100 detik"
        )

    # Generic intelligent formatter for other items:
    # 1. Break sentences into lines
    # 2. Extract cooldowns to their own line
    cd_match = re.search(r'(?:This effect has an?\s+([0-9\.]+)\s*seconds?\s+cooldown|\(([0-9\.]+)\s*seconds?\s+cooldown\)|Cooldown:\s*([0-9\.]+)\s*seconds?)', t, re.IGNORECASE)
    cd_line = ""
    if cd_match:
        sec = cd_match.group(1) or cd_match.group(2) or cd_match.group(3)
        cd_line = f"⏱️ Cooldown: {sec}s"
        t = t[:cd_match.start()] + t[cd_match.end():]
        t = t.strip().rstrip(".").rstrip(",")

    lines = []
    # Split by periods followed by space and Capital
    sentences = re.split(r'\.\s+(?=[A-Z])', t)
    for s in sentences:
        s = s.strip()
        if s:
            if not s.endswith("."):
                s += "."
            lines.append(s)

    if cd_line:
        lines.append(cd_line)

    return "\n".join(lines)

items_path = "src/data/items.json"
with open(items_path, "r", encoding="utf-8") as f:
    items = json.load(f)

for it in items:
    data0 = it.get("data", [{}])[0]
    for p in data0.get("unique_passive", []):
        if p.get("description") and p["description"] != "null":
            p["description"] = clean_and_format_description(p["description"])
    for a in data0.get("active", []):
        if a.get("description") and a["description"] != "null":
            a["description"] = clean_and_format_description(a["description"])

with open(items_path, "w", encoding="utf-8") as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

print("Successfully formatted all item descriptions in items.json!")
