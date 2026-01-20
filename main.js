// Основной файл приложения
import { Globe, terrain, control } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";
import { realisticEarthLayer, baseLayer } from "./config/layers.js";
import { updateSatellites } from "./services/satellites.js";
import { 
  updateTime, 
  statusEl 
} from "./ui/elements.js";
import { 
  initSelectionLayer,
  setupRenderButton,
  setupClearButton,
  updateTrackedSatellite,
  getTrailsEnabled
} from "./ui/controls.js";
import { initCustomSatelliteModal } from "./services/add_custom_satellites.js";

// Инициализация Globe
const globe = new Globe({
  target: "globus",
  name: "Earth",
  terrain: new terrain.EmptyTerrain(),
  layers: [realisticEarthLayer, baseLayer]
});

globe.planet.camera.maxAltitude = 1.2e9;
globe.planet.addControl(new control.LayerSwitcher());

// Настройка рендерера
globe.renderer.clearColor = new Float32Array([0, 0, 0, 1]);
if (globe.renderer.controls.SimpleSkyBackground) {
  globe.renderer.controls.SimpleSkyBackground.deactivate();
}
globe.planet._nightTextureSrc = null;
globe.planet._specularTextureSrc = null;

// Инициализация UI
initSelectionLayer(globe);
setupRenderButton(globe);
setupClearButton(globe);
initCustomSatelliteModal(globe);

// Запуск обновления времени
updateTime();
setInterval(updateTime, 200);

// Начальное сообщение
statusEl.textContent = "Scene cleared. Select constellations and click 'Render'.";

let lastUpdate = 0;
globe.renderer.events.on("draw", () => {
  const now = Date.now();
  if (now - lastUpdate < 1000) {
    return;
  }
  lastUpdate = now;
  updateSatellites(new Date(), getTrailsEnabled());
  updateTrackedSatellite();
});

window.globe = globe;