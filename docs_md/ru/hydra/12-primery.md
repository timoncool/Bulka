# Галерея примеров

Коллекция готовых визуализаций для изучения и вдохновения. Все примеры можно запустить напрямую.

---

## Базовые визуалы

### Радужный осциллятор

```javascript
osc(10, 0.1, 1.5)
  .rotate(0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 1.5)
  .rotate(0.5)
  .out()
`}
/>

### Калейдоскопический шум

```javascript
noise(5, 0.1)
  .kaleid(8)
  .color(1, 0.5, 0.2)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(5, 0.1)
  .kaleid(8)
  .color(1, 0.5, 0.2)
  .out()
`}
/>

### Пульсирующие формы

```javascript
shape(6, () => 0.2 + Math.sin(time * 2) * 0.1)
  .repeat(4, 4)
  .rotate(() => time * 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(6, () => 0.2 + Math.sin(time * 2) * 0.1)
  .repeat(4, 4)
  .rotate(() => time * 0.1)
  .colorama(0.5)
  .out()
`}
/>

---

## Текстуры и паттерны

### Мрамор

```javascript
osc(20, 0.01, 0)
  .modulate(noise(3), 0.5)
  .color(0.9, 0.85, 0.8)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(20, 0.01, 0)
  .modulate(noise(3), 0.5)
  .color(0.9, 0.85, 0.8)
  .out()
`}
/>

### Вода

```javascript
voronoi(15, 0.2, 0.4)
  .modulate(osc(3).rotate(1.57), 0.1)
  .color(0.2, 0.5, 0.8)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
voronoi(15, 0.2, 0.4)
  .modulate(osc(3).rotate(1.57), 0.1)
  .color(0.2, 0.5, 0.8)
  .out()
`}
/>

### Огонь

```javascript
voronoi(20, 0.5, 0)
  .modulate(noise(5), 0.3)
  .color(1, 0.5, 0)
  .brightness(0.2)
  .contrast(2)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
voronoi(20, 0.5, 0)
  .modulate(noise(5), 0.3)
  .color(1, 0.5, 0)
  .brightness(0.2)
  .contrast(2)
  .out()
`}
/>

---

## Геометрические эффекты

### Зеркальный тоннель

```javascript
osc(10, 0.1, 0.5)
  .kaleid(4)
  .scale(() => 1 + Math.sin(time) * 0.3)
  .modulate(osc(2), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .kaleid(4)
  .scale(() => 1 + Math.sin(time) * 0.3)
  .modulate(osc(2), 0.1)
  .out()
`}
/>

### Вращающиеся кольца

```javascript
shape(100, 0.3, 0.01)
  .diff(shape(100, 0.25, 0.01))
  .repeat(3, 3)
  .rotate(() => time * 0.1)
  .color(1, 0, 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(100, 0.3, 0.01)
  .diff(shape(100, 0.25, 0.01))
  .repeat(3, 3)
  .rotate(() => time * 0.1)
  .color(1, 0, 0.5)
  .out()
`}
/>

### Мозаика

```javascript
osc(10, 0.1, 0.5)
  .kaleid(6)
  .pixelate(20, 20)
  .modulate(noise(3), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .kaleid(6)
  .pixelate(20, 20)
  .modulate(noise(3), 0.1)
  .out()
`}
/>

---

## Feedback эффекты

### Космический вихрь

```javascript
src(o0)
  .scale(1.01)
  .rotate(() => 0.01 + Math.sin(time * 0.5) * 0.005)
  .colorama(0.005)
  .blend(
    osc(30, 0.1, 0.5).kaleid(4),
    0.1
  )
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.01)
  .rotate(() => 0.01 + Math.sin(time * 0.5) * 0.005)
  .colorama(0.005)
  .blend(
    osc(30, 0.1, 0.5).kaleid(4),
    0.1
  )
  .out()
`}
/>

### Бесконечный тоннель

```javascript
src(o0)
  .scale(0.99)
  .hue(0.002)
  .blend(
    shape(4, 0.1).color(1, 0.5, 0),
    0.05
  )
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(0.99)
  .hue(0.002)
  .blend(
    shape(4, 0.1).color(1, 0.5, 0),
    0.05
  )
  .out()
`}
/>

### Пиксельный feedback

```javascript
src(o0)
  .scale(1.02)
  .pixelate([20, 40, 60].fast(0.5))
  .blend(osc(10).thresh(0.5), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.02)
  .pixelate([20, 40, 60].fast(0.5))
  .blend(osc(10).thresh(0.5), 0.1)
  .out()
`}
/>

---

## Психоделические визуалы

### Гипноз

```javascript
osc(50, 0.05, 0)
  .modulate(osc(2).rotate(1.57), 0.5)
  .rotate(() => time * 0.1)
  .colorama(0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(50, 0.05, 0)
  .modulate(osc(2).rotate(1.57), 0.5)
  .rotate(() => time * 0.1)
  .colorama(0.5)
  .out()
`}
/>

### Жидкий металл

```javascript
voronoi(10, 0.3, 0.3)
  .modulateScale(noise(5), 0.5)
  .color(0.8, 0.8, 0.9)
  .contrast(1.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
voronoi(10, 0.3, 0.3)
  .modulateScale(noise(5), 0.5)
  .color(0.8, 0.8, 0.9)
  .contrast(1.5)
  .out()
`}
/>

### Неоновые волны

```javascript
osc(20, 0.1, 0)
  .modulate(noise(3), 0.3)
  .thresh(0.5, 0.1)
  .color(0, 1, 1)
  .layer(
    osc(20, 0.1, 0.5)
      .modulate(noise(3), 0.3)
      .thresh(0.5, 0.1)
      .color(1, 0, 1)
      .scrollX(0.1)
  )
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(20, 0.1, 0)
  .modulate(noise(3), 0.3)
  .thresh(0.5, 0.1)
  .color(0, 1, 1)
  .layer(
    osc(20, 0.1, 0.5)
      .modulate(noise(3), 0.3)
      .thresh(0.5, 0.1)
      .color(1, 0, 1)
      .scrollX(0.1)
  )
  .out()
`}
/>

---

## Анимированные паттерны

### Дыхание

```javascript
osc([10, 20, 30].smooth(), 0.1, [0, 0.5, 1].smooth())
  .kaleid([3, 4, 5, 6].fast(0.3))
  .scale(() => 1 + Math.sin(time) * 0.2)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 20, 30].smooth(), 0.1, [0, 0.5, 1].smooth())
  .kaleid([3, 4, 5, 6].fast(0.3))
  .scale(() => 1 + Math.sin(time) * 0.2)
  .out()
`}
/>

### Глитч

```javascript
osc(30, 0.1, 0.5)
  .pixelate(() => Math.random() > 0.9 ? 10 : 100)
  .scrollX(() => Math.random() > 0.95 ? Math.random() * 0.5 : 0)
  .colorama(() => Math.random() > 0.9 ? 0.5 : 0)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(30, 0.1, 0.5)
  .pixelate(() => Math.random() > 0.9 ? 10 : 100)
  .scrollX(() => Math.random() > 0.95 ? Math.random() * 0.5 : 0)
  .colorama(() => Math.random() > 0.9 ? 0.5 : 0)
  .out()
`}
/>

### Сердцебиение

```javascript
shape(3, () => 0.15 + Math.pow(Math.sin(time * 4), 8) * 0.1)
  .color(1, 0, 0.3)
  .repeat(5, 5)
  .modulate(noise(2), 0.02)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(3, () => 0.15 + Math.pow(Math.sin(time * 4), 8) * 0.1)
  .color(1, 0, 0.3)
  .repeat(5, 5)
  .modulate(noise(2), 0.02)
  .out()
`}
/>

---

## Визуалы со Strudel

### Аудио-реактивный осциллятор

```javascript
await initHydra({detectAudio: true})
a.setBins(4)
a.setSmooth(0.8)

osc(() => 10 + a.fft[0] * 50, 0.1, 0.5)
  .kaleid(() => Math.floor(a.fft[1] * 6) + 3)
  .rotate(() => time * 0.1)
  .out()

s("bd*4, hh*8").bank("RolandTR909")
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio: true})
a.setBins(4)
a.setSmooth(0.8)

osc(() => 10 + a.fft[0] * 50, 0.1, 0.5)
  .kaleid(() => Math.floor(a.fft[1] * 6) + 3)
  .rotate(() => time * 0.1)
  .out()

s("bd*4, hh*8").bank("RolandTR909")
`}
/>

### Паттерн-синхронизация

```javascript
await initHydra()

let pat = "<3 4 5 6>"

shape(H(pat), 0.3)
  .repeat(H(pat), H(pat))
  .rotate(() => time * 0.1)
  .color(1, 0.5, 0)
  .out()

n(pat).scale("C:minor").piano().room(0.5)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()

let pat = "<3 4 5 6>"

shape(H(pat), 0.3)
  .repeat(H(pat), H(pat))
  .rotate(() => time * 0.1)
  .color(1, 0.5, 0)
  .out()

n(pat).scale("C:minor").piano().room(0.5)
`}
/>

### feedStrudel — визуализация паттерна

```javascript
await initHydra({feedStrudel: 1})

src(s0)
  .kaleid(4)
  .modulate(osc(3), 0.1)
  .out()

s("bd*4, hh*8, ~ sd")
  .bank("RolandTR909")
  .fft(8)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra({feedStrudel: 1})

src(s0)
  .kaleid(4)
  .modulate(osc(3), 0.1)
  .out()

s("bd*4, hh*8, ~ sd")
  .bank("RolandTR909")
  .fft(8).scope()
`}
/>

---

## Сложные композиции

### Многослойный визуал

```javascript
// Слой 1: Фон
osc(5, 0.1, 0.5)
  .modulate(noise(2), 0.2)
  .out(o1)

// Слой 2: Форма
shape(6, 0.3)
  .color(1, 0, 0.5)
  .rotate(() => time * 0.2)
  .out(o2)

// Композиция
src(o1)
  .blend(src(o2), 0.5)
  .modulate(src(o2), 0.1)
  .out(o0)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(5, 0.1, 0.5)
  .modulate(noise(2), 0.2)
  .out(o1)

shape(6, 0.3)
  .color(1, 0, 0.5)
  .rotate(() => time * 0.2)
  .out(o2)

src(o1)
  .blend(src(o2), 0.5)
  .modulate(src(o2), 0.1)
  .out(o0)
`}
/>

---

## Ресурсы для вдохновения

- [Hydra Patterns](https://twitter.com/hydaboratory) — паттерны от сообщества
- [Hydra Gallery](https://hydra.ojack.xyz/) — кнопка "Show random sketch"
- [Are.na Hydra collection](https://www.are.na/olivia/hydra-video-synth)
