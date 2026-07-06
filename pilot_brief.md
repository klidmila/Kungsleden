Kungsleden Companion — pilot page (brief)

Goal

A small, purely demonstrative piece. The goal is not to build the app, but to
show on a small data sample what this can look like and do -- before we start
on the full PWA.

Scope (deliberately small)


Use just a short stretch of the route around Vakkotavare (segments #7-#9
from route.json: Sitojaure -> Saltoluokta -> Vakkotavare), not the whole
route
Show it as a simple list of legs: from-to, distance, ascent/descent
Show one specific alert from alerts.json (the Vakkotavare -> Kebnats
bus schedule gap) as a clearly distinct warning banner -- this is the best
demonstration that the app can pull a critical piece of information out of
the data instead of burying it in ordinary text


Out of scope for this pilot (for now)


No offline map, no GPS, no GPX
No on-device data storage (journal, checklist)
No PWA installation
Not the whole route, just this one sample


Data


A small, hand-picked slice of route.json (waypoints + segments #7-#9)
One entry from alerts.json (vakkotavare_kebnats_bus_gap_sep2026)


Technical


A single standalone HTML file (CSS + JS inline), no build step
Can be opened directly in a browser, later uploaded to GitHub Pages unchanged


Language


UI text in English
The underlying data stays in English too, as already agreed -- the page
just selects and displays a slice of it


Definition of done

You see: a short list of legs + one clearly distinct warning banner. Nothing more.

Badge set (compact pills on every card)

Show all applicable badges, always -- no filtering, no hiding "boring" ones.
Small pills, 11px font, border-radius: 999px, one row that wraps.

Waypoint (hut) badges

BadgeSource fieldhut / crossing pointwaypoint.typeno shop / small shop / large shop / full shopwaypoint.shop.sizepower / no powerwaypoint.shop.electricityalt name (click-through to alt_names list)waypoint.alt_names.length > 0

Leg/segment badges

BadgeSource fieldhike / boatsegment.typeX kmsegment.distance_km↑X msegment.ascent_m↓X msegment.descent_mlake: Name (boat legs only)segment.lakesheltersegment.shelters.length > 0⚠ alert (red/danger color)segment.critical_alert_id present

Nested objects (like season.regular_timetable) never render as badges or
inline key-value dumps -- those stay on the detail/sub-detail page as a
proper small table (see navigation structure above).

Navigation

Bottom tab bar, 3 tabs: itinerary (default), alerts (red badge = count of
unresolved alerts), crossings (list of all boat_.json / bus_.json as cards).
Leg detail pages still drill through to a specific alert/contact contextually
-- same destination pages, just reached a second way.

Print / PDF export

Use the browser's native print (Ctrl+P / Save as PDF), not a JS library --
works fully offline since it's just CSS, no extra weight in the app.
Add a @media print stylesheet covering itinerary + alerts + crossings:
hide the tab bar and any buttons, keep text readable on paper.
Intended use: the person prints/saves this to PDF once, while they still
have signal, as a paper backup before heading into the mountains -- not
something meant to run without connectivity for the first time out there.