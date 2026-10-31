# -*- coding: utf-8 -*-
"""Static site builder. Run:  python3 _source/build.py   (outputs HTML into the site root)"""
import os, random, html, json, datetime, math, glob
from content import *

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
YEAR = datetime.date.today().year
SVC = {s["slug"]: s for s in SERVICES}
WA = BRAND["whatsapp"].strip()
PHONE = BRAND["phone"].strip()

PALETTES = [("#ff5a36", "#8a6bff", "#d4ff3f"), ("#4fd1ff", "#ff6fb5", "#f4efe6"),
            ("#d4ff3f", "#ff5a36", "#4fd1ff"), ("#8a6bff", "#4fd1ff", "#ff6fb5"),
            ("#ff6fb5", "#d4ff3f", "#8a6bff")]

# ---------------------------------------------------------------- generative covers
def cover(seed, kind):
    r = random.Random(seed)
    a, b, c = PALETTES[seed % len(PALETTES)]
    gid = f"g{seed}{kind}"
    out = [f'<svg class="gen" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
           f'<defs><radialGradient id="{gid}" cx="{r.randint(25,75)}%" cy="{r.randint(25,75)}%" r="80%">'
           f'<stop offset="0" stop-color="{a}" stop-opacity=".35"/><stop offset="1" stop-color="#0c0b10" stop-opacity="0"/></radialGradient></defs>'
           f'<rect width="400" height="300" fill="#15131b"/><rect width="400" height="300" fill="url(#{gid})"/>']
    if kind == "orbits":
        out.append(f'<circle cx="200" cy="150" r="34" fill="{a}" class="g-pulse"/>')
        for i, (rx, col) in enumerate([(70, b), (115, c), (160, a)]):
            out.append(f'<g class="g-orbit" style="--t:{6+i*4}s;--dir:{1 if i%2==0 else -1}">'
                       f'<circle cx="200" cy="150" r="{rx}" fill="none" stroke="#f4efe6" stroke-opacity=".14"/>'
                       f'<circle cx="{200+rx}" cy="150" r="{9-i*2}" fill="{col}"/></g>')
    elif kind == "waves":
        for i in range(6):
            amp = r.randint(12, 28)
            d = f"M-200 {70+i*32} " + " ".join(f"q 50 {-amp if k%2==0 else amp} 100 0" for k in range(8))
            out.append(f'<path d="{d}" fill="none" stroke="{[a,b,c][i%3]}" stroke-width="{3 if i%2 else 6}" stroke-linecap="round" class="g-wave" style="--t:{3+i*.6:.1f}s"/>')
    elif kind == "stack":
        for i in range(6):
            w = 220 - i * 26
            out.append(f'<rect x="{200-w/2}" y="{215-i*30}" width="{w}" height="24" rx="4" fill="{[a,b,c][i%3]}" fill-opacity="{.9-i*.1:.2f}" class="g-float" style="--d:{-i*.25:.2f}s"/>')
    elif kind == "rings":
        for i in range(5):
            out.append(f'<circle cx="200" cy="150" r="{30+i*24}" fill="none" stroke="{[a,b,c][i%3]}" stroke-width="{6-i}" class="g-ring" style="--d:{-i*.5:.1f}s"/>')
        out.append('<circle cx="200" cy="150" r="14" fill="#f4efe6"/>')
    elif kind == "burst":
        lines = "".join(f'<line x1="200" y1="150" x2="{200+170*math.cos(k*0.2618):.1f}" y2="{150+170*math.sin(k*0.2618):.1f}" stroke="{[a,b,c][k%3]}" stroke-width="{2+(k%3)}" stroke-linecap="round"/>' for k in range(24))
        out.append(f'<g class="g-orbit" style="--t:24s;--dir:1">{lines}</g><circle cx="200" cy="150" r="48" fill="#15131b"/><circle cx="200" cy="150" r="30" fill="{a}" class="g-pulse"/>')
    out.append("</svg>")
    return "".join(out)

# ---------------------------------------------------------------- live demo snippets
def demo(key):
    if key == "cube":
        return '<div class="demo demo-cube"><div class="cube">' + "".join(f'<i class="f{i}"></i>' for i in range(1, 7)) + '</div><span class="demo-cap">Real 3D transforms</span></div>'
    if key == "previz":
        return ('<div class="demo demo-previz"><div class="pv-frame"><div class="pv-world"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><i class="fig"></i></div>'
                '<span class="pv-thirds"></span><span class="pv-tag pv-tl">SHOT 03 · 35mm</span><span class="pv-tag pv-tr"><b></b> CAM A</span><span class="pv-tag pv-bl">PUSH IN · 4s</span></div>'
                '<span class="demo-cap">Camera blocking · blockout</span></div>')
    if key == "level":
        return ('<div class="demo demo-level"><div class="lv-sky"><i></i><i></i><i></i></div><div class="lv-hills"></div>'
                '<div class="lv-run"><i class="lv-plat p1"></i><i class="lv-plat p2"></i><i class="lv-coin c1"></i><i class="lv-coin c2"></i><i class="lv-crate"></i></div>'
                '<div class="lv-hero"></div><div class="lv-ground"></div><span class="lv-hud">SCORE 0420 · LV 03</span><span class="demo-cap">Level design · real-time</span></div>')
    if key == "mocap":
        return '<div class="demo demo-mocap"><canvas></canvas><span class="mc-hud">SOLVING · 120 FPS · 41 MARKERS</span><span class="demo-cap">Mocap markers → skeleton</span></div>'
    if key == "ui":
        return ('<div class="demo demo-ui"><div class="ui-card"><div class="ui-head"><i></i><i></i><i></i></div>'
                '<div class="ui-row"><b class="ui-av"></b><span class="ui-l"></span></div><div class="ui-chart">'
                + "".join(f'<b style="--h:{h}%;--i:{i}"></b>' for i, h in enumerate([35, 55, 42, 70, 62, 88])) +
                '</div><div class="ui-ok">✓ Idea explained</div></div><span class="demo-cap">Explainer animation</span></div>')
    if key == "face":
        return '<div class="demo demo-face"><div class="face"><div class="eye"><i></i></div><div class="eye"><i></i></div><div class="mouth"></div><div class="cheek l"></div><div class="cheek r"></div></div><span class="demo-cap">Eyes follow your cursor</span></div>'
    if key == "phone":
        return ('<div class="demo demo-phone demo-3d" data-scene="laptop"><canvas class="d3" aria-hidden="true"></canvas><div class="phone"><div class="screen"><div class="scroller"><span></span><span></span><span></span><span></span><span></span><span></span></div></div></div><div class="phone-shadow"></div>'
                '<span class="pd-hud gl-only">01 · REVEAL</span><span class="demo-cap">Laptop launch film · exploded view</span></div>')
    if key == "iso":
        return '<div class="demo demo-iso demo-3d" data-scene="arch"><canvas class="d3" aria-hidden="true"></canvas><div class="iso-wrap"><div class="iso">' + "".join(f'<i style="--i:{i}"></i>' for i in range(8)) + '</div></div><span class="demo-cap">Day-to-dusk archviz · live 3D</span></div>'
    if key == "logo":
        return ('<div class="demo demo-logo"><svg class="ring" viewBox="0 0 100 100"><circle pathLength="1" cx="50" cy="50" r="44"/></svg><div class="word">'
                + "".join(f'<span style="--i:{i}">{ch}</span>' for i, ch in enumerate(BRAND["short"].upper())) + '</div><span class="demo-cap">Logo reveal</span></div>')
    if key == "grid":
        return ('<div class="demo demo-grid demo-3d" data-scene="vr"><canvas class="d3" aria-hidden="true"></canvas><div class="sun"></div><div class="plane"></div><div class="gem"><i></i><i></i><i></i></div>'
                '<div class="vr-mask gl-only" aria-hidden="true"><i></i><i></i></div><span class="vr-hud gl-only">VR · STEREO · 90 Hz</span><span class="demo-cap">Stereo VR walkthrough</span></div>')
    return ""

# ---------------------------------------------------------------- shared chrome
NAV = [("index.html", "Home"), ("about.html", "About"), ("services.html", "Services"), ("industries.html", "Industries"), ("contact.html", "Contact")]

LOGO = ('<a class="logo" href="index.html" aria-label="{n} home"><span class="logo-mark" aria-hidden="true"><i></i></span>'
        '<span class="logo-word">Leo<em>Creative Studios</em></span></a>').format(n=E(BRAND["name"]))

def wa_link(text=None):
    t = text or f"Hi {BRAND['name']}, I'd like to discuss a project."
    return f"https://wa.me/{WA}?text=" + t.replace(" ", "%20").replace("'", "%27").replace(",", "%2C")

def head(title, desc, page, extra=""):
    canon = BRAND["domain"].rstrip("/") + "/" + ("" if page == "index.html" else page)
    org = {"@context": "https://schema.org", "@type": "ProfessionalService", "name": BRAND["name"], "legalName": BRAND["company"],
           "url": BRAND["domain"], "email": BRAND["email"], "description": BRAND["positioning"], "foundingDate": BRAND["since"],
           "address": [{"@type": "PostalAddress", "streetAddress": s["address"], "addressRegion": "Telangana", "addressCountry": "IN"} for s in STUDIOS]}
    if PHONE: org["telephone"] = PHONE
    site = {"email": BRAND["email"], "endpoint": BRAND["form_endpoint"], "name": BRAND["short"]}
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}"><meta property="og:type" content="website">
<meta name="theme-color" content="#0c0b10">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230c0b10'/%3E%3Ccircle cx='16' cy='17' r='8' fill='%23ff5a36'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600;800;900&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script>document.documentElement.classList.add('js');window.SITE={json.dumps(site)};</script>
<script type="application/ld+json">{json.dumps(org)}</script>
{extra}
</head>'''

def header(page):
    links = "".join(f'<a href="{h}" class="{"is-active" if h == page else ""}"><span data-hover="{t}">{t}</span></a>' for h, t in NAV)
    big = "".join(f'<a href="{h}" style="--i:{i}"><small>0{i+1}</small>{t}</a>' for i, (h, t) in enumerate(NAV))
    return f'''
<div class="wipe" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
<div class="grain" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><span class="cursor-label"></span></div><div class="cursor-dot" aria-hidden="true"></div>
<header class="nav" id="nav">
  {LOGO}
  <nav class="nav-links" aria-label="Primary">{links}</nav>
  <a class="btn btn-solid nav-cta magnetic" href="contact.html">Start a project <span class="arrow">→</span></a>
  <button class="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
</header>
<div class="menu" aria-hidden="true">
  <nav>{big}</nav>
  <div class="menu-foot"><a href="mailto:{BRAND["email"]}">{BRAND["email"]}</a><span>{BRAND["location"]}</span></div>
</div>
<main id="main">'''

def footer():
    studios = "".join(f'<div><h5>{s["label"]}</h5><p>{s["address"]}</p></div>' for s in STUDIOS)
    svc = "".join(f'<li><a href="services.html#{s["slug"]}">{s["short"]}</a></li>' for s in SERVICES)
    ind = "".join(f'<li><a href="industries.html#{i["slug"]}">{i["name"]}</a></li>' for i in INDUSTRIES)
    phone = f'<a class="footer-mail" href="tel:{PHONE.replace(" ","")}">{PHONE}</a>' if PHONE else ""
    wa = (f'<a class="wa" href="{wa_link()}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6 13.4 13.4 0 0 1-5.1-4.5c-.4-.5-1.2-1.7-1.2-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.3.5-.4.5c-.2.2-.3.4-.1.7.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.3.1.6.1.8-.1l1-1.2c.2-.3.5-.3.8-.2l2 1c.3.1.5.2.6.4.1.1.1.7-.1 1.4Z"/></svg></a>' if WA else "")
    return f'''</main>
<footer class="footer">
  <a href="contact.html" class="footer-cta" data-cursor="Let's talk">
    <span class="fc-small">Have an idea? Let's bring it to life.</span>
    <span class="fc-big"><span class="fc-track"><span>Let's create&nbsp;✦&nbsp;</span><span>Let's create&nbsp;✦&nbsp;</span><span>Let's create&nbsp;✦&nbsp;</span><span>Let's create&nbsp;✦&nbsp;</span></span></span>
  </a>
  <div class="container footer-grid">
    <div class="footer-brand">{LOGO}<p>{E(BRAND["tagline"])}</p>
      <a class="footer-mail" href="mailto:{BRAND["email"]}">{BRAND["email"]}</a>{phone}<p class="mono since">Since {BRAND["since"]}</p></div>
    <div><h4>Services</h4><ul>{svc}</ul></div>
    <div><h4>Industries</h4><ul>{ind}<li><a href="about.html">About us →</a></li></ul></div>
    <div class="footer-studios"><h4>Studios</h4>{studios}</div>
  </div>
  <div class="container footer-bottom"><span>© {YEAR} {E(BRAND["name"])} · A brand of {E(BRAND["company"])}</span><span class="legal-links"><a href="privacy.html">Privacy policy</a><a href="terms.html">Terms of use</a></span><a href="#main" class="to-top">Back to top ↑</a></div>
</footer>
{wa}
<a class="sticky-quote" href="contact.html">Start a project →</a>'''

def page(fn, title, desc, body, scripts="", extra_head="", body_class=""):
    doc = head(title, desc, fn, extra_head) + f'\n<body class="{body_class}">' + header(fn) + body + footer() + \
          '\n<script src="assets/vendor/gsap.min.js"></script>\n<script src="assets/vendor/ScrollTrigger.min.js"></script>\n<script src="assets/js/main.js"></script>\n' + ('<script src="assets/vendor/three.min.js"></script>\n' if 'three.min.js' not in scripts and 'demo-3d' in body else '') + scripts + ('\n<script src="assets/js/demos3d.js"></script>' if 'demo-3d' in body else '') + "\n</body>\n</html>\n"
    with open(os.path.join(ROOT, fn), "w", encoding="utf-8") as f:
        f.write(doc)
    print("built", fn)

VIEWFINDER = '<div class="viewfinder" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i><span class="vf-rec"><b></b> REC <span data-tc>00:00:00:00</span></span><span class="vf-meta">{meta}</span></div>'

def page_hero(kicker, title_lines, sub, extra="", meta="24 FPS · 2.39:1"):
    lines = "".join(f'<span class="line"><span data-split>{t}</span></span>' for t in title_lines)
    return f'''<section class="phero">
  {VIEWFINDER.format(meta=meta)}
  <div class="container"><p class="eyebrow reveal">{kicker}</p><h1 class="ptitle">{lines}</h1><div class="lead reveal">{sub}</div>{extra}</div>
</section>'''

def cta_band(title="Have an idea?<br><em>Let's create something amazing.</em>", sub="Every great project starts with a conversation. Tell us what you're planning, and let's explore what we can build together."):
    wa = f'<a class="btn btn-ghost btn-lg" href="{wa_link()}" target="_blank" rel="noopener">WhatsApp us</a>' if WA else '<a class="btn btn-ghost btn-lg" href="about.html">Meet the team</a>'
    return f'''<section class="cta-band"><div class="container cta-inner reveal">
  <div class="cta-blob" aria-hidden="true"></div>
  <h2 class="h2">{title}</h2><p>{sub}</p>
  <div class="row-btns"><a class="btn btn-solid btn-lg magnetic" href="contact.html">Start a project <span class="arrow">→</span></a>{wa}</div>
</div></section>'''

def client_wall(title=True, inner=False):
    tiles = "".join(f'<div class="client" style="--cbg:{c["bg"]};--i:{i}"><img src="assets/img/clients/{c["logo"]}" alt="{E(c["name"])}" loading="lazy"></div>' for i, c in enumerate(CLIENTS))
    more = '<p class="many-more reveal"><span class="mm-plus" aria-hidden="true">+</span> and many more brands</p>'
    head_html = ('<div class="sec-head"><div><p class="eyebrow">( Clients )</p><h2 class="h2 reveal">Brands that <em>trust our work.</em></h2></div>'
                 '<a class="btn btn-ghost reveal" href="contact.html">Request our portfolio →</a></div>') if title else ""
    if inner:
        return f'<div class="client-wall reveal">{tiles}</div>{more}'
    return f'<section class="section clients-sec"><div class="container">{head_html}<div class="client-wall reveal">{tiles}</div>{more}</div></section>'

def process_html():
    return "".join(f'''<article class="step"><div class="step-top"><span class="mono">FRAME {i*24:04d}</span><span class="mono">STEP {i+1}/{len(PROCESS)}</span></div>
      <div class="step-num">{i+1:02d}</div><h3>{t}</h3><p>{x}</p><div class="step-bar"><i style="--p:{(i+1)/len(PROCESS)*100:.0f}%"></i></div></article>''' for i, (t, x) in enumerate(PROCESS))

def studios_map():
    nodes = "".join(f'<g class="map-node" style="--i:{i}"><circle cx="{s["x"]}" cy="{s["y"]}" r="22" class="pulse"/><circle cx="{s["x"]}" cy="{s["y"]}" r="7"/><text x="{s["x"]+16}" y="{s["y"]-14}">{s["city"].upper()}</text></g>' for i, s in enumerate(STUDIOS))
    h, k = STUDIOS
    arcs = f'<path class="arc" d="M{h["x"]} {h["y"]} Q {(h["x"]+k["x"])/2-40} {(h["y"]+k["y"])/2-40} {k["x"]} {k["y"]}"/>'
    out = "".join(f'<path class="arc out" style="--i:{i}" d="M{h["x"]} {h["y"]} Q {h["x"]+dx/2} {h["y"]+dy/2-60} {h["x"]+dx} {h["y"]+dy}"/>' for i, (dx, dy) in enumerate([(-170, -170), (-160, 120), (200, 150)]))
    return (f'<svg viewBox="0 0 420 420" aria-label="Map of studio locations in Telangana"><defs><pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="#f4efe6" fill-opacity=".18"/></pattern></defs>'
            f'<path class="land" d="M110 80 L250 50 L340 90 L370 170 L330 250 L290 330 L200 360 L120 320 L80 240 L70 150 Z" fill="url(#dots)"/>{out}{arcs}{nodes}'
            f'<text class="map-label" x="110" y="395">TELANGANA, INDIA</text></svg>')

# ================================================================= HOME
def build_home():
    marquee_items = "".join(f'<span>{s["short"]}</span><i>✦</i>' for s in SERVICES)
    lab = "".join(f'''<a class="lab-tile reveal" href="services.html#{s["slug"]}" style="--i:{i}" data-cursor="Explore">
      {demo(s["demo"])}<div class="lab-info"><span class="mono">{i+1:02d}</span><h3>{s["short"]}</h3><p>{s["tagline"]}</p></div></a>''' for i, s in enumerate(SERVICES))
    inds = "".join(f'<a class="ind-row" href="industries.html#{d["slug"]}" data-color="{PALETTES[d["seed"]%5][0]}"><span class="mono">{i+1:02d}</span><h3>{d["name"]}</h3><p>{d["pitch"]}</p><span class="arrow">→</span></a>' for i, d in enumerate(INDUSTRIES))
    studio_cards = "".join(f'<div class="studio-card reveal"><span class="mono">0{i+1} / {s["label"]}</span><h3>{s["city"]}</h3><p>{s["address"]}</p></div>' for i, s in enumerate(STUDIOS))
    team_strip = "".join(f'<a class="team-mini reveal" href="about.html#team"><div class="team-photo" style="--c:{PALETTES[i][0]};--c2:{PALETTES[i][1]}">' + (f'<img src="assets/img/team/{m["photo"]}" alt="">' if m["photo"] else f'<span class="mono-av" aria-hidden="true">{m["name"][0]}</span>') + f'</div><div><h3>{m["name"]}</h3><p>{m["role"]}</p></div></a>' for i, m in enumerate(TEAM))

    body = f'''
<div class="loader" aria-hidden="true"><div class="loader-inner"><div class="flipbook"><i></i></div><div class="loader-count mono"><span id="lc">000</span> / 100</div><p class="mono">Rendering frames…</p></div><div class="loader-bar"><i></i></div></div>
<section class="hero" id="top">
  <canvas id="blob" aria-hidden="true"></canvas><div class="blob-fallback" aria-hidden="true"></div>
  <div class="viewfinder" aria-hidden="true"><i class="tl"></i><i class="tr"></i><i class="bl"></i><i class="br"></i><span class="vf-rec"><b></b> REC <span data-tc>00:00:00:00</span></span><span class="vf-meta">ISO 800 · 24 FPS · 2.39:1</span><span class="vf-cross"></span></div>
  <div class="container hero-inner">
    <p class="eyebrow hero-eyebrow"><span class="live-dot"></span> 3D · Unreal Engine · Game · VR studio — Hyderabad, India · Since {BRAND["since"]}</p>
    <h1 class="hero-title" aria-label="We make pixels breathe.">
      <span class="line"><span data-split>We make</span></span>
      <span class="line"><span class="outline" data-split>pixels</span><span class="hero-badge" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="circ" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"/></defs><text><textPath href="#circ">SHOWREEL · {YEAR} · PLAY · SHOWREEL · {YEAR} · PLAY ·</textPath></text></svg><b>▶</b></span></span>
      <span class="line"><span data-split>breathe.</span></span>
    </h1>
    <div class="hero-bottom">
      <p class="hero-sub">We turn ideas into extraordinary digital experiences through 3D animation, cinematic previz, game assets, motion capture and Unreal Engine VR, from the first concept to the final frame.</p>
      <div class="row-btns"><a class="btn btn-solid btn-lg magnetic" href="contact.html">Start a project <span class="arrow">→</span></a><a class="btn btn-ghost btn-lg" href="#reel" data-cursor="Play">Watch the reel</a></div>
    </div>
  </div>
  <a class="scroll-cue" href="#intro"><span>Scroll</span><i></i></a>
</section>

<section class="marquee-wrap" aria-hidden="true"><div class="marquee"><div class="mq-track">{marquee_items}{marquee_items}</div></div><div class="marquee rev"><div class="mq-track">{marquee_items}{marquee_items}</div></div></section>

<section class="section intro" id="intro"><div class="container">
  <p class="eyebrow">( Who we are )</p>
  <p class="big-statement" data-words>We are a multidisciplinary 3D production and digital experience studio based in Hyderabad. Artists, animators, developers and technology specialists under one team, taking projects from concept to completion. One team. Multiple skill sets. One shared commitment to quality.</p>
  <a class="btn btn-ghost intro-btn" href="about.html">More about us →</a>
</div></section>

<section class="section lab" id="lab"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( What we do · {len(SERVICES)} capabilities )</p><h2 class="h2 reveal">Don't take our word for it.<br><em>Everything below is animating live.</em></h2></div>
  <p class="muted reveal">No GIFs. No stock video. Every tile is built from code in your browser, with the same care we bring to your project.</p></div>
  <div class="lab-grid">{lab}</div>
</div></section>

<section class="section reel-sec" id="reel"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Showreel {YEAR} )</p><h2 class="h2 reveal">Generative reel, <em>rendered in real time.</em></h2></div><p class="muted reveal">Four scenes. Zero video files. Click to pause.</p></div>
  <div class="reel reveal" data-cursor="Pause"><canvas id="reelCanvas"></canvas>
    <div class="reel-hud"><span class="mono"><b class="rec"></b> <span id="reelScene">SC 01 — PARTICLE TYPE</span></span><span class="mono" id="reelTc">00:00:00</span></div>
    <div class="reel-prog"><i id="reelBar"></i></div><button class="reel-btn" aria-label="Play or pause reel"><span>❚❚</span></button>
    <div class="reel-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </div>
</div></section>

<section class="process" id="process"><div class="process-pin">
  <div class="container process-head"><p class="eyebrow">( How we work )</p><h2 class="h2">From first conversation <em>to final delivery.</em></h2></div>
  <div class="process-track">{process_html()}<div class="step step-end"><h3>Clear communication. Focused execution. Quality delivery.</h3><a class="btn btn-solid magnetic" href="contact.html">Start step 01 →</a></div></div>
</div></section>

<section class="showcase" id="work">
  <div class="sc-hero">
    <img class="sc-img" src="assets/img/showcase/statue-environment.jpg" alt="3D environment render by Leo Creative Studios: a monumental statue on a forested hilltop by a river">
    <div class="sc-shade" aria-hidden="true"></div>
    <div class="container sc-overlay">
      <p class="eyebrow">( Our work &amp; clients )</p>
      <h2 class="sc-title reveal">Brands that<br><em>trust our work.</em></h2>
      <p class="sc-sub">Cinematic environments, real-time worlds and 3D visuals, created by our team for brands and studios.</p>
    </div>
    <span class="sc-tag mono">Environment design · 3D render</span>
  </div>
  <div class="container sc-body">
    <div class="sc-video reveal" data-cursor="Sound">
      <video id="scVideo" src="assets/video/unreal-cinematic.mp4" poster="assets/video/unreal-cinematic-poster.jpg" muted loop playsinline preload="metadata"></video>
      <span class="sc-tag mono">Unreal Engine cinematic</span>
      <button class="sc-sound" type="button" aria-pressed="false"><span class="sc-ico" aria-hidden="true"></span><span class="sc-lbl">Sound off</span></button>
    </div>
    {client_wall(title=False, inner=True)}
    <div class="sc-cta reveal"><a class="btn btn-ghost" href="contact.html">Request our portfolio →</a></div>
  </div>
</section>

<section class="section team-home"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Meet the team )</p><h2 class="h2 reveal">The people behind <em>every frame.</em></h2></div><a class="btn btn-ghost reveal" href="about.html#team">About us →</a></div>
  <div class="team-strip">{team_strip}</div>
</div></section>

<section class="section inds" id="industries"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Industries )</p><h2 class="h2 reveal">Fluent in <em>your</em> industry.</h2></div><a class="btn btn-ghost reveal" href="industries.html">All industries →</a></div>
  <div class="ind-list">{inds}</div><div class="ind-follow" aria-hidden="true"></div>
</div></section>

<section class="section studios"><div class="container studios-grid">
  <div><p class="eyebrow">( Where we are )</p><h2 class="h2 reveal">Based in Telangana.<br><em>Open to the world.</em></h2>
    <p class="muted reveal">Our team works from Hyderabad and Hanamakonda, and collaborates with clients wherever they are. Whether you need a complete project or an experienced team to support your pipeline, we're ready to help.</p>
    <div class="studio-cards">{studio_cards}</div></div>
  <div class="map reveal">{studios_map()}</div>
</div></section>
{cta_band()}
'''
    scripts = '<script src="assets/vendor/three.min.js"></script>\n<script src="assets/js/hero.js"></script>\n<script src="assets/js/reel.js"></script>'
    loader_head = "<script>try{if(!sessionStorage.getItem('ani_seen'))document.documentElement.classList.add('show-loader')}catch(e){}</script>"
    page("index.html", f"{BRAND['name']} | 3D Animation, Unreal Engine & VR Studio in Hyderabad",
         "Leo Creative Studios is a Hyderabad 3D production studio: end-to-end 3D animation, cinematic previz, game assets, motion capture, character animation, archviz, product animation, VR and explainer videos.",
         body, scripts, loader_head, "home")

# ================================================================= ABOUT
def build_about():
    def avatar(m):
        if m["photo"]:
            return f'<img src="assets/img/team/{m["photo"]}" alt="{E(m["name"])}">'
        return f'<span class="mono-av" aria-hidden="true">{m["name"][0]}</span>'
    team = "".join(f'''<article class="team-card reveal" style="--i:{i}"><div class="team-photo" style="--c:{PALETTES[i][0]};--c2:{PALETTES[i][1]}">{avatar(m)}</div>
      <div class="team-body"><span class="mono">{m["exp"]}</span><h3>{m["name"]}</h3><p class="team-role">{m["role"]}</p><p class="muted">{m["bio"]}</p></div></article>''' for i, m in enumerate(TEAM))
    gallery = "".join(f'<figure class="sg-item reveal" style="--i:{i}"><img src="assets/img/team/studio-{n}.jpg" alt="The Leo Creative Studios team at work in the studio" loading="lazy"></figure>' for i, n in enumerate([2, 4, 3, 1]))
    depts = "".join(f'''<a class="dept reveal" href="services.html#{s["slug"]}" data-cursor="View">{demo(s["demo"])}
      <div class="dept-body"><span class="mono">{i+1:02d}</span><h3>{s["short"]}</h3><p>{s["desc"]}</p></div></a>''' for i, s in enumerate(SERVICES))
    steps = "".join(f'<li class="reveal"><span class="mono">{i+1:02d}</span><div><h3>{t}</h3><p class="muted">{x}</p></div></li>' for i, (t, x) in enumerate(PROCESS))
    culture = "".join(f'<div class="value reveal" style="--i:{i}"><span class="value-ico" aria-hidden="true"><i></i></span><h3>{t}</h3><p class="muted">{x}</p></div>' for i, (t, x) in enumerate(CULTURE))
    tech = "".join(f'<div class="tech reveal"><span class="mono">0{i+1}</span><h3>{t}</h3><p class="muted">{x}</p></div>' for i, (t, x) in enumerate(TECH))
    partners = "".join(f'<span class="chip chip-lg">{p}</span>' for p in PARTNERS)
    body = page_hero("( About us )", ["We turn ideas", "<span class='outline'>into extraordinary</span>", "digital experiences."],
        "<p>We are Leo Creative Studios, a team of creative minds, technical thinkers and passionate artists bringing ideas to life through 3D animation, game development, Unreal Engine and immersive digital experiences.</p>"
        "<p>From the first concept to the final frame, we combine creativity, technology and precision to deliver visuals and experiences that make an impact.</p>",
        f'<p class="tagline reveal">{BRAND["tagline"]}</p>', meta=f"EST. {BRAND['since']} · HYDERABAD") + f'''
<section class="section"><div class="container split">
  <div><p class="eyebrow">( Who we are )</p><h2 class="h2 reveal">A creative studio built around <em>talent, technology & teamwork.</em></h2></div>
  <div class="prose-lite reveal">
    <p>Leo Creative Studios is a multidisciplinary 3D production and digital experience studio based in Hyderabad, India.</p>
    <p>We bring together experienced artists, animators, developers, designers and technology specialists under one team to handle projects from concept to completion.</p>
    <p>Our expertise spans end-to-end 3D animation, cinematic previsualization, character animation, game environments, architectural visualization, product animation, VR experiences and real-time development.</p>
    <p>We believe great work comes from the right combination of creative thinking, technical knowledge, teamwork and attention to detail. We are a focused, energetic and execution-driven team that enjoys solving creative challenges and turning ambitious ideas into reality.</p>
    <p class="pull">One team. Multiple skill sets. One shared commitment to quality.</p>
  </div>
</div></section>

<section class="section team-sec" id="team"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Meet our core team )</p><h2 class="h2 reveal">The people leading <em>creativity, technology and business.</em></h2></div></div>
  <div class="team-grid">{team}</div>
  <div class="studio-gallery">
    <div class="sg-head"><p class="eyebrow">( Our team )</p><h3 class="sg-title reveal">The crew behind <em>every project.</em></h3></div>
    <div class="sg-grid">{gallery}</div>
  </div>
</div></section>

<section class="section"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Our capabilities )</p><h2 class="h2 reveal">A multidisciplinary team.<br><em>Complete creative capabilities.</em></h2></div>
  <p class="muted reveal">Behind Leo Creative Studios is one team of specialised artists, animators, designers and developers, bringing together expertise across the entire creative production pipeline.</p></div>
  <div class="dept-grid">{depts}</div>
  <div class="together reveal"><h3>One team. Multiple disciplines. Shared vision.</h3><p class="muted">Every specialist brings their own expertise, but our strength lies in how we work together. Whether a project needs a single specialised service or a complete end-to-end production team, we bring the right skills together to make it happen.</p><p class="pull">Different talents. Shared passion. One commitment: delivering great work.</p></div>
</div></section>

<section class="section how-sec"><div class="container split">
  <div class="sticky-col"><p class="eyebrow">( How we work )</p><h2 class="h2 reveal">From first conversation <em>to final delivery.</em></h2><p class="muted reveal">We follow a structured and collaborative approach to keep every project moving in the right direction.</p><p class="pull reveal">Clear communication. Focused execution. Quality delivery.</p></div>
  <ol class="how-list">{steps}</ol>
</div></section>

<section class="section"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Our work culture )</p><h2 class="h2 reveal">Passionate about creating.<br><em>Serious about delivering.</em></h2></div>
  <p class="muted reveal">A great creative studio is built on more than software and artistic skills. It is built on people, ownership and a shared commitment to excellence.</p></div>
  <div class="value-grid">{culture}</div>
</div></section>

<section class="section tech-sec"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Our technology & tools )</p><h2 class="h2 reveal">Powered by creative skills.<br><em>Driven by technology.</em></h2></div>
  <p class="muted reveal">We combine industry-relevant creative software and real-time technologies to build efficient production workflows, and we keep exploring better ones.</p></div>
  <div class="tech-grid">{tech}</div>
</div></section>

<section class="section"><div class="container split">
  <div><p class="eyebrow">( Who we work with )</p><h2 class="h2 reveal">Your creative <em>production partner.</em></h2></div>
  <div class="reveal"><p class="lead">We collaborate with businesses, brands, production houses, animation studios, game development companies, architects and agencies looking for reliable creative and technical expertise.</p>
  <div class="chips">{partners}</div>
  <p class="muted partner-note">Whether you need a complete project delivered from concept to completion or an experienced team to support your existing production pipeline, we are ready to collaborate.</p></div>
</div></section>
{client_wall(title=False)}
{cta_band("Have an idea?<br><em>Let's build something extraordinary together.</em>", "Tell us what you're planning, what you're building or what creative challenge you're trying to solve. Our team is ready to explore the possibilities.")}'''
    page("about.html", f"About Us | {BRAND['name']}", "Meet Leo Creative Studios: a multidisciplinary 3D production and digital experience studio in Hyderabad. Our team, capabilities, process, culture and tools.", body)

# ================================================================= SERVICES
def build_services():
    chips = "".join(f'<a class="chip chip-lg" href="#{s["slug"]}">{s["short"]}</a>' for s in SERVICES)
    rows = "".join(f'''<article class="svc reveal {'flip' if i%2 else ''}" id="{s["slug"]}">
  <div class="svc-stage">{demo(s["demo"])}</div>
  <div class="svc-body"><span class="mono svc-idx">{i+1:02d} / {len(SERVICES):02d}</span><h2>{s["name"]}</h2><p class="svc-tag">{s["tagline"]}</p><p class="muted">{s["desc"]}</p>
    <ul class="ticks">{''.join(f'<li>{d}</li>' for d in s["deliverables"])}</ul>
    <div class="tools"><span class="tools-label mono">Built with</span>{''.join(f'<span class="chip">{t}</span>' for t in s["tools"])}</div>
    <a class="btn btn-solid magnetic" href="contact.html?service={s["slug"]}">Discuss a {s["short"]} project →</a></div>
</article>''' for i, s in enumerate(SERVICES))
    body = page_hero("( Services )", ["Every frame.", "<span class='outline'>One team.</span>"],
                     "<p>Nine disciplines, one connected production workflow. Each demo on this page is a live animation built in code, a small taste of what we'll make for you.</p>",
                     f'<div class="chips reveal">{chips}</div>') + f'''
<section class="section"><div class="container svc-list">{rows}</div></section>
{client_wall()}{cta_band()}'''
    page("services.html", f"Services | 3D Animation, Previz, Game Assets, Mocap & VR | {BRAND['name']}",
         "End-to-end 3D animation, cinematic previz, game level design and assets, motion capture data solving, character animation, architectural visualization, product animation, VR walkthroughs and explainer videos.", body)

# ================================================================= INDUSTRIES
def build_industries():
    def client_badge(d):
        c = CLIENT.get(d.get("client", ""))
        if not c: return ""
        return f'<div class="ind-client"><span class="mono">Worked with</span><span class="client mini" style="--cbg:{c["bg"]}"><img src="assets/img/clients/{c["logo"]}" alt="{E(c["name"])}"></span></div>'
    cards = "".join(f'''<article class="ind-card" id="{d["slug"]}" style="--top:{90 + i*14}px;--accent:{PALETTES[d["seed"]%5][0]}">
  <div class="ind-card-inner"><div class="ind-art">{cover(d["seed"], d["kind"])}<span class="mono ind-no">{i+1:02d} / {len(INDUSTRIES):02d}</span></div>
  <div class="ind-body"><p class="eyebrow">{d["name"]}</p><h2>{d["pitch"]}</h2><p class="muted">{d["desc"]}</p>
  <div class="ind-cols"><div><h4>What we make</h4><ul class="ticks">{''.join(f'<li>{u}</li>' for u in d["uses"])}</ul></div>
  <div><h4>Recommended services</h4><div class="tools">{''.join(f'<a class="chip" href="services.html#{sl}">{SVC[sl]["short"]}</a>' for sl in d["services"])}</div>{client_badge(d)}</div></div>
  <a class="btn btn-solid magnetic" href="contact.html">Discuss a {d["name"].split(" ")[0]} project →</a></div></div>
</article>''' for i, d in enumerate(INDUSTRIES))
    ticker = "".join(f'<span>{d["name"]}</span><i>✦</i>' for d in INDUSTRIES)
    body = page_hero("( Industries we serve )", ["Fluent in", "<span class='outline'>your world.</span>"],
                     "<p>We learn your audience, your product and your goals, then create 3D visuals and experiences that fit them.</p>") + f'''
<section class="marquee-wrap" aria-hidden="true"><div class="marquee"><div class="mq-track">{ticker}{ticker}</div></div></section>
<section class="section"><div class="container ind-stack">{cards}</div></section>
{cta_band("Don't see your industry?", "If it can be explained, sold or imagined, we can bring it to life in 3D. Tell us about your project.")}'''
    page("industries.html", f"Industries We Serve | {BRAND['name']}",
         "3D animation and visualisation for EdTech, healthcare, real estate, food & tech, manufacturing and media & gaming.", body)

# ================================================================= CONTACT
def build_contact():
    opts = "".join(f'<option value="{s["form"]}" data-slug="{s["slug"]}">{s["form"]}</option>' for s in SERVICES) + '<option value="Other / Collaboration">Other / Collaboration</option>'
    cards = [("mail", "Email", f'<a href="mailto:{BRAND["email"]}">{BRAND["email"]}</a>')]
    if PHONE:
        cards.append(("phone", "Phone / WhatsApp", f'<a href="tel:{PHONE.replace(" ","")}">{PHONE}</a>'))
    cards.append(("pin", "Location", BRAND["location"]))
    cards.append(("clock", "Business hours", f'{BRAND["hours"]}<br><span class="open-line"><span class="open-dot"></span><span class="open-txt"></span></span>'))
    icons = {"mail": '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>', "phone": '<path d="M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2"/>',
             "pin": '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>', "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'}
    info = "".join(f'<div class="info-card reveal" style="--i:{i}"{" data-hours" if k=="clock" else ""}><span class="info-ico"><svg viewBox="0 0 24 24">{icons[k]}</svg></span><h3>{t}</h3><p>{v}</p></div>' for i, (k, t, v) in enumerate(cards))
    studios = "".join(f'<div class="studio-card reveal"><span class="mono">0{i+1} / {s["label"]}</span><h3>{s["city"]}</h3><p>{s["address"]}</p></div>' for i, s in enumerate(STUDIOS))
    wa = f'<a class="btn btn-ghost" href="{wa_link()}" target="_blank" rel="noopener">Chat on WhatsApp</a>' if WA else ""
    body = f'''<section class="contact phero">{VIEWFINDER.format(meta="SCENE 01 · TAKE 01")}
<div class="container">
  <p class="eyebrow">( Contact us )</p>
  <h1 class="ptitle"><span class="line"><span data-split>Let's create</span></span><span class="line"><span data-split class="outline">something amazing</span></span><span class="line"><span data-split>together.</span></span></h1>
  <div class="lead reveal"><p>Have a project in mind? Looking for a creative production partner, or need a skilled team to bring your ideas to life?</p><p>We'd love to hear from you. Tell us about your project, and let's explore what we can create together.</p></div>
</div></section>

<section class="section get-in-touch"><div class="container">
  <div class="sec-head"><div><p class="eyebrow">( Get in touch )</p><h2 class="h2 reveal">General & <em>project enquiries.</em></h2></div><p class="muted reveal">Have questions about our services or want to discuss a project? Reach out to our team.</p></div>
  <div class="info-grid n{len(cards)}">{info}</div>
</div></section>

<section class="section form-sec" id="enquiry"><div class="container form-grid">
  <div class="form-side"><p class="eyebrow">( Send an enquiry )</p><h2 class="h2 reveal">Tell us about <em>your project.</em></h2>
    <p class="muted reveal">Have an idea, requirement or collaboration opportunity? Share a few details with us and our team will get back to you.</p>
    <div class="studio-cards reveal">{studios}</div>{wa}</div>
  <form class="enquiry reveal" id="enquiryForm" novalidate>
    <div class="fields">
      <label class="field"><span>Full name *</span><input id="f-name" name="name" required autocomplete="name"></label>
      <label class="field"><span>Company / organisation</span><input id="f-company" name="company" autocomplete="organization"></label>
      <label class="field"><span>Email address *</span><input id="f-email" name="email" type="email" required autocomplete="email"></label>
      <label class="field"><span>Contact number</span><input id="f-phone" name="phone" type="tel" autocomplete="tel"></label>
      <label class="field full"><span>Type of project *</span><select id="f-type" name="type" required><option value="">Select a project type…</option>{opts}</select></label>
      <label class="field"><span>Project budget</span><input id="f-budget" name="budget" placeholder="Approximate budget, if known"></label>
      <label class="field"><span>Project timeline</span><input id="f-timeline" name="timeline" placeholder="When do you need it?"></label>
      <label class="field full"><span>Tell us about your project *</span><textarea id="f-message" name="message" rows="5" required placeholder="What are you planning? Goals, references, deliverables…"></textarea></label>
    </div>
    <p class="form-note" role="status"></p>
    <div class="form-foot"><button type="submit" class="btn btn-solid btn-lg magnetic">Send enquiry →</button><p class="muted small-note">We'll review your requirements and get back to you as soon as possible.</p></div>
    <div class="wz-done" hidden><svg viewBox="0 0 80 80"><circle pathLength="1" cx="40" cy="40" r="34"/><path pathLength="1" d="M25 41 L36 52 L56 30"/></svg><h3>Thank you!</h3><p class="muted" id="doneMsg">Your enquiry has been sent. Our team will get back to you.</p><button type="button" class="btn btn-ghost" id="againBtn">Send another enquiry</button></div>
    <canvas class="confetti" aria-hidden="true"></canvas>
  </form>
</div></section>

<section class="section closing"><div class="container closing-inner reveal">
  <p class="eyebrow">( Have a creative challenge? )</p>
  <h2 class="h2">Let's turn your vision into <em>something extraordinary.</em></h2>
  <p class="lead">Whether it's a new project, a production partnership or a creative collaboration, we're always open to connecting with great people and ideas.</p>
  <p class="sign"><b>{BRAND["name"]}</b><span>{BRAND["tagline"]}</span></p>
</div></section>'''
    page("contact.html", f"Contact Us | {BRAND['name']}", "Tell us about your 3D animation, previz, game, VR or explainer video project. Leo Creative Studios, Hyderabad, Telangana.", body, body_class="contact-page")

# ================================================================= LEGAL
def legal(fn, title, sections):
    parts = "".join(f"<h2>{h}</h2>" + "".join(f"<p>{p}</p>" if not p.startswith("- ") else f"<ul class='ticks'>{''.join(f'<li>{x[2:]}</li>' for x in p.split(chr(10)))}</ul>" for p in ps) for h, ps in sections)
    body = f'''<section class="legal"><div class="container legal-wrap">
  <p class="eyebrow">( Legal )</p><h1 class="post-title">{title}</h1>
  <p class="mono legal-date">Last updated: {datetime.date.today().strftime("%d %B %Y")}</p>
  <div class="prose">{parts}</div>
</div></section>'''
    page(fn, f"{title} | {BRAND['name']}", f"{title} for {BRAND['name']}, a brand of {BRAND['company']}.", body)

def build_legal():
    co, br, em = BRAND["company"], BRAND["name"], BRAND["email"]
    legal("privacy.html", "Privacy policy", [
        ("Who we are", [f"This website is operated by {co} (\"we\", \"us\"), which runs the brand {br}. We are based in Telangana, India. If you have any question about this policy, write to {em}."]),
        ("What we collect", ["We only collect the information you choose to give us, mainly through the enquiry form or when you email or message us:",
            "- Your name, email address and contact number\n- Your company or organisation\n- Details about your project, budget and timeline\n- Any files or references you send us"]),
        ("How we use it", ["We use this information to reply to your enquiry, prepare proposals and quotes, deliver projects you engage us for, and keep records required for invoicing and tax. We do not sell or rent your personal information."]),
        ("Cookies and analytics", ["This website does not use advertising or analytics cookies. Your browser may store small technical settings (for example, whether the intro animation has already played) that never leave your device."]),
        ("Sharing", ["We share your information only with service providers we use to run our business (such as email and file-sharing services), with team members working on your project, or when the law requires it."]),
        ("Retention and security", ["We keep enquiry information for as long as needed to respond and for any project that follows, and project records for as long as the law requires. We take reasonable steps to protect your information, but no method of transmission over the internet is completely secure."]),
        ("Your choices", [f"You can ask us to access, correct or delete the personal information we hold about you by writing to {em}. We will respond within a reasonable time, in line with India's Digital Personal Data Protection Act, 2023 and other applicable laws."]),
        ("Changes", ["We may update this policy from time to time. The date at the top of this page shows when it was last changed."]),
    ])
    legal("terms.html", "Terms of use", [
        ("About these terms", [f"These terms apply to your use of this website, operated by {co} for the brand {br}. By using the site, you agree to them."]),
        ("Our content", [f"All text, animations, code, designs and other material on this website belong to {co} or to the clients and partners who have given us permission to show their work. You may view and share links to the site, but you may not copy, reuse or sell its content without our written permission."]),
        ("Client logos and work", ["Client names and logos are shown with permission and remain the property of their respective owners."]),
        ("Enquiries and projects", ["Information on this website is for general guidance only and is not an offer or a quote. Every project is governed by a separate written proposal or agreement, which sets out the scope, timeline, fees and ownership of deliverables."]),
        ("Liability", ["We work to keep this website accurate and available, but we provide it \"as is\" and are not liable for any loss arising from your use of it or from links to third-party websites."]),
        ("Governing law", ["These terms are governed by the laws of India, and the courts of Hyderabad, Telangana have jurisdiction over any dispute."]),
        ("Contact", [f"Questions about these terms? Write to {em}."]),
    ])

if __name__ == "__main__":
    for f in glob.glob(os.path.join(ROOT, "blog*.html")):   # blog removed
        os.remove(f)
    build_home(); build_about(); build_services(); build_industries(); build_contact(); build_legal()
