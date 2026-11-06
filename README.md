# ⚔️ MLBB Draft & Counter Assistant (2026)

Aplikasi web modern berbasis **Svelte 5** dan **Vite** untuk menganalisis *draft pick* Mobile Legends: Bang Bang (MLBB), menentukan **hero counter** terbaik secara instan, mendeteksi ancaman komposisi musuh, serta merekomendasikan **Battle Spell**, susunan **Emblem & Talent**, dan **Build 6 Item Adaptif** yang efektif melawan musuh.

---

## 🚀 Fitur Utama

- **🎮 Draft Board 5 vs 5 Interaktif**:
  - Tim Kamu (*Ally*): 5 slot terstruktur (*Gold Lane, EXP Lane, Mid Lane, Roam, Jungle*).
  - Tim Musuh (*Enemy*): 5 slot bebas untuk memasukkan hero lawan.
  - Tombol **Preset Cepat**: Muat kasus musuh instan (*Tigreal, Aamon, Cici, Badang*).
  - Modal pemilihan hero cepat dengan pencarian nama, role, dan lane.
- **⚡ Deteksi Ancaman Komposisi Musuh (*Threat Engine*)**:
  - Mendeteksi bahaya seperti *Heavy CC*, *Magic Burst (One-Shot)*, *High Regen / Lifesteal*, *Physical Burst*, *High Attack Speed*, dan *High Mobility*.
  - Memberikan saran taktis instan (misal: kapan harus membawa *Purify*, membeli *Athena's Shield*, atau *Sea Halberd*).
- **🎯 Rekomendasi Hero Counter Otomatis**:
  - Dihitung menggunakan relasi database resmi (*strong_against*, *weak_against*, *counters*, *synergies*) serta arketipe mekanik hero.
  - Filter per lane: **Semua Lane | Gold Lane | EXP Lane | Mid Lane | Roam | Jungle**.
  - Dilengkapi skor counter dan penjelasan detail mengapa hero tersebut unggul.
  - Tombol 1-klik untuk memasukkan hero rekomendasi langsung ke slot tim.
- **🛡️ Panduan Adaptif Hero Terpilih**:
  - **Battle Spell Wajib**: Disertai alasan pemilihan vs musuh saat ini.
  - **Setup Emblem & Talent 3 Tier**: Rekomendasi base emblem dan talent Tier 1, Tier 2, Tier 3.
  - **Build 6 Item Adaptif**: Item counter musuh ditandai dengan **bingkai emas** dan penjelasan fungsinya.
  - **Peringatan Bahaya & In-Game Tips**: Catatan krusial (misal: waspada ulti Aamon saat HP < 50%, hindari bertarung dekat dinding vs Badang, dll.).
- **⚡ Offline-First & Sangat Cepat**:
  - Menggunakan database metadata 133 hero resmi MLBB, 89 item, 7 emblem, dan 26 talent tanpa latensi API eksternal.

---

## 🛠️ Prasyarat & Instalasi

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) (versi 18 ke atas).

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/silumansupra/mlbb26.git
   cd mlbb26
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan local development server**:
   ```bash
   npm run dev
   ```
   Buka browser di alamat: `http://localhost:5173/`

4. **Build untuk production**:
   ```bash
   npm run build
   ```
   Hasil build siap deploy berada di folder `dist/`.

---

## 📁 Struktur Direktori

```text
├── src/
│   ├── data/
│   │   ├── heroes.json       # Metadata 133 hero resmi MLBB
│   │   ├── items.json        # 89 item dan atribut stat
│   │   ├── emblems.json      # 7 emblem dasar
│   │   ├── talents.json      # 26 talent (Tier 1, 2, 3)
│   │   └── spells.json       # 12 battle spell
│   ├── lib/
│   │   ├── counterEngine.js          # Logika kalkulasi counter & ancaman
│   │   ├── DraftBoard.svelte         # Komponen board draft 5v5
│   │   ├── ThreatBanner.svelte       # Banner analisis ancaman musuh
│   │   ├── CounterRecommendations.svelte # Daftar hero counter per lane
│   │   ├── HeroDetailPanel.svelte    # Panel item, spell & emblem adaptif
│   │   └── HeroPickerModal.svelte    # Modal pencarian & pemilihan hero
│   ├── App.svelte            # Komponen utama
│   ├── app.css               # Tema desain cyber-esports
│   └── main.js               # Entry point Svelte 5
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛡️ Keamanan & Privasi

- Repositori ini tidak memuat kredensial, API key rahasia, maupun token akses privat.
- Semua data yang dimuat bersumber dari dataset metadata publik MLBB.

---

## 🙏 Kredit & Atribusi (Credits)

Aplikasi ini menggunakan dataset metadata MLBB yang luar biasa dan dikurasi oleh:
- **[p3hndrx/MLBB-API](https://github.com/p3hndrx/MLBB-API)** oleh [@p3hndrx](https://github.com/p3hndrx) — Basis data utama untuk metadata hero, atribut skill, relasi counter/sinergi resmi, spesifikasi emblem & talent, serta item game.
- Seluruh aset gambar portrait hero, icon skill, dan intellectual property terkait Mobile Legends: Bang Bang merupakan hak cipta milik **Moonton / Shanghai Moonton Technology Co., Ltd.**

---

## 📜 Lisensi

Proyek ini dirilis di bawah lisensi [MIT](LICENSE).
