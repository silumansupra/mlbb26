/**
 * High-Resolution Tournament Draft Card Exporter (Canvas-based PNG Generator)
 */

export async function exportDraftCard({
  myTeam = [],
  enemyTeam = [],
  winrateMeta = null,
  allyComp = null,
  enemyComp = null
}) {
  const width = 1200;
  const height = 675;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Helper to load image as Promise
  const loadImage = (src) => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  // 1. BACKGROUND
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#040711');
  bgGrad.addColorStop(0.5, '#080d1a');
  bgGrad.addColorStop(1, '#05070e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient glow
  const blueGlow = ctx.createRadialGradient(250, 330, 10, 250, 330, 400);
  blueGlow.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
  blueGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = blueGlow;
  ctx.fillRect(0, 0, 600, height);

  const redGlow = ctx.createRadialGradient(950, 330, 10, 950, 330, 400);
  redGlow.addColorStop(0, 'rgba(244, 63, 94, 0.12)');
  redGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = redGlow;
  ctx.fillRect(600, 0, 600, height);

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // 2. HEADER
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('MLBB TACTICAL INTELLIGENCE // BROADCAST DOSSIER', 36, 46);

  ctx.font = '900 24px "Orbitron", "Montserrat", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('TOURNAMENT DRAFT ANALYSIS', 36, 76);

  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  const lastSync = winrateMeta?.last_updated ? `DATA MOONTON RANK: ${winrateMeta.last_updated}` : 'MOONTON RANK VERIFIED';
  ctx.fillText(lastSync, 36, 96);

  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'right';
  ctx.fillText('mlbb.silumansuprais.my.id', width - 36, 52);

  // 3. TEAM BANNERS
  ctx.textAlign = 'left';
  // Blue Side Header
  ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
  ctx.fillRect(36, 115, 520, 34);
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 115, 520, 34);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px "Orbitron", sans-serif';
  ctx.fillText('BLUE SIDE // ALLY ROSTER', 50, 137);

  if (allyComp?.damageSplit) {
    ctx.textAlign = 'right';
    ctx.font = '600 11px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`DMG: ${allyComp.damageSplit.physical}% FISIK / ${allyComp.damageSplit.magic}% MAGIC`, 542, 137);
    ctx.textAlign = 'left';
  }

  // Red Side Header
  ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
  ctx.fillRect(644, 115, 520, 34);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(644, 115, 520, 34);

  ctx.fillStyle = '#fb7185';
  ctx.font = 'bold 13px "Orbitron", sans-serif';
  ctx.fillText('RED SIDE // OPPONENT SQUAD', 658, 137);

  if (enemyComp?.damageSplit) {
    ctx.textAlign = 'right';
    ctx.font = '600 11px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`DMG: ${enemyComp.damageSplit.physical}% FISIK / ${enemyComp.damageSplit.magic}% MAGIC`, 1150, 137);
    ctx.textAlign = 'left';
  }

  // 4. DRAW 5 HERO CARDS EACH SIDE
  const lanes = ['GOLD LANE', 'EXP LANE', 'MID LANE', 'ROAM', 'JUNGLE'];
  const cardWidth = 98;
  const cardHeight = 380;
  const cardGap = 8;

  // Pre-load images
  const myImages = await Promise.all(myTeam.map(h => h ? loadImage(h.portrait) : null));
  const enemyImages = await Promise.all(enemyTeam.map(h => h ? loadImage(h.portrait) : null));

  const drawHeroCard = (hero, img, x, y, isEnemy, laneIdx) => {
    // Card background
    ctx.fillStyle = isEnemy ? 'rgba(30, 10, 15, 0.7)' : 'rgba(10, 20, 35, 0.7)';
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeStyle = isEnemy ? 'rgba(244, 63, 94, 0.3)' : 'rgba(14, 165, 233, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    // Lane header strip
    ctx.fillStyle = isEnemy ? 'rgba(244, 63, 94, 0.25)' : 'rgba(14, 165, 233, 0.25)';
    ctx.fillRect(x, y, cardWidth, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lanes[laneIdx], x + cardWidth / 2, y + 16);

    if (hero) {
      // Draw Portrait
      const imgY = y + 26;
      const imgHeight = 240;
      if (img) {
        ctx.drawImage(img, x + 2, imgY, cardWidth - 4, imgHeight);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 2, imgY, cardWidth - 4, imgHeight);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(hero.hero_name[0], x + cardWidth / 2, imgY + imgHeight / 2);
      }

      // Hero Name & Class
      const textY = imgY + imgHeight + 18;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.fillText(hero.hero_name.toUpperCase(), x + cardWidth / 2, textY, cardWidth - 8);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '600 10px monospace';
      ctx.fillText(hero.class, x + cardWidth / 2, textY + 16);

      // Footer Tier/Winrate tag
      const botY = y + cardHeight - 16;
      ctx.fillStyle = isEnemy ? '#f43f5e' : '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`SLOT 0${laneIdx + 1}`, x + cardWidth / 2, botY);
    } else {
      // Empty slot placeholder
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '28px sans-serif';
      ctx.fillText('+', x + cardWidth / 2, y + cardHeight / 2 - 10);
      ctx.font = 'bold 10px monospace';
      ctx.fillText('EMPTY', x + cardWidth / 2, y + cardHeight / 2 + 15);
    }
  };

  // Draw Ally Cards
  for (let i = 0; i < 5; i++) {
    const x = 36 + i * (cardWidth + cardGap);
    drawHeroCard(myTeam[i], myImages[i], x, 160, false, i);
  }

  // 5. CENTER VERSUS HEXAGON
  const cx = width / 2;
  const cy = 350;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = '900 20px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', cx, cy + 7);

  // Draw Enemy Cards
  for (let i = 0; i < 5; i++) {
    const x = 644 + i * (cardWidth + cardGap);
    drawHeroCard(enemyTeam[i], enemyImages[i], x, 160, true, i);
  }

  // 6. FOOTER
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '500 11px monospace';
  ctx.fillText('TACTICAL DRAFT INTELLIGENCE © 2026 // OPEN SOURCE MLBB TOOL // mlbb.silumansuprais.my.id', width / 2, height - 30);

  // 7. DOWNLOAD AS PNG
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve(false);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `MLBB_Draft_Card_${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve(true);
    }, 'image/png');
  });
}
