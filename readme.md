# Kungsleden Companion

https://raugas-local.github.io/Kungsleden/pilot-brief.html

An offline-first travel companion for hiking the Kungsleden trail (Kvikkjokk
to Abisko, south to north). Built as a static site, deployable on GitHub
Pages, designed to keep working with no signal in the mountains.

## Status

Early stage. Route and reference data are in place; the app itself is a
small pilot proving out the UI approach before the full build.

## What's in this repo

| File | Contents |
|---|---|
| `route.json` | Full south-to-north waypoint and segment list: distances, ascent/descent, shop availability, alt names, emergency shelters |
| `alerts.json` | Trip-critical warnings the app must surface prominently (e.g. transport gaps), separate from ordinary reference notes |
| `boat_aktse_laitaure.json` | Aktse <-> Laitaure boat crossing: schedule, price, contact |
| `boat_sitojaure_svijnne.json` | Sitojaure <-> Svijnne boat crossing: schedule, price, contact |
| `boat_teusajaure_vakkotavare.json` | Teusajaure <-> Vakkotavare (Dievssajavri) boat crossing |
| `boat_kebnats_saltoluokta.json` | Kebnats <-> Saltoluokta boat crossing (M/S Langas), official STF timetable |
| `bus_vakkotavare_kebnats.json` | The critical Vakkotavare -> Kebnats bus connection, including a known 2026 scheduling gap |
| `pilot-brief.md` | Scope and design spec for the small pilot page (navigation, badge set, print/PDF export) |

All data is in English, including place names left as-is (Swedish/Sami
toponyms are not translated). Each data file records its source URL and the
date it was last checked, since mountain transport schedules and prices
change between seasons.

## Tech stack

- Plain HTML/CSS/JS, no build step, no framework
- Static JSON data files, fetched client-side
- Designed to become an installable PWA (offline caching, no GPS/map yet
  in the current pilot)

## Running it locally

Just open the HTML file directly in a browser, or serve the folder with
any static file server, e.g.:

```
python -m http.server
```

## Deploying to GitHub Pages

Repo Settings -> Pages -> Source: Deploy from a branch -> `main` / `(root)`.
Note: GitHub Pages is free only for public repositories; private repos
require a paid GitHub plan, or an alternative like Netlify/Cloudflare Pages.

## Data accuracy and safety note

Boat/bus schedules, prices, and contact details were gathered from official
operator and STF sources but **can change between seasons**. Before relying
on any crossing, especially the Vakkotavare -> Kebnats bus connection
flagged in `alerts.json`, re-check the linked source close to your travel
date.

## Roadmap

- [ ] Offline map with GPX track and GPS position
- [ ] Journal / packing checklist (local device storage)
- [ ] Full PWA install + service worker caching
- [ ] Print/PDF stylesheet for a paper backup
