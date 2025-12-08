# Эффекты

Всего функций: 84

---

## bandf

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## bpattack

**Синонимы:** bpa

**Параметры:**

- **attack** (number | Pattern): время envelope bandpass filter

**Описание:** Устанавливает длительность attack для envelope bandpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.bpf(500)
.bpa("<.5 .25 .1 .01>/4")
.bpenv(4)
```

---

## bpattack

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## bpdecay

**Синонимы:** bpd

**Параметры:**

- **decay** (number | Pattern): время envelope bandpass filter

**Описание:** Устанавливает длительность decay для envelope bandpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.bpf(500)
.bpd("<.5 .25 .1 0>/4")
.bps(0.2)
.bpenv(4)
```

---

## bpdecay

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## bpenv

**Синонимы:** bpe

**Параметры:**

- **modulation** (number | Pattern): глубина envelope bandpass filter от 0 до <em>n</em>

**Описание:** Устанавливает глубину модуляции envelope bandpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.bpf(500)
.bpa(.5)
.bpenv("<4 2 1 0 -1 -2 -4>/4")
```

---

## bpenv

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## bpf

**Синонимы:** bandf, bp

**Параметры:**

- **frequency** (number | Pattern): центральная частота

**Описание:** Устанавливает центральную частоту <strong>b</strong>and-<strong>p</strong>ass <strong>f</strong>ilter. При использовании mininotation можно
также опционально указать параметр 'bpq', разделённый ':'.

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*6").bpf("<1000 2000 4000 8000>")
```

---

## bpq

**Синонимы:** bandq

**Параметры:**

- **q** (number | Pattern): q-фактор

**Описание:** Устанавливает <strong>b</strong>and-<strong>p</strong>ass <strong>q</strong>-фактор (резонанс).

**Примеры:**

```javascript
s("bd sd [~ bd] sd").bpf(500).bpq("<0 1 2 3>")
```

---

## bprelease

**Синонимы:** bpr

**Параметры:**

- **release** (number | Pattern): время envelope bandpass filter

**Описание:** Устанавливает время release для envelope bandpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.clip(.5)
.bpf(500)
.bpenv(4)
.bpr("<.5 .25 .1 0>/4")
.release(.5)
```

---

## bprelease

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## bpsustain

**Синонимы:** bps

**Параметры:**

- **sustain** (number | Pattern): амплитуда envelope bandpass filter

**Описание:** Устанавливает амплитуду sustain для envelope bandpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.bpf(500)
.bpd(.5)
.bps("<0 .25 .5 1>/4")
.bpenv(4)
```

---

## bpsustain

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## chorus

**Параметры:**

- **chorus** (string | Pattern): количество микширования от 0 до 1

**Описание:** Управление микшированием эффекта chorus

**Примеры:**

```javascript
note("d d a# a").s("sawtooth").chorus(.5)
```

---

## coarse

**Параметры:**

- **factor** (number | Pattern): 1 для оригинала, 2 для половины, 3 для трети и так далее.

**Описание:** Имитация ресэмплинга для снижения частоты дискретизации. Внимание: Этот эффект, похоже, работает только в браузерах на основе chromium

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8").coarse("<1 4 8 16 32>")
```

---

## coarse

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## compressor

**Параметры:**

Нет параметров

**Описание:** Динамический компрессор. Параметры: <code>compressor(&quot;threshold:ratio:knee:attack:release&quot;)</code>
Больше информации <a href="https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode?retiredLocale=de#instance_properties">здесь</a>

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8")
.compressor("-20:20:10:.002:.02")
```

---

## crush

**Параметры:**

- **depth** (number | Pattern): от 1 (сильное снижение битности) до 16 (почти без снижения).

**Описание:** Эффект bit crusher.

**Примеры:**

```javascript
s("<bd sd>,hh*3").fast(2).crush("<16 8 7 6 5 4 3 2>")
```

---

## crush

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## delay

**Параметры:**

- **level** (number | Pattern): от 0 до 1

**Описание:** Устанавливает уровень сигнала delay.
При использовании mininotation можно также опционально добавить параметры 'delaytime' и 'delayfeedback',
разделённые ':'.

**Примеры:**

```javascript
s("bd bd").delay("<0 .25 .5 1>")
```

```javascript
s("bd bd").delay("0.65:0.25:0.9 0.65:0.125:0.7")
```

---

## delayfeedback

**Синонимы:** delayfb, dfb

**Параметры:**

- **feedback** (number | Pattern): от 0 до 1

**Описание:** Устанавливает уровень сигнала, который возвращается обратно в delay.
Внимание: Значения &gt;= 1 приведут к тому, что сигнал будет становиться всё громче и громче! Не делайте этого

**Примеры:**

```javascript
s("bd").delay(.25).delayfeedback("<.25 .5 .75 1>")
```

---

## delayfeedback

**Синонимы:** delayfb, dfb

**Параметры:**

- **feedback** (number | Pattern): от 0 до 1

**Описание:** Устанавливает уровень сигнала, который возвращается обратно в delay.
Осторожно: Значения &gt;= 1 приведут к сигналу, который становится всё громче и громче! Не делайте этого

**Примеры:**

```javascript
s("bd").delay(.25).delayfeedback("<.25 .5 .75 1>")
```

---

## delayspeed

**Синонимы:** delayt, dt

**Параметры:**

- **delayspeed** (number | Pattern): контролирует высоту тона delay feedback

**Описание:** Устанавливает время эффекта delay.

**Примеры:**

```javascript
note("d d a# a".fast(2)).s("sawtooth").delay(.8).delaytime(1/2).delayspeed("<2 .5 -1 -2>")
```

---

## delaysync

**Синонимы:** delayt, dt

**Параметры:**

- **cycles** (number | Pattern): длина delay в циклах

**Описание:** Устанавливает время эффекта delay в циклах.

**Примеры:**

```javascript
s("bd bd").delay(.25).delaysync("<1 2 3 5>".div(8))
```

---

## distort

**Синонимы:** dist

**Параметры:**

- **distortion** (number | Pattern): количество дисторшна для применения
- **volume** (number | Pattern): линейный postgain дисторшна
- **type** (number | string | Pattern): тип дисторшна для применения

**Описание:** Дисторшн с формированием волны. ВНИМАНИЕ: может быть очень громким.
Второй параметр в опциональном синтаксисе массива (например: &quot;.9:.5&quot;) применяет postgain к выходу. Третий параметр устанавливает тип формирования волны.
Наиболее полезные значения обычно между 0 и 10 (в зависимости от исходного gain). Если чувствуете себя смелым, можете увеличить до 11 и выше ;)

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8").distort("<0 2 3 10:.5>")
```

```javascript
note("d1!8").s("sine").penv(36).pdecay(.12).decay(.23).distort("8:.4")
```

```javascript
s("bd:4*4").bank("tr808").distort("3:0.5:diode")
```

---

## distort

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## distorttype

**Синонимы:** disttype

**Параметры:**

- **type** (number | string | Pattern): тип дисторшна для применения

**Описание:** Тип дисторшна с формированием волны для применения.

**Примеры:**

```javascript
s("bd*4").bank("tr909").distort(2).distorttype("<0 1 2>")
```

```javascript
s("sine").note("F1*2").release(1)
  .penv(24).pdecay(0.05)
  .distort(rand.range(1, 8))
  .distorttype("<fold chebyshev scurve diode asym sinefold>")
```

---

## distortvol

**Синонимы:** distvol

**Параметры:**

- **volume** (number | Pattern): линейный postgain дисторшна

**Описание:** Postgain для дисторшна с формированием волны.

**Примеры:**

```javascript
s("bd*4").bank("tr909").distort(2).distortvol(0.8)
```

---

## djf

**Параметры:**

- **cutoff** (number | Pattern): ниже 0.5 это low pass filter, выше это high pass filter

**Описание:** DJ filter, ниже 0.5 это low pass filter, выше это high pass filter.

**Примеры:**

```javascript
n(irand(16).seg(8)).scale("d:phrygian").s("supersaw").djf("<.5 .3 .2 .75>")
```

---

## hcutoff

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## hpattack

**Синонимы:** hpa

**Параметры:**

- **attack** (number | Pattern): время envelope highpass filter

**Описание:** Устанавливает длительность attack для envelope highpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.hpf(500)
.hpa("<.5 .25 .1 .01>/4")
.hpenv(4)
```

---

## hpattack

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## hpdecay

**Синонимы:** hpd

**Параметры:**

- **decay** (number | Pattern): время envelope highpass filter

**Описание:** Устанавливает длительность decay для envelope highpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.hpf(500)
.hpd("<.5 .25 .1 0>/4")
.hps(0.2)
.hpenv(4)
```

---

## hpdecay

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## hpenv

**Синонимы:** hpe

**Параметры:**

- **modulation** (number | Pattern): глубина envelope highpass filter от 0 до <em>n</em>

**Описание:** Устанавливает глубину модуляции envelope highpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.hpf(500)
.hpa(.5)
.hpenv("<4 2 1 0 -1 -2 -4>/4")
```

---

## hpenv

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## hpf

**Синонимы:** hp, hcutoff

**Параметры:**

- **frequency** (number | Pattern): слышимая частота от 0 до 20000

**Описание:** Устанавливает частоту среза <strong>h</strong>igh-<strong>p</strong>ass <strong>f</strong>ilter.
При использовании mininotation можно также опционально добавить параметр 'hpq', разделённый ':'.

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8").hpf("<4000 2000 1000 500 200 100>")
```

```javascript
s("bd sd [~ bd] sd,hh*8").hpf("<2000 2000:25>")
```

---

## hpq

**Синонимы:** hresonance

**Параметры:**

- **q** (number | Pattern): фактор резонанса от 0 до 50

**Описание:** Управляет <strong>h</strong>igh-<strong>p</strong>ass <strong>q</strong>-значением.

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8").hpf(2000).hpq("<0 10 20 30>")
```

---

## hprelease

**Синонимы:** hpr

**Параметры:**

- **release** (number | Pattern): время envelope highpass filter

**Описание:** Устанавливает время release для envelope highpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.clip(.5)
.hpf(500)
.hpenv(4)
.hpr("<.5 .25 .1 0>/4")
.release(.5)
```

---

## hprelease

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## hpsustain

**Синонимы:** hps

**Параметры:**

- **sustain** (number | Pattern): амплитуда envelope highpass filter

**Описание:** Устанавливает амплитуду sustain для envelope highpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.hpf(500)
.hpd(.5)
.hps("<0 .25 .5 1>/4")
.hpenv(4)
```

---

## hpsustain

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## leslie

**Параметры:**

- **wet** (number | Pattern): от 0 до 1

**Описание:** Эмуляция Leslie speaker: вращающиеся динамики в деревянном усиленном корпусе.

**Примеры:**

```javascript
n("0,4,7").s("supersquare").leslie("<0 .4 .6 1>").osc()
```

---

## lpattack

**Синонимы:** lpa

**Параметры:**

- **attack** (number | Pattern): время envelope filter

**Описание:** Устанавливает длительность attack для envelope lowpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.lpf(300)
.lpa("<.5 .25 .1 .01>/4")
.lpenv(4)
```

---

## lpattack

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## lpdecay

**Синонимы:** lpd

**Параметры:**

- **decay** (number | Pattern): время envelope filter

**Описание:** Устанавливает длительность decay для envelope lowpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.lpf(300)
.lpd("<.5 .25 .1 0>/4")
.lpenv(4)
```

---

## lpdecay

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## lpenv

**Синонимы:** lpe

**Параметры:**

- **modulation** (number | Pattern): глубина envelope lowpass filter от 0 до <em>n</em>

**Описание:** Устанавливает глубину модуляции envelope lowpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.lpf(300)
.lpa(.5)
.lpenv("<4 2 1 0 -1 -2 -4>/4")
```

---

## lpf

**Синонимы:** cutoff, ctf, lp

**Параметры:**

- **frequency** (number | Pattern): слышимая частота от 0 до 20000

**Описание:** Устанавливает частоту среза <strong>l</strong>ow-<strong>p</strong>ass <strong>f</strong>ilter.
При использовании mininotation можно также опционально добавить параметр 'lpq', разделённый ':'.

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*6").lpf("<4000 2000 1000 500 200 100>")
```

```javascript
s("bd*16").lpf("1000:0 1000:10 1000:20 1000:30")
```

---

## lpq

**Синонимы:** resonance

**Параметры:**

- **q** (number | Pattern): фактор резонанса от 0 до 50

**Описание:** Управляет <strong>l</strong>ow-<strong>p</strong>ass <strong>q</strong>-значением.

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8").lpf(2000).lpq("<0 10 20 30>")
```

---

## lprelease

**Синонимы:** lpr

**Параметры:**

- **release** (number | Pattern): время envelope filter

**Описание:** Устанавливает время release для envelope lowpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.clip(.5)
.lpf(300)
.lpenv(4)
.lpr("<.5 .25 .1 0>/4")
.release(.5)
```

---

## lprelease

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## lpsustain

**Синонимы:** lps

**Параметры:**

- **sustain** (number | Pattern): амплитуда envelope lowpass filter

**Описание:** Устанавливает амплитуду sustain для envelope lowpass filter.

**Примеры:**

```javascript
note("c2 e2 f2 g2")
.sound('sawtooth')
.lpf(300)
.lpd(.5)
.lps("<0 .25 .5 1>/4")
.lpenv(4)
```

---

## lpsustain

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## lrate

**Параметры:**

- **rate** (number | Pattern): 6.7 для быстрого, 0.7 для медленного

**Описание:** Скорость модуляции / вращения для leslie эффекта

**Примеры:**

```javascript
n("0,4,7").s("supersquare").leslie(1).lrate("<1 2 4 8>").osc()
```

---

## lsize

**Параметры:**

- **meters** (number | Pattern): где-то между 0 и 1

**Описание:** Физический размер корпуса в метрах. Будьте осторожны, он может быть немного больше вашего компьютера. Влияет на величину эффекта Doppler (колебание высоты тона)

**Примеры:**

```javascript
n("0,4,7").s("supersquare").leslie(1).lrate(2).lsize("<.1 .5 1>").osc()
```

---

## pattack

**Синонимы:** patt

**Параметры:**

- **time** (number | Pattern): время в секундах

**Описание:** Время attack для pitch envelope.

**Примеры:**

```javascript
note("c eb g bb").pattack("0 .1 .25 .5").slow(2)
```

---

## pattack

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## pdecay

**Синонимы:** pdec

**Параметры:**

- **time** (number | Pattern): время в секундах

**Описание:** Время decay для pitch envelope.

**Примеры:**

```javascript
note("<c eb g bb>").pdecay("<0 .1 .25 .5>")
```

---

## pdecay

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## penv

**Параметры:**

- **semitones** (number | Pattern): изменение в полутонах

**Описание:** Величина pitch envelope. Отрицательные значения переворачивают envelope.
Если вы не установите другие параметры pitch envelope, <code>pattack:.2</code> будет значением по умолчанию.

**Примеры:**

```javascript
note("c")
.penv("<12 7 1 .5 0 -1 -7 -12>")
```

---

## penv

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## phaser

**Синонимы:** ph

**Параметры:**

- **speed** (number | Pattern): скорость модуляции

**Описание:** Аудио эффект phaser, приближенный к популярным гитарным педалям.

**Примеры:**

```javascript
n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
.phaser("<1 2 4 8>")
```

---

## phasercenter

**Синонимы:** phc

**Параметры:**

- **centerfrequency** (number | Pattern): в Гц

**Описание:** Центральная частота phaser в Гц. По умолчанию 1000

**Примеры:**

```javascript
n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
.phaser(2).phasercenter("<800 2000 4000>")
```

---

## phaserdepth

**Синонимы:** phd, phasdp

**Параметры:**

- **depth** (number | Pattern): число от 0 до 1

**Описание:** Количество влияния эффекта phaser на сигнал. По умолчанию 0.75

**Примеры:**

```javascript
n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
.phaser(2).phaserdepth("<0 .5 .75 1>")
```

---

## phasersweep

**Синонимы:** phs

**Параметры:**

- **phasersweep** (number | Pattern): наиболее полезные значения между 0 и 4000

**Описание:** Диапазон частотного sweep lfo для эффекта phaser. По умолчанию 2000

**Примеры:**

```javascript
n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
.phaser(2).phasersweep("<800 2000 4000>")
```

---

## prelease

**Синонимы:** prel

**Параметры:**

- **time** (number | Pattern): время в секундах

**Описание:** Время release для pitch envelope

**Примеры:**

```javascript
note("<c eb g bb> ~")
.release(.5) // чтобы услышать pitch release
.prelease("<0 .1 .25 .5>")
```

---

## prelease

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## psustain

**Параметры:**

Нет параметров

**Описание:** Описание отсутствует

---

## ratio

**Параметры:**

Нет параметров

**Описание:** Позволяет делить числа через list-нотацию, используя &quot;:&quot;.
Возвращает новый pattern только с числами.

**Примеры:**

```javascript
ratio("1, 5:4, 3:2").mul(110)
.freq().s("piano")
```

---

## room

**Параметры:**

- **level** (number | Pattern): от 0 до 1

**Описание:** Устанавливает уровень reverb.
При использовании mininotation можно также опционально добавить параметр 'size', разделённый ':'.

**Примеры:**

```javascript
s("bd sd [~ bd] sd").room("<0 .2 .4 .6 .8 1>")
```

```javascript
s("bd sd [~ bd] sd").room("<0.9:1 0.9:4>")
```

---

## roomdim

**Синонимы:** rdim

**Параметры:**

- **frequency** (number): от 0 до 20000 Гц

**Описание:** Частота lowpass reverb на -60dB (в герцах).
При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..

**Примеры:**

```javascript
s("bd sd [~ bd] sd").room(0.5).rlp(10000).rdim(8000)
```

```javascript
s("bd sd [~ bd] sd").room(0.5).rlp(5000).rdim(400)
```

---

## roomfade

**Синонимы:** rfade

**Параметры:**

- **seconds** (number): секунды затухания reverb

**Описание:** Время затухания reverb (в секундах).
При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..

**Примеры:**

```javascript
s("bd sd [~ bd] sd").room(0.5).rlp(10000).rfade(0.5)
```

```javascript
s("bd sd [~ bd] sd").room(0.5).rlp(5000).rfade(4)
```

---

## roomlp

**Синонимы:** rlp

**Параметры:**

- **frequency** (number): от 0 до 20000 Гц

**Описание:** Начальная частота lowpass reverb (в герцах).
При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..

**Примеры:**

```javascript
s("bd sd [~ bd] sd").room(0.5).rlp(10000)
```

```javascript
s("bd sd [~ bd] sd").room(0.5).rlp(5000)
```

---

## roomsize

**Синонимы:** rsize, sz, size

**Параметры:**

- **size** (number | Pattern): от 0 до 10

**Описание:** Устанавливает размер комнаты для reverb, смотрите <code>room</code>.
При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..

**Примеры:**

```javascript
s("bd sd [~ bd] sd").room(.8).rsize(1)
```

```javascript
s("bd sd [~ bd] sd").room(.8).rsize(4)
```

---

## shape

**Параметры:**

- **distortion** (number | Pattern): от 0 до 1

**Описание:** (Устаревший) Дисторшн с формированием волны. ВНИМАНИЕ: может внезапно стать непредсказуемо громким.
Пожалуйста, используйте distort вместо этого, который имеет более предсказуемую кривую отклика
второй параметр в опциональном синтаксисе массива (например: &quot;.9:.5&quot;) применяет postgain к выходу

**Примеры:**

```javascript
s("bd sd [~ bd] sd,hh*8").shape("<0 .2 .4 .6 .8>")
```

---

## squiz

**Параметры:**

- **squiz** (number | Pattern): Попробуйте передавать кратные 2 - 2, 4, 8 и т.д.

**Описание:** Создан Calum Gunn. Напоминает странную смесь filter, ring-modulator и pitch-shifter. Руководство SuperCollider определяет Squiz как:
&quot;Упрощённый алгоритм повышения высоты тона. Он не предназначен для естественного звучания; его звук напоминает странную смесь filter, ring-modulator и pitch-shifter, в зависимости от входного сигнала. Алгоритм работает, разрезая сигнал на фрагменты (разделённые восходящими пересечениями нуля) и сжимая эти фрагменты во временной области (т.е. просто воспроизводя их быстрее, чем они поступили), оставляя паузы между ними. Все параметры, кроме memlen, могут модулироваться.&quot;

**Примеры:**

```javascript
squiz("2 4/2 6 [8 16]").s("bd").osc()
```

---

## tremolo

**Синонимы:** trem

**Параметры:**

- **speed** (number | Pattern): скорость модуляции в Гц

**Описание:** Модулирует амплитуду звука непрерывной формой волны

**Примеры:**

```javascript
note("d d d# d".fast(4)).s("supersaw").tremolo("<3 2 100> ").tremoloskew("<.5>")
```

---

## tremolodepth

**Синонимы:** tremdepth

**Параметры:**

- **depth** (number | Pattern): 

**Описание:** Глубина амплитудной модуляции

**Примеры:**

```javascript
note("a1 a1 a#1 a1".fast(4)).s("pulse").tremsync(4).tremolodepth("<1 2 .7>")
```

---

## tremolophase

**Синонимы:** tremphase

**Параметры:**

- **offset** (number | Pattern): смещение в циклах модуляции

**Описание:** Изменяет фазу волны модуляции

**Примеры:**

```javascript
note("{f a c e}%16").s("sawtooth").tremsync(4).tremolophase("<0 .25 .66>")
```

---

## tremoloshape

**Синонимы:** tremshape

**Параметры:**

- **shape** (number | Pattern): tri | square | sine | saw | ramp

**Описание:** Форма амплитудной модуляции

**Примеры:**

```javascript
note("{f g c d}%16").tremsync(4).tremoloshape("<sine tri square>").s("sawtooth")
```

---

## tremoloskew

**Синонимы:** tremskew

**Параметры:**

- **amount** (number | Pattern): от 0 до 1, форма волны

**Описание:** Изменяет форму волны модуляции

**Примеры:**

```javascript
note("{f a c e}%16").s("sawtooth").tremsync(4).tremoloskew("<.5 0 1>")
```

---

## tremolosync

**Синонимы:** tremsync

**Параметры:**

- **cycles** (number | Pattern): скорость модуляции в циклах

**Описание:** Модулирует амплитуду звука непрерывной формой волны

**Примеры:**

```javascript
note("d d d# d".fast(4)).s("supersaw").tremolosync("4").tremoloskew("<1 .5 0>")
```

---

## vowel

**Параметры:**

- **vowel** (string | Pattern): Можно использовать a e i o u ae aa oe ue y uh un en an on, соответствующие [a] [e] [i] [o] [u] [æ] [ɑ] [ø] [y] [ɯ] [ʌ] [œ̃] [ɛ̃] [ɑ̃] [ɔ̃]. Алиасы: aa = å = ɑ, oe = ø = ö, y = ı, ae = æ.

**Описание:** Формантный filter, чтобы звук был похож на гласные.

**Примеры:**

```javascript
note("[c2 <eb2 <g2 g1>>]*2").s('sawtooth')
.vowel("<a e i <o u>>")
```

```javascript
s("bd sd mt ht bd [~ cp] ht lt").vowel("[a|e|i|o|u]")
```

---

