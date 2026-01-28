// UI элементы

// Элемент статуса
export const statusEl = document.createElement("div");
statusEl.style.cssText = "position:fixed;left:12px;bottom:12px;padding:8px 12px;background:rgba(0,0,0,0.55);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:8px;z-index:9999;max-width:320px;";
statusEl.textContent = "";
document.body.appendChild(statusEl);

// Основная панель управления
export const uiEl = document.createElement("div");
uiEl.style.cssText = "position:fixed;left:12px;top:12px;padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;z-index:9999;max-width:240px;";
uiEl.innerHTML = "<div style='font-weight:600;margin-bottom:8px;'>Constellations</div>";
document.body.appendChild(uiEl);

// Счетчик спутников
export const countEl = document.createElement("div");
countEl.style.cssText = "margin:6px 0 10px 0;color:#C8E6C9;";
countEl.textContent = "Satellites on scene: 0";
uiEl.appendChild(countEl);

// Время
export const timeEl = document.createElement("div");
timeEl.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);padding:8px 12px;background:rgba(0,0,0,0.55);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:8px;z-index:9999;";
document.body.appendChild(timeEl);

// Панель списка спутников
export const satellitePanel = document.createElement("div");
satellitePanel.style.cssText = "position:fixed;right:12px;top:680px;width:320px;max-height:280px;overflow:auto;padding:10px 12px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;z-index:9999;";
document.body.appendChild(satellitePanel);

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
export const trailToggle = document.createElement("label");
trailToggle.style.cssText = "display:block;margin-bottom:10px;";
trailToggle.innerHTML = "<input type='checkbox' id='trail-toggle' /> Trail (1 min + 75 sec fade)";
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
markerPanel.style.cssText = "position:fixed;left:12px;top:680px;padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;z-index:9999;width:240px;";
markerPanel.innerHTML = "<div style='font-weight:600;margin-bottom:8px;color:#FF6E40;'>Markers (JSON)</div>";
document.body.appendChild(markerPanel);

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

// Обновление времени
export function updateTime() {
  const now = new Date();
  timeEl.textContent = now.toLocaleString("en-US");
}

//Добавление кастомных спутников в статус отслеживания
export function setTrackedSatellite(sat) {
  if (sat) {
    trackStatus.textContent = `Selected: ${sat.name} (ID ${sat.id})`;
  } else {
    trackStatus.textContent = "Selected: none";
  }
}