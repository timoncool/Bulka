# Hydra

# Использование Hydra внутри Strudel

Вы можете писать код [hydra](https://hydra.ojack.xyz/) в strudel! Все, что вам нужно сделать, это вызвать `await initHydra()` в начале:

<MiniRepl
  client:only="react"
  tune={`await initHydra()
// licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// by Zach Krall
// http://zachkrall.online/

osc(10, 0.9, 300)
.color(0.9, 0.7, 0.8)
.diff(
osc(45, 0.3, 100)
.color(0.9, 0.9, 0.9)
.rotate(0.18)
.pixelate(12)
.kaleid()
)
.scrollX(10)
.colorama()
.luma()
.repeatX(4)
.repeatY(4)
.modulate(
osc(1, -0.9, 300)
)
.scale(2)
.out()

note("[a,c,e,<a4 ab4 g4 gb4>,b4]/2")
.s("sawtooth").vib(2)
.lpf(600).lpa(2).lpenv(6)
`}
/>

## H patterns

Существует специальная функция `H`, которая позволяет использовать pattern как вход для hydra:

```javascript
// Пример:
await initHydra()
let pattern = "3 4 5 [6 7]*2"
shape(H(pattern)).out(o0)
n(pattern).scale("A:minor").piano().room(1)

```

## detectAudio

Чтобы использовать захват аудио в hydra, вызовите `initHydra` с параметром конфигурации `{detectAudio:true}`:

<MiniRepl
  client:only="react"
  tune={`await initHydra({detectAudio:true})
let pattern = "<3 4 5 [6 7]*2>"
shape(H(pattern)).repeat()
  .scrollY(
    ()=> a.fft[0]*.25
  )
  .add(src(o0).color(.71 ).scrollX(.005),.95)
.out(o0)
n(pattern).scale("A:minor").piano().room(1)
`}
/>

Возможно, вы не сможете правильно увидеть это здесь: [открыть в REPL](/#YXdhaXQgaW5pdEh5ZHJhKCkKbGV0IHBhdHRlcm4gPSAiMyA0IDUgWzYgN10qMiIKc2hhcGUoSChwYXR0ZXJuKSkub3V0KG8wKQpuKHBhdHRlcm4pLnNjYWxlKCJBOm1pbm9yIikucGlhbm8oKS5yb29tKDEpIA%3D%3D)

Подобно `detectAudio`, все [доступные опции hydra](https://github.com/hydra-synth/hydra-synth#api) могут быть переданы в `initHydra`.

## feedStrudel

Используя опцию `feedStrudel`, вы можете трансформировать визуализации strudel с помощью hydra:

<MiniRepl
  client:only="react"
  tune={`await initHydra({feedStrudel:1})
//
src(s0).kaleid(H("<4 5 6>"))
  .diff(osc(1,0.5,5))
  .modulateScale(osc(2,-0.25,1))
  .out()
//

$: s("bd*4,[hh:0:<.5 1>]*8,~ rim").bank("RolandTR909").speed(.9)

$: note("[<g1!3 <bb1 <f1 d1>>>]\*3").s("sawtooth")

.room(.75).sometimes(add(note(12))).clip(.3)
.lpa(.05).lpenv(-4).lpf(2000).lpq(8).ftype('24db')

all(x=>x.fft(4).scope({pos:0,smear:.95}))`}
/>

