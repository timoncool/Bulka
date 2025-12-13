# Feedback и продвинутые эффекты

Feedback (обратная связь) — одна из самых мощных техник в Hydra. Она создаёт эффект, когда выход используется как вход, подобно направлению камеры на экран.

## Принцип Feedback

Feedback loop состоит из трёх компонентов:
1. **Input-output routing** — выход подаётся на вход
2. **Masked layer** — слой, пропускающий сигнал
3. **Modulating layer** — слой, смещающий пиксели

---

## Базовый Feedback

### Простейший feedback

```javascript
src(o0).out()
```

Это создаёт статичную картинку (последний кадр замораживается).

### Feedback с трансформацией

```javascript
src(o0)
  .scale(1.01)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.01)
  .blend(osc(10, 0.1, 0.5), 0.1)
  .out()
`}
/>

### Feedback с вращением

```javascript
src(o0)
  .rotate(0.01)
  .blend(osc(10), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .rotate(0.01)
  .blend(osc(10, 0.1, 0.5), 0.1)
  .out()
`}
/>

---

## Структура Feedback патча

### Типичная структура

```javascript
src(o0)                    // 1. Берём предыдущий кадр
  .scale(1.01)             // 2. Применяем трансформацию
  .rotate(0.01)
  .blend(source, amount)    // 3. Смешиваем с новым источником
  .out()                    // 4. Выводим
```

### Пример с шумом

```javascript
src(o0)
  .scale(1.02)
  .rotate(0.02)
  .blend(noise(3).color(1, 0, 0.5), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.02)
  .rotate(0.02)
  .blend(noise(3).color(1, 0, 0.5), 0.1)
  .out()
`}
/>

---

## Техники Feedback

### Бесконечный тоннель

```javascript
src(o0)
  .scale(0.99)
  .blend(shape(4, 0.1), 0.05)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(0.99)
  .blend(shape(4, 0.1).color(1, 0.5, 0), 0.05)
  .out()
`}
/>

### Спиральный feedback

```javascript
src(o0)
  .scale(1.01)
  .rotate(() => 0.01 + Math.sin(time) * 0.005)
  .blend(osc(20).kaleid(4), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.01)
  .rotate(() => 0.01 + Math.sin(time) * 0.005)
  .blend(osc(20, 0.1, 0.5).kaleid(4), 0.1)
  .out()
`}
/>

### Feedback с модуляцией

```javascript
src(o0)
  .modulate(osc(3), 0.01)
  .blend(osc(10), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .modulate(osc(3), 0.01)
  .blend(osc(10, 0.1, 0.5), 0.1)
  .out()
`}
/>

---

## Перекрёстный Feedback

Использование нескольких буферов для создания сложных взаимодействий.

### Два буфера

```javascript
// Буфер o0 модулируется буфером o1
osc(10)
  .modulate(src(o1), 0.2)
  .out(o0)

// Буфер o1 модулируется буфером o0
noise(3)
  .modulate(src(o0), 0.2)
  .out(o1)

render(o0)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .modulate(src(o1), 0.2)
  .out(o0)

noise(3)
  .modulate(src(o0), 0.2)
  .out(o1)

render(o0)
`}
/>

### Каскадный feedback

```javascript
osc(10).out(o1)

src(o1)
  .modulate(src(o0), 0.1)
  .kaleid(4)
  .out(o0)

render(o0)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5).out(o1)

src(o1)
  .modulate(src(o0), 0.1)
  .kaleid(4)
  .out(o0)

render(o0)
`}
/>

---

## Feedback с внешними источниками

### Камера с feedback

```javascript
s0.initCam()

src(o0)
  .scale(1.01)
  .rotate(0.005)
  .blend(src(s0).saturate(2), 0.1)
  .out()
```

### Trails эффект (следы)

```javascript
s0.initCam()

src(o0)
  .scale(1.001)
  .blend(src(s0), 0.05)
  .out()
```

---

## Управление интенсивностью

### Затухание feedback

```javascript
src(o0)
  .scale(1.01)
  .brightness(-0.01)  // Постепенное затухание
  .blend(osc(10), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.01)
  .brightness(-0.01)
  .blend(osc(10, 0.1, 0.5).kaleid(4), 0.1)
  .out()
`}
/>

### Цветовой сдвиг

```javascript
src(o0)
  .scale(1.01)
  .hue(0.001)  // Постепенный сдвиг цвета
  .blend(shape(4), 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.01)
  .hue(0.005)
  .blend(shape(4, 0.1), 0.1)
  .out()
`}
/>

---

## Комплексные примеры

### Психоделический feedback

```javascript
src(o0)
  .scale(1.02)
  .rotate(() => 0.01 * Math.sin(time))
  .colorama(0.01)
  .blend(
    osc(20, 0.1, 0.5)
      .kaleid(4)
      .modulate(noise(3), 0.1),
    0.1
  )
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.02)
  .rotate(() => 0.01 * Math.sin(time))
  .colorama(0.01)
  .blend(
    osc(20, 0.1, 0.5)
      .kaleid(4)
      .modulate(noise(3), 0.1),
    0.1
  )
  .out()
`}
/>

### Глитч feedback

```javascript
src(o0)
  .scrollX(() => Math.random() * 0.01 - 0.005)
  .scrollY(() => Math.random() * 0.01 - 0.005)
  .blend(
    osc(30).thresh(0.5).color(1, 0, 0.5),
    0.1
  )
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scrollX(() => Math.random() * 0.01 - 0.005)
  .scrollY(() => Math.random() * 0.01 - 0.005)
  .blend(
    osc(30).thresh(0.5).color(1, 0, 0.5),
    0.1
  )
  .out()
`}
/>

### Органический рост

```javascript
src(o0)
  .scale(1.005)
  .modulate(noise(3), 0.005)
  .blend(
    voronoi(10, 0.1)
      .thresh(0.5)
      .color(0.2, 0.8, 0.5),
    0.05
  )
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
src(o0)
  .scale(1.005)
  .modulate(noise(3), 0.005)
  .blend(
    voronoi(10, 0.1)
      .thresh(0.5)
      .color(0.2, 0.8, 0.5),
    0.05
  )
  .out()
`}
/>

---

## Советы по Feedback

### 1. Начинайте с малых значений

```javascript
// Плохо: слишком быстрый feedback
src(o0).scale(1.5).out()

// Хорошо: мягкий feedback
src(o0).scale(1.01).out()
```

### 2. Добавляйте затухание

```javascript
// Предотвращает "взрыв" белого
src(o0)
  .scale(1.01)
  .brightness(-0.005)
  .blend(source, 0.1)
  .out()
```

### 3. Используйте blend для контроля

```javascript
// blend определяет баланс между feedback и новым источником
.blend(source, 0.05)  // Больше feedback
.blend(source, 0.3)   // Меньше feedback
```

### 4. Комбинируйте трансформации

```javascript
src(o0)
  .scale(1.01)        // Масштаб
  .rotate(0.005)      // Вращение
  .scrollX(0.001)     // Движение
  .out()
```

### 5. Очистка экрана

Если feedback "взорвался" белым:
```javascript
solid(0, 0, 0).out()  // Очистить чёрным
```

## Следующие шаги

- [Расширение Hydra](./11-rasshirenie.md) — кастомные GLSL функции
- [Примеры](./12-primery.md) — готовые feedback визуализации
