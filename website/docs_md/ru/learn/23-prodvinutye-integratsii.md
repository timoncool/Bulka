# Продвинутые интеграции

# Продвинутые интеграции

Эта страница описывает продвинутые техники интеграции Bulka с внешними инструментами и системами.

## Hydra — продвинутые техники

### Синхронизация паттернов с визуалами

Функция `H()` позволяет использовать музыкальные паттерны как входные данные для Hydra:

<MiniRepl
  client:only="react"
  tune={`await initHydra()
let pat = "3 4 5 [6 7]*2"
// Количество граней фигуры следует паттерну
shape(H(pat))
  .scale(1.5)
  .rotate(()=>time*0.1)
  .out(o0)
// Звук использует тот же паттерн
n(pat).scale("A:minor").piano().room(0.5)`}
/>

### Трансформация встроенных визуализаций

С `feedStrudel` можно применять эффекты Hydra к pianoroll, scope и другим:

<MiniRepl
  client:only="react"
  tune={`await initHydra({feedStrudel:1})
// Визуализации Strudel идут в s0
src(s0)
  .kaleid(H("<3 4 5 6>"))
  .colorama(0.1)
  .out()
//
$: s("bd*4, hh*8, ~ cp")
$: note("[c3,e3,g3]*2").s("sawtooth").lpf(800)
all(x=>x.scope())`}
/>

### Реакция на аудио

С `detectAudio` Hydra реагирует на звук через FFT анализ:

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio:true})
osc(10,0.1,1)
  .modulate(noise(3))
  .scale(()=> 1 + a.fft[0]*0.5)  // реагирует на бас
  .colorama(()=> a.fft[2]*0.3)  // цвет от высоких
  .out()
$: s("bd*4, hh*8").gain(1.2)`}
/>

## MIDI — продвинутые техники

### Паттернирование Control Change

Модулируйте параметры внешних синтезаторов с помощью CC:

```javascript
// Пример:
// CC 74 часто управляет фильтром
// Синус модулирует cutoff
note("c2 e2 g2 a2")
  .ccn(74)
  .ccv(sine.slow(8).range(0, 1))
  .midi()
```

### Мультиканальный MIDI

Отправляйте разные паттерны на разные MIDI каналы:

```javascript
// Пример:
stack(
  // Канал 1 - бас
  note("c2 e2 g2").midichan(1),
  // Канал 2 - лид
  note("c4 e4 g4 b4").midichan(2),
  // Канал 10 - ударные (стандарт GM)
  note("c1 d1 c1 [c1 d1]").midichan(10)
).midi()
```

### Pitch Bend и модуляция

```javascript
// Пример:
// Плавный pitch bend
note("c3 e3 g3 c4")
  .midibend(sine.slow(4).range(-0.2, 0.2))
  .midi()
```

### MIDI Input — использование контроллеров

```javascript
// Подключение к MIDI входу
let cc = await midin('Your MIDI Device')

// Используем CC контроллеры для управления
note("c3 e3 g3 b3")
  .lpf(cc(74).range(100, 5000))  // CC 74 → фильтр
  .lpq(cc(71).range(0, 20))      // CC 71 → резонанс
  .gain(cc(7).range(0, 1))       // CC 7 → громкость
  .s("sawtooth")
```

## OSC и SuperCollider

### Настройка подключения

```bash
# Установите и запустите OSC мост
npx @strudel/osc

# С отладкой для проверки сообщений
npx @strudel/osc --debug
```

### Отправка в SuperDirt

```javascript
// Пример:
// Все события идут через OSC в SuperCollider
$: s("bd*4, hh*8, ~ sd")
all(osc)
```

### Орбиты для раздельной обработки

В SuperDirt разные орбиты имеют независимые эффекты:

```javascript
// Пример:
stack(
  s("bd*4").orbit(0),           // Сухой сигнал
  s("hh*8").orbit(1).room(0.5), // С реверберацией
  s("~ sd").orbit(2).delay(0.3) // С делеем
).osc()
```

## Геймпад

Управляйте паттернами с помощью геймпада:

```javascript
// Пример:
// gp = gamepad(0) - первый геймпад
// gp.a, gp.b, gp.x, gp.y - кнопки
// gp.lstick.x/y - левый стик
// gp.rstick.x/y - правый стик

// Пример (требует подключённый геймпад):
// note("c3 e3 g3 b3")
//   .mask(gp.a)  // Играет когда нажата A
//   .lpf(gp.lstick.x.range(200, 5000))
//   .s("sawtooth")
```

## Flok — совместный live coding

[Flok](https://flok.cc/) позволяет нескольким людям кодить вместе:

1. Откройте flok.cc
2. Создайте сессию
3. Поделитесь ссылкой с другими
4. Один кодит звук (Strudel), другой — визуалы (Hydra)

```javascript
// Участник 1 — звук
$: s("bd*4, hh*8")
$: note("[c3,e3,g3]").s("sawtooth").lpf(800)

// Участник 2 — визуалы
osc(10).rotate(0.1).out()
```

## Hydra-Strudel расширение

Внешнее расширение для ещё более тесной интеграции:

```javascript
// Загрузка расширения
await loadScript("https://cdn.jsdelivr.net/gh/atfornes/Hydra-strudel-extension@latest/hydra-strudel.js")
await initHydraStrudel()

// Один паттерн для звука и визуализации
myPattern = '0 10 [2 5]*4'.slow(2)
note(myPattern).play()      // Аудио
osc(P(myPattern)).out()     // Визуализация с функцией P()
```

## Практические советы

### Производительность интеграций

- **Hydra**: Сложные шейдеры нагружают GPU. Начинайте с простого.
- **MIDI**: Web MIDI имеет небольшую задержку. Для критичных применений используйте desktop версию.
- **OSC**: Требует запущенного SuperCollider. Убедитесь, что SuperDirt загружен.

### Отладка

```javascript
// Для OSC — запустите с --debug
// npx @strudel/osc --debug

// Для MIDI — проверьте доступные устройства
// В консоли браузера: navigator.requestMIDIAccess()
```

### Комбинирование интеграций

Можно использовать несколько интеграций одновременно:

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio:true})
// Визуалы реагируют на звук
osc(5).scale(()=>1+a.fft[0]).out()
// Звук идёт через встроенный движок
$: s("bd*4, hh*8, ~ cp").room(0.3)`}
/>

---

*Для более детальной информации о каждой интеграции смотрите соответствующие страницы документации.*

