import { Vector, Entity, LonLat } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

let testMarker = null;
let markerLayer = null;

// Создание красной точки на глобусе
export function createRedMarker(globe) {
    // Создаем векторный слой для маркера (прижимаем к поверхности)
    markerLayer = new Vector("Red Marker Layer", { clampToGround: true });
    globe.planet.addLayer(markerLayer);

    // Начальные координаты (Москва)
    const initialLon = 37.617;
    const initialLat = 55.755;

    // Создаем красную точку
    testMarker = new Entity({
        lonlat: new LonLat(initialLon, initialLat, 0),
        billboard: {
            src: createRedCircle(),
            width: 40,
            height: 40,
            color: "red"
        }
    });

    markerLayer.add(testMarker);

    return { lon: initialLon, lat: initialLat };
}

// Обновление позиции красной точки
export function updateMarkerPosition(lon, lat) {
    if (testMarker) {
        testMarker.setLonLat(new LonLat(lon, lat, 0));
    }
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

