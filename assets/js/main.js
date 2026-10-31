/* Animora — shared interactions */
(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  /* every page opens at the top (some viewers restore the previous page's scroll position) */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  if (!location.hash) {
    window.scrollTo(0, 0);
    var touched = false, mark = function () { touched = true; };
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { addEventListener(ev, mark, { passive: true, once: true }); });
    addEventListener('load', function () { if (!touched && !location.hash && scrollY > 0) window.scrollTo(0, 0); });
  }
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger); else root.classList.add('no-gsap');
  var fine = window.matchMedia('(pointer:fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.ANI = { mouse: mouse };

  /* ---------- page transitions ---------- */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var href = a.getAttribute('href') || '';
    if (!/\.html(\?|#|$)/.test(href) || /^(https?:|mailto:|tel:)/.test(href)) return;
    var here = location.pathname.split('/').pop() || 'index.html';
    if (href.split('#')[0] === here && href.indexOf('#') > -1) return;
    e.preventDefault();
    root.classList.add('leaving');
    setTimeout(function () { location.href = href; }, reduce ? 0 : 620);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('leaving'); });

  /* ---------- nav ---------- */
  var nav = d.getElementById('nav'), lastY = 0;
  addEventListener('scroll', function () {
    var y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > 300 && y > lastY && !root.classList.contains('menu-open'));
    lastY = y;
  }, { passive: true });
  var burger = d.querySelector('.burger');
  burger && burger.addEventListener('click', function () {
    var open = root.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    d.querySelector('.menu').setAttribute('aria-hidden', !open);
  });

  /* ---------- cursor ---------- */
  if (fine && !reduce) {
    body.classList.add('has-cursor');
    var cur = d.querySelector('.cursor'), dot = d.querySelector('.cursor-dot'), label = d.querySelector('.cursor-label');
    var cx = mouse.x, cy = mouse.y;
    (function loop() {
      cx += (mouse.x - cx) * .18; cy += (mouse.y - cy) * .18;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      dot.style.transform = 'translate(' + mouse.x + 'px,' + mouse.y + 'px)';
      requestAnimationFrame(loop);
    })();
    d.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor]');
      var l = e.target.closest('a,button,label,summary,input,select,textarea');
      cur.classList.toggle('is-label', !!t);
      cur.classList.toggle('is-link', !t && !!l);
      label.textContent = t ? t.getAttribute('data-cursor') : '';
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine) d.querySelectorAll('.magnetic').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .25 + 'px,' + (e.clientY - r.top - r.height / 2) * .35 + 'px)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  });

  /* ---------- timecodes ---------- */
  var tcs = d.querySelectorAll('[data-tc]'), t0 = performance.now();
  if (tcs.length) setInterval(function () {
    var s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24);
    var p = function (n) { return ('0' + n).slice(-2); };
    var txt = p(Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(Math.floor(s) % 60) + ':' + p(f);
    tcs.forEach(function (t) { t.textContent = txt; });
  }, 1000 / 24);

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  d.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- split text ---------- */
  function split(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(d.createTextNode(' ')); return; }
            var ws = d.createElement('span'); ws.className = 'w';
            w.split('').forEach(function (c) { var s = d.createElement('span'); s.className = 'ch'; s.textContent = c; ws.appendChild(s); });
            frag.appendChild(ws);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return el.querySelectorAll('.ch');
  }
  function introTitles() {
    d.querySelectorAll('[data-split]').forEach(function (el, i) {
      var chars = split(el);
      if (hasGSAP && !reduce) gsap.from(chars, { yPercent: 115, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: .025, delay: .35 + i * .12 });
    });
    if (hasGSAP && !reduce) {
      gsap.from('.hero-eyebrow, .hero-bottom > *, .scroll-cue', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1, delay: .9 });
    }
  }

  /* ---------- loader (home, first visit only) ---------- */
  var loader = d.querySelector('.loader');
  if (loader && root.classList.contains('show-loader')) {
    var lc = d.getElementById('lc'), bar = loader.querySelector('.loader-bar'), start = performance.now(), dur = 1700;
    (function tick() {
      var p = Math.min(1, (performance.now() - start) / dur), e = 1 - Math.pow(1 - p, 3);
      lc.textContent = ('00' + Math.round(e * 100)).slice(-3);
      bar.style.setProperty('--p', e * 100 + '%');
      if (p < 1) requestAnimationFrame(tick);
      else {
        try { sessionStorage.setItem('ani_seen', '1'); } catch (err) {}
        loader.classList.add('done'); introTitles();
        setTimeout(function () { root.classList.remove('show-loader'); }, 1100);
      }
    })();
  } else introTitles();

  /* ---------- scroll-lit statement ---------- */
  d.querySelectorAll('[data-words]').forEach(function (el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="wd">' + w + '</span>'; }).join(' ');
    if (hasGSAP) gsap.to(el.querySelectorAll('.wd'), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  /* ---------- horizontal process ---------- */
  var proc = d.querySelector('.process');
  if (proc && hasGSAP) {
    ScrollTrigger.matchMedia({
      '(min-width: 901px)': function () {
        var track = proc.querySelector('.process-track');
        var dist = function () { return track.scrollWidth - innerWidth + 40; };
        gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: proc, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .8, invalidateOnRefresh: true } });
        gsap.from(proc.querySelectorAll('.step-num'), { scale: .5, opacity: 0, stagger: .1, scrollTrigger: { trigger: proc, start: 'top 60%' } });
      }
    });
  }

  /* ---------- parallax on hero title ---------- */
  if (hasGSAP && d.querySelector('.hero')) {
    gsap.to('.hero-inner', { yPercent: 18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- counters ---------- */
  var cio = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (!x.isIntersecting) return;
      var el = x.target, end = parseFloat(el.getAttribute('data-count')), dec = (el.getAttribute('data-count').split('.')[1] || '').length, s = performance.now();
      (function step() {
        var p = Math.min(1, (performance.now() - s) / 1600), e = 1 - Math.pow(1 - p, 4);
        el.textContent = (end * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      })();
      cio.unobserve(el);
    });
  }, { threshold: .5 });
  d.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- industry hover follower ---------- */
  var fol = d.querySelector('.ind-follow');
  if (fol && fine) {
    var fx = 0, fy = 0;
    d.querySelectorAll('.ind-row').forEach(function (r) {
      r.addEventListener('mouseenter', function () { fol.style.background = r.getAttribute('data-color'); fol.classList.add('on'); });
      r.addEventListener('mouseleave', function () { fol.classList.remove('on'); });
    });
    (function fl() { fx += (mouse.x - fx) * .12; fy += (mouse.y - fy) * .12; fol.style.left = fx + 'px'; fol.style.top = fy + 'px'; requestAnimationFrame(fl); })();
  }

  /* ---------- demo: eyes follow cursor ---------- */
  var faces = d.querySelectorAll('.demo-face .eye');
  if (faces.length) {
    var updEyes = function () {
      faces.forEach(function (eye) {
        var r = eye.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2), a = Math.atan2(dy, dx), m = Math.min(1, Math.hypot(dx, dy) / 200);
        var pupil = eye.firstElementChild;
        pupil.style.setProperty('--px', Math.cos(a) * m * r.width * .25 + 'px');
        pupil.style.setProperty('--py', Math.sin(a) * m * r.height * .25 + 'px');
      });
      requestAnimationFrame(updEyes);
    };
    updEyes();
  }

  /* ---------- demo: VFX particle swarm ---------- */
  d.querySelectorAll('.demo-vfx canvas').forEach(function (cv) {
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, devicePixelRatio || 1), P = [], visible = false, t = 0;
    var cols = ['#ff5a36', '#8a6bff', '#4fd1ff', '#d4ff3f', '#ff6fb5'];
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    for (var i = 0; i < 260; i++) P.push({ a: Math.random() * 6.28, r: 20 + Math.random() * 120, s: .004 + Math.random() * .012, z: Math.random(), c: cols[i % 5], x: 0, y: 0 });
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) draw(); }).observe(cv);
    function draw() {
      if (!visible) return;
      t += .016;
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(9,8,12,.22)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      var r = cv.getBoundingClientRect(), mx = mouse.x - r.left, my = mouse.y - r.top;
      var inside = mx > 0 && my > 0 && mx < W && my < H;
      var cx = inside ? mx : W / 2 + Math.cos(t * .7) * W * .15, cy = inside ? my : H / 2 + Math.sin(t * 1.1) * H * .12;
      P.forEach(function (p) {
        p.a += p.s * (1.5 - p.z);
        var rr = p.r * (inside ? .6 : 1) * (1 + .15 * Math.sin(t * 2 + p.z * 10));
        var tx = cx + Math.cos(p.a) * rr, ty = cy + Math.sin(p.a) * rr * .7;
        p.x += (tx - p.x) * .08; p.y += (ty - p.y) * .08;
        ctx.fillStyle = p.c; ctx.globalAlpha = .5 + p.z * .5;
        ctx.beginPath(); ctx.arc(p.x, p.y, .6 + p.z * 1.8, 0, 6.28); ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
  });

  /* ---------- blog filters ---------- */
  d.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      d.querySelectorAll('[data-filter]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      d.querySelectorAll('.blog-sec .post-card').forEach(function (c) { c.classList.toggle('hide', f !== 'All' && c.getAttribute('data-cat') !== f); });
    });
  });

  /* ---------- reading progress ---------- */
  var rp = d.querySelector('.read-progress i');
  if (rp) addEventListener('scroll', function () {
    var h = d.documentElement.scrollHeight - innerHeight;
    rp.style.width = (scrollY / h * 100) + '%';
  }, { passive: true });

  /* ---------- studio open status (IST) ---------- */
  d.querySelectorAll('[data-hours]').forEach(function (c) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false, weekday: 'short' }).formatToParts(new Date());
      var hr = +parts.find(function (p) { return p.type === 'hour'; }).value, wd = parts.find(function (p) { return p.type === 'weekday'; }).value;
      var open = wd !== 'Sun' && hr >= 10 && hr < 19;
      c.querySelector('.open-dot').classList.toggle('on', open);
      c.querySelector('.open-txt').textContent = open ? 'Open now · Mon–Sat 10:00–19:00 IST' : 'Closed now · Opens 10:00 IST (Mon–Sat)';
    } catch (e) {}
  });

  /* ---------- lead forms ---------- */
  var S = window.SITE || {};
  function send(data, subject) {
    if (S.endpoint) {
      return fetch(S.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error('bad'); return 'sent'; });
    }
    var lines = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n');
    location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines);
    return Promise.resolve('mailto');
  }

  d.querySelectorAll('[data-form="newsletter"]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = f.querySelector('.form-note');
      send({ type: 'newsletter', email: f.email.value }, 'Newsletter signup').then(function () { note.textContent = 'You\'re on the list. See you in the next frame ✦'; f.reset(); })
        .catch(function () { note.textContent = 'Something went wrong — please email us instead.'; note.classList.add('err'); });
    });
  });

  var form = d.getElementById('quoteForm');
  if (form) {
    var panels = form.querySelectorAll('.wz-panel'), step = 0, barEl = d.getElementById('wzBar'), stepEl = d.getElementById('wzStep');
    var qs = new URLSearchParams(location.search);
    if (qs.get('service')) { var cb = form.querySelector('[data-slug="' + qs.get('service') + '"]'); if (cb) cb.checked = true; }
    if (qs.get('industry')) { var op = form.querySelector('option[data-slug="' + qs.get('industry') + '"]'); if (op) op.selected = true; }
    var show = function (i) {
      panels[step].classList.remove('is-on'); step = i; panels[step].classList.add('is-on');
      barEl.style.width = ((step + 1) / panels.length * 100) + '%';
      stepEl.textContent = 'STEP ' + (step + 1) + ' / ' + panels.length;
    };
    form.addEventListener('click', function (e) {
      if (e.target.closest('[data-next]')) {
        if (step === 0 && !form.querySelector('[name="services"]:checked')) { shake(panels[0]); return; }
        show(step + 1);
      }
      if (e.target.closest('[data-prev]')) show(step - 1);
    });
    function shake(el) { if (el.animate) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }], { duration: 300 }); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value));
        inp.closest('.field').classList.toggle('bad', bad); if (bad) ok = false;
      });
      var note = panels[2].querySelector('.form-note');
      if (!ok) { note.textContent = 'Please fill in the highlighted fields.'; note.classList.add('err'); shake(panels[2]); return; }
      var fd = new FormData(form), data = { services: fd.getAll('services').join(', ') };
      ['budget', 'timeline', 'name', 'email', 'phone', 'company', 'industry', 'length', 'message'].forEach(function (k) { data[k] = fd.get(k) || ''; });
      data.page = location.href;
      send(data, 'New project brief from ' + data.name + (data.company ? ' (' + data.company + ')' : '')).then(function (mode) {
        panels[step].classList.remove('is-on');
        form.querySelector('.wz-done').hidden = false;
        barEl.style.width = '100%'; stepEl.textContent = 'DONE';
        if (mode === 'mailto') d.getElementById('doneMsg').textContent = 'We tried to open your email app with the brief pre-filled; just hit send. If nothing opened, email us at ' + S.email + ' and a producer will reply within 24 hours.';
        confetti(d.querySelector('.confetti'));
      }).catch(function () { note.textContent = 'Couldn\'t send right now — please email ' + S.email; note.classList.add('err'); });
    });
  }

  function confetti(cv) {
    if (!cv) return;
    var ctx = cv.getContext('2d'), r = cv.getBoundingClientRect(), W = cv.width = r.width, H = cv.height = r.height, P = [], cols = ['#ff5a36', '#8a6bff', '#4fd1ff', '#d4ff3f', '#ff6fb5'];
    for (var i = 0; i < 160; i++) P.push({ x: W / 2, y: H * .35, vx: (Math.random() - .5) * 16, vy: -Math.random() * 14 - 4, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4, w: 6 + Math.random() * 6, c: cols[i % 5] });
    var n = 0;
    (function f() {
      ctx.clearRect(0, 0, W, H);
      P.forEach(function (p) { p.vy += .4; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -3, p.w, 6); ctx.restore(); });
      if (++n < 200) requestAnimationFrame(f); else ctx.clearRect(0, 0, W, H);
    })();
  }


  /* ---------- demo: mocap skeleton ---------- */
  d.querySelectorAll('.demo-mocap canvas').forEach(function (cv) {
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(2, devicePixelRatio || 1), visible = false, t = 0, trail = [];
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) draw(); }).observe(cv);
    function pose(ph) {
      var s = H / 310, cx = W / 2, floor = H * .86, S = Math.sin, C = Math.cos;
      var bob = Math.abs(S(ph)) * 6 * s, hip = { x: cx, y: floor - 112 * s + bob };
      var P = { hip: hip, chest: { x: cx + 4 * s, y: hip.y - 58 * s }, neck: { x: cx + 6 * s, y: hip.y - 74 * s }, head: { x: cx + 8 * s, y: hip.y - 92 * s } };
      function leg(o) { var a = S(ph + o) * .55, k = Math.max(0, S(ph + o + 1.3)) * .9;
        var knee = { x: hip.x + S(a) * 56 * s, y: hip.y + C(a) * 56 * s }, foot = { x: knee.x + S(a - k) * 54 * s, y: Math.min(floor, knee.y + C(a - k) * 54 * s) }; return [knee, foot]; }
      function arm(o) { var a = -S(ph + o) * .5, e = .4 + Math.max(0, S(ph + o)) * .5;
        var el = { x: P.chest.x + S(a) * 40 * s, y: P.chest.y + 6 * s + C(a) * 40 * s }, hd = { x: el.x + S(a + e) * 38 * s, y: el.y + C(a + e) * 38 * s }; return [el, hd]; }
      var L = leg(0), R = leg(Math.PI), AL = arm(Math.PI), AR = arm(0);
      P.kneeL = L[0]; P.footL = L[1]; P.kneeR = R[0]; P.footR = R[1]; P.elbL = AL[0]; P.handL = AL[1]; P.elbR = AR[0]; P.handR = AR[1];
      return P;
    }
    var bones = [['hip', 'chest'], ['chest', 'neck'], ['neck', 'head'], ['hip', 'kneeL'], ['kneeL', 'footL'], ['hip', 'kneeR'], ['kneeR', 'footR'], ['chest', 'elbL'], ['elbL', 'handL'], ['chest', 'elbR'], ['elbR', 'handR']];
    function draw() {
      if (!visible) return;
      t += .016;
      ctx.clearRect(0, 0, W, H);
      var floor = H * .84;
      ctx.strokeStyle = 'rgba(79,209,255,.18)'; ctx.lineWidth = 1;
      for (var gx = -((t * 40) % 30); gx < W; gx += 30) { ctx.beginPath(); ctx.moveTo(gx, floor); ctx.lineTo(W / 2 + (gx - W / 2) * 2.2, H); ctx.stroke(); }
      for (var gy = 0; gy < 4; gy++) { var yy = floor + gy * gy * 4 + gy * 4; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
      var P = pose(t * 4.2), solve = (Math.sin(t * .9) + 1) / 2;
      trail.push({ L: P.handL, R: P.handR, f: P.footL, g: P.footR }); if (trail.length > 18) trail.shift();
      trail.forEach(function (q, i) { ctx.fillStyle = 'rgba(79,209,255,' + i / 60 + ')'; [q.L, q.R, q.f, q.g].forEach(function (m) { ctx.fillRect(m.x - 1.5 - (trail.length - i) * 2.2, m.y - 1.5, 3, 3); }); });
      ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3, H / 60); ctx.strokeStyle = 'rgba(212,255,63,' + (.25 + solve * .75) + ')';
      bones.forEach(function (b) { ctx.beginPath(); ctx.moveTo(P[b[0]].x, P[b[0]].y); ctx.lineTo(P[b[1]].x, P[b[1]].y); ctx.stroke(); });
      ctx.beginPath(); ctx.arc(P.head.x, P.head.y, H / 22, 0, 6.28); ctx.stroke();
      Object.keys(P).forEach(function (k, i) {
        var m = P[k], j = (1 - solve) * 3;
        ctx.fillStyle = '#4fd1ff'; ctx.beginPath(); ctx.arc(m.x + Math.sin(t * 13 + i) * j, m.y + Math.cos(t * 11 + i) * j, Math.max(2.5, H / 70), 0, 6.28); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
  });

  /* ---------- enquiry form (contact page) ---------- */
  var eq = d.getElementById('enquiryForm');
  if (eq) {
    var qs2 = new URLSearchParams(location.search);
    if (qs2.get('service')) { var o2 = eq.querySelector('option[data-slug="' + qs2.get('service') + '"]'); if (o2) o2.selected = true; }
    var fieldsBox = eq.querySelector('.fields'), foot = eq.querySelector('.form-foot'), done = eq.querySelector('.wz-done'), note2 = eq.querySelector('.form-note');
    eq.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      eq.querySelectorAll('[required]').forEach(function (inp) {
        var bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value));
        inp.closest('.field').classList.toggle('bad', bad); if (bad) ok = false;
      });
      if (!ok) { note2.textContent = 'Please fill in the highlighted fields.'; note2.classList.add('err'); return; }
      note2.textContent = ''; note2.classList.remove('err');
      var fd = new FormData(eq), data = {};
      ['name', 'company', 'email', 'phone', 'type', 'budget', 'timeline', 'message'].forEach(function (k) { data[k] = fd.get(k) || ''; });
      send(data, 'Project enquiry: ' + data.type + ' from ' + data.name + (data.company ? ' (' + data.company + ')' : '')).then(function (mode) {
        fieldsBox.hidden = true; foot.hidden = true; done.hidden = false;
        d.getElementById('doneMsg').textContent = mode === 'mailto'
          ? 'Your email app should now be open with your enquiry filled in. Just press send. If nothing opened, email us at ' + S.email + '.'
          : 'Your enquiry has been sent. Our team will review your requirements and get back to you.';
        confetti(eq.querySelector('.confetti'));
      }).catch(function () { note2.textContent = 'We couldn\'t send that just now. Please email us at ' + S.email + '.'; note2.classList.add('err'); });
    });
    d.getElementById('againBtn').addEventListener('click', function () { eq.reset(); fieldsBox.hidden = false; foot.hidden = false; done.hidden = true; });
  }

  /* ---------- showcase video: plays while visible, sound toggle ---------- */
  var vid = d.getElementById('scVideo');
  if (vid) {
    var sbtn = d.querySelector('.sc-sound'), box = vid.closest('.sc-video');
    vid.addEventListener('loadedmetadata', function () { if (vid.duration > 12 && vid.currentTime < 1) vid.currentTime = 5; }, { once: true });
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause();
    }, { threshold: 0.25 }).observe(vid);
    var toggleSound = function () {
      vid.muted = !vid.muted;
      if (!vid.muted) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
      sbtn.setAttribute('aria-pressed', String(!vid.muted));
      sbtn.querySelector('.sc-lbl').textContent = vid.muted ? 'Sound off' : 'Sound on';
      box.setAttribute('data-cursor', vid.muted ? 'Sound' : 'Mute');
      var lbl = d.querySelector('.cursor.is-label .cursor-label'); if (lbl) lbl.textContent = box.getAttribute('data-cursor');
    };
    box.addEventListener('click', toggleSound);
  }

  if (hasGSAP) addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
