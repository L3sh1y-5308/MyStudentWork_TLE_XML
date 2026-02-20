# Руководство по логированию расчетов в консоли

## Открытие консоли браузера

### Chrome / Edge
1. Нажмите **F12**
2. Откройте вкладку **Console** (Консоль)

### Firefox
1. Нажмите **F12**
2. Откройте вкладку **Console** (Консоль)

## Пример вывода логирования

Когда вы загружаете пару getter'ов, в консоли появится примерно это:

```
[updateRaysForGetterPairs] ===== PROCESSING 1 PAIRS =====
[updateRaysForGetterPairs] Available satellites: 2500

[updateRaysForGetterPairs] ===== PAIR: japan_pair =====
[updateRaysForGetterPairs] Getter1: "Tokyo Station" at (139.691, 35.689)
[updateRaysForGetterPairs] Getter2: "Osaka Station" at (135.506, 34.674)
[updateRaysForGetterPairs] Max distance: 7000km

  "STARLINK-1019": G1:✓ 4523km | G2:✗ 5821km
  "STARLINK-1020": G1:✓ 3821km | G2:✓ 4100km
  "STARLINK-1021": G1:✓ 4567km | G2:✓ 4289km
  "STARLINK-1022": G1:✗ 7200km | G2:✗ 7500km
  "STARLINK-1023": G1:✗ 8100km | G2:✗ 8300km
  ... (остальные спутники)

[updateRaysForGetterPairs] Processed: 2500 satellites, Accessible: 147
[updateRaysForGetterPairs] Common: 5, G1 only: 3, G2 only: 2

[updateRaysForGetterPairs] Using COMMON satellites mode
  Satellite "STARLINK-1020": both can reach (3821km, 4100km)
  Satellite "STARLINK-1021": both can reach (4567km, 4289km)

[updateRaysForGetterPairs] Pair japan_pair: added 4 rays
[updateRaysForGetterPairs] ===== DONE =====
```

## Разбор каждой строки

### Заголовок пары
```
[updateRaysForGetterPairs] ===== PAIR: japan_pair =====
[updateRaysForGetterPairs] Getter1: "Tokyo Station" at (139.691, 35.689)
[updateRaysForGetterPairs] Getter2: "Osaka Station" at (135.506, 34.674)
[updateRaysForGetterPairs] Max distance: 7000km
```

**Означает:**
- Обрабатываем пару с ID `japan_pair`
- Getter1: Токио на координатах (139.691°E, 35.689°N)
- Getter2: Осака на координатах (135.506°E, 34.674°N)
- Спутник доступен если расстояние ≤ 7000 км

### Доступные спутники
```
"STARLINK-1019": G1:✓ 4523km | G2:✗ 5821km
"STARLINK-1020": G1:✓ 3821km | G2:✓ 4100km
"STARLINK-1021": G1:✗ 7200km | G2:✓ 6500km
```

**Расшифровка:**
- `STARLINK-1019`: 
  - G1 (Токио): ✓ может дотянуться, расстояние 4523км
  - G2 (Осака): ✗ не может дотянуться, расстояние 5821км
  
- `STARLINK-1020`:
  - G1: ✓ 3821км (доступен)
  - G2: ✓ 4100км (доступен) ← **ОБЩИЙ спутник**
  
- `STARLINK-1021`:
  - G1: ✗ 7200км (> 7000км лимит) → НЕ доступен
  - G2: ✓ 6500км (доступен)

### Итоговая статистика
```
[updateRaysForGetterPairs] Processed: 2500 satellites, Accessible: 147
[updateRaysForGetterPairs] Common: 5, G1 only: 3, G2 only: 2
```

**Означает:**
- Всего спутников в каталоге: 2500
- Из них доступны хотя бы одному getter'у: 147
- Разбивка доступных:
  - 5 спутников доступны ОБА getter'ам (ОБЩИЕ)
  - 3 спутника доступны ТОЛЬКО Getter1
  - 2 спутника доступны ТОЛЬКО Getter2

### Выбор режима работы
```
[updateRaysForGetterPairs] Using COMMON satellites mode
  Satellite "STARLINK-1020": both can reach (3821km, 4100km)
  Satellite "STARLINK-1021": both can reach (4567km, 4289km)
```

**Означает:**
- Найдены 5 общих спутников
- Выбран режим "ОБЩИЕ спутники"
- Берем 5 ближайших общих спутников
- Система выбрала STARLINK-1020 и STARLINK-1021
- ОБА getter'а будут рейкастить в эти спутники

### Альтернативный режим
```
[updateRaysForGetterPairs] Using INDIVIDUAL satellites mode
  Getter1 → "STARLINK-1019" (4523km)
  Getter2 → "STARLINK-1021" (6500km)
```

**Означает:**
- Нет общих спутников
- Выбран режим "Индивидуальные спутники"
- Getter1 рейкастит в свой ближайший: STARLINK-1019 (4523км)
- Getter2 рейкастит в свой ближайший: STARLINK-1021 (6500км)

### Итог
```
[updateRaysForGetterPairs] Pair japan_pair: added 4 rays
[updateRaysForGetterPairs] ===== DONE =====
```

**Означает:**
- В этой паре создано 4 луча (полилинии)
- Обработка завершена

## Пошаговая проверка в консоли

### Шаг 1: Откройте консоль
```
F12 → Console
```

### Шаг 2: Загрузите JSON с парами
- Нажмите кнопку "Load Markers JSON"
- Выберите файл `simple_pair.json`

### Шаг 3: Смотрите консоль
- Вы увидите логи, начинающиеся с `[updateRaysForGetterPairs]`
- Каждая пара имеет отдельный лог

### Шаг 4: Проверьте результат на карте
- Если есть ✓ спутники: на карте должны появиться цветные линии
- Если нет ✓ спутников: линий не будет (все спутники слишком далеко)

## Почему нет линий (лучей)?

### Причина 1: Все спутники слишком далеко
```
Processed: 2500 satellites, Accessible: 0
```
Решение: Измените maxDistance с 7000 на 10000 в `satellites.js`

### Причина 2: Getter'ы находятся в полюсах
```
Getter1: "Pole" at (0, 80)
Processed: 2500 satellites, Accessible: 2
```
Решение: Переместите getter'ы ближе к экватору

### Причина 3: Спутники на противоположной стороне Земли
```
[updateRaysForGetterPairs] Common: 0, G1 only: 0, G2 only: 0
```
Решение: Приблизьте getter'ы друг к другу

## Как читать расстояния

### Близко (зеленая линия)
```
"STARLINK-1020": G1:✓ 3821km | G2:✓ 4100km
```
- 3821км < 7000км → Зеленая линия (близко)

### Далеко (красная линия)
```
"STARLINK-1019": G1:✓ 6900km | G2:✗ 7100km
```
- 6900км → Красная линия (далеко, но доступно)
- 7100км → ✗ Не доступно (превышает лимит)

### Недоступно
```
"STARLINK-1021": G1:✗ 7200km | G2:✗ 7800km
```
- Обе попытки превышают 7000км
- Не будет рейкаста в этот спутник

## Формула для понимания расстояния

Когда вы видите:
```
"STARLINK-1020": G1:✓ 3821km
```

Это означает:
1. **Горизонтальное расстояние** (по земной поверхности) ≈ 3500км
2. **Высота спутника** = 550км (типичная высота Starlink)
3. **Итоговое расстояние** = √(3500² + 550²) ≈ 3821км

Формула: `расстояние = √(расстояние_по_поверхности² + высота²)`

## Копирование логов для анализа

1. Отметьте все логи в консоли: `Ctrl+A`
2. Скопируйте: `Ctrl+C`
3. Вставьте в текстовый файл: `Ctrl+V`
4. Проанализируйте

Или сразу в консоли используйте:
```javascript
copy(console.log("paste here"))
```
