# Создание ритмов

Примечание:

- это было (частично) переведено с https://tidalcycles.org/docs/patternlib/howtos/buildrhythms
- это звучит хорошо только с `samples('github:tidalcycles/dirt-samples')` в prebake

Эта страница научит вас, как начать писать ритмы, используя различные техники. Это хороший способ изучить Strudel более интуитивно.

## От простого к сложному ритму

Простая бочка - малый барабан:

```javascript
s("bd sd").slow(2)
```

Давайте выберем другой sample малого барабана:

```javascript
s("bd sd:3").slow(2)
```

Теперь изменим ритм:

```javascript
s("bd*2 [~ sd:3]").slow(2)
```

И добавим томы:

```javascript
s("bd*2 [[~ lt] sd:3] lt:1 [ht mt*2]").slow(2)
```

Начинаем трансформировать, сдвигаем на четверть cycle через один cycle:

```javascript
s("bd*2 [[~ lt] sd:3] lt:1 [ht mt*2]")
.every(2, early(.25)).slow(2)
```

Паттернизируем величину сдвига:

```javascript
s("bd*2 [[~ lt] sd:3] lt:1 [ht mt*2]")
.every(2, early("<.25 .125 .5>")).slow(2)
```

Добавляем эффекты с паттернами:

```javascript
s("bd*2 [[~ lt] sd:3] lt:1 [ht mt*2]")
.every(2, early("<.25 .125 .5>"))
.shape("<0 .5 .3>")
.room(saw.range(0,.2).slow(4))
.slow(2)
```

Больше трансформаций:

```javascript
s("bd*2 [[~ lt] sd:3] lt:1 [ht mt*2]")
.every(2, early("<.25 .125 .5>"))
.shape("<0 .5 .3>")
.room(saw.range(0,.2).slow(4))
.jux(id, rev, x=>x.speed(2))
.slow(2)
```

## Ещё одна ритмическая конструкция

Давайте начнём с последовательности:

```javascript
n("0 0 [2 0] [2 3]").s("feel").speed(1.5).slow(2)
```

Добавляем немного вкуса:

```javascript
n("0 <0 4> [2 0] [2 3]").s("feel").speed(1.5).slow(2)
```

Меняем samples местами через один cycle:

TODO: реализовать `rot`
