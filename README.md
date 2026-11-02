# Leo Creative Studios — website

Static, multi-page website for **Leo Creative Studios** (3D animation, Unreal Engine & VR studio, Hyderabad).
Plain HTML, CSS and JavaScript with live animations built in code (GSAP, Three.js). No build server, database or backend needed.

## Clone

```bash
git clone https://github.com/kkv2495/animora.git
cd animora
```

Open `index.html` in a browser to view it locally.

## Pages
- `index.html` — Home: WebGL hero, 9 live capability demos, generative showreel, process, showcase image + Unreal cinematic, client logos, team, industries, studios map
- `about.html` — About us: core team with portraits, studio photos, capabilities, process, culture, tools
- `services.html` — 9 services, each with a live animation (3 are real-time 3D scenes)
- `industries.html` — 6 industries with client logos
- `contact.html` — contact details and enquiry form
- `privacy.html`, `terms.html` — basic legal pages (have them reviewed before launch)

## Host it on GitHub Pages (from another GitHub account)
1. Create a new **public** repository on that account (for example `leo-website`) and push this code to it:
   ```bash
   git remote set-url origin https://github.com/<that-account>/<repo-name>.git
   git push -u origin main
   ```
2. In that repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
3. After a minute the site is live at `https://<that-account>.github.io/<repo-name>/`.
4. Custom domain (`www.leocreativestudios.com`): enter it under **Settings → Pages → Custom domain**, then add the DNS records GitHub shows at your domain registrar, and tick **Enforce HTTPS** once it is available.

The `.nojekyll` file is included so GitHub Pages serves every file as-is.

You can also host it on Netlify, Vercel or any web host by uploading the folder contents.

## Editing content
All text, services, industries, team, clients and contact details live in **`_source/content.py`**. After editing, rebuild the pages:

```bash
python3 _source/build.py
```

Then commit and push; GitHub Pages republishes automatically.

Before launch: confirm the enquiry email (`info@leocreativestudios.com`), add a phone/WhatsApp number in `content.py` (the WhatsApp button appears once set), and update team portraits in `assets/img/team/` if needed.

## Contact form
Without a form service, the enquiry form opens the visitor's email app with the brief pre-filled. To receive enquiries directly, set `form_endpoint` in `content.py` to a Formspree (or similar) URL and rebuild.

## Files
- `assets/css/style.css` — design tokens, layout and all CSS animations
- `assets/js/main.js` — cursor, page transitions, scroll effects, demos, forms
- `assets/js/hero.js` — Three.js hero blob · `assets/js/reel.js` — canvas showreel · `assets/js/demos3d.js` — real-time 3D service thumbnails
- `assets/vendor/` — GSAP, ScrollTrigger and Three.js (bundled locally)
- `assets/img/`, `assets/video/` — client logos, showcase image, team photos, cinematic video
