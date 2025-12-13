# Быстрый старт с Hydra

## Открытие редактора

1. Перейдите на [hydra.ojack.xyz](https://hydra.ojack.xyz/)
2. Закройте приветственное окно нажав [×] в правом верхнем углу
3. Вы готовы к созданию визуалов!

## Ваш первый визуал

Введите в редакторе:

```javascript
osc().out()
```

Нажмите **Ctrl+Shift+Enter** для выполнения всего кода.

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc().out()
`}
/>

Вы увидите чёрно-белые вертикальные полосы — это базовый **осциллятор**.

## Изменение параметров

Функция `osc()` принимает три параметра:

```javascript
osc(frequency, sync, offset)
```

| Параметр | Описание | По умолчанию |
|----------|----------|--------------|
| frequency | Частота полос | 60 |
| sync | Скорость движения | 0.1 |
| offset | Цветовое смещение | 0 |

Попробуйте:

```javascript
osc(10, 0.1, 0.8).out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.8).out()
`}
/>

## Добавление трансформаций

Цепочка функций создаёт сложные визуалы:

```javascript
osc(10, 0.1, 0.8)
  .rotate(0.5)        // Поворот
  .kaleid(4)          // Калейдоскоп
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.8)
  .rotate(0.5)
  .kaleid(4)
  .out()
`}
/>

## Горячие клавиши

| Комбинация | Действие |
|------------|----------|
| **Ctrl+Shift+Enter** | Выполнить весь код |
| **Ctrl+Enter** | Выполнить текущую строку |
| **Alt+Enter** | Выполнить блок кода |
| **Ctrl+Shift+H** | Показать/скрыть код |
| **Ctrl+Shift+S** | Сохранить скриншот |
| **Ctrl+Shift+F** | Форматировать код |

## Базовые примеры

### Шум с цветом

```javascript
noise(3, 0.1)
  .color(1, 0.5, 0.3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
noise(3, 0.1)
  .color(1, 0.5, 0.3)
  .out()
`}
/>

### Геометрические фигуры

```javascript
shape(4, 0.5, 0.01)
  .repeat(3, 3)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
shape(4, 0.5, 0.01)
  .repeat(3, 3)
  .out()
`}
/>

### Диаграмма Вороного

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

## Комбинирование источников

### Смешивание (Blend)

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

### Модуляция

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

## Анимация

Используйте переменную `time` для создания движения:

```javascript
osc(10)
  .rotate(() => time * 0.1)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10)
  .rotate(() => time * 0.1)
  .out()
`}
/>

## Использование массивов

Массивы позволяют переключаться между значениями:

```javascript
osc([10, 20, 30])
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc([10, 20, 30])
  .kaleid([3, 4, 5, 6])
  .out()
`}
/>

## Использование веб-камеры

```javascript
s0.initCam()
src(s0)
  .kaleid(4)
  .out()
```

## Сохранение и публикация

1. **Автоматическое сохранение в URL** — при выполнении кода (Ctrl+Shift+Enter) URL обновляется и содержит ваш код
2. **Скриншот** — Ctrl+Shift+S
3. **Загрузка в галерею** — кнопка "upload to gallery" в панели инструментов

## Комплексный пример

```javascript
osc(10, 0.1, 0.8)
  .color(1, 0.5, 0.3)
  .rotate(() => time * 0.1)
  .kaleid(4)
  .modulate(noise(3), 0.2)
  .out()
```

<MiniRepl
  client:only="react"
  tune={`await initHydra()
osc(10, 0.1, 0.8)
  .color(1, 0.5, 0.3)
  .rotate(() => time * 0.1)
  .kaleid(4)
  .modulate(noise(3), 0.2)
  .out()
`}
/>

## Использование в Strudel

В Strudel добавьте `await initHydra()` в начало кода:

```javascript
await initHydra()

osc(10).kaleid(4).out()

note("c3 e3 g3 b3").piano()
```

## Следующие шаги

Теперь вы знаете основы! Продолжайте изучение:

- [Источники](./03-istochniki.md) — все генераторы визуалов
- [Трансформации](./04-transformatsii.md) — геометрия и цвет
- [Модуляция](./06-modulyatsiya.md) — продвинутые эффекты искажения
- [Примеры](./12-primery.md) — вдохновляющие работы сообщества
