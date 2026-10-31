/* Generative showreel — 4 code-driven scenes on one canvas */
(function () {
  var cv = document.getElementById('reelCanvas');
  if (!cv) return;
  var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, devicePixelRatio || 1);
  var COLS = ['#ff5a36', '#8a6bff', '#4fd1ff', '#d4ff3f', '#ff6fb5'];
  var SC = 4.5, names = ['SC 01 — PARTICLE TYPE', 'SC 02 — SQUASH & STRETCH', 'SC 03 — FLOW FIELD', 'SC 04 — ORBITAL SYSTEM'];
  var playing = true, visible = false, time = 0, last = 0, targets = [], parts = [];
  var sceneEl = document.getElementById('reelScene'), tcEl = document.getElementById('reelTc'), bar = document.getElementById('reelBar'), btn = document.querySelector('.reel-btn');
  var name = (window.SITE && window.SITE.name ? window.SITE.name.split(' ')[0] : 'ANIMORA').toUpperCase();

  function resize() {
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // sample text into points
    var o = document.createElement('canvas'), oc = o.getContext('2d'); o.width = W; o.height = H;
    oc.fillStyle = '#fff'; oc.textAlign = 'center'; oc.textBaseline = 'middle';
    oc.font = '900 ' + Math.min(W / (name.length * .78), H * .45) + 'px Unbounded, sans-serif';
    oc.fillText(name, W / 2, H / 2);
    var data = oc.getImageData(0, 0, W, H).data, step = Math.max(4, Math.round(W / 220)); targets = [];
    for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) targets.push([x, y]);
    parts = targets.map(function (t, i) { return { x: Math.random() * W, y: Math.random() * H, tx: t[0], ty: t[1], c: COLS[i % 5], d: Math.random() }; });
  }
  resize(); addEventListener('resize', resize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };

  function s1(t) { // particles assemble -> hold -> explode
    ctx.fillStyle = '#0c0b10'; ctx.fillRect(0, 0, W, H);
    var a = ease(clamp((t - .1) / 2)), ex = clamp((t - 3.4) / 1);
    parts.forEach(function (p) {
      var x = p.x + (p.tx - p.x) * a, y = p.y + (p.ty - p.y) * a;
      x += Math.sin(t * 3 + p.d * 20) * 1.2 * a;
      if (ex > 0) { var ang = p.d * 40, f = ex * ex * W * .6; x += Math.cos(ang) * f; y += Math.sin(ang) * f; }
      ctx.fillStyle = p.c; ctx.fillRect(x, y, 2.4, 2.4);
    });
  }
  function s2(t) { // bouncing balls with squash & stretch + trails
    ctx.fillStyle = 'rgba(244,239,230,1)'; ctx.fillRect(0, 0, W, H);
    var floor = H * .78;
    ctx.fillStyle = '#0c0b10'; ctx.fillRect(0, floor, W, 2);
    for (var i = 0; i < 4; i++) {
      var per = .9 + i * .12, ph = ((t + i * .2) % per) / per, R = H * (.07 - i * .008);
      var hgt = (1 - Math.pow(2 * ph - 1, 2)), y = floor - R - hgt * H * (.55 - i * .06);
      var sq = ph < .06 || ph > .94 ? 1.4 : 1 - .15 * Math.abs(2 * ph - 1), sx = ph < .06 || ph > .94 ? 1.35 : sq, sy = ph < .06 || ph > .94 ? .65 : 1 / sq;
      var x = W * (.2 + i * .2) + Math.sin(t * .8 + i) * W * .03;
      ctx.fillStyle = 'rgba(12,11,16,.15)'; ctx.beginPath(); ctx.ellipse(x, floor, R * (1.4 - hgt * .8), R * .18, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = COLS[i]; ctx.beginPath(); ctx.ellipse(x, y + (1 - sy) * R, R * sx, R * sy, 0, 0, 6.28); ctx.fill();
    }
    ctx.fillStyle = '#0c0b10'; ctx.font = '800 ' + H * .06 + 'px Unbounded, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('TIMING IS EVERYTHING.', W * .05, H * .2);
  }
  var flow = [];
  function s3(t, first) { // flow field lines
    if (first || flow.length === 0) { ctx.fillStyle = '#0c0b10'; ctx.fillRect(0, 0, W, H); flow = []; for (var i = 0; i < 600; i++) flow.push({ x: Math.random() * W, y: Math.random() * H, c: COLS[i % 5] }); }
    ctx.fillStyle = 'rgba(12,11,16,.06)'; ctx.fillRect(0, 0, W, H);
    ctx.lineWidth = 1.4;
    flow.forEach(function (p) {
      var a = Math.sin(p.x * .006 + t * .6) * 2 + Math.cos(p.y * .008 - t * .4) * 2;
      var nx = p.x + Math.cos(a) * 2.6, ny = p.y + Math.sin(a) * 2.6;
      ctx.strokeStyle = p.c; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) { p.x = Math.random() * W; p.y = Math.random() * H; }
    });
  }
  function s4(t) { // orbital system
    var g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .6); g.addColorStop(0, '#1d1530'); g.addColorStop(1, '#07060a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, s = Math.min(W, H);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, .42);
    for (var i = 0; i < 5; i++) { ctx.strokeStyle = 'rgba(244,239,230,.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, s * (.18 + i * .1), 0, 6.28); ctx.stroke(); }
    ctx.restore();
    var sunR = s * .09 * (1 + .05 * Math.sin(t * 4));
    var sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 3); sg.addColorStop(0, 'rgba(255,90,54,.9)'); sg.addColorStop(1, 'rgba(255,90,54,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, sunR * 3, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#ffd2c6'; ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, 6.28); ctx.fill();
    for (var j = 0; j < 5; j++) {
      var r = s * (.18 + j * .1), a = t * (1.4 - j * .22) + j * 1.3;
      for (var k = 6; k >= 0; k--) { // motion blur trail
        var aa = a - k * .04, x = cx + Math.cos(aa) * r, y = cy + Math.sin(aa) * r * .42;
        ctx.globalAlpha = 1 - k / 7; ctx.fillStyle = COLS[j];
        ctx.beginPath(); ctx.arc(x, y, s * (.018 + (j % 3) * .008), 0, 6.28); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  var scenes = [s1, s2, s3, s4], prevScene = -1;

  function frame(now) {
    if (!visible) return;
    var dt = last ? (now - last) / 1000 : 0; last = now;
    if (playing) time += Math.min(dt, .05);
    var total = SC * scenes.length, tt = time % total, si = Math.floor(tt / SC), lt = tt - si * SC;
    scenes[si](lt, si !== prevScene);
    if (si !== prevScene) { sceneEl.textContent = names[si]; prevScene = si; }
    // flash cut
    if (lt < .12) { ctx.fillStyle = 'rgba(255,255,255,' + (1 - lt / .12) * .8 + ')'; ctx.fillRect(0, 0, W, H); }
    // letterbox + scanline vibe
    ctx.fillStyle = 'rgba(0,0,0,.08)'; for (var y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    var sec = Math.floor(tt), fr = Math.floor((tt % 1) * 24);
    tcEl.textContent = '00:' + ('0' + sec).slice(-2) + ':' + ('0' + fr).slice(-2);
    bar.style.width = (tt / total * 100) + '%';
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) { last = 0; requestAnimationFrame(frame); } }, { threshold: .05 }).observe(cv);
  function toggle() { playing = !playing; btn.firstElementChild.textContent = playing ? '❚❚' : '▶'; var r = document.querySelector('.reel'); r.setAttribute('data-cursor', playing ? 'Pause' : 'Play'); var lbl = document.querySelector('.cursor-label'); if (lbl && document.querySelector('.cursor.is-label')) lbl.textContent = playing ? 'Pause' : 'Play'; }
  document.querySelector('.reel').addEventListener('click', toggle);
})();
