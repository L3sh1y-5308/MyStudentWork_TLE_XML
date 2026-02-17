// Основной файл приложения
import { Globe, terrain, control } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";
import { realisticEarthLayer, detailedEarthLayer, baseLayer } from "./config/layers.js";
import { updateSatellites } from "./services/satellites.js";
import { 
  statusEl 
} from "./ui/elements.js";
import { initTimeControls, getSimulatedDate, syncTimeControls } from "./ui/time_controls.js";
import { 
  initSelectionLayer,
  setupRenderButton,
  setupClearButton,
  updateTrackedSatellite,
  getTrailsEnabled
} from "./ui/controls.js";
import { initCustomSatelliteModal } from "./services/add_custom_satellites.js";
import { initMarkerLayers, updateMarkerRotations } from "./services/Gettersline.js";
import { initMarkerJsonControls } from "./ui/marker_json_controls.js";
import { initKmlControls } from "./ui/kml_controls.js";
import { initMenuToggle } from "./ui/menu_toggle.js";
import { updateGetterRotations } from "./services/getters_points.js";
import { initScenarioControls } from "./ui/scenario_controls.js";

// Инициализация Globe
const globe = new Globe({
  target: "globus",
  name: "Earth",
  terrain: new terrain.EmptyTerrain(),
  layers: [realisticEarthLayer, detailedEarthLayer, baseLayer]
});

// Сделать базовые слои чуть светлее
const tintDetailedLayer = (layer) => {
  if (!layer) return;
  layer._ambient = new Float32Array([0.30, 0.28, 0.40]);
  layer._diffuse = new Float32Array([1.08, 1.06, 1.24]);
};

tintDetailedLayer(detailedEarthLayer);

globe.planet.camera.maxAltitude = 1.2e9;
globe.planet.addControl(new control.LayerSwitcher());

// Настройка рендерера
globe.renderer.clearColor = new Float32Array([0, 0, 0, 1]);
if (globe.renderer.controls.SimpleSkyBackground) {
  globe.renderer.controls.SimpleSkyBackground.deactivate();
}
globe.planet._nightTextureSrc = null;
globe.planet._specularTextureSrc = null;

// Атмосфера (озоновый слой) без изменения фона
globe.planet.atmosphereEnabled = true;
globe.planet.atmosphereMinOpacity = 0.06;
globe.planet.atmosphereMaxOpacity = 0.35;
if (globe.renderer.controls.Atmosphere) {
  globe.renderer.controls.Atmosphere.opacity = 0.0;
}

// Мягкость цвета
globe.renderer.gamma = 1.1;
globe.renderer.exposure = 0.95;

// Инициализация UI
initSelectionLayer(globe);
setupRenderButton(globe);
setupClearButton(globe);
initCustomSatelliteModal(globe);
initMarkerJsonControls();
initMarkerLayers(globe);
initKmlControls(globe);
initMenuToggle();
initTimeControls();
initScenarioControls(globe);

// Запуск обновления времени
setInterval(() => {
  syncTimeControls(getSimulatedDate());
}, 200);

// Начальное сообщение
statusEl.textContent = "Scene cleared. Select constellations and click 'Render'.";

let lastUpdate = 0;
globe.renderer.events.on("draw", () => {
  const now = Date.now();
  if (now - lastUpdate < 1000) {
    return;
  }
  lastUpdate = now;
  updateSatellites(getSimulatedDate(), getTrailsEnabled());
  updateTrackedSatellite();
  updateGetterRotations();
  updateMarkerRotations();
});

window.globe = globe;