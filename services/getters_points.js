import { Vector, Entity, LonLat, Gltf, Vec3 } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";
import { satellitesByLayer, constellationLayers } from "./satellites.js";

let pointsLayer = null;
let cachedIcon = null;

// Хранилище точек getter с информацией для анимации
const getterStations = [];
let dishModelPromise = null;

// Загрузка модели антенны
function loadDishModel() {
  if (!dishModelPromise) {
    dishModelPromise = loadGltfModel("./res/models/1Sattelite.gltf")
      .then((gltf) => gltf)
      .catch((error) => {
        console.error("Failed to load 1HI model:", error);
        return null;
      });
  }
  return dishModelPromise;
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
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function initPointsLayer(globe) {
  if (pointsLayer) {
    return;
  }
  pointsLayer = new Vector("JSON Points", { 
    clampToGround: false,  // Изменено с true на false для 3D моделей
    pickingEnabled: true
  });
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
  getterStations.length = 0;

  for (const point of points) {
    const entity = new Entity({
      name: point.name,
      lonlat: new LonLat(point.lon, point.lat, 10),
      localFrame: true,
      scale: new Vec3(0.001, 0.001, 0.001)  // Такой же масштаб как у спутников
    });
    
    // Асинхронная загрузка модели GLTF
    loadDishModel()
      .then((gltf) => {
        if (gltf) {
          console.log(`[getters_points] GLTF модель загружена для ${point.name}`);
          const entities = gltf.toEntities();
          for (const child of entities) {
            child.relativePosition = true;
            entity.appendChild(child);
          }
        }
      })
      .catch(() => {
        // Error already logged
      });
    
    pointsLayer.add(entity);
    
    // Сохраняем информацию для анимации
    getterStations.push({
      entity,
      point,
      currentYaw: 0,
      currentPitch: 45,
      currentTarget: null
    });
  }
}

export function clearPoints() {
  if (pointsLayer) {
    pointsLayer.clear();
  }
  getterStations.length = 0;
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
    getterStations.length = 0;

    for (const point of points) {
        const entity = new Entity({
            name: point.name,
            lonlat: new LonLat(point.lon, point.lat, 10),
            localFrame: true,
            scale: new Vec3(0.001, 0.001, 0.001),  // Такой же масштаб как у спутников
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
        
        // Асинхронная загрузка модели GLTF
        loadDishModel()
          .then((gltf) => {
            if (gltf) {
              console.log(`[getters_points] GLTF модель с лейблом загружена для ${point.name}`);
              const entities = gltf.toEntities();
              for (const child of entities) {
                child.relativePosition = true;
                entity.appendChild(child);
              }
            }
          })
          .catch((error) => {
            console.error(`[getters_points] Ошибка загрузки GLTF для ${point.name}:`, error);
          });
        
        pointsLayer.add(entity);
        
        // Сохраняем информацию для анимации
        getterStations.push({
            entity,
            point,
            currentYaw: 0,
            currentPitch: 45,
            currentTarget: null
        });
    }
}

// ═══════════════════════════════════════════════════
// ФУНКЦИИ ДЛЯ ВРАЩЕНИЯ АНТЕНН К СПУТНИКАМ
// ═══════════════════════════════════════════════════

/**
 * Вычисляет расстояние между двумя точками на сфере (Haversine)
 */
function haversineDistance(lon1, lat1, lon2, lat2) {
  const R = 6371; // радиус Земли, км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Вычисляет азимут (bearing) от станции к спутнику
 */
function calculateAzimuth(stationLon, stationLat, satLon, satLat) {
  const dLon = (satLon - stationLon) * Math.PI / 180;
  const lat1 = stationLat * Math.PI / 180;
  const lat2 = satLat * Math.PI / 180;

  const x = Math.sin(dLon) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = Math.atan2(x, y) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Вычисляет угол возвышения (elevation) спутника
 */
function calculateElevation(stationLon, stationLat, satLon, satLat, satHeightKm) {
  const groundDist = haversineDistance(stationLon, stationLat, satLon, satLat);
  const elevRad = Math.atan2(satHeightKm, groundDist);
  return elevRad * 180 / Math.PI;
}

/**
 * Находит ближайший видимый спутник для данной станции
 */
function findNearestSatellite(station) {
  let nearest = null;
  let minDist = Infinity;
  const maxRange = 3000; // максимальная дальность в км
  const maxElevation = 10; // минимальный угол возвышения

  for (const [name, satellites] of satellitesByLayer.entries()) {
    const layerInstance = constellationLayers.get(name);
    if (layerInstance && layerInstance._visibility === false) continue;

    for (const sat of satellites) {
      if (sat.lon === null || sat.lat === null || sat.height === null) continue;

      const dist = haversineDistance(
        station.point.lon, station.point.lat,
        sat.lon, sat.lat
      );

      if (dist > maxRange) continue;

      const elevation = calculateElevation(
        station.point.lon, station.point.lat,
        sat.lon, sat.lat,
        sat.height / 1000
      );
      if (elevation < maxElevation) continue;

      if (dist < minDist) {
        minDist = dist;
        nearest = sat;
      }
    }
  }

  return nearest;
}

/**
 * Плавно интерполирует угол
 */
function lerpAngle(current, target, speed) {
  let diff = target - current;

  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  if (Math.abs(diff) < 0.5) return target;
  return current + diff * speed;
}

/**
 * Обновление вращения всех getter-антенн
 * Вызывается из main.js в цикле отрисовки
 */
export function updateGetterRotations() {
  for (const station of getterStations) {
    const nearest = findNearestSatellite(station);
    station.currentTarget = nearest;

    if (nearest) {
      const targetYaw = calculateAzimuth(
        station.point.lon, station.point.lat,
        nearest.lon, nearest.lat
      );

      const targetPitch = calculateElevation(
        station.point.lon, station.point.lat,
        nearest.lon, nearest.lat,
        nearest.height / 1000
      );

      station.currentYaw = lerpAngle(station.currentYaw, targetYaw, 0.08);
      station.currentPitch = lerpAngle(station.currentPitch, targetPitch, 0.08);

      // Применяем вращение к модели
      applyRotationToEntity(station.entity, station.currentYaw, station.currentPitch);
    } else {
      // Дежурное вращение
      station.currentYaw = (station.currentYaw + 0.3) % 360;
      station.currentPitch = lerpAngle(station.currentPitch, 45, 0.02);

      // Применяем вращение к модели
      applyRotationToEntity(station.entity, station.currentYaw, station.currentPitch);
    }
  }
}

/**
 * Применяет вращение к Entity (yaw - азимут, pitch - элевация)
 */
function applyRotationToEntity(entity, yaw, pitch) {
  if (!entity || !entity._children || entity._children.length === 0) return;

  // Конвертируем углы в радианы
  const yawRad = (yaw * Math.PI) / 180;
  const pitchRad = (pitch * Math.PI) / 180;
  
  // Применяем вращение ко всем дочерним entities (GLTF модель)
  for (const child of entity._children) {
    if (child.setOrientation) {
      // Создаем кватернион из углов Эйлера (yaw, pitch, roll)
      // Yaw - вращение вокруг Z (вертикальная ось)
      // Pitch - вращение вокруг Y (наклон вверх-вниз)
      const sy = Math.sin(yawRad / 2);
      const cy = Math.cos(yawRad / 2);
      const sp = Math.sin(pitchRad / 2);
      const cp = Math.cos(pitchRad / 2);
      
      // Quaternion: w, x, y, z
      const quat = {
        w: cy * cp,
        x: cy * sp,
        y: sy * cp,
        z: -sy * sp
      };
      
      child.setOrientation(quat.x, quat.y, quat.z, quat.w);
    }
  }
}