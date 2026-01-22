import { markerFileInput, markerLoadBtn, markerStatus, markerList } from "./elements.js";
import { addMarkers, getMarkers, removeMarkerById } from "../services/Gettersline.js";

export function initMarkerJsonControls() {
  renderMarkerList();

  markerLoadBtn.addEventListener("click", async () => {
    const file = markerFileInput.files && markerFileInput.files[0];
    if (!file) {
      markerStatus.textContent = "Select a JSON file.";
      return;
    }

    markerStatus.textContent = "Loading marker...";
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const points = normalizeMarkers(data);
      addMarkers(points);
      renderMarkerList();
      markerStatus.textContent = `Added ${points.length} marker(s).`;
    } catch (error) {
      console.error(error);
      markerStatus.textContent = `Error: ${error.message || "Failed to load file."}`;
    }
  });
}

function normalizeMarkers(data) {
  const items = Array.isArray(data) ? data : [data];
  if (!items.length) {
    throw new Error("JSON must contain at least one point.");
  }

  return items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Item ${index + 1} must be an object.`);
    }

    const lat = getNumber(item.lat ?? item.latitude);
    const lon = getNumber(item.lng ?? item.lon ?? item.longitude);

    if (lat === null || lon === null) {
      throw new Error(`Item ${index + 1} must include lat and lng (or lon).`);
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error(`Item ${index + 1} has invalid coordinates.`);
    }

    return {
      name: typeof item.name === "string" ? item.name : `Marker ${index + 1}`,
      lat,
      lon
    };
  });
}

function getNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function renderMarkerList() {
  const items = getMarkers();
  markerList.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No markers yet.";
    empty.style.cssText = "color:#90A4AE;font-size:11px;";
    markerList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const marker of items) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:6px;align-items:center;margin-bottom:6px;";

    const label = document.createElement("div");
    label.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    label.textContent = `${marker.name} (${marker.lat.toFixed(3)}, ${marker.lon.toFixed(3)})`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.cssText = "padding:4px 6px;border-radius:6px;border:none;background:#EF5350;color:#fff;cursor:pointer;";
    removeBtn.addEventListener("click", () => {
      if (removeMarkerById(marker.id)) {
        renderMarkerList();
        markerStatus.textContent = "Marker removed.";
      }
    });

    row.appendChild(label);
    row.appendChild(removeBtn);
    fragment.appendChild(row);
  }

  markerList.appendChild(fragment);
}
