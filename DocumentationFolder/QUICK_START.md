# 🔧 Быстрый старт отладки

## За 30 секунд

### 1. Откройте консоль
```
F12 → Console
```

### 2. Загрузите Starlink
```
1. Конселляция: выберите "Starlink"
2. Нажмите "Render"
```

### 3. Загрузите JSON
```
1. Выберите файл: test_debug.json
2. Нажмите "Add markers"
```

### 4. Смотрите логи
```
[addGetterPairs] Creating pair "test_starlink" for satellite "STARLINK-1008"
[updateRaysForGetterPairs] ===== PROCESSING 1 PAIRS =====
...
```

## Если есть проблема

### Лучи не видны?
Смотрите консоль. Там будет точная причина:
- Спутник не найден → неправильное имя в JSON
- Расстояние > 5000 км → используйте getter'ы поближе
- Луч сквозь Землю → выберите другие координаты

### Как получить нужное имя спутника?
1. Откройте `data/starlink.tle`
2. Найдите нужный спутник на первой строке каждого блока
3. Скопируйте точное имя

### Быстрый тест с Москвой и Лондоном
Используйте `test_one_pair.json` - они достаточно близко друг к другу.

## Что вы должны увидеть

✓ Консоль показывает логи про пары и спутники  
✓ На глобусе видны красные маркеры (getter'ы)  
✓ Если спутник в нормальной близости - видны цветные лучи  

## Логирование по уровням

### TRACE: что-то с именем/форматом
```
[updateRaysForGetterPairs] Satellite "STARLINK-1008" not found!
```

### WARN: спутник найден, но нет полных данных
```
[updateRaysForGetterPairs] Satellite missing coordinates: lon=true lat=true height=false
```

### INFO: луч пропущен (нормально, если расстояние большое)
```
[updateRaysForGetterPairs] Pair test_starlink: added 0 rays
```

### SUCCESS: луч добавлен!
```
✓ Ray added
```

## JSON формат (правильный)

```json
{
  "getterPairs": [
    {
      "pairId": "УНИКАЛЬНЫЙ_ID",
      "satelliteName": "ТОЧНОЕ_ИМЯИЗ_TLE",
      "getters": [
        {"name": "Getter 1", "lon": -74, "lat": 40},
        {"name": "Getter 2", "lon": -0.1, "lat": 51}
      ]
    }
  ]
}
```

Вот и всё! Консоль покажет вам всё необходимое для отладки.
