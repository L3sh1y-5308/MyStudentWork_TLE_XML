import { loadConstellation } from "./satellites.js";
import { updateVisibleCount, refreshSatelliteList } from "../ui/controls.js";

// Create a constellation from raw TLE text (string)
export async function addCustomTLE({ name, tleText, color = "#48bf24", speedMultiplier = 1 }, globe) {
  const tmpUrl = URL.createObjectURL(new Blob([tleText], { type: "text/plain" }));
  try {
    await loadConstellation({ name, urls: [tmpUrl], color, speedMultiplier }, globe);
    updateVisibleCount();
    refreshSatelliteList();
  } finally {
    URL.revokeObjectURL(tmpUrl);
  }
}

// Initialize modal controls
export function initCustomSatelliteModal(globe) {
  const loadingModal = document.getElementById("loadingModal");
  const openLoadingModalBtn = document.getElementById("openLoadingModal");
  const closeLoadingModalBtn = document.getElementById("closeLoadingModal");
  const addSatelliteBtn = document.getElementById("addSatelliteBtn");
  const satelliteName = document.getElementById("satelliteName");
  const satelliteColor = document.getElementById("satelliteColor");
  const satelliteSpeed = document.getElementById("satelliteSpeed");
  const satelliteTLE = document.getElementById("satelliteTLE");

  // Open modal
  openLoadingModalBtn.addEventListener("click", () => {
    loadingModal.classList.add("open");
  });

  // Close modal
  closeLoadingModalBtn.addEventListener("click", () => {
    loadingModal.classList.remove("open");
  });

  // Close on outside click
  loadingModal.addEventListener("click", (e) => {
    if (e.target === loadingModal) {
      loadingModal.classList.remove("open");
    }
  });

  // Add satellite
  addSatelliteBtn.addEventListener("click", async () => {
    const name = satelliteName.value.trim();
    const color = satelliteColor.value;
    const speedMultiplier = Number.parseFloat(satelliteSpeed.value);
    let tleText = satelliteTLE.value.trim();

    if (!name) {
      alert("Please enter a satellite name");
      return;
    }

    if (!tleText) {
      alert("Please enter TLE data");
      return;
    }

    if (!Number.isFinite(speedMultiplier) || speedMultiplier <= 0) {
      alert("Please enter a valid speed multiplier (> 0)");
      return;
    }

    // Auto-prepend name if TLE data doesn't start with it
    const lines = tleText.split(/\r?\n/);
    if (lines.length >= 2 && lines[0].startsWith("1 ")) {
      // User only entered Line1 and Line2, prepend the name
      tleText = name + "\n" + tleText;
    } else if (lines.length >= 3 && !lines[0].startsWith("1 ") && lines[0] !== name) {
      // Replace the first line with the user's chosen name
      lines[0] = name;
      tleText = lines.join("\n");
    }

    try {
      await addCustomTLE({ name, tleText, color, speedMultiplier }, globe);
      // Clear form
      satelliteName.value = "";
      satelliteTLE.value = "";
      satelliteColor.value = "#48bf24";
      satelliteSpeed.value = "1";
      // Close modal
      loadingModal.classList.remove("open");
      alert(`Satellite "${name}" added successfully!`);
    } catch (error) {
      console.error(error);
      alert(`Failed to add satellite: ${error.message}`);
    }
  });
}