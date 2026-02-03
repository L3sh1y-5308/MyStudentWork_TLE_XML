// Конфигурация базовых слоев карты
import { layer } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";

export const realisticEarthLayer = new layer.XYZ("Realistic Earth", {
  isBaseLayer: true,
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  maxZoom: 19,
  attribution: "Tiles © Esri"
});

export const detailedEarthLayer = new layer.XYZ("Detailed Earth (Clarity)", {
  isBaseLayer: true,
  url: "https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  maxZoom: 20,
  attribution: "Tiles © Esri"
});

detailedEarthLayer.setVisibility(false);

export const baseLayer = new layer.OpenStreetMap("OpenStreetMap");
baseLayer.setVisibility(false);
