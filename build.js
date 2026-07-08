// Regenerates the GENERATED DATA block inside index.html from the source
// JSON files (route.json, alerts.json, crossings.json, boat_*.json,
// bus_*.json), so editing the JSON is enough -- no manual re-copying into
// the HTML.
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
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(repoRoot, name), "utf8"));

const route = readJson("route.json");
const alertsFile = readJson("alerts.json");
const crossingDefs = readJson("crossings.json");

const legs = [...route.segments]
  .sort((a, b) => a.order - b.order)
  .map((seg) => ({
    id: seg.id,
    order: seg.order,
    type: seg.type,
    from: seg.from,
    from_id: seg.from_id,
    to: seg.to,
    to_id: seg.to_id,
    distance_km: seg.distance_km,
    ascent_m: seg.ascent_m,
    descent_m: seg.descent_m,
    notes: seg.notes,
    camping_good: seg.camping_good,
    camping_risky: seg.camping_risky,
    lake: seg.lake || null,
    shelters: seg.shelters || [],
    latrine: seg.latrine || false,
    critical_alert_id: seg.critical_alert_id,
    crossing_ids: crossingDefs
      .filter((def) => def.segment_ids.includes(seg.id))
      .map((def) => def.id),
  }));

const crossings = crossingDefs.map((def) => ({
  id: def.id,
  label: def.label,
  subtitle: def.subtitle,
  data: readJson(def.file),
}));

const dataBlock = `
  const waypoints = ${JSON.stringify(route.waypoints, null, 2)};

  const alertsData = ${JSON.stringify(alertsFile.alerts, null, 2)};

  const crossings = ${JSON.stringify(crossings, null, 2)};

  const legs = ${JSON.stringify(legs, null, 2)};
`;

const htmlPath = path.join(repoRoot, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

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
  `${alertsFile.alerts.length} alert(s), ${crossings.length} crossing(s).`
);
