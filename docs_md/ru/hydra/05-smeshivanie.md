# Смешивание (Blending)

Функции смешивания комбинируют **цвета** двух визуальных источников. В отличие от модуляции, которая влияет на геометрию, смешивание работает только с цветовыми значениями.

## Обзор функций смешивания

| Функция | Описание |
|---------|----------|
| `add()` | Сложение цветов (осветление) |
| `mult()` | Умножение цветов (затемнение) |
| `diff()` | Разница цветов |
| `blend()` | Плавное смешивание |
| `layer()` | Наложение с альфа-каналом |
| `mask()` | Маскирование |

---

## add() — Сложение

Складывает цветовые значения двух источников. Результат обычно светлее оригинала.

### Синтаксис

```javascript
source1.add(source2, amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| source2 | - | Второй источник |
| amount | 1 | Интенсивность (0-1) |

### Примеры

**Базовое сложение:**
```javascript
osc(10)
  .add(noise(3))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .add(noise(3))
  .out()
`}
/>

**Частичное сложение:**
```javascript
osc(10)
  .add(shape(4), 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .add(shape(4), 0.5)
  .out()
`}
/>

---

## mult() — Умножение

Умножает цветовые значения. Результат обычно темнее, так как значения от 0 до 1.

### Синтаксис

```javascript
source1.mult(source2, amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| source2 | - | Второй источник |
| amount | 1 | Интенсивность (0-1) |

### Примеры

**Базовое умножение:**
```javascript
osc(10, 0.1, 0.5)
  .mult(noise(3))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .mult(noise(3))
  .out()
`}
/>

**Умножение фигурой:**
```javascript
osc(10, 0.1, 0.5)
  .mult(shape(4, 0.5))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .mult(shape(4, 0.5))
  .out()
`}
/>

---

## diff() — Разница

Вычисляет абсолютную разницу между цветами. Одинаковые цвета дают чёрный.

### Синтаксис

```javascript
source1.diff(source2)
```

### Примеры

**Базовая разница:**
```javascript
osc(10)
  .diff(osc(20))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .diff(osc(20))
  .out()
`}
/>

**Разница с шумом:**
```javascript
osc(10, 0.1, 0.5)
  .diff(noise(3))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .diff(noise(3))
  .out()
`}
/>

---

## blend() — Плавное смешивание

Линейно интерполирует между двумя источниками.

### Синтаксис

```javascript
source1.blend(source2, amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| source2 | - | Второй источник |
| amount | 0.5 | Пропорция смешивания (0-1) |

### Примеры

**50% смешивание:**
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
  .out()
`}
/>

**Анимированное смешивание:**
```javascript
osc(10)
  .blend(voronoi(5), () => Math.sin(time) * 0.5 + 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .blend(voronoi(5), () => Math.sin(time) * 0.5 + 0.5)
  .out()
`}
/>

---

## layer() — Наложение слоёв

Накладывает один источник поверх другого с учётом альфа-канала.

### Синтаксис

```javascript
source1.layer(source2)
```

### Примеры

**Наложение фигуры:**
```javascript
osc(10, 0.1, 0.5)
  .layer(shape(4, 0.3).color(1, 0, 0))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .layer(shape(4, 0.3).color(1, 0, 0))
  .out()
`}
/>

**Несколько слоёв:**
```javascript
gradient()
  .layer(shape(3, 0.2).color(1, 0, 0))
  .layer(shape(4, 0.15).color(0, 1, 0))
  .layer(shape(5, 0.1).color(0, 0, 1))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
gradient()
  .layer(shape(3, 0.2).color(1, 0, 0))
  .layer(shape(4, 0.15).color(0, 1, 0))
  .layer(shape(5, 0.1).color(0, 0, 1))
  .out()
`}
/>

---

## mask() — Маскирование

Использует второй источник как маску прозрачности.

### Синтаксис

```javascript
source1.mask(source2)
```

### Примеры

**Маска фигурой:**
```javascript
osc(10, 0.1, 0.5)
  .mask(shape(4, 0.5))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .mask(shape(4, 0.5))
  .out()
`}
/>

**Маска шумом:**
```javascript
osc(10, 0.1, 0.5)
  .mask(noise(3).thresh(0.5))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .mask(noise(3).thresh(0.5))
  .out()
`}
/>

**Маска с движущейся фигурой:**
```javascript
osc(10, 0.1, 0.5)
  .mask(shape(6, 0.3).rotate(() => time))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .mask(shape(6, 0.3).rotate(() => time))
  .out()
`}
/>

---

## Комплексные примеры

### Многослойная композиция

```javascript
osc(10, 0.1, 0.5)
  .blend(noise(3), 0.3)
  .diff(osc(30).rotate(0.5))
  .mult(shape(4, 0.8))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .blend(noise(3), 0.3)
  .diff(osc(30).rotate(0.5))
  .mult(shape(4, 0.8))
  .out()
`}
/>

### Использование нескольких буферов

```javascript
// Создаём разные визуалы в разных буферах
osc(10).out(o1)
noise(3).out(o2)

// Смешиваем их в основном буфере
src(o1)
  .blend(src(o2), 0.5)
  .out(o0)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).out(o1)
noise(3).out(o2)
src(o1)
  .blend(src(o2), 0.5)
  .out(o0)
`}
/>

### Цветовые переходы

```javascript
solid(1, 0, 0)
  .blend(solid(0, 0, 1), () => Math.sin(time) * 0.5 + 0.5)
  .mult(noise(5))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
solid(1, 0, 0)
  .blend(solid(0, 0, 1), () => Math.sin(time) * 0.5 + 0.5)
  .mult(noise(5))
  .out()
`}
/>

---

## Сравнение функций смешивания

| Функция | Эффект | Применение |
|---------|--------|------------|
| `add()` | Осветление | Световые эффекты, свечение |
| `mult()` | Затемнение | Тени, маски, виньетки |
| `diff()` | Контраст различий | Психоделические эффекты |
| `blend()` | Плавный переход | Кроссфейды, мягкие переходы |
| `layer()` | Наложение | Композиция элементов |
| `mask()` | Вырезание | Фигурные маски, рамки |

## Следующие шаги

- [Модуляция](./06-modulyatsiya.md) — искажение геометрии через другой источник
- [Feedback эффекты](./10-feedback-effekty.md) — продвинутые техники смешивания
