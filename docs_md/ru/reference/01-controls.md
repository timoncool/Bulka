# Управление звуком

Всего функций: 133

---

## accelerate

**Параметры:**

- **amount** (number | Pattern): ускорение.

**Описание:** Pattern чисел, которые ускоряют (или замедляют) sample во время воспроизведения. В настоящее время поддерживается только в osc / superdirt.

**Примеры:**

```javascript
s("sax").accelerate("<0 1 2 4 8 16>").slow(2).osc()
```

---

## adsr

**Параметры:**

- **time** (number | Pattern): время attack в секундах
- **time** (number | Pattern): время decay в секундах
- **gain** (number | Pattern): уровень sustain (от 0 до 1)
- **time** (number | Pattern): время release в секундах

**Описание:** ADSR envelope: Комбинация Attack, Decay, Sustain и Release.

**Примеры:**

```javascript
note("[c3 bb2 f3 eb3]*2").sound("sawtooth").lpf(600).adsr(".1:.1:.5:.2")
```

---

## amp

**Параметры:**

- **amount** (number | Pattern): громкость.

**Описание:** Как <code>gain</code>, но линейный.

**Примеры:**

```javascript
s("bd*8").amp(".1*2 .5 .1*2 .5 .1 .5").osc()
```

---

## anchor

**Параметры:**

- **anchorNote** (string | Pattern): нота для выравнивания озвучивания

**Описание:** Верхняя нота для выравнивания озвучивания. По умолчанию c5

**Примеры:**

```javascript
anchor("<c4 g4 c5 g5>").chord("C").voicing()
```

---

## as

**Параметры:**

- **mapping** (String | Array): названия контроллеров, которые устанавливаются

**Описание:** Устанавливает свойства в пакетном режиме.

**Примеры:**

```javascript
"c:.5 a:1 f:.25 e:.8".as("note:clip")
```

```javascript
"{0@2 0.25 0 0.5 .3 .5}%8".as("begin").s("sax_vib").clip(1)
```

---

## attack

**Синонимы:** att

**Параметры:**

- **attack** (number | Pattern): время в секундах.

**Описание:** Время attack амплитудного envelope: Определяет, сколько времени требуется звуку для достижения пикового значения относительно начала.

**Примеры:**

```javascript
note("c3 e3 f3 g3").attack("<0 .1 .5>")
```

---

## attack

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## bank

**Параметры:**

- **bank** (string | Pattern): имя банка

**Описание:** Выбирает банк звуков для использования. Используется вместе с <code>s</code>. Имя банка (+ &quot;_&quot;) будет добавлено к значению <code>s</code>.

**Примеры:**

```javascript
s("bd sd [~ bd] sd").bank('RolandTR909') // = s("RolandTR909_bd RolandTR909_sd")
```

---

## begin

**Параметры:**

- **amount** (number | Pattern): от 0 до 1, где 1 это длина sample

**Описание:** Pattern чисел от 0 до 1. Пропускает начало каждого sample, например, <code>0.25</code> обрезает первую четверть каждого sample.

**Примеры:**

```javascript
samples({ rave: 'rave/AREUREADY.wav' }, 'github:tidalcycles/dirt-samples')
s("rave").begin("<0 .25 .5 .75>").fast(2)
```

---

## bpdc

**Параметры:**

- **dcoffset** (number | Pattern): dc смещение. установите 0 для unipolar

**Описание:** DC смещение LFO для bandpass filter

---

## bpdepth

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для bandpass filter

---

## bpdepthfrequency

**Синонимы:** bpdethfreq

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для bandpass filter, в Гц

**Примеры:**

```javascript
note("<c c c# c c c4>*16").s("sawtooth").lpf(600).bpdepthfrequency("<200 500 100 0>")
```

---

## bprate

**Параметры:**

- **rate** (number | Pattern): частота в герцах

**Описание:** Частота LFO для bandpass filter

---

## bpshape

**Параметры:**

- **shape** (number | Pattern): Форма lfo (0, 1, 2, ..)

**Описание:** Форма LFO для bandpass filter

---

## bpskew

**Параметры:**

- **skew** (number | Pattern): Насколько изгибать форму LFO

**Описание:** Искривление LFO для bandpass filter

---

## bpsync

**Параметры:**

- **rate** (number | Pattern): частота в циклах

**Описание:** Синхронизированная с циклом частота LFO для bandpass filter

---

## byteBeatExpression

**Синонимы:** bbexpr

**Параметры:**

- **byteBeatExpression** (number | Pattern): побитовое выражение для создания bytebeat

**Описание:** Создаёт byte beat с пользовательскими выражениями

**Примеры:**

```javascript
s("bytebeat").bbexpr('t*(t>>15^t>>66)')
```

---

## byteBeatStartTime

**Синонимы:** bbst

**Параметры:**

- **byteBeatStartTime** (number | Pattern): в sample (t)

**Описание:** Создаёт byte beat с пользовательскими выражениями

**Примеры:**

```javascript
note("c3!8".add("{0 0 12 0 7 5 3}%8")).s("bytebeat:5").bbst("<3 1>".mul(10000))._scope()
```

---

## ccn

**Параметры:**

- **номер** (number | Pattern): MIDI контроллера (0-127)

**Описание:** MIDI номер контроллера: Отправляет сообщение изменения MIDI контроллера.

---

## ccv

**Параметры:**

- **значение** (number | Pattern): MIDI контроллера (0-127)

**Описание:** MIDI значение контроллера: Отправляет сообщение изменения MIDI контроллера.

---

## channel

**Параметры:**

- **channel** (number | Pattern): номер канала

**Описание:** Выбирает канал, на который отправляется pattern в superdirt

---

## channels

**Синонимы:** ch

**Параметры:**

- **channels** (number | Pattern): pattern выходных каналов

**Описание:** Позволяет установить выходные каналы на интерфейсе

**Примеры:**

```javascript
note("e a d b g").channels("3:4")
```

---

## chord

**Параметры:**

- **symbols** (string | Pattern): символы аккорда для озвучивания, например, C, Eb, Fm7, G7. Символы можно определить через addVoicings

**Описание:** Аккорд для озвучивания

**Примеры:**

```javascript
chord("<Am C D F Am E Am E>").voicing()
```

---

## clip

**Синонимы:** legato

**Параметры:**

- **factor** (number | Pattern): <blockquote>
= 0
</blockquote>

**Описание:** Умножает длительность на заданное число. Также обрезает sample в конце, если они превышают длительность.

**Примеры:**

```javascript
note("c a f e").s("piano").clip("<.5 1 2>")
```

---

## color

**Синонимы:** colour

**Параметры:**

- **color** (string): Шестнадцатеричное значение или название цвета CSS

**Описание:** Устанавливает цвет hap в визуализациях, таких как pianoroll или подсветка.

---

## control

**Параметры:**

- **номер** (number | Pattern): MIDI контроллера (0-127)
- **значение** (number | Pattern): MIDI контроллера (0-127)

**Описание:** MIDI контроллер: Отправляет сообщение изменения MIDI контроллера.

---

## cut

**Параметры:**

- **group** (number | Pattern): номер группы cut

**Описание:** В стиле классических драм-машин, <code>cut</code> остановит воспроизводящийся sample, как только будет воспроизведён другой sample в той же группе cut. Примером может быть открытый хэт, за которым следует закрытый, фактически заглушая открытый.

**Примеры:**

```javascript
s("[oh hh]*4").cut(1)
```

---

## cutoff

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## decay

**Синонимы:** dec

**Параметры:**

- **time** (number | Pattern): время decay в секундах

**Описание:** Время decay амплитудного envelope: время, которое требуется после attack для достижения уровня sustain.
Обратите внимание, что decay слышен только если значение sustain меньше 1.

**Примеры:**

```javascript
note("c3 e3 f3 g3").decay("<.1 .2 .3 .4>").sustain(0)
```

---

## decay

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## density

**Параметры:**

- **density** (number | Pattern): от 0 до x

**Описание:** Плотность шума crackle

**Примеры:**

```javascript
s("crackle*4").density("<0.01 0.04 0.2 0.5>".slow(4))
```

---

## detune

**Синонимы:** det

**Параметры:**

- **amount** (number | Pattern): 

**Описание:** Устанавливает детюн для наложенных голосов поддерживаемых oscillator

**Примеры:**

```javascript
note("d f a a# a d3").fast(2).s("supersaw").detune("<.1 .2 .5 24.1>")
```

---

## dictionary

**Параметры:**

- **dictionaryName** (string): какой словарь (определённый через <code>addVoicings</code>) использовать

**Описание:** Какой словарь использовать для озвучивания. По умолчанию используется стандартный словарь, если не указан

**Примеры:**

```javascript
addVoicings('house', {
'': ['7 12 16', '0 7 16', '4 7 12'],
'm': ['0 3 7']
})
chord("<Am C D F Am E Am E>")
.dict('house').anchor(66)
.voicing().room(.5)
```

---

## drive

**Параметры:**

- **amount** (number | Pattern): 

**Описание:** Перегрузка filter для поддерживаемых типов filter

**Примеры:**

```javascript
note("{f g g c d a a#}%16".sub(17)).s("supersaw").lpenv(8).lpf(150).lpq(.8).ftype('ladder').drive("<.5 4>")
```

---

## dry

**Параметры:**

- **dry** (number | Pattern): 0 = wet, 1 = dry

**Описание:** Устанавливает сухость reverb. Смотрите <code>room</code> и <code>size</code> для дополнительной информации о reverb.

**Примеры:**

```javascript
n("[0,3,7](3,8)").s("superpiano").room(.7).dry("<0 .5 .75 1>").osc()
```

---

## duckattack

**Синонимы:** duckatt

**Параметры:**

- **time** (number | Pattern): Время attack в секундах

**Описание:** Время, необходимое для того, чтобы обработанный сигнал(ы) вернулся к нормальной громкости.
Может варьироваться между orbit с помощью ':' mininotation, например, <code>duckonset(&quot;0:0.003&quot;)</code>.
Примечание: это требует сначала применить эффект к нескольким orbit, например, <code>duckorbit(&quot;2:3&quot;)</code>.

**Примеры:**

```javascript
sound: n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2)
ducker: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack("<0.2 0 0.4>").duckdepth(1)
```

```javascript
moreduck: n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2)
lessduck: s("hh*16").orbit(5)
ducker: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:5").duckattack("0.4:0.1")
```

---

## duckdepth

**Параметры:**

- **depth** (number | Pattern): глубина модуляции от 0 до 1

**Описание:** Количество ducking, применяемое к целевому orbit
Может варьироваться между orbit с помощью ':' mininotation, например, <code>duckdepth(&quot;0.3:0.1&quot;)</code>.
Примечание: это требует сначала применить эффект к нескольким orbit, например, <code>duckorbit(&quot;2:3&quot;)</code>.

**Примеры:**

```javascript
stack( n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2), s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack(0.2).duckdepth("<1 .9 .6 0>"))
```

```javascript
$: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
$: s("hh*16").orbit(3)
$: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:3").duckattack(0.2).duckdepth("1:0.5")
```

---

## duckonset

**Синонимы:** duckons

**Параметры:**

- **time** (number | Pattern): Время начала в секундах

**Описание:** Время, необходимое для того, чтобы обработанный сигнал(ы) достиг самой низкой громкости.
Может использоваться для предотвращения щелчков или для творческих ритмических эффектов.
Может варьироваться между orbit с помощью ':' mininotation, например, <code>duckonset(&quot;0:0.003&quot;)</code>.
Примечание: это требует сначала применить эффект к нескольким orbit, например, <code>duckorbit(&quot;2:3&quot;)</code>.

**Примеры:**

```javascript
// Щелчки
sound: freq("63.2388").s("sine").orbit(2).gain(4)
duckerWithClick: s("bd*4").duckorbit(2).duckattack(0.3).duckonset(0).postgain(0)
```

```javascript
// Без щелчков
sound: freq("63.2388").s("sine").orbit(2).gain(4)
duckerWithoutClick: s("bd*4").duckorbit(2).duckattack(0.3).duckonset(0.01).postgain(0)
```

```javascript
// Ритмичный
noise: s("pink").distort("2:1").orbit(4) // используется ритмично с 0.3 onset ниже
hhat: s("hh*16").orbit(7)
ducker: s("bd*4").bank("tr909").duckorbit("4:7").duckonset("0.3:0.003").duckattack(0.25)
```

---

## duckorbit

**Синонимы:** duck

**Параметры:**

- **orbit** (number | Pattern): целевой orbit

**Описание:** Модулирует амплитуду orbit для создания эффекта типа &quot;sidechain&quot;.
Может применяться к нескольким orbit с помощью ':' mininotation, например, <code>duckorbit(&quot;2:3&quot;)</code>

**Примеры:**

```javascript
$: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
$: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack(0.2).duckdepth(1)
```

```javascript
$: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
$: s("hh*16").orbit(3)
$: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:3").duckattack(0.2).duckdepth(1)
```

---

## duration

**Синонимы:** dur

**Параметры:**

- **seconds** (number | Pattern): <blockquote>
= 0
</blockquote>

**Описание:** Устанавливает длительность события в циклах. Аналогично clip / legato, также обрезает sample в конце, если они превышают длительность.

**Примеры:**

```javascript
note("c a f e").s("piano").dur("<.5 1 2>")
```

---

## end

**Параметры:**

- **length** (number | Pattern): 1 = весь sample, .5 = половина sample, .25 = четверть sample и т.д.

**Описание:** То же, что .begin, но обрезает конец каждого sample.

**Примеры:**

```javascript
s("bd*2,oh*4").end("<.1 .2 .5 1>").fast(2)
```

---

## fanchor

**Параметры:**

- **center** (number | Pattern): от 0 до 1

**Описание:** Управляет центром envelope filter. 0 это униполярный положительный, .5 это биполярный, 1 это униполярный отрицательный

**Примеры:**

```javascript
note("{f g g c d a a#}%8").s("sawtooth").lpf("{1000}%2")
.lpenv(8).fanchor("<0 .5 1>")
```

---

## fmattack

**Синонимы:** fmatt

**Параметры:**

- **time** (number | Pattern): время attack

**Описание:** Время attack для FM envelope: время, необходимое для достижения максимальной модуляции
Можно добавить номер для управления attack envelope
любого из 8 индивидуальных FM (например, <code>fmatt5</code>)

**Примеры:**

```javascript
note("c e g b g e")
.fm(4)
.fmattack("<0 .05 .1 .2>")
._scope()
```

---

## fmattack

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## fmdecay

**Синонимы:** fmdec

**Параметры:**

- **time** (number | Pattern): время decay

**Описание:** Время decay для FM envelope: секунды до достижения уровня sustain после фазы attack.
Можно добавить номер для управления decay envelope
любого из 8 индивидуальных FM (например, <code>fmdec6</code>)

**Примеры:**

```javascript
note("c e g b g e")
.fm(4)
.fmdecay("<.01 .05 .1 .2>")
.fmsustain(.4)
._scope()
```

---

## fmdecay

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## fmenv

**Параметры:**

- **type** (number | Pattern): lin | exp

**Описание:** Тип нарастания fm envelope. Exp может работать некорректно..
Можно добавить номер для управления envelope
любого из 8 индивидуальных FM (например, <code>fmenv4</code>)

**Примеры:**

```javascript
note("c e g b g e")
.fm(4)
.fmdecay(.2)
.fmsustain(0)
.fmenv("<exp lin>")
._scope()
```

---

## fmh

**Параметры:**

- **harmonicity** (number | Pattern): 

**Описание:** Устанавливает коэффициент гармоничности частотной модуляции.
Управляет тембром звука.
Целые числа и простые соотношения звучат более естественно,
тогда как десятичные числа и сложные соотношения звучат металлически.
Можно добавить номер для управления гармоничностью
любого из 8 индивидуальных FM (например, <code>fmh2</code>)

**Примеры:**

```javascript
note("c e g b g e")
.fm(4)
.fmh("<1 2 1.5 1.61>")
._scope()
```

---

## fmh

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## fmi

**Синонимы:** fm

**Параметры:**

- **brightness** (number | Pattern): индекс модуляции

**Описание:** Устанавливает частотную модуляцию синтезатора.
Управляет индексом модуляции, который определяет яркость звука.
Можно добавить номер для управления индексом модуляции
любого из 8 индивидуальных FM (например, <code>fm3</code>). Также FM могут маршрутизироваться друг в друга
с помощью матричных команд типа <code>fm13</code>, которая отправит <code>fm1</code> обратно в
<code>fm3</code>

**Примеры:**

```javascript
note("c e g b g e")
.fm("<0 1 2 8 32>")
._scope()
```

```javascript
s("sine").note("F1").seg(8)
 .fm(4).fm2(rand.mul(4)).fm3(saw.mul(8).slow(8))
 .fmh(1.06).fmh2(10).fmh3(0.1)
```

---

## fmi

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## fmrelease

**Синонимы:** fmrel

**Параметры:**

- **time** (number | Pattern): время release

**Описание:** Время release для FM envelope: какая модуляция применяется после отпускания ноты
Можно добавить номер для управления release envelope
любого из 8 индивидуальных FM (например, <code>fmrel8</code>)

---

## fmrelease

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## fmsustain

**Синонимы:** fmsus

**Параметры:**

- **level** (number | Pattern): уровень sustain

**Описание:** Уровень sustain для FM envelope: какая модуляция применяется после фазы decay
Можно добавить номер для управления sustain envelope
любого из 8 индивидуальных FM (например, <code>fmsus7</code>)

**Примеры:**

```javascript
note("c e g b g e")
.fm(4)
.fmdecay(.1)
.fmsustain("<1 .75 .5 0>")
._scope()
```

---

## fmsustain

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## fmwave

**Параметры:**

- **wave** (number | Pattern): форма волны

**Описание:** Форма волны fm модулятора
Можно добавить номер для управления формой волны
любого из 8 индивидуальных FM (например, <code>fmwave6</code>)

**Примеры:**

```javascript
n("0 1 2 3".fast(4)).scale("d:minor").s("sine").fmwave("<sine square sawtooth crackle>").fm(4).fmh(2.01)
```

```javascript
n("0 1 2 3".fast(4)).chord("<Dm Am F G>").voicing().s("sawtooth").fmwave("brown").fm(.6)
```

---

## freq

**Параметры:**

- **frequency** (number | Pattern): в Гц. Слышимый диапазон от 20 до 20000 Гц

**Описание:** Устанавливает частоту звука.

**Примеры:**

```javascript
freq("220 110 440 110").s("superzow").osc()
```

```javascript
freq("110".mul.out(".5 1.5 .6 [2 3]")).s("superzow").osc()
```

---

## freq

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## ftype

**Параметры:**

- **type** (number | Pattern): 12db (0), ladder (1), или 24db (2)

**Описание:** Устанавливает тип filter. Ladder filter более агрессивный. В будущем могут быть добавлены другие типы.

**Примеры:**

```javascript
note("{f g g c d a a#}%8").s("sawtooth").lpenv(4).lpf(500).ftype("<0 1 2>").lpq(1)
```

```javascript
note("c f g g a c d4").fast(2)
.sound('sawtooth')
.lpf(200).fanchor(0)
.lpenv(3).lpq(1)
.ftype("<ladder 12db 24db>")
```

---

## gain

**Параметры:**

- **amount** (number | Pattern): громкость.

**Описание:** Управляет gain экспоненциальным образом.

**Примеры:**

```javascript
s("hh*8").gain(".4!2 1 .4!2 1 .4 1").fast(2)
```

---

## hpdc

**Параметры:**

- **dcoffset** (number | Pattern): dc смещение. установите 0 для unipolar

**Описание:** DC смещение LFO для highpass filter

---

## hpdepth

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для highpass filter

---

## hpdepthfrequency

**Синонимы:** hpdethfreq

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для highpass filter, в Гц

**Примеры:**

```javascript
note("<c c c# c c c4>*16").s("sawtooth").lpf(600).hpdepthfrequency("<200 500 100 0>")
```

---

## hprate

**Параметры:**

- **rate** (number | Pattern): частота в герцах

**Описание:** Частота LFO для highpass filter

---

## hpshape

**Параметры:**

- **shape** (number | Pattern): Форма lfo (0, 1, 2, ..)

**Описание:** Форма LFO для highpass filter

---

## hpskew

**Параметры:**

- **skew** (number | Pattern): Насколько изгибать форму LFO

**Описание:** Искривление LFO для highpass filter

---

## hpsync

**Параметры:**

- **rate** (number | Pattern): частота в циклах

**Описание:** Синхронизированная с циклом частота LFO для highpass filter

---

## irbegin

**Синонимы:** ir

**Параметры:**

- **begin** (string | Pattern): от 0 до 1

**Описание:** Устанавливает начальную позицию sample импульсной характеристики

**Примеры:**

```javascript
samples('github:switchangel/pad')
$: s("brk/2").fit().scrub(irand(16).div(16).seg(8)).ir("swpad:4").room(.65).irspeed("-2").irbegin("<0 .5 .75>/2").roomsize(.6)
```

---

## iresponse

**Синонимы:** ir

**Параметры:**

- **sample** (string | Pattern): для использования в качестве импульсной характеристики

**Описание:** Устанавливает sample для использования в качестве импульсной характеристики для reverb.

**Примеры:**

```javascript
s("bd sd [~ bd] sd").room(.8).ir("<shaker_large:0 shaker_large:2>")
```

---

## irspeed

**Параметры:**

- **speed** (string | Pattern): 

**Описание:** Устанавливает скорость sample для импульсной характеристики.

**Примеры:**

```javascript
samples('github:switchangel/pad')
$: s("brk/2").fit().scrub(irand(16).div(16).seg(8)).ir("swpad:4").room(.2).irspeed("<2 1 .5>/2").irbegin(.5).roomsize(.5)
```

---

## label

**Параметры:**

- **label** (string): текст для отображения

**Описание:** Устанавливает отображаемый текст для события на pianoroll

---

## lock

**Параметры:**

- **enable** (number | Pattern): Когда установлено в 1, delaytime является прямым кратным цикла.

**Описание:** Указывает, рассчитывается ли delaytime относительно cps.

**Примеры:**

```javascript
s("sd").delay().lock(1).osc()
```

---

## loop

**Параметры:**

- **on** (number | Pattern): Если 1, sample зациклен

**Описание:** Зацикливает sample.
Обратите внимание, что темп loop не синхронизирован с темпом цикла.
Для изменения области loop используйте loopBegin / loopEnd.

**Примеры:**

```javascript
s("casio").loop(1)
```

---

## loopAt

**Параметры:**

Нет параметров

**Описание:** Makes the sample fit the given number of cycles by changing the speed.

**Примеры:**

```javascript
samples({ rhodes: 'https://cdn.freesound.org/previews/132/132051_316502-lq.mp3' })
s("rhodes").loopAt(2)
```

---

## loopAtCps

**Параметры:**

Нет параметров

**Описание:** Makes the sample fit the given number of cycles and cps value, by
changing the speed. Please note that at some point cps will be
given by a global clock and this function will be
deprecated/removed.

**Примеры:**

```javascript
samples({ rhodes: 'https://cdn.freesound.org/previews/132/132051_316502-lq.mp3' })
s("rhodes").loopAtCps(4,1.5).cps(1.5)
```

---

## loopBegin

**Синонимы:** loopb

**Параметры:**

- **time** (number | Pattern): от 0 до 1, где 1 это длина sample

**Описание:** Начинает loop в определённой точке sample (между <code>begin</code> и <code>end</code>).
Обратите внимание, что точка loop должна находиться между <code>begin</code> и <code>end</code>, и перед <code>loopEnd</code>!
Примечание: Sample, начинающиеся с wt_, автоматически зацикливаются! (wt = wavetable)

**Примеры:**

```javascript
s("space").loop(1)
.loopBegin("<0 .125 .25>")._scope()
```

---

## loopEnd

**Синонимы:** loope

**Параметры:**

- **time** (number | Pattern): от 0 до 1, где 1 это длина sample

**Описание:** Заканчивает секцию loop в определённой точке sample (между <code>begin</code> и <code>end</code>).
Обратите внимание, что точка loop должна находиться между <code>begin</code> и <code>end</code>, и после <code>loopBegin</code>!

**Примеры:**

```javascript
s("space").loop(1)
.loopEnd("<1 .75 .5 .25>")._scope()
```

---

## lpdc

**Параметры:**

- **dcoffset** (number | Pattern): dc смещение. установите 0 для unipolar

**Описание:** DC смещение LFO для lowpass filter

---

## lpdepth

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для lowpass filter

**Примеры:**

```javascript
note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpdepth("<1 .5 1.8 0>")
```

---

## lpdepthfrequency

**Синонимы:** lpdethfreq

**Параметры:**

- **depth** (number | Pattern): глубина модуляции

**Описание:** Глубина LFO для lowpass filter, в Гц

**Примеры:**

```javascript
note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpdepthfrequency("<200 500 100 0>")
```

---

## lprate

**Параметры:**

- **rate** (number | Pattern): частота в герцах

**Описание:** Частота LFO для lowpass filter

**Примеры:**

```javascript
note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lprate("<4 8 2 1>")
```

---

## lpshape

**Параметры:**

- **shape** (number | Pattern): Форма lfo (0, 1, 2, ..)

**Описание:** Форма LFO для lowpass filter

---

## lpskew

**Параметры:**

- **skew** (number | Pattern): Насколько изгибать форму LFO

**Описание:** Искривление LFO для lowpass filter

---

## lpsync

**Параметры:**

- **rate** (number | Pattern): частота в циклах

**Описание:** Синхронизированная с циклом частота LFO для lowpass filter

**Примеры:**

```javascript
note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpsync("<4 8 2 1>")
```

---

## midi

**Параметры:**

- **midiport** (string | number): Имя MIDI устройства или индекс, по умолчанию 0
- **options** (object): Дополнительные опции конфигурации MIDI

**Описание:** MIDI output: Открывает порт вывода MIDI.

**Примеры:**

```javascript
note("c4").midichan(1).midi('IAC Driver Bus 1')
```

```javascript
note("c4").midichan(1).midi('IAC Driver Bus 1', { controller: true, latency: 50 })
```

---

## midi2note

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## midibend

**Параметры:**

- **midibend** (number | Pattern): MIDI pitch bend (-1 - 1)

**Описание:** MIDI pitch bend: Отправляет сообщение MIDI pitch bend.

**Примеры:**

```javascript
note("c4").midibend(sine.slow(4).range(-0.4,0.4)).midi()
```

---

## midichan

**Параметры:**

- **channel** (number | Pattern): номер MIDI канала (0-15)

**Описание:** MIDI канал: Устанавливает MIDI канал для события.

**Примеры:**

```javascript
note("c4").midichan(1).midi()
```

---

## midicmd

**Параметры:**

- **command** (number | Pattern): MIDI команда

**Описание:** MIDI команда: Отправляет сообщение MIDI команды.

**Примеры:**

```javascript
midicmd("clock*48,<start stop>/2").midi()
```

---

## midimaps

**Параметры:**

Нет параметров

**Описание:** Добавляет midimaps в реестр. Внутри каждого midimap имена контролов (например lpf) сопоставляются с номерами cc.

**Примеры:**

```javascript
midimaps({ mymap: { lpf: 74 } })
$: note("c a f e")
.lpf(sine.slow(4))
.midimap('mymap')
.midi()
```

```javascript
midimaps({ mymap: {
  lpf: { ccn: 74, min: 0, max: 20000, exp: 0.5 }
}})
$: note("c a f e")
.lpf(sine.slow(2).range(400,2000))
.midimap('mymap')
.midi()
```

---

## midin

**Параметры:**

- **input** (string | number): Имя MIDI устройства или индекс, по умолчанию 0

**Описание:** MIDI input: Открывает порт ввода MIDI для приёма MIDI control change сообщений.

**Примеры:**

```javascript
let cc = await midin('IAC Driver Bus 1')
note("c a f e").lpf(cc(0).range(0, 1000)).lpq(cc(1).range(0, 10)).sound("sawtooth")
```

---

## midiport

**Параметры:**

- **port** (number | Pattern): MIDI порт

**Описание:** MIDI порт: Устанавливает MIDI порт для события.

**Примеры:**

```javascript
note("c a f e").midiport("<0 1 2 3>").midi()
```

---

## miditouch

**Параметры:**

- **miditouch** (number | Pattern): MIDI key after touch (0-1)

**Описание:** MIDI key after touch: Отправляет сообщение MIDI key after touch.

**Примеры:**

```javascript
note("c4").miditouch(sine.slow(4).range(0,1)).midi()
```

---

## n

**Параметры:**

- **value** (number | Pattern): индекс sample, начиная с 0

**Описание:** Выбирает указанный индекс из карты sample.
Слишком большие числа будут циклически повторяться.
<code>n</code> также можно использовать для воспроизведения midi-нот, но рекомендуется использовать <code>note</code>.

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*6").n("<0 1>")
```

---

## noise

**Параметры:**

- **wet** (number | Pattern): количество wet

**Описание:** Добавляет розовый шум в микс

**Примеры:**

```javascript
sound("<white pink brown>/2")
```

---

## note

**Параметры:**

Нет параметров

**Описание:** Воспроизводит указанное имя ноты или midi-номер. Имя ноты состоит из:
<ul>
<li>буквы (a-g или A-G)</li>
<li>опциональных знаков альтерации (b или #)</li>
<li>опционального (возможно отрицательного) номера октавы (0-9). По умолчанию 3</li>
</ul>
Примеры допустимых имён нот: <code>c</code>, <code>bb</code>, <code>Bb</code>, <code>f#</code>, <code>c3</code>, <code>A4</code>, <code>Eb2</code>, <code>c#5</code>
Также можно использовать midi-номера вместо имён нот, где 69 соответствует A4 440Hz в 12EDO.

**Примеры:**

```javascript
note("c a f e")
```

```javascript
note("c4 a4 f4 e4")
```

```javascript
note("60 69 65 64")
```

```javascript
note("fbb1 a#0 cbbb-1 e##-2").sound("saw")
```

---

## note

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## nrpnn

**Параметры:**

- **nrpnn** (number | Pattern): MIDI NRPN номер нерегистрированного параметра (0-127)

**Описание:** MIDI NRPN номер нерегистрированного параметра: Отправляет сообщение MIDI NRPN номера нерегистрированного параметра.

**Примеры:**

```javascript
note("c4").nrpnn("1:8").nrpv("123").midichan(1).midi()
```

---

## nrpv

**Параметры:**

- **nrpv** (number | Pattern): MIDI NRPN значение нерегистрированного параметра (0-127)

**Описание:** MIDI NRPN значение нерегистрированного параметра: Отправляет сообщение MIDI NRPN значения нерегистрированного параметра.

**Примеры:**

```javascript
note("c4").nrpnn("1:8").nrpv("123").midichan(1).midi()
```

---

## octave

**Синонимы:** oct

**Параметры:**

- **octave** (number | Pattern): номер октавы

**Описание:** Устанавливает октаву по умолчанию для synth.

**Примеры:**

```javascript
n("0,4,7").scale("F:minor").s('supersaw').octave("<0 1 2 3>")
```

---

## octaves

**Параметры:**

- **count** (number | Pattern): количество октав

**Описание:** Сколько октав между шагами озвучивания, по умолчанию 1

**Примеры:**

```javascript
chord("<Am C D F Am E Am E>").octaves("<2 4>").voicing()
```

---

## orbit

**Синонимы:** o

**Параметры:**

- **number** (number | Pattern): 

**Описание:** <code>orbit</code> это глобальный параметрический контекст для pattern. Pattern с одним и тем же orbit будут использовать одни и те же глобальные эффекты.

**Примеры:**

```javascript
stack(
  s("hh*6").delay(.5).delaytime(.25).orbit(1),
  s("~ sd ~ sd").delay(.5).delaytime(.125).orbit(2)
)
```

---

## oschost

**Параметры:**

- **oschost** (string | Pattern): например, 'localhost'

**Описание:** Хост для отправки сообщений open sound control. Требует запущенный OSC bridge.

**Примеры:**

```javascript
note("c4").oschost('127.0.0.1').oscport(57120).osc();
```

---

## oscport

**Параметры:**

- **oscport** (number | Pattern): например, 57120

**Описание:** Порт для отправки сообщений open sound control. Требует запущенный OSC bridge.

**Примеры:**

```javascript
note("c4").oschost('127.0.0.1').oscport(57120).osc();
```

---

## pan

**Параметры:**

- **pan** (number | Pattern): от 0 до 1, слева направо (для stereo), один круг (для многоканальности)

**Описание:** Устанавливает позицию в stereo.

**Примеры:**

```javascript
s("[bd hh]*2").pan("<.5 1 .5 0>")
```

```javascript
s("bd rim sd rim bd ~ cp rim").pan(sine.slow(2))
```

---

## panchor

**Параметры:**

- **anchor** (number | Pattern): смещение опорной точки

**Описание:** Устанавливает опорную точку диапазона envelope:
<ul>
<li>anchor 0: range = [note, note + penv]</li>
<li>anchor 1: range = [note - penv, note]
Если не установить anchor, значение по умолчанию будет равно значению psustain.</li>
</ul>

**Примеры:**

```javascript
note("c c4").penv(12).panchor("<0 .5 1 .5>")
```

---

## pcurve

**Параметры:**

- **type** (number | Pattern): 0 = linear, 1 = exponential

**Описание:** Кривая envelope. По умолчанию линейная. exponential хорошо подходит для kicks

**Примеры:**

```javascript
note("g1*4")
.s("sine").pdec(.5)
.penv(32)
.pcurve("<0 1>")
```

---

## postgain

**Параметры:**

Нет параметров

**Описание:** Gain, применяемый после обработки всех эффектов.

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8")
.compressor("-20:20:10:.002:.02").postgain(1.5)
```

---

## progNum

**Параметры:**

- **program** (number | Pattern): номер MIDI программы (0-127)

**Описание:** MIDI номер программы: Отправляет сообщение изменения MIDI программы.

**Примеры:**

```javascript
note("c4").progNum(10).midichan(1).midi()
```

---

## pw

**Параметры:**

- **pulsewidth** (number | Pattern): 

**Описание:** Управляет шириной импульса pulse oscillator

**Примеры:**

```javascript
note("{f a c e}%16").s("pulse").pw(".8:1:.2")
```

```javascript
n(run(8)).scale("D:pentatonic").s("pulse").pw("0 .75 .5 1")
```

---

## pwrate

**Параметры:**

- **rate** (number | Pattern): 

**Описание:** Управляет частотой lfo для ширины импульса pulse oscillator

**Примеры:**

```javascript
n(run(8)).scale("D:pentatonic").s("pulse").pw("0.5").pwrate("<5 .1 25>").pwsweep("<0.3 .8>")
```

---

## pwsweep

**Параметры:**

- **sweep** (number | Pattern): 

**Описание:** Управляет sweep lfo для ширины импульса pulse oscillator

**Примеры:**

```javascript
n(run(8)).scale("D:pentatonic").s("pulse").pw("0.5").pwrate("<5 .1 25>").pwsweep("<0.3 .8>")
```

---

## release

**Синонимы:** rel

**Параметры:**

- **time** (number | Pattern): время release в секундах

**Описание:** Время release амплитудного envelope: Время, которое требуется после окончания для перехода от уровня sustain к нулю.

**Примеры:**

```javascript
note("c3 e3 g3 c4").release("<0 .1 .4 .6 1>/2")
```

---

## release

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## s

**Синонимы:** sound

**Параметры:**

- **sound** (string | Pattern): Звук / pattern звуков для выбора

**Описание:** Выбирает звук / sample по имени. При использовании mininotation можно также опционально указать параметры 'n' и 'gain',
разделённые ':'.

**Примеры:**

```javascript
s("bd hh")
```

```javascript
s("bd:0 bd:1 bd:0:0.3 bd:1:1.4")
```

---

## scrub

**Параметры:**

Нет параметров

**Описание:** Позволяет &quot;скрабить&quot; аудио файл, как ленточную петлю, передавая значения, представляющие позицию в аудио файле
в опциональном синтаксисе массива, например: &quot;0.5:2&quot;, второе значение контролирует скорость воспроизведения

**Примеры:**

```javascript
samples('github:switchangel/pad')
s("swpad:0").scrub("{0.1!2 .25@3 0.7!2 <0.8:1.5>}%8")
```

```javascript
samples('github:yaxu/clean-breaks/main');
s("amen/4").fit().scrub("{0@3 0@2 4@3}%8".div(16))
```

---

## soundAlias

**Параметры:**

- **original** (string): Оригинальное имя звука
- **alias** (string): Alias, который будет использоваться для звука

**Описание:** Регистрирует alias для звука.

---

## source

**Синонимы:** src

**Параметры:**

- **getSource** (function): 

**Описание:** Определяет пользовательский webaudio node для использования в качестве источника звука.

---

## speed

**Параметры:**

- **speed** (number | Pattern): от -inf до inf, отрицательные числа воспроизводят sample в обратном направлении.

**Описание:** Изменяет скорость воспроизведения sample, т.е. дешёвый способ изменить высоту тона.

**Примеры:**

```javascript
s("bd*6").speed("1 2 4 1 -2 -4")
```

```javascript
speed("1 1.5*2 [2 1.1]").s("piano").clip(1)
```

---

## spread

**Параметры:**

- **spread** (number | Pattern): от 0 до 1

**Описание:** Устанавливает stereo pan spread для поддерживаемых oscillator

**Примеры:**

```javascript
note("d f a a# a d3").fast(2).s("supersaw").spread("<0 .3 1>")
```

---

## stretch

**Параметры:**

- **factor** (number | Pattern): от -inf до inf, отрицательные числа воспроизводят sample в обратном направлении.

**Описание:** Изменяет скорость воспроизведения sample, т.е. дешёвый способ изменить высоту тона.

**Примеры:**

```javascript
s("gm_flute").stretch("1 2 .5")
```

---

## sustain

**Синонимы:** sus

**Параметры:**

- **gain** (number | Pattern): уровень sustain от 0 до 1

**Описание:** Уровень sustain амплитудного envelope: Уровень, который достигается после attack / decay и поддерживается до окончания.

**Примеры:**

```javascript
note("c3 e3 f3 g3").decay(.2).sustain("<0 .1 .4 .6 1>")
```

---

## sustain

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## sysex

**Параметры:**

- **id** (number | Pattern): Sysex ID
- **data** (number | Pattern): Sysex данные

**Описание:** MIDI sysex: Отправляет сообщение MIDI sysex.

**Примеры:**

```javascript
note("c4").sysex(["0x77", "0x01:0x02:0x03:0x04"]).midichan(1).midi()
```

---

## sysexdata

**Параметры:**

- **data** (number | Pattern): Sysex данные

**Описание:** MIDI sysex данные: Отправляет сообщение MIDI sysex.

**Примеры:**

```javascript
note("c4").sysexid("0x77").sysexdata("0x01:0x02:0x03:0x04").midichan(1).midi()
```

---

## sysexid

**Параметры:**

- **id** (number | Pattern): Sysex ID

**Описание:** MIDI sysex ID: Отправляет сообщение идентификатора MIDI sysex.

**Примеры:**

```javascript
note("c4").sysexid("0x77").sysexdata("0x01:0x02:0x03:0x04").midichan(1).midi()
```

---

## transpose

**Синонимы:** trans

**Параметры:**

- **amount** (string | number): Количество полутонов или строка интервала.

**Описание:** Изменяет высоту каждого значения на заданную величину. Ожидает числа или строки note в качестве значений.
Величина может быть задана как количество полутонов или как строка в краткой нотации интервалов.
Если вас не волнует энгармоническая правильность, просто используйте числа. В противном случае передайте интервал в
форме: ST, где S - номер ступени, а T - тип интервала:
<ul>
<li>M = мажорный</li>
<li>m = минорный</li>
<li>P = чистый</li>
<li>A = увеличенный</li>
<li>d = уменьшенный</li>
</ul>
Примеры интервалов:
<ul>
<li>1P = прима</li>
<li>3M = большая терция</li>
<li>3m = малая терция</li>
<li>4P = чистая кварта</li>
<li>4A = увеличенная кварта</li>
<li>5P = чистая квинта</li>
<li>5d = уменьшенная квинта</li>
</ul>

**Примеры:**

```javascript
"c2 c3".fast(2).transpose("<0 -2 5 3>".slow(2)).note()
```

```javascript
"c2 c3".fast(2).transpose("<1P -2M 4P 3m>".slow(2)).note()
```

---

## unison

**Параметры:**

- **numvoices** (number | Pattern): 

**Описание:** Устанавливает количество наложенных голосов для поддерживаемых oscillator

**Примеры:**

```javascript
note("d f a a# a d3").fast(2).s("supersaw").unison("<1 2 7>")
```

---

## unit

**Параметры:**

- **unit** (number | string | Pattern): смотрите описание выше

**Описание:** Используется в сочетании с <code>speed</code>, принимает значения &quot;r&quot; (rate, поведение по умолчанию), &quot;c&quot; (cycles), или &quot;s&quot; (seconds). Использование <code>unit &quot;c&quot;</code> означает, что <code>speed</code> будет интерпретироваться в единицах циклов, например, <code>speed &quot;1&quot;</code> означает, что sample будет растянут на весь цикл. Использование <code>unit &quot;s&quot;</code> означает, что скорость воспроизведения будет настроена так, чтобы длительность была равна количеству секунд, указанному в <code>speed</code>.

**Примеры:**

```javascript
speed("1 2 .5 3").s("bd").unit("c").osc()
```

---

## unit

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## velocity

**Параметры:**

Нет параметров

**Описание:** Устанавливает силу нажатия от 0 до 1. Умножается вместе с gain.

**Примеры:**

```javascript
s("hh*8")
.gain(".4!2 1 .4!2 1 .4 1")
.velocity(".4 1")
```

---

## vib

**Синонимы:** vibrato, v

**Параметры:**

- **frequency** (number | Pattern): частота vibrato в герцах

**Описание:** Применяет vibrato к частоте oscillator.

**Примеры:**

```javascript
note("a e")
.vib("<.5 1 2 4 8 16>")
._scope()
```

```javascript
// изменить глубину модуляции с помощью ":"
note("a e")
.vib("<.5 1 2 4 8 16>:12")
._scope()
```

---

## vibmod

**Синонимы:** vmod

**Параметры:**

- **depth** (number | Pattern): глубина vibrato (в полутонах)

**Описание:** Устанавливает глубину vibrato в полутонах. Имеет эффект только если <code>vibrato</code> | <code>vib</code> | <code>v</code> также установлен

**Примеры:**

```javascript
note("a e").vib(4)
.vibmod("<.25 .5 1 2 12>")
._scope()
```

```javascript
// изменить частоту vibrato с помощью ":"
note("a e")
.vibmod("<.25 .5 1 2 12>:8")
._scope()
```

---

