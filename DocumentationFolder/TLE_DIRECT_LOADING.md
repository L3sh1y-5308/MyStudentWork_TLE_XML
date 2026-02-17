# 🛰️ ЗАГРУЗКА СПУТНИКОВ ЧЕРЕЗ TLE ДАННЫЕ

## ✅ РЕШЕНИЕ: Прямая загрузка TLE в JSON

Теперь вы можете **напрямую указывать TLE данные спутников** в JSON файлах сценариев!

---

## 🆕 Новое поле: `customSatellites`

### Структура:

```json
{
  "name": "My Scenario",
  "date": "2026-02-17",
  "startTime": "12:00",
  "customSatellites": [
    {
      "name": "STARLINK-1008",
      "tleLine1": "1 44714U 19074B   26019.33335648  .01367809  00000+0  58387-1 0  9999",
      "tleLine2": "2 44714  53.1090  47.8537 0002094  77.5814  56.2394 15.19580678  5791",
      "color": "#00FF00"
    },
    {
      "name": "STARLINK-1012",
      "tleLine1": "1 44718U 19074F   26019.33335648  .01417860  00000+0  60505-1 0  9992",
      "tleLine2": "2 44718  53.1090  47.8624 0001507 109.4099 138.9894 15.19480464  5795",
      "color": "#FFD700"
    }
  ],
  "customLayerName": "My Custom Layer",
  "getterPoint": {...},
  "windows": [...]
}
```

---

## 📋 Поля для кастомных спутников:

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| **`name`** | string | ✅ Да | Имя спутника |
| **`tleLine1`** | string | ✅ Да | Первая строка TLE |
| **`tleLine2`** | string | ✅ Да | Вторая строка TLE |
| **`color`** | string | ❌ Нет | Цвет спутника (HEX, по умолчанию #00FF00) |

### Дополнительные поля сценария:

| Поле | Тип | Описание |
|------|-----|----------|
| **`customLayerName`** | string | Имя слоя для кастомных спутников (по умолчанию "{scenarioName} Custom Satellites") |

---

## 🎯 Три способа загрузки спутников:

### 1️⃣ Только созвездия (из TLE файлов)
```json
{
  "constellations": ["Starlink", "OneWeb"]
}
```
- ✅ Быстро
- ✅ Автоматически загружаются все спутники созвездия
- ❌ Нельзя выбрать конкретные спутники

### 2️⃣ Только кастомные спутники (TLE напрямую)
```json
{
  "customSatellites": [
    {
      "name": "STARLINK-1008",
      "tleLine1": "1 44714U ...",
      "tleLine2": "2 44714 ...",
      "color": "#00FF00"
    }
  ]
}
```
- ✅ Точный контроль над спутниками
- ✅ Можно задать свой цвет
- ✅ Не нужно загружать целое созвездие
- ⚠️ Нужно вручную копировать TLE данные

### 3️⃣ Комбинированный подход (созвездия + кастомные)
```json
{
  "constellations": ["Starlink"],
  "customSatellites": [
    {
      "name": "MY-CUSTOM-SAT",
      "tleLine1": "1 44725U ...",
      "tleLine2": "2 44725 ...",
      "color": "#FF00FF"
    }
  ]
}
```
- ✅ Лучшее из обоих подходов
- ✅ Созвездия + свои спутники
- ✅ Разные цвета для разных групп

---

## 📂 Тестовый файл: `test_tle_scenario.json`

Создан файл **`data/test_tle_scenario.json`** с 3 примерами:

### 1. Test TLE Direct Loading
- 3 кастомных спутника с TLE
- Разные цвета (#00FF00, #FFD700, #FF6600)
- Kiev геттер

### 2. Moscow TLE Test
- **Комбинированный**: Starlink созвездие + 2 кастомных спутника
- Москва геттер
- 3 окна (кастом → Starlink → кастом)

### 3. Tokyo Mixed TLE Test
- **Комбинированный**: OneWeb созвездие + 2 кастомных Starlink
- Tokyo геттер
- Разные цвета для визуального различия

---

## 🚀 Как использовать:

### Шаг 1: Получить TLE данные

#### Вариант A: Из существующих файлов
Откройте файл `data/starlink.tle`:
```
STARLINK-1008           
1 44714U 19074B   26019.33335648  .01367809  00000+0  58387-1 0  9999
2 44714  53.1090  47.8537 0002094  77.5814  56.2394 15.19580678  5791
```

Скопируйте:
- **Имя**: `STARLINK-1008` (первая строка, убрать пробелы)
- **Line 1**: `1 44714U ...` (вторая строка)
- **Line 2**: `2 44714 ...` (третья строка)

#### Вариант B: Из интернета
- [CelesTrak](https://celestrak.org/NORAD/elements/)
- [Space-Track.org](https://www.space-track.org/)
- [N2YO](https://www.n2yo.com/)

### Шаг 2: Создать JSON

```json
{
  "scenarios": [
    {
      "name": "My Custom Scenario",
      "date": "2026-02-17",
      "startTime": "12:00",
      "customSatellites": [
        {
          "name": "STARLINK-1008",
          "tleLine1": "1 44714U 19074B   26019.33335648  .01367809  00000+0  58387-1 0  9999",
          "tleLine2": "2 44714  53.1090  47.8537 0002094  77.5814  56.2394 15.19580678  5791",
          "color": "#00FF00"
        }
      ],
      "getterPoint": {
        "lon": 30.5,
        "lat": 50.4,
        "name": "My Getter"
      },
      "windows": [
        {
          "satelliteName": "STARLINK-1008",
          "constellationName": "My Custom Scenario Custom Satellites",
          "startTime": "12:00",
          "endTime": "12:45",
          "color": "#00FF00"
        }
      ],
      "safetyWindow": 5
    }
  ]
}
```

### Шаг 3: Загрузить и активировать

1. Scenario Mode → Load from JSON
2. Выберите ваш файл
3. Activate Selected Scenario

### Результат:
✅ Спутники загружены из TLE  
✅ Геттер создан  
✅ Время установлено  
✅ Визуальное выделение в активных окнах  

---

## 💡 Важные примечания:

### 1. `constellationName` в окнах

Если вы используете `customSatellites`, в поле `constellationName` окна укажите:
```json
"constellationName": "My Custom Layer"
```
или если не указано `customLayerName`:
```json
"constellationName": "{scenarioName} Custom Satellites"
```

**Пример:**
```json
{
  "name": "Test Scenario",
  "customLayerName": "My Layer",
  "windows": [
    {
      "satelliteName": "STARLINK-1008",
      "constellationName": "My Layer",  // ← указать имя слоя
      "startTime": "12:00",
      "endTime": "12:45"
    }
  ]
}
```

### 2. TLE формат строгий

TLE **должны** быть скопированы точно:
- ✅ Правильно: `"1 44714U 19074B   26019.33335648  .01367809  00000+0  58387-1 0  9999"`
- ❌ Неправильно: `1 44714U` (обрезано)
- ❌ Неправильно: лишние пробелы или переносы

### 3. Обновление TLE данных

TLE устаревают! Для точности обновляйте TLE каждые:
- LEO спутники (Starlink): каждые 1-2 недели
- MEO спутники (GPS): каждый месяц
- GEO спутники: каждые 3 месяца

### 4. Цвета для различия

Используйте разные цвета для групп спутников:
```json
"customSatellites": [
  {"name": "SAT-1", "color": "#00FF00"},  // зеленый
  {"name": "SAT-2", "color": "#FFD700"},  // золотой
  {"name": "SAT-3", "color": "#FF6600"}   // оранжевый
]
```

---

## 🔍 Логи консоли:

При активации сценария с `customSatellites`:

```
[ScenarioControls] Loading 3 custom satellites
[Satellites] Loading 3 custom satellites to layer: Test Custom Satellites
[Satellites] Loaded custom satellite: STARLINK-1008
[Satellites] Loaded custom satellite: STARLINK-1012
[Satellites] Loaded custom satellite: STARLINK-1017
[Satellites] Total satellites in Test Custom Satellites: 3
[ScenarioControls] Custom satellites loaded successfully
```

Alert сообщение:
```
Activated scenario: Test TLE Direct Loading
Getter: Kiev Test Getter
Constellations: none
Custom Satellites: 3
```

---

## ⚠️ Устранение проблем:

### Спутники не видны?

1. **Проверьте TLE данные**
   - Открыть консоль (F12)
   - Искать ошибки: `Failed to load satellite`

2. **Проверьте constellationName в windows**
   - Должно совпадать с `customLayerName`
   - Или с автоматическим `{scenarioName} Custom Satellites`

3. **Проверьте дату TLE**
   - Если TLE старые (2019), спутники могут быть не на орбите
   - Используйте свежие TLE данные

4. **Проверьте видимость слоя**
   - Откройте UI → Layers
   - Убедитесь что слой с кастомными спутниками видим

### Спутники есть, но не выделяются?

1. **Проверьте satelliteName в windows**
   - Должно **точно** совпадать с `name` в `customSatellites`
   - ✅ Правильно: `"STARLINK-1008"`
   - ❌ Неправильно: `"Starlink-1008"` (регистр важен!)

2. **Проверьте время**
   - Satellite Mode должен быть включен
   - Текущее время должно быть в окне visibility

---

## 📊 Сравнение подходов:

| Критерий | Созвездия | Кастомные TLE | Комбинированный |
|----------|-----------|---------------|-----------------|
| Скорость загрузки | 🐌 Медленно (тысячи спутников) | ⚡ Быстро (1-10 спутников) | ⚡ Средне |
| Контроль | ❌ Все или ничего | ✅ Точный выбор | ✅ Гибкий |
| Цвета | ❌ Один цвет на созвездие | ✅ Каждый свой | ✅ Группы |
| Обновление | ✅ Автоматически (из файла) | ⚠️ Вручную | ⚠️ Частично |
| Применение | Общий обзор | Точные тесты | Лучший выбор |

---

## 🎬 Быстрый тест:

1. **Load** `data/test_tle_scenario.json`
2. **Activate** "Test TLE Direct Loading"
3. **Проверить**:
   - ✅ Геттер в Киеве
   - ✅ 3 спутника с TLE
   - ✅ Время установлено на 12:00
   - ✅ В консоли: "Loaded custom satellite" x3
4. **Включить** Scenario Mode
5. **Увидеть** спутники с золотыми треками в активном окне!

---

**Теперь вы можете загружать спутники напрямую из TLE данных! 🎊**

**Файлы:**
- 📄 [test_tle_scenario.json](../data/test_tle_scenario.json) - тестовые сценарии
- 📖 Эта документация - полное руководство
