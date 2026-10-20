# The Isle of Alderwake — Cartographer's Table

An antique chart of an imaginary island, laid out on a dark wooden map table. The parchment map is the main object: five hand-drawn regions, a graticule, a compass rose, sea names and a survey camp, with a field journal for the working notes.

## Features

- Interactive SVG island chart with five clickable, keyboard-focusable regions
- Region surveys with lore, resources and approach notes
- Place waypoints anywhere on the chart, name them, find them again and remove them
- Navigation compass with live bearing and distance from the survey camp
- Cursor latitude and longitude readout plus a chart scale and graticule
- Toggleable place names and latitude/longitude grid
- Searchable gazetteer across region names, kinds, resources and lore
- Expedition log recording surveys, waypoints and notes
- Per-region surveyor's notes with autosave
- localStorage persistence for waypoints, notes, expedition log and display settings
- Responsive layout with a pannable large map on narrow screens, keyboard tab navigation, visible focus states and reduced-motion support
- All map artwork drawn with inline SVG and CSS; no external images

## Files

- `index.html` — page structure, chart drawing and journal markup
- `styles.css` — parchment and wood textures, chart styling and responsive layout
- `app.js` — region data, waypoint placement, compass, gazetteer, notes, log and localStorage
- `README.md` — this file

## Running it

There is no build step and nothing to install. Open `index.html` in a browser, or serve the folder with any static file server.

Live demo: https://ayo-2010.github.io/cartographer/
