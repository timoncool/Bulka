# Модуляция (Modulate)

Модуляция — одна из самых мощных техник в Hydra. В отличие от смешивания, которое работает с цветом, модуляция использует цвета одного источника для **искажения геометрии** другого.

## Как работает модуляция

При модуляции:
1. Красный канал модулятора преобразуется в смещение по оси X
2. Зелёный канал модулятора преобразуется в смещение по оси Y
3. Светлые области искажаются сильнее, тёмные — слабее

```
источник.modulate(модулятор, интенсивность)
```

---

## modulate() — Базовая модуляция

Искажает координаты источника на основе цветов модулятора.

### Синтаксис

```javascript
source.modulate(texture, amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| texture | - | Модулирующий источник |
| amount | 0.1 | Интенсивность искажения |

### Примеры

**Базовая модуляция:**
```javascript
osc(10)
  .modulate(noise(3))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .modulate(noise(3))
  .out()
`}
/>

**Сильная модуляция:**
```javascript
osc(10)
  .modulate(noise(3), 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .modulate(noise(3), 0.5)
  .out()
`}
/>

**Модуляция осциллятором:**
```javascript
osc(10, 0.1, 0.5)
  .modulate(osc(3).rotate(1.57))
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .modulate(osc(3).rotate(1.57))
  .out()
`}
/>

**Модуляция Вороным:**
```javascript
osc(10, 0.1, 0.5)
  .modulate(voronoi(5, 0.1), 0.3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .modulate(voronoi(5, 0.1), 0.3)
  .out()
`}
/>

---

## modulateScale() — Модуляция масштаба

Изменяет масштаб разных частей изображения на основе яркости модулятора.

### Синтаксис

```javascript
source.modulateScale(texture, multiple, offset)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| texture | - | Модулирующий источник |
| multiple | 1 | Множитель масштаба |
| offset | 1 | Базовое смещение |

### Примеры

**Базовая модуляция масштаба:**
```javascript
osc(10)
  .modulateScale(noise(3), 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .modulateScale(noise(3), 0.5)
  .out()
`}
/>

**Сильная модуляция:**
```javascript
shape(4)
  .modulateScale(osc(3), 2, 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(4)
  .modulateScale(osc(3), 2, 0.5)
  .out()
`}
/>

---

## modulateRotate() — Модуляция вращения

Применяет разное количество вращения к разным частям изображения.

### Синтаксис

```javascript
source.modulateRotate(texture, multiple, offset)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| texture | - | Модулирующий источник |
| multiple | 1 | Множитель вращения |
| offset | 0 | Базовое смещение |

### Примеры

**Базовая модуляция вращения:**
```javascript
osc(10)
  .modulateRotate(osc(3), 1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .modulateRotate(osc(3), 1)
  .out()
`}
/>

**Спиральный эффект:**
```javascript
osc(20, 0.1, 0.5)
  .modulateRotate(noise(3), 2)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(20, 0.1, 0.5)
  .modulateRotate(noise(3), 2)
  .out()
`}
/>

---

## modulateHue() — Модуляция оттенка

Изменяет координаты на основе оттенка модулятора.

### Синтаксис

```javascript
source.modulateHue(texture, amount)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| texture | - | Модулирующий источник |
| amount | 1 | Интенсивность |

### Примеры

```javascript
osc(10, 0.1, 0.5)
  .modulateHue(osc(3).saturate(3), 1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .modulateHue(osc(3).saturate(3), 1)
  .out()
`}
/>

---

## modulateRepeat() — Модуляция повторения

Изменяет количество повторений в разных частях изображения.

### Синтаксис

```javascript
source.modulateRepeat(texture, repeatX, repeatY, offsetX, offsetY)
```

### Примеры

```javascript
shape(4)
  .modulateRepeat(osc(3), 3, 3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(4)
  .modulateRepeat(osc(3), 3, 3)
  .out()
`}
/>

---

## modulateKaleid() — Модуляция калейдоскопа

Применяет различное количество калейдоскопических сегментов.

### Синтаксис

```javascript
source.modulateKaleid(texture, nSides)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| texture | - | Модулирующий источник |
| nSides | 4 | Количество сегментов |

### Примеры

```javascript
osc(10)
  .modulateKaleid(noise(3), 8)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .modulateKaleid(noise(3), 8)
  .out()
`}
/>

---

## modulateScrollX() / modulateScrollY()

Модулирует горизонтальную/вертикальную прокрутку.

### Синтаксис

```javascript
source.modulateScrollX(texture, scrollX, speed)
source.modulateScrollY(texture, scrollY, speed)
```

### Примеры

```javascript
osc(10)
  .modulateScrollX(osc(3), 0.5)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .modulateScrollX(osc(3), 0.5)
  .out()
`}
/>

---

## modulatePixelate()

Модулирует пикселизацию.

### Синтаксис

```javascript
source.modulatePixelate(texture, multiple, offset)
```

### Примеры

```javascript
osc(10, 0.1, 0.5)
  .modulatePixelate(noise(3), 100, 10)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .modulatePixelate(noise(3), 100, 10)
  .out()
`}
/>

---

## Комплексные примеры

### Многослойная модуляция

```javascript
osc(10, 0.1, 0.5)
  .modulate(noise(3), 0.2)
  .modulateRotate(osc(2), 0.5)
  .modulateScale(voronoi(5), 0.3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .modulate(noise(3), 0.2)
  .modulateRotate(osc(2), 0.5)
  .modulateScale(voronoi(5), 0.3)
  .out()
`}
/>

### Самомодуляция (feedback)

```javascript
osc(10, 0.1, 0.5)
  .modulate(o0, 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.5)
  .modulate(o0, 0.1)
  .out()
`}
/>

### Перекрёстная модуляция

```javascript
osc(10).modulate(o1, 0.2).out(o0)
noise(3).modulate(o0, 0.2).out(o1)
render(o0)
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10).modulate(o1, 0.2).out(o0)
noise(3).modulate(o0, 0.2).out(o1)
render(o0)
`}
/>

### Комбинация с цветом

```javascript
osc(20, 0.03, 0)
  .modulate(noise(3), () => Math.sin(time) * 0.3)
  .color(1, 0.5, 0.2)
  .kaleid(4)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(20, 0.03, 0)
  .modulate(noise(3), () => Math.sin(time) * 0.3)
  .color(1, 0.5, 0.2)
  .kaleid(4)
  .out()
`}
/>

---

## Сравнение модуляций

| Функция | Что модулирует | Эффект |
|---------|---------------|--------|
| `modulate()` | Координаты XY | Общее искажение |
| `modulateScale()` | Масштаб | Эффект линзы |
| `modulateRotate()` | Вращение | Спирали, завихрения |
| `modulateHue()` | Координаты по оттенку | Цветовое смещение |
| `modulateKaleid()` | Сегменты калейдоскопа | Переменная симметрия |
| `modulateRepeat()` | Повторение | Переменная сетка |
| `modulatePixelate()` | Пикселизация | Переменное разрешение |

---

## Советы по модуляции

1. **Начинайте с малых значений** — модуляция быстро становится хаотичной
2. **Используйте noise() как модулятор** — создаёт органичные искажения
3. **Экспериментируйте с перекрёстной модуляцией** — o0 модулирует o1 и наоборот
4. **Комбинируйте с цветовыми эффектами** — модуляция + color() даёт интересные результаты
5. **Анимируйте интенсивность** — `() => Math.sin(time) * 0.3` делает эффект живым

## Следующие шаги

- [Внешние источники](./07-vneshnie-istochniki.md) — модуляция камерой
- [Feedback эффекты](./10-feedback-effekty.md) — продвинутые техники модуляции
