# Создание Arpeggios

Примечание: Это было (частично) переведено с https://tidalcycles.org/docs/patternlib/howtos/buildarpeggios

Эта страница научит вас, как начать писать arpeggios, используя различные техники. Это хороший способ изучить Strudel более интуитивно.

## Arpeggios из нот

Начните с простой последовательности нот:

```javascript
note("c a f e").piano().slow(2)
```

Теперь давайте проигрывать по одной на cycle:

```javascript
note("<c a f e>").piano().slow(2)
```

Поверх этого поместите копию последовательности, сдвинутую по времени и высоте:

```javascript
"<c a f e>".off(1/8, add(7))
  .note().piano().slow(2)
```

Добавьте структуру в исходную последовательность:

```javascript
"<c*2 a(3,8) f(3,8,2) e*2>"
  .off(1/8, add(7))
  .note().piano().slow(2)
```

Реверсируем в одном динамике:

```javascript
"<c*2 a(3,8) f(3,8,2) e*2>"
  .off(1/8, add(7))
  .note().piano()
  .jux(rev).slow(2)
```

Давайте добавим ещё один слой:

```javascript
"<c*2 a(3,8) f(3,8,2) e*2>"
  .off(1/8, add(7))
  .off(1/8, add(12))
  .note().piano()
  .jux(rev).slow(2)
```

- добавлен slow(2) для приближения к cps tidal
- n был заменён на note, потому что использование n не работает как note для samples
- legato 2 был удалён, потому что не работает в комбинации с rev (баг)

## Arpeggios из аккордов

TODO
