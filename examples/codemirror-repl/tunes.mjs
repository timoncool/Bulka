// Default tune - Pixel Sunrise
export const simpleTune = `// @title Pixel Sunrise
// @by Strudel композитор

cpm(180/2);

stack(
  arrange(
    // === БЛОК 1: ВСТУПЛЕНИЕ ===
    [4,
      stack(
        s("bd sd bd [sd sd*2]").crush(6).gain(0.1).bank("RolandTR808"),
        s("hh*16").gain(0.08).bank("RolandTR808").bpf(sine.range(500, 4000).slow(6)).bpq(4).pan(sine.slow(5))
      )
      ._scope()
    ],

    // === БЛОК 2: ОСНОВНАЯ ЧАСТЬ ===
    [16,
      stack(
        stack(
          s("bd sd bd [sd sd*2]").crush(6).gain(0.1).bank("RolandTR808"),
          s("hh*16").gain(0.08).bank("RolandTR808").bpf(sine.range(500, 4000).slow(6)).bpq(4).pan(sine.slow(5))
        )._scope(),

        n("0").chord("<Am F C G>").voicing()
          .s("square").decay(0.1).sustain(0).lpf(400).gain(0.12)
          .pan(sine.slow(8))
          ._scope(),

        n("0").chord("<Am F C G>").mode("root:c1").voicing()
          .s("triangle").lpf(sine.range(150, 500).slow(16)).lpq(3).room(0.5).gain(0.08)
          .pan(sine.slow(12))
          ._scope(),

        n("<0 2 4 5 7 5 4 2 7 5 9 7 11 9 7 5>").chord("<Am F C G>").voicing()
          .s("square").decay(0.15).sustain(0).gain(0.1)
          .phaser(sine.slow(6).range(2, 6))
          .jux(x => x.gain(0.5).speed(0.99))
          ._scope(),

        n("~ 4 ~ 3 ~ 2 ~ 0")
          .chord("<Am F C G>")
          .voicing()
          .s("triangle").decay(0.3).sustain(0).gain(0.08).room(0.4)
          .phaser(sine.slow(9).range(1, 5))
          .jux(x => x.gain(0.6).speed(1.01))
          ._scope()
      )
    ],

    // === БЛОК 3: БРЕЙКДАУН ===
    [8,
      stack(
        chord("<Am F C G>").voicing().s("sawtooth").attack(1).release(1.5).lpf(800).gain(0.07)
          .phaser(1)
          .pan(sine.slow(10))
          ._scope(),
        n("4 3 2 0 2 3 4 5")
          .chord("<Am F C G>").voicing()
          .s("triangle").decay(0.4).sustain(0).gain(0.1)
          .phaser(4)
          .delay(0.25).delayfeedback(0.5)
          .pan(sine.slow(4))
          ._scope()
      )
    ],

    // === БЛОК 4: КОНЦОВКА ===
    [8,
      stack(
        stack(
          s("bd sd bd [sd sd*2]").crush(6).gain(0.1).bank("RolandTR808"),
          s("hh*16").gain(0.08).bank("RolandTR808").bpf(sine.range(500, 4000).slow(6)).bpq(4).pan(sine.slow(5))
        )._scope(),

        n("0").chord("<Am F C G>").voicing()
          .s("square").decay(0.1).sustain(0).lpf(400).gain(0.12)
          .pan(sine.slow(8))
          ._scope(),
        n("0").chord("<Am F C G>").mode("root:c1").voicing()
          .s("triangle").lpf(sine.range(150, 500).slow(16)).lpq(3).room(0.5).gain(0.08)
          .pan(sine.slow(12))
          ._scope(),

        n("<0 2 4 5 7 5 4 2 7 5 9 7 11 9 7 5>").chord("<Am F C G>").voicing()
          .s("square").decay(0.15).sustain(0).gain(0.1)
          .phaser(sine.slow(6).range(2, 6))
          .jux(x => x.gain(0.5).speed(0.99))
          ._scope(),

        n("~ 4 ~ 3 ~ 2 ~ 0")
          .chord("<Am F C G>")
          .voicing()
          .s("triangle").decay(0.3).sustain(0).gain(0.08).room(0.4)
          .phaser(sine.slow(9).range(1, 5))
          .jux(x => x.gain(0.6).speed(1.01))
          ._scope()
      )
    ]
  )
).gain(0.15);
`;

// Drum machines tune - fully local samples
export const drumDemo = `// Drum machines demo (RolandTR808)
// All samples are 100% local - zero external dependencies!
samples('./tidal-drum-machines.json', './samples/tidal-drum-machines/machines/')
samples('./samples/Dirt-Samples/strudel.json')
samples('./samples/felixroos/strudel.json')
samples('./samples/clean-breaks/strudel.json')

s("bd sd bd [sd sd*2]").bank('RolandTR808').gain(0.8)
.stack(
  s("hh*8").bank('RolandTR808').gain(0.4),
  s("~ cp ~ cp").bank('RolandTR808').gain(0.6)
)`;

export const bumpStreet = `// froos - "22 bump street", licensed with CC BY-NC-SA 4.0
// All samples 100% local
samples('./tidal-drum-machines.json', './samples/tidal-drum-machines/machines/')
samples('./samples/Dirt-Samples/strudel.json')
samples('./samples/felixroos/strudel.json')
samples('./samples/clean-breaks/strudel.json')

"<[0,<6 7 9>,13,<17 20 22 26>]!2>/2"
  // make it 22 edo
  .fmap(v => Math.pow(2,v/22))
  // mess with the base frequency
  .mul("<300 [300@3 200]>/8").freq()
  .layer(
    // chords
    x=>x.div(freq(2)).s("flute").euclidLegato("<3 2>",8)
      .shape(.4).lpf(sine.range(800,4000).slow(8)),
    // adlibs
    x=>x.arp("{0 3 2 [1 3]}%1.5")
      .s('xylo').mul(freq(2))
      .delay(.5).delayfeedback(.4).juxBy(.5, rev)
      .hpf(sine.range(200,3000).slow(8)),
    // bass
    x=>x.arp("[0 [2 1?]](5,8)").s('sawtooth').div(freq(4))
      .lpf(sine.range(400,2000).slow(8)).lpq(8).shape(.4)
      .off(1/8, x=>x.mul(freq(2)).degradeBy(.5)).gain(.3)
  ).clip(1).release(.2)
.stack(
  // drums
  s("bd sd:<2 1>, [~ hh]*2, [~ rim]").bank('RolandTR909')
  .off(1/8, x=>x.speed(2).gain(.4)).sometimes(ply(2)).gain(.8)
  .mask("<0@4 1@12>/4")
  .reset("<x@15 [x(3,8) x*[4 8]]>")
  // wait for it...
).fast(2/3)
  //.crush(6) // remove "//" if you dare`;

export const trafficFlam = `// froos - "traffic flam", licensed with CC BY-NC-SA 4.0
// All samples 100% local
samples('./tidal-drum-machines.json', './samples/tidal-drum-machines/machines/')
samples('./samples/Dirt-Samples/strudel.json')
samples('./samples/felixroos/strudel.json')
samples('./samples/clean-breaks/strudel.json')

addVoicings('hip', {
  m11: ['2M 3m 4P 7m'],
  '^7#11': ['3M 4A 5P 7M'],
}, ['C4', 'C6'])

stack(
  stack(
    "<Bbm11 A^7#11>/2".voicings('hip').note()
    .s("gm_epiano1:2")
    .arp("[<[0 1 2 3] [3 2 1 0]> ~@5]/2")
    .release(2).late(.25).lpf(2000),
    "<Bb1 A1>/2".note().s('gm_acoustic_bass'),
    n("<0 2 3>(3,8)".off(1/8, add(4)))
    .scale("<Bb4:minor A4:lydian>/2")
    .s('gm_electric_guitar_jazz')
    .decay(sine.range(.05, .2).slow(32)).sustain(0)
    .delay(.5).lpf(sine.range(100,5000).slow(64))
    .gain(.7).room(.5).pan(sine.range(0,1).slow(11))
  ).add(perlin.range(0,.25).note()),
  stack(
    s("bd:1(3,8) rim").bank('RolandTR707').slow(2).room("<0 <.1 .6>>")
    .when("<0@7 1>",x=>x.echoWith(3, .0625, (x,i) => x.speed(1+i*.24))),
    s("rim*4").end(.05).bank('RolandTR808').speed(.8).room(.2)
  )
)
  .late("[0 .05]*2").late(12)

`;

export const funk42 = `// froos - how to funk in 42 lines of code
// adapted from "how to funk in two minutes" by marc rebillet
// All samples 100% local
samples('./tidal-drum-machines.json', './samples/tidal-drum-machines/machines/')
samples('./samples/Dirt-Samples/strudel.json')
samples('./samples/felixroos/strudel.json')
samples('./samples/clean-breaks/strudel.json')

setcps(.5)

let drums = stack(
  s("bd*2, ~ sd").bank('RolandTR707').room("0 .1"),
  s("hh*4").begin(.2).release(.02).end(.25).release(.02)
  .gain(.3).bank('RolandTR707').late(.02).room(.5),
  //s("shaker_small").struct("[x x*2]*2").speed(".8,.9").release(.02)
).fast(2)

let wurli = note(\`<
[[a2,g3,[b3 c4],e4] ~ [g3,c4,e4](3,8)@4 ~@2]!3 
[[e2,e3,a3,b3,e4]@3 [e2,e3,ab3,b3,e4]@5]>\`)
  .s("gm_epiano1:5").decay(.2).sustain("<[1 0@7]!3 1>")
  .gain("<[.8@2 .4@14]!3 .7>").room(.3)

let organ = note("<[~@3 [a3,d4,f#4]@2 [[a3,c4,e4]@2 ~] ~@2]!3 ~>".add(12))
    .s("gm_percussive_organ:2").gain(.6).lpf(1800).pan(.2).room(.3);

let clav = note(\`<
[~@3 a2 [g3,[b3 c4],e4]@2 ~ a2 [g3,b3,e4] ~@2 [g3,c4,e4] ~@4]!3
[~@3 e3 [[a3 b3],c3,e3]@2 ~ e2 [e3,a3]@3 [b3,e3] ~@2 [b3,e3]@2]>\`)
  .s("gm_clavinet:1").decay("<.25!3 [.25 .4]>").sustain(0)
  .gain(.7).pan(.8).room(.2);

let bass = note(\`<
[a1 [~ [g2 a2]] [g1 g#1] [a1 [g2 a2]]] 
[a1 [~ [g2 a2]] [e3 d3] [c3 [g3 a3]]] 
[a1 [~ [g2 a2]] [g1 g#1] [a1 [g2 a2]]] 
[e2@6 e1@5 e1 [[d2 e3] g1]@4]
>\`).s("gm_electric_bass_pick:1").release(.1)

stack(
  drums
  ,wurli
  ,organ
  ,clav
  ,bass
)`;
