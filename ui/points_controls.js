import { pointsFileInput, pointsLoadBtn, pointsClearBtn, pointsStatus } from "./elements.js";
import { initPointsLayer, loadPointsFromFile, renderPoints, clearPoints } from "../services/getters_points.js";

export function initPointsControls(globe) {
  initPointsLayer(globe);

  pointsLoadBtn.addEventListener("click", async () => {
    const file = pointsFileInput.files && pointsFileInput.files[0];
    if (!file) {
      pointsStatus.textContent = "Select a JSON file.";
      return;
    }

    pointsStatus.textContent = "Loading points...";
    try {
      const points = await loadPointsFromFile(file);
      renderPoints(points);
      pointsStatus.textContent = `Loaded ${points.length} point(s).`;
    } catch (error) {
      console.error(error);
      pointsStatus.textContent = `Error: ${error.message || "Failed to load file."}`;
    }
  });

  pointsClearBtn.addEventListener("click", () => {
    clearPoints();
    pointsStatus.textContent = "Points cleared.";
  });
}
