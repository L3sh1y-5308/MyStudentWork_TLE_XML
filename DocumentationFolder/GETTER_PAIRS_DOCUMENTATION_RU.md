# Документация по работе с парами Getter'ов

## Описание

Система позволяет создавать пары наземных станций (getter'ов), которые работают вместе и подключаются только к определенному спутнику. Это обеспечивает целевое соединение между двумя getter'ами и их спутником без интерференции с другими парами.

## Формат JSON файла

### Структура для пар getter'ов

```json
{
  "getterPairs": [
    {
      "pairId": "pair1",
      "satelliteName": "STARLINK-1007",
      "getters": [
        {
          "name": "Getter New York",
          "lon": -74.006,
          "lat": 40.713
        },
        {
          "name": "Getter Los Angeles",
          "lon": -118.243,
          "lat": 34.052
        }
      ]
    }
  ]
}
```

### Поля

- **getterPairs** (array, обязательно): Массив пар getter'ов
  - **pairId** (string): Уникальный идентификатор пары (например, "pair1", "pair2")
  - **satelliteName** (string): Точное имя спутника из TLE файла, к которому подключается пара
  - **getters** (array): Массив из РОВНО 2 getter'ов
    - **name** (string): Название getter'а
    - **lon** (number): Долгота (-180 до 180)
    - **lat** (number): Широта (-90 до 90)

## Примеры

### Пример 1: Одна пара getter'ов

```json
{
  "getterPairs": [
    {
      "pairId": "pair1",
      "satelliteName": "STARLINK-1007",
      "getters": [
        {
          "name": "Ground Station Moscow",
          "lon": 37.617,
          "lat": 55.755
        },
        {
          "name": "Ground Station Berlin",
          "lon": 13.405,
          "lat": 52.520
        }
      ]
    }
  ]
}
```

### Пример 2: Несколько пар getter'ов

```json
{
  "getterPairs": [
    {
      "pairId": "pair_europe",
      "satelliteName": "STARLINK-1007",
      "getters": [
        {
          "name": "Station London",
          "lon": -0.127,
          "lat": 51.507
        },
        {
          "name": "Station Paris",
          "lon": 2.352,
          "lat": 48.856
        }
      ]
    },
    {
      "pairId": "pair_asia",
      "satelliteName": "STARLINK-1008",
      "getters": [
        {
          "name": "Station Tokyo",
          "lon": 139.691,
          "lat": 35.689
        },
        {
          "name": "Station Seoul",
          "lon": 126.978,
          "lat": 37.566
        }
      ]
    },
    {
      "pairId": "pair_americas",
      "satelliteName": "STARLINK-1009",
      "getters": [
        {
          "name": "Station New York",
          "lon": -74.006,
          "lat": 40.713
        },
        {
          "name": "Station San Francisco",
          "lon": -122.419,
          "lat": 37.775
        }
      ]
    }
  ]
}
```

### Пример 3: Максимальная конфигурация

```json
{
  "getterPairs": [
    {
      "pairId": "north_america_1",
      "satelliteName": "STARLINK-1007",
      "getters": [
        {
          "name": "NA Station West",
          "lon": -122.419,
          "lat": 37.775
        },
        {
          "name": "NA Station East",
          "lon": -74.006,
          "lat": 40.713
        }
      ]
    },
    {
      "pairId": "europe_1",
      "satelliteName": "STARLINK-1008",
      "getters": [
        {
          "name": "EU Station West",
          "lon": -0.127,
          "lat": 51.507
        },
        {
          "name": "EU Station East",
          "lon": 13.405,
          "lat": 52.520
        }
      ]
    },
    {
      "pairId": "asia_1",
      "satelliteName": "STARLINK-1009",
      "getters": [
        {
          "name": "ASIA Station North",
          "lon": 139.691,
          "lat": 35.689
        },
        {
          "name": "ASIA Station South",
          "lon": 103.851,
          "lat": 1.290
        }
      ]
    },
    {
      "pairId": "australia_1",
      "satelliteName": "STARLINK-1010",
      "getters": [
        {
          "name": "AUS Station East",
          "lon": 151.209,
          "lat": -33.865
        },
        {
          "name": "AUS Station West",
          "lon": 115.861,
          "lat": -31.953
        }
      ]
    }
  ]
}
```

## Как использовать

1. **Создайте JSON файл** с нужными парами getter'ов по примеру выше
2. **Запустите приложение** и выберите нужные созвездия (например, Starlink)
3. **Нажмите "Render"** для отображения спутников
4. **Загрузите JSON файл** через интерфейс "Red Marker (Raycast Visualization)"
5. **Система автоматически**:
   - Создаст маркеры для каждого getter'а
   - Найдет спутники по имени
   - Отобразит лучи (raycast) ТОЛЬКО между парами getter'ов и их назначенным спутником

## Важные замечания

⚠️ **ВАЖНО:**
- Каждая пара должна содержать РОВНО 2 getter'а
- Имя спутника (satelliteName) должно ТОЧНО совпадать с именем в TLE файле
- Каждая пара работает НЕЗАВИСИМО от других пар
- Лучи рисуются только если:
  - Спутник найден и имеет координаты
  - Расстояние до спутника <= 5000 км (можно изменить)
  - Луч НЕ проходит сквозь Землю

## Обратная совместимость

Старый формат JSON файлов (массив обычных точек) также поддерживается:

```json
[
  {
    "name": "Point 1",
    "lon": -74.006,
    "lat": 40.713
  },
  {
    "name": "Point 2",
    "lon": -118.243,
    "lat": 34.052
  }
]
```

Система автоматически определяет формат файла и обрабатывает его соответствующим образом.

## Как узнать имена спутников

Имена спутников берутся из TLE файлов в папке `data/`. Например:
- `starlink.tle` - содержит спутники с именами вроде "STARLINK-1007", "STARLINK-1008" и т.д.
- `gps-ops.tle` - содержит GPS спутники
- `galileo.tle` - содержит спутники Galileo

Откройте соответствующий TLE файл и найдите нужное имя спутника на первой строке каждого блока.

## Пример работы

После загрузки JSON файла с тремя парами, вы увидите:
- 6 красных маркеров на глобусе (по 2 на пару)
- Каждая пара подключена ТОЛЬКО к своему спутнику
- Лучи меняют цвет в зависимости от расстояния (зеленый = близко, красный = далеко)
- Если спутник слишком далеко или луч проходит сквозь Землю, лучи не отображаются
