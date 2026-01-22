import { markerFileInput, markerLoadBtn, markerStatus } from "./elements.js";
import { addMarkers } from "../services/Gettersline.js";

export function initMarkerJsonControls() {
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
