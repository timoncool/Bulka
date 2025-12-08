# Audio effects

# Audio Effects

Независимо от того, используете ли вы synth или sample, вы можете применить любой из следующих встроенных audio effects.
Как вы могли догадаться, effects могут быть объединены в цепочку, и они принимают строку pattern в качестве аргумента.

# Signal chain

<img src="/img/strudel-signal-flow.png"></img>

Signal chain в Strudel выглядит следующим образом:

- Звукогенерирующий event запускается pattern
  - У него есть время начала и продолжительность, которые обычно
    контролируются длиной ноты и параметрами ADSR
  - Если мы превышаем максимальную полифонию, старые звуки начинают исчезать
  - Заглушенные звуки (те, чье значение `s` равно `-`, `~` или `_`) пропускаются
- Производится звук (через, скажем, sample или oscillator)
  - Здесь происходят effects на основе detune (такие как `detune`, `penv` и т.д.)
- Следующее произойдет _по порядку_ и только если они были вызваны в pattern. Обратите внимание, что все это
  effects одноразового использования, что означает, что множественные вхождения их в pattern просто переопределят значения
  (например, вы не можете сделать `s("bd").lpf(100).distort(2).lpf(800)` для lowpass, distort, а затем снова lowpass)
  - Phase vocoder (`stretch`)
  - Применяется Gain (`gain`)
    - Здесь происходит основной ADSR (громкости)
  - Lowpass filter (`lpf`)
  - Highpass filter (`hpf`)
  - Bandpass filter (`bandpass`)
  - Vowel filter (`vowel`)
  - Уменьшение частоты дискретизации (`coarse`)
  - Bit crushing (`crush`)
  - Waveshape distortion (`shape`)
  - Обычный distortion (`distort`)
  - Tremolo (`tremolo`)
  - Compressor (`compressor`)
  - Panning (`pan`)
  - Phaser (`phaser`)
  - Postgain (`post`)
- Затем звук разделяется на несколько назначений
  - Dry output (количество контролируется параметром `dry`)
  - The sends
    - Analyzers
      - Они используются для инструментов типа `scope` и `spectrum`, и их настройка обычно происходит за кулисами
    - Delay (количество контролируется параметром `delay`)
    - Reverb (количество контролируется параметром `room`)
- Dry output, delay и reverb объединяются в так называемый "orbit" pattern (подробнее см. в разделе ниже)
  - Effect `duck` влияет на громкость всех сигналов в orbit
  - Затем orbit отправляется в микшер

## Orbits

Orbits — это способ обработки выходов в Strudel. Они также предписывают, какие delay и reverb связать с dry signal.
По умолчанию все orbits смешиваются в каналы `1` и `2` в стерео, однако с настройкой "Multi Channel Orbits"
(в разделе Настройки справа) вы можете использовать их как отдельные 2-канальные стерео выходы (orbit `i` будет отображен на
каналы `2i` и `2i + 1`). Затем вы можете использовать маршрутизаторы типа Blackhole 16 для получения и записи всех каналов в DAW для последующей обработки.

Orbit по умолчанию — `1`, и он устанавливается с помощью `orbit`. Вы можете отправить звук на несколько orbits через mininotation

```javascript
// Пример:
s("white").orbit("2,3,4").gain(0.2)
```

но будьте осторожны, так как это создаст три копии звука за кулисами, что означает, что если они будут смешаны
в один выход, они утроят громкость. Мы уменьшили gain здесь, чтобы сберечь ваши уши.

⚠️ На каждый orbit приходится только один delay и один reverb, поэтому имейте в виду, что если вы попытаетесь изменить параметры на двух
patterns, указывающих на один и тот же orbit, это может привести к непредсказуемым результатам. Сравните, например, этот красивый pluck
с большим reverb:

```javascript
// Пример:

$: s("triangle*4").decay(0.5).n(irand(12)).scale('C minor')
  .room(1).roomsize(10)
```

против того же pluck с заглушенным kick drum, который переопределяет значение `roomsize`:

```javascript
// Пример:

$: s("triangle*4").decay(0.5).n(irand(12)).scale('C minor')
  .room(1).roomsize(10)

$: s("bd\*4").room(0.01).roomsize(0.01).postgain(0)
```

Это происходит из-за того, что они используют один и тот же orbit: по умолчанию `1`. Это можно исправить, просто обновив orbits, чтобы они были
различными:

```javascript
// Пример:

$: s("triangle*4").decay(0.5).n(irand(12)).scale('C minor')
  .room(1).roomsize(10).orbit(2)

$: s("bd\*4").room(0.01).roomsize(0.01).postgain(0)
```

## Непрерывные изменения

Поскольку все вышеперечисленное запускается _при возникновении звука_, часто бывает так, что параметры могут не
изменяться непрерывно во времени. Например,

```javascript
// Пример:

s("supersaw").lpf(tri.range(100, 5000).slow(2))
```

Не будет производить непрерывно модулированный LFO low-pass filter из-за того, что `tri` семплируется только каждый раз, когда звучит нота
(в данном случае по умолчанию один раз за cycle). Вы можете имитировать это, введя больше звукогенерирующих events, например:

```javascript
// Пример:

s("supersaw").seg(16).lpf(tri.range(100, 5000).slow(2))
```

Некоторые параметры _действительно_ вызывают непрерывные изменения во времени, хотя:

- Кривая ADSR (управляется `attack`, `sustain`, `decay`, `release`)
- Кривая pitch envelope (управляется `penv` и связанными ADSR)
- Кривая FM (`fmenv`)
- Filter envelopes (`lpenv`, `hpenv`, `bpenv`)
- Tremolo (`tremolo`)
- Phaser (`phaser`)
- Vibrato (`vib`)
- Ducking (`duckorbit`)

# Filters

Filters являются важным строительным блоком [subtractive synthesis](https://en.wikipedia.org/wiki/Subtractive_synthesis).
Strudel поставляется с 3 типами filters:

- low-pass filter: низкие частоты могут _пройти_, высокие частоты обрезаются
- high-pass filter: высокие частоты могут _пройти_, низкие частоты обрезаются
- band-pass filters: может _пройти_ только частотная полоса, низкие и высокие частоты вокруг обрезаются

Каждый filter имеет 2 параметра:

- cutoff: частота, на которой filter начинает работать. например, low-pass filter с cutoff 1000Hz позволяет частотам ниже 1000Hz проходить.
- q-value: Контролирует резонанс filter. Более высокие значения звучат более агрессивно. См. также [Q-Factor](https://en.wikipedia.org/wiki/Q_factor)

## lpf

## lpf

## lpq

## lpq

## hpf

## hpf

## hpq

## hpq

## bpf

## bpf

## bpq

## bpq

## ftype

## ftype

## vowel

## vowel

# Amplitude Modulation

Amplitude modulation периодически изменяет амплитуду (gain) во времени.

## am

## am

## tremolosync

## tremolosync

## tremolodepth

## tremolodepth

## tremoloskew

## tremoloskew

## tremolophase

## tremolophase

## tremoloshape

## tremoloshape

# Amplitude Envelope

Amplitude [envelope](<https://en.wikipedia.org/wiki/Envelope_(music)>) контролирует динамический контур звука.
Strudel использует ADSR envelopes, которые, вероятно, являются наиболее распространенным способом описания envelope:

![ADSR](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/ADSR_parameter.svg/1920px-ADSR_parameter.svg.png)

[ссылка на изображение](https://commons.wikimedia.org/wiki/File:ADSR_parameter.svg)

## attack

## attack

## decay

## decay

## sustain

## sustain

## release

## release

## adsr

## adsr

# Filter Envelope

Каждый filter может получить дополнительный filter envelope, динамически контролирующий значение cutoff. Он использует ADSR envelope, аналогичный используемому для амплитуды. Есть дополнительный параметр для контроля глубины модуляции filter: `lpenv`|`hpenv`|`bpenv`. Это позволяет вам воспроизводить тонкие или огромные модуляции filter просто увеличивая или уменьшая глубину.

<MiniRepl
  client:idle
  tune={`note("[c eb g <f bb>](3,8,<0 1>)".sub(12))
  .s("<sawtooth>/64")
  .lpf(sine.range(300,2000).slow(16))
  .lpa(0.005)
  .lpd(perlin.range(.02,.2))
  .lps(perlin.range(0,.5).slow(3))
  .lpq(sine.range(2,10).slow(32))
  .release(.5)
  .lpenv(perlin.range(1,8).slow(2))
  .ftype('24db')
  .room(1)
  .juxBy(.5,rev)
  .sometimes(add(note(12)))
  .stack(s("bd*2").bank('RolandTR909'))
  .gain(.5).fast(2)`}
/>

Есть один filter envelope для каждого типа filter и, следовательно, один набор параметров envelope filter с префиксом `lp`, `hp` или `bp`:

- `lpattack`, `lpdecay`, `lpsustain`, `lprelease`, `lpenv`: filter envelope для lowpass filter.
  - альтернативно: `lpa`, `lpd`, `lps`, `lpr` и `lpe`.
- `hpattack`, `hpdecay`, `hpsustain`, `hprelease`, `hpenv`: filter envelope для highpass filter.
  - альтернативно: `hpa`, `hpd`, `hps`, `hpr` и `hpe`.
- `bpattack`, `bpdecay`, `bpsustain`, `bprelease`, `bpenv`: filter envelope для bandpass filter.
  - альтернативно: `bpa`, `bpd`, `bps`, `bpr` и `bpe`.

## lpattack

## lpattack

## lpdecay

## lpdecay

## lpsustain

## lpsustain

## lprelease

## lprelease

## lpenv

## lpenv

# Pitch Envelope

Вы также можете контролировать высоту тона с помощью envelopes!
Pitch envelopes могут вдохнуть жизнь в статичные звуки:

<MiniRepl
  client:idle
  tune={`n("<-4,0 5 2 1>*<2!3 4>")
  .scale("<C F>/8:pentatonic")
  .s("gm_electric_guitar_jazz")
  .penv("<.5 0 7 -2>*2").vib("4:.1")
  .phaser(2).delay(.25).room(.3)
  .size(4).fast(1.5)`}
/>

Вы также можете создать прекрасные звуки в стиле chiptune:

<MiniRepl
  client:idle
  tune={`n(run("<4 8>/16")).jux(rev)
.chord("<C^7 <Db^7 Fm7>>")
.dict('ireal')
.voicing().add(note("<0 1>/8"))
.dec(.1).room(.2)
.segment("<4 [2 8]>")
.penv("<0 <2 -2>>").patt(.02).fast(2)`}
/>

Давайте разберем все элементы управления pitch envelope:

## pattack

## pattack

## pdecay

## pdecay

## prelease

## prelease

## penv

## penv

## pcurve

## pcurve

## panchor

## panchor

# Dynamics

## gain

## gain

## velocity

## velocity

## compressor

## compressor

## postgain

## postgain

## xfade

## xfade

# Panning

## jux

## jux

## juxBy

## juxBy

## pan

## pan

# Waveshaping

## coarse

## coarse

## crush

## crush

## distort

## distort

# Global Effects

## Local vs Global Effects

В то время как вышеперечисленные "локальные" effects всегда будут создавать отдельную цепочку effects для каждого event,
global effects используют одну и ту же цепочку для всех events одного orbit:

## orbit

## orbit

## Delay

### delay

## delay

### delaytime

## delaytime

### delayfeedback

## delayfeedback

## Reverb

### room

## room

### roomsize

## roomsize

### roomfade

## roomfade

### roomlp

## roomlp

### roomdim

## roomdim

### iresponse

## iresponse

## Phaser

### phaser

## phaser

### phaserdepth

## phaserdepth

### phasercenter

## phasercenter

### phasersweep

## phasersweep

## Duck

### duckorbit

## duckorbit

### duckattack

## duckattack

### duckdepth

## duckdepth

Далее мы рассмотрим ввод/вывод через [MIDI, OSC и другие методы](/learn/input-output).

