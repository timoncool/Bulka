# Расширение Hydra

Hydra можно расширять кастомными GLSL функциями, интегрировать с внешними библиотеками и встраивать в свои проекты.

## Кастомные GLSL функции

### setFunction() — создание своей функции

Позволяет определить новую функцию на языке GLSL.

### Синтаксис

```javascript
setFunction({
  name: 'functionName',
  type: 'src' | 'color' | 'coord' | 'combine' | 'combineCoord',
  inputs: [
    { name: 'paramName', type: 'float', default: value }
  ],
  glsl: `GLSL код`
})
```

### Типы функций

| Тип | Описание | Пример стандартной |
|-----|----------|--------------------|
| `src` | Источник (генерирует цвет) | `osc()`, `noise()` |
| `color` | Цветовая трансформация | `brightness()`, `contrast()` |
| `coord` | Геометрическая трансформация | `rotate()`, `scale()` |
| `combine` | Смешивание по цвету | `blend()`, `add()` |
| `combineCoord` | Смешивание по координатам | `modulate()` |

### Типы параметров

| Тип | Описание |
|-----|----------|
| `float` | Число |
| `vec2` | Вектор из 2 чисел |
| `vec3` | Вектор из 3 чисел |
| `vec4` | Вектор из 4 чисел (цвет RGBA) |
| `sampler2D` | Текстура (другой источник) |

---

## Примеры кастомных функций

### Источник: Плазма

```javascript
setFunction({
  name: 'plasma',
  type: 'src',
  inputs: [
    { name: 'speed', type: 'float', default: 1 },
    { name: 'scale', type: 'float', default: 10 }
  ],
  glsl: `
    float v = sin((_st.x * scale) + time * speed);
    v += sin((_st.y * scale) + time * speed);
    v += sin((_st.x * scale + _st.y * scale) + time * speed);
    v = v / 3.0;
    return vec4(sin(v * 3.14159), sin(v * 3.14159 + 2.094), sin(v * 3.14159 + 4.188), 1.0);
  `
})

// Использование
plasma(0.5, 15).out()
```

### Цвет: Сепия

```javascript
setFunction({
  name: 'sepia',
  type: 'color',
  inputs: [
    { name: 'amount', type: 'float', default: 1 }
  ],
  glsl: `
    float gray = dot(_c0.rgb, vec3(0.299, 0.587, 0.114));
    vec3 sepiaColor = vec3(1.2, 1.0, 0.8) * gray;
    return vec4(mix(_c0.rgb, sepiaColor, amount), _c0.a);
  `
})

// Использование
osc(10).sepia(0.8).out()
```

### Геометрия: Закручивание

```javascript
setFunction({
  name: 'twist',
  type: 'coord',
  inputs: [
    { name: 'amount', type: 'float', default: 1 }
  ],
  glsl: `
    vec2 center = vec2(0.5, 0.5);
    vec2 delta = _st - center;
    float dist = length(delta);
    float angle = atan(delta.y, delta.x) + dist * amount;
    return center + vec2(cos(angle), sin(angle)) * dist;
  `
})

// Использование
osc(10).twist(3).out()
```

### Комбинирование: Выжигание

```javascript
setFunction({
  name: 'burn',
  type: 'combine',
  inputs: [
    { name: 'amount', type: 'float', default: 1 }
  ],
  glsl: `
    vec3 result = 1.0 - (1.0 - _c0.rgb) / max(_c1.rgb * amount, 0.001);
    return vec4(clamp(result, 0.0, 1.0), _c0.a);
  `
})

// Использование
osc(10).burn(noise(3), 1.5).out()
```

---

## Интеграция с библиотеками

### p5.js

p5.js предзагружен в редакторе Hydra:

```javascript
// Создание p5 инстанса
p5 = new P5()

// p5 код
p5.draw = () => {
  p5.clear()
  p5.fill(255)
  p5.noStroke()
  for (let i = 0; i < 10; i++) {
    p5.ellipse(
      p5.random(p5.width),
      p5.random(p5.height),
      30
    )
  }
}

// Использование p5 canvas в Hydra
s0.init({ src: p5.canvas, dynamic: true })
src(s0)
  .modulate(osc(3), 0.1)
  .out()
```

### Three.js

```javascript
// Загрузка Three.js
await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js")

// Создание сцены
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setSize(512, 512)

// Создание объекта
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)
camera.position.z = 5

// Анимация
function animate() {
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

// Использование в Hydra
s0.init({ src: renderer.domElement, dynamic: true })
src(s0).out()
```

### Tone.js (звук)

```javascript
// Загрузка Tone.js
await loadScript("https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js")

// Создание синтезатора
const synth = new Tone.Synth().toDestination()

// Воспроизведение ноты при клике
document.addEventListener('click', () => {
  synth.triggerAttackRelease("C4", "8n")
})

// Hydra визуал
osc(10).out()
```

---

## Загрузка внешних скриптов

### loadScript()

```javascript
await loadScript("https://example.com/library.js")
```

### Пример с библиотекой шума

```javascript
await loadScript("https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.4.0/simplex-noise.min.js")

const simplex = new SimplexNoise()

setFunction({
  name: 'simplexNoise',
  type: 'src',
  inputs: [
    { name: 'scale', type: 'float', default: 10 }
  ],
  glsl: `
    // Использование встроенного шума, т.к. simplex недоступен в GLSL
    return vec4(vec3(sin(_st.x * scale + time) * sin(_st.y * scale + time)), 1.0);
  `
})
```

---

## Встраивание Hydra в веб-страницу

### Установка через npm

```bash
npm install hydra-synth
```

### Базовое использование

```javascript
import Hydra from 'hydra-synth'

const hydra = new Hydra({
  canvas: document.getElementById('myCanvas'),
  detectAudio: false,
  enableStreamCapture: false
})

// Теперь доступны все функции Hydra
osc(10).out()
```

### Опции конструктора

```javascript
new Hydra({
  canvas: element,           // HTML canvas элемент
  width: 1280,               // Ширина
  height: 720,               // Высота
  autoLoop: true,            // Автоматический цикл рендеринга
  makeGlobal: true,          // Сделать функции глобальными
  detectAudio: true,         // Включить аудио анализ
  numSources: 4,             // Количество источников (s0-s3)
  numOutputs: 4,             // Количество выходов (o0-o3)
  precision: 'mediump'       // Точность float: 'lowp', 'mediump', 'highp'
})
```

---

## Расширения сообщества

### hydra-midi

MIDI контроллер для Hydra:

```javascript
// Загрузка
await loadScript("https://cdn.jsdelivr.net/npm/hydra-midi/dist/index.js")

// Инициализация
midi.init()

// Использование MIDI контроллера
osc(() => midi.cc(0) * 50).out()
```

### hydra-synth-extensions

Коллекция дополнительных функций:

```javascript
await loadScript("https://hydrsynth.glitch.me/hydra-synth-extensions.js")

// Дополнительные функции
truchetTile(10, 0.5).out()
```

---

## Советы по расширению

### 1. Отладка GLSL

При ошибках в GLSL проверьте консоль браузера — там будут детали компиляции шейдера.

### 2. Переменные в GLSL

| Переменная | Описание |
|------------|----------|
| `_st` | UV координаты (0-1) |
| `_c0` | Входной цвет (vec4) |
| `_c1` | Второй входной цвет (для combine) |
| `time` | Время в секундах |
| `resolution` | Разрешение canvas |

### 3. Производительность

- Избегайте сложных циклов в GLSL
- Используйте `lowp`/`mediump` вместо `highp` где возможно
- Минимизируйте количество текстурных сэмплов

### 4. Совместимость

Проверяйте кастомные функции на разных устройствах — мобильные GPU могут иметь ограничения.

## Следующие шаги

- [Примеры](./12-primery.md) — готовые визуализации
- [API Reference](./13-api-reference.md) — полный справочник функций
