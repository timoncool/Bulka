---
title: Эффекты паттернов
---

# Эффекты паттернов

До сих пор большинство функций, которые мы видели, — это то, на что обычно способны другие музыкальные программы: секвенсирование звуков, воспроизведение нот, управление эффектами.

В этой главе мы рассмотрим функции, которые более уникальны для tidal.

**обратные паттерны с помощью rev**

```javascript
n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").rev()
```

**воспроизведение pattern слева и его модификация справа с помощью jux**

```javascript
n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").jux(rev)
```

Это то же самое, что:

```javascript
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(0)
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(1).rev()
```

Давайте визуализируем, что здесь происходит:

```javascript
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(0).color("cyan")
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(1).color("magenta").rev()
```

Попробуйте закомментировать одну из двух строк, добавив `//` перед строкой

**несколько темпов**

```javascript
note("c2, eb3 g3 [bb3 c4]").sound("piano").slow("0.5,1,1.5")
```

Это как если бы мы делали

```javascript
$: note("c2, eb3 g3 [bb3 c4]").s("piano").slow(0.5).color('cyan')
$: note("c2, eb3 g3 [bb3 c4]").s("piano").slow(1).color('magenta')
$: note("c2, eb3 g3 [bb3 c4]").s("piano").slow(1.5).color('yellow')
```

Попробуйте закомментировать одну или несколько строк, добавив `//` перед строкой

**add**

```javascript
setcpm(60)
note("c2 [eb3,g3] ".add("<0 <1 -1>>"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)
```

Если вы добавляете число к ноте, нота будет обрабатываться как число

Мы можем добавлять столько раз, сколько захотим:

```javascript
setcpm(60)
note("c2 [eb3,g3]".add("<0 <1 -1>>").add("0,7"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)
```

**add с scale**

```javascript
n("0 [2 4] <3 5> [~ <4 1>]".add("<0 [0,2,4]>"))
.scale("C5:minor").release(.5)
.sound("gm_xylophone").room(.5)
```

**время складывать**

```javascript
$: n("0 [2 4] <3 5> [~ <4 1>]".add("<0 [0,2,4]>"))
  .scale("C5:minor")
  .sound("gm_xylophone")
  .room(.4).delay(.125)
$: note("c2 [eb3,g3]".add("<0 <1 -1>>"))
  .adsr("[.1 0]:.2:[1 0]")
  .sound("gm_acoustic_bass")
  .room(.5)
$: n("0 1 [2 3] 2").sound("jazz").jux(rev)
```

**ply**

```javascript
sound("hh hh, bd rim [~ cp] rim").bank("RolandTR707").ply(2)
```

это как написать:

```javascript
sound("hh*2 hh*2, bd*2 rim*2 [~ cp*2] rim*2").bank("RolandTR707")
```

Попробуйте использовать pattern для функции `ply`, например `"<1 2 1 3>"`

**off**

```javascript
n("0 [4 <3 2>] <2 3> [~ 1]"
  .off(1/16, x=>x.add(4))
  //.off(1/8, x=>x.add(7))
).scale("<C5:minor Db5:mixolydian>/2")
.s("triangle").room(.5).dec(.1)
```

В нотации `.off(1/16, x=>x.add(4))` говорится:

- взять исходный pattern с именем `x`
- модифицировать `x` с помощью `.add(4)`, и
- воспроизвести его со сдвигом относительно исходного pattern на `1/16` cycle.

off также полезен для модификации других звуков и может быть даже вложенным:

```javascript
s("bd sd [rim bd] sd,[~ hh]*4").bank("CasioRZ1")
  .off(2/16, x=>x.speed(1.5).gain(.25)
  .off(3/16, y=>y.vowel("<a e i o>*8")))
```

| название | описание                              | пример                                         |
| -------- | ------------------------------------- | ---------------------------------------------- |
| rev      | обратить порядок                      | `n("0 2 4 6 ~ 7 9 5").scale("C:minor").rev()`  |
| jux      | разделить лево/право, модифицировать право | `n("0 2 4 6 ~ 7 9 5").scale("C:minor").jux(rev)` |
| add      | добавить числа / ноты                 | `n("0 2 4 6 ~ 7 9 5".add("<0 1 2 1>")).scale("C:minor")` |
| ply      | ускорить каждое событие n раз         | `s("bd sd [~ bd] sd").ply("<1 2 3>")`          |
| off      | копировать, сдвигать время и модифицировать | `s("bd sd [~ bd] sd, hh*8").off(1/16, x=>x.speed(2))` |
