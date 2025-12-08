# Временные модификаторы

Всего функций: 23

---

## compress

**Параметры:**

Нет параметров

**Описание:** Сжимает каждый цикл в заданный timespan, оставляя промежуток

**Примеры:**

```javascript
cat(
  s("bd sd").compress(.25,.75),
  s("~ bd sd ~")
)
```

---

## csoundm

**Параметры:**

Нет параметров

**Описание:** Отправляет ноты в Csound для рендеринга с семантикой MIDI. Значение hap
транслируется в следующие поля Csound (pfields):
p1 -- Инструмент Csound в виде числа (начиная с 1, может быть дробным),
или в виде строкового имени.
p2 -- Время в beats (обычно секунды) от начала исполнения.
p3 -- Длительность в beats (обычно секунды).
p4 -- Номер MIDI клавиши (вещественное число, не целое, в диапазоне [0, 127].
p5 -- MIDI velocity (вещественное число, не целое, в диапазоне [0, 127].
p6 -- Strudel controls, в виде строки.

---

## early

**Параметры:**

- **cycles** (number | Pattern): количество циклов для сдвига влево

**Описание:** Сдвигает pattern, чтобы начать раньше во времени. Эквивалент оператора &lt;~ из Tidal

**Примеры:**

```javascript
"bd ~".stack("hh ~".early(.1)).s()
```

---

## every

**Параметры:**

- **n** (number): сколько циклов
- **func** (function): функция для применения

**Описание:** Синоним для <code>firstOf</code>

**Примеры:**

```javascript
note("c3 d3 e3 g3").every(4, x=>x.rev())
```

---

## fast

**Синонимы:** density

**Параметры:**

- **factor** (number | Pattern): множитель ускорения

**Описание:** Ускоряет pattern в заданное количество раз. Используется &quot;*&quot; в mini-нотации.

**Примеры:**

```javascript
s("bd hh sd hh").fast(2) // s("[bd hh sd hh]*2")
```

---

## fastChunk

**Синонимы:** fastchunk

**Параметры:**

Нет параметров

**Описание:** Like <code>chunk</code>, but the cycles of the source pattern aren't repeated
for each set of chunks.

**Примеры:**

```javascript
"<0 8> 1 2 3 4 5 6 7"
.scale("C2:major").note()
.fastChunk(4, x => x.color('red')).slow(2)
```

---

## fastGap

**Синонимы:** fastgap

**Параметры:**

Нет параметров

**Описание:** Ускоряет pattern как fast, но вместо того, чтобы воспроизводить его несколько раз, как это делает fast, оставляет промежуток в оставшемся пространстве цикла. Например, следующее воспроизведёт звуковой pattern &quot;bd sn&quot; только один раз, но сжатым в первую половину цикла, то есть вдвое быстрее.

**Примеры:**

```javascript
s("bd sd").fastGap(2)
```

---

## hurry

**Параметры:**

Нет параметров

**Описание:** Одновременно ускоряет pattern (как 'fast') и воспроизведение sample (как 'speed').

**Примеры:**

```javascript
s("bd sd:2").hurry("<1 2 4 3>").slow(1.5)
```

---

## inside

**Параметры:**

Нет параметров

**Описание:** Выполняет операцию 'внутри' цикла.

**Примеры:**

```javascript
"0 1 2 3 4 3 2 1".inside(4, rev).scale('C major').note()
// "0 1 2 3 4 3 2 1".slow(4).rev().fast(4).scale('C major').note()
```

---

## late

**Параметры:**

- **cycles** (number | Pattern): количество циклов для сдвига вправо

**Описание:** Сдвигает pattern, чтобы начать позже во времени. Эквивалент оператора ~&gt; из Tidal

**Примеры:**

```javascript
"bd ~".stack("hh ~".late(.1)).s()
```

---

## linger

**Параметры:**

- **fraction** (number): дробь для выбора

**Описание:** Выбирает заданную часть pattern и повторяет эту часть, чтобы заполнить оставшуюся часть цикла.

**Примеры:**

```javascript
s("lt ht mt cp, [hh oh]*2").linger("<1 .5 .25 .125>")
```

---

## off

**Параметры:**

- **time** (Pattern | number): время смещения
- **func** (function): функция для применения

**Описание:** Накладывает результат функции поверх оригинального pattern, задержанный на заданное время.

**Примеры:**

```javascript
"c3 eb3 g3".off(1/8, x=>x.add(7)).note()
```

---

## offset

**Параметры:**

- **shift** (number | Pattern): величина смещения озвучивания вверх или вниз

**Описание:** Устанавливает смещение озвучивания от закреплённой позиции

**Примеры:**

```javascript
chord("<Am C D F Am E Am E>").offset("<0 1 2 3 4 5>") // изменить озвучивание каждый раз
```

---

## outside

**Параметры:**

Нет параметров

**Описание:** Выполняет операцию 'снаружи' цикла.

**Примеры:**

```javascript
"<[0 1] 2 [3 4] 5>".outside(4, rev).scale('C major').note()
// "<[0 1] 2 [3 4] 5>".fast(4).rev().slow(4).scale('C major').note()
```

---

## ply

**Параметры:**

Нет параметров

**Описание:** Функция ply повторяет каждое событие заданное количество раз.

**Примеры:**

```javascript
s("bd ~ sd cp").ply("<1 2 3>")
```

---

## plyForEach

**Синонимы:** plyforeach

**Параметры:**

- **factor** (number): how many times to repeat
- **func** (function): function to apply, given the pattern and the iteration index

**Описание:** The plyForEach function repeats each event the given number of times, applying the given function to each event.
This version of ply uses the iteration index as an argument to the function, similar to echoWith.

**Примеры:**

```javascript
"<0 [2 4]>"
.plyForEach(4, (p,n) => p.add(n*2))
.scale("C:minor").note()
```

---

## plyWith

**Синонимы:** plywith

**Параметры:**

- **factor** (number): how many times to repeat
- **func** (function): function to apply, given the pattern

**Описание:** The plyWith function repeats each event the given number of times, applying the given function to each event.\n

**Примеры:**

```javascript
"<0 [2 4]>"
.plyWith(4, (p) => p.add(2))
.scale("C:minor").note()
```

---

## press

**Параметры:**

Нет параметров

**Описание:** Синкопирует ритм, смещая каждое событие на половину его timespan.

**Примеры:**

```javascript
stack(s("hh*4"),
      s("bd mt sd ht").every(4, press)
     ).slow(2)
```

---

## pressBy

**Параметры:**

Нет параметров

**Описание:** Как press, но позволяет указать величину, на которую
смещается каждое событие. pressBy(0.5) - то же, что press, в то время как
pressBy(1/3) смещает каждое событие на треть его timespan.

**Примеры:**

```javascript
stack(s("hh*4"),
      s("bd mt sd ht").pressBy("<0 0.5 0.25>")
     ).slow(2)
```

---

## slow

**Синонимы:** sparsity

**Параметры:**

- **factor** (number | Pattern): множитель замедления

**Описание:** Замедляет pattern на заданное количество циклов. Как оператор &quot;/&quot; в mini-нотации.

**Примеры:**

```javascript
s("bd hh sd hh").slow(2) // s("[bd hh sd hh]/2")
```

---

## swing

**Параметры:**

- **subdivision** (number): 

**Описание:** Сокращение для swingBy с 1/3:

**Примеры:**

```javascript
s("hh*8").swing(4)
// s("hh*8").swingBy(1/3, 4)
```

---

## swingBy

**Параметры:**

- **subdivision** (number): 
- **offset** (number): 

**Описание:** Функция <code>swingBy x n</code> разбивает каждый цикл на <code>n</code> частей, а затем задерживает события во второй половине каждой части на величину <code>x</code>, которая относительна размеру (половины) части. Так что если <code>x</code> равно 0, ничего не происходит, <code>0.5</code> задерживает на половину длительности ноты, а 1 снова завернётся и не будет ничего делать. Конечный результат - shuffle или swing-подобный ритм

**Примеры:**

```javascript
s("hh*8").swingBy(1/3, 4)
```

---

## zoom

**Параметры:**

Нет параметров

**Описание:** Воспроизводит часть pattern, указанную началом и окончанием временного промежутка. Новый результирующий pattern воспроизводится за период времени оригинального pattern:

**Примеры:**

```javascript
s("bd*2 hh*3 [sd bd]*2 perc").zoom(0.25, 0.75)
// s("hh*3 [sd bd]*2") // эквивалент
```

---

