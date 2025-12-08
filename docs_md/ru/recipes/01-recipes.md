# Рецепты

Эта страница показывает возможные способы достижения распространённых (или не очень) музыкальных целей.
Часто есть много способов сделать что-то, и нет правильного или неправильного.
Интересная часть в том, что каждое представление даёт вам разные импульсы при импровизации.

## Arpeggios

Arpeggio - это когда ноты аккорда играются последовательно.
Мы можем либо написать ноты вручную:

```javascript
note("c eb g c4")
.clip(2).s("gm_electric_guitar_clean")
```

...или использовать гаммы:

```javascript
n("0 2 4 7").scale("C:minor")
.clip(2).s("gm_electric_guitar_clean")
```

...или символы аккордов:

```javascript
n("0 1 2 3").chord("Cm").mode("above:c3").voicing()
.clip(2).s("gm_electric_guitar_clean")
```

...используя off:

```javascript
"0"
  .off(1/3, add(2))
  .off(1/2, add(4))
  .n()
  .scale("C:minor")
  .s("gm_electric_guitar_clean")
```

## Нарезка брейков

Sample можно зациклить и нарезать вот так:

```javascript
samples('github:yaxu/clean-breaks')
s("amen/4").fit().chop(32)
```

Это подгоняет брейк под 8 cycles + нарезает его на 16 кусочков.
Нарезка пока не слышна, потому что мы не делаем никаких манипуляций.
Давайте добавим рандомизированное удвоение + реверсирование:

```javascript
samples('github:yaxu/clean-breaks')
s("amen/4").fit().chop(16).cut(1)
.sometimesBy(.5, ply("2"))
.sometimesBy(.25, mul(speed("-1")))
```

Если мы хотим указать порядок samples, можем заменить `chop` на `slice`:

```javascript
samples('github:yaxu/clean-breaks')
s("amen/4").fit()
  .slice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2")
  .cut(1).rarely(ply("2"))
```

Если использовать `splice` вместо `slice`, скорость подстраивается под длительность события:

```javascript
samples('github:yaxu/clean-breaks')
s("amen")
  .splice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2")
  .cut(1).rarely(ply("2"))
```

Обратите внимание, что нам не нужен `fit`, потому что `splice` сделает это сам.

## Огибающие фильтра

Используя `lpenv`, мы можем заставить фильтр двигаться:

```javascript
note("g1 bb1 <c2 eb2> d2")
  .s("sawtooth")
  .lpf(400).lpenv(4)
  .scope()
```

Тип огибающей зависит от методов, которые вы устанавливаете. Давайте установим `lpa`:

```javascript
note("g1 bb1 <c2 eb2> d2")
  .s("sawtooth").lpq(8)
  .lpf(400).lpa(.2).lpenv(4)
  .scope()
```

Теперь фильтр атакует, а не затухает как раньше (затухание - это по умолчанию). Мы также можем сделать и то, и другое:

```javascript
note("g1 bb1 <c2 eb2> d2")
  .s("sawtooth").lpq(8)
  .lpf(400).lpa(.1).lpd(.1).lpenv(4)
  .scope()
```

Вы можете поэкспериментировать с `lpa` | `lpd` | `lps` | `lpd`, чтобы увидеть, что будет делать огибающая фильтра.

## Наложение звуков

Мы можем накладывать звуки, разделяя их запятой ",":

```javascript
note("<g1 bb1 d2 f1>")
.s("sawtooth, square") // <------
.scope()
```

Мы можем контролировать громкость отдельных звуков вот так:

```javascript
note("<g1 bb1 d2 f1>")
.s("sawtooth, square:0:.5") // <--- "name:number:gain"
.scope()
```

Для большего контроля над каждым голосом можем использовать `layer`:

```javascript
note("<g1 bb1 d2 f1>").layer(
  x=>x.s("sawtooth").vib(4),
  x=>x.s("square").add(note(12))
).scope()
```

Здесь мы придаём sawtooth вибрато, а square перемещаем на октаву вверх.
С `layer` вы можете использовать любой доступный метод pattern на каждом голосе, так что небо - предел..

## Расстройка осциллятора

Мы можем сделать звук толще, добавив к нему расстроенную версию:

```javascript
note("<g1 bb1 d2 f1>")
.add(note("0,.1")) // <------ chorus
.s("sawtooth").scope()
```

Попробуйте разные значения или добавьте ещё один голос!

## Polyrhythms

Вот простой пример polyrhythm:

```javascript
s("bd*2,hh*3")
```

Polyrhythm - это когда два разных темпа происходят одновременно.

## Polymeter

Это polymeter:

```javascript
s("<bd rim, hh hh oh>*4")
```

Polymeter - это когда два разных размера такта играют в одном темпе.

## Phasing

Это phasing:

```javascript
note("<C D G A Bb D C A G D Bb A>*[6,6.1]").piano()
```

Phasing происходит, когда одна и та же последовательность играет в слегка разных темпах.

## Пробежка по samples

Используя `run` с `n`, мы можем пробежаться по банку samples:

```javascript
samples('bubo:fox')
n(run(8)).s("ftabla")
```

Это отлично работает с банками samples, содержащими похожие звуки, как в этом случае разные записи табла.
Часто вы будете слышать начало фразы не там, где начинается pattern.
В этом случае я слышу начало на третьем sample, что можно учесть с помощью `early`.

```javascript
samples('bubo:fox')
n(run(8)).s("ftabla").early(2/8)
```

Давайте добавим немного случайности:

```javascript
samples('bubo:fox')
n(run(8)).s("ftabla").early(2/8)
.sometimes(mul(speed("1.5")))
```

## Дрожание ленты

Мы можем эмулировать эффект дрожания высоты звука вот так:

```javascript
note("<c4 bb f eb>*8")
.add(note(perlin.range(0,.5))) // <------ warble
.clip(2).s("gm_electric_guitar_clean")
```

## Длительность звука

Есть несколько способов изменить длительность звука. Используя clip:

```javascript
note("f ab bb c")
.clip("<2 1 .5 .25>")
```

Значение clip относительно длительности каждого события.
Мы также можем создать перекрытия, используя release:

```javascript
note("f ab bb c")
.release("<2 1 .5 .25>")
```

Это плавно затухнет каждый звук в течение заданного количества секунд.
Мы также можем сделать ноты короче, используя огибающую затухания:

```javascript
note("f ab bb c")
.decay("<2 1 .5 .25>")
```

При использовании samples у нас также есть `.end` для обрезки относительно длины sample:

```javascript
s("oh*4").end("<1 .5 .25 .1>")
```

Сравните это с clip:

```javascript
s("oh*4").clip("<1 .5 .25 .1>")
```

или decay:

```javascript
s("oh*4").decay("<1 .5 .25 .1>")
```

## Волновой синтез

Вы можете зациклить sample с помощью `loop` / `loopEnd`:

```javascript
note("<c eb g f>").s("bd").loop(1).loopEnd(.05).gain(.2)
```

Это позволяет нам проигрывать первые 5% бочки как синтезатор!
Для упрощения загрузки волновых таблиц любой sample, начинающийся с `wt_`, будет зациклен автоматически:

```javascript
samples('github:bubobubobubobubo/dough-waveforms')
note("c eb g bb").s("wt_dbass").clip(2)
```

Пробежка по разным волновым таблицам также может дать интересные вариации:

```javascript
samples('github:bubobubobubobubo/dough-waveforms')
note("c2*8").s("wt_dbass").n(run(8)).fast(2)
```

...добавляя огибающую фильтра + reverb:

```javascript
samples('github:bubobubobubobubo/dough-waveforms')
note("c2*8").s("wt_dbass").n(run(8))
.lpf(perlin.range(100,1000).slow(8))
.lpenv(-3).lpa(.1).room(.5).fast(2)
```
