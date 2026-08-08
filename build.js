// Regenerates the GENERATED DATA block inside index.html from the source
// JSON files in data/ (route.json, alerts.json, crossings.json, food.json,
// boat_*.json, bus_*.json), so editing the JSON is enough -- no manual
// re-copying into the HTML.
//
// Run it from the repo folder:
//   node build.js
//
// crossings.json is the only hand-maintained mapping (which boat/bus file
// backs which segment(s), referenced by segment id); everything else
// (waypoints, legs, alerts) is derived automatically from route.json /
// alerts.json.

const fs = require("fs");
const path = require("path");

const repoRoot = __dirname;
const dataDir = path.join(repoRoot, "data");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));

const route = readJson("route.json");
const alertsFile = readJson("alerts.json");
const crossingDefs = readJson("crossings.json");
const foodFile = readJson("food.json");
const planFile = readJson("plan.json");
const gpxDir = path.join(repoRoot, "gpx");
const gpxFiles = fs.existsSync(gpxDir)
  ? fs.readdirSync(gpxDir)
      .filter((name) => name.toLowerCase().endsWith(".gpx"))
      .reduce((obj, name) => {
        obj[name] = fs.readFileSync(path.join(gpxDir, name), "utf8");
        return obj;
      }, {})
  : {};

const buildTimestamp = Date.now();
const cacheName = `kungsleden-cache-v${buildTimestamp}`;

const swPath = path.join(repoRoot, "sw.js");
const swContents = `const CACHE_NAME = "${cacheName}";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("./");
          }
        });
    })
  );
});
`;
fs.writeFileSync(swPath, swContents, "utf8");

const manifestPath = path.join(repoRoot, "manifest.json");
const manifestJson = {
  name: "Kungsleden Companion",
  short_name: "Kungsleden",
  start_url: "./",
  display: "standalone",
  background_color: "#f7f6f3",
  theme_color: "#1f2420",
  icons: [
    {
      src: "./icon.svg",
      sizes: "192x192",
      type: "image/svg+xml"
    }
  ]
};
fs.writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2) + "\n", "utf8");

const iconPath = path.join(repoRoot, "icon.svg");
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="32" fill="#1f2420" />
  <path d="M48 136 L96 56 L144 136 Z" fill="#f7f6f3" />
  <circle cx="96" cy="104" r="12" fill="#1f2420" />
</svg>
`;
fs.writeFileSync(iconPath, iconSvg, "utf8");

const legs = [...route.segments]
  .sort((a, b) => a.order - b.order)
  .map((seg) => ({
    ...seg,
    shelters: seg.shelters || [],
    crossing_ids: crossingDefs
      .filter((def) => def.segment_ids.includes(seg.id))
      .map((def) => def.id),
  }));

const crossings = crossingDefs.map((def) => ({
  id: def.id,
  label: def.label,
  subtitle: def.subtitle,
  related_alert_id: def.related_alert_id || null,
  data: readJson(def.file),
}));

const dataBlock = `
  const waypoints = ${JSON.stringify(route.waypoints, null, 2)};

  const alertsData = ${JSON.stringify(alertsFile.alerts, null, 2)};

  const crossings = ${JSON.stringify(crossings, null, 2)};

  const legs = ${JSON.stringify(legs, null, 2)};

  const foodShops = ${JSON.stringify(foodFile.shops, null, 2)};

  const plan = ${JSON.stringify(planFile, null, 2)};

  const gpxFiles = ${JSON.stringify(gpxFiles, null, 2)};
`;

const htmlPath = path.join(repoRoot, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

if (!html.includes('<link rel="manifest" href="./manifest.json">')) {
  html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n  <link rel="manifest" href="./manifest.json">\n  <meta name="theme-color" content="#1f2420">'
  );
}

const swRegistration = `
<script>
  // Service worker registration. Skip silently when opened from file://.
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
</script>
`;

if (!html.includes('navigator.serviceWorker.register("./sw.js")')) {
  html = html.replace('</body>', swRegistration + '</body>');
}

const startMarker = "// ===== GENERATED DATA: START (produced by build.js -- do not hand-edit, run `node build.js` instead) =====";
const endMarker = "// ===== GENERATED DATA: END =====";
const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1) {
  throw new Error("Could not find the GENERATED DATA markers in index.html -- has the file structure changed?");
}

const newHtml =
  html.slice(0, startIdx + startMarker.length) +
  "\n" + dataBlock + "\n  " +
  html.slice(endIdx);

fs.writeFileSync(htmlPath, newHtml, "utf8");

console.log(
  `index.html regenerated: ${route.waypoints.length} waypoints, ${legs.length} legs, ` +
  `${alertsFile.alerts.length} alert(s), ${crossings.length} crossing(s), ${foodFile.shops.length} food shop(s).`
);
