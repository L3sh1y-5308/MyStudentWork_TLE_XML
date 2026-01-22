import { Vector, Entity, LonLat } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

let pointsLayer = null;
let cachedIcon = null;

export function initPointsLayer(globe) {
  if (pointsLayer) {
    return;
  }
  pointsLayer = new Vector("JSON Points", { clampToGround: true });
  globe.planet.addLayer(pointsLayer);
}

export async function loadPointsFromFile(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON.");
  }
  return normalizePoints(data);
}

export function renderPoints(points) {
  if (!pointsLayer) {
    return;
  }
  pointsLayer.clear();
  const icon = getPointIcon();

  for (const point of points) {
    const entity = new Entity({
      name: point.name,
      lonlat: new LonLat(point.lon, point.lat, 0),
      billboard: {
        src: icon,
        width: 24,
        height: 24,
        scaleByDistance: [100, 100, 1]
      }
    });
    pointsLayer.add(entity);
  }
}

export function clearPoints() {
  if (pointsLayer) {
    pointsLayer.clear();
  }
}

function normalizePoints(data) {
  if (!Array.isArray(data)) {
    throw new Error("JSON must be an array of points.");
  }

  return data.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Item ${index + 1} must be an object.`);
    }

    const name = typeof item.name === "string" ? item.name : `Point ${index + 1}`;
    const lat = getNumber(item.lat ?? item.latitude);
    const lon = getNumber(item.lng ?? item.lon ?? item.longitude);

    if (lat === null || lon === null) {
      throw new Error(`Item ${index + 1} must have lat and lng (or lon).`);
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error(`Item ${index + 1} has invalid coordinates.`);
    }

    return { name, lat, lon };
  });
}

function getNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getPointIcon() {
  if (cachedIcon) {
    return cachedIcon;
  }
  const svg = `
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#29B6F6" stroke="white" stroke-width="2"/>
    </svg>
  `;
  cachedIcon = "data:image/svg+xml;base64," + btoa(svg);
  return cachedIcon;
}
let clickHandlerAttached = false;
let clickCallback = null;

export function enablePointClick(callback) {
    clickCallback = typeof callback === "function" ? callback : null;
    if (!pointsLayer || clickHandlerAttached) {
        return;
    }
    pointsLayer.events.on("lclick", (e) => {
        const entity = e.pickingObject?.geoObject;
        if (entity && clickCallback) {
            clickCallback(entity);
        }
    });
    clickHandlerAttached = true;
}

export function renderPointsWithLabels(points, options = {}) {
    if (!pointsLayer) {
        return;
    }
    const {
        showLabels = true,
        labelColor = "#ffffff",
        labelOutline = "#000000",
        labelFont = "12px sans-serif"
    } = options;

    pointsLayer.clear();
    const icon = getPointIcon();

    for (const point of points) {
        const entity = new Entity({
            name: point.name,
            lonlat: new LonLat(point.lon, point.lat, 0),
            billboard: {
                src: icon,
                width: 24,
                height: 24,
                scaleByDistance: [100, 100, 1]
            },
            label: showLabels
                ? {
                        text: point.name,
                        color: labelColor,
                        outline: labelOutline,
                        outlineSize: 2,
                        font: labelFont,
                        offset: [0, -28]
                    }
                : undefined
        });
        pointsLayer.add(entity);
    }
}