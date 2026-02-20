// UI элементы для управления красной точкой

// Панель управления координатами красной точки
export const coordPanel = document.createElement("div");
coordPanel.style.cssText = "position:fixed;left:12px;top:340px;padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;z-index:9999;width:240px;";
coordPanel.innerHTML = "<div style='font-weight:600;margin-bottom:12px;color:#FF6E40;'>Red Marker Position</div>";
document.body.appendChild(coordPanel);

// Контейнер для долготы
const lonContainer = document.createElement("div");
lonContainer.style.cssText = "margin-bottom:12px;";

const lonLabel = document.createElement("div");
lonLabel.style.cssText = "margin-bottom:4px;color:#C8E6C9;font-size:11px;";
lonLabel.textContent = "Longitude (X): 37.62°";

export const lonSlider = document.createElement("input");
lonSlider.type = "range";
lonSlider.min = "-180";
lonSlider.max = "180";
lonSlider.value = "37.617";
lonSlider.step = "0.1";
lonSlider.style.cssText = "width:100%;cursor:pointer;";

lonContainer.appendChild(lonLabel);
lonContainer.appendChild(lonSlider);
coordPanel.appendChild(lonContainer);

// Контейнер для широты
const latContainer = document.createElement("div");
latContainer.style.cssText = "margin-bottom:8px;";

const latLabel = document.createElement("div");
latLabel.style.cssText = "margin-bottom:4px;color:#C8E6C9;font-size:11px;";
latLabel.textContent = "Latitude (Y): 55.76°";

export const latSlider = document.createElement("input");
latSlider.type = "range";
latSlider.min = "-90";
latSlider.max = "90";
latSlider.value = "55.755";
latSlider.step = "0.1";
latSlider.style.cssText = "width:100%;cursor:pointer;";

latContainer.appendChild(latLabel);
latContainer.appendChild(latSlider);
coordPanel.appendChild(latContainer);

// Функция обновления подписей слайдеров
export function updateCoordLabels(lon, lat) {
  lonLabel.textContent = `Longitude (X): ${lon.toFixed(2)}°`;
  latLabel.textContent = `Latitude (Y): ${lat.toFixed(2)}°`;
}
