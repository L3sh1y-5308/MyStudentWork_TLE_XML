// Сервис для управления спутниками
import * as satellite from "../vendor/satellite.es.js";
import { layer, Entity, LonLat, Gltf, Vec3 } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";
import { fetchTLE, parseTLE } from "./tle.js";
import { hexToRgba } from "../utils/colors.js";
import { TRAIL_LIVE_MS, TRAIL_FADE_MS, TRAIL_TOTAL_MS } from "../config/constellations.js";
import { updateRaysToMarker, updateRaysForGetterPairs, getGetterPairs } from "./Gettersline.js";
import { isScenarioMode, getActiveSatellites } from "./scenarios.js";

// Глобальные хранилища
export const constellationLayers = new Map();
export const trailLayers = new Map();
export const satellitesByLayer = new Map();

const simulationEpochMs = Date.now();

const SATELLITE_MODEL_URL = "./res/models/1Sattelite.gltf";
const SATELLITE_MODEL_SCALE = 0.001;
let satelliteModelPromise = null;

function loadSatelliteModel() {
  if (!satelliteModelPromise) {
    satelliteModelPromise = loadGltfModel(SATELLITE_MODEL_URL)
      .then((gltf) => gltf)
      .catch((error) => {
        console.error("Failed to load satellite model:", error);
        throw error;
      });
  }
  return satelliteModelPromise;
}

function attachSatelliteModel(entity) {
  loadSatelliteModel()
    .then((gltf) => {
      const entities = gltf.toEntities();
      for (const child of entities) {
        child.relativePosition = true;
        entity.appendChild(child);
      }
    })
    .catch(() => {
      // Error is already logged in loadSatelliteModel.
    });
}

// Функция для применения ориентации спутника по направлению его движения
function applySatelliteOrientation(entity, velocityEci, positionEci, gmst) {
  if (!entity || !entity._children || entity._children.length === 0) return;
  if (!velocityEci || !positionEci) return;
  
  // Получаем компоненты скорости в ECI
  const vx = velocityEci.x;
  const vy = velocityEci.y;
  const vz = velocityEci.z;
  
  // Вычисляем направление движения (нормализованный вектор скорости)
  const vMag = Math.sqrt(vx * vx + vy * vy + vz * vz);
  if (vMag < 0.001) return; // Если скорость слишком мала, не применяем ориентацию
  
  // Позиция спутника
  const px = positionEci.x;
  const py = positionEci.y;
  const pz = positionEci.z;
  
  // Вектор "вверх" от центра Земли к спутнику (радиальный вектор)
  const pMag = Math.sqrt(px * px + py * py + pz * pz);
  const upX = px / pMag;
  const upY = py / pMag;
  const upZ = pz / pMag;
  
  // Нормализованный вектор направления движения
  // ⚠️ КОНТРОЛЬ НАПРАВЛЕНИЯ ПОЛЕТА: инвертируем вектор, чтобы спутник летел другой стороной
  const forwardX = -vx / vMag;  // Меняем знак для разворота на 180°
  const forwardY = -vy / vMag;  // Меняем знак для разворота на 180°
  const forwardZ = -vz / vMag;  // Меняем знак для разворота на 180°
  
  // Вычисляем вектор "вправо" (cross product: up × forward)
  let rightX = upY * forwardZ - upZ * forwardY;
  let rightY = upZ * forwardX - upX * forwardZ;
  let rightZ = upX * forwardY - upY * forwardX;
  
  const rightMag = Math.sqrt(rightX * rightX + rightY * rightY + rightZ * rightZ);
  if (rightMag < 0.001) return; // Вектора почти параллельны
  
  rightX /= rightMag;
  rightY /= rightMag;
  rightZ /= rightMag;
  
  // Пересчитываем вектор "вверх" (cross product: forward × right)
  const newUpX = forwardY * rightZ - forwardZ * rightY;
  const newUpY = forwardZ * rightX - forwardX * rightZ;
  const newUpZ = forwardX * rightY - forwardY * rightX;
  
  // Матрица поворота (в системе координат OpenGlobus):
  // right, newUp, forward образуют базис
  // Преобразуем в кватернион
  const m11 = rightX,   m12 = rightY,   m13 = rightZ;
  const m21 = newUpX,   m22 = newUpY,   m23 = newUpZ;
  const m31 = forwardX, m32 = forwardY, m33 = forwardZ;
  
  // Вычисляем кватернион из матрицы вращения
  const trace = m11 + m22 + m33;
  let qw, qx, qy, qz;
  
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1.0);
    qw = 0.25 / s;
    qx = (m32 - m23) * s;
    qy = (m13 - m31) * s;
    qz = (m21 - m12) * s;
  } else if (m11 > m22 && m11 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
    qw = (m32 - m23) / s;
    qx = 0.25 * s;
    qy = (m12 + m21) / s;
    qz = (m13 + m31) / s;
  } else if (m22 > m33) {
    const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
    qw = (m13 - m31) / s;
    qx = (m12 + m21) / s;
    qy = 0.25 * s;
    qz = (m23 + m32) / s;
  } else {
    const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
    qw = (m21 - m12) / s;
    qx = (m13 + m31) / s;
    qy = (m23 + m32) / s;
    qz = 0.25 * s;
  }
  
  // Применяем ориентацию ко всем дочерним entities (GLTF модель)
  for (const child of entity._children) {
    if (child.setOrientation) {
      child.setOrientation(qx, qy, qz, qw);
    }
  }
}

// Загрузка созвездия
export async function loadConstellation({ name, urls, color, speedMultiplier = 1 }, globe) {
  const tleText = await fetchTLE(urls);
  const tleItems = parseTLE(tleText);
  if (!tleItems.length) {
    throw new Error(`TLE parse failed: ${name}`);
  }
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
      localFrame: true,
      scale: new Vec3(SATELLITE_MODEL_SCALE, SATELLITE_MODEL_SCALE, SATELLITE_MODEL_SCALE)
    });
    attachSatelliteModel(entity);
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

/**
 * Загрузка кастомных спутников из TLE данных
 * @param {Array} customSatellites - Массив объектов с полями: name, tleLine1, tleLine2, color (опционально)
 * @param {Object} globe - Глобус
 * @param {string} layerName - Имя слоя (по умолчанию "Custom Satellites")
 */
export async function loadCustomSatellites(customSatellites, globe, layerName = "Custom Satellites") {
  if (!customSatellites || !customSatellites.length) {
    console.warn("[Satellites] No custom satellites to load");
    return;
  }

  console.log(`[Satellites] Loading ${customSatellites.length} custom satellites to layer: ${layerName}`);

  const defaultColor = "#00FF00";
  const trailColor = hexToRgba(defaultColor, 0.55);

  // Создаем или получаем существующий слой
  let layerInstance = constellationLayers.get(layerName);
  let trailLayer = trailLayers.get(layerName);
  let satellites = satellitesByLayer.get(layerName) || [];

  if (!layerInstance) {
    layerInstance = new layer.Vector(layerName, {
      pickingEnabled: false,
      clampToGround: false
    });

    trailLayer = new layer.Vector(`${layerName} Trails`, {
      pickingEnabled: false,
      clampToGround: false
    });

    globe.planet.addLayer(layerInstance);
    globe.planet.addLayer(trailLayer);
    
    constellationLayers.set(layerName, layerInstance);
    trailLayers.set(layerName, trailLayer);
  }

  // Добавляем спутники
  for (const tleSat of customSatellites) {
    if (!tleSat.name || !tleSat.tleLine1 || !tleSat.tleLine2) {
      console.warn("[Satellites] Skipping satellite with missing TLE data:", tleSat);
      continue;
    }

    try {
      const satrec = satellite.twoline2satrec(tleSat.tleLine1, tleSat.tleLine2);
      const satId = tleSat.tleLine1.substring(2, 7).trim();

      const entity = new Entity({
        name: tleSat.name,
        lonlat: new LonLat(0, 0, 0),
        localFrame: true,
        scale: new Vec3(SATELLITE_MODEL_SCALE, SATELLITE_MODEL_SCALE, SATELLITE_MODEL_SCALE)
      });

      attachSatelliteModel(entity);

      const satColor = tleSat.color || defaultColor;
      const satTrailColor = hexToRgba(satColor, 0.55);

      satellites.push({
        satrec,
        entity,
        name: tleSat.name,
        id: satId,
        lon: null,
        lat: null,
        height: null,
        speedMultiplier: 1,
        trail: [],
        trailEntity: null,
        trailColor: satTrailColor,
        trailBaseColor: satColor
      });

      layerInstance.add(entity);
      console.log(`[Satellites] Loaded custom satellite: ${tleSat.name}`);
    } catch (error) {
      console.error(`[Satellites] Failed to load satellite ${tleSat.name}:`, error);
    }
  }

  satellitesByLayer.set(layerName, satellites);
  console.log(`[Satellites] Total satellites in ${layerName}: ${satellites.length}`);
}

async function loadGltfModel(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load glTF: ${url}`);
  }

  const gltfJson = await response.json();
  const baseUrl = new URL(url, window.location.href).toString();

  if (Array.isArray(gltfJson.images)) {
    for (const image of gltfJson.images) {
      if (image.uri && !image.uri.startsWith("data:")) {
        image.uri = new URL(image.uri, baseUrl).toString();
      }
    }
  }

  const buffers = await Promise.all(
    (gltfJson.buffers || []).map(async (buffer) => {
      if (!buffer.uri) {
        throw new Error("glTF buffer uri is missing");
      }
      if (buffer.uri.startsWith("data:")) {
        return decodeDataUriToArrayBuffer(buffer.uri);
      }
      const bufferUrl = new URL(buffer.uri, baseUrl).toString();
      const bufferResponse = await fetch(bufferUrl);
      if (!bufferResponse.ok) {
        throw new Error(`Unable to load glTF buffer: ${bufferUrl}`);
      }
      return bufferResponse.arrayBuffer();
    })
  );

  return new Gltf({ gltf: gltfJson, bin: buffers });
}

function decodeDataUriToArrayBuffer(dataUri) {
  const base64Index = dataUri.indexOf("base64,");
  if (base64Index === -1) {
    throw new Error("Unsupported data uri format");
  }
  const base64 = dataUri.slice(base64Index + 7);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Обновление позиций спутников
export function updateSatellites(currentDate, trailsEnabled) {
  const nowMs = currentDate.getTime();
  
  const allVisibleSatellites = [];
  
  // Получаем активные спутники в режиме сценариев
  const activeSatellites = isScenarioMode() ? getActiveSatellites(currentDate) : [];
  const activeSatelliteNames = new Set(activeSatellites.map(s => s.name));
  
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
      
      // Устанавливаем ориентацию спутника по направлению движения
      const velocityEci = positionAndVelocity.velocity;
      applySatelliteOrientation(item.entity, velocityEci, positionEci, gmst);
      
      // Подсветка активного спутника в режиме сценариев
      const isActive = activeSatelliteNames.has(item.name);
      if (isScenarioMode()) {
        // Увеличиваем масштаб активного спутника
        const scale = isActive ? SATELLITE_MODEL_SCALE * 3 : SATELLITE_MODEL_SCALE;
        item.entity.scale = new Vec3(scale, scale, scale);
      } else {
        // Возвращаем нормальный масштаб
        item.entity.scale = new Vec3(SATELLITE_MODEL_SCALE, SATELLITE_MODEL_SCALE, SATELLITE_MODEL_SCALE);
      }
      
      allVisibleSatellites.push(item);

      if (trailsEnabled && trailLayer && trailLayer._visibility !== false) {
        // Ограничиваем частоту обновления трека: добавляем точку, только если прошло достаточно времени (5000мс = 5 сек симуляции)
        // Это предотвращает перегрузку трека при частом вызове updateSatellites (каждый кадр)
        const lastPoint = item.trail.length > 0 ? item.trail[item.trail.length - 1] : null;
        if (!lastPoint || Math.abs(nowMs - lastPoint.ts) >= 1000) {
            item.trail = item.trail.filter((p) => nowMs - p.ts <= TRAIL_TOTAL_MS);
            item.trail.push({ lon, lat, height, ts: nowMs });
            
            if (item.trail.length >= 2) {
              const oldestAge = nowMs - item.trail[0].ts;
              // ... rest of trail logic
              const fadeFactor = oldestAge <= TRAIL_LIVE_MS
                ? 1
                : Math.max(0, 1 - (oldestAge - TRAIL_LIVE_MS) / TRAIL_FADE_MS);
              
              // Изменяем цвет трека для активного спутника
              let dynamicColor;
              if (isActive && isScenarioMode()) {
                dynamicColor = hexToRgba("#FFD700", 0.9 * fadeFactor); // Золотой цвет для активного
              } else {
                dynamicColor = hexToRgba(item.trailBaseColor, 0.55 * fadeFactor);
              }
              
              const path = item.trail.map((p) => new LonLat(p.lon, p.lat, p.height));
              if (!item.trailEntity) {
                item.trailEntity = new Entity({
                  name: `${item.entity.name}-trail`,
                  polyline: {
                    pathLonLat: [path],
                    thickness: isActive && isScenarioMode() ? 3.0 : 1.5,
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
                // Обновляем толщину трека
                item.trailEntity.polyline.thickness = isActive && isScenarioMode() ? 3.0 : 1.5;
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
    if (pairs.length > 0) {
      // Если есть пары, используем специальную функцию для пар
      updateRaysForGetterPairs(allVisibleSatellites, 7000);
    } else {
      // Иначе используем обычную функцию для одиночных маркеров
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
