# 🎯 ЧТО ИЗМЕНИЛОСЬ - НОВЫЕ ВОЗМОЖНОСТИ СЦЕНАРИЕВ

## ✅ Обновления системы:

### 1. **Автоматическая установка даты и времени**
Теперь при активации сценария время автоматически устанавливается!

**Новые поля в JSON:**
```json
{
  "name": "My Scenario",
  "date": "2026-02-17",        // ← НОВОЕ!
  "startTime": "12:00",         // ← НОВОЕ!
  "getterPoint": {...},
  "windows": [...]
}
```

### 2. **Автоматическое создание геттера**
При активации сценария геттер автоматически создается на карте!
- Красная точка с 3D моделью
- Позиция берется из `getterPoint`

### 3. **Обновленные примеры**
Все файлы примеров обновлены:
- ✅ `data/example_scenarios.json`
- ✅ `data/moscow_scenario.txt`
- ✅ `data/tokyo_osaka_scenarios.json` (новый!)

---

## 🚀 КАК ИСПОЛЬЗОВАТЬ:

### Быстрый старт:

1. **Откройте меню** (≡) → **"Scenario Mode"**

2. **Загрузите сценарий:**
   - Нажмите "Choose File"
   - Выберите `data/tokyo_osaka_scenarios.json`
   - Сценарии загрузятся

3. **Активируйте:**
   - Выберите "Tokyo Station Coverage"
   - Нажмите **"Activate Selected Scenario"**
   
4. **Результат:**
   - ✅ Геттер создан в Tokyo (lon: 139.65, lat: 35.68)
   - ✅ Время установлено на 06:00 (17 февраля 2026)
   - ✅ Режим сценариев включен

5. **Отрендерите спутники:**
   - Выберите **Starlink** в "Constellations"
   - Нажмите **"Render"**
   - Включите **"Trails"**

6. **Увидите:**
   - 🔴 Геттер в Tokyo (красная модель)
   - 🛰️ Активный спутник увеличен ×3 с золотым треком (если в окне)
   - 📊 Статус окна в панели

---

## 📝 ПРИМЕР НОВОГО JSON:

```json
{
  "scenarios": [
    {
      "name": "Moscow Center Coverage",
      "description": "Coverage for Moscow center",
      "date": "2026-02-17",           // Дата сценария
      "startTime": "08:00",           // Автоустановка времени
      "getterPoint": {
        "lon": 37.6173,
        "lat": 55.7558,
        "name": "Moscow Getter"
      },
      "windows": [
        {
          "satelliteName": "STARLINK-1007",
          "constellationName": "Starlink",
          "startTime": "08:00",
          "endTime": "08:45",
          "color": "#00ff00"
        },
        {
          "satelliteName": "STARLINK-1341",
          "constellationName": "Starlink",
          "startTime": "08:50",
          "endTime": "09:35",
          "color": "#00ffaa"
        }
      ],
      "safetyWindow": 5
    }
  ]
}
```

---

## 🎨 ЧТО ВЫ УВИДИТЕ:

### До активации:
- Пустая карта
- Время: текущее

### После активации:
- 🔴 **Геттер на карте** (3D модель в указанной точке)
- ⏰ **Время изменено** на `date` + `startTime` из JSON
- 📊 **Панель статуса** показывает текущее окно
- 🛰️ **Активный спутник** (если в окне):
  - Размер ×3
  - Золотистый трек (#FFD700)
  - Толщина трека 3px

---

## 🔧 ПОЛЯ JSON (ПОЛНОЕ ОПИСАНИЕ):

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `name` | string | ✅ Да | Имя сценария |
| `description` | string | ❌ Нет | Описание |
| `date` | string | ❌ Нет | Дата YYYY-MM-DD |
| `startTime` | string | ❌ Нет | Время HH:MM для автоустановки |
| `getterPoint` | object | ✅ Да | Координаты геттера |
| `getterPoint.lon` | number | ✅ Да | Долгота |
| `getterPoint.lat` | number | ✅ Да | Широта |
| `getterPoint.name` | string | ❌ Нет | Название станции |
| `windows` | array | ✅ Да | Массив окон |
| `windows[].satelliteName` | string | ✅ Да | Имя спутника (из TLE) |
| `windows[].constellationName` | string | ✅ Да | Созвездие |
| `windows[].startTime` | string | ✅ Да | Время начала HH:MM |
| `windows[].endTime` | string | ✅ Да | Время конца HH:MM |
| `windows[].color` | string | ❌ Нет | HEX цвет |
| `safetyWindow` | number | ✅ Да | Минуты между окнами |

---

## 📂 ФАЙЛЫ ДЛЯ ТЕСТИРОВАНИЯ:

### 1. Tokyo-Osaka Scenarios
**Файл:** `data/tokyo_osaka_scenarios.json`
- 2 сценария (Tokyo, Osaka)
- Дата: 2026-02-17
- Время: 06:00 / 05:30

### 2. Moscow Scenarios
**Файл:** `data/moscow_scenario.txt` → переименуйте в `.json`
- 2 сценария (Center, East)
- Дата: 2026-02-17
- Время: 08:00 / 07:30

### 3. Example Scenarios
**Файл:** `data/example_scenarios.json`
- 3 сценария (Kiev, London, Tokyo)
- Обновлены с датой и временем

---

## 🎯 ЛОГИКА АВТОУСТАНОВКИ ВРЕМЕНИ:

1. **Если есть `date` И `startTime`:** 
   → Устанавливается точная дата и время

2. **Если есть только `startTime`:**
   → Текущая дата + указанное время

3. **Если есть только `date`:**
   → Указанная дата + время первого окна

4. **Если ничего нет:**
   → Время первого окна в текущей дате

---

## ❓ УСТРАНЕНИЕ ПРОБЛЕМ:

### Проблема: Не вижу геттера
**Решение:**
- Проверьте, что `getterPoint` указан в JSON
- Откройте консоль (F12) → ищите: `[ScenarioControls] Created getter at:`

### Проблема: Не вижу спутника
**Решение:**
- Отрендерите созвездие (Starlink)
- Проверьте, что текущее время в окне (06:00-06:45)
- Проверьте имя спутника в `data/starlink.tle`

### Проблема: Время не меняется
**Решение:**
- Проверьте формат даты: `"2026-02-17"`
- Проверьте формат времени: `"12:00"`
- Откройте консоль → ищите: `[ScenarioControls] Set time to:`

---

## 📖 ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ:

- **Полное руководство:** `DocumentationFolder/SCENARIO_GUIDE.md`
- **Быстрый старт:** `DocumentationFolder/SCENARIO_QUICKSTART.md`

---

**Готово! Теперь сценарии полностью автоматические! 🎉**
