// UI управление сценариями
import {
  loadScenariosFromJson,
  getScenarios,
  activateScenario,
  deactivateScenario,
  getActiveScenario,
  setScenarioMode,
  isScenarioMode,
  checkActiveWindow,
  addScenario,
  removeScenario,
  clearScenarios,
  exportScenariosToJson,
  createExampleScenario
} from "../services/scenarios.js";
import { setSimTime, syncTimeControls } from "./time_controls.js";
import { updateTime } from "./elements.js";
import { createMarkerAt } from "../services/Gettersline.js";
import { loadConstellation, constellationLayers, trailLayers, loadCustomSatellites } from "../services/satellites.js";
import { constellations } from "../config/constellations.js";

let scenarioPanel = null;
let scenarioStatusEl = null;
let scenarioSelectEl = null;
let scenarioModeToggleBtn = null;
let activeWindowInfoEl = null;
let scenarioUpdateInterval = null;
let scenarioGlobe = null;

/**
 * Инициализация панели управления сценариями
 */
export function initScenarioControls(globe) {
  scenarioGlobe = globe;
  const scenarioHost = document.getElementById("tool-scenarios");
  if (!scenarioHost) {
    console.error("[ScenarioControls] scenario host not found");
    return;
  }

  // Создаем панель сценариев
  scenarioPanel = document.createElement("div");
  scenarioPanel.style.cssText = "padding:12px 14px;background:rgba(0,0,0,0.6);color:#fff;font:12px/1.4 'Segoe UI',sans-serif;border-radius:10px;max-width:260px;";
  
  const title = document.createElement("div");
  title.style.cssText = "font-weight:600;margin-bottom:8px;color:#FFA726;";
  title.textContent = "Scenario Mode";
  scenarioPanel.appendChild(title);

  // Статус режима сценариев
  scenarioStatusEl = document.createElement("div");
  scenarioStatusEl.style.cssText = "margin:6px 0 10px 0;color:#C8E6C9;font-size:11px;";
  scenarioStatusEl.textContent = "Scenario mode: OFF";
  scenarioPanel.appendChild(scenarioStatusEl);

  // Кнопка включения/выключения режима сценариев
  scenarioModeToggleBtn = document.createElement("button");
  scenarioModeToggleBtn.textContent = "Enable Scenario Mode";
  scenarioModeToggleBtn.style.cssText = "width:100%;padding:8px 12px;margin-bottom:10px;border-radius:6px;border:none;background:#FFA726;color:#fff;cursor:pointer;font-weight:600;";
  scenarioModeToggleBtn.addEventListener("click", toggleScenarioMode);
  scenarioPanel.appendChild(scenarioModeToggleBtn);

  // Загрузка сценариев из файла
  const loadFileLabel = document.createElement("label");
  loadFileLabel.style.cssText = "display:block;margin-bottom:4px;color:#C8E6C9;font-size:11px;";
  loadFileLabel.textContent = "Load Scenarios from JSON:";
  scenarioPanel.appendChild(loadFileLabel);

  const loadFileInput = document.createElement("input");
  loadFileInput.type = "file";
  loadFileInput.accept = ".json";
  loadFileInput.style.cssText = "width:100%;margin-bottom:10px;padding:4px;color:#fff;font-size:11px;";
  loadFileInput.addEventListener("change", handleLoadScenarioFile);
  scenarioPanel.appendChild(loadFileInput);

  // Выбор сценария
  const selectLabel = document.createElement("div");
  selectLabel.style.cssText = "margin-bottom:4px;color:#C8E6C9;font-size:11px;";
  selectLabel.textContent = "Select Scenario:";
  scenarioPanel.appendChild(selectLabel);

  scenarioSelectEl = document.createElement("select");
  scenarioSelectEl.style.cssText = "width:100%;padding:6px 8px;margin-bottom:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.2);color:#fff;";
  scenarioSelectEl.innerHTML = '<option value="">-- No scenarios loaded --</option>';
  scenarioSelectEl.addEventListener("change", handleScenarioSelect);
  scenarioPanel.appendChild(scenarioSelectEl);

  // Кнопка активации сценария
  const activateBtn = document.createElement("button");
  activateBtn.textContent = "Activate Selected Scenario";
  activateBtn.style.cssText = "width:100%;padding:8px 12px;margin-bottom:10px;border-radius:6px;border:none;background:#66BB6A;color:#fff;cursor:pointer;";
  activateBtn.addEventListener("click", handleActivateScenario);
  scenarioPanel.appendChild(activateBtn);

  // Информация об активном окне
  activeWindowInfoEl = document.createElement("div");
  activeWindowInfoEl.style.cssText = "padding:8px;margin-bottom:10px;border-radius:6px;background:rgba(255,167,38,0.2);border:1px solid rgba(255,167,38,0.3);color:#FFA726;font-size:11px;display:none;";
  activeWindowInfoEl.innerHTML = "<div style='font-weight:600;margin-bottom:4px;'>Window Status</div><div id='windowStatusText'>No active window</div>";
  scenarioPanel.appendChild(activeWindowInfoEl);

  // Кнопки управления сценариями
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex;gap:8px;margin-bottom:10px;";
  scenarioPanel.appendChild(btnRow);

  const deactivateBtn = document.createElement("button");
  deactivateBtn.textContent = "Deactivate";
  deactivateBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#EF5350;color:#fff;cursor:pointer;font-size:11px;";
  deactivateBtn.addEventListener("click", handleDeactivateScenario);
  btnRow.appendChild(deactivateBtn);

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear All";
  clearBtn.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:none;background:#757575;color:#fff;cursor:pointer;font-size:11px;";
  clearBtn.addEventListener("click", handleClearScenarios);
  btnRow.appendChild(clearBtn);

  // Кнопка экспорта
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Scenarios to JSON";
  exportBtn.style.cssText = "width:100%;padding:6px 8px;margin-bottom:10px;border-radius:6px;border:none;background:#42A5F5;color:#fff;cursor:pointer;font-size:11px;";
  exportBtn.addEventListener("click", handleExportScenarios);
  scenarioPanel.appendChild(exportBtn);

  // Кнопка создания примера
  const exampleBtn = document.createElement("button");
  exampleBtn.textContent = "Add Example Scenario";
  exampleBtn.style.cssText = "width:100%;padding:6px 8px;border-radius:6px;border:none;background:#AB47BC;color:#fff;cursor:pointer;font-size:11px;";
  exampleBtn.addEventListener("click", handleAddExample);
  scenarioPanel.appendChild(exampleBtn);

  scenarioHost.appendChild(scenarioPanel);
  
  console.log("[ScenarioControls] Initialized");
}

/**
 * Переключение режима сценариев
 */
function toggleScenarioMode() {
  const newMode = !isScenarioMode();
  setScenarioMode(newMode);
  updateScenarioModeUI();
  
  if (newMode) {
    startScenarioUpdates();
  } else {
    stopScenarioUpdates();
  }
}

/**
 * Обновление UI режима сценариев
 */
function updateScenarioModeUI() {
  const enabled = isScenarioMode();
  
  scenarioStatusEl.textContent = `Scenario mode: ${enabled ? 'ON' : 'OFF'}`;
  scenarioStatusEl.style.color = enabled ? '#66BB6A' : '#C8E6C9';
  
  scenarioModeToggleBtn.textContent = enabled ? 'Disable Scenario Mode' : 'Enable Scenario Mode';
  scenarioModeToggleBtn.style.background = enabled ? '#EF5350' : '#FFA726';
  
  if (enabled) {
    activeWindowInfoEl.style.display = 'block';
  } else {
    activeWindowInfoEl.style.display = 'none';
  }
}

/**
 * Загрузка сценариев из файла
 */
async function handleLoadScenarioFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    loadScenariosFromJson(text);
    updateScenariosList();
    alert(`Loaded scenarios from ${file.name}`);
  } catch (error) {
    alert(`Error loading scenarios: ${error.message}`);
  }
}

/**
 * Обновление списка сценариев
 */
function updateScenariosList() {
  const scenarios = getScenarios();
  
  scenarioSelectEl.innerHTML = '';
  
  if (scenarios.length === 0) {
    scenarioSelectEl.innerHTML = '<option value="">-- No scenarios loaded --</option>';
    return;
  }
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select a scenario --';
  scenarioSelectEl.appendChild(defaultOption);
  
  for (const scenario of scenarios) {
    const option = document.createElement('option');
    option.value = scenario.name;
    option.textContent = `${scenario.name} (${scenario.windows?.length || 0} windows)`;
    scenarioSelectEl.appendChild(option);
  }
}

/**
 * Выбор сценария
 */
function handleScenarioSelect() {
  // Просто обновляем UI, активация происходит при нажатии кнопки
}

/**
 * Активация выбранного сценария
 */
async function handleActivateScenario() {
  const selectedName = scenarioSelectEl.value;
  
  if (!selectedName) {
    alert("Please select a scenario first");
    return;
  }
  
  try {
    const scenarios = getScenarios();
    const scenario = scenarios.find(s => s.name === selectedName);
    
    if (!scenario) {
      throw new Error(`Scenario not found: ${selectedName}`);
    }
    
    // Активируем сценарий
    activateScenario(selectedName);
    
    // Автоматически создаем геттер из сценария
    if (scenario.getterPoint) {
      const getter = scenario.getterPoint;
      createMarkerAt(getter.lon, getter.lat, getter.name || "Scenario Getter");
      console.log(`[ScenarioControls] Created getter at: ${getter.lon}, ${getter.lat}`);
    }
    
    // Автоматически устанавливаем дату и время
    if (scenario.date || scenario.startTime) {
      let targetDate;
      
      if (scenario.date && scenario.startTime) {
        // Используем указанные дату и время
        targetDate = new Date(`${scenario.date}T${scenario.startTime}:00`);
      } else if (scenario.startTime) {
        // Используем текущую дату + время из сценария
        const now = new Date();
        const [hours, minutes] = scenario.startTime.split(':');
        targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
      } else if (scenario.date) {
        // Используем указанную дату + первое окно времени
        const firstWindow = scenario.windows && scenario.windows[0];
        if (firstWindow && firstWindow.startTime) {
          targetDate = new Date(`${scenario.date}T${firstWindow.startTime}:00`);
        } else {
          targetDate = new Date(`${scenario.date}T12:00:00`);
        }
      }
      
      if (targetDate && !isNaN(targetDate.getTime())) {
        setSimTime(targetDate);
        syncTimeControls(targetDate);
        console.log(`[ScenarioControls] Set time to: ${targetDate.toISOString()}`);
      }
    } else if (scenario.windows && scenario.windows.length > 0) {
      // Если дата не указана, используем текущую дату + время первого окна
      const firstWindow = scenario.windows[0];
      const now = new Date();
      const [hours, minutes] = firstWindow.startTime.split(':');
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
      setSimTime(targetDate);
      syncTimeControls(targetDate);
      console.log(`[ScenarioControls] Set time to first window: ${targetDate.toISOString()}`);
    }
    
    // Автоматически загружаем созвездия из сценария
    await loadScenarioConstellations(scenario);
    
    // Автоматически загружаем кастомные спутники из TLE данных
    await loadScenarioCustomSatellites(scenario);
    
    if (!isScenarioMode()) {
      setScenarioMode(true);
      updateScenarioModeUI();
      startScenarioUpdates();
    }
    
    const constellationsLoaded = scenario.constellations ? scenario.constellations.join(', ') : 'none';
    const customSatsCount = scenario.customSatellites ? scenario.customSatellites.length : 0;
    const customSatsInfo = customSatsCount > 0 ? `\nCustom Satellites: ${customSatsCount}` : '';
    alert(`Activated scenario: ${selectedName}\nGetter: ${scenario.getterPoint?.name || 'position'}\nConstellations: ${constellationsLoaded}${customSatsInfo}`);
  } catch (error) {
    alert(`Error activating scenario: ${error.message}`);
  }
}

/**
 * Деактивация сценария
 */
function handleDeactivateScenario() {
  deactivateScenario();
  alert("Scenario deactivated");
}

/**
 * Очистка всех сценариев
 */
function handleClearScenarios() {
  if (confirm("Are you sure you want to clear all scenarios?")) {
    clearScenarios();
    updateScenariosList();
    alert("All scenarios cleared");
  }
}

/**
 * Экспорт сценариев
 */
function handleExportScenarios() {
  const scenarios = getScenarios();
  
  if (scenarios.length === 0) {
    alert("No scenarios to export");
    return;
  }
  
  const json = exportScenariosToJson();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scenarios.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Добавление примера сценария
 */
function handleAddExample() {
  const example = createExampleScenario();
  addScenario(example);
  updateScenariosList();
  alert("Example scenario added");
}

/**
 * Запуск обновлений статуса окна
 */
function startScenarioUpdates() {
  if (scenarioUpdateInterval) {
    return;
  }
  
  scenarioUpdateInterval = setInterval(() => {
    updateActiveWindowInfo();
  }, 1000);
  
  updateActiveWindowInfo();
}

/**
 * Остановка обновлений
 */
function stopScenarioUpdates() {
  if (scenarioUpdateInterval) {
    clearInterval(scenarioUpdateInterval);
    scenarioUpdateInterval = null;
  }
}

/**
 * Загрузка созвездий из сценария
 */
async function loadScenarioConstellations(scenario) {
  if (!scenario.constellations || !Array.isArray(scenario.constellations)) {
    console.log('[ScenarioControls] No constellations specified in scenario');
    return;
  }
  
  if (!scenarioGlobe) {
    console.error('[ScenarioControls] Globe not initialized');
    return;
  }
  
  console.log(`[ScenarioControls] Loading constellations: ${scenario.constellations.join(', ')}`);
  
  for (const constellationName of scenario.constellations) {
    // Найти конфигурацию созвездия
    const config = constellations.find(c => c.name === constellationName);
    if (!config) {
      console.warn(`[ScenarioControls] Constellation not found: ${constellationName}`);
      continue;
    }
    
    // Проверить, уже загружено ли
    const existingLayer = constellationLayers.get(constellationName);
    if (existingLayer) {
      console.log(`[ScenarioControls] Constellation already loaded, making visible: ${constellationName}`);
      existingLayer.setVisibility(true);
      const trailLayer = trailLayers.get(constellationName);
      if (trailLayer) {
        trailLayer.setVisibility(true);
      }
      continue;
    }
    
    // Загрузить созвездие
    try {
      console.log(`[ScenarioControls] Loading constellation: ${constellationName}`);
      await loadConstellation(config, scenarioGlobe);
      console.log(`[ScenarioControls] Constellation loaded: ${constellationName}`);
    } catch (error) {
      console.error(`[ScenarioControls] Error loading constellation ${constellationName}:`, error);
    }
  }
}

/**
 * Загрузка кастомных спутников из TLE данных в сценарии
 */
async function loadScenarioCustomSatellites(scenario) {
  if (!scenario.customSatellites || !Array.isArray(scenario.customSatellites)) {
    console.log('[ScenarioControls] No custom satellites specified in scenario');
    return;
  }
  
  if (!scenarioGlobe) {
    console.error('[ScenarioControls] Globe not initialized');
    return;
  }
  
  console.log(`[ScenarioControls] Loading ${scenario.customSatellites.length} custom satellites`);
  
  try {
    const layerName = scenario.customLayerName || `${scenario.name} Custom Satellites`;
    await loadCustomSatellites(scenario.customSatellites, scenarioGlobe, layerName);
    console.log(`[ScenarioControls] Custom satellites loaded successfully`);
  } catch (error) {
    console.error(`[ScenarioControls] Error loading custom satellites:`, error);
  }
}

/**
 * Обновление информации об активном окне
 */
function updateActiveWindowInfo() {
  if (!isScenarioMode()) {
    return;
  }
  
  const currentDate = new Date();
  const windowStatus = checkActiveWindow(currentDate);
  
  const statusTextEl = document.getElementById('windowStatusText');
  if (!statusTextEl) return;
  
  let statusHtml = '';
  
  switch (windowStatus.status) {
    case 'active':
      statusHtml = `
        <div style='color:#66BB6A;font-weight:600;'>✓ ACTIVE</div>
        <div style='margin-top:4px;'><strong>Satellite:</strong> ${windowStatus.satelliteName}</div>
        <div><strong>Constellation:</strong> ${windowStatus.constellationName}</div>
        <div><strong>Remaining:</strong> ${windowStatus.remainingMinutes} min</div>
      `;
      break;
      
    case 'safety-window':
      statusHtml = `
        <div style='color:#FFA726;font-weight:600;'>⚠ SAFETY WINDOW</div>
        <div style='margin-top:4px;'>${windowStatus.message}</div>
        ${windowStatus.nextWindow ? `<div><strong>Next:</strong> ${windowStatus.nextWindow.satelliteName} at ${windowStatus.nextWindow.startTime}</div>` : ''}
      `;
      break;
      
    case 'waiting':
      statusHtml = `
        <div style='color:#42A5F5;font-weight:600;'>⏳ WAITING</div>
        <div style='margin-top:4px;'><strong>Next satellite:</strong> ${windowStatus.nextWindow.satelliteName}</div>
        <div><strong>Start time:</strong> ${windowStatus.nextWindow.startTime}</div>
        <div><strong>Wait:</strong> ${windowStatus.waitMinutes} min</div>
      `;
      break;
      
    case 'none':
    default:
      statusHtml = `
        <div style='color:#757575;font-weight:600;'>○ NO ACTIVE WINDOW</div>
        <div style='margin-top:4px;'>${windowStatus.message}</div>
      `;
      break;
  }
  
  statusTextEl.innerHTML = statusHtml;
}

/**
 * Получить текущий статус окна для внешнего использования
 */
export function getCurrentWindowStatus() {
  if (!isScenarioMode()) {
    return null;
  }
  return checkActiveWindow(new Date());
}
