# Wavetable осцилляторы

Всего функций: 26

---

## warp

**Синонимы:** wavetableWarp

**Параметры:**

- **amount** (number | Pattern): Warp wavetable от 0 до 1

**Описание:** Количество warp (изменения формы волны), применяемое к wavetable oscillator

**Примеры:**

```javascript
s("basique").bank("wt_digital").seg(8).note("F1").warp("0 0.25 0.5 0.75 1")
  .warpmode("spin")
```

---

## warpattack

**Синонимы:** warpatt

**Параметры:**

- **time** (number | Pattern): время attack в секундах

**Описание:** Время attack warp envelope wavetable oscillator

---

## warpdc

**Параметры:**

- **dcoffset** (number | Pattern): смещение dc. установите 0 для unipolar

**Описание:** Смещение DC LFO для warp wavetable oscillator

---

## warpdecay

**Синонимы:** warpdec

**Параметры:**

- **time** (number | Pattern): время decay в секундах

**Описание:** Время decay warp envelope wavetable oscillator

---

## warpdepth

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для warp wavetable oscillator

---

## warpenv

**Параметры:**

- **amount** (number | Pattern): от 0 до 1

**Описание:** Количество envelope, применяемое к position envelope wavetable oscillator

---

## warpmode

**Синонимы:** wavetableWarpMode

**Параметры:**

- **mode** (number | string | Pattern): Режим warp

**Описание:** Тип warp (изменения формы волны), применяемый к wavetable oscillator.
Доступные варианты: none, asym, bendp, bendm, bendmp, sync, quant, fold, pwm, orbit,
spin, chaos, primes, binary, brownian, reciprocal, wormhole, logistic, sigmoid, fractal, flip

**Примеры:**

```javascript
s("morgana").bank("wt_digital").seg(8).note("F1").warp("0 0.25 0.5 0.75 1")
  .warpmode("<asym bendp spin logistic sync wormhole brownian>*2")
```

---

## warprate

**Параметры:**

- **rate** (number | Pattern): частота в герцах

**Описание:** Частота LFO для warp wavetable oscillator

---

## warprelease

**Синонимы:** warprel

**Параметры:**

- **time** (number | Pattern): время release в секундах

**Описание:** Время release warp envelope wavetable oscillator

---

## warpshape

**Параметры:**

- **shape** (number | Pattern): Форма lfo (0, 1, 2, ..)

**Описание:** Форма LFO для warp wavetable oscillator

---

## warpskew

**Параметры:**

- **skew** (number | Pattern): Насколько сильно изгибать форму LFO

**Описание:** Искажение LFO для warp wavetable oscillator

---

## warpsustain

**Синонимы:** warpsus

**Параметры:**

- **gain** (number | Pattern): уровень sustain (от 0 до 1)

**Описание:** Время sustain warp envelope wavetable oscillator

---

## warpsync

**Параметры:**

- **rate** (number | Pattern): частота в циклах

**Описание:** Частота LFO для warp позиции wavetable, синхронизированная с циклами

---

## wt

**Синонимы:** wavetablePosition

**Параметры:**

- **position** (number | Pattern): Позиция в wavetable от 0 до 1

**Описание:** Позиция в wavetable wavetable oscillator

**Примеры:**

```javascript
s("squelch").bank("wt_digital").seg(8).note("F1").wt("0 0.25 0.5 0.75 1")
```

---

## wtattack

**Синонимы:** wtatt

**Параметры:**

- **time** (number | Pattern): время attack в секундах

**Описание:** Время attack position envelope wavetable oscillator

---

## wtdc

**Параметры:**

- **dcoffset** (number | Pattern): смещение dc. установите 0 для unipolar

**Описание:** Смещение DC LFO для позиции wavetable oscillator

---

## wtdecay

**Синонимы:** wtdec

**Параметры:**

- **time** (number | Pattern): время decay в секундах

**Описание:** Время decay position envelope wavetable oscillator

---

## wtdepth

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для позиции wavetable oscillator

---

## wtenv

**Параметры:**

- **amount** (number | Pattern): от 0 до 1

**Описание:** Количество envelope, применяемое к position envelope wavetable oscillator

---

## wtphaserand

**Синонимы:** wavetablePhaseRand

**Параметры:**

- **amount** (number | Pattern): Случайность начальной фазы. От 0 (не случайно) до 1 (полностью случайно)

**Описание:** Количество случайности начальной фазы wavetable oscillator.

**Примеры:**

```javascript
s("basique").bank("wt_digital").seg(16).wtphaserand("<0 1>")
```

---

## wtrate

**Параметры:**

- **rate** (number | Pattern): частота в герцах

**Описание:** Частота LFO для позиции wavetable oscillator

---

## wtrelease

**Синонимы:** wtrel

**Параметры:**

- **time** (number | Pattern): время release в секундах

**Описание:** Время release position envelope wavetable oscillator

---

## wtshape

**Параметры:**

- **shape** (number | Pattern): Форма lfo (0, 1, 2, ..)

**Описание:** Форма LFO для позиции wavetable oscillator

---

## wtskew

**Параметры:**

- **skew** (number | Pattern): Насколько сильно изгибать форму LFO

**Описание:** Искажение LFO для позиции wavetable oscillator

---

## wtsustain

**Синонимы:** wtsus

**Параметры:**

- **gain** (number | Pattern): уровень sustain (от 0 до 1)

**Описание:** Время sustain position envelope wavetable oscillator

---

## wtsync

**Параметры:**

- **rate** (number | Pattern): частота в циклах

**Описание:** Частота LFO для позиции wavetable oscillator, синхронизированная с циклами

---

