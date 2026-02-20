// UI элементы

// Элемент статуса
export const statusEl = document.createElement("div");
statusEl.style.cssText = "padding:8px 12px;background:rgba(0,0,0,0.55);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:8px;margin:6px 0;max-width:100%;";
statusEl.textContent = "Scene cleared. Select constellations and click 'Render'.";
const sidebarContent = document.querySelector('.sidebar-content');
if (sidebarContent) {
  // Place status at the top of the sidebar
  sidebarContent.insertAdjacentElement('afterbegin', statusEl);
} else {
  document.body.appendChild(statusEl);
}

// Основная панель управления
const constellationsHost = document.getElementById("tool-constellations");
const timeHost = document.getElementById("tool-time");
const markersHost = document.getElementById("tool-markers");
const kmlHost = document.getElementById("tool-kml");
const visibleHost = document.getElementById("tool-visible");

export const uiEl = document.createElement("div");
uiEl.style.cssText = "padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;max-width:260px;";
uiEl.innerHTML = "<div style='font-weight:600;margin-bottom:8px;'>Constellations</div>";
if (constellationsHost) {
  constellationsHost.appendChild(uiEl);
} else {
  document.body.appendChild(uiEl);
}

// Счетчик спутников
export const countEl = document.createElement("div");
countEl.style.cssText = "margin:6px 0 10px 0;color:#C8E6C9;";
countEl.textContent = "Satellites on scene: 0";
uiEl.appendChild(countEl);

// Время
export const timeEl = document.createElement("div");
timeEl.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);padding:8px 12px;background:rgba(0,0,0,0.55);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:8px;z-index:9999;";
document.body.appendChild(timeEl);

// Панель управления временем
export const timePanel = document.createElement("div");
timePanel.style.cssText = "padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;max-width:260px;";
timePanel.innerHTML = "<div style='font-weight:600;margin-bottom:8px;color:#80CBC4;'>Time</div>";
if (timeHost) {
  timeHost.appendChild(timePanel);
} else {
  document.body.appendChild(timePanel);
}

export const timeDateInput = document.createElement("input");
timeDateInput.type = "datetime-local";
timeDateInput.step = "1";
timeDateInput.style.cssText = "width:100%;margin-bottom:8px;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.2);color:#fff;";
timePanel.appendChild(timeDateInput);

const timeSpeedRow = document.createElement("div");
timeSpeedRow.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:8px;";
timePanel.appendChild(timeSpeedRow);

export const timeSpeedLabel = document.createElement("div");
timeSpeedLabel.style.cssText = "min-width:72px;color:#C8E6C9;";
timeSpeedLabel.textContent = "Speed: 1x";
timeSpeedRow.appendChild(timeSpeedLabel);

export const timeSpeedRange = document.createElement("input");
timeSpeedRange.type = "range";
timeSpeedRange.min = "-20";
timeSpeedRange.max = "20";
timeSpeedRange.step = "0.5";
timeSpeedRange.value = "1";
timeSpeedRange.style.cssText = "flex:1;";
timeSpeedRow.appendChild(timeSpeedRange);

const timeBtnRow = document.createElement("div");
timeBtnRow.style.cssText = "display:flex;gap:8px;margin-bottom:8px;";
timePanel.appendChild(timeBtnRow);

export const timePlayPauseBtn = document.createElement("button");
timePlayPauseBtn.textContent = "Pause";
timePlayPauseBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#42A5F5;color:#fff;cursor:pointer;";
timeBtnRow.appendChild(timePlayPauseBtn);

export const timeNowBtn = document.createElement("button");
timeNowBtn.textContent = "Now";
timeNowBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#8BC34A;color:#fff;cursor:pointer;";
timeBtnRow.appendChild(timeNowBtn);

const timeStepRow = document.createElement("div");
timeStepRow.style.cssText = "display:flex;gap:8px;";
timePanel.appendChild(timeStepRow);

export const timeStepBackBtn = document.createElement("button");
timeStepBackBtn.textContent = "-5 min";
timeStepBackBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#607D8B;color:#fff;cursor:pointer;";
timeStepRow.appendChild(timeStepBackBtn);

export const timeStepForwardBtn = document.createElement("button");
timeStepForwardBtn.textContent = "+5 min";
timeStepForwardBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#607D8B;color:#fff;cursor:pointer;";
timeStepRow.appendChild(timeStepForwardBtn);

// Панель списка спутников
export const satellitePanel = document.createElement("div");
satellitePanel.style.cssText = "padding:10px 12px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;max-width:320px;";
if (visibleHost) {
  visibleHost.appendChild(satellitePanel);
} else {
  document.body.appendChild(satellitePanel);
}

// Заголовок списка
const listHeader = document.createElement("div");
listHeader.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:8px;";
const listTitle = document.createElement("div");
listTitle.textContent = "Visible Satellites";
listTitle.style.cssText = "flex:1;font-weight:600;";
export const undoTrackBtn = document.createElement("button");
undoTrackBtn.textContent = "Undo";
undoTrackBtn.style.cssText = "padding:4px 8px;border-radius:6px;border:none;background:#607D8B;color:#fff;cursor:pointer;";
listHeader.appendChild(listTitle);
listHeader.appendChild(undoTrackBtn);
satellitePanel.appendChild(listHeader);

// Статус отслеживания
export const trackStatus = document.createElement("div");
trackStatus.textContent = "Selected: none";
trackStatus.style.cssText = "color:#C8E6C9;margin-bottom:8px;";
satellitePanel.appendChild(trackStatus);

// Список спутников
export const satelliteList = document.createElement("div");
satellitePanel.appendChild(satelliteList);

// Переключатель следов
export const trailToggle = document.createElement("div");
trailToggle.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:10px;";
const trailLabel = document.createElement("div");
trailLabel.style.cssText = "color:#fff;margin-right:4px;";
trailLabel.textContent = "Trail (1 min + 75 sec fade)";
const trailSwitch = document.createElement("label");
trailSwitch.className = "switch";
const trailInput = document.createElement("input");
trailInput.type = "checkbox";
trailInput.id = "trail-toggle";
const trailSlider = document.createElement("span");
trailSlider.className = "slider";
trailSwitch.appendChild(trailInput);
trailSwitch.appendChild(trailSlider);
trailToggle.appendChild(trailLabel);
trailToggle.appendChild(trailSwitch);
uiEl.appendChild(trailToggle);

// Кнопки управления
const actionRow = document.createElement("div");
actionRow.style.cssText = "display:flex;gap:8px;margin-top:10px;";
export const renderBtn = document.createElement("button");
renderBtn.textContent = "Render";
renderBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#42A5F5;color:#fff;cursor:pointer;";
export const clearBtn = document.createElement("button");
clearBtn.textContent = "Clear";
clearBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#EF5350;color:#fff;cursor:pointer;";
actionRow.appendChild(renderBtn);
actionRow.appendChild(clearBtn);
uiEl.appendChild(actionRow);

// Панель загрузки позиции красной точки из JSON
export const markerPanel = document.createElement("div");
markerPanel.style.cssText = "padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;max-width:260px;";
markerPanel.innerHTML = "<div style='font-weight:600;margin-bottom:8px;color:#FF6E40;'>Markers (JSON)</div>";
if (markersHost) {
  markersHost.appendChild(markerPanel);
} else {
  document.body.appendChild(markerPanel);
}

export const markerFileInput = document.createElement("input");
markerFileInput.type = "file";
markerFileInput.accept = ".json,application/json";
markerFileInput.style.cssText = "width:100%;margin-bottom:8px;";
markerPanel.appendChild(markerFileInput);

const markerHint = document.createElement("div");
markerHint.style.cssText = "margin-bottom:8px;color:#C8E6C9;font-size:10px;line-height:1.3;";
markerHint.textContent = "Format: [{ name, lat, lng }]";
markerPanel.appendChild(markerHint);

export const markerLoadBtn = document.createElement("button");
markerLoadBtn.textContent = "Add markers";
markerLoadBtn.style.cssText = "width:100%;padding:6px 8px;border-radius:6px;border:none;background:#FF7043;color:#fff;cursor:pointer;margin-bottom:8px;";
markerPanel.appendChild(markerLoadBtn);

export const markerStatus = document.createElement("div");
markerStatus.style.cssText = "color:#C8E6C9;font-size:11px;";
markerStatus.textContent = "No markers added.";
markerPanel.appendChild(markerStatus);

const markerListHeader = document.createElement("div");
markerListHeader.textContent = "Markers";
markerListHeader.style.cssText = "margin:8px 0 6px 0;font-weight:600;";
markerPanel.appendChild(markerListHeader);

export const markerList = document.createElement("div");
markerList.style.cssText = "max-height:160px;overflow:auto;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:6px;";
markerPanel.appendChild(markerList);

// Панель загрузки KML
export const kmlPanel = document.createElement("div");
kmlPanel.style.cssText = "padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;max-width:260px;";
kmlPanel.innerHTML = "<div style='font-weight:600;margin-bottom:8px;color:#64B5F6;'>KML (File/URL)</div>";
if (kmlHost) {
  kmlHost.appendChild(kmlPanel);
} else {
  document.body.appendChild(kmlPanel);
}

export const kmlFileInput = document.createElement("input");
kmlFileInput.type = "file";
kmlFileInput.accept = ".kml,application/vnd.google-earth.kml+xml";
kmlFileInput.style.cssText = "width:100%;margin-bottom:8px;";
kmlPanel.appendChild(kmlFileInput);

const kmlOrLabel = document.createElement("div");
kmlOrLabel.textContent = "or paste KML URL";
kmlOrLabel.style.cssText = "margin-bottom:6px;color:#C8E6C9;font-size:10px;";
kmlPanel.appendChild(kmlOrLabel);

export const kmlUrlInput = document.createElement("input");
kmlUrlInput.type = "text";
kmlUrlInput.placeholder = "https://example.com/route.kml";
kmlUrlInput.style.cssText = "width:100%;margin-bottom:8px;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.2);color:#fff;";
kmlPanel.appendChild(kmlUrlInput);

const kmlBtnRow = document.createElement("div");
kmlBtnRow.style.cssText = "display:flex;gap:8px;margin-bottom:8px;";
kmlPanel.appendChild(kmlBtnRow);

export const kmlLoadBtn = document.createElement("button");
kmlLoadBtn.textContent = "Load";
kmlLoadBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#42A5F5;color:#fff;cursor:pointer;";
kmlBtnRow.appendChild(kmlLoadBtn);

export const kmlClearBtn = document.createElement("button");
kmlClearBtn.textContent = "Clear";
kmlClearBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#EF5350;color:#fff;cursor:pointer;";
kmlBtnRow.appendChild(kmlClearBtn);

export const kmlStatus = document.createElement("div");
kmlStatus.style.cssText = "color:#C8E6C9;font-size:11px;margin-bottom:6px;";
kmlStatus.textContent = "No KML loaded.";
kmlPanel.appendChild(kmlStatus);

const kmlListHeader = document.createElement("div");
kmlListHeader.textContent = "Layers";
kmlListHeader.style.cssText = "margin:6px 0 6px 0;font-weight:600;";
kmlPanel.appendChild(kmlListHeader);

export const kmlList = document.createElement("div");
kmlList.style.cssText = "max-height:180px;overflow:auto;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:6px;";
kmlPanel.appendChild(kmlList);

// Обновление времени
export function updateTime(date = new Date()) {
  timeEl.textContent = `Sim time: ${date.toLocaleString("en-US")}`;
}

//Добавление кастомных спутников в статус отслеживания
export function setTrackedSatellite(sat) {
  if (sat) {
    trackStatus.textContent = `Selected: ${sat.name} (ID ${sat.id})`;
  } else {
    trackStatus.textContent = "Selected: none";
  }
}


//Перенос ui в удобный тул бар

export const menuButton = document.createElement("button");

menuButton.type = "button";
menuButton.className = "menu-button";
menuButton.setAttribute("aria-label", "Menu");
menuButton.setAttribute("aria-expanded", "false");
menuButton.innerHTML = "<span class='bar bar1'></span><span class='bar bar2'></span><span class='bar bar3'></span>";
document.body.appendChild(menuButton);
