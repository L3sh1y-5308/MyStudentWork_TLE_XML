# Отладка: Лучи для пар getter'ов

## Что произошло

Добавлена **полная система отладки** в функцию `updateRaysForGetterPairs()` для диагностики проблем с raycast'ом.

## Как использовать для отладки

### Шаг 1: Откройте DevTools

1. Откройте браузер с приложением
2. Нажмите **F12** или **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
3. Перейдите на вкладку **Console** (Консоль)

### Шаг 2: Загрузите JSON с парами

1. Выберите созвездие (например, Starlink)
2. Нажмите "Render"
3. Загрузите JSON файл: `test_debug.json`
4. Смотрите в консоль результаты

### Шаг 3: Интерпретируйте логи

#### Успешный результат

```
[updateRaysForGetterPairs] ===== PROCESSING 1 PAIRS =====
[updateRaysForGetterPairs] Available satellites: 2500
[updateRaysForGetterPairs] First satellite: "STARLINK-1008"

[updateRaysForGetterPairs] ===== PAIR: test_starlink → STARLINK-1008 =====
[updateRaysForGetterPairs] Satellite found: "STARLINK-1008" at (15.43, -23.51, 551.2km)
  Getter "New York": distance=9547km, maxDist=5000km
    → SKIP (distance exceeded)
  Getter "London": distance=8932km, maxDist=5000km
    → SKIP (distance exceeded)
[updateRaysForGetterPairs] Pair test_starlink: added 0 rays
[updateRaysForGetterPairs] ===== DONE =====
```

#### Проблема: Спутник не найден

```
[updateRaysForGetterPairs] ===== PAIR: test_starlink → STARLINK-1008 =====
[updateRaysForGetterPairs] Satellite "STARLINK-1008" not found!
[updateRaysForGetterPairs] Available (first 10): "STARLINK-1001", "STARLINK-1003", "STARLINK-1005"...
```

**Решение:** Имя спутника не совпадает. Проверьте `data/starlink.tle` и исправьте имя в JSON.

#### Проблема: Нет координат спутника

```
[updateRaysForGetterPairs] Satellite missing coordinates: lon=true lat=true height=false
```

**Решение:** Спутник найден, но еще не получил координаты. Это может быть ошибка с TLE или проблема инициализации.

## Что делает отладка

### Уровень 1: Инициализация
```
- Проверяет наличие rayLayer
- Показывает количество пар и спутников
- Показывает первый спутник из списка
```

### Уровень 2: Поиск спутника
```
- Ищет спутник по точному имени
- Если не найден - пробует без учета регистра
- Показывает все доступные спутники если не найден
```

### Уровень 3: Проверка координат
```
- Проверяет наличие lon, lat, height
- Показывает точные координаты спутника
```

### Уровень 4: Расчет лучей
```
- Показывает расстояние для каждого getter'а
- Показывает причину пропуска (расстояние, Земля)
- Отмечает успешно добавленные лучи ✓
```

## Файлы для тестирования

### `test_debug.json` - Базовый тест
```json
{
  "getterPairs": [
    {
      "pairId": "test_starlink",
      "satelliteName": "STARLINK-1008",
      "getters": [
        {"name": "New York", "lon": -74.0, "lat": 40.7},
        {"name": "London", "lon": -0.1, "lat": 51.5}
      ]
    }
  ]
}
```

Ожидаемый результат: лучи НЕ будут показаны, потому что спутники слишком далеко.

## Как найти правильные имена спутников

1. Откройте файл `data/starlink.tle`
2. На первой строке каждого блока из 3 строк - имя спутника
3. Скопируйте точное имя (без пробелов)

Пример:
```
STARLINK-1008              ← Имя (после trim()  → "STARLINK-1008")
1 44714U 19074B   26019...
2 44714  53.1090  47.8537...
```

## Лог сообщений

### Нормальные сообщения

```
[addGetterPairs] Creating pair "pair1" for satellite "STARLINK-1008"
[addGetterPairs] Added getter "New York" to pair "pair1"
[addGetterPairs] Total pairs added: 1
```

```
[updateSatellites] Pairs count: 1, satellites: 2500
[updateSatellites] Using pair raycast mode
```

### Сообщения об ошибках

```
[updateRaysForGetterPairs] Satellite "STARLINK-1008" not found!
```

Означает: спутник с этим именем не найден в списке доступных спутников.

```
[updateRaysForGetterPairs] Satellite missing coordinates: lon=false lat=true height=true
```

Означает: спутник найден, но не имеет долготы. Проблема с TLE или парсингом.

```
[updateRaysForGetterPairs] Getter "New York": distance=9547km, maxDist=5000km
  → SKIP (distance exceeded)
```

Означает: луч не отрисовывается, потому что расстояние больше 5000 км.

## Как получить лучи

### Условия для отрисовки луча

✓ Спутник должен быть найден  
✓ Спутник должен иметь координаты (lon, lat, height)  
✓ Расстояние до спутника < 5000 км  
✓ Луч НЕ должен проходить сквозь Землю  

### Какие координаты использовать

Для тестирования используйте getter'ы близко к спутнику:

```json
{
  "getterPairs": [
    {
      "pairId": "test",
      "satelliteName": "STARLINK-1008",
      "getters": [
        {"name": "Getter A", "lon": 20.0, "lat": 45.0},
        {"name": "Getter B", "lon": 25.0, "lat": 45.0}
      ]
    }
  ]
}
```

Это должно дать лучи, если спутник проходит в нормальной близости от этого региона.

## Очистка логов

Для очистки консоли:
```javascript
console.clear()
```

## Что дальше

Если логи показывают, что спутник найден и лучи добавлены, но вы их не видите на глобусе:

1. Проверьте что rayLayer видим
2. Проверьте что цвет лучей правильный (может быть слишком темный)
3. Попробуйте изменить толщину луча в коде (сейчас `thickness: 3`)
