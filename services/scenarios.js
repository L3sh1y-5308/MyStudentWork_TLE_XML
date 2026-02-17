// Сервис для управления сценариями спутников
import { satellitesByLayer } from "./satellites.js";

// Хранилище сценариев
let scenarios = [];
let activeScenario = null;
let scenarioMode = false;

/**
 * Структура сценария:
 * {
 *   name: "Сценарий 1",
 *   description: "Описание сценария",
 *   date: "2026-02-17",  // YYYY-MM-DD (опционально)
 *   startTime: "12:00",  // HH:MM для автоустановки (опционально)
 *   constellations: ["Starlink", "OneWeb"],  // Созвездия для автозагрузки (опционально)
 *   customSatellites: [  // Кастомные спутники из TLE данных (опционально)
 *     {
 *       name: "STARLINK-1007",
 *       tleLine1: "1 44713U 19074A   26048.50000000  .00001234  00000-0  12345-3 0  9999",
 *       tleLine2: "2 44713  53.0000 123.4567 0001234  90.1234 269.8765 15.12345678123456",
 *       color: "#00FF00"  // опционально
 *     }
 *   ],
 *   customLayerName: "My Custom Satellites",  // Имя слоя для кастомных спутников (опционально)
 *   getterPoint: { lon: 30.5, lat: 50.4, name: "Kiev Getter" },
 *   windows: [
 *     {
 *       satelliteName: "STARLINK-1234",
 *       constellationName: "Starlink",
 *       startTime: "12:00",
 *       endTime: "12:55",
 *       color: "#00ff00"
 *     },
 *     {
 *       satelliteName: "ONEWEB-5678",
 *       constellationName: "OneWeb",
 *       startTime: "13:00",
 *       endTime: "13:55",
 *       color: "#ff6600"
 *     }
 *   ],
 *   safetyWindow: 5  // минут между окнами
 * }
 */

/**
 * Добавить сценарий
 */
export function addScenario(scenario) {
  if (!scenario.name) {
    throw new Error("Scenario must have a name");
  }
  scenarios.push(scenario);
  console.log(`[Scenarios] Added scenario: ${scenario.name}`);
  return scenario;
}

/**
 * Загрузить сценарии из JSON
 */
export function loadScenariosFromJson(jsonData) {
  try {
    const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (Array.isArray(parsed)) {
      scenarios = parsed;
    } else if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
      scenarios = parsed.scenarios;
    } else {
      throw new Error("Invalid scenario format");
    }
    
    console.log(`[Scenarios] Loaded ${scenarios.length} scenarios`);
    return scenarios;
  } catch (error) {
    console.error("[Scenarios] Error loading scenarios:", error);
    throw error;
  }
}

/**
 * Получить все сценарии
 */
export function getScenarios() {
  return scenarios;
}

/**
 * Активировать сценарий
 */
export function activateScenario(scenarioName) {
  const scenario = scenarios.find(s => s.name === scenarioName);
  if (!scenario) {
    throw new Error(`Scenario "${scenarioName}" not found`);
  }
  activeScenario = scenario;
  console.log(`[Scenarios] Activated scenario: ${scenarioName}`);
  return scenario;
}

/**
 * Деактивировать текущий сценарий
 */
export function deactivateScenario() {
  activeScenario = null;
  console.log(`[Scenarios] Deactivated scenario`);
}

/**
 * Получить активный сценарий
 */
export function getActiveScenario() {
  return activeScenario;
}

/**
 * Включить/выключить режим сценариев
 */
export function setScenarioMode(enabled) {
  scenarioMode = enabled;
  if (!enabled) {
    activeScenario = null;
  }
  console.log(`[Scenarios] Scenario mode: ${enabled ? 'ON' : 'OFF'}`);
}

/**
 * Проверить включен ли режим сценариев
 */
export function isScenarioMode() {
  return scenarioMode;
}

/**
 * Парсить время в формате "HH:MM" и вернуть минуты с начала дня
 */
function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Получить минуты с начала дня для данной даты
 */
function getMinutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Проверить активное окно для текущего времени
 * Возвращает: { window, status, message, timeUntilNext }
 * status: 'active' | 'safety-window' | 'waiting' | 'none'
 */
export function checkActiveWindow(currentDate) {
  if (!activeScenario || !scenarioMode) {
    return { status: 'none', message: 'Scenario mode disabled' };
  }

  const currentMinutes = getMinutesOfDay(currentDate);
  const windows = activeScenario.windows || [];
  const safetyWindow = activeScenario.safetyWindow || 0;

  // Сортируем окна по времени начала
  const sortedWindows = [...windows].sort((a, b) => {
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });

  // Проверяем каждое окно
  for (let i = 0; i < sortedWindows.length; i++) {
    const window = sortedWindows[i];
    const startMin = parseTimeToMinutes(window.startTime);
    const endMin = parseTimeToMinutes(window.endTime);
    const safetyStartMin = endMin;
    const safetyEndMin = endMin + safetyWindow;

    // Текущее время в активном окне
    if (currentMinutes >= startMin && currentMinutes < endMin) {
      const remainingMin = endMin - currentMinutes;
      return {
        status: 'active',
        window: window,
        message: `Active: ${window.satelliteName} (${remainingMin} min remaining)`,
        remainingMinutes: remainingMin,
        satelliteName: window.satelliteName,
        constellationName: window.constellationName
      };
    }

    // Текущее время в окне безопасности
    if (currentMinutes >= safetyStartMin && currentMinutes < safetyEndMin) {
      const timeUntilNext = sortedWindows[i + 1] 
        ? parseTimeToMinutes(sortedWindows[i + 1].startTime) - currentMinutes
        : null;
      
      return {
        status: 'safety-window',
        window: window,
        message: `Safety window (${safetyWindow} min)`,
        timeUntilNext: timeUntilNext,
        nextWindow: sortedWindows[i + 1]
      };
    }

    // Текущее время перед этим окном
    if (currentMinutes < startMin) {
      const waitMin = startMin - currentMinutes;
      return {
        status: 'waiting',
        window: window,
        message: `Waiting: ${window.satelliteName} in ${waitMin} min`,
        waitMinutes: waitMin,
        nextWindow: window
      };
    }
  }

  // Все окна прошли
  return {
    status: 'none',
    message: 'All windows completed for today',
    nextWindow: sortedWindows[0] // Первое окно завтра
  };
}

/**
 * Получить спутник по имени из созвездия
 */
export function getSatelliteByName(constellationName, satelliteName) {
  const satellites = satellitesByLayer.get(constellationName);
  if (!satellites) {
    return null;
  }
  
  return satellites.find(sat => 
    sat.name === satelliteName || 
    sat.name.includes(satelliteName) ||
    satelliteName.includes(sat.name)
  );
}

/**
 * Получить все спутники в текущем активном окне
 */
export function getActiveSatellites(currentDate) {
  const windowStatus = checkActiveWindow(currentDate);
  
  if (windowStatus.status !== 'active') {
    return [];
  }

  const satellite = getSatelliteByName(
    windowStatus.constellationName,
    windowStatus.satelliteName
  );

  return satellite ? [satellite] : [];
}

/**
 * Экспортировать сценарии в JSON
 */
export function exportScenariosToJson() {
  return JSON.stringify({ scenarios }, null, 2);
}

/**
 * Удалить сценарий
 */
export function removeScenario(scenarioName) {
  const index = scenarios.findIndex(s => s.name === scenarioName);
  if (index !== -1) {
    scenarios.splice(index, 1);
    if (activeScenario && activeScenario.name === scenarioName) {
      activeScenario = null;
    }
    console.log(`[Scenarios] Removed scenario: ${scenarioName}`);
    return true;
  }
  return false;
}

/**
 * Очистить все сценарии
 */
export function clearScenarios() {
  scenarios = [];
  activeScenario = null;
  console.log(`[Scenarios] Cleared all scenarios`);
}

/**
 * Создать пример сценария
 */
export function createExampleScenario() {
  return {
    name: "Example Scenario",
    description: "Example satellite coverage scenario",
    date: "2026-02-17",
    startTime: "12:00",
    constellations: ["Starlink", "OneWeb"],
    getterPoint: {
      lon: 30.5,
      lat: 50.4,
      name: "Example Getter"
    },
    windows: [
      {
        satelliteName: "STARLINK-1007",
        constellationName: "Starlink",
        startTime: "12:00",
        endTime: "12:55",
        color: "#00ff00"
      },
      {
        satelliteName: "ONEWEB-0001",
        constellationName: "OneWeb",
        startTime: "13:00",
        endTime: "13:55",
        color: "#ff6600"
      }
    ],
    safetyWindow: 5
  };
}
