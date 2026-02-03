// Сервис для управления спутниками
import * as satellite from "../vendor/satellite.es.js";
import { layer, Entity, LonLat } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";
import { fetchTLE, parseTLE } from "./tle.js";
import { makeIcon } from "../utils/icons.js";
import { hexToRgba } from "../utils/colors.js";
import { TRAIL_LIVE_MS, TRAIL_FADE_MS, TRAIL_TOTAL_MS } from "../config/constellations.js";
import { updateRaysToMarker, updateRaysForGetterPairs, getGetterPairs } from "./Gettersline.js";

// Глобальные хранилища
export const constellationLayers = new Map();
export const trailLayers = new Map();
export const satellitesByLayer = new Map();

const simulationEpochMs = Date.now();

// Загрузка созвездия
export async function loadConstellation({ name, urls, color, speedMultiplier = 1 }, globe) {
  const tleText = await fetchTLE(urls);
  const tleItems = parseTLE(tleText);
  if (!tleItems.length) {
    throw new Error(`TLE parse failed: ${name}`);
  }
  const icon = makeIcon(color);
  const trailColor = hexToRgba(color, 0.55);

  const layerInstance = new layer.Vector(name, {
    pickingEnabled: false,
    clampToGround: false
  });

  const trailLayer = new layer.Vector(`${name} Trails`, {
    pickingEnabled: false,
    clampToGround: false
  });

  const satellites = [];
  for (const tle of tleItems) {
    const satId = tle.line1.substring(2, 7).trim();
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const entity = new Entity({
      name: tle.name,
      lonlat: new LonLat(0, 0, 0),
      billboard: {
        src: icon,
        size: [16, 16],
        // Фиксируем размер спутника - не масштабируется с расстоянием
        scaleByDistance: [100, 100, 1]
      }
    });
    satellites.push({
      satrec,
      entity,
      name: tle.name,
      id: satId,
      lon: null,
      lat: null,
      height: null,
      speedMultiplier
    });
    layerInstance.add(entity);
    satellites[satellites.length - 1].trail = [];
    satellites[satellites.length - 1].trailEntity = null;
    satellites[satellites.length - 1].trailColor = trailColor;
    satellites[satellites.length - 1].trailBaseColor = color;
  }

  constellationLayers.set(name, layerInstance);
  trailLayers.set(name, trailLayer);
  satellitesByLayer.set(name, satellites);
  globe.planet.addLayer(layerInstance);
  globe.planet.addLayer(trailLayer);
}

// Обновление позиций спутников
export function updateSatellites(currentDate, trailsEnabled) {
  const nowMs = currentDate.getTime();
  
  const allVisibleSatellites = [];
  
  for (const [name, satellites] of satellitesByLayer.entries()) {
    const layerInstance = constellationLayers.get(name);
    const trailLayer = trailLayers.get(name);
    if (layerInstance && layerInstance._visibility === false) {
      continue;
    }

    for (const item of satellites) {
      const speed = Number.isFinite(item.speedMultiplier) ? item.speedMultiplier : 1;
      const effectiveMs = simulationEpochMs + (nowMs - simulationEpochMs) * speed;
      const effectiveDate = new Date(effectiveMs);
      const gmst = satellite.gstime(effectiveDate);
      const positionAndVelocity = satellite.propagate(item.satrec, effectiveDate);
      const positionEci = positionAndVelocity.position;
      if (!positionEci) {
        continue;
      }

      const geodetic = satellite.eciToGeodetic(positionEci, gmst);
      const lon = satellite.degreesLong(geodetic.longitude);
      const lat = satellite.degreesLat(geodetic.latitude);
      const height = geodetic.height * 1000;
      item.lon = lon;
      item.lat = lat;
      item.height = height;
      item.entity.setLonLat(new LonLat(lon, lat, height));
      
      allVisibleSatellites.push(item);

      if (trailsEnabled && trailLayer && trailLayer._visibility !== false) {
        item.trail = item.trail.filter((p) => nowMs - p.ts <= TRAIL_TOTAL_MS);
        item.trail.push({ lon, lat, height, ts: nowMs });
        if (item.trail.length >= 2) {
          const oldestAge = nowMs - item.trail[0].ts;
          const fadeFactor = oldestAge <= TRAIL_LIVE_MS
            ? 1
            : Math.max(0, 1 - (oldestAge - TRAIL_LIVE_MS) / TRAIL_FADE_MS);
          const dynamicColor = hexToRgba(item.trailBaseColor, 0.55 * fadeFactor);
          const path = item.trail.map((p) => new LonLat(p.lon, p.lat, p.height));
          if (!item.trailEntity) {
            item.trailEntity = new Entity({
              name: `${item.entity.name}-trail`,
              polyline: {
                pathLonLat: [path],
                thickness: 1.5,
                color: dynamicColor,
                isClosed: false
              }
            });
            trailLayer.add(item.trailEntity);
          } else {
            item.trailEntity.polyline.setPathLonLat([path]);
            if (typeof item.trailEntity.polyline.setColor === "function") {
              item.trailEntity.polyline.setColor(dynamicColor);
            } else {
              item.trailEntity.polyline.color = dynamicColor;
            }
          }
        }
      }
    }
  }
  
  // Обновляем лучи к красной точке
  if (allVisibleSatellites.length > 0) {
    // Проверяем, есть ли пары getter'ов
    const pairs = getGetterPairs();
    console.log(`[updateSatellites] RAYCAST: pairs=${pairs.length}, satellites=${allVisibleSatellites.length}`);
    
    if (pairs.length > 0) {
      // Если есть пары, используем специальную функцию для пар
      console.log(`[updateSatellites] → Using PAIR raycast`);
      updateRaysForGetterPairs(allVisibleSatellites, 7000);
    } else {
      // Иначе используем обычную функцию для одиночных маркеров
      console.log(`[updateSatellites] → Using REGULAR raycast`);
      updateRaysToMarker(allVisibleSatellites, 7000);
    }
  }
}

// Подсчет видимых спутников
export function getVisibleCount() {
  let count = 0;
  for (const [name, satellites] of satellitesByLayer.entries()) {
    const layerInstance = constellationLayers.get(name);
    if (layerInstance && layerInstance._visibility !== false) {
      count += satellites.length;
    }
  }
  return count;
}

// Очистка всех созвездий
export function clearAllConstellations(globe) {
  for (const layerInstance of constellationLayers.values()) {
    if (globe.planet && typeof globe.planet.removeLayer === "function") {
      globe.planet.removeLayer(layerInstance);
    } else {
      layerInstance.setVisibility(false);
    }
  }
  for (const trailLayer of trailLayers.values()) {
    if (globe.planet && typeof globe.planet.removeLayer === "function") {
      globe.planet.removeLayer(trailLayer);
    } else {
      trailLayer.setVisibility(false);
    }
  }

  constellationLayers.clear();
  trailLayers.clear();
  satellitesByLayer.clear();
}
