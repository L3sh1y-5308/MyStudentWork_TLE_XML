import { Vector, Entity, LonLat, Gltf, Vec3 } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

let testMarker = null;
let markerLayer = null;
let rayLayer = null;
let markerPosition = { lon: 37.617, lat: 55.755 };
const MARKER_MODEL_URL = "./res/uploads_files_5216065_Speakers.gltf";
const MARKER_MODEL_SCALE = 0.001;
const MARKER_MODEL_ALTITUDE = 1500;
const CAMERA_SCALE_NEAR = 300000;
const CAMERA_SCALE_FAR = 4000000;

// Создание 3D модели маркера на глобусе
export function createRedMarker(globe) {
    // Создаем векторный слой для маркера (прижимаем к поверхности)
    markerLayer = new Vector("Marker Model Layer", { clampToGround: false, pickingEnabled: false });
    globe.planet.addLayer(markerLayer);

    // Создаем слой для лучей от спутников к точке
    rayLayer = new Vector("Ray Layer", { clampToGround: false });
    globe.planet.addLayer(rayLayer);

    // Начальные координаты (Москва)
    const initialLon = 37.617;
    const initialLat = 55.755;
    markerPosition = { lon: initialLon, lat: initialLat };

    // Создаем корневую сущность для 3D модели
    testMarker = new Entity({
        lonlat: new LonLat(initialLon, initialLat, MARKER_MODEL_ALTITUDE),
        localFrame: true,
        scale: new Vec3(MARKER_MODEL_SCALE, MARKER_MODEL_SCALE, MARKER_MODEL_SCALE)
    });

    markerLayer.add(testMarker);

    globe.renderer.events.on("draw", () => {
        if (!testMarker) {
            return;
        }
        const height = globe.planet.camera.eyeHeight || CAMERA_SCALE_FAR;
        const t = Math.min(1, Math.max(0, (height - CAMERA_SCALE_NEAR) / (CAMERA_SCALE_FAR - CAMERA_SCALE_NEAR)));
        const factor = 0.6 + t * 1.4;
        const scaled = MARKER_MODEL_SCALE * factor;
        testMarker.setScale3v(new Vec3(scaled, scaled, scaled));
    });

    loadMarkerModel(MARKER_MODEL_URL)
        .then((entities) => {
            if (!testMarker) {
                return;
            }
            for (const entity of entities) {
                entity.relativePosition = true;
                testMarker.appendChild(entity);
            }
        })
        .catch((error) => {
            console.error("Failed to load marker model:", error);
        });

    return { lon: initialLon, lat: initialLat };
}

// Обновление позиции красной точки
export function updateMarkerPosition(lon, lat) {
    if (testMarker) {
        testMarker.setLonLat(new LonLat(lon, lat, MARKER_MODEL_ALTITUDE));
        markerPosition = { lon, lat };
    }
}

// Получение текущей позиции маркера
export function getMarkerPosition() {
    return markerPosition;
}

// Обновление лучей от спутников к красной точке
export function updateRaysToMarker(satellites, maxDistance = 5000) {
    if (!rayLayer || !markerPosition) return;

    // Очищаем старые лучи
    rayLayer.clear();

    const nearSatellites = [];
    
    // Находим ближайшие спутники
    for (const sat of satellites) {
        if (!sat.lon || !sat.lat || !sat.height) continue;
        
        // Вычисляем расстояние (упрощенное, в км)
        const distance = calculateDistance(
            markerPosition.lat, markerPosition.lon,
            sat.lat, sat.lon, sat.height / 1000
        );
        
        if (distance <= maxDistance) {
            nearSatellites.push({ sat, distance });
        }
    }

    // Сортируем по расстоянию и берем ближайшие
    nearSatellites.sort((a, b) => a.distance - b.distance);
    const closest = nearSatellites.slice(0, 10); // Берем 10 ближайших

    // Рисуем лучи
    for (const { sat, distance } of closest) {
        const color = getColorByDistance(distance, maxDistance);
        
        const rayEntity = new Entity({
            name: `ray-${sat.name}`,
            polyline: {
                pathLonLat: [
                    [
                        new LonLat(markerPosition.lon, markerPosition.lat, 0),
                        new LonLat(sat.lon, sat.lat, sat.height)
                    ]
                ],
                thickness: 2,
                color: color,
                isClosed: false
            }
        });
        
        rayLayer.add(rayEntity);
    }
}

// Вычисление расстояния между точкой на земле и спутником
function calculateDistance(lat1, lon1, lat2, lon2, height) {
    const R = 6371; // Радиус Земли в км
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const surfaceDistance = R * c;
    
    // Добавляем высоту спутника
    return Math.sqrt(surfaceDistance * surfaceDistance + height * height);
}

function toRad(degrees) {
    return degrees * Math.PI / 180;
}

// Цвет луча в зависимости от расстояния (зеленый близко, красный далеко)
function getColorByDistance(distance, maxDistance) {
    const ratio = Math.min(distance / maxDistance, 1);
    const r = Math.floor(255 * ratio);
    const g = Math.floor(255 * (1 - ratio));
    return `rgba(${r}, ${g}, 0, 0.7)`;
}

async function loadMarkerModel(url) {
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

    const gltf = new Gltf({ gltf: gltfJson, bin: buffers });
    return gltf.toEntities();
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

