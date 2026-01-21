import { Vector, Entity, LonLat } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

let testMarker = null;
let markerLayer = null;
let rayLayer = null;
let markerPosition = { lon: 37.617, lat: 55.755 };

// Создание красной точки на глобусе
export function createRedMarker(globe) {
    // Создаем векторный слой для маркера (прижимаем к поверхности)
    markerLayer = new Vector("Red Marker Layer", { clampToGround: true });
    globe.planet.addLayer(markerLayer);

    // Создаем слой для лучей от спутников к точке
    rayLayer = new Vector("Ray Layer", { clampToGround: false });
    globe.planet.addLayer(rayLayer);

    // Начальные координаты (Москва)
    const initialLon = 37.617;
    const initialLat = 55.755;
    markerPosition = { lon: initialLon, lat: initialLat };

    // Создаем красную точку
    testMarker = new Entity({
        lonlat: new LonLat(initialLon, initialLat, 0),
        billboard: {
            src: createRedCircle(),
            width: 40,
            height: 40,
            color: "red",
            // Фиксируем размер точки - не масштабируется с расстоянием
            // scaleByDistance отключает атмосферное уменьшение/увеличение
            scaleByDistance: [100, 100, 1]
        }
    });

    markerLayer.add(testMarker);

    return { lon: initialLon, lat: initialLat };
}

// Обновление позиции красной точки
export function updateMarkerPosition(lon, lat) {
    if (testMarker) {
        testMarker.setLonLat(new LonLat(lon, lat, 0));
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
        // Проверяем, не проходит ли луч сквозь Землю
        if (rayIntersectsEarth(markerPosition, sat)) {
            continue; // Пропускаем этот луч
        }
        
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

function toDeg(radians) {
    return radians * 180 / Math.PI;
}

// Проверка, проходит ли луч сквозь Землю
function rayIntersectsEarth(markerPos, satellite) {
    const R = 6371; // Радиус Земли в км
    
    // Конвертируем координаты в 3D декартовы координаты
    const p1 = lonLatToCartesian(markerPos.lon, markerPos.lat, 0, R);
    const p2 = lonLatToCartesian(satellite.lon, satellite.lat, satellite.height / 1000, R);
    
    // Вектор направления луча
    const d = {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: p2.z - p1.z
    };
    
    // Нормализуем вектор направления
    const len = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z);
    d.x /= len;
    d.y /= len;
    d.z /= len;
    
    // Проверяем пересечение луча со сферой (центр в 0,0,0)
    // Используем квадратное уравнение для пересечения луч-сфера
    const a = d.x * d.x + d.y * d.y + d.z * d.z;
    const b = 2 * (p1.x * d.x + p1.y * d.y + p1.z * d.z);
    const c = p1.x * p1.x + p1.y * p1.y + p1.z * p1.z - R * R;
    
    const discriminant = b * b - 4 * a * c;
    
    // Если дискриминант < 0, пересечения нет
    if (discriminant < 0) {
        return false;
    }
    
    // Находим точки пересечения
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
    
    // Проверяем, находится ли пересечение на отрезке между точками
    // t должен быть между 0 и len (длина отрезка)
    const maxT = len;
    
    // Если хотя бы одна точка пересечения находится на отрезке (0 < t < maxT),
    // значит луч проходит сквозь Землю
    return (t1 > 0 && t1 < maxT) || (t2 > 0 && t2 < maxT);
}

// Конвертация lon/lat/height в декартовы координаты
function lonLatToCartesian(lon, lat, height, earthRadius) {
    const latRad = toRad(lat);
    const lonRad = toRad(lon);
    const r = earthRadius + height;
    
    return {
        x: r * Math.cos(latRad) * Math.cos(lonRad),
        y: r * Math.cos(latRad) * Math.sin(lonRad),
        z: r * Math.sin(latRad)
    };
}

// Цвет луча в зависимости от расстояния (зеленый близко, красный далеко)
function getColorByDistance(distance, maxDistance) {
    const ratio = Math.min(distance / maxDistance, 1);
    const r = Math.floor(255 * ratio);
    const g = Math.floor(255 * (1 - ratio));
    return `rgba(${r}, ${g}, 0, 0.7)`;
}

// Создание SVG красного круга
function createRedCircle() {
    const svg = `
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="15" fill="red" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20" r="5" fill="white"/>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

