# Трансформации

Трансформации изменяют визуальный сигнал после его создания источником. Делятся на два типа: **геометрические** и **цветовые**.

## Геометрические трансформации

Изменяют координаты и форму изображения.

### rotate() — Вращение

Поворачивает изображение вокруг центра.

```javascript
rotate(angle, speed)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| angle | 10 | Угол поворота (в радианах) |
| speed | 0 | Скорость вращения |

**Примеры:**

```javascript
osc(10).rotate(0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).rotate(0.5).out()
`}
/>

```javascript
// Постоянное вращение
osc(10).rotate(() => time * 0.1).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).rotate(() => time * 0.1).out()
`}
/>

---

### scale() — Масштабирование

Изменяет размер изображения.

```javascript
scale(amount, xMult, yMult, offsetX, offsetY)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| amount | 1.5 | Общий масштаб |
| xMult | 1 | Множитель по X |
| yMult | 1 | Множитель по Y |
| offsetX | 0.5 | Смещение центра X |
| offsetY | 0.5 | Смещение центра Y |

**Примеры:**

```javascript
osc(10).scale(2).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).scale(2).out()
`}
/>

```javascript
// Растяжение по горизонтали
osc(10).scale(1, 2, 1).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).scale(1, 2, 1).out()
`}
/>

```javascript
// Пульсирующий масштаб
osc(10).scale(() => 1 + Math.sin(time) * 0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).scale(() => 1 + Math.sin(time) * 0.5).out()
`}
/>

---

### pixelate() — Пикселизация

Создаёт эффект низкого разрешения.

```javascript
pixelate(pixelX, pixelY)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| pixelX | 20 | Размер пикселей по X |
| pixelY | 20 | Размер пикселей по Y |

**Примеры:**

```javascript
osc(10).pixelate(20, 20).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).pixelate(20, 20).out()
`}
/>

```javascript
// Прямоугольные пиксели
noise(5).pixelate(10, 50).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(5).pixelate(10, 50).out()
`}
/>

---

### kaleid() — Калейдоскоп

Создаёт симметричный калейдоскопический эффект.

```javascript
kaleid(nSides)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| nSides | 4 | Количество сегментов |

**Примеры:**

```javascript
osc(10).kaleid(4).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).kaleid(4).out()
`}
/>

```javascript
osc(10, 0.1, 0.5).kaleid(8).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5).kaleid(8).out()
`}
/>

```javascript
// Анимированный калейдоскоп
noise(5).kaleid(() => Math.floor(time % 8) + 3).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(5).kaleid(() => Math.floor(time % 8) + 3).out()
`}
/>

---

### repeat() — Повторение

Создаёт сетку повторяющихся изображений.

```javascript
repeat(repeatX, repeatY, offsetX, offsetY)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| repeatX | 3 | Повторений по X |
| repeatY | 3 | Повторений по Y |
| offsetX | 0 | Смещение по X |
| offsetY | 0 | Смещение по Y |

**Примеры:**

```javascript
shape(4).repeat(4, 4).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(4).repeat(4, 4).out()
`}
/>

```javascript
// Смещение создаёт эффект кирпичной кладки
shape(4).repeat(4, 4, 0.5, 0).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(4).repeat(4, 4, 0.5, 0).out()
`}
/>

---

### repeatX() / repeatY() — Повторение по оси

```javascript
repeatX(reps, offset)
repeatY(reps, offset)
```

**Примеры:**

```javascript
osc(10).repeatX(3).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).repeatX(3).out()
`}
/>

---

### scroll() — Прокрутка

Прокручивает изображение с заданной скоростью.

```javascript
scroll(scrollX, scrollY, speedX, speedY)
```

**Примеры:**

```javascript
osc(10).scroll(0.1, 0, 0.5, 0).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).scroll(0.1, 0, 0.5, 0).out()
`}
/>

---

### scrollX() / scrollY() — Прокрутка по оси

```javascript
scrollX(scrollX, speed)
scrollY(scrollY, speed)
```

**Примеры:**

```javascript
osc(10).scrollX(0, 0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).scrollX(0, 0.5).out()
`}
/>

---

## Цветовые трансформации

Изменяют цветовые значения пикселей.

### color() — Установка цвета

Умножает каждый канал на заданные значения.

```javascript
color(r, g, b, a)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| r | 1 | Множитель красного |
| g | 1 | Множитель зелёного |
| b | 1 | Множитель синего |
| a | 1 | Множитель альфы |

**Примеры:**

```javascript
// Красный оттенок
noise(5).color(1, 0, 0).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(5).color(1, 0, 0).out()
`}
/>

```javascript
// Пурпурный
osc(10).color(1, 0, 1).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).color(1, 0, 1).out()
`}
/>

---

### brightness() — Яркость

Изменяет общую яркость.

```javascript
brightness(amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| amount | 0.4 | Величина изменения (-1 до 1) |

**Примеры:**

```javascript
osc(10).brightness(0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).brightness(0.5).out()
`}
/>

---

### contrast() — Контраст

Изменяет контрастность.

```javascript
contrast(amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| amount | 1.6 | Уровень контраста |

**Примеры:**

```javascript
osc(10).contrast(2).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).contrast(2).out()
`}
/>

---

### saturate() — Насыщенность

Изменяет насыщенность цвета.

```javascript
saturate(amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| amount | 2 | Уровень насыщенности |

**Примеры:**

```javascript
osc(10, 0.1, 0.5).saturate(3).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5).saturate(3).out()
`}
/>

```javascript
// Чёрно-белое (без насыщенности)
osc(10, 0.1, 0.5).saturate(0).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5).saturate(0).out()
`}
/>

---

### hue() — Оттенок

Сдвигает оттенок цвета.

```javascript
hue(amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| amount | 0.4 | Сдвиг оттенка (0-1) |

**Примеры:**

```javascript
osc(10, 0.1, 0.5).hue(0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5).hue(0.5).out()
`}
/>

```javascript
// Анимация оттенка
osc(10, 0.1, 0.5).hue(() => time * 0.1).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5).hue(() => time * 0.1).out()
`}
/>

---

### invert() — Инверсия

Инвертирует цвета.

```javascript
invert(amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| amount | 1 | Степень инверсии (0-1) |

**Примеры:**

```javascript
osc(10).invert().out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).invert().out()
`}
/>

---

### luma() — Яркостная маска

Создаёт маску на основе яркости.

```javascript
luma(threshold, tolerance)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| threshold | 0.5 | Порог яркости |
| tolerance | 0.1 | Допуск |

**Примеры:**

```javascript
osc(10).luma(0.5, 0.1).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).luma(0.5, 0.1).out()
`}
/>

---

### thresh() — Пороговая обработка

Создаёт резкий контраст по порогу яркости.

```javascript
thresh(threshold, tolerance)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| threshold | 0.5 | Порог |
| tolerance | 0.04 | Допуск |

**Примеры:**

```javascript
noise(5).thresh(0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(5).thresh(0.5).out()
`}
/>

---

### posterize() — Постеризация

Уменьшает количество цветовых уровней.

```javascript
posterize(bins, gamma)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| bins | 3 | Количество уровней |
| gamma | 0.6 | Гамма-коррекция |

**Примеры:**

```javascript
osc(10, 0.1, 0.5).posterize(3).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5).posterize(3).out()
`}
/>

---

### colorama() — Цветовой сдвиг

Создаёт психоделический цветовой эффект.

```javascript
colorama(amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| amount | 0.005 | Интенсивность эффекта |

**Примеры:**

```javascript
osc(10).colorama(0.5).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).colorama(0.5).out()
`}
/>

---

## Комбинирование трансформаций

Трансформации можно объединять в цепочки:

```javascript
osc(10, 0.1, 0.5)
  .rotate(0.5)
  .kaleid(4)
  .color(1, 0.5, 0.2)
  .pixelate(20, 20)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .rotate(0.5)
  .kaleid(4)
  .color(1, 0.5, 0.2)
  .pixelate(20, 20)
  .out()
`}
/>

## Следующие шаги

- [Смешивание](./05-smeshivanie.md) — комбинирование источников
- [Модуляция](./06-modulyatsiya.md) — искажение через другой источник
