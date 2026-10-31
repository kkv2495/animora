/* Real-time 3D thumbnails (Three.js r128): product turntable, archviz day-to-dusk, stereo VR walkthrough.
   Each .demo-3d keeps its CSS animation as a fallback; it switches to WebGL only when a context is available. */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;
  var nodes = document.querySelectorAll('.demo-3d');
  if (!nodes.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hdr(c, i) { return new THREE.Color(c).multiplyScalar(i); }
  function envFrom(renderer, bg, panels) {
    var s = new THREE.Scene(); s.background = new THREE.Color(bg);
    var g = new THREE.PlaneGeometry(1, 1);
    panels.forEach(function (p) {
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: hdr(p.c, p.i), side: THREE.DoubleSide }));
      m.scale.set(p.w, p.h, 1); m.position.set(p.x, p.y, p.z); m.lookAt(0, 0, 0); s.add(m);
    });
    var pm = new THREE.PMREMGenerator(renderer), tex = pm.fromScene(s, 0.04).texture; pm.dispose();
    return tex;
  }
  function V2(a) { return a.map(function (p) { return new THREE.Vector2(p[0], p[1]); }); }
  function smooth(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }

  var SCENES = {
    /* ---------- laptop launch film: reveal → open → tumble → exploded view → close ---------- */
    laptop: function (r, el) {
      var LITE = r.__lite;
      var scene = new THREE.Scene();
      var bg = document.createElement('canvas'); bg.width = 2; bg.height = 256;
      var bgc = bg.getContext('2d'), gr = bgc.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, '#2b2140'); gr.addColorStop(0.6, '#121019'); gr.addColorStop(1, '#09080c'); bgc.fillStyle = gr; bgc.fillRect(0, 0, 2, 256);
      scene.background = new THREE.CanvasTexture(bg);
      scene.environment = envFrom(r, 0x060509, [
        { c: 0xffffff, i: 5, w: 1.4, h: 6, x: 5, y: 3, z: 2 }, { c: 0xffffff, i: 3, w: 1.4, h: 6, x: -5, y: 3, z: 3 },
        { c: 0xffffff, i: 2.5, w: 8, h: 1.2, x: 0, y: 8, z: 0 }, { c: 0xff5a36, i: 1.1, w: 2, h: 2, x: -4, y: 1, z: -4 }, { c: 0x8a6bff, i: 1.1, w: 2, h: 2, x: 4, y: 1, z: -4 }]);
      var cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

      /* floor that only shows shadows + soft contact blob */
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x0c0b10, roughness: 0.85, metalness: 0, envMapIntensity: 0.04 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
      var bc = document.createElement('canvas'); bc.width = bc.height = 128; var bx = bc.getContext('2d');
      var rg = bx.createRadialGradient(64, 64, 4, 64, 64, 64); rg.addColorStop(0, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); bx.fillStyle = rg; bx.fillRect(0, 0, 128, 128);
      var blob = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, depthWrite: false }));
      blob.rotation.x = -Math.PI / 2; blob.position.y = 0.005; scene.add(blob);
      var ring = new THREE.Mesh(new THREE.RingGeometry(2.05, 2.08, 128), new THREE.MeshBasicMaterial({ color: 0xd4ff3f, transparent: true, opacity: 0.55 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.008; scene.add(ring);

      /* materials */
      var alu = new THREE.MeshStandardMaterial({ color: 0xa7acb5, metalness: 0.9, roughness: 0.3, envMapIntensity: 1 });
      var aluDark = new THREE.MeshStandardMaterial({ color: 0x4a4e57, metalness: 0.9, roughness: 0.35 });
      var black = new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.4, metalness: 0.3 });
      function tex(w, h, draw) { var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
      var keysTex = tex(512, 320, function (g, w, h) {
        g.fillStyle = '#7f858f'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#16161a'; var kw = 30, gap = 4, x0 = 26, y0 = 18;
        for (var row = 0; row < 6; row++) for (var col = 0; col < 14; col++) {
          var ww = (row === 5 && col > 4 && col < 9) ? 0 : kw; if (row === 5 && col === 5) ww = kw * 4 + gap * 3;
          if (ww) { g.beginPath(); g.roundRect ? g.roundRect(x0 + col * (kw + gap), y0 + row * (kw * 0.8 + gap), ww, kw * 0.8, 4) : g.rect(x0 + col * (kw + gap), y0 + row * (kw * 0.8 + gap), ww, kw * 0.8); g.fill(); }
        }
        g.fillStyle = '#8b919b'; g.strokeStyle = '#6d727b'; g.lineWidth = 2; g.fillRect(170, 222, 172, 88); g.strokeRect(170, 222, 172, 88);
      });
      var screenTex = tex(640, 400, function (g, w, h) {
        var gg = g.createLinearGradient(0, 0, w, h); gg.addColorStop(0, '#8a6bff'); gg.addColorStop(0.55, '#ff5a36'); gg.addColorStop(1, '#ffb36b'); g.fillStyle = gg; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(12,11,16,.55)'; g.fillRect(0, 0, w, 34);
        ['#ff5a36', '#ffd23f', '#3fd27a'].forEach(function (c, i) { g.fillStyle = c; g.beginPath(); g.arc(22 + i * 22, 17, 6, 0, 6.3); g.fill(); });
        g.fillStyle = 'rgba(255,255,255,.92)'; g.font = '900 92px Unbounded, Arial Black, sans-serif'; g.fillText('LEO', 40, 190);
        g.font = '600 26px Manrope, Arial, sans-serif'; g.fillText('Creative Studios', 44, 236);
        g.fillStyle = 'rgba(12,11,16,.35)'; for (var i = 0; i < 6; i++) g.fillRect(400 + i * 36, 330 - (40 + i * 22), 24, 40 + i * 22);
        g.fillStyle = '#d4ff3f'; g.fillRect(44, 300, 150, 40);
      });
      var screenMat = new THREE.MeshBasicMaterial({ map: screenTex, color: 0x000000, toneMapped: false });

      /* laptop: bottom shell, internals, top deck (keyboard) carrying the hinged lid */
      var W = 3.0, D = 2.05;
      var laptop = new THREE.Group(); scene.add(laptop);
      var bottom = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, D), alu); bottom.position.y = 0.03; laptop.add(bottom);
      var feetMat = black; [[-1.2, -0.8], [1.2, -0.8], [-1.2, 0.8], [1.2, 0.8]].forEach(function (p) { var f = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16), feetMat); f.position.set(p[0], -0.005, p[1]); laptop.add(f); });
      var internals = new THREE.Group(); laptop.add(internals);
      var pcb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 0.9), new THREE.MeshStandardMaterial({ color: 0x0f3b2a, roughness: 0.6 })); pcb.position.set(0.55, 0.065, -0.45); internals.add(pcb);
      var chips = [[0.35, -0.5, 0.3, 0.3, 0x1a1a1f], [0.85, -0.55, 0.22, 0.18, 0x222228], [0.95, -0.2, 0.3, 0.12, 0x2a2a30], [0.3, -0.15, 0.4, 0.1, 0x2a2a30]];
      chips.forEach(function (c) { var m = new THREE.Mesh(new THREE.BoxGeometry(c[2], 0.03, c[3]), new THREE.MeshStandardMaterial({ color: c[4], roughness: 0.35, metalness: 0.4 })); m.position.set(c[0], 0.085, c[1]); internals.add(m); });
      var copper = new THREE.MeshStandardMaterial({ color: 0xd8835a, metalness: 1, roughness: 0.25 });
      var pipe = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.025, 0.08), copper); pipe.position.set(0.1, 0.1, -0.62); internals.add(pipe);
      [-0.95, 1.25].forEach(function (x) { var fan = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 32), aluDark); fan.position.set(x, 0.085, -0.6); internals.add(fan);
        var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.045, 16), black); hub.position.set(x, 0.09, -0.6); internals.add(hub); });
      var batt = new THREE.MeshStandardMaterial({ color: 0x1d1e24, roughness: 0.5, metalness: 0.2 });
      [-0.85, 0, 0.85].forEach(function (x) { var b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.62), batt); b.position.set(x, 0.085, 0.55); internals.add(b); });
      var lime = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.005, 0.02), new THREE.MeshBasicMaterial({ color: 0xd4ff3f })); lime.position.set(0, 0.106, 0.18); internals.add(lime);
      internals.children.forEach(function (m) { m.castShadow = true; m.userData.y = m.position.y; });

      var deck = new THREE.Group(); deck.position.y = 0.06; laptop.add(deck);
      var deckShell = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, D), alu); deckShell.position.y = 0.03; deck.add(deckShell);
      var keyb = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.72), new THREE.MeshStandardMaterial({ map: keysTex, roughness: 0.45, metalness: 0.5 })); keyb.rotation.x = -Math.PI / 2; keyb.position.set(0, 0.0605, 0.1); deck.add(keyb);
      var hinge = new THREE.Group(); hinge.position.set(0, 0.06, -D / 2); deck.add(hinge);
      var lid = new THREE.Mesh(new THREE.BoxGeometry(W, 0.05, D), alu); lid.position.set(0, 0.025, D / 2); hinge.add(lid);
      var bezel = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.06, D - 0.06), black); bezel.rotation.x = Math.PI / 2; bezel.position.set(0, -0.001, D / 2); hinge.add(bezel);
      var screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.26, D - 0.3), screenMat); screen.rotation.x = Math.PI / 2; screen.position.set(0, -0.002, D / 2 + 0.03); hinge.add(screen);
      var logo = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), new THREE.MeshStandardMaterial({ color: 0xd4ff3f, metalness: 0.6, roughness: 0.3, emissive: 0x2a3300 })); logo.rotation.x = -Math.PI / 2; logo.position.set(0, 0.0505, D / 2); hinge.add(logo);
      laptop.traverse(function (m) { if (m.isMesh && m !== screen) { m.castShadow = true; m.receiveShadow = true; } });

      /* lights: key casts the shadow that follows every move */
      scene.add(new THREE.HemisphereLight(0xffffff, 0x0b0a10, 0.25));
      var key = new THREE.DirectionalLight(0xfff4e8, 2.4); key.position.set(-3, 9, 4); key.castShadow = true;
      key.shadow.mapSize.set(LITE ? 512 : 2048, LITE ? 512 : 2048); var kc = key.shadow.camera; kc.left = -4; kc.right = 4; kc.top = 4; kc.bottom = -4; kc.near = 1; kc.far = 25;
      key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4; scene.add(key);
      var rimA = new THREE.PointLight(0xff5a36, 1.6, 9); rimA.position.set(-4, 2.2, -3); scene.add(rimA);
      var rimB = new THREE.PointLight(0x8a6bff, 1.6, 9); rimB.position.set(4, 2.5, -3); scene.add(rimB);

      var hud = el.querySelector('.pd-hud'), lastPhase = '';
      function s(a, b, t) { return smooth((t - a) / (b - a)); }
      var dist = 9;
      return {
        resize: function (w, h) { cam.aspect = w / h; dist = w / h < 1.15 ? 11.5 : 9; cam.updateProjectionMatrix(); },
        render: function (T) {
          var t = T % 12;
          var open = s(1.5, 3.3, t) - s(10, 11.4, t);
          var tumble = s(3.4, 5, t) - s(9.4, 10.8, t);
          var explode = s(6, 7.1, t) - s(8.5, 9.5, t);
          var rotY = -1.2 + 1.55 * s(0, 1.5, t) - 0.95 * s(3.4, 6, t) + 0.4 * s(6, 8.5, t) - 1.0 * s(10, 12, t);
          laptop.rotation.set(0.12 * tumble + 0.32 * explode, rotY + Math.sin(T * 0.5) * 0.04, 0.16 * tumble * Math.sin(t * 0.9));
          var lift = 0.55 + 0.35 * tumble + Math.sin(T * 1.3) * 0.06;
          laptop.position.y = lift;
          hinge.rotation.x = -1.92 * open;
          screenMat.color.setScalar(smooth(open * 1.4 - 0.2));
          deck.position.y = 0.06 + 0.95 * explode;
          internals.children.forEach(function (m, i) { m.position.y = m.userData.y + explode * (0.12 + (i % 4) * 0.1); });
          var sc = 1 - Math.min(0.5, (lift - 0.4) * 0.6); blob.scale.set(sc, sc, 1); blob.material.opacity = 0.75 * sc;
          ring.rotation.z = T * 0.2;
          cam.position.set(Math.sin(T * 0.25) * 0.6, 3.1 + explode * 1.6, dist - 0.4 * tumble + 2.2 * explode); cam.lookAt(0, 1 + 0.35 * tumble + 0.55 * explode, 0);
          if (hud) {
            var ph = explode > 0.5 ? '04 · EXPLODED VIEW' : tumble > 0.5 ? '03 · HERO TUMBLE' : open > 0.5 ? '02 · OPEN' : t > 10 ? '05 · CLOSE' : '01 · REVEAL';
            if (ph !== lastPhase) { hud.textContent = ph; lastPhase = ph; }
          }
          r.render(scene, cam);
        }
      };
    },

    /* ---------- modern villa, sun moves from day to dusk to night, windows light up ---------- */
    arch: function (r) {
      var scene = new THREE.Scene(), sky = new THREE.Color(0x8fb7dd); scene.background = sky;
      scene.fog = new THREE.Fog(0x8fb7dd, 34, 90);
      scene.environment = envFrom(r, 0x6f9cc8, [{ c: 0xffffff, i: 5, w: 3, h: 3, x: 8, y: 9, z: 4 }, { c: 0xbfd8f2, i: 1.4, w: 30, h: 8, x: 0, y: 6, z: -12 }, { c: 0x3c5a2a, i: 0.6, w: 30, h: 6, x: 0, y: -6, z: 0 }]);
      var cam = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
      var hemi = new THREE.HemisphereLight(0xd6e8ff, 0x2f3f24, 0.35); scene.add(hemi);
      var sun = new THREE.DirectionalLight(0xffffff, 2); sun.castShadow = true; sun.shadow.mapSize.set(r.__lite ? 1024 : 2048, r.__lite ? 1024 : 2048);
      var sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 60; sun.shadow.bias = -0.0006;
      scene.add(sun); scene.add(sun.target);
      function M(c, o) { var p = { color: c, roughness: 0.8 }; for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
      var ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), M(0x3f6a2c, { roughness: 1, envMapIntensity: 0.3 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
      var house = new THREE.Group(); scene.add(house);
      function box(w, h, d, mat, x, y, z) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; house.add(m); return m; }
      var concrete = M(0xd9d4ca, { roughness: 0.75, envMapIntensity: 0.5 }), wood = M(0x7a4524, { roughness: 0.5, envMapIntensity: 0.6 }), dark = M(0x1f1f24, { roughness: 0.45 }), deck = M(0x9c8f7c, { roughness: 0.85, envMapIntensity: 0.4 });
      var glass = new THREE.MeshStandardMaterial({ color: 0x0e1622, roughness: 0.03, metalness: 0.95, envMapIntensity: 1.6, emissive: 0xffa94d, emissiveIntensity: 0 });
      var frame = M(0x141418, { roughness: 0.4, metalness: 0.5 });
      box(10, 0.2, 7, deck, 0, 0.1, 0);
      box(6, 1.7, 3.6, concrete, -1, 1.05, -0.4);
      box(5.6, 1.35, 0.06, glass, -1, 0.98, 1.42);
      box(0.06, 1.35, 2.8, glass, 2.02, 0.98, -0.4);
      box(6.8, 0.16, 4.4, concrete, -1, 1.98, -0.4);
      box(5.2, 1.5, 3.2, wood, 1.2, 2.82, -0.8);
      box(4.6, 1.05, 0.06, glass, 1.2, 2.82, 0.82);
      box(0.06, 1.05, 2.4, glass, 3.82, 2.82, -0.8);
      box(5.8, 0.16, 3.8, dark, 1.2, 3.65, -0.8);
      box(0.12, 0.9, 2.6, dark, 3.3, 2.5, 1.9);           /* balcony fin */
      for (var mx = -3.6; mx <= 1.7; mx += 1.15) box(0.05, 1.35, 0.1, frame, mx, 0.98, 1.45);
      for (var ux = -0.95; ux <= 3.4; ux += 1.1) box(0.05, 1.05, 0.1, frame, ux, 2.82, 0.85);
      box(1.2, 0.04, 4.5, deck, -2.4, 0.21, 4.8);          /* entrance path */
      box(9.6, 0.6, 0.18, concrete, 0, 0.3, -4.2);         /* back garden wall */
      var waterMat = new THREE.MeshStandardMaterial({ color: 0x2fb6d8, roughness: 0.08, metalness: 0.3, emissive: 0x0a5a70, emissiveIntensity: 0.3 });
      var pool = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 1.7), waterMat); pool.position.set(2.4, 0.22, 2.4); pool.receiveShadow = true; house.add(pool);
      var leaf = M(0x2f5a22, { roughness: 0.9 }), bark = M(0x4a3020);
      [[-5.6, 2.6, 1.1], [-6.3, -2.2, 1.4], [5.8, -2.6, 1.2], [6.4, 1.8, 0.9], [-3.8, 4.4, 0.8]].forEach(function (p) {
        var tr = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1, 8), bark); tr.position.set(p[0], 0.5, p[1]); tr.castShadow = true; scene.add(tr);
        var cn = new THREE.Mesh(new THREE.IcosahedronGeometry(p[2], 3), leaf); cn.position.set(p[0], 1 + p[2] * 0.8, p[1]); cn.castShadow = true; scene.add(cn);
      });
      var lampMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
      [[-4.6, 3.2], [-2, 3.2], [0.6, 3.2]].forEach(function (p) { var l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), lampMat); l.position.set(p[0], 0.45, p[1]); scene.add(l); });
      var dayC = new THREE.Color(0x8fb7dd), duskC = new THREE.Color(0xe98a5c), nightC = new THREE.Color(0x0d1426), white = new THREE.Color(0xffffff), warm = new THREE.Color(0xff9a55);
      var dist = 16;
      return {
        resize: function (w, h) { cam.aspect = w / h; dist = w / h < 1.15 ? 21 : 16; cam.updateProjectionMatrix(); },
        render: function (t) {
          var p = ((t + 1.5) % 18) / 18, d = (1 + Math.cos(p * Math.PI * 2)) / 2;      // 1 = noon, 0 = night
          var a = 0.5 + p * Math.PI;
          sun.position.set(Math.cos(a) * 14, 1.5 + d * 13, 6 + Math.sin(a) * 6);
          sun.intensity = 0.1 + d * 1.9; sun.color.copy(warm).lerp(white, smooth(d * 1.6 - 0.3));
          if (d > 0.45) sky.copy(duskC).lerp(dayC, smooth((d - 0.45) / 0.55)); else sky.copy(nightC).lerp(duskC, smooth(d / 0.45));
          scene.fog.color.copy(sky); hemi.intensity = 0.08 + d * 0.35; r.toneMappingExposure = 1.1 + d * 0.3;
          glass.emissiveIntensity = smooth((0.6 - d) / 0.4) * 2.2; glass.envMapIntensity = 0.4 + d * 1.4;
          waterMat.emissiveIntensity = 0.3 + smooth((0.5 - d) / 0.4) * 1.2;
          lampMat.color.setRGB(1, 0.85, 0.62).multiplyScalar(0.25 + smooth((0.5 - d) / 0.4) * 1.5);
          var ang = t * 0.14 + 0.6;
          cam.position.set(Math.sin(ang) * dist, 6.2, Math.cos(ang) * dist); cam.lookAt(0, 1.6, 0);
          r.render(scene, cam);
        }
      };
    },

    /* ---------- stereo VR walkthrough of a neon gallery ---------- */
    vr: function (r) {
      var scene = new THREE.Scene(); scene.background = new THREE.Color(0x07060c); scene.fog = new THREE.Fog(0x07060c, 3, 24);
      scene.environment = envFrom(r, 0x020203, [{ c: 0x8a6bff, i: 1.2, w: 1, h: 4, x: -4, y: 2, z: -4 }, { c: 0xd4ff3f, i: 1.2, w: 1, h: 4, x: 4, y: 2, z: -4 }, { c: 0xff5a36, i: 1, w: 8, h: 0.4, x: 0, y: -2, z: -6 }]);
      var rig = new THREE.Group(); scene.add(rig);
      var camL = new THREE.PerspectiveCamera(72, 1, 0.05, 60), camR = new THREE.PerspectiveCamera(72, 1, 0.05, 60);
      camL.position.x = -0.04; camR.position.x = 0.04; rig.add(camL); rig.add(camR);
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 200), new THREE.MeshStandardMaterial({ color: 0x050407, roughness: 0.08, metalness: 0.95, envMapIntensity: 0.7 }));
      floor.rotation.x = -Math.PI / 2; floor.position.z = -90; scene.add(floor);
      var stripMat = new THREE.MeshBasicMaterial({ color: hdr(0xff5a36, 1.4) });
      [-1.7, 1.7].forEach(function (x) { var s = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 200), stripMat); s.position.set(x, 0.01, -90); scene.add(s); });
      var pillar = new THREE.MeshStandardMaterial({ color: 0x141218, roughness: 0.35, metalness: 0.4, envMapIntensity: 0.4 });
      var neon = [new THREE.MeshBasicMaterial({ color: hdr(0xd4ff3f, 2.2), fog: false }), new THREE.MeshBasicMaterial({ color: hdr(0xff5a36, 2.2), fog: false })];
      var art = [0xff5a36, 0x4fd1ff, 0xff6fb5, 0xd4ff3f, 0x8a6bff].map(function (c) { return new THREE.MeshBasicMaterial({ color: hdr(c, 1.15) }); });
      var N = 9, GAP = 3, arches = [];
      for (var i = 0; i < N; i++) {
        var g = new THREE.Group();
        [-2, 2].forEach(function (x, k) {
          var p = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.2, 0.32), pillar); p.position.set(x, 1.6, 0); g.add(p);
          var n = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.9, 0.08), neon[(i + k) % 2]); n.position.set(x * 0.92, 1.6, 0.17); g.add(n);
        });
        var beam = new THREE.Mesh(new THREE.BoxGeometry(4.32, 0.3, 0.32), pillar); beam.position.y = 3.3; g.add(beam);
        var panel = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), art[i % art.length]); panel.position.set(i % 2 ? 1.95 : -1.95, 1.7, -1.5); panel.rotation.y = i % 2 ? -Math.PI / 2 : Math.PI / 2; g.add(panel);
        scene.add(g); arches.push(g);
      }
      var portal = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 16, 96), new THREE.MeshBasicMaterial({ color: hdr(0xd4ff3f, 1.5), fog: false }));
      portal.position.set(0, 1.6, -15); rig.add(portal);
      var core = new THREE.Mesh(new THREE.CircleGeometry(1.05, 64), new THREE.MeshBasicMaterial({ color: 0x8a6bff, transparent: true, opacity: 0.35, fog: false }));
      core.position.copy(portal.position); rig.add(core);
      scene.add(new THREE.AmbientLight(0xffffff, 0.06));
      var pl = new THREE.PointLight(0xd4ff3f, 0.5, 6); pl.position.set(0, 2.6, -2); rig.add(pl);
      var W = 1, H = 1;
      return {
        resize: function (w, h) { W = w; H = h; camL.aspect = camR.aspect = (w / 2) / h; camL.updateProjectionMatrix(); camR.updateProjectionMatrix(); },
        render: function (t) {
          var sdist = t * 1.6, L = N * GAP;
          arches.forEach(function (g, i) { g.position.z = -(((i * GAP - sdist) % L) + L) % L + 1.5; });
          rig.position.y = Math.sin(t * 4.2) * 0.03;
          camL.position.y = camR.position.y = 1.6;
          rig.rotation.y = Math.sin(t * 0.4) * 0.12; rig.rotation.x = Math.sin(t * 0.3) * 0.03;
          portal.rotation.z = t * 0.6; core.material.opacity = 0.25 + Math.sin(t * 2) * 0.1;
          r.setScissorTest(true);
          r.setViewport(0, 0, W / 2, H); r.setScissor(0, 0, W / 2, H); r.render(scene, camL);
          r.setViewport(W / 2, 0, W / 2, H); r.setScissor(W / 2, 0, W / 2, H); r.render(scene, camR);
          r.setScissorTest(false);
        }
      };
    }
  };

  nodes.forEach(function (el) {
    var canvas = el.querySelector('canvas.d3'), make = SCENES[el.getAttribute('data-scene')], lite = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
    if (!canvas || !make) return;
    var r;
    try { r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'low-power' }); } catch (e) { return; }
    if (!r.getContext()) return;
    r.__lite = lite;
    r.setPixelRatio(lite ? 1 : Math.min(1.5, window.devicePixelRatio || 1));
    r.outputEncoding = THREE.LinearEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.25;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    var S;
    try { S = make(r, el); } catch (e) { if (window.console) console.error(e); return; }
    el.classList.add('gl-on');
    function size() { var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; r.setSize(w, h, false); S.resize(w, h); }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(el); else addEventListener('resize', size);
    var vis = false, clock = new THREE.Clock(), t = 0, drawn = false;
    function loop() {
      if (!vis) return;
      t += Math.min(clock.getDelta(), 0.05);
      S.render(window.__D3T != null ? window.__D3T : (reduce ? 4 : t)); drawn = true;
      if (!reduce) requestAnimationFrame(loop);
    }
    new IntersectionObserver(function (e) {
      vis = e[0].isIntersecting;
      if (vis) { clock.getDelta(); loop(); }
    }, { rootMargin: '100px' }).observe(el);
  });
})();
