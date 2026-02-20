# ✅ РЕШЕНИЕ: Автоматическая загрузка созвездий

## 🎯 Проблема:
Спутники не отрисовывались при активации сценария, потому что **в JSON не указывались TLE-файлы созвездий**.

## ✅ Решение:
Добавлено новое поле **`constellations`** в JSON сценариев для автоматической загрузки созвездий!

---

## 🆕 Новое поле в JSON:

```json
{
  "name": "My Scenario",
  "date": "2026-02-17",
  "startTime": "12:00",
  "constellations": ["Starlink", "OneWeb"],  // ← НОВОЕ!
  "getterPoint": {...},
  "windows": [...]
}
```

---

## 📋 Доступные созвездия:

Можно указать любые из следующих:
- **"GPS"** - GPS спутники
- **"GLONASS"** - ГЛОНАСС
- **"Galileo"** - Галилео
- **"BeiDou"** - Бейдоу
- **"Starlink"** - Starlink
- **"OneWeb"** - OneWeb
- **"Iridium"** - Iridium

Пример:
```json
"constellations": ["Starlink", "OneWeb", "GPS"]
```

---

## 🚀 Что происходит при активации:

### Раньше:
1. ✅ Создавался геттер
2. ✅ Устанавливалось время
3. ❌ Спутники НЕ загружались → нужно было вручную рендерить

### Теперь:
1. ✅ Создается геттер
2. ✅ Устанавливается время
3. ✅ **Автоматически загружаются созвездия из `constellations`**
4. ✅ Спутники видны сразу!

---

## 📂 Обновленные файлы:

### Код:
- ✅ [services/scenarios.js](../services/scenarios.js) - добавлено поле `constellations` в структуру
- ✅ [ui/scenario_controls.js](../ui/scenario_controls.js) - функция `loadScenarioConstellations()` + автозагрузка
- ✅ [main.js](../main.js) - передача `globe` в `initScenarioControls()`

### JSON примеры:
- ✅ [data/example_scenarios.json](../data/example_scenarios.json) - добавлены `constellations`
- ✅ [data/moscow_scenario.txt](../data/moscow_scenario.txt) - добавлены `constellations`

### Документация:
- ✅ [SCENARIO_GUIDE.md](SCENARIO_GUIDE.md) - обновлена структура
- ✅ [SCENARIO_QUICKSTART.md](SCENARIO_QUICKSTART.md) - добавлено описание

---

## 🎬 Как использовать:

### Пример сценария Tokyo:

```json
{
  "scenarios": [
    {
      "name": "Tokyo Coverage",
      "date": "2026-02-17",
      "startTime": "06:00",
      "constellations": ["Starlink"],
      "getterPoint": {
        "lon": 139.6503,
        "lat": 35.6762,
        "name": "Tokyo Getter"
      },
      "windows": [
        {
          "satelliteName": "STARLINK-1007",
          "constellationName": "Starlink",
          "startTime": "06:00",
          "endTime": "06:45",
          "color": "#00FF00"
        }
      ],
      "safetyWindow": 5
    }
  ]
}
```

### Активация:
1. Загрузите файл через "Load Scenarios from JSON"
2. Выберите "Tokyo Coverage"
3. Нажмите **"Activate Selected Scenario"**

### Результат:
- ✅ Геттер создан в Tokyo
- ✅ Время установлено на 06:00
- ✅ **Созвездие Starlink загружено автоматически**
- ✅ Спутник STARLINK-1007 увеличен с золотым треком (если в окне)

---

## 💡 Советы:

### 1. Укажите только нужные созвездия
Не загружайте все созвездия, если используете только Starlink:
```json
"constellations": ["Starlink"]  // быстрая загрузка
```

### 2. Комбинируйте созвездия
Если нужны спутники из разных созвездий:
```json
"constellations": ["Starlink", "OneWeb"]
```

### 3. Если поле отсутствует
Если `constellations` не указано, нужно вручную рендерить через UI:
- Меню → Constellations → Выбрать → Render

---

## 🔍 Логи консоли:

При активации сценария в консоли (F12) вы увидите:

```
[ScenarioControls] Loading constellations: Starlink
[ScenarioControls] Loading constellation: Starlink
[ScenarioControls] Constellation loaded: Starlink
[ScenarioControls] Created getter at: 139.6503, 35.6762
[ScenarioControls] Set time to: 2026-02-17T06:00:00.000Z
```

Если созвездие уже загружено:
```
[ScenarioControls] Constellation already loaded, making visible: Starlink
```

---

## ⚠️ Важные примечания:

### 1. Имена созвездий чувствительны к регистру
✅ Правильно: `"Starlink"`
❌ Неправильно: `"starlink"`, `"STARLINK"`

### 2. Имена должны совпадать с config/constellations.js
Доступные имена:
- GPS
- GLONASS
- Galileo
- BeiDou
- Starlink
- OneWeb
- Iridium

### 3. Загрузка может занять время
Первая загрузка TLE файлов может занять 5-10 секунд. Дождитесь сообщения в alert.

---

## 📊 Таблица полей JSON:

| Поле | Тип | Обязательное | Описание | Пример |
|------|-----|--------------|----------|--------|
| `name` | string | ✅ Да | Имя сценария | "Tokyo Coverage" |
| `description` | string | ❌ Нет | Описание | "Coverage for Tokyo" |
| `date` | string | ❌ Нет | Дата YYYY-MM-DD | "2026-02-17" |
| `startTime` | string | ❌ Нет | Время HH:MM | "06:00" |
| **`constellations`** | **array** | **❌ Нет** | **Массив созвездий** | **["Starlink"]** |
| `getterPoint` | object | ✅ Да | Геттер | {...} |
| `windows` | array | ✅ Да | Окна | [...] |
| `safetyWindow` | number | ✅ Да | Минуты | 5 |

---

## 🎯 Быстрый тест:

1. Откройте меню → "Scenario Mode"
2. Load `data/example_scenarios.json`
3. Выберите "Kiev Station Coverage"
4. Activate
5. Увидите alert: 
   ```
   Activated scenario: Kiev Station Coverage
   Getter: Kiev Getter Station
   Constellations: Starlink, OneWeb
   ```
6. Спутники загружены автоматически! ✅

---

**Теперь спутники загружаются автоматически при активации сценария! 🎊**
