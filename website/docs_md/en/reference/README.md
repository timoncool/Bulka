# Справочник функций Strudel

Полная документация всех функций Strudel, извлеченная из исходного кода.

## Содержание

1. **[00-index.md](00-index.md)** - Общий индекс всех функций
2. **[01-controls.md](01-controls.md)** - Управление звуком (133 функций)
   - Базовые параметры: `s`, `sound`, `note`, `gain`, `pan`, `speed`
   - FM-синтез: `fmh`, `fmi`, `fmattack`, `fmdecay`, `fmsustain`, `fmrelease`
   - ADSR envelope: `attack`, `decay`, `sustain`, `release`, `adsr`
   - MIDI: `midi`, `midibend`, `ccn`, `ccv`, `prog`
   - И многое другое...

3. **[02-pattern.md](02-pattern.md)** - Работа с паттернами (153 функций)
   - Комбинирование: `cat`, `stack`, `seq`, `fastcat`, `slowcat`
   - Трансформации: `rev`, `palindrome`, `invert`, `iter`
   - Структура: `euclid`, `struct`, `mask`, `chop`, `slice`
   - Математические операции: `add`, `mul`, `sub`, `div`, `mod`
   - И многое другое...

4. **[03-effects.md](03-effects.md)** - Эффекты (84 функций)
   - Фильтры: `lpf`, `hpf`, `bpf` и их envelope параметры
   - Delay: `delay`, `delaytime`, `delayfeedback`
   - Reverb: `reverb`, `room`, `size`
   - Дисторшн: `distort`, `crush`, `coarse`
   - Модуляция: `phaser`, `tremolo`, `chorus`, `leslie`
   - Пространство: `pan`, `panwidth`, `panorient`
   - И многое другое...

5. **[04-time.md](04-time.md)** - Временные модификаторы (23 функций)
   - Скорость: `fast`, `slow`, `hurry`
   - Сдвиги: `early`, `late`, `offset`
   - Циклы: `every`, `off`, `ply`
   - Компрессия: `compress`, `zoom`, `linger`
   - Ритм: `swing`, `swingBy`
   - И многое другое...

6. **[05-random.md](05-random.md)** - Функции случайности (30 функций)
   - Случайные значения: `rand`, `rand2`, `irand`, `perlin`
   - Выбор: `choose`, `wchoose`, `scramble`, `shuffle`
   - Вероятность: `sometimes`, `often`, `rarely`, `degrade`
   - Константы: `always`, `never`, `almostAlways`, `almostNever`

7. **[06-wavetable.md](06-wavetable.md)** - Wavetable осцилляторы (26 функций)
   - Позиция: `wt`, `wtenv`, `wtattack`, `wtdecay`, `wtrelease`
   - Warp: `warp`, `warpenv`, `warpattack`, `warpmode`
   - Модуляция: `wtrate`, `wtsync`, `wtdepth`, `wtshape`

8. **[07-mini-notation.md](07-mini-notation.md)** - Мини-нотация
   - Базовый синтаксис и операторы
   - Примеры использования

9. **[08-signals.md](08-signals.md)** - Сигналы и модуляция (44 функций)
   - Генераторы: `sine`, `saw`, `square`, `tri`, `cosine`
   - Двоичные: `binary`, `binaryL`, `binaryN`
   - Датчики: `accelerationX/Y/Z`, `gravityX/Y/Z`, `orientationAlpha/Beta/Gamma`
   - Интерактив: `mousex`, `mousey`, `keyDown`
   - Системные: `time`, `beat`

10. **[09-other.md](09-other.md)** - Остальные функции (45 функций)
    - UI элементы: `markcss`, `slider`
    - Визуализация: `scope`, `spectrum`, `fscope`, `spiral`
    - Системные: `osc`, `out`, `samples`, `tables`, `voicings`
    - И другие специализированные функции...

## Статистика

- **Всего функций:** 538 (отфильтровано из 558, исключены служебные)
- **Категорий:** 9
- **Формат:** Markdown с примерами кода

## Структура записи функции

Каждая функция документирована в следующем формате:

```markdown
## function_name

**Синонимы:** alias1, alias2 (если есть)

**Параметры:**
- **param1** (type): описание
- **param2** (type): описание

**Описание:** Подробное описание функции

**Примеры:**
\`\`\`javascript
// Примеры использования
s("bd hh").gain(0.8)
\`\`\`
```

## Использование

Эта документация создана для удобного поиска и изучения функций Strudel. Используйте:

- **00-index.md** для быстрого поиска функции по категориям
- Отдельные файлы категорий для детального изучения
- Примеры кода для понимания практического применения

## Генерация

Документация автоматически сгенерирована из файла `doc.json` с использованием скрипта `generate_docs.js`.

Для перегенерации документации:
```bash
node generate_docs.js
```
