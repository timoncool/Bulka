# Аудио-реактивность

Hydra может создавать визуализации, реагирующие на звук в реальном времени. Используется анализ FFT (Fast Fourier Transform) через библиотеку Meyda.

## Объект `a` — аудио анализ

Глобальный объект `a` предоставляет доступ к аудио-данным.

### Основные свойства и методы

| Свойство/Метод | Описание |
|----------------|----------|
| `a.fft[n]` | Значение частотного диапазона (0-1) |
| `a.show()` | Показать визуализацию FFT |
| `a.hide()` | Скрыть визуализацию |
| `a.setBins(n)` | Установить количество частотных диапазонов |
| `a.setSmooth(n)` | Установить сглаживание (0-1) |
| `a.setScale(n)` | Установить чувствительность |
| `a.setCutoff(n)` | Установить порог шума |

---

## Настройка аудио

### Показать FFT визуализацию

```javascript
a.show()
```

В правом нижнем углу появится график FFT с двумя линиями:
- **Нижняя линия (cutoff)** — порог шума
- **Верхняя линия (scale)** — максимальное значение

### Установка количества диапазонов

```javascript
a.setBins(6)  // 6 частотных диапазонов
```

Каждый диапазон доступен как `a.fft[0]`, `a.fft[1]`, ..., `a.fft[5]`.

### Сглаживание

```javascript
a.setSmooth(0.8)  // 0 = резко, 1 = очень плавно
```

### Чувствительность

```javascript
a.setScale(8)     // Множитель громкости
a.setCutoff(0.1)  // Минимальный порог (noise gate)
```

---

## Использование FFT данных

### Базовый пример

```javascript
a.show()
a.setBins(4)

osc(() => a.fft[0] * 60 + 10).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.show()
a.setBins(4)
a.setSmooth(0.8)

osc(() => a.fft[0] * 60 + 10, 0.1, 0.5).out()
`}
/>

### Разные частоты — разные параметры

```javascript
a.setBins(4)

osc(10)
  .rotate(() => a.fft[0] * 2)        // Низкие частоты → вращение
  .scale(() => 1 + a.fft[1] * 0.5)   // Средние → масштаб
  .color(1, () => a.fft[2], 0.5)     // Высокие → цвет
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(4)
a.setSmooth(0.8)

osc(10, 0.1, 0.5)
  .rotate(() => a.fft[0] * 2)
  .scale(() => 1 + a.fft[1] * 0.5)
  .color(1, () => a.fft[2], 0.5)
  .out()
`}
/>

### Модуляция громкостью

```javascript
a.setBins(5)

noise(3)
  .modulate(osc(10), () => a.fft[0] * 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(5)
a.setSmooth(0.8)

noise(3)
  .modulate(osc(10), () => a.fft[0] * 0.5)
  .out()
`}
/>

---

## Примеры аудио-реактивных визуализаций

### Пульсирующий калейдоскоп

```javascript
a.setBins(4)
a.setSmooth(0.8)

osc(10, 0.1, 0.5)
  .kaleid(() => Math.floor(a.fft[0] * 8) + 3)
  .scale(() => 1 + a.fft[1] * 0.5)
  .rotate(() => time * 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(4)
a.setSmooth(0.8)

osc(10, 0.1, 0.5)
  .kaleid(() => Math.floor(a.fft[0] * 8) + 3)
  .scale(() => 1 + a.fft[1] * 0.5)
  .rotate(() => time * 0.1)
  .out()
`}
/>

### Реактивный шум

```javascript
a.setBins(5)
a.setSmooth(0.7)

noise(() => a.fft[0] * 10 + 3)
  .color(
    () => a.fft[1],
    () => a.fft[2],
    () => a.fft[3]
  )
  .modulate(osc(3), () => a.fft[0] * 0.3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(5)
a.setSmooth(0.7)

noise(() => a.fft[0] * 10 + 3)
  .color(
    () => a.fft[1],
    () => a.fft[2],
    () => a.fft[3]
  )
  .modulate(osc(3), () => a.fft[0] * 0.3)
  .out()
`}
/>

### Вороной с басами

```javascript
a.setBins(4)
a.setSmooth(0.8)

voronoi(
  () => a.fft[0] * 20 + 5,
  0.3,
  0.3
)
  .kaleid(6)
  .scale(() => 1 + a.fft[1] * 0.3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(4)
a.setSmooth(0.8)

voronoi(
  () => a.fft[0] * 20 + 5,
  0.3,
  0.3
)
  .kaleid(6)
  .scale(() => 1 + a.fft[1] * 0.3)
  .out()
`}
/>

### Feedback с аудио

```javascript
a.setBins(4)
a.setSmooth(0.9)

src(o0)
  .scale(() => 1.01 + a.fft[0] * 0.02)
  .rotate(() => a.fft[1] * 0.05)
  .blend(osc(10, 0.1, 0.5).kaleid(4), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(4)
a.setSmooth(0.9)

src(o0)
  .scale(() => 1.01 + a.fft[0] * 0.02)
  .rotate(() => a.fft[1] * 0.05)
  .blend(osc(10, 0.1, 0.5).kaleid(4), 0.1)
  .out()
`}
/>

---

## Многослойная аудио-визуализация

```javascript
a.setBins(5)
a.setSmooth(0.8)
a.setScale(8)
a.setCutoff(0.1)

// Базовый слой
noise()
  .color(() => a.fft[2]*2, 0, 0.6)
  .modulate(noise(() => a.fft[0]*10))
  .scale(() => a.fft[2]*5)

  // Наложение с маской
  .layer(
    src(o0)
      .mask(osc(10).modulateRotate(osc(), 90, 0))
      .scale(() => a.fft[0]*2)
      .luma(0.2, 0.3)
  )
  .blend(o0)
  .out(o0)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(5)
a.setSmooth(0.8)
a.setScale(8)
a.setCutoff(0.1)

noise()
  .color(() => a.fft[2]*2, 0, 0.6)
  .modulate(noise(() => a.fft[0]*10))
  .scale(() => 1 + a.fft[2])
  .layer(
    src(o0)
      .mask(osc(10).modulateRotate(osc(), 90, 0))
      .scale(() => 1 + a.fft[0])
      .luma(0.2, 0.3)
  )
  .blend(o0, 0.8)
  .out(o0)
`}
/>

---

## Использование в Strudel

В Strudel Hydra уже интегрирована с аудио системой:

```javascript
await initHydra({detectAudio: true})

a.setBins(4)
a.setSmooth(0.8)

osc(() => a.fft[0] * 60 + 10)
  .kaleid(4)
  .out()

note("c3 e3 g3 b3").piano()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(4)
a.setSmooth(0.8)

osc(() => a.fft[0] * 60 + 10, 0.1, 0.5)
  .kaleid(4)
  .rotate(() => time * 0.1)
  .out()

note("c3 e3 g3 b3").piano().room(0.5)
`}
/>

---

## Паттерны Strudel в Hydra

Функция `H()` позволяет использовать Strudel паттерны как входные значения для Hydra:

```javascript
await initHydra()

let pattern = "3 4 5 [6 7]*2"

shape(H(pattern))
  .repeat(3, 3)
  .out()

n(pattern).scale("A:minor").piano()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()

let pattern = "<3 4 5 [6 7]*2>"

shape(H(pattern))
  .repeat(3, 3)
  .out()

n(pattern).scale("A:minor").piano().room(0.5)
`}
/>

---

## Советы по аудио-реактивности

### Источник звука

По умолчанию Hydra использует **микрофон**. Для маршрутизации звука из других приложений (Spotify, DAW):

**macOS:**
- SoundFlower
- BlackHole
- Loopback

**Windows:**
- VB-Cable
- Virtual Audio Cable

**Linux:**
- PulseAudio / JACK

### Оптимальные настройки

```javascript
// Хорошие стартовые значения
a.setBins(4)       // Достаточно для bass/mid/high
a.setSmooth(0.8)   // Плавные переходы
a.setScale(8)      // Хорошая чувствительность
a.setCutoff(0.1)   // Отсечение шума
```

### Частотные диапазоны

| Индекс | Частоты | Применение |
|--------|---------|------------|
| `a.fft[0]` | Низкие (басы) | Пульсация, масштаб |
| `a.fft[1]` | Нижние средние | Вращение |
| `a.fft[2]` | Верхние средние | Цвет, яркость |
| `a.fft[3]` | Высокие | Мелкие детали |

### Избегайте хаоса

```javascript
// Плохо: слишком много реактивности
osc(() => a.fft[0] * 100)
  .modulate(noise(() => a.fft[1] * 10))
  .scale(() => a.fft[2] * 5)

// Лучше: умеренные значения с базой
osc(() => a.fft[0] * 30 + 10)
  .modulate(noise(3), () => a.fft[1] * 0.3)
  .scale(() => 1 + a.fft[2] * 0.5)
```

## Следующие шаги

- [Секвенсирование](./09-sekvensirrovanie.md) — массивы и анимация
- [Примеры](./12-primery.md) — готовые аудио-реактивные визуализации
