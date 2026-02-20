# SCENARIO SYSTEM DOCUMENTATION / ДОКУМЕНТАЦИЯ СИСТЕМЫ СЦЕНАРИЕВ

## Русская версия

### Обзор

Система сценариев позволяет создавать временные расписания видимости спутников для наземных станций (getters). Вы можете определить точные окна времени, когда конкретные спутники должны быть видны, и система будет визуально выделять их в режиме реального времени.

### Основные возможности

1. **Временные окна** - Определение точного времени начала и окончания видимости спутника
2. **Окна безопасности** - Промежуток времени между окнами для переключения связи
3. **Визуальная подсветка** - Активные спутники увеличиваются и получают золотистый трек
4. **Множественные сценарии** - Загрузка и переключение между разными сценариями
5. **Статус в реальном времени** - Отображение текущего статуса окна и времени до следующего

### Структура сценария JSON

```json
{
  "scenarios": [
    {
      "name": "Название сценария",
      "description": "Описание сценария",
      "date": "2026-02-17",
      "startTime": "12:00",
      "constellations": ["Starlink", "OneWeb"],
      "getterPoint": {
        "lon": 30.5,
        "lat": 50.4,
        "name": "Название станции"
      },
      "windows": [
        {
          "satelliteName": "STARLINK-1007",
          "constellationName": "Starlink",
          "startTime": "12:00",
          "endTime": "12:55",
          "color": "#00ff00",
          "description": "Описание окна"
        }
      ],
      "safetyWindow": 5
    }
  ]
}
```

### Поля сценария

- **name** - Уникальное имя сценария
- **description** - Описание сценария (опционально)
- **date** - Дата в формате YYYY-MM-DD (опционально, по умолчанию текущая дата)
- **startTime** - Время начала в формате HH:MM для автоустановки (опционально)
- **constellations** - Массив имен созвездий для автозагрузки ["Starlink", "OneWeb", "GPS"] (опционально)
- **getterPoint** - Координаты наземной станции
  - **lon** - Долгота
  - **lat** - Широта
  - **name** - Название станции
- **windows** - Массив временных окон
  - **satelliteName** - Имя спутника (должно совпадать с TLE)
  - **constellationName** - Название созвездия (Starlink, OneWeb, GPS, и т.д.)
  - **startTime** - Время начала в формате "HH:MM"
  - **endTime** - Время окончания в формате "HH:MM"
  - **color** - Цвет в HEX формате (опционально)
  - **description** - Описание окна (опционально)
- **safetyWindow** - Количество минут между окнами для безопасного переключения

### Как использовать

#### 1. Создание файла сценария

Создайте JSON файл с вашими сценариями (см. структуру выше). Пример файла находится в `data/example_scenarios.json`.

#### 2. Загрузка сценариев

1. Откройте боковую панель (кнопка меню)
2. Прокрутите до раздела "Scenario Mode"
3. Нажмите "Choose File" под "Load Scenarios from JSON"
4. Выберите ваш JSON файл
5. Сценарии будут загружены и доступны в выпадающем списке

#### 3. Активация сценария

1. Система автоматически:
   - ✅ Создаст геттер на карте (красная точка с моделью)
   - ✅ Установит дату и время (если указаны в JSON)
   - ✅ Включит режим сценариев
2. Нажмите "Activate Selected Scenario"
3. Режим сценариев автоматически включится
4. Панель статуса покажет текущее состояние окна

#### 4. Использование режима сценариев

Когда режим сценариев активен:

- **Активное окно** (зеленый) - Спутник сейчас виден
  - Спутник увеличен в 3 раза
  - Трек становится золотистым и толще
  - Показывается оставшееся время
  
- **Окно безопасности** (оранжевый) - Промежуток между окнами
  - Показывается время до следующего окна
  
- **Ожидание** (синий) - Ожидание следующего окна
  - Показывается какой спутник следующий и через сколько минут
  
- **Нет активных окон** (серый) - Все окна на сегодня завершены

### Пример использования

#### Сценарий: Покрытие станции Киев

```json
{
  "name": "Kiev Station Coverage",
  "description": "Satellite coverage for Kiev station",
  "getterPoint": {
    "lon": 30.5234,
    "lat": 50.4501,
    "name": "Kiev Getter Station"
  },
  "windows": [
    {
      "satelliteName": "STARLINK-1007",
      "constellationName": "Starlink",
      "startTime": "12:00",
      "endTime": "12:55",
      "color": "#00ff00"
    },
    {
      "satelliteName": "ONEWEB-0001",
      "constellationName": "OneWeb",
      "startTime": "13:00",
      "endTime": "13:55",
      "color": "#ff6600"
    }
  ],
  "safetyWindow": 5
}
```

В этом примере:
- Дата: 17 февраля 2026
- При активации время автоматически установится на 12:00
- Геттер автоматически создастся в Киеве
- В 12:00 - 12:55: Спутник STARLINK-1007 виден
- 12:55 - 13:00: Окно безопасности (5 минут)
- 13:00 - 13:55: Спутник ONEWEB-0001 виден

### Функции управления

- **Enable/Disable Scenario Mode** - Включение/выключение режима сценариев
- **Load Scenarios from JSON** - Загрузка сценариев из файла
- **Select Scenario** - Выбор активного сценария
- **Activate Selected Scenario** - Активация выбранного сценария
- **Deactivate** - Деактивация текущего сценария
- **Clear All** - Очистка всех загруженных сценариев
- **Export Scenarios to JSON** - Экспорт сценариев в файл
- **Add Example Scenario** - Добавление примера сценария

### Визуальные индикаторы

#### Активный спутник:
- Размер увеличен в 3 раза
- Золотистый трек вместо обычного цвета
- Более толстый трек (3px вместо 1.5px)

#### Панель статуса:
- Цветовая кодировка по статусу
- Информация о текущем/следующем спутнике
- Таймер до следующего события

### Советы и рекомендации

1. **Именование спутников** - Убедитесь, что имена спутников точно совпадают с именами в TLE файлах
2. **Формат времени** - Используйте 24-часовой формат "HH:MM"
3. **Окна безопасности** - Рекомендуется 5-10 минут для надежного переключения
4. **Тестирование** - Используйте управление временем для быстрого тестирования окон
5. **Множественные созвездия** - Можете комбинировать спутники из разных созвездий

### Устранение неполадок

**Сценарий не загружается:**
- Проверьте корректность JSON синтаксиса
- Убедитесь, что все обязательные поля заполнены

**Спутник не подсвечивается:**
- Проверьте точность имени спутника
- Убедитесь, что созвездие отрендерено
- Проверьте, что текущее время попадает в окно

**Статус не обновляется:**
- Убедитесь, что режим сценариев включен
- Проверьте, что сценарий активирован

---

## English Version

### Overview

The Scenario System allows you to create time-based schedules for satellite visibility from ground stations (getters). You can define precise time windows when specific satellites should be visible, and the system will visually highlight them in real-time.

### Key Features

1. **Time Windows** - Define exact start and end times for satellite visibility
2. **Safety Windows** - Gap time between windows for connection handover
3. **Visual Highlighting** - Active satellites are enlarged with golden trails
4. **Multiple Scenarios** - Load and switch between different scenarios
5. **Real-time Status** - Display current window status and time until next event

### JSON Scenario Structure

```json
{
  "scenarios": [
    {
      "name": "Scenario Name",
      "description": "Scenario description",
      "date": "2026-02-17",
      "startTime": "12:00",
      "constellations": ["Starlink", "OneWeb"],
      "getterPoint": {
        "lon": 30.5,
        "lat": 50.4,
        "name": "Station Name"
      },
      "windows": [
        {
          "satelliteName": "STARLINK-1007",
          "constellationName": "Starlink",
          "startTime": "12:00",
          "endTime": "12:55",
          "color": "#00ff00",
          "description": "Window description"
        }
      ],
      "safetyWindow": 5
    }
  ]
}
```

### Scenario Fields

- **name** - Unique scenario name
- **description** - Scenario description (optional)
- **date** - Date in YYYY-MM-DD format (optional, defaults to current date)
- **startTime** - Start time in HH:MM format for auto-setting (optional)
- **constellations** - Array of constellation names to auto-load ["Starlink", "OneWeb", "GPS"] (optional)
- **getterPoint** - Ground station coordinates
  - **lon** - Longitude
  - **lat** - Latitude
  - **name** - Station name
- **windows** - Array of time windows
  - **satelliteName** - Satellite name (must match TLE)
  - **constellationName** - Constellation name (Starlink, OneWeb, GPS, etc.)
  - **startTime** - Start time in "HH:MM" format
  - **endTime** - End time in "HH:MM" format
  - **color** - Color in HEX format (optional)
  - **description** - Window description (optional)
- **safetyWindow** - Minutes between windows for safe handover

### How to Use

#### 1. Create Scenario File

Create a JSON file with your scenarios (see structure above). Example file is available at `data/example_scenarios.json`.

#### 2. Load Scenarios

1. Open the sidebar (menu button)
2. Scroll to "Scenario Mode" section
3. Click "Choose File" under "Load Scenarios from JSON"
4. Select your JSON file
5. Scenarios will be loaded and available in the dropdown

#### 3. Activate Scenario

1. Select a scenario from the dropdown
2. Click "Activate Selected Scenario"
3. The system will automatically:
   - ✅ Create a getter on the map (red point with model)
   - ✅ Set the date and time (if specified in JSON)
   - ✅ Load constellations (Starlink, OneWeb, etc.)
   - ✅ Enable scenario mode
4. Status panel will show current window state

#### 4. Using Scenario Mode

When scenario mode is active:

- **Active Window** (green) - Satellite is currently visible
  - Satellite enlarged 3x
  - Trail becomes golden and thicker
  - Shows remaining time
  
- **Safety Window** (orange) - Gap between windows
  - Shows time until next window
  
- **Waiting** (blue) - Waiting for next window
  - Shows which satellite is next and in how many minutes
  
- **No Active Windows** (gray) - All windows completed for today

### Example Usage

#### Scenario: Kiev Station Coverage

```json
{
  "name": "Kiev Station Coverage",
  "description": "Satellite coverage for Kiev station",
  "getterPoint": {
    "lon": 30.5234,
    "lat": 50.4501,
    "name": "Kiev Getter Station"
  },
  "windows": [
    {
      "satelliteName": "STARLINK-1007",
      "constellationName": "Starlink",
      "startTime": "12:00",
      "endTime": "12:55",
      "color": "#00ff00"
    },
    {
      "satelliteName": "ONEWEB-0001",
      "constellationName": "OneWeb",
      "startTime": "13:00",
      "endTime": "13:55",
      "color": "#ff6600"
    }
  ],
  "safetyWindow": 5
}
```

In this example:
- 12:00 - 12:55: STARLINK-1007 satellite is visible
- 12:55 - 13:00: Safety window (5 minutes)
- 13:00 - 13:55: ONEWEB-0001 satellite is visible

### Control Functions

- **Enable/Disable Scenario Mode** - Toggle scenario mode on/off
- **Load Scenarios from JSON** - Load scenarios from file
- **Select Scenario** - Choose active scenario
- **Activate Selected Scenario** - Activate selected scenario
- **Deactivate** - Deactivate current scenario
- **Clear All** - Clear all loaded scenarios
- **Export Scenarios to JSON** - Export scenarios to file
- **Add Example Scenario** - Add example scenario

### Visual Indicators

#### Active Satellite:
- Size increased 3x
- Golden trail instead of normal color
- Thicker trail (3px instead of 1.5px)

#### Status Panel:
- Color-coded by status
- Information about current/next satellite
- Countdown to next event

### Tips & Best Practices

1. **Satellite Naming** - Ensure satellite names exactly match TLE file names
2. **Time Format** - Use 24-hour format "HH:MM"
3. **Safety Windows** - Recommended 5-10 minutes for reliable handover
4. **Testing** - Use time controls to quickly test windows
5. **Multiple Constellations** - You can combine satellites from different constellations

### Troubleshooting

**Scenario won't load:**
- Check JSON syntax is correct
- Ensure all required fields are filled

**Satellite not highlighting:**
- Verify satellite name accuracy
- Ensure constellation is rendered
- Check that current time is within window

**Status not updating:**
- Ensure scenario mode is enabled
- Verify scenario is activated
