import { Vector, Entity, LonLat } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

let markerLayer = null;
let rayLayer = null;
let markerPosition = null;
const markers = [];
const markerPositions = [];
let markerIdCounter = 1;
let markerGlobe = null;

// Хранение пар getter'ов
const getterPairs = [];
let pairIdCounter = 1;

// Инициализация слоев маркеров и лучей
export function initMarkerLayers(globe) {
    markerGlobe = globe;
    if (!markerLayer) {
        markerLayer = new Vector("Red Marker Layer", { clampToGround: true });
        globe.planet.addLayer(markerLayer);
    }

    if (!rayLayer) {
        rayLayer = new Vector("Ray Layer", { clampToGround: false });
        globe.planet.addLayer(rayLayer);
    }
}

// Создание красной точки на глобусе
export function createRedMarker(globe) {
    initMarkerLayers(globe);

    // Начальные координаты (Москва)
    const initialLon = 37.617;
    const initialLat = 55.755;

    const marker = createMarkerAt(initialLon, initialLat, "Red Marker");
    setActiveMarker(initialLon, initialLat);

    return { lon: initialLon, lat: initialLat, marker };
}

// Создание новой точки по координатам
export function createMarkerAt(lon, lat, name = "Marker") {
    if (!markerLayer) {
        if (markerGlobe) {
            initMarkerLayers(markerGlobe);
        } else {
            throw new Error("Marker layers are not initialized.");
        }
    }

    const entity = new Entity({
        name,
        lonlat: new LonLat(lon, lat, 0),
        billboard: {
            src: createRedCircle(),
            width: 40,
            height: 40,
            color: "red",
            scaleByDistance: [100, 100, 1]
        }
    });

    const marker = {
        id: markerIdCounter++,
        name,
        lat,
        lon,
        entity
    };

    markerLayer.add(entity);
    if (typeof markerLayer.setVisibility === "function") {
        markerLayer.setVisibility(true);
    }
    markers.push(marker);
    markerPositions.push({ lon, lat });
    return marker;
}

// Создание нескольких точек по JSON-координатам
export function addMarkers(points) {
    if (!markerLayer) {
        if (markerGlobe) {
            initMarkerLayers(markerGlobe);
        } else {
            throw new Error("Marker layers are not initialized.");
        }
    }
    if (!Array.isArray(points)) {
        throw new Error("Points must be an array.");
    }

    const created = [];
    for (const point of points) {
        created.push(createMarkerAt(point.lon, point.lat, point.name || "Marker"));
    }

    if (points.length > 0) {
        const last = points[points.length - 1];
        setActiveMarker(last.lon, last.lat);
    }

    return created;
}

// Добавление пар getter'ов из JSON
export function addGetterPairs(pairsData) {
    if (!markerLayer) {
        if (markerGlobe) {
            initMarkerLayers(markerGlobe);
        } else {
            throw new Error("Marker layers are not initialized.");
        }
    }
    
    if (!Array.isArray(pairsData)) {
        throw new Error("Pairs data must be an array.");
    }

    const addedPairs = [];

    for (const pairData of pairsData) {
        if (!pairData.getters || !Array.isArray(pairData.getters) || pairData.getters.length !== 2) {
            console.warn(`Skipping pair: must have exactly 2 getters.`, pairData);
            continue;
        }

        const pair = {
            id: pairIdCounter++,
            pairId: pairData.pairId || `pair-${pairIdCounter}`,
            getters: []
        };

        console.log(`[addGetterPairs] Creating pair "${pair.pairId}"`);

        // Создаем оба getter'а
        for (const getterData of pairData.getters) {
            const marker = createMarkerAt(
                getterData.lon,
                getterData.lat,
                getterData.name || "Getter"
            );
            
            // Связываем маркер с парой
            marker.pairId = pair.pairId;
            
            pair.getters.push({
                markerId: marker.id,
                lon: getterData.lon,
                lat: getterData.lat,
                name: getterData.name
            });
            
            console.log(`[addGetterPairs] Added getter "${getterData.name}" to pair "${pair.pairId}"`);
        }

        getterPairs.push(pair);
        addedPairs.push(pair);
    }

    console.log(`[addGetterPairs] Total pairs added: ${getterPairs.length}`, getterPairs);
    return addedPairs;
}

// Получение всех пар getter'ов
export function getGetterPairs() {
    return getterPairs.map(pair => ({
        id: pair.id,
        pairId: pair.pairId,
        getters: pair.getters.map(g => ({
            markerId: g.markerId,
            name: g.name,
            lat: g.lat,
            lon: g.lon
        }))
    }));
}

// Очистка пар getter'ов
export function clearGetterPairs() {
    getterPairs.length = 0;
}

// Очистка всех маркеров
export function clearMarkers() {
    if (markerLayer) {
        markerLayer.clear();
    }
    if (rayLayer) {
        rayLayer.clear();
    }
    markers.length = 0;
    markerPositions.length = 0;
    markerPosition = null;
    getterPairs.length = 0;
}

// Обновление позиции красной точки
export function updateMarkerPosition(lon, lat) {
    if (markers.length > 0) {
        const last = markers[markers.length - 1];
        last.entity.setLonLat(new LonLat(lon, lat, 0));
        last.lon = lon;
        last.lat = lat;
        markerPositions[markerPositions.length - 1] = { lon, lat };
    }
    markerPosition = { lon, lat };
}

// Получение текущей позиции маркера
export function getMarkerPosition() {
    return markerPosition;
}

export function getMarkers() {
    return markers.map((marker) => ({
        id: marker.id,
        name: marker.name,
        lat: marker.lat,
        lon: marker.lon
    }));
}

export function removeMarkerById(id) {
    if (!markerLayer) {
        return false;
    }

    const index = markers.findIndex((marker) => marker.id === id);
    if (index === -1) {
        return false;
    }

    markers.splice(index, 1);
    markerPositions.splice(index, 1);

    markerLayer.clear();
    for (const marker of markers) {
        markerLayer.add(marker.entity);
    }

    if (markerPositions.length > 0) {
        const last = markerPositions[markerPositions.length - 1];
        markerPosition = { lon: last.lon, lat: last.lat };
    } else {
        markerPosition = null;
    }

    return true;
}

// Установить активную точку для вычисления лучей
function setActiveMarker(lon, lat) {
    markerPosition = { lon, lat };
}

// Обновление лучей от спутников к красной точке
export function updateRaysToMarker(satellites, maxDistance = 5000) {
    if (!rayLayer || markerPositions.length === 0) return;

    // Очищаем старые лучи
    rayLayer.clear();

    for (let i = 0; i < markerPositions.length; i += 1) {
        const markerPos = markerPositions[i];
        const nearSatellites = [];

        // Находим ближайшие спутники
        for (const sat of satellites) {
            if (!sat.lon || !sat.lat || !sat.height) continue;

            // Вычисляем расстояние (упрощенное, в км)
            const distance = calculateDistance(
                markerPos.lat, markerPos.lon,
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
            if (rayIntersectsEarth(markerPos, sat)) {
                continue; // Пропускаем этот луч
            }

            const color = getColorByDistance(distance, maxDistance);

            const rayEntity = new Entity({
                name: `ray-${i}-${sat.name}`,
                polyline: {
                    pathLonLat: [
                        [
                            new LonLat(markerPos.lon, markerPos.lat, 0),
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
}

// Обновление лучей для пар getter'ов (только к своим спутникам)
// Обновление лучей для пар getter'ов (ищут общий спутник, если нет - каждый ищет свой)
export function updateRaysForGetterPairs(satellites, maxDistance = 7000) {
    if (!rayLayer) {
        console.warn(`[updateRaysForGetterPairs] Ray layer not initialized`);
        return;
    }
    
    // Очищаем старые лучи
    rayLayer.clear();

    // Если нет пар, не делаем ничего
    if (getterPairs.length === 0) {
        return;
    }

    console.log(`[updateRaysForGetterPairs] ===== PROCESSING ${getterPairs.length} PAIRS =====`);
    console.log(`[updateRaysForGetterPairs] Available satellites: ${satellites.length}`);

    // Проходим по каждой паре
    for (const pair of getterPairs) {
        const getter1 = pair.getters[0];
        const getter2 = pair.getters[1];
        
        console.log(`\n[updateRaysForGetterPairs] ===== PAIR: ${pair.pairId} =====`);
        console.log(`[updateRaysForGetterPairs] Getter1: "${getter1.name}" at (${getter1.lon}, ${getter1.lat})`);
        console.log(`[updateRaysForGetterPairs] Getter2: "${getter2.name}" at (${getter2.lon}, ${getter2.lat})`);
        console.log(`[updateRaysForGetterPairs] Max distance: ${maxDistance}km\n`);

        // Собираем спутники в досегаемости для каждого getter'а
        const getter1Satellites = [];
        const getter2Satellites = [];
        const commonSatellites = [];

        let processedCount = 0;
        let accessibleCount = 0;

        for (const sat of satellites) {
            if (!sat.lon && sat.lon !== 0) continue;
            if (!sat.lat && sat.lat !== 0) continue;
            if (!sat.height && sat.height !== 0) continue;

            processedCount++;

            const getter1Distance = calculateDistance(
                getter1.lat, getter1.lon,
                sat.lat, sat.lon,
                sat.height / 1000
            );

            const getter2Distance = calculateDistance(
                getter2.lat, getter2.lon,
                sat.lat, sat.lon,
                sat.height / 1000
            );

            const getter1Can = getter1Distance <= maxDistance;
            const getter2Can = getter2Distance <= maxDistance;

            // Логируем только доступные спутники для краткости
            if (getter1Can || getter2Can) {
                accessibleCount++;
                const status1 = getter1Can ? `✓ ${getter1Distance.toFixed(0)}km` : `✗ ${getter1Distance.toFixed(0)}km`;
                const status2 = getter2Can ? `✓ ${getter2Distance.toFixed(0)}km` : `✗ ${getter2Distance.toFixed(0)}km`;
                console.log(`  "${sat.name}": G1:${status1} | G2:${status2}`);
            }

            // Если оба могут дотянуться - это общий спутник
            if (getter1Can && getter2Can) {
                commonSatellites.push({
                    sat,
                    getter1Distance,
                    getter2Distance,
                    minDistance: Math.min(getter1Distance, getter2Distance)
                });
            }
            // Иначе добавляем в индивидуальные
            else if (getter1Can) {
                getter1Satellites.push({
                    sat,
                    distance: getter1Distance
                });
            } else if (getter2Can) {
                getter2Satellites.push({
                    sat,
                    distance: getter2Distance
                });
            }
        }

        console.log(`\n[updateRaysForGetterPairs] Processed: ${processedCount} satellites, Accessible: ${accessibleCount}`);
        console.log(`[updateRaysForGetterPairs] Common: ${commonSatellites.length}, G1 only: ${getter1Satellites.length}, G2 only: ${getter2Satellites.length}\n`);

        let rayCount = 0;

        // Приоритет 1: Если есть общие спутники - рейкастим ТОЛЬКО в них
        if (commonSatellites.length > 0) {
            console.log(`[updateRaysForGetterPairs] Using COMMON satellites mode`);
            
            // Сортируем по минимальному расстоянию и берем ТОЛЬКО 1 ближайший
            commonSatellites.sort((a, b) => a.minDistance - b.minDistance);
            const closest = commonSatellites.slice(0, 1);

            for (const { sat, getter1Distance, getter2Distance } of closest) {
                console.log(`  Satellite "${sat.name}": both can reach (${getter1Distance.toFixed(0)}km, ${getter2Distance.toFixed(0)}km)`);

                // Луч от getter'а 1
                const getterPos1 = { lon: getter1.lon, lat: getter1.lat };
                if (!rayIntersectsEarth(getterPos1, sat)) {
                    const color = getColorByDistance(getter1Distance, maxDistance);
                    const rayEntity = new Entity({
                        name: `ray-pair-${pair.pairId}-${getter1.name}-${sat.name}`,
                        polyline: {
                            pathLonLat: [
                                [
                                    new LonLat(getterPos1.lon, getterPos1.lat, 0),
                                    new LonLat(sat.lon, sat.lat, sat.height)
                                ]
                            ],
                            thickness: 3,
                            color: color,
                            isClosed: false
                        }
                    });
                    rayLayer.add(rayEntity);
                    rayCount++;
                }

                // Луч от getter'а 2
                const getterPos2 = { lon: getter2.lon, lat: getter2.lat };
                if (!rayIntersectsEarth(getterPos2, sat)) {
                    const color = getColorByDistance(getter2Distance, maxDistance);
                    const rayEntity = new Entity({
                        name: `ray-pair-${pair.pairId}-${getter2.name}-${sat.name}`,
                        polyline: {
                            pathLonLat: [
                                [
                                    new LonLat(getterPos2.lon, getterPos2.lat, 0),
                                    new LonLat(sat.lon, sat.lat, sat.height)
                                ]
                            ],
                            thickness: 3,
                            color: color,
                            isClosed: false
                        }
                    });
                    rayLayer.add(rayEntity);
                    rayCount++;
                }
            }
        }
        // Приоритет 2: Если общих нет - каждый рейкастит в свой ближайший
        else {
            console.log(`[updateRaysForGetterPairs] Using INDIVIDUAL satellites mode`);

            // Луч от getter'а 1
            if (getter1Satellites.length > 0) {
                getter1Satellites.sort((a, b) => a.distance - b.distance);
                const sat = getter1Satellites[0].sat;
                const distance = getter1Satellites[0].distance;

                console.log(`  Getter1 → "${sat.name}" (${distance.toFixed(0)}km)`);

                const getterPos = { lon: getter1.lon, lat: getter1.lat };
                if (!rayIntersectsEarth(getterPos, sat)) {
                    const color = getColorByDistance(distance, maxDistance);
                    const rayEntity = new Entity({
                        name: `ray-pair-${pair.pairId}-${getter1.name}-${sat.name}`,
                        polyline: {
                            pathLonLat: [
                                [
                                    new LonLat(getterPos.lon, getterPos.lat, 0),
                                    new LonLat(sat.lon, sat.lat, sat.height)
                                ]
                            ],
                            thickness: 3,
                            color: color,
                            isClosed: false
                        }
                    });
                    rayLayer.add(rayEntity);
                    rayCount++;
                }
            }

            // Луч от getter'а 2
            if (getter2Satellites.length > 0) {
                getter2Satellites.sort((a, b) => a.distance - b.distance);
                const sat = getter2Satellites[0].sat;
                const distance = getter2Satellites[0].distance;

                console.log(`  Getter2 → "${sat.name}" (${distance.toFixed(0)}km)`);

                const getterPos = { lon: getter2.lon, lat: getter2.lat };
                if (!rayIntersectsEarth(getterPos, sat)) {
                    const color = getColorByDistance(distance, maxDistance);
                    const rayEntity = new Entity({
                        name: `ray-pair-${pair.pairId}-${getter2.name}-${sat.name}`,
                        polyline: {
                            pathLonLat: [
                                [
                                    new LonLat(getterPos.lon, getterPos.lat, 0),
                                    new LonLat(sat.lon, sat.lat, sat.height)
                                ]
                            ],
                            thickness: 3,
                            color: color,
                            isClosed: false
                        }
                    });
                    rayLayer.add(rayEntity);
                    rayCount++;
                }
            }
        }

        console.log(`[updateRaysForGetterPairs] Pair ${pair.pairId}: added ${rayCount} rays`);
    }
    console.log(`[updateRaysForGetterPairs] ===== DONE =====\n`);
}

// Вычисление расстояния между точкой на земле и спутником
// ФОРМУЛА: Haversine + высота спутника
// РЕЗУЛЬТАТ: если ≤ 7000км → ✓ ДОСТУПЕН, иначе ✗ НЕ ДОСТУПЕН
function calculateDistance(lat1, lon1, lat2, lon2, height) {
    // Шаг 1: Константы для расчета по земной поверхности
    const R = 6371; // Радиус Земли в км
    
    // Шаг 2: Разница в градусах между двумя точками
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    // Шаг 3: Формула Haversine для расчета расстояния по дуге земной поверхности
    // sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    // Шаг 4: Угол в радианах между двумя точками
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Шаг 5: Расстояние по земной поверхности (дугообразное)
    const surfaceDistance = R * c;
    
    // Шаг 6: Добавляем высоту спутника над земной поверхностью
    // Используем теорему Пифагора: √(расстояние² + высота²)
    // Если спутник прямо над точкой, расстояние = высота
    // Если спутник далеко, расстояние ≈ поверхностное расстояние
    const totalDistance = Math.sqrt(surfaceDistance * surfaceDistance + height * height);
    
    return totalDistance;
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

