# Исправление: Raycast для пар getter'ов

## Проблема
Лучи (raycast) не отображались для пар getter'ов.

## Решение
Добавлена **детальная система отладки** для диагностики проблемы.

## Что было сделано

### 1. Улучшена функция `addGetterPairs()`
- ✓ Добавлены логи при создании пар
- ✓ Показывает количество созданных пар

### 2. Переписана функция `updateRaysForGetterPairs()`
- ✓ Проверка наличия rayLayer
- ✓ Гибкий поиск спутника (точный + без учета регистра)
- ✓ Подробная информация о каждом getter'е
- ✓ Лог по каждому лучу (добавлен или пропущен)
- ✓ Показывает причины пропуска лучей

### 3. Добавлена отладка в `updateSatellites()`
- ✓ Показывает сколько пар и спутников
- ✓ Показывает какой режим используется (пары vs обычные)

## Как использовать отладку

### Откройте консоль
1. Нажмите **F12**
2. Перейдите на вкладку **Console**

### Загрузите JSON с парами
1. Выберите созвездие (Starlink) → "Render"
2. Загрузите `test_debug.json`
3. Смотрите логи в консоли

### Интерпретируйте результаты

**Вы должны увидеть:**
```
[updateSatellites] RAYCAST: pairs=1, satellites=2500
[updateSatellites] → Using PAIR raycast
[updateRaysForGetterPairs] ===== PROCESSING 1 PAIRS =====
[updateRaysForGetterPairs] Available satellites: 2500
...
```

**Если спутник не найден:**
```
[updateRaysForGetterPairs] Satellite "STARLINK-1008" not found!
```
→ Проверьте имя спутника в JSON файле

**Если лучи не добавляются:**
```
[updateRaysForGetterPairs] Getter "New York": distance=9547km, maxDist=5000km
  → SKIP (distance exceeded)
```
→ Спутник слишком далеко, используйте getter'ы поближе

## Файлы для тестирования

### `test_debug.json` - Для отладки
Использует STARLINK-1008, проверяет есть ли лучи

### `test_one_pair.json` - Простой тест
London ↔ Moscow через STARLINK-1007

### `global_network_example.json` - Большая сеть
5 пар по всему миру

## Следующие шаги

1. Откройте консоль браузера (F12)
2. Загрузите `test_debug.json`
3. Смотрите логи и понимайте где проблема
4. Используйте DEBUG_GUIDE.md для полной информации

## Ожидаемые логи

### При успешной загрузке пары:
```
[addGetterPairs] Creating pair "test_starlink" for satellite "STARLINK-1008"
[addGetterPairs] Added getter "New York" to pair "test_starlink"
[addGetterPairs] Total pairs added: 1, [{ id: 1, pairId: "test_starlink", ... }]
```

### При обновлении спутников:
```
[updateSatellites] RAYCAST: pairs=1, satellites=2500
[updateSatellites] → Using PAIR raycast
```

### При поиске и отрисовке лучей:
```
[updateRaysForGetterPairs] ===== PROCESSING 1 PAIRS =====
[updateRaysForGetterPairs] ===== PAIR: test_starlink → STARLINK-1008 =====
[updateRaysForGetterPairs] Satellite found: "STARLINK-1008" at (15.43, -23.51, 551.2km)
  Getter "New York": distance=9547km, maxDist=5000km
    → SKIP (distance exceeded)
```

## Если всё работает правильно

Вы должны видеть лучи на глобусе между getter'ами и спутником, если:
- ✓ Спутник найден
- ✓ Расстояние < 5000 км
- ✓ Луч НЕ проходит сквозь Землю

Если лучей всё ещё нет - проверьте консоль для детальной диагностики!
