// Контроллеры UI и обработчики событий
import { layer, Entity, LonLat } from "https://cdn.jsdelivr.net/npm/@openglobus/og@latest/lib/og.es.js";
import { constellations } from "../config/constellations.js";
import { makeRingIcon } from "../utils/icons.js";
import { 
  loadConstellation, 
  clearAllConstellations,
  constellationLayers, 
  trailLayers, 
  satellitesByLayer,
  getVisibleCount
} from "../services/satellites.js";
import { 
  statusEl, 
  countEl, 
  satelliteList, 
  trackStatus,
  uiEl,
  trailToggle,
  renderBtn,
  clearBtn,
  undoTrackBtn
} from "./elements.js";

// Состояние
export const selectionState = new Map();
export let trailsEnabled = false;
export let trackedSatellite = null;
export let selectionEntity = null;
export let selectionLayer = null;

// Инициализация состояния выбора
for (const cfg of constellations) {
  selectionState.set(cfg.name, false);
}

// Создание иконки выделения
const selectionRingIcon = makeRingIcon("#FF1744");

// Инициализация слоя выделения
export function initSelectionLayer(globe) {
  selectionLayer = new layer.Vector("Selection", {
    pickingEnabled: false,
    clampToGround: false
  });
  globe.planet.addLayer(selectionLayer);
}

// Обновление счетчика
export function updateVisibleCount() {
  countEl.textContent = `Satellites on scene: ${getVisibleCount()}`;
}

// Обеспечение наличия entity выделения
function ensureSelectionEntity() {
  if (selectionEntity) {
    return;
  }
  selectionEntity = new Entity({
    name: "selection-ring",
    lonlat: new LonLat(0, 0, 0),
    billboard: {
      src: selectionRingIcon,
      size: [32, 32]
    }
  });
  selectionLayer.add(selectionEntity);
  selectionEntity.setVisibility(false);
}

// Установка отслеживаемого спутника
export function setTrackedSatellite(item) {
  trackedSatellite = item;
  ensureSelectionEntity();
  if (item && item.lon !== null && item.lat !== null) {
    selectionEntity.setLonLat(new LonLat(item.lon, item.lat, item.height || 0));
    selectionEntity.setVisibility(true);
    trackStatus.textContent = `Selected: ${item.name}`;
  } else {
    selectionEntity.setVisibility(false);
    trackStatus.textContent = "Selected: none";
  }
}

// Обновление списка спутников
export function refreshSatelliteList() {
  satelliteList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const [name, satellites] of satellitesByLayer.entries()) {
    const layerInstance = constellationLayers.get(name);
    if (layerInstance && layerInstance._visibility === false) {
      continue;
    }

    for (const item of satellites) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:8px;margin:4px 0;";

      const label = document.createElement("div");
      label.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
      label.textContent = `${item.name} (ID ${item.id})`;

      const trackBtn = document.createElement("button");
      trackBtn.textContent = "Track";
      trackBtn.style.cssText = "padding:4px 8px;border-radius:6px;border:none;background:#E53935;color:#fff;cursor:pointer;";
      trackBtn.addEventListener("click", () => {
        setTrackedSatellite(item);
      });

      row.appendChild(label);
      row.appendChild(trackBtn);
      fragment.appendChild(row);
    }
  }

  satelliteList.appendChild(fragment);
}

// Добавление чекбокса для созвездия
function addSelectionCheckbox(cfg) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:4px;margin:4px 0;";

  const label = document.createElement("div");
  label.style.cssText = "color:#fff;margin-right:4px;";
  label.textContent = cfg.name;

  const toggle = document.createElement("label");
  toggle.className = "switch";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.dataset.name = cfg.name;

  const slider = document.createElement("span");
  slider.className = "slider";

  toggle.appendChild(input);
  toggle.appendChild(slider);

  row.appendChild(label);
  row.appendChild(toggle);
  uiEl.appendChild(row);

  input.addEventListener("change", (e) => {
    selectionState.set(cfg.name, e.target.checked);
  });
}

// Инициализация чекбоксов
for (const cfg of constellations) {
  addSelectionCheckbox(cfg);
}

// Обработчик переключения следов
trailToggle.querySelector("input").addEventListener("change", (e) => {
  trailsEnabled = e.target.checked;
  for (const cfg of constellations) {
    const layerInstance = constellationLayers.get(cfg.name);
    const trailLayer = trailLayers.get(cfg.name);
    if (trailLayer) {
      trailLayer.setVisibility(trailsEnabled && layerInstance?._visibility !== false);
    }
  }
});

// Обработчик кнопки рендера
export function setupRenderButton(globe) {
  renderBtn.addEventListener("click", async () => {
    statusEl.textContent = "Loading selected constellations...";
    for (const cfg of constellations) {
      const selected = selectionState.get(cfg.name);
      const layerInstance = constellationLayers.get(cfg.name);
      const trailLayer = trailLayers.get(cfg.name);

      if (!selected) {
        if (layerInstance) {
          layerInstance.setVisibility(false);
        }
        if (trailLayer) {
          trailLayer.setVisibility(false);
        }
        continue;
      }

      if (!layerInstance) {
        try {
          await loadConstellation(cfg, globe);
        } catch (error) {
          console.error(error);
          statusEl.textContent = `Error: ${cfg.name}. Check CORS/network.`;
          continue;
        }
      }

      const loadedLayer = constellationLayers.get(cfg.name);
      const loadedTrail = trailLayers.get(cfg.name);
      if (loadedLayer) {
        loadedLayer.setVisibility(true);
      }
      if (loadedTrail) {
        loadedTrail.setVisibility(trailsEnabled);
      }
    }

    updateVisibleCount();
    refreshSatelliteList();
    statusEl.textContent = "Constellations rendered.";
  });
}

// Обработчик кнопки очистки
export function setupClearButton(globe) {
  clearBtn.addEventListener("click", () => {
    clearAllConstellations(globe);
    trackedSatellite = null;
    if (selectionEntity) {
      selectionEntity.setVisibility(false);
    }
    updateVisibleCount();
    refreshSatelliteList();
    trackStatus.textContent = "Selected: none";
    statusEl.textContent = "Scene cleared. Select constellations and click 'Render'.";
  });
}

// Обработчик кнопки отмены отслеживания
undoTrackBtn.addEventListener("click", () => {
  trackedSatellite = null;
  if (selectionEntity) {
    selectionEntity.setVisibility(false);
  }
  trackStatus.textContent = "Selected: none";
});

// Обновление позиции отслеживаемого спутника
export function updateTrackedSatellite() {
  if (trackedSatellite && selectionEntity && trackedSatellite.lon !== null) {
    selectionEntity.setLonLat(new LonLat(trackedSatellite.lon, trackedSatellite.lat, trackedSatellite.height || 0));
    selectionEntity.setVisibility(true);
  }
}

// Получение отслеживаемого спутника
export function getTrackedSatellite() {
  return trackedSatellite;
}

// Получение статуса следов
export function getTrailsEnabled() {
  return trailsEnabled;
}
