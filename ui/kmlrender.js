import { KML } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

export async function renderKML(source, globe, name = "KML Layer") {
    const kmlLayer = new KML(name, {
        clampToGround: true
    });
    globe.planet.addLayer(kmlLayer);

    let result = null;

    if (typeof source === "string") {
        result = await kmlLayer.addKmlFromUrl(source);
    } else if (source instanceof File) {
        result = await kmlLayer.addKmlFromFiles([source]);
    } else if (Array.isArray(source) && source.length > 0 && source[0] instanceof File) {
        result = await kmlLayer.addKmlFromFiles(source);
    } else {
        throw new Error("Unsupported KML source");
    }

    return {
        layer: kmlLayer,
        entities: result?.entities,
        extent: result?.extent
    };
}

export default renderKML;