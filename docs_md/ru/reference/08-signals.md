# Сигналы и модуляция

Всего функций: 44

---

## absoluteOrientationAlpha

**Синонимы:** absOriA, absOriZ, absoluteOrientationZ

**Параметры:**

Нет параметров

**Описание:** Значение абсолютной ориентации устройства alpha в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(absoluteOrientationAlpha.segment(4).range(0,7)).scale("C:minor")
```

---

## absoluteOrientationBeta

**Синонимы:** absOriB, absOriX, absoluteOrientationX

**Параметры:**

Нет параметров

**Описание:** Значение абсолютной ориентации устройства beta в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(absoluteOrientationBeta.segment(4).range(0,7)).scale("C:minor")
```

---

## absoluteOrientationGamma

**Синонимы:** absOriG, absOriY, absoluteOrientationY

**Параметры:**

Нет параметров

**Описание:** Значение абсолютной ориентации устройства gamma в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(absoluteOrientationGamma.segment(4).range(0,7)).scale("C:minor")
```

---

## accelerationX

**Синонимы:** accX

**Параметры:**

Нет параметров

**Описание:** Значение акселерометра по оси x в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(accelerationX.segment(4).range(0,7)).scale("C:minor")
```

---

## accelerationY

**Синонимы:** accY

**Параметры:**

Нет параметров

**Описание:** Значение акселерометра по оси y в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(accelerationY.segment(4).range(0,7)).scale("C:minor")
```

---

## accelerationZ

**Синонимы:** accZ

**Параметры:**

Нет параметров

**Описание:** Значение акселерометра по оси z в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(accelerationZ.segment(4).range(0,7)).scale("C:minor")
```

---

## beat

**Параметры:**

Нет параметров

**Описание:** creates a structure pattern from divisions of a cycle
especially useful for creating rhythms

**Примеры:**

```javascript
s("bd").beat("0,7,10", 16)
```

```javascript
s("sd").beat("4,12", 16)
```

---

## berlin

**Параметры:**

Нет параметров

**Описание:** Генерирует непрерывный pattern [шума berlin](придуманного Джеймсом Койном и Джейд Роуланд как шутка, но оказавшегося на удивление крутым и полезным,
как шум perlin, но с пилообразными волнами) в диапазоне 0..1.

**Примеры:**

```javascript
// восходящие арпеджио
n("0!16".add(berlin.fast(4).mul(14))).scale("d:minor")
```

---

## binary

**Параметры:**

- **n** (number): входное число для преобразования в двоичную систему

**Описание:** Создает двоичный pattern из числа.

**Примеры:**

```javascript
"hh".s().struct(binary(5))
// "hh".s().struct("1 0 1")
```

---

## binaryL

**Параметры:**

- **n** (number): входное число для преобразования в двоичную систему
s(&quot;saw&quot;).seg(8)
.partials(binaryL(irand(4096).add(1)))

**Описание:** Создает двоичный список pattern из числа.

---

## binaryN

**Параметры:**

- **n** (number): входное число для преобразования в двоичную систему
- **nBits** (number): длина pattern, по умолчанию 16

**Описание:** Создает двоичный pattern из числа, дополненный до n бит.

**Примеры:**

```javascript
"hh".s().struct(binaryN(55532, 16))
// "hh".s().struct("1 1 0 1 1 0 0 0 1 1 1 0 1 1 0 0")
```

---

## binaryNL

**Параметры:**

- **n** (number): входное число для преобразования в двоичную систему
- **nBits** (number): длина pattern, по умолчанию 16

**Описание:** Создает двоичный список pattern из числа, дополненный до n бит.

---

## cosine

**Параметры:**

Нет параметров

**Описание:** Косинусоидальный signal от 0 до 1.

**Примеры:**

```javascript
n(stack(sine,cosine).segment(16).range(0,15))
.scale("C:minor")
```

---

## cosine2

**Параметры:**

Нет параметров

**Описание:** Косинусоидальный signal от -1 до 1 (как <code>cosine</code>, но биполярный).

---

## gravityX

**Синонимы:** gravX

**Параметры:**

Нет параметров

**Описание:** Значение гравитации устройства по оси x в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(gravityX.segment(4).range(0,7)).scale("C:minor")
```

---

## gravityY

**Синонимы:** gravY

**Параметры:**

Нет параметров

**Описание:** Значение гравитации устройства по оси y в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(gravityY.segment(4).range(0,7)).scale("C:minor")
```

---

## gravityZ

**Синонимы:** gravZ

**Параметры:**

Нет параметров

**Описание:** Значение гравитации устройства по оси z в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(gravityZ.segment(4).range(0,7)).scale("C:minor")
```

---

## isaw

**Параметры:**

Нет параметров

**Описание:** Пилообразный signal от 1 до 0 (как <code>saw</code>, но перевернутый).

**Примеры:**

```javascript
note("<c3 [eb3,g3] g2 [g3,bb3]>*8")
.clip(isaw.slow(2))
```

```javascript
n(isaw.range(0,8).segment(8))
.scale('C major')
```

---

## isaw2

**Параметры:**

Нет параметров

**Описание:** Пилообразный signal от 1 до -1 (как <code>saw2</code>, но перевернутый).

---

## itri

**Параметры:**

Нет параметров

**Описание:** Перевернутый треугольный signal от 1 до 0 (как <code>tri</code>, но перевернутый).

**Примеры:**

```javascript
n(itri.segment(8).range(0,7)).scale("C:minor")
```

---

## itri2

**Параметры:**

Нет параметров

**Описание:** Перевернутый треугольный signal от -1 до 1 (как <code>itri</code>, но биполярный).

---

## keyDown

**Параметры:**

Нет параметров

**Описание:** возвращает true, когда клавиша или массив клавиш удерживается
<a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">Справочник по именам клавиш</a>

**Примеры:**

```javascript
keyDown("Control:j").pick([s("bd(5,8)"), s("cp(3,8)")])
```

---

## mousex

**Параметры:**

Нет параметров

**Описание:** Позиция мыши по x в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(mousex.segment(4).range(0,7)).scale("C:minor")
```

---

## mousey

**Параметры:**

Нет параметров

**Описание:** Позиция мыши по y в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(mousey.segment(4).range(0,7)).scale("C:minor")
```

---

## orientationAlpha

**Синонимы:** oriA, oriZ, orientationZ

**Параметры:**

Нет параметров

**Описание:** Значение ориентации устройства alpha в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(orientationAlpha.segment(4).range(0,7)).scale("C:minor")
```

---

## orientationBeta

**Синонимы:** oriB, oriX, orientationX

**Параметры:**

Нет параметров

**Описание:** Значение ориентации устройства beta в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(orientationBeta.segment(4).range(0,7)).scale("C:minor")
```

---

## orientationGamma

**Синонимы:** oriG, oriY, orientationY

**Параметры:**

Нет параметров

**Описание:** Значение ориентации устройства gamma в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(orientationGamma.segment(4).range(0,7)).scale("C:minor")
```

---

## rotationAlpha

**Синонимы:** rotA, rotZ, rotationZ

**Параметры:**

Нет параметров

**Описание:** Значение вращения устройства вокруг оси alpha в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(rotationAlpha.segment(4).range(0,7)).scale("C:minor")
```

---

## rotationBeta

**Синонимы:** rotB, rotX, rotationX

**Параметры:**

Нет параметров

**Описание:** Значение вращения устройства вокруг оси beta в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(rotationBeta.segment(4).range(0,7)).scale("C:minor")
```

---

## rotationGamma

**Синонимы:** rotG, rotY, rotationY

**Параметры:**

Нет параметров

**Описание:** Значение вращения устройства вокруг оси gamma в диапазоне от 0 до 1.

**Примеры:**

```javascript
n(rotationGamma.segment(4).range(0,7)).scale("C:minor")
```

---

## saw

**Параметры:**

Нет параметров

**Описание:** Пилообразный signal от 0 до 1.

**Примеры:**

```javascript
note("<c3 [eb3,g3] g2 [g3,bb3]>*8")
.clip(saw.slow(2))
```

```javascript
n(saw.range(0,8).segment(8))
.scale('C major')
```

---

## saw2

**Параметры:**

Нет параметров

**Описание:** Пилообразный signal от -1 до 1 (как <code>saw</code>, но биполярный).

---

## sine

**Параметры:**

Нет параметров

**Описание:** Синусоидальный signal от 0 до 1.

**Примеры:**

```javascript
n(sine.segment(16).range(0,15))
.scale("C:minor")
```

---

## sine2

**Параметры:**

Нет параметров

**Описание:** Синусоидальный signal от -1 до 1 (как <code>sine</code>, но биполярный).

---

## sinefold

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Wavefolding distortion composed with sinusoid

---

## someCycles

**Параметры:**

Нет параметров

**Описание:** Сокращение для <code>.someCyclesBy(0.5, fn)</code>

**Примеры:**

```javascript
s("bd,hh*8").someCycles(x=>x.speed("0.5"))
```

---

## someCyclesBy

**Параметры:**

- **probability** (number | Pattern): число от 0 до 1
- **function** (function): преобразование для применения

**Описание:** Случайно применяет заданную функцию с заданной вероятностью на основе cycle за cycle.
Похоже на <code>sometimesBy</code>

**Примеры:**

```javascript
s("bd,hh*8").someCyclesBy(.3, x=>x.speed("0.5"))
```

---

## square

**Параметры:**

Нет параметров

**Описание:** Прямоугольный signal от 0 до 1.

**Примеры:**

```javascript
n(square.segment(4).range(0,7)).scale("C:minor")
```

---

## square2

**Параметры:**

Нет параметров

**Описание:** Прямоугольный signal от -1 до 1 (как <code>square</code>, но биполярный).

---

## time

**Параметры:**

Нет параметров

**Описание:** Signal, представляющий время cycle.

---

## timecat

**Параметры:**

Нет параметров

**Описание:** Aliases for <code>stepcat</code>

---

## tri

**Параметры:**

Нет параметров

**Описание:** Треугольный signal от 0 до 1.

**Примеры:**

```javascript
n(tri.segment(8).range(0,7)).scale("C:minor")
```

---

## tri2

**Параметры:**

Нет параметров

**Описание:** Треугольный signal от -1 до 1 (как <code>tri</code>, но биполярный).

---

## whenKey

**Параметры:**

Нет параметров

**Описание:** Делать что-то при нажатии клавиши или массива клавиш
<a href="https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values">Справочник по именам клавиш</a>

**Примеры:**

```javascript
s("bd(5,8)").whenKey("Control:j", x => x.segment(16).color("red")).whenKey("Control:i", x => x.fast(2).color("blue"))
```

---

