# Работа с паттернами

Всего функций: 153

---

## add

**Параметры:**

Нет параметров

**Описание:** Предполагается pattern из чисел. Добавляет заданное число к каждому элементу в pattern.

**Примеры:**

```javascript
// Здесь трезвучие 0, 2, 4 смещается на разные величины
n("0 2 4".add("<0 3 4 0>")).scale("C:major")
// Без add эквивалент был бы:
// n("<[0 2 4] [3 5 7] [4 6 8] [0 2 4]>").scale("C:major")
```

```javascript
// Вы также можете использовать add с нотами:
note("c3 e3 g3".add("<0 5 7 0>"))
// За кулисами ноты преобразуются в midi-номера:
// note("48 52 55".add("<0 5 7 0>"))
```

---

## addVoicings

**Параметры:**

- **name** (string): идентификатор для словаря voicing
- **dictionary** (Object): отображает символ chord на возможные voicing
- **range** (Array): минимальная и максимальная нота

**Описание:** Добавляет новый пользовательский словарь voicing.

**Примеры:**

```javascript
addVoicings('cookie', {
  7: ['3M 7m 9M 12P 15P', '7m 10M 13M 16M 19P'],
  '^7': ['3M 6M 9M 12P 14M', '7M 10M 13M 16M 19P'],
  m7: ['8P 11P 14m 17m 19P', '5P 8P 11P 14m 17m'],
  m7b5: ['3m 5d 8P 11P 14m', '5d 8P 11P 14m 17m'],
  o7: ['3m 6M 9M 11A 15P'],
  '7alt': ['3M 7m 10m 13m 15P'],
  '7#11': ['7m 10m 13m 15P 17m'],
}, ['C3', 'C6'])
"<C^7 A7 Dm7 G7>".voicings('cookie').note()
```

---

## allTransforms

**Параметры:**

Нет параметров

**Описание:** Applies a function to all the running patterns. Note that the patterns are groups together into a single <code>stack</code> before the function is applied. This is probably what you want, but see <code>each</code> for
a version that applies the function to each pattern separately.
<pre class="prettyprint source"><code>$: sound(&quot;bd - cp sd&quot;)
$: sound(&quot;hh*8&quot;)
all(fast(&quot;&lt;2 3>&quot;))
</code></pre>
<pre class="prettyprint source"><code>$: sound(&quot;bd - cp sd&quot;)
$: sound(&quot;hh*8&quot;)
all(x => x.pianoroll())
</code></pre>

---

## appBoth

**Параметры:**

- **pat_val** (Pattern): 

**Описание:** Когда этот метод вызывается на pattern функций, он сопоставляет его haps
с теми, что в заданном pattern значений. Возвращается новый pattern, где
каждое совпадающее значение применяется к соответствующей функции.
В этом варианте <code>_appBoth</code>, где timespans function и value haps
не совпадают, но пересекаются, результирующий hap имеет timespan
пересечения. Это применяется как к part, так и к whole timespan.

---

## appLeft

**Параметры:**

- **pat_val** (Pattern): 

**Описание:** Как и <code>appBoth</code>, но <code>whole</code> timespan - это не пересечение,
а timespan из функции patterns, на которой вызывается этот метод.
На практике это означает, что структура pattern, включая onsets,
сохраняется из pattern функций (часто называемого левым
или внутренним pattern).

---

## apply

**Параметры:**

Нет параметров

**Описание:** Как layer, но с единственной функцией:

**Примеры:**

```javascript
"<c3 eb3 g3>".scale('C minor').apply(scaleTranspose("0,2,4")).note()
```

---

## appRight

**Параметры:**

- **pat_val** (Pattern): 

**Описание:** Как и <code>appLeft</code>, но <code>whole</code> timespans вместо этого берутся из
pattern значений, то есть структура сохраняется из правого/внешнего
pattern.

---

## appWhole

**Параметры:**

- **whole_func** (function): 
- **func** (function): 

**Описание:** Предполагается, что 'this' является pattern функций, и при наличии функции для
разрешения wholes, применяет заданный pattern значений к этому
pattern функций.

---

## arp

**Параметры:**

Нет параметров

**Описание:** Выбирает индексы в наложенных нотах.

**Примеры:**

```javascript
note("<[c,eb,g]!2 [c,f,ab] [d,f,ab]>")
.arp("0 [0,2] 1 [0,2]")
```

---

## arpWith

**Параметры:**

Нет параметров

**Описание:** Выбирает индексы в наложенных нотах.

**Примеры:**

```javascript
note("<[c,eb,g]!2 [c,f,ab] [d,f,ab]>")
.arpWith(haps => haps[2])
```

---

## arrange

**Параметры:**

Нет параметров

**Описание:** Позволяет расположить несколько patterns вместе на протяжении нескольких циклов.
Принимает переменное количество массивов с двумя элементами, указывающими количество циклов и используемый pattern.

**Примеры:**

```javascript
arrange(
  [4, "<c a f e>(3,8)"],
  [2, "<g a>(5,8)"]
).note()
```

---

## asym

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Asymmetrical diode distortion

---

## bite

**Параметры:**

- **number** (number): количество частей
- **slices** (number): какие части воспроизводить

**Описание:** Разбивает pattern на заданное количество частей и воспроизводит их в соответствии с pattern номеров частей.
Похоже на <code>slice</code>, но разрезает patterns, а не звуковые samples.

**Примеры:**

```javascript
note("0 1 2 3 4 5 6 7".scale('c:mixolydian'))
.bite(4, "3 2 1 0")
```

```javascript
sound("bd - bd bd*2, - sd:6 - sd:5 sd:1 - [- sd:2] -, hh [- cp:7]")
  .bank("RolandTR909").speed(1.2)
  .bite(4, "0 0 [1 2] <3 2> 0 0 [2 1] 3")
```

---

## brak

**Параметры:**

Нет параметров

**Описание:** Возвращает новый pattern, где каждый второй цикл воспроизводится один раз, вдвое
быстрее и со смещением во времени на четверть цикла. Создаёт своего рода
breakbeat ощущение.

---

## cat

**Синонимы:** slowcat

**Параметры:**

- **items** (any): Элементы для конкатенации

**Описание:** Заданные элементы кон<strong>кат</strong>енируются, где каждый занимает один цикл.

**Примеры:**

```javascript
cat("e5", "b4", ["d5", "c5"]).note()
// "<e5 b4 [d5 c5]>".note()
```

```javascript
// Как цепная функция:
s("hh*4").cat(
   note("c4(5,8)")
)
```

---

## ceil

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern. Возвращает новый pattern со всеми значениями, установленными в
их математический ceiling. Например, <code>3.2</code> заменяется на <code>4</code>, а <code>-4.2</code>
заменяется на <code>-4</code>.

**Примеры:**

```javascript
note("42 42.1 42.5 43".ceil())
```

---

## chebyshev

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Distortion via Chebyshev polynomials

---

## chop

**Параметры:**

Нет параметров

**Описание:** Cuts each sample into the given number of parts, allowing you to explore a technique known as 'granular synthesis'.
It turns a pattern of samples into a pattern of parts of samples.

**Примеры:**

```javascript
samples({ rhodes: 'https://cdn.freesound.org/previews/132/132051_316502-lq.mp3' })
s("rhodes")
 .chop(4)
 .rev() // reverse order of chops
 .loopAt(2) // fit sample into 2 cycles
```

---

## chunk

**Синонимы:** slowChunk, slowchunk

**Параметры:**

Нет параметров

**Описание:** Divides a pattern into a given number of parts, then cycles through those parts in turn, applying the given function to each part in turn (one part per cycle).

**Примеры:**

```javascript
"0 1 2 3".chunk(4, x=>x.add(7))
.scale("A:minor").note()
```

---

## chunkBack

**Синонимы:** chunkback

**Параметры:**

Нет параметров

**Описание:** Like <code>chunk</code>, but cycles through the parts in reverse order. Known as chunk' in tidalcycles

**Примеры:**

```javascript
"0 1 2 3".chunkBack(4, x=>x.add(7))
.scale("A:minor").note()
```

---

## chunkBackInto

**Синонимы:** chunkbackinto

**Параметры:**

Нет параметров

**Описание:** Like <code>chunkInto</code>, but moves backwards through the chunks.

**Примеры:**

```javascript
sound("bd sd ht lt bd - cp lt").chunkInto(4, hurry(2))
  .bank("tr909")
```

---

## chunkInto

**Синонимы:** chunkinto

**Параметры:**

Нет параметров

**Описание:** Like <code>chunk</code>, but the function is applied to a looped subcycle of the source pattern.

**Примеры:**

```javascript
sound("bd sd ht lt bd - cp lt").chunkInto(4, hurry(2))
  .bank("tr909")
```

---

## contract

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Contracts the step size of the pattern by the given factor. See also <code>expand</code>.

**Примеры:**

```javascript
sound("tha dhi thom nam").bank("mridangam").contract("3 2 1 1 2 3").pace(8)
```

---

## cpm

**Параметры:**

Нет параметров

**Описание:** Воспроизводит pattern с заданными циклами в минуту.

**Примеры:**

```javascript
s("<bd sd>,hh*2").cpm(90) // = 90 bpm
```

---

## cubic

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Cubic polynomial distortion

---

## defragmentHaps

**Параметры:**

Нет параметров

**Описание:** Объединяет смежные haps с одинаковыми значениями и whole. Предназначено
только для использования в тестах.

---

## diode

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Diode-emulating distortion

---

## discreteOnly

**Параметры:**

Нет параметров

**Описание:** Возвращает новый pattern с удалёнными из результатов запроса
'continuous' haps (те, что без 'whole' timespans).

---

## div

**Параметры:**

Нет параметров

**Описание:** Делит каждое число на заданный делитель.

---

## drawLine

**Параметры:**

- **pattern** (Pattern): pattern для использования
- **chars** (number): максимальное количество символов (приблизительно)

**Описание:** Предназначена для отладки, drawLine рендерит pattern как строку, где каждый символ представляет одинаковый отрезок времени.
Следует использовать только с одиночными символами в качестве значений, иначе символьные слоты будут испорчены.
Легенда символов:
<ul>
<li>&quot;|&quot; разделитель cycle</li>
<li>&quot;-&quot; удержание предыдущего значения</li>
<li>&quot;.&quot; silence</li>
</ul>

**Примеры:**

```javascript
const line = drawLine("0 [1 2 3]", 10); // |0--123|0--123
console.log(line);
silence;
```

---

## drop

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Drops the given number of steps from a pattern.
A positive number will drop steps from the start of a pattern, and a negative number from the end.

**Примеры:**

```javascript
"tha dhi thom nam".drop("1").sound().bank("mridangam")
```

```javascript
"tha dhi thom nam".drop("-1").sound().bank("mridangam")
```

```javascript
"tha dhi thom nam".drop("0 1 2 3").sound().bank("mridangam")
```

```javascript
"tha dhi thom nam".drop("0 -1 -2 -3").sound().bank("mridangam")
```

---

## each

**Параметры:**

Нет параметров

**Описание:** Applies a function to each of the running patterns separately. This is intended for future use with upcoming 'stepwise' features. See <code>all</code> for a version that applies the function to all the patterns stacked together into a single pattern.
<pre class="prettyprint source"><code>$: sound(&quot;bd - cp sd&quot;)
$: sound(&quot;hh*8&quot;)
each(fast(&quot;&lt;2 3>&quot;))
</code></pre>

---

## echo

**Параметры:**

- **times** (number): сколько раз повторять
- **time** (number): смещение цикла между итерациями
- **feedback** (number): множитель громкости для каждой итерации

**Описание:** Накладывает и смещает несколько раз, постепенно уменьшая громкость

**Примеры:**

```javascript
s("bd sd").echo(3, 1/6, .8)
```

---

## echoWith

**Синонимы:** echowith, stutWith, stutwith

**Параметры:**

- **times** (number): сколько раз повторять
- **time** (number): смещение цикла между итерациями
- **func** (function): функция для применения, получающая pattern и индекс итерации

**Описание:** Накладывает и смещает несколько раз, применяя заданную функцию каждый раз.

**Примеры:**

```javascript
"<0 [2 4]>"
.echoWith(4, 1/8, (p,n) => p.add(n*2))
.scale("C:minor").note()
```

---

## euclid

**Параметры:**

- **pulses** (number): количество ударов/beats
- **steps** (number): количество шагов для заполнения

**Описание:** Изменяет структуру pattern для формирования Евклидового ритма.
Евклидовы ритмы - это ритмы, полученные с использованием наибольшего общего
делителя двух чисел. Они были описаны в 2004 году канадским компьютерным
ученым Годфридом Туссеном. Евклидовы ритмы очень полезны для компьютерной/
алгоритмической музыки, потому что они могут описать большое количество ритмов
с помощью пары чисел.

**Примеры:**

```javascript
// Кубинский pattern tresillo.
note("c3").euclid(3,8)
```

---

## euclidish

**Синонимы:** eish

**Параметры:**

- **pulses** (number): количество ударов
- **steps** (number): количество шагов для заполнения
- **groove** (number): существует между крайностями 0 (строго евклидов) и 1 (строго импульсный)

**Описание:** Вариант 'euclid' с дополнительным параметром, который морфирует результирующий
ритм от 0 (без морфинга) до 1 (полностью 'ровный'). Например,
<code>sound(&quot;bd&quot;).euclidish(3,8,0)</code> будет таким же, как
<code>sound(&quot;bd&quot;).euclid(3,8)</code>, а <code>sound(&quot;bd&quot;).euclidish(3,8,1)</code> будет таким же,
как <code>sound(&quot;bd bd bd&quot;)</code>. <code>sound(&quot;bd&quot;).euclidish(3,8,0.5)</code> будет иметь
groove где-то посередине.
Вдохновлено работой Малкома Браффа.

**Примеры:**

```javascript
sound("hh").euclidish(7,12,sine.slow(8))
.pan(sine.slow(8))
```

---

## euclidLegato

**Параметры:**

- **pulses** (number): количество ударов/beats
- **steps** (number): количество шагов для заполнения
- **rotation** (any): смещение в шагах
- **pat** (any): 

**Описание:** Похож на <code>euclid</code>, но каждый импульс удерживается до следующего импульса,
поэтому пауз не будет.

**Примеры:**

```javascript
note("c3").euclidLegato(3,8)
```

---

## euclidLegatoRot

**Параметры:**

- **pulses** (number): количество ударов/beats
- **steps** (number): количество шагов для заполнения
- **rotation** (number): смещение в шагах

**Описание:** Похож на <code>euclid</code>, но каждый импульс удерживается до следующего импульса,
поэтому пауз не будет, и имеет дополнительный параметр для 'вращения'
результирующей последовательности

**Примеры:**

```javascript
note("c3").euclidLegatoRot(3,5,2)
```

---

## euclidRot

**Параметры:**

- **pulses** (number): количество ударов/beats
- **steps** (number): количество шагов для заполнения
- **rotation** (number): смещение в шагах

**Описание:** Как <code>euclid</code>, но имеет дополнительный параметр для 'вращения' результирующей последовательности.

**Примеры:**

```javascript
// Бразильский ритм Самбы
note("c3").euclidRot(3,16,14)
```

---

## expand

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Expands the step size of the pattern by the given factor.

**Примеры:**

```javascript
sound("tha dhi thom nam").bank("mridangam").expand("3 2 1 1 2 3").pace(8)
```

---

## extend

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
<code>extend</code> is similar to <code>fast</code> in that it increases its density, but it also increases the step count
accordingly. So <code>stepcat(&quot;a b&quot;.extend(2), &quot;c d&quot;)</code> would be the same as <code>&quot;a b a b c d&quot;</code>, whereas
<code>stepcat(&quot;a b&quot;.fast(2), &quot;c d&quot;)</code> would be the same as <code>&quot;[a b] [a b] c d&quot;</code>.

**Примеры:**

```javascript
stepcat(
  sound("bd bd - cp").extend(2),
  sound("bd - sd -")
).pace(8)
```

---

## filter

**Параметры:**

- **test** (function): function to test Hap

**Описание:** Filters haps using the given function

**Примеры:**

```javascript
s("hh!7 oh").filter(hap => hap.value.s==='hh')
```

---

## filterHaps

**Параметры:**

- **hap_test** (function): функция, которая возвращает false для haps, которые нужно удалить из pattern

**Описание:** Возвращает новый Pattern, который возвращает только те haps, которые соответствуют заданному тесту.

---

## filterValues

**Параметры:**

- **value_test** (function): 

**Описание:** Как и <code>filterHaps</code>, но функция применяется к значениям
внутри haps.

---

## filterWhen

**Параметры:**

- **test** (function): function to test Hap.whole.begin

**Описание:** Filters haps by their begin time

---

## firstCycle

**Параметры:**

- **with_context** (Boolean): установите в true, иначе поле context
будет удалено из результирующих haps.

**Описание:** Запрашивает pattern для первого цикла, возвращая Haps. В основном используется при
отладке pattern.

---

## firstCycleValues

**Параметры:**

Нет параметров

**Описание:** Аксессор для списка значений, возвращаемых запросом первого цикла.

---

## firstOf

**Параметры:**

- **n** (number): сколько циклов
- **func** (function): функция для применения

**Описание:** Применяет заданную функцию каждые n циклов, начиная с первого цикла.

**Примеры:**

```javascript
note("c3 d3 e3 g3").firstOf(4, x=>x.rev())
```

---

## fit

**Параметры:**

Нет параметров

**Описание:** Makes the sample fit its event duration. Good for rhythmical loops like drum breaks.
Similar to <code>loopAt</code>.

**Примеры:**

```javascript
samples({ rhodes: 'https://cdn.freesound.org/previews/132/132051_316502-lq.mp3' })
s("rhodes/2").fit()
```

---

## floor

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern. Возвращает новый pattern со всеми значениями, установленными в
их математический floor. Например, <code>3.7</code> заменяется на <code>3</code>, а <code>-4.2</code>
заменяется на <code>-5</code>.

**Примеры:**

```javascript
note("42 42.1 42.5 43".floor())
```

---

## fmap

**Параметры:**

Нет параметров

**Описание:** см. <code>withValue</code>

---

## focus

**Параметры:**

Нет параметров

**Описание:** Похоже на <code>compress</code>, но не оставляет промежутков, и 'focus' может быть больше цикла

**Примеры:**

```javascript
s("bd hh sd hh").focus(1/4, 3/4)
```

---

## fold

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Wavefolding distortion

---

## fromBipolar

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern, содержащий биполярные значения в диапазоне -1 .. 1
Возвращает новый pattern со значениями, масштабированными в униполярный диапазон 0 .. 1

---

## gap

**Параметры:**

- **steps** (number): 

**Описание:** Абсолютно ничего не делает, но с заданными метрическими 'steps'

**Примеры:**

```javascript
gap(3) // "~@3"
```

---

## grow

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Progressively grows the pattern by 'n' steps until the full pattern is played, or if a second value is given (using mininotation list syntax with <code>:</code>),
that number of times.
A positive number will progressively grow steps from the start of a pattern, and a negative number from the end.

**Примеры:**

```javascript
"tha dhi thom nam".grow("1").sound()
.bank("mridangam")
```

```javascript
"tha dhi thom nam".grow("-1").sound()
.bank("mridangam")
```

```javascript
"tha dhi thom nam".grow("1 -1").sound().bank("mridangam").pace(4)
```

```javascript
note("0 1 2 3 4 5 6 7".scale("C:ritusen")).sound("folkharp")
   .grow("1 -1").pace(8)
```

---

## hard

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Hard-clipping distortion

---

## hush

**Параметры:**

Нет параметров

**Описание:** Заглушает pattern.

**Примеры:**

```javascript
stack(
  s("bd").hush(),
  s("hh*3")
)
```

---

## inhabit

**Синонимы:** pickSqueeze

**Параметры:**

- **pat** (Pattern): 
- **xs** (*): 

**Описание:** Выбирает patterns (или простые значения) либо из списка (по индексу), либо из таблицы поиска (по имени).
Похож на <code>pick</code>, но cycle сжимаются в целевой ('обитаемый') pattern.

**Примеры:**

```javascript
"<a b [a,b]>".inhabit({a: s("bd(3,8)"),
                            b: s("cp sd")
                           })
```

```javascript
s("a@2 [a b] a".inhabit({a: "bd(3,8)", b: "sd sd"})).slow(4)
```

---

## inhabitmod

**Синонимы:** pickmodSqueeze

**Параметры:**

- **pat** (Pattern): 
- **xs** (*): 

**Описание:** То же самое, что <code>inhabit</code>, но если вы выбираете число больше размера списка,
оно зацикливается, вместо того чтобы остановиться на максимальном значении.
Например, если вы выбираете пятый pattern из списка из трех, вы получите
второй.

---

## into

**Параметры:**

Нет параметров

**Описание:** Разбивает pattern на части в соответствии со структурой заданного pattern.
Истинные значения в заданном pattern заставляют соответствующий подцикл
исходного pattern зацикливаться, и для них применяется (опциональная) заданная функция.
Ложные значения приводят к тому, что соответствующая часть исходного pattern
воспроизводится без изменений.

**Примеры:**

```javascript
sound("bd sd ht lt").into("1 0", hurry(2))
```

---

## invert

**Синонимы:** inv

**Параметры:**

Нет параметров

**Описание:** Меняет местами 1 и 0 в бинарном pattern.

**Примеры:**

```javascript
s("bd").struct("1 0 0 1 0 0 1 0".lastOf(4, invert))
```

---

## iter

**Параметры:**

Нет параметров

**Описание:** Divides a pattern into a given number of subdivisions, plays the subdivisions in order, but increments the starting subdivision each cycle. The pattern wraps to the first subdivision after the last subdivision is played.

**Примеры:**

```javascript
note("0 1 2 3".scale('A minor')).iter(4)
```

---

## iterBack

**Синонимы:** iterback

**Параметры:**

Нет параметров

**Описание:** Like <code>iter</code>, but plays the subdivisions in reverse order. Known as iter' in tidalcycles

**Примеры:**

```javascript
note("0 1 2 3".scale('A minor')).iterBack(4)
```

---

## jux

**Параметры:**

Нет параметров

**Описание:** Функция jux создаёт странные стерео эффекты, применяя функцию к pattern, но только в правом канале.

**Примеры:**

```javascript
s("bd lt [~ ht] mt cp ~ bd hh").jux(rev)
```

```javascript
s("bd lt [~ ht] mt cp ~ bd hh").jux(press)
```

```javascript
s("bd lt [~ ht] mt cp ~ bd hh").jux(iter(4))
```

---

## juxBy

**Синонимы:** juxby

**Параметры:**

Нет параметров

**Описание:** Jux с регулируемой стерео шириной. 0 = моно, 1 = полное стерео.

**Примеры:**

```javascript
s("bd lt [~ ht] mt cp ~ bd hh").juxBy("<0 .5 1>/2", rev)
```

---

## lastOf

**Параметры:**

- **n** (number): сколько циклов
- **func** (function): функция для применения

**Описание:** Применяет заданную функцию каждые n циклов, начиная с последнего цикла.

**Примеры:**

```javascript
note("c3 d3 e3 g3").lastOf(4, x=>x.rev())
```

---

## layer

**Синонимы:** apply

**Параметры:**

Нет параметров

**Описание:** Накладывает результат заданной функции (функций). Похоже на <code>superimpose</code>, но без оригинального pattern:

**Примеры:**

```javascript
"<0 2 4 6 ~ 4 ~ 2 0!3 ~!5>*8"
  .layer(x=>x.add("0,2"))
  .scale('C minor').note()
```

---

## log

**Параметры:**

Нет параметров

**Описание:** Записывает содержимое текущего события в консоль (видно в боковом меню).

**Примеры:**

```javascript
s("bd sd").log()
```

---

## logValues

**Параметры:**

Нет параметров

**Описание:** Упрощённая версия <code>log</code>, которая записывает все &quot;значения&quot; (различные настраиваемые параметры)
внутри события в консоль (видно в боковом меню).

**Примеры:**

```javascript
s("bd sd").gain("0.25 0.5 1").n("2 1 0").logValues()
```

---

## mask

**Параметры:**

Нет параметров

**Описание:** Возвращает silence, когда mask равна 0 или &quot;~&quot;

**Примеры:**

```javascript
note("c [eb,g] d [eb,g]").mask("<1 [0 1]>")
```

---

## mode

**Параметры:**

- **modeName** (string | Pattern): один из {below | above | duck | root}

**Описание:** Убрать опорную ноту из озвучивания. Полезно для гармонизации мелодии

**Примеры:**

```javascript
mode("<below above duck root>").chord("C").voicing()
```

---

## morph

**Параметры:**

Нет параметров

**Описание:** Takes two binary rhythms represented as lists of 1s and 0s, and a number
between 0 and 1 that morphs between them. The two lists should contain the same
number of true values.

**Примеры:**

```javascript
sound("hh").struct(morph([1,0,1,0,1,0,1,0], // straight rhythm
                         [1,1,0,1,0,1,0], // wonky rhythm
                         0.25 // creates a slightly wonky rhythm
                        )
                  )
```

```javascript
sound("hh").struct(morph("1:0:1:0:1:0:1:0", // straight rhythm
                         "1:1:0:1:0:1:0", // wonky rhythm
                         sine.slow(8) // slowly morph between the rhythms
                        )
                  )
```

---

## mul

**Параметры:**

Нет параметров

**Описание:** Умножает каждое число на заданный множитель.

**Примеры:**

```javascript
"<1 1.5 [1.66, <2 2.33>]>*4".mul(150).freq()
```

---

## onsetsOnly

**Параметры:**

Нет параметров

**Описание:** Возвращает новый pattern, где отфильтрованы все haps без onsets. Hap
с onset - это тот, у которого <code>whole</code> timespan начинается в то же время,
что и его <code>part</code> timespan.

---

## onTriggerTime

**Параметры:**

Нет параметров

**Описание:** make something happen on event time
uses browser timeout which is innacurate for audio tasks

**Примеры:**

```javascript
s("bd!8").onTriggerTime((hap) => {console.log(hap)})
```

---

## pace

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Speeds a pattern up or down, to fit to the given number of steps per cycle.

**Примеры:**

```javascript
sound("bd sd cp").pace(4)
// The same as sound("{bd sd cp}%4") or sound("<bd sd cp>*4")
```

---

## palindrome

**Параметры:**

Нет параметров

**Описание:** Применяет <code>rev</code> к pattern через цикл, так что pattern чередуется между прямым и обратным.

**Примеры:**

```javascript
note("c d e g").palindrome()
```

---

## parray

**Параметры:**

Нет параметров

**Описание:** Turns a list of patterns into a single pattern which outputs list-values

---

## partials

**Параметры:**

- **magnitudes** (Array.<number> | Pattern): List of [0, 1] magnitudes for partials. 0th entry is the fundamental harmonic (i.e. DC offset is skipped)

**Описание:** Scale the magnitude of the harmonics of one of the core synths ('sine', 'tri', 'saw', ..)
Can also be used to create a new synth via <code>s('user').partials(...)</code>

**Примеры:**

```javascript
s("user").seg(16).n(irand(8)).scale("A:major")
  .partials([1, 0, 1, 0, 0, 1])
```

```javascript
s("saw").seg(8).n(irand(12)).scale("G#:minor")
  .partials(binaryL(irand(256).add("1")))
```

---

## Pattern

**Параметры:**

- **query** (function): Функция, которая отображает <code>State</code> в массив <code>Hap</code>.

**Описание:** Создаёт pattern. Как конечный пользователь, вы скорее всего не будете создавать Pattern напрямую.

---

## phases

**Параметры:**

- **phases** (Array.<number> | Pattern): List of [0, 1) phases for partials. 0th entry is the fundamental phase (i.e. DC offset is skipped)

**Описание:** Rotates the harmonics of one of the core synths ('sine', 'tri', 'saw', 'user', ..) by a list of phases

**Примеры:**

```javascript
// Phase cancellation
s("saw").seg(8).n(irand(12)).scale("G#1:minor")
  .partials(partials([1, 1, 1]))
  .superimpose(x => x.phases([0.5, 0.5, 0.5]))
```

---

## pianoroll

**Синонимы:** punchcard

**Параметры:**

- **options** (Object): Объект, содержащий все следующие необязательные параметры в виде пар ключ-значение:
- **cycles** (integer): количество циклов для одновременного отображения - по умолчанию 4
- **playhead** (number): позиция активных нот на оси времени - от 0 до 1, по умолчанию 0.5
- **vertical** (boolean): отображает roll вертикально - по умолчанию 0
- **labels** (boolean): отображает метки на отдельных нотах (см. функцию label) - по умолчанию 0
- **flipTime** (boolean): меняет направление roll - по умолчанию 0
- **flipValues** (boolean): меняет относительное расположение нот на оси значений - по умолчанию 0
- **overscan** (number): просматривает X циклов за пределами окна циклов для предварительного отображения нот - по умолчанию 1
- **hideNegative** (boolean): скрывает ноты с отрицательным временем (до начала воспроизведения pattern) - по умолчанию 0
- **smear** (boolean): ноты оставляют сплошной след - по умолчанию 0
- **fold** (boolean): ноты занимают полную ширину оси значений - по умолчанию 0
- **active** (string): шестнадцатеричный или CSS цвет активных нот - по умолчанию #FFCA28
- **inactive** (string): шестнадцатеричный или CSS цвет неактивных нот - по умолчанию #7491D2
- **background** (string): шестнадцатеричный или CSS цвет фона - по умолчанию transparent
- **playheadColor** (string): шестнадцатеричный или CSS цвет линии, представляющей playhead - по умолчанию white
- **fill** (boolean): ноты заполнены цветом (иначе отображается только метка) - по умолчанию 0
- **fillActive** (boolean): активные ноты заполнены цветом - по умолчанию 0
- **stroke** (boolean): ноты отображаются с цветными границами - по умолчанию 0
- **strokeActive** (boolean): активные ноты отображаются с цветными границами - по умолчанию 0
- **hideInactive** (boolean): отображаются только активные ноты - по умолчанию 0
- **colorizeInactive** (boolean): использовать цвет ноты для неактивных нот - по умолчанию 1
- **fontFamily** (string): определяет шрифт, используемый для меток нот - по умолчанию 'monospace'
- **minMidi** (integer): минимальное значение ноты для отображения на оси значений - по умолчанию 10
- **maxMidi** (integer): максимальное значение ноты для отображения на оси значений - по умолчанию 90
- **autorange** (boolean): автоматически вычисляет параметры minMidi и maxMidi - по умолчанию 0

**Описание:** Визуализирует pattern в виде прокручивающегося 'pianoroll', отображаемого на фоне редактора. Чтобы показать pianoroll для всех выполняющихся pattern, используйте <code>all(pianoroll)</code>. Чтобы pianoroll появился под
pattern вместо этого, добавьте префикс <code>_</code>, например: <code>sound(&quot;bd sd&quot;)._pianoroll()</code>.

**Примеры:**

```javascript
note("c2 a2 eb2")
.euclid(5,8)
.s('sawtooth')
.lpenv(4).lpf(300)
.pianoroll({ labels: 1 })
```

---

## pick

**Параметры:**

- **pat** (Pattern): 
- **xs** (*): 

**Описание:** Выбирает patterns (или простые значения) либо из списка (по индексу), либо из таблицы поиска (по имени).
Похож на <code>inhabit</code>, но сохраняет структуру исходных patterns.

**Примеры:**

```javascript
note("<0 1 2!2 3>".pick(["g a", "e f", "f g f g" , "g c d"]))
```

```javascript
sound("<0 1 [2,0]>".pick(["bd sd", "cp cp", "hh hh"]))
```

```javascript
sound("<0!2 [0,1] 1>".pick(["bd(3,8)", "sd sd"]))
```

```javascript
s("<a!2 [a,b] b>".pick({a: "bd(3,8)", b: "sd sd"}))
```

---

## pickF

**Параметры:**

- **pat** (Pattern): 
- **lookup** (Pattern): pattern индексов
- **funcs** (Array.<function()>): массив функций, из которых нужно выбирать

**Описание:** pickF позволяет использовать pattern чисел для выбора функции, которую нужно применить к другому pattern.

**Примеры:**

```javascript
s("bd [rim hh]").pickF("<0 1 2>", [rev,jux(rev),fast(2)])
```

```javascript
note("<c2 d2>(3,8)").s("square")
    .pickF("<0 2> 1", [jux(rev),fast(2),x=>x.lpf(800)])
```

---

## pickmod

**Параметры:**

- **pat** (Pattern): 
- **xs** (*): 

**Описание:** То же самое, что <code>pick</code>, но если вы выбираете число больше размера списка,
оно зацикливается, вместо того чтобы остановиться на максимальном значении.
Например, если вы выбираете пятый pattern из списка из трех, вы получите
второй.

---

## pickReset

**Параметры:**

- **pat** (Pattern): 
- **xs** (*): 

**Описание:** Похож на <code>pick</code>, но выбранный pattern сбрасывается, когда активируется его индекс.

---

## pickRestart

**Параметры:**

- **pat** (Pattern): 
- **xs** (*): 

**Описание:** Похож на <code>pick</code>, но выбранный pattern перезапускается, когда активируется его индекс.

---

## polymeter

**Синонимы:** pm

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Aligns the steps of the patterns, creating polymeters. The patterns are repeated until they all fit the cycle. For example, in the below the first pattern is repeated twice, and the second is repeated three times, to fit the lowest common multiple of six steps.

**Примеры:**

```javascript
// The same as note("{c eb g, c2 g2}%6")
polymeter("c eb g", "c2 g2").note()
```

---

## pure

**Параметры:**

Нет параметров

**Описание:** Дискретное значение, которое повторяется один раз за цикл.

**Примеры:**

```javascript
pure('e4') // "e4"
```

---

## queryArc

**Параметры:**

- **begin** (Fraction | number): время начала
- **end** (Fraction | number): время окончания

**Описание:** Запрашивает haps внутри заданного временного промежутка.

**Примеры:**

```javascript
const pattern = sequence('a', ['b', 'c'])
const haps = pattern.queryArc(0, 1)
console.log(haps)
silence
```

---

## range

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern, содержащий униполярные значения в диапазоне 0 .. 1.
Возвращает новый pattern со значениями, масштабированными в заданный диапазон min/max.
Наиболее полезно в сочетании с непрерывными patterns.

**Примеры:**

```javascript
s("[bd sd]*2,hh*8")
.cutoff(sine.range(500,4000))
```

---

## range2

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern, содержащий биполярные значения в диапазоне -1 .. 1
Возвращает новый pattern со значениями, масштабированными в заданный диапазон min/max.

**Примеры:**

```javascript
s("[bd sd]*2,hh*8")
.cutoff(sine2.range2(500,4000))
```

---

## rangex

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern, содержащий униполярные значения в диапазоне 0 .. 1
Возвращает новый pattern со значениями, масштабированными в заданный диапазон min/max,
следуя экспоненциальной кривой.

**Примеры:**

```javascript
s("[bd sd]*2,hh*8")
.cutoff(sine.rangex(500,4000))
```

---

## ref

**Параметры:**

Нет параметров

**Описание:** exposes a custom value at query time. basically allows mutating state without evaluation

---

## register

**Параметры:**

- **name** (string | Array.<string>): имя функции или массив имён для использования в качестве синонимов
- **func** (function): функция с 1 или более параметрами, где последний - текущий pattern

**Описание:** Регистрирует новый метод pattern. Метод добавляется в класс Pattern + отдельная функция возвращается из register.

---

## removeUndefineds

**Параметры:**

Нет параметров

**Описание:** Возвращает новый pattern с удалёнными из результатов запроса
haps, содержащими undefined значения.

---

## repeatCycles

**Параметры:**

Нет параметров

**Описание:** Repeats each cycle the given number of times.

**Примеры:**

```javascript
note(irand(12).add(34)).segment(4).repeatCycles(2).s("gm_acoustic_guitar_nylon")
```

---

## replicate

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
<code>replicate</code> is similar to <code>fast</code> in that it increases its density, but it also increases the step count
accordingly. So <code>stepcat(&quot;a b&quot;.replicate(2), &quot;c d&quot;)</code> would be the same as <code>&quot;a b a b c d&quot;</code>, whereas
<code>stepcat(&quot;a b&quot;.fast(2), &quot;c d&quot;)</code> would be the same as <code>&quot;[a b] [a b] c d&quot;</code>.
TODO: find out how this function differs from extend

**Примеры:**

```javascript
stepcat(
  sound("bd bd - cp").replicate(2),
  sound("bd - sd -")
).pace(8)
```

---

## reset

**Параметры:**

Нет параметров

**Описание:** Сбрасывает pattern к началу цикла для каждого onset pattern сброса.

**Примеры:**

```javascript
s("[<bd lt> sd]*2, hh*8").reset("<x@3 x(5,8)>")
```

---

## restart

**Параметры:**

Нет параметров

**Описание:** Перезапускает pattern для каждого onset pattern перезапуска.
В то время как reset сбросит только текущий цикл, restart начнёт с цикла 0.

**Примеры:**

```javascript
s("[<bd lt> sd]*2, hh*8").restart("<x@3 x(5,8)>")
```

---

## rev

**Параметры:**

Нет параметров

**Описание:** Реверсирует все циклы в pattern. См. также <code>revv</code> для реверсирования всего pattern.

**Примеры:**

```javascript
note("c d e g").rev()
```

---

## revv

**Параметры:**

Нет параметров

**Описание:** Реверсирует весь pattern. См. также <code>rev</code> для реверсирования каждого цикла.

**Примеры:**

```javascript
// Это то же самое, что `<[g e] [d c]>`. Если используется `rev()`, вы получите
// то же, что `<[d c] [g e]>`, где каждый цикл реверсируется, но порядок
// циклов остаётся прежним.
note("<[c d] [e g]>").revv()
```

---

## ribbon

**Синонимы:** rib

**Параметры:**

- **offset** (number): start point of loop in cycles
- **cycles** (number): loop length in cycles

**Описание:** Loops the pattern inside an <code>offset</code> for <code>cycles</code>.
If you think of the entire span of time in cycles as a ribbon, you can cut a single piece and loop it.

**Примеры:**

```javascript
note("<c d e f>").ribbon(1, 2)
```

```javascript
// Looping a portion of randomness
n(irand(8).segment(4)).scale("c:pentatonic").ribbon(1337, 2)
```

```javascript
// rhythm generator
s("bd!16?").ribbon(29,.5)
```

---

## rootNotes

**Параметры:**

- **octave** (octave): октава для использования

**Описание:** Отображает chord входящего pattern на основные ноты в заданной октаве.

**Примеры:**

```javascript
"<C^7 A7 Dm7 G7>".rootNotes(2).note()
```

---

## round

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern. Возвращает новый pattern со всеми значениями, округлёнными
до ближайшего целого.

**Примеры:**

```javascript
n("0.5 1.5 2.5".round()).scale("C:major")
```

---

## run

**Параметры:**

Нет параметров

**Описание:** Дискретный pattern чисел от 0 до n-1

**Примеры:**

```javascript
n(run(4)).scale("C4:pentatonic")
// n("0 1 2 3").scale("C4:pentatonic")
```

---

## scale

**Параметры:**

- **scale** (string): Название scale

**Описание:** Преобразует числа в ноты в scale (с нулевой индексацией) или квантизует ноты к scale.
При описании нот через числа обратите внимание, что отрицательные числа могут использоваться для
движения назад по scale, а также диезы или бемоли для получения нот вне scale.
Также устанавливает scale для других операций со scale, таких как {@link Pattern#scaleTranspose}.
Scale состоит из основной ноты (например, <code>c4</code>, <code>c</code>, <code>f#</code>, <code>bb4</code>), за которой следует двоеточие (':'), а затем <a href="https://github.com/tonaljs/tonal/blob/main/packages/scale-type/data.ts">тип scale</a>.
Название scale должно быть написано без пробелов (потому что иначе оно будет интерпретировано как многошаговый pattern).
Если название вашей scale содержит пробелы, замените их на двоеточия.
Основная нота по умолчанию находится в октаве 3, если номер октавы не указан.

**Примеры:**

```javascript
n("0 2 4 6 4 2").scale("C:major")
```

```javascript
n("[0,7] 4 [2,7] 4")
.scale("C:<major minor>/2")
.s("piano")
```

```javascript
n(rand.range(0,12).segment(8))
.scale("C:ritusen")
.s("piano")
```

```javascript
n("<[0,7b] [-4# -4] [-2,7##] 4 [0,7] [-4# -4b] [-2,7###] 4b>*4")
.scale("C:<major minor>/2")
.s("piano")
```

```javascript
note("C1*16").transpose(irand(36)).scale('Cb2 major').scaleTranspose(3)
```

```javascript
n("[0 0] [1 2] [3 4] [5 6]").scale("C:major:blues")
```

---

## scaleTranspose

**Синонимы:** scaleTrans, strans

**Параметры:**

- **offset** (offset): количество ступеней внутри scale

**Описание:** Транспонирует ноты внутри scale на заданное количество ступеней.
Ожидается вызов на Pattern, который уже имеет {@link Pattern#scale}

**Примеры:**

```javascript
"-8 [2,4,6]"
.scale('C4 bebop major')
.scaleTranspose("<0 -1 -2 -3 -4 -5 -6 -4>")
.note()
```

---

## segment

**Синонимы:** seg

**Параметры:**

- **segments** (number): количество сегментов за цикл

**Описание:** Семплирует pattern со скоростью n событий за цикл. Полезно для преобразования непрерывного pattern в дискретный.

**Примеры:**

```javascript
note(saw.range(40,52).segment(24))
```

---

## seq

**Синонимы:** sequence, fastcat

**Параметры:**

Нет параметров

**Описание:** Как <strong>cat</strong>, но элементы втиснуты в один цикл.

**Примеры:**

```javascript
seq("e5", "b4", ["d5", "c5"]).note()
// "e5 b4 [d5 c5]".note()
```

```javascript
// Как цепная функция:
s("hh*4").seq(
  note("c4(5,8)")
)
```

---

## seqPLoop

**Параметры:**

Нет параметров

**Описание:** Подобно <code>arrange</code>, позволяет располагать несколько patterns вместе на протяжении нескольких циклов.
В отличие от <code>arrange</code>, вы указываете время начала и остановки для каждого pattern, а не длительность, что
означает, что patterns могут перекрываться.

**Примеры:**

```javascript
seqPLoop([0, 2, "bd(3,8)"],
         [1, 3, "cp(3,8)"]
        )
  .sound()
```

---

## sequence

**Параметры:**

Нет параметров

**Описание:** See <code>fastcat</code>

---

## sequenceP

**Параметры:**

Нет параметров

**Описание:** Takes a list of patterns, and returns a pattern of lists.

---

## setContext

**Параметры:**

- **context** (*): 

**Описание:** Возвращает новый pattern с полем context, установленным для каждого hap в заданное значение.

---

## showFirstCycle

**Параметры:**

Нет параметров

**Описание:** Более читаемая версия аксессора <code>firstCycleValues</code>.

---

## shrink

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Progressively shrinks the pattern by 'n' steps until there's nothing left, or if a second value is given (using mininotation list syntax with <code>:</code>),
that number of times.
A positive number will progressively drop steps from the start of a pattern, and a negative number from the end.

**Примеры:**

```javascript
"tha dhi thom nam".shrink("1").sound()
.bank("mridangam")
```

```javascript
"tha dhi thom nam".shrink("-1").sound()
.bank("mridangam")
```

```javascript
"tha dhi thom nam".shrink("1 -1").sound().bank("mridangam").pace(4)
```

```javascript
note("0 1 2 3 4 5 6 7".scale("C:ritusen")).sound("folkharp")
   .shrink("1 -1").pace(8)
```

---

## silence

**Параметры:**

Нет параметров

**Описание:** Абсолютно ничего не делает..

**Примеры:**

```javascript
silence // "~"
```

---

## slice

**Параметры:**

Нет параметров

**Описание:** Chops samples into the given number of slices, triggering those slices with a given pattern of slice numbers.
Instead of a number, it also accepts a list of numbers from 0 to 1 to slice at specific points.

**Примеры:**

```javascript
samples('github:tidalcycles/dirt-samples')
s("breaks165").slice(8, "0 1 <2 2*2> 3 [4 0] 5 6 7".every(3, rev)).slow(0.75)
```

```javascript
samples('github:tidalcycles/dirt-samples')
s("breaks125").fit().slice([0,.25,.5,.75], "0 1 1 <2 3>")
```

---

## slowcat

**Синонимы:** cat

**Параметры:**

Нет параметров

**Описание:** Конкатенация: объединяет список patterns, последовательно переключаясь между ними, один за цикл.

**Примеры:**

```javascript
slowcat("e5", "b4", ["d5", "c5"])
```

---

## slowcatPrime

**Параметры:**

- **items** (any): Элементы для конкатенации

**Описание:** Конкатенация: объединяет список patterns, последовательно переключаясь между ними, один за цикл. В отличие от slowcat, эта версия пропускает циклы.

---

## soft

**Параметры:**

- **distortion** (number | Pattern): amount of distortion to apply
- **volume** (number | Pattern): linear postgain of the distortion

**Описание:** Soft-clipping distortion

---

## sortHapsByPart

**Параметры:**

Нет параметров

**Описание:** Возвращает новый pattern, который возвращает haps, отсортированные во временном порядке. В основном
используется при сравнении двух patterns на равенство в тестах.

---

## splice

**Параметры:**

Нет параметров

**Описание:** Works the same as slice, but changes the playback speed of each slice to match the duration of its step.

**Примеры:**

```javascript
samples('github:tidalcycles/dirt-samples')
s("breaks165")
.splice(8,  "0 1 [2 3 0]@2 3 0@2 7")
```

---

## splitQueries

**Параметры:**

Нет параметров

**Описание:** Возвращает новый pattern, где запросы разделены на границах циклов. Это делает
некоторые вычисления более простыми для выражения, так как все haps затем ограничены
происходящими внутри цикла.

---

## squeeze

**Параметры:**

- **pat** (Pattern): 
- **xs** (*): 

**Описание:** Выбирает из списка значений (или patterns значений) по индексу, используя заданный
pattern целых чисел. Выбранный pattern будет сжат, чтобы соответствовать длительности выбирающего события

**Примеры:**

```javascript
note(squeeze("<0@2 [1!2] 2>", ["g a", "f g f g" , "g a c d"]))
```

---

## stack

**Синонимы:** polyrhythm, pr

**Параметры:**

Нет параметров

**Описание:** Заданные элементы воспроизводятся одновременно с одинаковой длительностью.

**Примеры:**

```javascript
stack("g3", "b3", ["e4", "d4"]).note()
// "g3,b3,[e4 d4]".note()
```

```javascript
// Как цепная функция:
s("hh*4").stack(
  note("c4(5,8)")
)
```

---

## stepalt

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Concatenates patterns stepwise, according to an inferred 'steps per cycle'.
Similar to <code>stepcat</code>, but if an argument is a list, the whole pattern will alternate between the elements in the list.

**Примеры:**

```javascript
stepalt(["bd cp", "mt"], "bd").sound()
// The same as "bd cp bd mt bd".sound()
```

---

## stepcat

**Синонимы:** timeCat, timecat

**Параметры:**

Нет параметров

**Описание:** 'Concatenates' patterns like <code>fastcat</code>, but proportional to a number of steps per cycle.
The steps can either be inferred from the pattern, or provided as a [length, pattern] pair.
Has the alias <code>timecat</code>.

**Примеры:**

```javascript
stepcat([3,"e3"],[1, "g3"]).note()
// the same as "e3@3 g3".note()
```

```javascript
stepcat("bd sd cp","hh hh").sound()
// the same as "bd sd cp hh hh".sound()
```

---

## striate

**Параметры:**

Нет параметров

**Описание:** Cuts each sample into the given number of parts, triggering progressive portions of each sample at each loop.

**Примеры:**

```javascript
s("numbers:0 numbers:1 numbers:2").striate(6).slow(3)
```

---

## stripContext

**Параметры:**

Нет параметров

**Описание:** Возвращает новый pattern с полем context каждого hap, установленным в пустой объект.

---

## struct

**Параметры:**

Нет параметров

**Описание:** Применяет заданную структуру к pattern:

**Примеры:**

```javascript
note("c,eb,g")
  .struct("x ~ x ~ ~ x ~ x ~ ~ ~ x ~ x ~ ~")
  .slow(2)
```

---

## stut

**Параметры:**

- **times** (number): сколько раз повторять
- **feedback** (number): множитель громкости для каждой итерации
- **time** (number): смещение цикла между итерациями

**Описание:** Устарело. Как echo, но последние 2 параметра поменяны местами.

**Примеры:**

```javascript
s("bd sd").stut(3, .8, 1/6)
```

---

## sub

**Параметры:**

Нет параметров

**Описание:** Как add, но заданные числа вычитаются.

**Примеры:**

```javascript
n("0 2 4".sub("<0 1 2 3>")).scale("C4:minor")
// См. add для получения дополнительной информации.
```

---

## superimpose

**Параметры:**

Нет параметров

**Описание:** Накладывает результат заданной функции (функций) поверх оригинального pattern:

**Примеры:**

```javascript
"<0 2 4 6 ~ 4 ~ 2 0!3 ~!5>*8"
  .superimpose(x=>x.add(2))
  .scale('C minor').note()
```

---

## tag

**Параметры:**

- **tag** (string): anything unique

**Описание:** Tags each Hap with an identifier. Good for filtering. The function populates Hap.context.tags (Array).

---

## take

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Takes the given number of steps from a pattern (dropping the rest).
A positive number will take steps from the start of a pattern, and a negative number from the end.

**Примеры:**

```javascript
"bd cp ht mt".take("2").sound()
// The same as "bd cp".sound()
```

```javascript
"bd cp ht mt".take("1 2 3").sound()
// The same as "bd bd cp bd cp ht".sound()
```

```javascript
"bd cp ht mt".take("-1 -2 -3").sound()
// The same as "mt ht mt cp ht mt".sound()
```

---

## toBipolar

**Параметры:**

Нет параметров

**Описание:** Предполагается числовой pattern, содержащий униполярные значения в диапазоне 0 ..
<ol>
<li>Возвращает новый pattern со значениями, масштабированными в биполярный диапазон -1 .. 1</li>
</ol>

---

## tour

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
Inserts a pattern into a list of patterns. On the first repetition it will be inserted at the end of the list, then moved backwards through the list
on successive repetitions. The patterns are added together stepwise, with all repetitions taking place over a single cycle. Using <code>pace</code> to set the
number of steps per cycle is therefore usually recommended.

**Примеры:**

```javascript
"[c g]".tour("e f", "e f g", "g f e c").note()
   .sound("folkharp")
   .pace(8)
```

---

## voicing

**Параметры:**

Нет параметров

**Описание:** Преобразует символы chord в voicing. Вы можете использовать следующие параметры управления:
<ul>
<li><code>chord</code>: нота, за которой следует символ chord, например C Am G7 Bb^7</li>
<li><code>dict</code>: словарь voicing для использования, по умолчанию используется словарь по умолчанию</li>
<li><code>anchor</code>: нота, которая используется для выравнивания chord</li>
<li><code>mode</code>: как voicing выравнивается относительно anchor
<ul>
<li><code>below</code>: верхняя нота &lt;= anchor</li>
<li><code>duck</code>: верхняя нота &lt;= anchor, anchor исключается</li>
<li><code>above</code>: нижняя нота &gt;= anchor</li>
</ul>
</li>
<li><code>offset</code>: целое число, которое сдвигает voicing вверх или вниз к следующему voicing</li>
<li><code>n</code>: если установлено, voicing играется как scale. Выходящие за пределы числа будут октавированы</li>
</ul>
Все вышеперечисленные параметры являются необязательными, кроме <code>chord</code>.
Если вы передаете pattern строк в voicing, они будут интерпретированы как chord.

**Примеры:**

```javascript
n("0 1 2 3").chord("<C Am F G>").voicing()
```

---

## when

**Параметры:**

- **binary_pat** (Pattern): 
- **func** (function): 

**Описание:** Применяет заданную функцию всякий раз, когда заданный pattern находится в истинном состоянии.

**Примеры:**

```javascript
"c3 eb3 g3".when("<0 1>/2", x=>x.sub("5")).note()
```

---

## withContext

**Параметры:**

- **func** (function): 

**Описание:** Возвращает новый pattern с заданной функцией, применённой к полю context каждого hap.

---

## withHap

**Параметры:**

- **func** (function): 

**Описание:** Как и <code>withHaps</code>, но применяет функцию к каждому hap, а не к каждому списку haps.

---

## withHaps

**Параметры:**

- **func** (function): 

**Описание:** Возвращает новый pattern с заданной функцией, применённой к списку haps, возвращаемых каждым запросом.

---

## withHapSpan

**Параметры:**

- **func** (function): 

**Описание:** Похоже на <code>withQuerySpan</code>, но функция применяется к timespans
всех haps, возвращаемых запросами pattern (как к <code>part</code> timespans, так и, при наличии,
к <code>whole</code> timespans).

---

## withHapTime

**Параметры:**

- **func** (function): функция для применения

**Описание:** Как и <code>withHapSpan</code>, но функция применяется к времени
начала и окончания timespans hap.

---

## within

**Параметры:**

- **start** (number): start within cycle (0 - 1)
- **end** (number): end within cycle (0 - 1). Must be &gt; start
- **func** (function): function to be applied to the sub-pattern

**Описание:** Use within to apply a function to only a part of a pattern.

---

## withLoc

**Параметры:**

- **start** (Number): начальное смещение
- **end** (Number): конечное смещение

**Описание:** Возвращает новый pattern с добавленной заданной информацией о расположении к
context каждого hap.

---

## withQuerySpan

**Параметры:**

- **func** (function): функция для применения

**Описание:** Возвращает новый pattern, где заданная функция применяется к
timespan запроса перед передачей его в исходный pattern.

---

## withQueryTime

**Параметры:**

- **func** (function): функция для применения

**Описание:** Как и <code>withQuerySpan</code>, но функция применяется к времени
начала и окончания timespan запроса.

---

## withValue

**Синонимы:** fmap

**Параметры:**

- **func** (function): функция для применения к значению

**Описание:** Возвращает новый pattern, где функция применена к значению
каждого hap. Имеет синоним <code>fmap</code>.

**Примеры:**

```javascript
"0 1 2".withValue(v => v + 10).log()
```

---

## xfade

**Параметры:**

Нет параметров

**Описание:** Cross-fades between left and right from 0 to 1:
<ul>
<li>0 = (full left, no right)</li>
<li>.5 = (both equal)</li>
<li>1 = (no left, full right)</li>
</ul>

**Примеры:**

```javascript
xfade(s("bd*2"), "<0 .25 .5 .75 1>", s("hh*8"))
```

---

## zip

**Параметры:**

Нет параметров

**Описание:** <em>Experimental</em>
'zips' together the steps of the provided patterns. This can create a long repetition, taking place over a single, dense cycle.
Using <code>pace</code> to set the number of steps per cycle is therefore usually recommended.

**Примеры:**

```javascript
zip("e f", "e f g", "g [f e] a f4 c").note()
   .sound("folkharp")
   .pace(8)
```

---

