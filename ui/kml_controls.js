import {
  kmlFileInput,
  kmlUrlInput,
  kmlLoadBtn,
  kmlClearBtn,
  kmlStatus,
  kmlList
} from "./elements.js";
import { renderKML } from "./kmlrender.js";

const kmlLayers = [];
let kmlIdCounter = 1;

export function initKmlControls(globe) {
  renderKmlList(globe);

  kmlLoadBtn.addEventListener("click", async () => {
    const file = kmlFileInput.files && kmlFileInput.files[0];
    const urlText = (kmlUrlInput.value || "").trim();

    if (!file && !urlText) {
      kmlStatus.textContent = "Select a KML file or paste a URL.";
      return;
    }

    let source = null;
    let displayName = "KML Layer";

    if (file) {
      source = file;
      displayName = file.name || `KML ${kmlIdCounter}`;
    } else {
      source = urlText;
      displayName = deriveNameFromUrl(urlText) || `KML ${kmlIdCounter}`;
    }

    kmlStatus.textContent = "Loading KML...";

    try {
      const layerName = `${displayName}`;
      const { layer, extent } = await renderKML(source, globe, layerName);

      const item = {
        id: kmlIdCounter++,
        name: displayName,
        url: typeof source === "string" ? source : displayName,
        layer,
        revokeUrl: null
      };
      kmlLayers.push(item);
      renderKmlList(globe);
      kmlStatus.textContent = `Loaded: ${displayName}`;

      if (extent && globe?.planet?.flyExtent) {
        globe.planet.flyExtent(extent);
      }

      if (file) {
        kmlFileInput.value = "";
      } else {
        kmlUrlInput.value = "";
      }
    } catch (error) {
      console.error(error);
      kmlStatus.textContent = `Error: ${error.message || "Failed to load KML."}`;
    }
  });

  kmlClearBtn.addEventListener("click", () => {
    clearAllKml(globe);
  });
}

function renderKmlList(globe) {
  kmlList.innerHTML = "";

  if (kmlLayers.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No layers yet.";
    empty.style.cssText = "color:#90A4AE;font-size:11px;";
    kmlList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const item of kmlLayers) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:6px;align-items:center;margin-bottom:6px;";

    const label = document.createElement("div");
    label.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    label.textContent = item.name;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.cssText = "padding:4px 6px;border-radius:6px;border:none;background:#EF5350;color:#fff;cursor:pointer;";
    removeBtn.addEventListener("click", () => {
      removeKml(item.id, globe);
    });

    row.appendChild(label);
    row.appendChild(removeBtn);
    fragment.appendChild(row);
  }

  kmlList.appendChild(fragment);
}

function removeKml(id, globe) {
  const index = kmlLayers.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }

  const [item] = kmlLayers.splice(index, 1);
  removeLayerFromGlobe(item, globe);
  if (item.revokeUrl) {
    item.revokeUrl();
  }

  renderKmlList(globe);
  kmlStatus.textContent = "KML removed.";
}

function clearAllKml(globe) {
  for (const item of kmlLayers.splice(0, kmlLayers.length)) {
    removeLayerFromGlobe(item, globe);
    if (item.revokeUrl) {
      item.revokeUrl();
    }
  }

  renderKmlList(globe);
  kmlStatus.textContent = "All KML layers cleared.";
}

function removeLayerFromGlobe(item, globe) {
  if (item.layer && globe?.planet && typeof globe.planet.removeLayer === "function") {
    globe.planet.removeLayer(item.layer);
  } else if (item.layer && typeof item.layer.setVisibility === "function") {
    item.layer.setVisibility(false);
  }
}

function deriveNameFromUrl(urlText) {
  try {
    const url = new URL(urlText, window.location.href);
    const fileName = url.pathname.split("/").filter(Boolean).pop();
    return fileName || "KML Layer";
  } catch {
    return "KML Layer";
  }
}
