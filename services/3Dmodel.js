import { Entity, EntityCollection, LonLat, layer } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

export function init3DModel(globe) {
    if (!globe || !globe.planet) {
        throw new Error("init3DModel: globe is not initialized");
    }

    const entities = new EntityCollection();
    const layer3d = new layer.Vector("3D objects", {
        entities: entities,
        clampToGround: true,
        pickingEnabled: false
    });
    globe.planet.addLayer(layer3d);

    const moscow = new LonLat(37.6173, 55.7558, 0);
    const modelEntity = new Entity({
        name: "Mushroom",
        lonlat: moscow,
        geoObject: {
            url: "config/MushroomMidle.glb",
            scale: 200.0,
            rotation: {
                yaw: 0,
                pitch: 0,
                roll: 0
            }
        }
    });

    entities.add(modelEntity);
    return { layer: layer3d, entity: modelEntity };
}