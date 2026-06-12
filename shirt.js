(() => {
  const CANVAS_W   = 500;
  const CANVAS_H   = 570;
  const FONT_SIZE  = 32;
  const FONT       = `${FONT_SIZE}px 'Graduate', sans-serif`;
  const BASELINE_Y = 192;   // flush with bottom of armholes
  const ARCH_RATIO = 0.10;  // end chars drop this fraction of total text width

  const COLORS = Object.freeze({
    shirt:      '#0053a0',
    background: '#dde3ea',
    text:       '#f58426',
    textStroke: '#c44a00',
  });

  const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('c'));
  const ctx    = canvas.getContext('2d');
  const input  = /** @type {HTMLInputElement} */ (document.getElementById('txt'));

  // ── shirt silhouette ────────────────────────────────────────────────────────

  function buildShirtPath() {
    ctx.beginPath();
    ctx.moveTo(190, 42);
    // left shoulder → sleeve
    ctx.lineTo(106, 42);
    ctx.lineTo(16,  58);
    ctx.lineTo(16,  166);
    ctx.bezierCurveTo(16, 200, 54, 204, 106, 192);  // left armhole
    // body
    ctx.lineTo(106, 526);
    ctx.quadraticCurveTo(250, 544, 394, 526);        // hem
    ctx.lineTo(394, 192);
    // right armhole → sleeve
    ctx.bezierCurveTo(446, 204, 484, 200, 484, 166);
    ctx.lineTo(484, 58);
    ctx.lineTo(394, 42);
    ctx.lineTo(310, 42);
    // collar
    ctx.quadraticCurveTo(250, 90, 190, 42);
    ctx.closePath();
  }

  // ── arched text ─────────────────────────────────────────────────────────────
  //
  // Renders the full string onto a temporary canvas (preserving font kerning),
  // then warps it column-by-column with a parabolic y-shift to create the arch.
  // Per-character approaches break narrow letters like "I" — this avoids that.

  function renderArcText(text) {
    ctx.font = FONT;

    const textWidth   = ctx.measureText(text).width;
    const pad         = 4;
    const offH        = Math.ceil(FONT_SIZE * 1.5);
    const offBaseline = Math.ceil(FONT_SIZE * 1.1);

    const offscreen  = document.createElement('canvas');
    offscreen.width  = Math.ceil(textWidth) + pad * 2;
    offscreen.height = offH;

    const offCtx        = offscreen.getContext('2d');
    offCtx.font         = FONT;
    offCtx.textBaseline = 'alphabetic';
    offCtx.lineJoin     = 'round';
    offCtx.lineWidth    = FONT_SIZE * 0.045;
    offCtx.strokeStyle  = COLORS.textStroke;
    offCtx.strokeText(text, pad, offBaseline);
    offCtx.fillStyle    = COLORS.text;
    offCtx.fillText(text, pad, offBaseline);

    const archDrop = textWidth * ARCH_RATIO;
    const startX   = Math.floor(CANVAS_W / 2 - textWidth / 2);
    const halfW    = textWidth / 2;

    for (let col = 0; col < offscreen.width; col++) {
      const t      = (col - pad - halfW) / halfW;  // −1 … +1
      const yShift = archDrop * t * t;              // parabolic drop
      ctx.drawImage(
        offscreen,
        col, 0, 1, offH,
        startX + col, BASELINE_Y - offBaseline + yShift, 1, offH,
      );
    }
  }

  // ── draw ────────────────────────────────────────────────────────────────────

  function draw() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Shadow pass
    ctx.save();
    ctx.shadowColor   = 'rgb(0 0 0 / 32%)';
    ctx.shadowBlur    = 32;
    ctx.shadowOffsetY = 12;
    buildShirtPath();
    ctx.fillStyle = COLORS.shirt;
    ctx.fill();
    ctx.restore();

    // Shirt fill
    buildShirtPath();
    ctx.fillStyle = COLORS.shirt;
    ctx.fill();

    // Fabric sheen
    ctx.save();
    buildShirtPath();
    ctx.clip();
    const sheen = ctx.createLinearGradient(0, 0, 0, 240);
    sheen.addColorStop(0, 'rgb(255 255 255 / 13%)');
    sheen.addColorStop(1, 'rgb(255 255 255 / 0%)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.restore();

    renderArcText((input.value.trim() || 'STEVIE KNICKS').toUpperCase());
  }

  // ── download ────────────────────────────────────────────────────────────────

  // iOS Safari ignores the `download` attribute on anchor elements.
  // Instead, open the image in a new tab where the user can long-press to save.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function downloadShirt() {
    draw();
    const dataUrl = canvas.toDataURL('image/png');

    if (isIOS) {
      const tab = window.open();
      tab.document.write(`
        <html><head><title>Save Your Shirt</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          body { margin:0; background:#0d1b2a; display:flex; flex-direction:column;
                 align-items:center; justify-content:center; min-height:100vh;
                 font-family:system-ui,sans-serif; color:#fff; gap:16px; padding:20px; }
          img  { max-width:100%; border-radius:12px; }
          p    { color:#f58426; font-size:1rem; text-align:center; }
        </style></head>
        <body>
          <p>Hold down on the image to save it to your photos</p>
          <img src="${dataUrl}" alt="Your Knicks shirt">
        </body></html>
      `);
      tab.document.close();
    } else {
      const anchor    = document.createElement('a');
      anchor.download = 'my-knicks-shirt.png';
      anchor.href     = dataUrl;
      anchor.click();
    }
  }

  // ── random pun ──────────────────────────────────────────────────────────────

  const PUNS = [
    'Stevie Knicks','Knickelback','Knick Jonas','Knick Jagger','Knick Cave',
    'Knick Drake','Knicki Minaj','Knick Mason','Knick Heyward','Knick Lowe',
    'Knick Rhodes','Knickcole Kidman','Knick Cage','Knick Offerman',
    'Knick Cannon','Knick Kroll','Knick Nolte','Knick Frost','Knick at Nite',
    'Knick Fury','Knick Park','Knickelodeon','Knickel & Dimed','Knick of Time',
    'Knick Nack','Knick Carraway','Knickolas Nickleby','Knick Bottom',
    'Knickolas Flamel','Knick Hornby','Knickolaus Copernicus',
    'Florence Knicktingale','Knickolai Tesla','Knickolo Machiavelli',
    'Knickolai Gogol','Knick Foles','Knick Saban','Knick Kyrgios',
    'Knick Swisher','Knick Price','Knick Sirianni','Knick Nurse',
    'Knick Van Exel','Saint Knick','Knick-o-lantern','Knickmas',
    'Old Knick','Knicktionary','Dominicknicks',
  ];

  let lastPunIndex = -1;

  function randomPun() {
    let idx;
    do { idx = Math.floor(Math.random() * PUNS.length); } while (idx === lastPunIndex);
    lastPunIndex = idx;
    input.value = PUNS[idx];
    draw();
  }

  // ── init ────────────────────────────────────────────────────────────────────

  input.addEventListener('input', draw);
  document.querySelector('.btn-wand').addEventListener('click', randomPun);
  document.querySelector('.btn-download').addEventListener('click', downloadShirt);
  document.fonts.ready.then(draw);
  draw();
})();
