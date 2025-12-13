# Источники (Sources)

Источники — это функции, которые **генерируют** визуальный сигнал. Они являются отправной точкой любого визуала в Hydra.

## Обзор источников

| Функция | Описание |
|---------|----------|
| `osc()` | Осциллятор — полосатый паттерн |
| `noise()` | Шум Перлина |
| `shape()` | Геометрические фигуры |
| `voronoi()` | Диаграмма Вороного |
| `gradient()` | Цветовой градиент |
| `solid()` | Сплошной цвет |
| `src()` | Внешний источник |

---

## osc() — Осциллятор

Создаёт полосатый паттерн, похожий на сигнал осциллятора.

### Синтаксис

```javascript
osc(frequency, sync, offset)
```

### Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| frequency | Number | 60 | Частота полос |
| sync | Number | 0.1 | Скорость движения |
| offset | Number | 0 | Цветовое смещение (RGB сдвиг) |

### Примеры

**Базовый осциллятор:**
```javascript
osc().out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc().out()
`}
/>

**Медленный цветной осциллятор:**
```javascript
osc(10, 0.1, 0.8).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.8).out()
`}
/>

**Быстрый радужный осциллятор:**
```javascript
osc(60, 0.5, 1.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(60, 0.5, 1.5).out()
`}
/>

**Анимированная частота:**
```javascript
osc(() => Math.sin(time) * 50 + 60).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(() => Math.sin(time) * 50 + 60, 0.1, 0.5).out()
`}
/>

---

## noise() — Шум Перлина

Генерирует органичный шумовой паттерн на основе алгоритма Перлина.

### Синтаксис

```javascript
noise(scale, offset)
```

### Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| scale | Number | 10 | Масштаб шума (больше = мельче детали) |
| offset | Number | 0.1 | Скорость анимации |

### Примеры

**Базовый шум:**
```javascript
noise().out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise().out()
`}
/>

**Крупный медленный шум:**
```javascript
noise(3, 0.05).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(3, 0.05).out()
`}
/>

**Мелкий быстрый шум:**
```javascript
noise(50, 0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(50, 0.5).out()
`}
/>

**Цветной шум:**
```javascript
noise(10, 0.1)
  .color(1, 0.5, 0.2)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(10, 0.1)
  .color(1, 0.5, 0.2)
  .out()
`}
/>

---

## shape() — Геометрические фигуры

Создаёт правильные многоугольники.

### Синтаксис

```javascript
shape(sides, radius, smoothing)
```

### Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| sides | Number | 3 | Количество сторон |
| radius | Number | 0.3 | Размер фигуры (0-1) |
| smoothing | Number | 0.01 | Размытие краёв |

### Примеры

**Треугольник:**
```javascript
shape(3).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(3).out()
`}
/>

**Квадрат:**
```javascript
shape(4, 0.5, 0.01).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(4, 0.5, 0.01).out()
`}
/>

**Шестиугольник:**
```javascript
shape(6, 0.4, 0.02).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(6, 0.4, 0.02).out()
`}
/>

**Круг (много сторон):**
```javascript
shape(100, 0.3, 0.01).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(100, 0.3, 0.01).out()
`}
/>

**Размытая фигура:**
```javascript
shape(5, 0.4, 0.3).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(5, 0.4, 0.3).out()
`}
/>

**Сетка фигур:**
```javascript
shape(4, 0.3, 0.01)
  .repeat(4, 4)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(4, 0.3, 0.01)
  .repeat(4, 4)
  .out()
`}
/>

---

## voronoi() — Диаграмма Вороного

Создаёт клеточный паттерн на основе диаграммы Вороного.

### Синтаксис

```javascript
voronoi(scale, speed, blending)
```

### Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| scale | Number | 5 | Количество ячеек |
| speed | Number | 0.3 | Скорость движения |
| blending | Number | 0.3 | Смешивание цветов |

### Примеры

**Базовый Вороной:**
```javascript
voronoi().out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
voronoi().out()
`}
/>

**Много мелких ячеек:**
```javascript
voronoi(20, 0.1, 0.1).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
voronoi(20, 0.1, 0.1).out()
`}
/>

**Медленный плавный Вороной:**
```javascript
voronoi(5, 0.05, 0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
voronoi(5, 0.05, 0.5).out()
`}
/>

**Вороной с калейдоскопом:**
```javascript
voronoi(10, 0.3, 0.3)
  .kaleid(6)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
voronoi(10, 0.3, 0.3)
  .kaleid(6)
  .out()
`}
/>

---

## gradient() — Градиент

Создаёт цветовой градиент.

### Синтаксис

```javascript
gradient(speed)
```

### Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| speed | Number | 0 | Скорость анимации |

### Примеры

**Статический градиент:**
```javascript
gradient().out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
gradient().out()
`}
/>

**Анимированный градиент:**
```javascript
gradient(0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
gradient(0.5).out()
`}
/>

**Градиент с калейдоскопом:**
```javascript
gradient(0.2)
  .kaleid(8)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
gradient(0.2)
  .kaleid(8)
  .out()
`}
/>

---

## solid() — Сплошной цвет

Создаёт однотонный цветовой фон.

### Синтаксис

```javascript
solid(r, g, b, a)
```

### Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| r | Number | 0 | Красный (0-1) |
| g | Number | 0 | Зелёный (0-1) |
| b | Number | 0 | Синий (0-1) |
| a | Number | 1 | Альфа-канал (0-1) |

### Примеры

**Красный фон:**
```javascript
solid(1, 0, 0).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
solid(1, 0, 0).out()
`}
/>

**Полупрозрачный синий:**
```javascript
solid(0, 0, 1, 0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
solid(0, 0, 1, 0.5).out()
`}
/>

**Пульсирующий цвет:**
```javascript
solid(
  () => Math.sin(time) * 0.5 + 0.5,
  0.2,
  0.8
).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
solid(
  () => Math.sin(time) * 0.5 + 0.5,
  0.2,
  0.8
).out()
`}
/>

---

## src() — Внешний источник

Использует один из четырёх входных источников (s0, s1, s2, s3) или выходных буферов (o0, o1, o2, o3).

### Синтаксис

```javascript
src(input)
```

### Параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| input | Source/Output | s0-s3 (входы) или o0-o3 (выходы) |

### Примеры

**Использование камеры:**
```javascript
s0.initCam()
src(s0).out()
```

**Использование другого буфера:**
```javascript
osc(10).out(o1)
src(o1).kaleid(4).out(o0)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).out(o1)
src(o1).kaleid(4).out(o0)
`}
/>

**Feedback эффект:**
```javascript
src(o0)
  .scale(1.01)
  .rotate(0.01)
  .blend(osc(10), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.01)
  .rotate(0.01)
  .blend(osc(10), 0.1)
  .out()
`}
/>

---

## Комбинирование источников

Источники можно комбинировать с помощью функций смешивания:

```javascript
osc(10)
  .blend(noise(3), 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .blend(noise(3), 0.5)
  .diff(shape(4, 0.3))
  .out()
`}
/>

## Следующие шаги

- [Трансформации](./04-transformatsii.md) — изменение геометрии и цвета
- [Смешивание](./05-smeshivanie.md) — комбинирование источников
- [Модуляция](./06-modulyatsiya.md) — искажение геометрии
