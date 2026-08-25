# autonomousgreenhouse.ai

Publieke marketing/build-log-site voor het kasproject. Volledig losstaand van
de `kas`-server/repo — een statische site zonder build-stap: gewoon HTML, CSS
en vanilla JS.

## Lokaal bekijken

Open `index.html` direct in de browser, of start een simpele static server
vanuit deze map:

```
python3 -m http.server 8080
```

en ga naar `http://localhost:8080`.

## Structuur

```
index.html    alle pagina-secties (nav, hero, live-scene, AI-analyse,
              how-it-works, build-log, future/CTA + signup)
css/style.css alle styling, design tokens (kleuren/typografie/spacing)
              als CSS-variabelen boven in het bestand
js/main.js    ticker- en live-scene-simulatie, interesse-chips, signup-
              mailto-flow
```

## Deployen

Geen build-stap nodig — deze map kan direct naar elke static host:

- **Netlify / Vercel**: map (of repo) koppelen, geen build command instellen.
- **GitHub Pages**: deze map als root van een repo/branch pushen en Pages
  aanzetten.

## Live data (later)

De ticker en de live-scene tonen nu **gesimuleerde** preview-waardes
(zelfde formules als het oorspronkelijke design). In `js/main.js` staat dit
achter één functie, `getLiveSnapshot()`, met een `// TODO: live data`
markering. Zodra `kas-server` een publieke, CORS-open, read-only endpoint
krijgt (bv. `GET /api/public/status`), is de enige aanpassing: de body van
die functie vervangen door een `fetch()` naar dat endpoint met dezelfde
return-vorm (`{ temp, hum, roofOpen, flapAngle, waterOn }`). De rest van de
pagina hoeft niet aangepast te worden.

**Let op**: `kas-server` heeft momenteel geen CORS en geen authenticatie op
zijn API — de control-endpoints (dakraam/water aan/uit) mogen nooit publiek
bereikbaar worden. Alleen een apart, read-only endpoint zou hiervoor in
aanmerking komen, en dat moet nog ontworpen worden.

## Signup

De "stay in the loop"-sectie valideert het e-mailadres en opent
`mailto:hello@autonomousgreenhouse.ai` met een vooraf ingevulde
onderwerp/body (interesse-keuze + e-mail) — er is nog geen echte backend.
Vervang dit later door een API-route naar bv. Resend/Buttondown/Supabase als
je een echte mailinglijst wilt.

## Foto's

Drie plekken zijn nu placeholders (gestippelde box met bijschrift):
hero-foto van de serre, een wiring/hardware-foto, en een dashboard-
screenshot. Vervang de `<div class="img-placeholder">` op die plekken door
een `<img src="...">` zodra je de foto's hebt.
