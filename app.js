const REGIONS = {
  cinder: {
    name: "Cinder Peaks",
    title: "The Cinder Peaks",
    kind: "Highland",
    anchor: { x: 555, y: 190 },
    lede: "Black basalt teeth rise out of a warm, shallow sea. Sulphur vents stitch the ridgelines with yellow, and on still nights the peaks are said to breathe. The old survey marks stop well short of the summit.",
    resources: ["Obsidian", "Sulphur", "Iron ochre", "Hot springs"],
    approach: "Follow the drovers' road north from camp, then take the switchbacks above the tree line. Allow two days and carry water."
  },
  wraithwood: {
    name: "Wraithwood",
    title: "Wraithwood",
    kind: "Old forest",
    anchor: { x: 335, y: 380 },
    lede: "A tide-fed forest of blackwood and hanging moss. Fog arrives with the afternoon and does not leave until the next ebb. Sound carries strangely beneath the canopy, and the oldest trees are not marked on any timber survey.",
    resources: ["Blackwood", "Pine resin", "Cave mushrooms", "Charcoal"],
    approach: "Enter from the western shore at low water. The eastern path is firmer, but the boardwalks are rotten beyond the third creek."
  },
  hollow: {
    name: "Hollow Downs",
    title: "Hollow Downs",
    kind: "Chalk upland",
    anchor: { x: 700, y: 370 },
    lede: "Wind-scoured chalk rolls inland from the woods. Old boundary stones and the foundations of a vanished abbey break the grass. Shepherds winter here, though none will explain the empty chapel on the eastern slope.",
    resources: ["Chalk", "Barley", "Old stone", "Grazing"],
    approach: "An easy climb from the survey camp by the old road. The northern gullies flood after rain, so cross above the windmill."
  },
  saltmere: {
    name: "Saltmere",
    title: "Saltmere Fen",
    kind: "Salt marsh",
    anchor: { x: 475, y: 565 },
    lede: "A brackish fen threaded with reed channels and peat islands. The water is too salt for crops and too shallow for boats, so the fen is crossed on foot at low tide. The eel nets are checked by a family who claim no village.",
    resources: ["Sea salt", "Peat", "Reed", "Eels"],
    approach: "Take the southern path from camp and follow the withy poles. Do not cross the pale grass: it is a raft of weed over deep water."
  },
  ember: {
    name: "Ember Cape",
    title: "Ember Cape",
    kind: "Coastal cape",
    anchor: { x: 790, y: 535 },
    lede: "Rust-coloured cliffs turn to fire at sunset. A lighthouse has been kept on the cape for two centuries, though no chart agrees on who built it. The keeper's cottage is warm, tidy, and always short of one chair at supper.",
    resources: ["Copper", "Driftwood", "Gull eggs", "Fresh water"],
    approach: "The coast track is passable at low tide. At high water, climb through the downs and approach the light from the landward side."
  }
};

const STORAGE_WAYPOINTS = "cartographer.waypoints.v1";
const STORAGE_NOTES = "cartographer.notes.v1";
const STORAGE_LOG = "cartographer.expeditionLog.v1";
const STORAGE_SETTINGS = "cartographer.settings.v1";
const SVG_NS = "http://www.w3.org/2000/svg";
const BASE_CAMP = { name: "Survey Camp", x: 500, y: 430 };

const byId = (id) => document.getElementById(id);

const labelsToggle = byId("labelsToggle");
const gridToggle = byId("gridToggle");
const waypointToggle = byId("waypointToggle");
const mapSvg = byId("mapSvg");
const mapScroller = byId("mapScroller");
const mapGrid = byId("mapGrid");
const mapLabels = byId("mapLabels");
const waypointLayer = byId("waypointLayer");
const placementHint = byId("placementHint");
const placeCenterBtn = byId("placeCenterBtn");
const cancelPlacementBtn = byId("cancelPlacementBtn");
const coordReadout = byId("coordReadout");
const chartBearing = byId("chartBearing");
const tabSurvey = byId("tabSurvey");
const tabGazetteer = byId("tabGazetteer");
const tabJournal = byId("tabJournal");
const panelSurvey = byId("panelSurvey");
const panelGazetteer = byId("panelGazetteer");
const panelJournal = byId("panelJournal");
const regionKicker = byId("regionKicker");
const regionName = byId("regionName");
const regionLede = byId("regionLede");
const regionResources = byId("regionResources");
const regionApproach = byId("regionApproach");
const regionNote = byId("regionNote");
const noteStatus = byId("noteStatus");
const saveNoteBtn = byId("saveNoteBtn");
const navTarget = byId("navTarget");
const bearingValue = byId("bearingValue");
const distanceValue = byId("distanceValue");
const compassNeedle = byId("compassNeedle");
const gazetteerSearch = byId("gazetteerSearch");
const gazetteerCount = byId("gazetteerCount");
const gazetteerList = byId("gazetteerList");
const waypointForm = byId("waypointForm");
const waypointName = byId("waypointName");
const waypointError = byId("waypointError");
const waypointCoords = byId("waypointCoords");
const cancelWaypoint = byId("cancelWaypoint");
const waypointList = byId("waypointList");
const waypointEmpty = byId("waypointEmpty");
const waypointCount = byId("waypointCount");
const expeditionLog = byId("expeditionLog");
const logEmpty = byId("logEmpty");
const clearLogBtn = byId("clearLogBtn");

const tabs = [tabSurvey, tabGazetteer, tabJournal];
const tabPanels = {
  survey: panelSurvey,
  gazetteer: panelGazetteer,
  journal: panelJournal
};

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    return;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

let settings = readStorage(STORAGE_SETTINGS, { labels: true, grid: true });
if (!settings || typeof settings !== "object") {
  settings = { labels: true, grid: true };
}
settings.labels = settings.labels !== false;
settings.grid = settings.grid !== false;

let waypoints = readStorage(STORAGE_WAYPOINTS, []);
if (!Array.isArray(waypoints)) {
  waypoints = [];
}
waypoints = waypoints.filter((waypoint) => {
  return waypoint && typeof waypoint.name === "string" && Number.isFinite(Number(waypoint.x)) && Number.isFinite(Number(waypoint.y));
}).map((waypoint) => {
  return {
    id: typeof waypoint.id === "string" ? waypoint.id : makeId("wp"),
    name: waypoint.name.slice(0, 36),
    x: clamp(Number(waypoint.x), 40, 960),
    y: clamp(Number(waypoint.y), 70, 650),
    created: waypoint.created || new Date().toISOString()
  };
});

let notes = readStorage(STORAGE_NOTES, {});
if (!notes || typeof notes !== "object" || Array.isArray(notes)) {
  notes = {};
}

let logEntries = readStorage(STORAGE_LOG, []);
if (!Array.isArray(logEntries)) {
  logEntries = [];
}
logEntries = logEntries.filter((entry) => entry && typeof entry.text === "string").slice(0, 50);

let selectedRegion = "cinder";
let placingWaypoint = false;
let draftWaypoint = null;
let navigationTarget = {
  name: REGIONS.cinder.name,
  x: REGIONS.cinder.anchor.x,
  y: REGIONS.cinder.anchor.y,
  id: null
};
let lastSurveyed = "cinder";
let noteTimer = null;
let flashTimer = null;
let wasMobile = window.matchMedia("(max-width: 720px)").matches;

const compassPoints = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function formatDegreeMinute(value, suffix) {
  let degrees = Math.floor(value);
  let minutes = Math.round((value - degrees) * 60);
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }
  return `${degrees}° ${String(minutes).padStart(2, "0")}′ ${suffix}`;
}

function coordinateLabel(x, y) {
  const latitude = 21 - (y - 116) / 116;
  const longitude = 58 - (x - 125) / 125;
  return `${formatDegreeMinute(latitude, "N")} · ${formatDegreeMinute(longitude, "W")}`;
}

function fullCoordinateLabel(x, y) {
  const latitude = 21 - (y - 116) / 116;
  const longitude = 58 - (x - 125) / 125;
  return `${formatDegreeMinute(latitude, "N")} ${formatDegreeMinute(longitude, "W")}`;
}

function cardinal(degrees) {
  return compassPoints[Math.round(degrees / 22.5) % 16];
}

function applySettings() {
  labelsToggle.setAttribute("aria-pressed", String(settings.labels));
  gridToggle.setAttribute("aria-pressed", String(settings.grid));
  mapLabels.hidden = !settings.labels;
  mapGrid.hidden = !settings.grid;
  writeStorage(STORAGE_SETTINGS, settings);
}

function renderNavigation() {
  const deltaX = navigationTarget.x - BASE_CAMP.x;
  const deltaY = BASE_CAMP.y - navigationTarget.y;
  const degrees = (Math.atan2(deltaX, deltaY) * 180 / Math.PI + 360) % 360;
  const leagues = Math.hypot(deltaX, deltaY) / 10;
  const degreeText = `${String(Math.round(degrees)).padStart(3, "0")}°`;
  const distanceText = `${leagues < 0.1 ? "less than 0.1" : leagues.toFixed(1)} ${leagues.toFixed(1) === "1.0" ? "league" : "leagues"}`;

  navTarget.textContent = navigationTarget.name;
  bearingValue.textContent = `${cardinal(degrees)} ${degreeText}`;
  distanceValue.textContent = distanceText;
  chartBearing.textContent = `${navigationTarget.name} · ${degreeText} · ${distanceText}`;
  compassNeedle.style.transform = `rotate(${degrees}deg)`;
}

function setNavigation(name, x, y, id = null) {
  navigationTarget = { name, x, y, id };
  renderNavigation();
}

function addLog(type, text) {
  const labels = {
    survey: "Survey",
    marker: "Marker",
    note: "Note",
    remove: "Removed",
    chart: "Chart"
  };
  logEntries.unshift({
    id: makeId("log"),
    time: new Date().toISOString(),
    type: labels[type] || "Note",
    text
  });
  logEntries = logEntries.slice(0, 50);
  writeStorage(STORAGE_LOG, logEntries);
  renderLog();
}

function formatLogTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatLogTitle(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function renderLog() {
  expeditionLog.replaceChildren();
  const fragment = document.createDocumentFragment();
  logEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "log-entry";
    const time = document.createElement("time");
    time.className = "log-time";
    time.textContent = formatLogTime(entry.time);
    time.setAttribute("datetime", entry.time);
    time.title = formatLogTitle(entry.time);
    const body = document.createElement("p");
    body.className = "log-body";
    const type = document.createElement("span");
    type.className = "log-type";
    type.textContent = entry.type;
    body.appendChild(type);
    body.appendChild(document.createTextNode(entry.text));
    item.appendChild(time);
    item.appendChild(body);
    fragment.appendChild(item);
  });
  expeditionLog.appendChild(fragment);
  logEmpty.hidden = logEntries.length > 0;
  clearLogBtn.disabled = logEntries.length === 0;
}

function selectRegion(id, options = {}) {
  const region = REGIONS[id];
  if (!region) {
    return;
  }
  selectedRegion = id;
  document.querySelectorAll(".region").forEach((group) => {
    const groupId = group.getAttribute("data-region");
    const groupRegion = REGIONS[groupId];
    const isSelected = groupId === id;
    group.classList.toggle("is-selected", isSelected);
    if (groupRegion) {
      group.setAttribute("aria-label", `${groupRegion.name}, ${groupRegion.kind}.${isSelected ? " Selected." : ""} Open survey.`);
    }
  });

  regionKicker.textContent = `Region · ${region.kind}`;
  regionName.textContent = region.title;
  regionLede.textContent = region.lede;
  regionResources.textContent = region.resources.join(" · ");
  regionApproach.textContent = region.approach;
  regionNote.value = notes[id] || "";
  noteStatus.textContent = notes[id] ? "Noted in the field book." : "No note entered yet.";
  setNavigation(region.name, region.anchor.x, region.anchor.y);

  if (!options.silent && lastSurveyed !== id) {
    addLog("survey", `Surveyed ${region.title}.`);
  }
  lastSurveyed = id;

  if (options.openTab !== false) {
    switchTab("survey", false);
  }
}

function switchTab(name, focusTab = false) {
  tabs.forEach((tab) => {
    const tabName = tab.id.replace("tab", "").toLowerCase();
    const active = tabName === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focusTab) {
      tab.focus();
    }
  });
  Object.entries(tabPanels).forEach(([key, panel]) => {
    panel.hidden = key !== name;
  });
}

function renderGazetteer() {
  const query = gazetteerSearch.value.trim().toLowerCase();
  const regions = Object.entries(REGIONS);
  const matches = regions.filter(([, region]) => {
    const haystack = [region.title, region.kind, region.lede, region.approach, region.resources.join(" ")].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  gazetteerCount.textContent = query
    ? `${matches.length} of ${regions.length} places`
    : `${regions.length} places`;
  gazetteerList.replaceChildren();
  const fragment = document.createDocumentFragment();

  matches.forEach(([id, region]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gazetteer-entry";
    button.setAttribute("aria-label", `Open survey for ${region.title}`);
    const top = document.createElement("div");
    top.className = "gaz-entry-top";
    const name = document.createElement("span");
    name.className = "gaz-entry-name";
    name.textContent = region.title;
    const kind = document.createElement("span");
    kind.className = "gaz-entry-kind";
    kind.textContent = region.kind;
    top.appendChild(name);
    top.appendChild(kind);
    const meta = document.createElement("p");
    meta.className = "gaz-entry-meta";
    meta.textContent = region.resources.join(" · ");
    button.appendChild(top);
    button.appendChild(meta);
    button.addEventListener("click", () => {
      selectRegion(id);
    });
    fragment.appendChild(button);
  });

  if (matches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-gazetteer";
    empty.textContent = "No place on this chart answers to that description. Try a coast, a resource, or a shorter name.";
    fragment.appendChild(empty);
  }

  gazetteerList.appendChild(fragment);
}

function createWaypointPin(waypoint, draft = false) {
  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute("class", `waypoint-pin${draft ? " is-draft" : ""}`);
  group.setAttribute("data-id", waypoint.id);
  group.setAttribute("transform", `translate(${waypoint.x} ${waypoint.y})`);
  group.setAttribute("aria-hidden", "true");

  const halo = document.createElementNS(SVG_NS, "circle");
  halo.setAttribute("class", "pin-halo");
  halo.setAttribute("r", "16");

  const stem = document.createElementNS(SVG_NS, "path");
  stem.setAttribute("class", "pin-stem");
  stem.setAttribute("d", "M 0 7 L 0 25");

  const flag = document.createElementNS(SVG_NS, "path");
  flag.setAttribute("class", "pin-flag");
  flag.setAttribute("d", "M 1 -2 L 21 -9 L 21 5 L 1 2 Z");

  const core = document.createElementNS(SVG_NS, "circle");
  core.setAttribute("class", "pin-core");
  core.setAttribute("r", "6");

  group.appendChild(halo);
  group.appendChild(stem);
  group.appendChild(flag);
  group.appendChild(core);

  if (settings.labels) {
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("class", "pin-label");
    label.setAttribute("x", "0");
    label.setAttribute("y", "-28");
    label.textContent = waypoint.name;
    group.appendChild(label);
  }

  return group;
}

function renderWaypoints() {
  waypointLayer.replaceChildren();
  const fragment = document.createDocumentFragment();
  waypoints.forEach((waypoint) => {
    fragment.appendChild(createWaypointPin(waypoint));
  });
  if (draftWaypoint) {
    fragment.appendChild(createWaypointPin(draftWaypoint, true));
  }
  waypointLayer.appendChild(fragment);
}

function renderWaypointList() {
  waypointList.replaceChildren();
  const ordered = [...waypoints].reverse();
  ordered.forEach((waypoint) => {
    const item = document.createElement("li");
    item.className = "waypoint-item";
    const locate = document.createElement("button");
    locate.type = "button";
    locate.className = "waypoint-locate";
    locate.setAttribute("aria-label", `Show ${waypoint.name} on the chart and set a bearing`);

    const marker = document.createElement("span");
    marker.className = "waypoint-marker";
    marker.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "waypoint-name";
    name.textContent = waypoint.name;

    const coords = document.createElement("span");
    coords.className = "waypoint-coords";
    coords.textContent = fullCoordinateLabel(waypoint.x, waypoint.y);

    locate.appendChild(marker);
    locate.appendChild(name);
    locate.appendChild(coords);
    locate.addEventListener("click", () => {
      setNavigation(waypoint.name, waypoint.x, waypoint.y, waypoint.id);
      flashWaypoint(waypoint.id);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "waypoint-remove";
    remove.setAttribute("aria-label", `Remove waypoint ${waypoint.name}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      removeWaypoint(waypoint.id);
    });

    item.appendChild(locate);
    item.appendChild(remove);
    waypointList.appendChild(item);
  });

  const count = waypoints.length;
  waypointCount.textContent = `${count} marked`;
  waypointEmpty.hidden = count > 0;
}

function flashWaypoint(id) {
  const pin = waypointLayer.querySelector(`[data-id="${id}"]`);
  if (!pin) {
    return;
  }
  window.clearTimeout(flashTimer);
  pin.classList.add("is-flashing");
  flashTimer = window.setTimeout(() => pin.classList.remove("is-flashing"), 1900);
}

function removeWaypoint(id) {
  const waypoint = waypoints.find((item) => item.id === id);
  if (!waypoint) {
    return;
  }
  waypoints = waypoints.filter((item) => item.id !== id);
  writeStorage(STORAGE_WAYPOINTS, waypoints);
  renderWaypoints();
  renderWaypointList();
  addLog("remove", `Removed the marker at ${waypoint.name}.`);
  if (navigationTarget.id === id) {
    const region = REGIONS[selectedRegion];
    setNavigation(region.name, region.anchor.x, region.anchor.y);
  }
}

function setPlacementMode(active) {
  placingWaypoint = active;
  waypointToggle.setAttribute("aria-pressed", String(active));
  placementHint.hidden = !active;
  mapSvg.classList.toggle("placing", active);
  const label = waypointToggle.querySelector(".tool-label");
  if (label) {
    label.textContent = active ? "Cancel planting" : "Plant a waypoint";
  }
  if (active) {
    if (draftWaypoint) {
      cancelDraft();
    }
    switchTab("journal");
  }
}

function placeWaypointAt(x, y) {
  const safeX = clamp(x, 45, 955);
  const safeY = clamp(y, 70, 650);
  setPlacementMode(false);
  draftWaypoint = {
    id: makeId("draft"),
    name: "New marker",
    x: Math.round(safeX * 10) / 10,
    y: Math.round(safeY * 10) / 10,
    created: new Date().toISOString()
  };
  renderWaypoints();
  waypointForm.hidden = false;
  waypointName.value = "";
  waypointError.textContent = "";
  waypointCoords.textContent = fullCoordinateLabel(draftWaypoint.x, draftWaypoint.y);
  switchTab("journal");
  window.requestAnimationFrame(() => {
    waypointName.focus();
  });
}

function cancelDraft() {
  draftWaypoint = null;
  waypointForm.hidden = true;
  waypointName.value = "";
  waypointError.textContent = "";
  waypointCoords.textContent = "";
  renderWaypoints();
}

function handleWaypointSubmit(event) {
  event.preventDefault();
  if (!draftWaypoint) {
    return;
  }
  const name = waypointName.value.trim();
  if (!name) {
    waypointError.textContent = "Give the marker a name before setting it.";
    waypointName.focus();
    return;
  }
  const waypoint = {
    id: makeId("wp"),
    name: name.slice(0, 36),
    x: draftWaypoint.x,
    y: draftWaypoint.y,
    created: new Date().toISOString()
  };
  waypoints.push(waypoint);
  writeStorage(STORAGE_WAYPOINTS, waypoints);
  draftWaypoint = null;
  waypointForm.hidden = true;
  waypointName.value = "";
  waypointCoords.textContent = "";
  waypointError.textContent = "";
  renderWaypoints();
  renderWaypointList();
  setNavigation(waypoint.name, waypoint.x, waypoint.y, waypoint.id);
  addLog("marker", `Planted a marker at ${waypoint.name}.`);
}

function toSvgPoint(event) {
  const matrix = mapSvg.getScreenCTM();
  if (!matrix) {
    return null;
  }
  const point = mapSvg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(matrix.inverse());
}

function saveNote(manual = false) {
  if (!selectedRegion) {
    return;
  }
  window.clearTimeout(noteTimer);
  const regionId = selectedRegion;
  const value = regionNote.value.slice(0, 260);
  notes[regionId] = value;
  writeStorage(STORAGE_NOTES, notes);
  if (selectedRegion === regionId) {
    noteStatus.textContent = value.trim() ? "Noted in the field book." : "No note entered yet.";
  }
  if (manual && value.trim()) {
    addLog("note", `Recorded a survey note on ${REGIONS[regionId].title}.`);
    noteStatus.textContent = "Entered in the expedition journal.";
  }
}

function centerMobileMap() {
  if (!window.matchMedia("(max-width: 720px)").matches) {
    return;
  }
  window.requestAnimationFrame(() => {
    const maxScroll = mapScroller.scrollWidth - mapScroller.clientWidth;
    if (maxScroll <= 0) {
      return;
    }
    const targetCentre = mapScroller.scrollWidth * 0.5;
    mapScroller.scrollLeft = clamp(targetCentre - mapScroller.clientWidth / 2, 0, maxScroll);
  });
}

labelsToggle.addEventListener("click", () => {
  settings.labels = !settings.labels;
  applySettings();
  renderWaypoints();
});

gridToggle.addEventListener("click", () => {
  settings.grid = !settings.grid;
  applySettings();
});

waypointToggle.addEventListener("click", () => {
  setPlacementMode(!placingWaypoint);
});

placeCenterBtn.addEventListener("click", () => {
  placeWaypointAt(500, 360);
});

cancelPlacementBtn.addEventListener("click", () => {
  setPlacementMode(false);
});

document.querySelectorAll(".region").forEach((group) => {
  group.addEventListener("click", () => {
    if (placingWaypoint) {
      return;
    }
    selectRegion(group.getAttribute("data-region"));
  });
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!placingWaypoint) {
        selectRegion(group.getAttribute("data-region"));
      }
    }
  });
  group.addEventListener("focus", () => {
    group.classList.add("has-focus");
  });
  group.addEventListener("blur", () => {
    group.classList.remove("has-focus");
  });
});

mapSvg.addEventListener("click", (event) => {
  if (!placingWaypoint) {
    return;
  }
  const point = toSvgPoint(event);
  if (!point) {
    return;
  }
  event.preventDefault();
  placeWaypointAt(point.x, point.y);
});

mapSvg.addEventListener("pointermove", (event) => {
  const point = toSvgPoint(event);
  if (!point) {
    return;
  }
  coordReadout.textContent = coordinateLabel(clamp(point.x, 0, 1000), clamp(point.y, 0, 700));
});

mapSvg.addEventListener("pointerleave", () => {
  coordReadout.textContent = coordinateLabel(BASE_CAMP.x, BASE_CAMP.y);
});

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    switchTab(tab.id.replace("tab", "").toLowerCase());
  });
  tab.addEventListener("keydown", (event) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    }
    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }
    if (event.key === "Home") {
      nextIndex = 0;
    }
    if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }
    if (nextIndex !== null) {
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      switchTab(nextTab.id.replace("tab", "").toLowerCase(), true);
    }
  });
});

gazetteerSearch.addEventListener("input", renderGazetteer);
gazetteerSearch.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && gazetteerSearch.value) {
    gazetteerSearch.value = "";
    renderGazetteer();
  }
});

regionNote.addEventListener("input", () => {
  if (!selectedRegion) {
    return;
  }
  const regionId = selectedRegion;
  noteStatus.textContent = "Ink still wet...";
  window.clearTimeout(noteTimer);
  noteTimer = window.setTimeout(() => {
    notes[regionId] = regionNote.value.slice(0, 260);
    writeStorage(STORAGE_NOTES, notes);
    if (selectedRegion === regionId) {
      noteStatus.textContent = regionNote.value.trim() ? "Noted in the field book." : "No note entered yet.";
    }
  }, 550);
});

saveNoteBtn.addEventListener("click", () => {
  saveNote(true);
});

waypointForm.addEventListener("submit", handleWaypointSubmit);

waypointName.addEventListener("input", () => {
  waypointError.textContent = "";
  if (draftWaypoint) {
    draftWaypoint.name = waypointName.value.trim() || "New marker";
    renderWaypoints();
  }
});

cancelWaypoint.addEventListener("click", cancelDraft);

clearLogBtn.addEventListener("click", () => {
  if (logEntries.length === 0) {
    return;
  }
  const approved = window.confirm("Clear the expedition log? This cannot be undone.");
  if (!approved) {
    return;
  }
  logEntries = [];
  writeStorage(STORAGE_LOG, logEntries);
  renderLog();
  switchTab("journal");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (placingWaypoint) {
    setPlacementMode(false);
    waypointToggle.focus();
  } else if (draftWaypoint) {
    cancelDraft();
    waypointToggle.focus();
  }
});

window.addEventListener("resize", () => {
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  if (isMobile && !wasMobile) {
    centerMobileMap();
  }
  wasMobile = isMobile;
});

applySettings();
selectRegion("cinder", { silent: true, openTab: false });
renderGazetteer();
renderWaypoints();
renderWaypointList();
renderLog();
renderNavigation();
coordReadout.textContent = coordinateLabel(BASE_CAMP.x, BASE_CAMP.y);
centerMobileMap();
