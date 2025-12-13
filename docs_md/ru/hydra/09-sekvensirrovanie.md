# Секвенсирование и анимация

В Hydra есть несколько способов создания динамических, изменяющихся во времени визуалов: **массивы**, **функции времени** и **интерактивные входы**.

## Массивы — автоматическое переключение

Когда параметр задан массивом `[]`, Hydra автоматически переключается между значениями в ритме.

### Базовое использование

```javascript
osc([10, 20, 30]).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 20, 30], 0.1, 0.5).out()
`}
/>

### Массивы в любых параметрах

```javascript
osc([10, 20, 30], [0.1, 0.5], [0, 0.5, 1])
  .kaleid([3, 4, 5, 6])
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 20, 30], [0.1, 0.5], [0, 0.5, 1])
  .kaleid([3, 4, 5, 6])
  .out()
`}
/>

---

## Управление скоростью

### Глобальный BPM

```javascript
bpm = 120  // Установить темп 120 BPM
```

### .fast() — ускорение массива

```javascript
osc([10, 20, 30].fast(2)).out()  // В 2 раза быстрее
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 20, 30].fast(2), 0.1, 0.5).out()
`}
/>

### .slow() — замедление массива

```javascript
osc([10, 20, 30].slow(2)).out()  // В 2 раза медленнее
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 20, 30].slow(2), 0.1, 0.5).out()
`}
/>

---

## Плавные переходы

### .smooth() — интерполяция

Вместо резких переключений создаёт плавные переходы:

```javascript
osc([10, 50].smooth()).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 50].smooth(), 0.1, 0.5).out()
`}
/>

### Комбинация fast + smooth

```javascript
osc([10, 30, 50].fast(0.5).smooth()).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 30, 50].fast(0.5).smooth(), 0.1, 0.5).out()
`}
/>

---

## Функции времени

Любой параметр может быть функцией, которая вычисляется каждый кадр.

### Переменная time

`time` — количество секунд с момента загрузки:

```javascript
osc(() => 10 + Math.sin(time) * 20).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(() => 10 + Math.sin(time) * 20, 0.1, 0.5).out()
`}
/>

### Примеры функций времени

**Синусоидальная пульсация:**
```javascript
osc(10)
  .scale(() => 1 + Math.sin(time) * 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .scale(() => 1 + Math.sin(time) * 0.5)
  .out()
`}
/>

**Постоянное вращение:**
```javascript
osc(10)
  .rotate(() => time * 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .rotate(() => time * 0.1)
  .out()
`}
/>

**Цветовой цикл:**
```javascript
osc(10)
  .hue(() => time * 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .hue(() => time * 0.1)
  .out()
`}
/>

---

## Математические функции

### Полезные функции

| Функция | Описание | Диапазон |
|---------|----------|----------|
| `Math.sin(x)` | Синус | -1 до 1 |
| `Math.cos(x)` | Косинус | -1 до 1 |
| `Math.abs(x)` | Модуль | 0 до ∞ |
| `Math.floor(x)` | Округление вниз | Целые |
| `Math.random()` | Случайное | 0 до 1 |

### Преобразование диапазона

```javascript
// Из -1..1 в 0..1
() => Math.sin(time) * 0.5 + 0.5

// Из -1..1 в a..b
() => Math.sin(time) * (b - a) / 2 + (a + b) / 2

// Пример: от 10 до 50
() => Math.sin(time) * 20 + 30
```

### Примеры

**Случайные вспышки:**
```javascript
osc(10)
  .brightness(() => Math.random() * 0.3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .brightness(() => Math.random() * 0.3)
  .out()
`}
/>

**Дискретные шаги:**
```javascript
osc(() => Math.floor(time % 4) * 10 + 10)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(() => Math.floor(time % 4) * 10 + 10, 0.1, 0.5)
  .out()
`}
/>

---

## Интерактивные входы

### Мышь

```javascript
// mouse.x — позиция X (0-1)
// mouse.y — позиция Y (0-1)

osc(() => mouse.x * 50)
  .rotate(() => mouse.y * 3)
  .out()
```

### Примеры с мышью

**Управление частотой:**
```javascript
osc(() => mouse.x * 100)
  .out()
```

**Управление калейдоскопом:**
```javascript
osc(10)
  .kaleid(() => Math.floor(mouse.x * 10) + 3)
  .out()
```

**Полное управление:**
```javascript
osc(() => mouse.x * 50 + 10, 0.1, () => mouse.y)
  .kaleid(() => Math.floor(mouse.x * 8) + 3)
  .rotate(() => mouse.y * 3)
  .out()
```

---

## Комплексные примеры

### Многослойная анимация

```javascript
osc([10, 20, 30].smooth(), 0.1, [0, 0.5, 1].smooth())
  .rotate(() => time * 0.1)
  .kaleid([3, 4, 5, 6].fast(0.5))
  .scale(() => 1 + Math.sin(time * 2) * 0.2)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 20, 30].smooth(), 0.1, [0, 0.5, 1].smooth())
  .rotate(() => time * 0.1)
  .kaleid([3, 4, 5, 6].fast(0.5))
  .scale(() => 1 + Math.sin(time * 2) * 0.2)
  .out()
`}
/>

### Волновая анимация

```javascript
osc(20, 0.1, 0.5)
  .modulate(
    osc(3).rotate(() => time * 0.1),
    () => Math.sin(time) * 0.3
  )
  .kaleid(4)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(20, 0.1, 0.5)
  .modulate(
    osc(3).rotate(() => time * 0.1),
    () => Math.sin(time) * 0.3
  )
  .kaleid(4)
  .out()
`}
/>

### Пульсирующая форма

```javascript
shape(() => Math.floor(time % 5) + 3,
      () => 0.2 + Math.sin(time * 3) * 0.1)
  .repeat(3, 3)
  .rotate(() => time * 0.05)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(() => Math.floor(time % 5) + 3,
      () => 0.2 + Math.sin(time * 3) * 0.1)
  .repeat(3, 3)
  .rotate(() => time * 0.05)
  .out()
`}
/>

---

## Глобальные переменные

Вы можете создавать свои переменные для управления:

```javascript
// Создание переменной
let speed = 1
let size = 10

// Использование
osc(size)
  .rotate(() => time * speed)
  .out()

// Изменение в реальном времени
speed = 2
size = 20
```

---

## Советы по секвенсированию

### 1. Комбинируйте подходы

```javascript
// Массивы для дискретных значений
osc([10, 20, 30])
  // Функции для плавной анимации
  .rotate(() => time * 0.1)
  .out()
```

### 2. Используйте .smooth() для музыкальности

```javascript
// Резкие переходы
osc([10, 50]).out()

// Плавные переходы (лучше для музыки)
osc([10, 50].smooth()).out()
```

### 3. Синхронизируйте с BPM

```javascript
bpm = 120

// Массивы автоматически синхронизируются
osc([10, 20, 30]).out()
```

### 4. Создавайте вариации

```javascript
// Разные скорости для разных элементов
osc([10, 20].fast(2))
  .kaleid([3, 4, 5, 6].fast(0.5))
  .out()
```

## Следующие шаги

- [Feedback эффекты](./10-feedback-effekty.md) — использование времени в feedback
- [Аудио-реактивность](./08-audio-reaktivnost.md) — синхронизация со звуком
