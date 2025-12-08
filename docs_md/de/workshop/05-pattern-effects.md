---
title: Pattern-Effekte
---

# Pattern-Effekte

Bis jetzt sind die meisten Funktionen, die wir kennengelernt haben, ähnlich wie Funktionen in anderen Musik Programmen: Sequencing von Sounds, Noten und Effekten.

In diesem Kapitel beschäftigen wir uns mit Funktionen die weniger herkömmlich oder auch einzigartig sind.

**rev = rückwärts abspielen**

```javascript
n("0 1 [4 3] 2").sound("jazz").rev()
```

**jux = einen stereo kanal modifizieren**

```javascript
n("0 1 [4 3] 2").sound("jazz").jux(rev)
```

So würde man das ohne `jux` schreiben:

```javascript
stack(
  n("0 1 [4 3] 2").sound("jazz").pan(0),
  n("0 1 [4 3] 2").sound("jazz").pan(1).rev()
)
```

Lass uns visualisieren, was hier passiert:

```javascript
stack(
  n("0 1 [4 3] 2").sound("jazz").pan(0).color("cyan"),
  n("0 1 [4 3] 2").sound("jazz").pan(1).color("magenta").rev()
)
```

Schreibe `//` vor eine der beiden Zeilen im `stack`!

**mehrere tempos**

```javascript
note("c2, eb3 g3 [bb3 c4]").sound("piano").slow("1,2,3")
```

Das hat den gleichen Effekt, wie:

```javascript
stack(
  note("c2, eb3 g3 [bb3 c4]").s("piano").slow(1).color('cyan'),
  note("c2, eb3 g3 [bb3 c4]").s("piano").slow(2).color('magenta'),
  note("c2, eb3 g3 [bb3 c4]").s("piano").slow(3).color('yellow')
)
```

Schreibe wieder `//` vor eine oder mehrere Zeilen im `stack`.

**add = addieren**

```javascript
note("c2 [eb3,g3]".add("<0 <1 -1>>"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)
```

Addiert man eine Zahl zu einer Note, verhält sich diese wie eine Zahl.

z.B. c4 = 60, also ist c4 + 2 = 62

Man kann auch mehrmals addieren:

```javascript
note("c2 [eb3,g3]".add("<0 <1 -1>>").add("0,7"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)
```

**add + scale**

```javascript
n("<0 [2 4] <3 5> [~ <4 1>]>*2".add("<0 [0,2,4]>/4"))
.scale("C5:minor").release(.5)
.sound("gm_xylophone").room(.5)
```

**Alles zusammen**

```javascript
stack(
  n("<0 [2 4] <3 5> [~ <4 1>]>*2".add("<0 [0,2,4]>/4"))
  .scale("C5:minor")
  .sound("gm_xylophone")
  .room(.4).delay(.125),
  note("c2 [eb3,g3]".add("<0 <1 -1>>"))
  .adsr("[.1 0]:.2:[1 0]")
  .sound("gm_acoustic_bass")
  .room(.5),
  n("0 1 [2 3] 2").sound("jazz").jux(rev).slow(2)
)
```

**ply**

```javascript
sound("hh, bd rim").bank("RolandTR707").ply(2)
```

das ist wie:

```javascript
sound("hh*2, bd*2 rim*2").bank("RolandTR707")
```

Probier `ply` mit einem pattern zu automatisieren, z.b. `"<1 2 1 3>"`

**off**

```javascript
n("<0 [4 <3 2>] <2 3> [~ 1]>"
  .off(1/8, x=>x.add(4))
  //.off(1/4, x=>x.add(7))
).scale("<C5:minor Db5:mixolydian>/4")
.s("triangle").room(.5).dec(.1).delay(.5)
```

In der Notation `x=>x.`, ist `x` das Pattern, das wir bearbeiten.

`off` ist auch nützlich für Sounds:

```javascript
s("bd sd,[~ hh]*2").bank("CasioRZ1")
  .off(1/8, x=>x.speed(1.5).gain(.25))
```

| Name | Beschreibung                      | Beispiel                                            |
| ---- | --------------------------------- | --------------------------------------------------- |
| rev  | rückwärts                         | `n("0 2 4 6").scale("C:minor").rev()`               |
| jux  | einen Stereo-Kanal modifizieren   | `n("0 2 4 6").scale("C:minor").jux(rev)`            |
| add  | addiert Zahlen oder Noten         | `n("0 2 4 6".add("<0 1 2 1>")).scale("C:minor")`    |
| ply  | multipliziert jedes Element x mal | `s("bd sd").ply("<1 2 3>")`                         |
| off  | verzögert eine modifizierte Kopie | `s("bd sd, hh*4").off(1/8, x=>x.speed(2))`          |
