export const examples = [
  `await initHydra()

// ПИКСЕЛЬНАЯ АУДИОРЕАКТИВНАЯ HYDRA
osc(20, 0.05, 1)
  .pixelate(H("20 60 30 80"), H("15 40 25 60"))
  .modulateScale(noise(3,0.3), H("0.2 0.6 0.3"))
  .contrast(1.2)
  .brightness(-0.2)
  .out()

// "coastline" @by eddyflux
// @version 1.0
samples('github:eddyflux/crate')
setcps(.75)
let chords = chord("<Bbm9 Fm9>/4").dict('ireal')
stack(
  stack( // DRUMS
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.5)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  , // CHORDS
  chords.offset(-1).voicing().s("gm_epiano1:1")
  .phaser(4).room(.5)
  , // MELODY
  n("<0!3 1*2>").set(chords).mode("root:g2")
  .voicing().s("gm_acoustic_bass"),
  chords.n("[0 <4 3 <2 5>>*2](<3 5>,8)")
  .anchor("D5").voicing()
  .segment(4).clip(rand.range(.4,.8))
  .room(.75).shape(.3).delay(.25)
  .fm(sine.range(3,8).slow(8))
  .lpf(sine.range(500,1000).slow(8)).lpq(5)
  .rarely(ply("2")).chunk(4, fast(2))
  .gain(perlin.range(.6, .9))
  .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)`,
  `// @title Unnamed Rhythmic Pattern 4/4 + ~ January 6, 2025
// @by @quincy@chaos.social
// @license CC0
// 2025-01-06
// @version 1.0

setcps(2)

let pat = "<7 [0 1] [<3 3 1 3> 0] [0 1] ~@4>"
let heavy = "<<x z> [y y] [<z x x x> y] [y x] ~@4>"
.inhabit({y:perlin.range(0.7,0.9),
z:perlin.range(0.9,1.1),
x:perlin.range(1.1,1.3)})

$: n(pat).s("cajon,agogo").gain(heavy).room(0.28).clip(1)

$: n(run(4).late("<1 1/2 1/2 1/2>").slow("<1 2 2>"))
.gain(perlin.range(0.8,1.2).fast(8))
.velocity("<[2 1 1 1]>")
.mask("1|[1 0 1 1]")
.mask("<0@3 <0 [0 1@3]> 1@3 1>").s("cajon")
.lpf(1000).lpa(0.2).clip(1)

$: note(<c3@3 b2 c3@3 c2>)
.s("sine")
.adsr("0.1:0.1:0.8:0.1")
.fm("0.75:1") // play with this
.compressor("-10:2:1:.02:.02")
.clip(1);`,
  `// @title unnamed (harp) (2025-06-08)
// @by @quincy@chaos.social
// @license CC BY-NC-SA
// @details Version 0.0.2 (2025-06-08)
// @version 1.1

setcps(0.54)

let m1 = "<[0 1] 0 1 0 [0 1] 0 [1 0] 0>".fast(8)

$: n(run(20).palindrome())
.scale("<C:ultralocrian>").s("folkharp").struct("x*16")
.iter(4)
.sometimes(mask(m1.superimpose(rev)))

$: n(run(16).rev()).s("east").struct("x*16")
.palindrome().chunk(2, rev).gain(sine.range(0,1).slow(8))`,
  `/*
@title Theme From Ernest Borgnine
*/
const melody = "<G#5 G5 F5 F4 G#5 D#4 _ D#4 D#5 _ F5 C#4 G#5 _ A#5 C4 C5 _ C#5 F4 _ G#5 G5 D#4 _ F5 D#5 C#4 C6 G#5 A#5 C7>"

setcpm(165 / 4)
$:note(melody)
.fast(8)
.s("saw")
.lpf(1800).lpa(.5).lpenv(-1).ftype(2)
.decay(.7).sustain(.9).release(.1)
.room(1).rfade(17)
.orbit(2)
.gain(.5)
._pianoroll()
$:note(melody)
.fast(8)
.s("sin")
.transpose(-12)
.attack(0).decay(.9).sustain(.9)
.delay(.3).delayfeedback(.4)
.gain(.4)
._scope()`,
  `// @title chords

cpm(120/4)
addVoicings('octave', {
M: ['0 4 7'],
m: ['0 3 7'],
M8: ['0 4 7 12'],
m8: ['0 3 7 12'],
weird: ['0 3 8 12 15 20']
})

let chords = chord(\`<
~
FM8!2
CM8!2
FM8!2
CM8!2
Dm GM8
Eweird@2
[Dm@2 Dm FM@2 Am@2 GM@9]@2
[CM@2 CM Em@2 GM@2 FM@9]@2
[Dm@2 Dm FM@2 Am@2 GM@9]@2
[CM@2 CM Em@2 GM@2 FM@9]@2
FM
[Dm@2 Dm FM@2 Am@2 GM@9]@2
[CM@2 CM Em@2 GM@2 FM@9]@2
[Dm@2 Dm FM@2 Am@2 GM@9]@2
[CM@2 CM Em@2 GM@2 FM@9]@2

\`).anchor("<e4!12>").dict('octave')

// --------------------------------------------

chords: stack(chords.voicing().struct(\`<
~
x!10
x@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@3 ~ x]
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2

\`).sound("gm_epiano1:5"), chords.voicing().struct(\`<
~!11
~@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
~
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2
[x@2 x x@2 x@2 x@9]@2

\`).transpose(12).sound("gm_epiano1:5").gain(.6)).orbit(1).room(.5)._punchcard()
// --------------------------------------------

lead: stack(n(\`< ~ [[7@2 4 [9|12]@2 6@3] [7@2 6 [[7|12] 9]@2 [4|6]@3]]@2!10/2 [7@2 4 [9|12]@2 6@3] [3@2 3 3@2 3 3@2] [[7@2 4 [9|12]@2 6@3] [7@2 6 [[7|12] 9]@2 [4|6]@3]]@2!8/2 ~!8>\`).set(chords).anchor("<c3>").voicing(), note(\`<
~!22
[d4@2 c4 b3@2 a3@2 g3@2 [g3 ~] f3 [f3 ~] e3 [e3 ~] d3 d3]@2
[e4@2 d4 c4@2 b3@2 a3@2 [a3 ~] g3 [g3 ~] f3 [f3 ~] e3 e3]@2
[f4@2 e4 d4@2 c4@2 b3@3 [d3 f3 d3 c3 f3 c3 b2 f3 b2]@6]@2
[e4@2 d4 c4@2 b3@2 a3@9]@2

\`).transpose(24)).sound("gm_epiano1:5").orbit(2).lpf(800)._punchcard()
// --------------------------------------------

const detuneVoice = register('detuneVoice', (pat) => pat.late(perlin.range(-0.001, 0.001)).add(perlin.range(-0.01,0.01)))

voice: note(\`<
[[[~ ]@1.9 [g4 e4 e4 d4 d4 c4]@6.1 d4@8 ]@2
[ e4!2 d4!2 c4 [e4, g4]@2.1 [e4 d4@7]@7.9 ]@2]@4!8/4
[[~ ]@1.9 [g4 e4 e4 d4 d4 c4]@6.2 d4@7.9 ]@2
[ ~ e4 d4 d4 c4 g4@2 e4@2 d4@3 e4 d4 c4@4 ~ ~ c4 d4 e4]@3
[~ ~ f4!3 e4 d4 c4 b3@6 c4 d4]@2
[~ ~ e4!3 d4 c4 b3 a3@8]@2
[~ f4!4 e4 d4 c4 b3@3 b3@5]@2
[~ ~ e4!3 d4 c4 b3 a3@3 a3@5]@2
[ ~ ~ ~ ~ ~ f4 g4 a4]
~
[ ~ ~ ~ ~ ~ a4 e4 g4@5 ~ ~ ~ ]@2
[ [ ~ ~ ~ ]@4.8 [g4@1 a4@1 f4@7 e4 d4]@11.2]@2
[ ~ ~ ~ ~ ~ ~ d4 c4@2 d4 c4 b3@2 d4 a3]@2
~

\`.detuneVoice()).sound("gm_voice_oohs:3").transpose(-12).attack(0.075).decay(0.3).release(.3).orbit(3).clip(1).room(2)`,
  `/*
@title Array (Lil Data Edit)
@by DJ_Dave
@album Intercell [The Live Code Edits]
@license CC BY-NC-SA (code)
@url https://instagram.com/lildata.music
*/

// load sample pack...
samples({
build_bass: ['snd/bass/build_0.mp3', 'snd/bass/build_1.mp3', 'snd/bass/build_2.mp3', 'snd/bass/build_3.mp3'],
build_synth: ['snd/synth/build_0.mp3','snd/synth/build_1.mp3','snd/synth/build_2.mp3','snd/synth/build_3.mp3'],
build_vox: ['snd/vox/build_0.mp3', 'snd/vox/build_1.mp3', 'snd/vox/build_2.mp3', 'snd/vox/build_3.mp3'],
drop_vox: ['snd/vox/drop_0.mp3', 'snd/vox/drop_1.mp3', 'snd/vox/drop_2.mp3', 'snd/vox/drop_3.mp3',
'snd/vox/drop_4.mp3', 'snd/vox/drop_5.mp3', 'snd/vox/drop_6.mp3', 'snd/vox/drop_7.mp3',
'snd/vox/drop_8.mp3'],
verse_vox: ['snd/vox/verse_0.mp3', 'snd/vox/verse_1.mp3', 'snd/vox/verse_2.mp3', 'snd/vox/verse_3.mp3',
'snd/vox/verse_4.mp3', 'snd/vox/verse_5.mp3', 'snd/vox/verse_6.mp3', 'snd/vox/verse_7.mp3',
'snd/vox/verse_8.mp3'],
sub: ['snd/bass/sub_0.mp3', 'snd/bass/sub_1.mp3', 'snd/bass/sub_2.mp3'],
bass: ['snd/bass/bass_0.mp3', 'snd/bass/bass_1.mp3', 'snd/bass/bass_2.mp3'],
kick: 'snd/perc/kick.mp3',
sn: 'snd/perc/sn.mp3',
cp: ['snd/perc/cp.mp3', 'snd/perc/cp2.mp3'],
tom: 'snd/perc/tom.mp3',
hc: 'snd/perc/hc.mp3',
shaker: 'snd/perc/shaker.mp3',
break: 'snd/perc/break.mp3',
guitar: ['snd/perc/guit1.mp3', 'snd/perc/guit2.mp3'],
}, 'github:lil-data/dj_dave-array_remix/main/');

// hack: https://github.com/tidalcycles/strudel/issues/119
const loopAx = register('loopAx',
(l, pat) => pat.loopAt(l).chop(l*8).legato(1).mul(speed(0.99))
);
const setbpm = t => setcps(t/4/60)

setbpm(140)

/*
So I try...
*/
let build = stack(
n("<0 1 2 3>").s("bass").bank("build").loopAx(4),
n("<0 1 2 3>").s("synth").bank("build").loopAx(4),
n("<0 1 2 3>").s("vox").bank("build").loopAx(4),
)

let predrop = n("0").s("vox").bank("drop").loopAx(2)

/*
I swear to god I always thought in the end I'd get you back
Now every day I see your face you give me a heart attack
*/
let drop = stack(
n(run(8).add(1).slow(8)).s("vox").bank("drop").loopAx(2)
.mask(cat([
"1!6 0!2", "1!3 0 1!2 0 1",
"1!6 0!2", "1",
"0 1!2 0 1!2 0 1", "1",
"0 1 0 1 0 1 0!2", "1!7 0"
]).slow(16)),
stack(
stack(
s("sub(5,16)").end(0.95).mask("[0 1]/8"),
s("kick(5,16)"),
s("cp(5,16)").late(3/32),
s("tom(5,16)").end(0.95).late(4/32)
).slow(2)
.note("[0 1]/4".add(36))
.mask(cat([
"[1 [1 0!7]]",
"[1 [1 0] 0 1 [1 0] 0 1!2]",
"[1 [1 0]]",
"[1 [1 0] 0 1 [1 0] 0!3]",
]).slow(8))),
stack(
s("guitar").n("[0 1]/8").loopAx(0.5)
.mask("0!3 1 0!11 1".slow(8)),
s("break").loopAx(0.5).mask("0!15 1".slow(8)),
s("hc*4").ply(cat([
"[!6 2!7 !3]",
"[[9 ] [6 ]] 3 3 2",
"2 3 [[6 ] [9 ]] ",
"[2 3] !3"
]).slow(8))).mask("[1 0]/16"),
stack(
s("shaker").loopAx(2),
s("break").loopAx(0.5).mask("[0!3 [0 1]] [0 [0 1] 0!2]".slow(8)),
s("cp:1").struct("[!7 x] ".slow(4)).gain(0.6),
s("sn").struct(cat([
" x ~ [ x] [!15 x] [x ~ ~ x] [ x ~ x] x",
" x ~ [*2 x*2]!2 [ x ~ ] ~ [*2 x*2]",
" x ~ [~ x] [!15 x] x ~ ",
" x ~ [*2 x*2]!2 ~!3",
]).slow(8))
).mask("[0 1]/16"),
)

/*
Where'd you go?
I saw your face and moments later I was on the floor
(I swear to god I always thought in the end I'd get you back)
Putting the pieces together but still you needed more
It's still so hard to see you cry I just want answers for
What else I could possibly give you now it's all for show
Where'd you go?
Pieces together but still you
On the floor / needed more
Hard to see you cry I just want
Answers for / wherе'd you go?
Face and moments later I was
On thе floor, where'd you go? Where'd you go? Where'd you go?
*/
let verse = stack(
n(run(8).slow(8)).s("vox").bank("verse").loopAx(2),
s("bass:[0 0 [0 1] [1 2]]/8, sub:[1 2]/8")
.note(cat([
"[0!7 7] [1!3 5] [0!7 12] [7 4 5 [5 12]]",
"[0 [0 .. 7]] [1!3 5] [0!7 12] [7 4 5 [5 2]]"
]).slow(8)).add(36)
.struct(cat([
"x@3!5 x x@3!5 x",
"x@3!5 x x@3!5 x",
"[[x@3 x@3 x@2] [x*8]] [x@3!5 x]",
"x@3!5 x x@3!5 x",
]).slow(8))
.mask(cat(["1","1","1 0 0 [0 1]","1","1","1","1","1"]).slow(8))
.slow(2)
)

let postverse = stack(
n("[8 ]/2").s("vox").bank("verse").loopAx(2),
n("[ 0]/2").s("vox").bank("drop").loopAx(2),
s("bass:2, sub:2").note("[2 5]").add(36)
.struct("[~@2 x@3!10]")
.mask("[1!7 0]")
.slow(4)
)

arrange(
[16, build],
[2, predrop],
[16, drop],
[16, verse],
[4, postverse]
).fontFamily("x3270")
.theme("[teletext algoboy terminal abcdef androidstudio atomone aura bespin darcula dracula duotoneDark eclipse githubDark gruvboxDark materialDark nord okaidia solarizedDark sublime tokyoNight tokyoNightStorm vscodeDark xcodeDark bbedit duotoneLight githubLight gruvboxLight materialLight noctisLilac solarizedLight tokyoNightDay xcodeLight]/54")
.color("[fuschia [aquamarine dodgerblue] [hotpink] blueviolet deeppink [cornsilk indigo] crimson cyan]/27")
.punchcard({fold:1,flipTime:1,vertical:1})`,
  `// @title Billie Jean
// @by MJ
// @license cl
// arranged by sinus@sinpi.net
// @version 1.0

setcps(0.5)
// setcps(8) //FAST
// setcps(0.3) //SLOW
// map
const structure = \`<intro@14 verse1@12 verse2@12 bridge@8 ref@12 verse3@12 verse4@12 bridge@8 ref@12 ref@12 solos@8>\`

// BASS
const basspatt = structure.pickSqueeze({
intro: \`- - walk@4 walk@4 walk@4\`,
verse1:\`walk@4 walkup walkdn walk@2 walkup walkdn walk@2\`,
verse2:\`walk@4 walkup walkdn walk@2 walkup walkdn walk@2\`,
bridge:\`bridga bridgb bridga bridgb bridga bridgb bridge briddd\`,
ref: \`walk@4 walkup walkdn walk@2 walkup walkdn walk@2\`,
verse3:\`walk@4 walkup walkdn walk@2 walkup walkdn walk@2\`,
verse4:\`walk@4 walkup walkdn walk@2 walkup walkdn walk@2\`,
solos: \`walk@4 walk@4\`
})
var BASS=note(basspatt.pick({
walk: "a1 e1 g1 a1 g1 e1 d1 e1",
walkup:"d2 a1 c2 d2 - a1 g1 a1",
walkdn:"d2 a1 c2 d2 - a1 g1 e1",
bridga:"f1@4 - f1 - [g1 g#1]",
bridgb:"a1@4 a0@2 a1 a0",
bridge:"f1@4 - f1 - [g1 c1]",
briddd:"e1 e1 e1 e1 e1 e1 e1 e1",
}))
.dec(basspatt.pick({
walk: "[.4 .2 .2 .4 .2!4]", //0
walkup:"[.4 .2 .2 .4 - .2 .3 .2]", //1
walkdn:"[.4 .2 .2 .4 - .2 .3 .2]", //2
bridga:"0",bridgb:"0",bridge:"0", //4,5,6
briddd:".2", //3
}))
.sus(basspatt.pick({
walk:".1", walkup:".1", walkdn:".1", briddd:".1", //0,1,2,3
bridga:".7", bridgb:".7", bridge:".7", //4,5,6
}))
.s('supersaw').lp(1000).clip(.95).room(0.2,10)

// DRUMS
const drumpatt=structure.pickSqueeze({
intro: \`a!2 a!4 a!4 a!4\`,
verse1:\`a!4 a!4 a!4\`,
verse2:\`a!4 a!4 a!3 b\`,
bridge:\`a!4 a!4\`,
ref: \`a!4 a!4 a!4\`,
verse3:\`a!4 a!4 a!4\`,
verse4:\`a!4 a!4 a!3 b\`,
solos: \`a!4 a!4 a!4 a!3 b\`})
var DRUMS=s(drumpatt.pick({
a:"[bd sh sd sh bd sh sd sh]",
b:"[bd sh sd sh bd sh sd [sd sd]]"
}))
.gain(drumpatt.pick({
a:".5 .6 .2 .6 .5 .6 .2 .6",
b:".5 .6 .2 .6 .5 .6 .2 [.2]",
}))

// CHORDS
var CHORDS=note(structure.pickSqueeze({
intro: \`-!5 0 0\`,
verse1:\`0 0 1 0 1 0\`,
verse2:\`0 0 1 0 1 0\`,
bridge:\`2 2 2 3\` ,
ref: \`0 0 1 0 1 0\`,
verse3:\`0 0 1 0 1 0\`,
verse4:\`0 0 1 0 1 0\`,
solos: \`0 0 0 0\`,
}).pickSqueeze([
"[{e3,a3} -@2 {e3,b3} -@4 {e3,c4} -@2 {e3,b3} -@4]",
"[{e3,a3} -@2 {e3,a3} -@4 {e3,a3} -@2 {e3,a3}@5]",
"[{f3,a3,c4} @7 - {e3,a3,c4} @7 -]",
"[{f3,a3,c4} @7 - {e3,g#3,b3} @7 -]"
]))
.s("square").lp(2500).v("0:2").att(0.05).dec(0.1).sus(0.2).clip(.9).room(0.7,10).gain(0.3)

// VOCALS
var VOCALS = note(structure.pickSqueeze({
intro:\`-\`,
verse1:\`[- - e3 e3 e3 d3 c3 d3 c3 e3@2 [d3 c3] [d3 -] [c3 -] e3@2] [- e3 e3 e3 e3 d3 c3 d3 c3 e3@2 d3@2 c3 b2 a2] [- - - - [[- - [a2 b2] a2]!3]@12] [-@8 - a2 c3 d3@2 c3 b2 a2] [- - - - [[- - [a2 b2] a2]!3]@12] [- - - - - - - - - - - - - - - -]\`,
verse2:\`[- - e3 e3 e3 d3 c3 d3 c3 e3@2 [d3 c3] [d3 -] [c3 -] e3@2] [- e3 e3 e3 e3 d3 c3 d3 c3 e3@2 d3@2 c3 b2 a2] [- - - - [[- - [a2 b2] a2]!3]@12] [-@8 - a2 c3 d3@2 c3 b2 a2] [- - - - [[- - [a2 b2] a2]!3]@12] [- - - - - - - - - - - - - - - -]\`,
bridge:\`[a3 - a3 a3 - a3 - a3 - c4@3 - - a3 - c4 - a3 a3 - g3 - a3 g3 e3@2 - - - a3 -] [a3 - a3 a3 - a3 - a3 - c4@5 b3 a3 -@8 - - - - - - a3 -] [[a3 g3 - a3 g3 -]@7 a3 - c4@3 - - a3 - c4 - a3 a3 - g3 - a3 g3 e3@2 - - - a3 -] [f3 - f3 f3 - g3 - a3@5 - - a3 - g#3 - g#3 g#3 - [a3 - b3@2 - -]@7 - - - - ]\`,
ref:\`[- - a3 a3 [g3@3 -]@2 e3 - [a3 -] [a3@3 -]@2 g3@2 e3 - - ] [- [a3 -] [a3 -] [a3 -] g3@2 e3 - [a3 -] c4 - d4@2 c4 b3 a3 ] [- - - - - a3 - [a3 -] e4@2 d4 - [a3 -] f3 - e3 ] [-@8 - [a3 -] [c4 -] d4@2 c4 b3 a3 ] [- - - - - a3 - [a3 -] e4@2 d4 - [a3 -] f3 - e3 ] [ - ]\`,
verse3:\`[- e3 e3 e3 e3 d3 c3 d3 c3 e3@2 [d3 c3] [d3 -] [c3 -] e3@2] [- e3 e3 e3 e3 d3 c3 d3 c3 e3@2 [d3 c3 b2]@5] [b2 a2 - - [[- - [a2 b2] a2]!3]@12] [-@8 - a2 c3 d3@2 [c3 b2]@3 ] [a2@2 - - - - [a2 -] a2 [f3 e3 c3 b2 a2 f2]@8] [e2@2 - - - - - - - - - - - - - -]\`,
verse4:\`[- e3 e3 e3 e3 d3 c3 d3 c3 e3@2 [d3 c3] [d3 -] [c3 -] e3@2] [- e3 e3 e3 e3 d3 c3 d3 c3 e3@2 [d3 c3 b2]@5] [b2 a2 - - [[- - [e3 d3] [d3 c3]]!2]@8 - - [e3 d3] [d3 c3]] [a2 -@7 - a2 c3 [d3 c3 b2]@5 ] [a2@2 - - - - [a2 -] a2 [f3 e3 c3 b2 a2 f2]@8] [e2@2 - - - - - - - - - - - - - -]\`,
solos:\`

\`
}))
.trans(12).s('sawtooth').clip(0.95).cut(1).att(.02).dec(0.15).sus(0.4).rel(.05).velocity(0.9).lp(3000).room('.6:5')

// CHOIR
$: note(structure.pickSqueeze({
intro:"-@7",
verse1:\`[ - ] [ - ] [- - - - [[- - [a2 b2] a2]!3]@12] [ - ] [- - - - [[- - [a2 b2] a2]!3]@12] [ - ]\`,
verse2:\`[ - ] [ - ] [- - - - [[- - [a2 b2] a2]!3]@12] [ - ] [- - - - [[- - [a2 b2] a2]!3]@12] [ - ]\`,
bridge:\`[ - ] [ - - - [e3@2 d3 c3@2 -] ] [ - ] [ -@16 -@4 - [- - -@2 e3 -]@7 e4@2 - - ]\`,
ref:\`-@6\`,
verse3:\`[ - ] [ - ] [- - - - [[- - [a2 b2] a2]!3]@12] [ - ] [- - - - - - - a2 [f3 e3 c3 b2 a2 f2]@8] [e2@2 - - - [d3 c3 a2]@4 [d3 c3 a2]@4 - - -]\`,
verse4:\`[ - ] [ - ] [- - - - [[- - [e3 d3] [d3 c3]]!2]@8 - - [e3 d3] [d3 c3]] [a2 -@7 - - - -@5 ] [- - - - - - - a2 [f3 e3 c3 b2 a2 f2]@8] [e2 - - - - - - - - - - - - - - -]\`,
solos:\`-@4\`
}))
.delay(0.1)
.trans(24).s('sawtooth').clip(0.9).cut(1).att(.02).dec(0.15).sus(0.4).rel(.05).velocity(0.5).lp(3000).room('.8:5')
.echo(4,0.2,0.3)

const guitpatt = \`<
- -
-@4
-@4 -@4

-@12
-@12

-@8

-@4 0@2 1 - 0@2 1 -

-@12
-@12

-@8

3 3 3 2 0@2 1 - 0@2 1 -
3 3 3 2 0@2 1 - 0@2 1 -

2@2 3 2  2@2 3 2

\`
// GUITAR SOLO
$: note(guitpatt.pick([
"[[a3@3 -]@2 [a3 -@7] [a3 -@7]]*4",
"a3 -@7",
"[e4 e4 - d4 - c4 e4@4 - - - - - -]",
"[[e4 e4 - d4 - c4 - - ]*2]@2"
])
.sub(12))
.velocity(guitpatt.pick([
"[0.4 - 0.2 0.3]*4",
"0.6",
"0.4"]))
.dec(guitpatt.pick([
"[.3 - .2 .2]*4",
".3",
".3"
]))
.gain(0.9)
.s('saw').adsr(".0:.2:.2:0.03").distort("3.4:0.17").lpf(1200).lpq(11)

// WHISPER
const whispatt = \`< 1 1 1 1 1 0@2 1 1 1 - - - - -@12 -@12 -@8 -@12 -@12 -@12 -@8 -@12 -@12 -@8>\`
$: note(whispatt.pick(["[- [-@7 [c1 c1]] [c1@4 -@4] -]/4","0"]))
.pan(whispatt.pick(["[0 [0@7 [1 -1]] [1@4 0@4] 0]/4","0"]))
.lp(whispatt.pick(["[0 [999@7 [5000 4000]] 8000 0]/4","0"]))
.s('white').echo(7,0.15,0.4).att(0.1).dec(0.6).velocity(0.3)

// SYNTH
const syntpatt = \`<
- -@4 -@2

-@6
-@6

[  [f3@5 [g3 f3]@3] [e3@3 [a4 -] [c4@2 a4 - g5@2 e5@2]@4]  ]
-
[  [f3@5 [g3 f3]@3] [e3@3 [a4 -] [c4@2 a4 - g5@2 e5@2]@4]  ]
-

-@6

[e3@6 f#3 d3]
[e3@6 d3 c3]
a2
- - -

[e3@6 f#3 d3]
[e3@6 d3 c3]
a2
- - -

[  [f3@5 [g3 f3]@3] [e3@3 [a4 -] [c4@2 a4 - g5@2 e5@2]@4]  ]
-
[  [f3@5 [g3 f3]@3] [e3@3 [a4 -] [c4@2 a4 - g5@2 e5@2]@4]  ]
-

-@6

-@5
[[- e4 e5 e4 [e5 c5] [b4 a4] e4 -]@4 - - - -]

-@4

\`
$: note(syntpatt.slow(2))
// $: note("a3 c4 e4 c4".slow(2))
.s('triangle').v('0:2').dec(2).sus(0.0).rel(0.3).clip(0.95).diode("2.8:0.5").hp(500).postgain(0.10)

// HEE AAH
$: note(\`
-@7

-@6
-@6

-@4

- - [d5 e5@4 d5 c5 a4@2 -@24] [-@2 - [e5@2 d5 c5 a4@2 - -] -@2 -@2 -@8] - -

-@6
-@6

-@4

-@6
-@6

-@4

\`.pace(0.5))
.s('triangle').cut(1).att(0).dec(0.25).sus(0.4).rel(.05).velocity(0.5).lp(3000).room('.8:15')

$: stack(
BASS._scope(),DRUMS._scope(),CHORDS._scope(),VOCALS._scope()
)`,
  `// @title chords demo

let chords = chord(\`<
C G F G
C Am F G
C F Am G
F C [Am F] G

\`)
const melody = n("<4 <8,4 -,- 8> 4 2>*4 <- <12,4 -> 4 4>*4")
.anchor("F5")
.set(chords).voicing()
.dec(.2).delay(.3)
._punchcard()
const chime = n("<0@2 - - - 2 1 3 4@2 - - - 2 1 3 >*4").anchor("F5")
.set(chords).voicing().s("gm_fx_crystal")
._punchcard()
const guitar= chords.struct("x x@2 [x!3]").voicing().room(.05).s("supersaw").gain(.3)
const bass2 = n("0 - - 2!3").set(chords).mode("root:f2").voicing().s("gm_synth_bass_2")
._punchcard()
const bass = n("0 - 1 -").set(chords).mode("root:f2").voicing().s("gm_synth_bass_2")
const bassIntro =stack( bass, bass2)
// ._punchcard()
const drums = sound("[bd <oh -> <- bd> hh]")
const drums2 = sound("[bd - [clap clap] hh]")
const allDrums = stack(drums,drums2)

stack(
arrange([8,drums],[8,drums],[8,drums],[8,drums],[2,drums2],[6,allDrums],[6,allDrums],[2,silence]).room(0.1).color("green"),
arrange([4,silence],[4,bassIntro],[8, bassIntro], [16,bass],[16,silence]).room(0.05).color("blue"),
arrange([8,silence],[8,guitar],[24,guitar],[8,silence]).color("purple"),
arrange([8,silence],[8,silence],[8,melody],[7,melody],[1,silence],[8,melody],[7,melody],[1,silence]).color("yellow"),
arrange([8,silence],[8,silence],[8,silence],[8,silence],[8,chime],[8,silence]).color("white"),
)
._pianoroll()`,
  `// Koji Kondo - Princess Zelda's Rescue
stack(
// melody
\`[B3@2 D4] [A3@2 [G3 A3]] [B3@2 D4] [A3] [B3@2 D4] [A4@2 G4] [D4@2 [C4 B3]] [A3] [B3@2 D4] [A3@2 [G3 A3]] [B3@2 D4] [A3] [B3@2 D4] [A4@2 G4] D5@2 [D5@2 [C5 B4]] [[C5 B4] G4@2] [C5@2 [B4 A4]] [[B4 A4] E4@2] [D5@2 [C5 B4]] [[C5 B4] G4 C5] [G5] [~ ~ B3]\`
.color('#9C7C38'),
// bass
\`[[C2 G2] E3@2] [[C2 G2] F#3@2] [[C2 G2] E3@2] [[C2 G2] F#3@2] [[B1 D3] G3@2] [[Bb1 Db3] G3@2] [[A1 C3] G3@2] [[D2 C3] F#3@2] [[C2 G2] E3@2] [[C2 G2] F#3@2] [[C2 G2] E3@2] [[C2 G2] F#3@2] [[B1 D3] G3@2] [[Bb1 Db3] G3@2] [[A1 C3] G3@2] [[D2 C3] F#3@2] [[F2 C3] E3@2] [[E2 B2] D3@2] [[D2 A2] C3@2] [[C2 G2] B2@2] [[F2 C3] E3@2] [[E2 B2] D3@2] [[Eb2 Bb2] Db3@2] [[D2 A2] C3 [F3,G2]]\`
.color('#4C4646')
).transpose(12).slow(48)
.superimpose(x=>x.add(0.06)) // add slightly detuned voice
.note()
.gain(.1)
.s('triangle')
.room(1)
//.pianoroll({fold:1})`,
  `// "pitchwheel demo" @by froos

let fx = x=>x.add(note(sine.slow(4))).room(.5).size(6).color('cyan')

p1:
//note("<c eb g bb <d4 f4>>*4").jux(rev)
note("[c2,g3,eb4]*8").gain(isaw.add(.1).fast(2))
//.off(1/8 ,add(note(7)))
.apply(fx)
.s("sawtooth").lpd(perlin.range(.1,.5))
.lpf(perlin.range(50,1000).slow(8))
.lpenv(rand.range(2,4)).postgain(.7)
._pitchwheel({mode:'polygon'})
p2: n("<0 1 2 3 4>*4")
.scale("C5:hirajoshi").late(.125)
.s("sine").fm(2).fmh("6".add(rand))
.lpf(cosine.range(500,2000))
.gain(rand)
.echo(4,.25,.5)
//.jux(rev)
.dec(.1).sustain(rand.range(0,.5))
.room(.6)
.apply(fx)
._pitchwheel()`,
  `/*
@title BIRDS OF A FEATHER (REMAKE)
@by saga_3k https://linktr.ee/saga3k
@license CC BY-NC-SA
*/
// @version 1.1

setcps(105/60/4)

// melody (1 bar loop)
let m1 =
note("<[D@3 A@2 ~ D@2] [Cs@2 ~ A@2 ~ Cs@2]>".add("12,24")).s("gm_kalimba:3").legato(1.5).fast(2)
.attack(.025).release(.2).lp(1000)
.room(".6:2").postgain(1.5).color('#4dbcf4')._pitchwheel({edo:12,hapRadius:3,thickness:3,circle:1})

// melody with guitar layer (1 bar loop)
let m2 =
note("<[D@3 A@2 ~ D@2] [Cs@2 ~ A@2 ~ Cs@2]>".add("12,24"))
.layer(
x=>x.s("gm_kalimba:3").legato(1.5).attack(.025).release(.2).lp(1000).room(".6:2").postgain(2),
x=>x.s("gm_acoustic_guitar_steel:6").clip(1.5).release(.2).room(".6:2").postgain(1)
).fast(2)

// drum pattern (1 bar loop)
let dr =
stack( s("[bd:<1 0>(<3 1>,8,<0 2>:1.3)] , [~ sd:<15>:2.5]").note("B1").bank("LinnDrum")
.decay(.3).room(".3:2").fast(2),

s("[LinnDrum_hh(<3 2>,8)]").hp("1000").lp("9000").decay(.3).velocity([".8 .6"]).room(".3:2").fast(2),
s("sh*8").note("B1").bank("RolandTR808").room(".6:2").velocity("[.8 .5]!4").postgain(1.5).fast(2))._pianoroll({vertical:0,flipTime:1,fill:0,labels:1})

// chord progression (8 bar loop)
let chord =
n(\`<[[0,2,4,6] ~!3] ~ ~ ~
[[-1,0,2,4] ~!3] ~ ~ ~
[[1,3,5,7] ~!3] ~ ~ ~
[[-2,0,1,3] ~!3] ~ [[-2,-1,1,3] ~!3] ~

\`).scale("D:major").s("gm_epiano1:6") //gm_epiano1:6 or gm_bandoneon:6
.decay(1.5).release(.25).lp(2500).delay(".45:.1:.3").room(".6:2")
.postgain(1.5).fast(2)

// bass root note (8 bar loop)
let bass1note =
n("<0 -1 1 -2>/2").scale("D1:major").s("gm_lead_8_bass_lead:1")
.lp(800).clip(.1).attack(.2).release(.12)
.delay(".45:.1:.3").room(".6:2")
.postgain(1.3)._pianoroll({labels:1})

// bassline fast guitar (8 bar loop)
let bassline =
note("<[D2!28 Cs2!4] B1*32 [E2!28 D2!4] A1*32>/2").s("gm_electric_bass_pick")
.decay(.5).velocity(rand.range(.7,1).fast(4))
.lp(1000).compressor("-20:20:10:.002:.02").room(".6:2")
.postgain(1.5).color('white')._scope({thickness:2})

// chord progession organ layer (8 bar loop)
let chordOrg =
n(\`<[0,2,4,6]
[-1,0,2,4]
[1,3,5,7]
[-2,0,1,3]

/2\`).scale("D2:major").s("gm_church_organ:4")
.legato(1).delay(".45:.1:.3").room(".6:2")
.postgain(.6)._pianoroll({labels:1,fill:0,strikeActive:1})

// chord progession arp layer (8 bar loop)
let chordArp =
n(\`<[0 2 4 6]*8
[-1 0 2 4]*8
[1 3 5 7]*8
[-2 0 1 3]*8

/2\`).scale("D4:major").s("gm_electric_guitar_jazz:<2 3>")
.legato(.08).delay(".45:.1:.3").room(".6:2").velocity(saw.range(.8,1).fast(4))
.juxBy(1,rev())
.postgain(1.8)

// arrangement
$:arrange(
[2,stack(m1,dr)],
[8,s_polymeter(m1,dr,chord,bass1note)],
[8,s_polymeter(m1,dr,chord,bass1note,bassline)],
[8,s_polymeter(m2,dr,chord,bass1note,bassline,chordArp)],
[8,s_polymeter(m2,dr,chord,bass1note,bassline,chordOrg,chordArp)],
[4,s_polymeter(m2,dr,chord,bass1note,bassline,chordOrg,chordArp)],
[4,s_polymeter(m2,arrange([2,dr],[2,silence]).fast(4),bass1note,bassline,chordOrg)]
)
//.color("<pink cyan green orange>").punchcard({labels:1,vertical:1,flipTime:1,fill:0,strokeActive:1,filpValue:1,fontFamily:'teletext'})`,
  `// "Waltz #2" (cps function demo)
// composed @by Dmitri Shostakovich
// script @by eefano
// @version 1.2
setDefaultVoicings('legacy')

melody: "<~@4 0@16 1@7 2@11.5 @3.5>".pickRestart([
\`<4 [2@2 1] [0@4 0 1]@2 [2 0 2] [4@2 5] 4 3 3 [1@2 0] [0b@4 -3 0b]@2 [1 0b 1] [3 4 5] 4b 4>\`,
"<[9,7] [[8,6]@2 [7,5]] [[6,4]@2 [5,3]] [3,0] [8,6] [[7,5]@2 [6,4]] [6,4]>",
"<[ [2 ~] [3 ~]] [[4 ~] [4 3] [4 5]] [[3 ~] [3 2] [3 4]] [[2 ~] ~ [4 ~]] > ".sub("<0 0 [0,2]>/4") ])
.scale("c4:minor").note().s("gm_oboe:2").gain(0.7)._pianoroll({minMidi:10})

piano: "<0@28 1@10 0@4>".pickRestart([
n("<<0 -1> [4,5]!2>*3").chord("<Cm@10 Fm@4 G@4 Cm@4 Fm@2 Bb@2 Eb Ab>"),
n("<3 <[4,5] > ~>*3").chord("<G Ab Cm Ab>")
]).anchor('f2').mode('root').voicing().piano()._pianoroll()

tempochanges: cps(sine.segment(32).slow(16).mul(30).add(160).div(60*3)).gain(0)

all(x=>x
//.ribbon(24,16)
.room(0.6))`,
  `// "Pump Up The Jam" - Work In Progress
// song @by Technotronic
// script @by eefano
// @version 1.2
const pickRestart = register('pickRestart', (arr, pat) => pat.pick(arr.map((x)=>x.restart(pat.collect().fmap(v=>v+1)))))
const as = register('as', (mapping, pat) => { mapping = Array.isArray(mapping) ? mapping : [mapping];
return pat.fmap((v) => { v = Array.isArray(v) ? v : [v, 0];
return Object.fromEntries(mapping.map((prop, i) => [prop, v[i]])); }); });
stack(""
,"<@8 0@4 1@4 @8>".pickRestart(
["[u [u e] a [u i] [u ] [a u] [i a] [o@3 i] ~ [a e] [a i] [o@3 i] [ u@2 a] [e e] [o i] [o@3 i]]/4"
," [u i] [u ~ ~ a] [i i@2 o]"
]).vowel().s("z_sawtooth").clip(0.8).gain(1.4)

,"<~@16 0@8>".pickRestart(
["[ @2 4 [5:1 ] ~ [ 0] [3:-1@5 3:1@2 2]@2 ~ [4@3:1 3 3@3 2 2@3 3 4:1@3 0 0@2 2:2@2]@5 [ ~ 0@2 ~ 0@2 -2:-3]@2 ]/4"
]).as("n:penv").scale("c4:minor").clip(0.90).patt("0.15").s("square").delay(0.3).dfb(0.3).dt(60/128).gain(0.7)

,"0@32".pickRestart(
["[@13 [[@3 [0,-2,-4]@2 ~]@3 [0,-2,-4] [1,-1,-3]!2]@3 ]/4"
]).scale("c4:minor").note().clip(0.7).s("z_sawtooth").color("red").adsr("0.07:.1:0.6:0.1").gain(0.5)

,"<0@12 0 1 @2 3@8>".pickRestart(
["[0 @23]/2"
,"@2 [ [e2 ~]] [[0 2] ~]"
,"[0 ~ ~ 0 ~ ~ 0 ] <[[ [0 1]] [2 ~]] ~>"
]).scale("c2:minor").note().clip(0.9)
.layer(x=>x.s("z_sawtooth").delay(0.6).dfb(0.5).dt(60/125*3/4).pan(0.55).gain(0.8)
,x=>x.s("z_square").lpf(300).lpe(2).lpa(-1.5).lpd(0.1).lpr(0.05).pan(0.45).gain(1)).color("green")

,"<0@4 [0,1]@12 [0,1,2]@4 [0,1,2,3]@4>".pickRestart(
[stack(s("oh*16").pan(0.45).gain("[0.08 0.16]*4").release(0),s("hh*4").pan(0.7).gain(0.20))
,s("bd*4").lpf(150).gain(1)
,s("[~ cp]*2").gain(0.5).pan(0.25)
,s("[~ rd]*4").gain(0.15).release(0).hpf(1500).pan(0.75)
,s("[~ sd!3]!4 [sd*4]!4").slow(2).gain(run(32).slow(2).mul(1/31).add(0.1).mul(0.4))
,s("cr").gain(0.2)
,s("bd").gain(0.8)
]).bank("RolandTR909").color("yellow").velocity(0.7)

).cpm(124.5/4).room(0.3)`,
  `// "The Rhythm Of The Night" - Work In Progress
// song @by Corona
// script @by eeefano
// @version 1.2
setDefaultVoicings('legacy')
const as = register('as', (mapping, pat) => { mapping = Array.isArray(mapping) ? mapping : [mapping];
return pat.fmap((v) => { v = Array.isArray(v) ? v : [v, 0];
return Object.fromEntries(mapping.map((prop, i) => [prop, v[i]])); }); });

const crdpart = "<~ 0@10 1@24 0@19>".pickRestart(
["Ab Cm Bb F@2".slow(5)
,"Bb@3 Ab@3 Cm@2".slow(8)
]);
stack
("<0 1@4 0 1@4 @8 2 3@7 2 3@7 0 1@4 0 1@4 0 1@4 0 1@4>".pickRestart(
[" [4@3 ~]!3 7:5 6 4 3"
,"2:-1 0:-2 ~@4 6:1 4:-1 6 4:2 ~@4 [4:2 3]@3 ~@6 4 7:5 6 [4@2 ~] [3:-1 2@3]@2 0 @2".slow(4)
,"@6 [6 ~]!2"
,"6 5@0.5 [5 ~] [4 ~]!2 [3 ~] 3:2@1.5 ~@7 6@2 6:2 [5 ~ ]!2 4 3@2 4 2 0:-2 ~@7 [0 2]@3 3@2 4 6:4 4:-4 ~ 0 2 0 4 ~ 0 0:2@2 ~@7".slow(7)
]).as("n:penv").scale("c4:minor").patt("0.07").s("gm_lead_1_square").room(0.4).delay(0.3).dfb(0.35).dt(60/128).gain(0.85)

,crdpart.chord().anchor("F4").voicing().s("gm_synth_strings_1").color("blue").gain(0.4)

,"<~@11 1@23 ~ 0@19>".pickRestart(
["2 ~@2 2 ~@2 2 ~@3 2 ~@3 2 ~"
,"[2 ~@2 2 ~@2 2 ~]!2"
]).n().chord(crdpart).anchor(crdpart.rootNotes(2)).voicing().s("gm_synth_bass_1").lpf(1500).room(0.5).color("green").gain(0.9)

,"<~@11 1@8 ~@16 0@19>".pickRestart(
["<5 7 6 3!2> ~ 9 ~ 10 ~ ~ 12 ~ 11 ~ 10 ~ 11 9 ~"
,"<6!3 5!3 7!2> ~ 9 ~ 10 ~ ~ 12 ~ 11 ~ 10 ~ 11 9 ~"
]).scale("c3:minor").note().s("gm_lead_2_sawtooth").room(0.3).delay(0.3).dfb(0.5).dt(60/128*2).color("red").gain(0.6)

,"<[2,3] @10 0@6 [0,1]@2 [0,2] 0@5 [0,1]@2 [0,2] 0@6 [2,3] 0@8 [0,1]@2 [0,2] 0@8>".pickRestart(
[stack(s("bd*4").gain(0.8),s("[ oh]*4").gain(0.14),s("hh*16").gain(0.09),s("[~ cp]*2").gain(0.4))
,s("[~ sd!3]!4 [sd*4]!4").slow(2).gain(run(32).slow(2).mul(1/31).add(0.1).mul(0.4))
,s("cr").gain(0.2)
,s("bd").gain(0.8)
]).bank("RolandTR909").room(0.2).color("yellow").velocity(1)

).cpm(128/4)`,
  `// @title Love Again
// @by Nerual Dreming

cpm(116/2);
const progression = chord("<Em C Am D>");

// Определяем блок Аутро/Интро как переменную для чистоты кода.
const introOutroSection = stack(
s("bd sd bd sd").gain(0.1)._scope(),
s("hh*8").gain(0.09)._scope(),
n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).gain(0.12)._scope(),
n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)._scope()
);

arrange(
// --- ИНТРО: 4 цикла ---
// Первая половина бывшего аутро.
[4, introOutroSection],

// --- КУПЛЕТ 1: 8 циклов (с двойными нотами) ---
[8,
stack(
s("bd ~ sd ~").gain(0.1)._scope(),
s("hh8").gain(0.07)._scope(),
progression.rootNotes(2).s("square").lpf(700).gain(0.15)._scope(),
n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).ply(2).gain(0.12)._scope(),
n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)._scope()
)
],
// --- ПРИПЕВ 1: 8 циклов ---
[8,
stack(
s("bd sd bd sd").gain(0.1)._scope(),
s("hh8").gain(0.09)._scope(),
progression.rootNotes(2).s("square").lpf(700).gain(0.15)._scope(),
n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).gain(0.12)._scope(),
n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)._scope()
)
],
// --- КУПЛЕТ 2: 8 циклов ---
[8,
stack(
s("bd ~ sd ~").gain(0.1)._scope(),
s("hh8").gain(0.07)._scope(),
progression.rootNotes(2).s("square").lpf(700).gain(0.15)._scope(),
n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).ply(2).gain(0.12)._scope(),
n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)._scope()
)
],
// --- ДРОП: 8 циклов ---
[8,
stack(
s("bd4").lpf(1000).room(0.7).gain(0.1)._scope(),
progression.rootNotes(1).s("sawtooth").noise(0.4).distort("1:0.2").gain(0.15)._scope(),
n("44").set(progression).voicing().add(12).s("sawtooth").lpf(400).lpenv(6).lpd(0.1).decay(0.15).sustain(0).gain(0.11)._scope(),
n("<0 1 2 3>").set(progression).voicing().rev().s("piano").room(0.12).gain(0.04)._scope()
)
],
// --- ФИНАЛЬНЫЙ ПРИПЕВ: 16 циклов ---
[16,
stack(
s("bd sd bd sd").gain(0.1)._scope(),
s("hh8").gain(0.09)._scope(),
progression.rootNotes(2).s("square").lpf(700).gain(0.15)._scope(),
n("<4 2 5 3>").set(progression).voicing().add(12).s("piano").room(0.5).delay(0.25).gain(0.12)._scope(),
n(run(8)).set(progression).voicing().add(24).s("sine").decay(0.1).pan(perlin.slow(8).range(0.2, 0.8)).gain(0.05)._scope()
)
],
// --- АУТРО: 4 цикла ---
// Вторая половина бывшего аутро.
[4, introOutroSection]
);`,
  `// @title Pixel Sunrise
// @by Strudel композитор

cpm(180/2);

stack(
arrange(
// === БЛОК 1: ВСТУПЛЕНИЕ ===
[4,
stack(
s("bd sd bd [sd sd2]").crush(6).gain(0.1).bank("RolandTR808"),
s("hh16").gain(0.08).bank("RolandTR808").bpf(sine.range(500, 4000).slow(6)).bpq(4).pan(sine.slow(5))
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
).gain(0.15);`,
  `// @title Лесник (Король и Шут cover) - Final Mix
// @by Strudel композитор
// @details Панк-рок аранжировка с корректной громкостью

cpm(160/2);

const verseChords = chord("<Am F G Am>");
const preChorusChords = chord("<D C G G>");
const chorusChords = chord("<Am F Dm G>");
const chorusModulatedChords = chord("<Bm G Em A>");

stack(
// --- 1. Ударные ---
s("bd sd bd sd, hh*8")
.bank("RolandTR707")
.gain(0.1),

// --- 2. Бас-гитара ---
arrange(
[8, verseChords], [4, preChorusChords], [8, chorusChords], [8, chorusModulatedChords]
).mode("root:a2").voicing()
.s("sawtooth").lpf(600)
.gain(0.15), // Слегка выделен для основы

// --- 3. Ритм-гитара ---
arrange(
// Куплет: чистая гитара с глушением
[8, verseChords.adsr("0:0.08:0:0.1").s("gm_electric_guitar_clean")],
// Предприпев и припевы с дисторшном
[4, preChorusChords.s("sawtooth").distort(5)],
[8, chorusChords.s("sawtooth").distort(5)],
[8, chorusModulatedChords.s("sawtooth").distort(5)]
).voicing()
.gain(0.0001), // Громкость значительно уменьшена для компенсации дисторшна

// --- 4. Соло-гитара / Скрипка ---
arrange(
[12, silence],
[8, n("4 5 2 0 <3 2 1 0> 2 3 4 5").chord(chorusChords).voicing()],
[8, n("4 5 2 0 <3 2 1 0> 2 3 4 5").chord(chorusModulatedChords).voicing()]
).s("sawtooth").n(3)
.gain(0.1)
);`,
  `// @title Я - солдат (5'nizza cover)
// @by Strudel композитор
// @details Регги-аранжировка с корректной громкостью

cpm(120/2);

stack(
// --- 1. Ударные ---
s("~ ~ [bd,rim] ~, hh*8")
.bank("RolandTR808")
.gain(0.1), // Громкость по умолчанию

// --- 2. Бас-гитара ---
chord("<Em Am Em B7>").mode("root:e2").voicing()
.struct("x - - -")
.s("sine")
.lpf(400)
.gain(0.15), // Немного выделен, т.к. это ведущий инструмент в регги

// --- 3. Гитара ---
chord("<Em Am Em B7>").struct("~ x ~ x").voicing()
.s("gm_electric_guitar_clean")
.delay(0.25).delayfeedback(0.3)
.gain(0.1), // Громкость по умолчанию

// --- 4. Мелодия ---
n("0 2 ~ 1").chord("<Em Am Em B7>").voicing()
.s("triangle")
.gain(0.1) // Громкость по умолчанию
);`,
  `// @title Алюминиевые огурцы (cover)
// @by Strudel композитор
// @details Пост-панк композиция в стиле группы "Кино"

// Задаем аккордовую последовательность, которая будет основой всей песни
const progression = chord("<C Am F G>");

stack(
// --- 1. Ударные: Простой и четкий бит в стиле 80-х ---
s("bd sd bd sd, hh*8")
.bank("RolandTR808") // Звуки винтажной драм-машины, идеально для пост-панка
.gain(0.1),

// --- 2. Бас-гитара: Мелодичная и ведущая партия ---
// В стиле Цоя, бас не просто держит ритм, а играет мелодию
progression.n("0 0 1 0").voicing()
.s("square") // Квадратная волна для плотного, но читаемого баса
.lpf(500) // Фильтр убирает лишние верха, делая звук глубже
.gain(0.15), // Немного громче, чтобы выделить бас

// --- 3. Гитара: Ритмичная партия на заднем плане ---
progression.voicing()
.struct("- x - x") // Играем на слабые доли, создавая "фанковый" ритм
.s("gm_electric_guitar_clean")
.room(0.3) // Небольшая реверберация для объема
.delay(0.25) // Короткое эхо для атмосферы
.gain(0.1),

// --- 4. Синтезатор: Простая мелодическая линия ---
// Имитирует вокальную партию или простой синтезаторный подклад
progression.n("2~ 2~ 2 3").voicing()
.s("triangle") // Мягкий звук треугольной волны
.gain(0.1)
);`,
  `// @title Neo-Sector 7 Grime
// @by Strudel композитор

// Устанавливаем быстрый и агрессивный темп 135 BPM
cpm(135 / 4);

// Мрачная и напряженная последовательность аккордов
let chordProg = chord("<Cm Ab Eb G>/4");

stack(
// === 1. ИНДАСТРИАЛ-РИТМ-СЕКЦИЯ ===
stack(
// Ломаный, агрессивный бит
s("bd [~ bd] sd [bd sd]"),
// Быстрые, "цифровые" хай-хэты
s("hh*8").gain(0.7)
)
.bank("RolandTR909")
.distort("1.5:0.6") // Добавляем дисторшн для "грязного" звука
.room(0.2),

// === 2. АГРЕССИВНЫЙ БАС ===
chordProg.rootNotes(1)
.ply(4) // Пульсация 16-ми нотами
.s("sawtooth")
.distort("2:0.7") // Бас тоже с дисторшном для рычания
.lpf(perlin.range(300, 900).slow(8)) // Хаотичное движение фильтра
.gain("1 0.5"), // Легкий сайдчейн-эффект

// === 3. МРАЧНЫЕ АТМОСФЕРНЫЕ ПЭДЫ ===
chordProg.voicing()
.s("sawtooth")
.superimpose(x => x.add(note(0.05)))
.crush(6) // Эффект бит-крашера для цифрового, lo-fi звука
.attack(1).release(1.5)
.room(0.8)
.lpf(3000),

// === 4. ГЛИТЧ-АРПЕДЖИО ===
chordProg.voicing()
.n("<0 3 5 7 5 3 8 7>*2") // Угловая, напряженная мелодия
.add(note(12))
.s("triangle") // Резкий, чистый тон для контраста
.attack(0.01).decay(0.2).sustain(0)
.off(1/6, x => x.add(5).gain(0.5)) // Добавляем сдвинутый по времени "призрак" мелодии
.sometimesBy(0.2, ply(2)) // Случайные статтеры/заикания
.rarely(rev) // Редко проигрываем фразу задом наперед
.gain(0.9)
.mask("<0*4 1*32>") // Вступает после 4-х тактов

).gain(0.8);`,
  `/*@Determination · Toby Fox(cover)
@by Claffystic
@details: This is an unofficial fanmade content. I made this to learn about Strudel and that's it.
Reference: https://soundcloud.com/radixan/undertale-determination-midi-in-description
Pulled from YouTube description below. (https://www.youtube.com/watch?v=sRLQnlglfrI)

Determination · Toby Fox
UNDERTALE Soundtrack
℗ Toby Fox under license to Materia Collective
Released on: 2015-09-15
Producer: Toby Fox
Music Publisher: Materia Collective Music Publishing
Composer: Toby Fox
*/

setcpm(115 / 4)

$lead: note(\`<
[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#5 F5 F#5 ~ G#5 ~]
[C#6 ~ A#5@5 ~]
[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#4 F4 F#4 ~ F4 ~]
[C#4 ~ D#4@5 ~]

[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#5 F5 F#5 ~ G#5 ~]
[C#6 ~ A#5@5 ~]
[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#4 F4 F#4 ~ F4 ~]
[C#4 ~ D#4@5 ~]

[[G#5,F5] [F#5,D#5] [E5,C#5] [D#5,B4] [C#5,A#4] [E5,C#5] [D#5,A#4] ~]
[[A#4,F#4] ~ [A#4,F#4] [D#5,A#4] [G#5,E5] [F#5,D#5] [E5,C#5] [D#5,B4]]
[[C#5,A#4] [E5,C#5] [D#5,A#4]@3 ~ [D#4,A#3] [G#4,D#4]]
[[C#5,A#4] [C5,G#4] [A#4,F#4] [G#4,F4] [A#4,F#4] [C5,G#4] [A#4,F#4] ~]
[[D#4,A#3] ~ [D#4,A#3] [F4,C#4] [F#4,D#4] ~ [B4,F#4] ~]
[[D#5,B4]@2 [D5,A#4]@4 ~@2]

[[G#5,F5] [F#5,D#5] [E5,C#5] [D#5,B4] [C#5,A#4] [E5,C#5] [D#5,A#4] ~]
[[A#4,F#4] ~ [A#4,F#4] [D#5,A#4] [G#5,E5] [F#5,D#5] [E5,C#5] [D#5,B4]]
[[C#5,A#4] [E5,C#5] [D#5,A#4]@3 ~ [D#4,A#3] [G#4,D#4]]
[[C#5,A#4] [C5,G#4] [A#4,F#4] [G#4,F4] [A#4,F#4] [C5,G#4] [A#4,F#4] ~]
[[D#4,A#3] ~ [D#4,A#3] [F4,C#4] [F#4,D#4] ~ [F4,C#4] ~]
[[C#4,G#3]@2 [D#4,A#3]@4 ~@2]

[~@8]

\`).sound("square").room(.5).roomsize(6).gain(.25).detune("[-5, 5]")

$harmony: note(\`<
[~ D#4 F#4 G#4 A#4 F#4 ~ G#4]
[C5 D#5 C5 G#4 ~ D#4 F4 D#4]
[G#4 F4 F#4 F4 D#4 C#4 D#4 A#3]
[~ D#4 F#4 G#4 A#4 F#4 ~ D#4]
[F#4 G#4 A#4 F#4 ~ D#4 F4 A#4]
[F4 C#4 F#4 F4 D#4 C#4 D#4 F4]

[~ D#4 F#4 G#4 A#4 F#4 ~ G#4]
[C5 D#5 C5 G#4 ~ D#4 F4 D#4]
[G#4 F4 F#4 F4 D#4 C#4 D#4 A#3]
[~ D#4 F#4 G#4 A#4 F#4 ~ D#4]
[F#4 G#4 A#4 F#4 ~ D#4 F4 A#4]
[F4 C#4 F#4 F4 D#4 C#4 D#4 A#3]

[G#3 D#4 G#4 F#4 A#4 G#4 F#4 G#4]
[D#4 F#4 C#4 D#4 G#3 D#4 G#4 F#4]
[A#4 G#4 F#4@3 @3]
[ D#3 C#4 A#3 G#4 F4 D#4 F4]
[F#4 F4 d#4 F4 F#4 ~@3]
[B4 ~ G#4 F#4 F4 D#4 D4 F4]

[G#3 D#4 G#4 F#4 A#4 G#4 F#4 G#4]
[D#4 F#4 C#4 D#4 G#3 D#4 G#4 F#4]
[A#4 G#4 F#4@3 @3]
[@8]
[~@2 D#4 F4 F#4 ~ F4 ~]
[C#4@2 D#4@4 ~@2]

[~@8]

\`).sound("triangle").gain(.35).shape(.2)

$bass: note(\`<
[D#2@4 F#2@2 G#2@2]
[G#2@2 G#1@2 B1@2 C#2@2]
[F#2@2 D#2@4 C#2@2]
[D#2@4 F#2@2 G#2@2]
[G#2@2 D#2@2 F#2@2 F2@2]
[C#2@2 D#2@4 C#2@2]

[D#2@4 F#2@2 G#2@2]
[G#2@2 G#1@2 B1@2 C#2@2]
[F#2@2 D#2@4 C#2@2]
[D#2@4 F#2@2 G#2@2]
[G#2@2 D#2@2 F#2@2 F2@2]
[C#2@2 D#2@4 ~@2]

[F2@4 C#2@2 D#2@2]
[D#2 ~ D#2@2 E2@4]
[C#2@2 D#2@3 ~@3]
[A#1@4 C#2@2 D#2@2]
[D#2@2 C#2@2 B1@2 ~@2]
[D#3 ~ D3@2 B2@2 A#2@2]

[E2@4 C#2@2 D#2@2]
[D#2 ~ D#2@2 E2@4]
[C#2@2 D#2@3 ~@3]
[G#2@4 ~@2 D#2@2]
[D#2@2 ~@2 F#2 ~ F2 ~]
[C#2@2 D#2@6]

[~@8]

\`).sound("square").gain(.3)`,
  `// "this is a great song" @by v10101a
// @version 1.1

const progress = "<G:major A:major D:major B:minor>"

$:
n("[0,2,4]").scale(progress).s("piano")

$:
n("0*4").scale(progress).scaleTranspose("-7").s("sawTooth").cutoff("2000")

await initHydra()

let amount = 0.5
s0.initCam()
src(s0)
.rotate(-0.4, [-0.1])
.kaleid(5)
.colorama(amount)
.modulate(o0, 0.2)
.brightness(0.1)
.contrast(1.2)
.out()

noise(10,0.1,0.1)
.color()
.modulate(o0, 0.1).out(o1)

render(o1)`,
  `// "repetition on the computer" @by pastagang
// @version 1.1

//pane 1
setcps(0.5)

hubda('eddyflux/wax')

samples('github:yaxu/spicule')

//pane 3
//polymetric euclidean rhythmzz
register('peuclid', (a,b,c,pat) => pat.euclid(a,b).slow(b).fast(c))

all(x=>x.when("<0 0 0 1>", x=>x.hpf(800).ribbon(0,".25".div("1 [2 [4 8]]"))).swing(8))

//lol
$: s("bd*4, [- <sd:1!3 cp:0:.44>]*2")
.bank("RolandTR909 RolandTR707").room("[0 <0 .5>]")
.crush("8 4").coarse(4)

$: s("<white>*[4 [8@5 [32 64]]]")
.press().dec(.06).hpf(1200).hpq(6)
//:D
//all(x=>x.hpf(2200).hpq(8))

speechda('repetition,rep,on,the,computer')

//this is so damn funky
// now more funky yess
$: s("<repetition [on the computer -] repetition [rep rep2 rep3 rep*4]>")
.begin(0.1)
.speed("<1.0 0.9 0.7>/4")

$: n("0 - - <5 7 3 -1 6>*<2 1> - [- <-1 -2 -3 -2>] - [<1 [- 4]>]")
.scale("C2:minor:blues")
.s("sine")
.dist(3).off(1/4,x=>x.add(note("12")).hpf(1200).fm(2))
//pane 5

function spag(name){return'https://spag.cc/'+name}
function listToArray(stringList){if(Array.isArray(stringList)){return stringList.map(listToArray).flat()}
return stringList.replaceAll(' ',',').split(',').map((v)=>v.trim()).filter((v)=>v)}
async function spagda(nameList){const names=listToArray(nameList);if(names.length===0){return}
const map={};for(const name of names){map[name]=spag(name)}
samples(map)}
async function speechda(wordList='',locale='en-GB',gender='f',){if(wordList.includes(':')){const[localeArg,wordsArg]=wordList.split(':');if(localeArg.includes('-')){locale=localeArg}else{gender=localeArg}
wordList=wordsArg}
if(locale.includes('/')){const[localeArg,genderArg]=locale.split('/');locale=localeArg;gender=genderArg}
const words=listToArray(wordList);if(words.length===0){return}
samples('shabda/speech/'+locale+'/'+gender+':'+words.join(','))}
async function hubda(orgList,repoList=''){const orgs=listToArray(orgList);const orgRepos=[];const orgChoices=[];for(const org of orgs){if(org.includes('/')){const[orgName,repoName]=org.split('/');orgRepos.push({org:orgName,repo:repoName})}else{orgChoices.push(org)}}
const repoChoices=listToArray(repoList);for(const orgChoice of orgChoices){for(const repoChoice of repoChoices){orgRepos.push({org:orgChoice,repo:repoChoice})}}
const addresses=orgRepos.map(({org,repo})=>'github:'+org+'/'+repo);for(const address of addresses){samples(address)}}
window.speechda=speechda;window.spagda=spagda;window.spag=spag;window.hubda=hubda`,
  `// "requiem for a crow" @by pastagang
// @version 1.2

//pane 2
// this is great!
$: chord("<G^7!3 [C^7 <Cm9 Ab^7>]>")
.s("piano")
.superimpose(x=>
n("<7 8 9>*4".add("0,<2 3 4>")) // thx :)
.set(x).delay(.5).rel(.2).clip(1.2)
,
x=>n("<11 12 13 14 13 12>/2")
.set(x).s("sine").room(6).fm(.3).patt(.4)
.gain(.9).delay(.5)
)
//.lastOf(4, x=>x.delay(.5))
.voicing()
.room(.8).vib("2:.2")
// .s("supersaw")

//pane 4
$: s("bd*8")
.bank("RolandTR909")
.n(1).room(.5)
.sometimes(x=>x.rev())
// .hpf(800)
//pane 5
$: note("<[g1 g2 - -] - ->*2").dec(.2).delay(.5).s("sine").dist(4)
//this one is lit
//pane 6
setcps(0.4)
//ah yes - fractions
//Ah yes. ZERO. haha

spagda('poison,need')

$: note("c e g b c").sound("gong")
//pane 7

$: s("crow(3, 8)").gain(perlin).room(.2) // 𓄿 BERD TIME 𓄿
$: s("crow(5, 8)").gain(perlin).room(.2)

function spag(name){return'https://spag.cc/'+name}
function listToArray(stringList){if(Array.isArray(stringList)){return stringList.map(listToArray).flat()}
return stringList.replaceAll(' ',',').split(',').map((v)=>v.trim()).filter((v)=>v)}
async function spagda(nameList){const names=listToArray(nameList);if(names.length===0){return}
const map={};for(const name of names){map[name]=spag(name)}
samples(map)}
async function speechda(wordList='',locale='en-GB',gender='f',){if(wordList.includes(':')){const[localeArg,wordsArg]=wordList.split(':');if(localeArg.includes('-')){locale=localeArg}else{gender=localeArg}
wordList=wordsArg}
if(locale.includes('/')){const[localeArg,genderArg]=locale.split('/');locale=localeArg;gender=genderArg}
const words=listToArray(wordList);if(words.length===0){return}
samples('shabda/speech/'+locale+'/'+gender+':'+words.join(','))}
async function hubda(orgList,repoList=''){const orgs=listToArray(orgList);const orgRepos=[];const orgChoices=[];for(const org of orgs){if(org.includes('/')){const[orgName,repoName]=org.split('/');orgRepos.push({org:orgName,repo:repoName})}else{orgChoices.push(org)}}
const repoChoices=listToArray(repoList);for(const orgChoice of orgChoices){for(const repoChoice of repoChoices){orgRepos.push({org:orgChoice,repo:repoChoice})}}
const addresses=orgRepos.map(({org,repo})=>'github:'+org+'/'+repo);for(const address of addresses){samples(address)}}
window.speechda=speechda;window.spagda=spagda;window.spag=spag;window.hubda=hubda;hubda('mot4i','garden');hubda('eddyflux','crate');hubda('yaxu','clean-breaks')`,
  `await initHydra()

// ПИКСЕЛЬНАЯ АУДИОРЕАКТИВНАЯ HYDRA
osc(20, 0.05, 1)
  .pixelate(H("20 60 30 80"), H("15 40 25 60"))
  .modulateScale(noise(3,0.3), H("0.2 0.6 0.3"))
  .contrast(1.2)
  .brightness(-0.2)
  .out()

// "coastline" @by eddyflux
// @version 1.0
samples('github:eddyflux/crate')
setcps(.75)
let chords = chord("<Bbm9 Fm9>/4").dict('ireal')
stack(
  stack( // DRUMS
    s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
    s("~ [rim, sd:<2 3>]").room("<0 .2>"),
    n("[0 <1 3>]*<2!3 4>").s("hh"),
    s("rd:<1!3 2>*2").mask("<0 0 1 1>/16").gain(.5)
  ).bank('crate')
  .mask("<[0 1] 1 1 1>/16".early(.5))
  , // CHORDS
  chords.offset(-1).voicing().s("gm_epiano1:1")
  .phaser(4).room(.5)
  , // MELODY
  n("<0!3 1*2>").set(chords).mode("root:g2")
  .voicing().s("gm_acoustic_bass"),
  chords.n("[0 <4 3 <2 5>>*2](<3 5>,8)")
  .anchor("D5").voicing()
  .segment(4).clip(rand.range(.4,.8))
  .room(.75).shape(.3).delay(.25)
  .fm(sine.range(3,8).slow(8))
  .lpf(sine.range(500,1000).slow(8)).lpq(5)
  .rarely(ply("2")).chunk(4, fast(2))
  .gain(perlin.range(.6, .9))
  .mask("<0 1 1 0>/16")
)
.late("[0 .01]*4").late("[0 .01]*2").size(4)`,
  `/*
@title Morning Splendor
@by Pauline Anna Strom
@license CC BY-NC-SA
@detail cover by Lil Data
@url https://instagram.com/lildata.music
*/
// @version 1.0

await initHydra()

let setbpm = t => setcps(t/4/60)

setbpm(80)

let seq = timeCat(
[8, "2 -7 -3 0 1 2 4 _"],
[7, "-8 -6 -3 -2 -1 -3 0"],
[7, "-9 -5 -2 -1 0 2 _"],
[8, "-10 -8 -6 -3 -2 -1 -3 0"],
[6, "-9 -5 -2 -1 0 1"],
[5, "-7 -3 -1 0 1"],
)//.slow(6)

let seq2 = timeCat(
[2,seq],[3,seq],[4,seq],[5,seq],
[6,seq],[5,seq],[4,seq],[3,seq],
).slow(64)

osc(1,1,2)
.diff(shape(H(seq.add(11)),1.1,0.01)
.scale(({time})=>Math.sin(time)*0.05 + 0.9)
.kaleid(H(seq2.add(10)))
.rotate(({time})=>time%360))
.modulatePixelate(noise(H(seq2.add(10).mul(4)),H(seq2.add(10).mul(0.05))),100)
.out(o0)

seq2
.n().add(7).scale("G:major")
.s("sine").adsr("0.01:1:1:0.25")
.cutoff(sine.range(600, 4000).slow(16))
.delay("0.5:0.125:0.75")
.room("0.75").size("0.75").gain(0.75)`,
  `/* Man in finance @by Erra P.

We give thanks to the Strudel user who gave us inspiration. Their use of 'man in finance'
as an audio sample was a great idea. We re-used and re-purposed the first 8 lines of code
from them. The remaining code is our own.

Check out our latest techno EP: https://erraproject.bandcamp.com/album/barren
Check us out on Spotify: https://open.spotify.com/artist/4HKfoJEZOT9HuwIy7572hq?si=7Zp7YncOS2u9EOqkUvc8Ww
Follow us on Instagram: @erraproject2030

*/
// @version 1.1

samples({
finance: ['man-in-finance/finance_00.wav','man-in-finance/finance_02.wav']
}, 'github:sandpills/v10101a-samples/main/');

// Driving bassline with finance samples
$: n("<1 0>").s("finance").slow(1.5).clip(1)
.mask("<1 0>/4")
.gain(0.9).dist("1:.2")

// Add subtle variation to the bass groove
$: n("0").s("finance").slow(1.5).clip(1.4)
.struct("1(<3 5>,8)")
.mask("<0 0 0 1>/4")
.gain(0.7).room(1)
.lpf(tri.rangex(800, 200).slow(6));

// Percussive open hi-hats with groove and sidechain compression
$: s("oh*16")
.bank("RolandTR909")
.decay(sine.range(.15,.35))
.dist("1:.2")
.mul(gain("[<0!3 1>.2 1 <0!3.2>]*4")) // groove
.mul(gain("[.3 1!3]*4")) // sidechain
.pan(tri.range(.6,.2))
.hpf(1200)
.room(.2)
.mask("<0 1>/8");

// Kick with added weight and a bit of distortion
//$: s("bd*4").bank('RolandTR909')
//.dist("1:1.2")
//.crush(6)
//.gain(1.2)
//.room(.5);

// Ambient layer with filtered noise for atmospheric texture
$: noise("pink").decay(.3).lpf(400).gain(.05)
.room(.2).pan(sine.range(-.7,.7))
.add(s("bd*8").bank("RolandTR909").gain(.3)) // layer soft kick
.mask("<0 0 1 0>/8");

// Synth elements
$: note("<g g g g eb bb c#4>*16".sub(24))
.gain(1).s("sawtooth").fanchor(0)
.lpf(mousex.range(0,1000)).lpenv(mousey.range(0,8))
.ftype('ladder')
.lpq(7).color('cyan')
.drive(3)
.distort("1.5:.7")
._scope()

$: s("bd*4").bank('RolandTR909')
._punchcard({height:16,labels:1})

$_: s("hh*10").dec(.1).bank('RolandTR909').gain(sine.fast(4))
._punchcard({height:16,labels:1})
// Overall color scheme and final styling
all(x=>x.color('cyan'))`,
  `/* @title By Design [DJ_Dave Edit]
@by Spill Tab
@license CC BY-NC-SA (https://creativecommons.org/licenses/by-nc-sa/4.0/)
@stage in-progress
*/
// @version 1.1

setCps(100/60/4)

const beatsss = [
"{}",
"{x ~ ~ x ~ ~ x ~ ~ [|x] x ~ ~ ~ ~ ~}%16",
]

const sidechain = [
"{1}",
"{0.5 1.5!2 0.5 1.5!2 0.5 1.5!2 0.5!2 1.5!5}",
]

const look = 1

samples('github:algorave-dave/samples')
vox_chop: s("spilltab").jux(rev)
.loopAt(8).chop(32)
.clip(1)
.sometimes(x=> x.striate(2).clip(1))
.postgain(1.5)

vox_whole: s("spilltab")
.loopAt(8).chop(32)
// .sometimes(x=> x.striate(2).clip(1))
.postgain(1.5)
.mask("0!3 1".slow(8))

notes: n(irand("23").slow(2)).struct("x*8").scale("a#2:minor:pentatonic")//.jux(rev)
.sound("gm_pad_halo, square")
.fast(2)
.decay(0.1)
.lpf(slider(4000, 300, 4000))
.room(1)
.gain(0.2)
.postgain(pick(sidechain, look))

bassline1: note("f#2@3 c#2@5 g#2@3 <d#2 a#1>@5".slow(2))
.sound("[gm_synth_bass_1, square, gm_fretless_bass]")
.transpose("[0, -12, 12]")
.decay(slider(0.25, 0.1, 0.25))
.lpf(slider(10000, 300, 10000))
// .lpf(mouseX.segment(4).range(300,10000))
.room(0.25)
//
.struct("x*16")
// .postgain(sidechain).gain(0.5)
.postgain(pick(sidechain, look)).gain(0.5)

_bassline2: note("d#2 a#2 g#2 f#2".slow(4))
.sound("[gm_synth_bass_1, square, gm_fretless_bass]")
.transpose("[0]")
.decay(slider(0.25, 0.1, 0.25))
.lpf(slider(300, 300, 10000))
.room(0.25)
//
.struct("x*16")
// .postgain(sidechain).gain(0.5)
.postgain(pick(sidechain, look)).gain(0.5)

samples('github:tidalcycles/dirt-samples')
drums: stack(
s("[tech:5]*4").postgain(6).struct(pick(beatsss, look)),
s("~ cp").bank("KorgDDM110").speed(1.2).room(0.25).fast(2).postgain(0.3).lpf(3000).almostNever(ply("[2|4]")),
s("hh").struct("x*16 | [x!3 ~!2 x!10 ]").gain(0.6).room(0.5).bank("RolandTR808").almostNever(ply("2")).speed(1.25).jux(rev),
s(" hh").bank("RolandTR808").room(0.2).speed(0.75).gain(1).fast(4).jux(rev).almostNever(ply("2")),
s("psr:[2|5|6|7|8|9|10|11|12|16|24|25|28|29]").fast(16).almostNever(ply("0")).postgain(pick(sidechain, look)).gain(0.4)
)

.punchcard()
.theme("bluescreen")

// all(x => x.lpf(mouseX.segment(4).range(3000,200)))
// all(x => x.hpf(mouseX.segment(4).range(10,1000)))
// all(x => x.crush(mouseX.segment(4).range(12,1)))`,
  `// "jam as you are" @by pastagang
// @version 1.1
$: n(\`<
0@2 2 0
2 0 0 0b
-1 3 -1 -1@2
3 -1 -1#

*8\`)
.scale("e2:dorian").rel(.2)
.s("sawtooth").lpf(600).room(.2).dist(.5)
.when("<0@16 1@16>",
x=>x.off(1/8, add(note(12))).lpd(.2).dec(.2).early(1/8)
.jux(rev).clip(.3)
)

$: n(\`<
4@2 - - 6@2 7 4@3
- - 6@2 7 4@3
- - 6@2 7 8@4
7@3 6 4

*8\`)
.scale("e3:dorian").vib("6:.1")
.gain(1.5).clip(1).rel(.2)
.room(0.4).s("triangle")
.delay(.5).dec(.4)
.mask("<0@8 1@8 1@16>")
.when("<0@16 1@16>",
x=>x.off(1/8, add(note(12))).early(1/8).jux(rev)
.gain(.8)
)

samples('github:yaxu/clean-breaks')

$: s("riffin/2").fit().chop(32).dec(.16)
.rarely(x=>x.ply("3").dec(.08))
.lastOf(4,mul(speed("-2")))
.mask("<0@16 0@8 1@8>")

$: s("<[bd [- [- hh]]]!16 bd!12>").bank("RolandTR808")
.room("<.8!4 .2!4 0.3!8>")
.decay(1)
.sometimes(ply(2))
.crush("<4!4 100!16>" )

$: s("<-!4 [sd - sd2 -]!8 [sd - sd2 - ]!4 -!14>").bank("RolandTR808").room(0.4)
.crush("<4!7 100!16>" )

$: s("<[- hh*2 - - ]!14 [- oh@2 -]!4 -!8>").bank("RolandTR808").room(0.2)
.sometimes(ply(2))
.crush("<4!8 100!12>" )
.size(4)

$: n("[[0, 1]*<1!3 2> [2, 3]]*2")
.s("guiro")
.degradeBy(0.1)
.gain(5)`,
  `// "Bronski Beat - Smalltown Boy Cover"
// Based on the tutorials at https://strudel.cc/workshop/first-notes/#examples
// Made to teach kids Strudel at a local school
// @version 1.0

let drums = s("bd*4, [~ <sd cp>]*2, [~ hh]*4")
.bank("LinnLM1")
.room(slider(0.25))

let bassline = note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
.sound("gm_synth_bass_2")
.lpf(800)
.room(slider(0.25))

let lead = n(\`<
[~ 0] 2 [0 2] [~ 2]
[~ 0] 1 [0 1] [~ 1]
[~ 0] 3 [0 3] [~ 3]
[~ 0] 2 [0 2] [~ 2]

*4\`).scale("C5:minor")
.sound("harp")
.lpf(2000)
.gain(1.25)
.room(slider(0.25))

stack(
bassline,
drums,
arrange(
[8, lead.mask(0)],
[16, lead],
[8, lead.mask(0)],
)
)
.tscope({
scale: .25,
pos: .4,
color: 'lightblue',
smear: 0.85,
thickness: 10,
})`,
  `// "broken cut #1" @by froos
// @version 1.0

await samples('github:tidalcycles/Dirt-Samples/master')
samples({
'slap': 'https://cdn.freesound.org/previews/495/495416_10350281-lq.mp3',
'whirl': 'https://cdn.freesound.org/previews/495/495313_10350281-lq.mp3',
'attack': 'https://cdn.freesound.org/previews/494/494947_10350281-lq.mp3'
})

setcps(1.25)

note("c2 ~*2,eb,g,bb,d").s("sawtooth")
.noise(slider(0.317))
.lpf(perlin.range(800,2000).mul(slider(0.602)))
.lpenv(perlin.range(1,5)).lpa(.25).lpd(.1).lps(0)
.add.mix(note("<0!3 [1 <4!3 12>]>")).late(.5)
.vib(slider(4,0,4,1)).vibmod(slider(0.17,0,1))
.room(1).roomsize(4).slow(4)
.stack(
s("bd").late("<0.01 .251>"),
s("breaks165:1/2").fit()
.chop(4).sometimesBy(.4, ply("2"))
.sometimesBy(.1, ply("4")).release(.01)
.gain(1.5).sometimes(mul(speed("1.05"))).cut(1)
,
s("<whirl attack>?").delay(".8:.1:.8").room(2).slow(8).cut(2),
).fft(5).reset("<x@30 [x[8 [8 [16 32]]]]@2>".late(2))
.scope({thickness:100,color:'#00ffff20',pos:.5,scale:1})
.theme('blackscreen')`,
  `// "stark pollen" @by eddyflux
// vocal sample borrowed from Pavlov :)
// @version 1.0

samples('github:eddyflux/WAX')
samples('github:yaxu/clean-breaks')
setcpm(96/4)

$: s("golosa/32")
.fit()
.ribbon(0,2)
.chop(16)
.jux(rev)
.room(.8)
.clip(.4)
.rel(.2)
.rarely(mul(speed(".5")))
.mask("<1@16 0@4>")
.when("<0@15 1 0@4>", set(delay(".5:.125:.95")))

$: s("apache/2").fit().chop(32).dec(.15)
.lastOf(4, mul(speed(saw.mul("8"))))
.mask("<0@4 1@16>")

$: s("LinnDrum_bd").struct("x(3,8) [- x x -]").mask("<0@4 1@16>")
$: s("LinnDrum_rim").struct("- x - x").mask("<0@4 1@16>")
$: s("LinnDrum_hh:0:.3").struct("[- x*2]*4").dec(.1).mask("<0@2 1@18>")

$: note("<eb1 f1 gb1 [ab1@3 bb1]>")
.s("supersaw").lpd(.4).lpf(600).dist(1)
.mask("<0@4 1@16>")`,
  `// "acidic tooth" @by eddyflux
// @version 1.0
  setcps(1)
  stack(
    note("[<g1 f1>/8](<3 5>,8)")
    .clip(perlin.range(.15,1.5))
    .release(.1)
    .s("sawtooth")
    .lpf(sine.range(400,800).slow(16))
    .lpq(cosine.range(6,14).slow(3))
    .lpenv(sine.mul(4).slow(4))
    .lpd(.2).lpa(.02)
    .ftype('24db')
    .rarely(add(note(12)))
    .room(.2).shape(.3).postgain(.5)
    .superimpose(x=>x.add(note(12)).delay(.5).bpf(1000))
    .gain("[.2 1@3]*2") // fake sidechain
    ,
    stack(
      s("bd*2").mask("<0@4 1@16>"),
      s("hh*8").gain(saw.mul(saw.fast(2))).clip(sine)
      .mask("<0@8 1@16>")
    ).bank('RolandTR909')
  )`,
  `// @title Silent Talk
// @by Nerual Dreming

// Мелодия - красный - центр
const melody = note("<[f#5 g5 f#5 e5] [f#5 g5 f#5 e5] [f#5 g5 f#5 e5] [d5 e5 d5 c#5] [f#5 g5 f#5 e5] [f#5 g5 a5 g5] [f#5 e5 d5 c#5] [d5 ~ ~ ~] [~ e5 f#5 g5] [f#5 ~ e5 ~] [d5 e5 f#5 e5] [d5 c#5 b4 ~] [~ ~ f#5 g5] [f#5 g5 a5 b5] [a5 g5 f#5 e5] [f#5 ~ ~ ~]>")
  .sound("piano")
  .room(0.7)
  .delay(".35:.2:.5")
  .gain(0.12)
  .pan(0.5)
  .color("red")
  ._pianoroll({labels:1})

// Арпеджио левой руки - синий - левее
const arp = note("<[b3 f#4 b4 f#4] [b3 f#4 b4 f#4] [g3 d4 g4 d4] [a3 e4 a4 e4] [b3 f#4 b4 f#4] [b3 f#4 b4 f#4] [d4 a4 d5 a4] [g3 d4 g4 d4] [a3 e4 a4 e4] [b3 f#4 b4 f#4] [g3 d4 g4 d4] [a3 e4 a4 e4] [b3 f#4 b4 f#4] [b3 f#4 b4 f#4] [g3 d4 g4 d4] [d4 a4 d5 a4]>")
  .sound("piano")
  .gain(0.08)
  .pan(0.35)
  .color("cyan")
  ._pianoroll({labels:1})

// Бас - зелёный - правее
const bass = note("<b2 b2 g2 a2 b2 b2 d3 g2 a2 b2 g2 a2 b2 b2 g2 d3>")
  .sound("piano")
  .gain(0.07)
  .pan(0.65)
  .color("green")
  ._pianoroll({labels:1})

// Октавный бас для климакса - белый
const bassOctave = note("<[b2 b3] [b2 b3] [g2 g3] [a2 a3] [b2 b3] [b2 b3] [d3 d4] [g2 g3] [a2 a3] [b2 b3] [g2 g3] [a2 a3] [b2 b3] [b2 b3] [g2 g3] [d3 d4]>")
  .sound("piano")
  .gain(0.1)
  .pan(0.5)
  .color("white")
  ._pianoroll({labels:1})

// Высокая мелодия для климакса - оранжевый
const melodyHigh = note("<[f#6 g6 f#6 e6] [f#6 g6 f#6 e6] [f#6 g6 f#6 e6] [d6 e6 d6 c#6] [f#6 g6 f#6 e6] [f#6 g6 a6 g6] [f#6 e6 d6 c#6] [d6 ~ ~ ~] [~ e6 f#6 g6] [f#6 ~ e6 ~] [d6 e6 f#6 e6] [d6 c#6 b5 ~] [~ ~ f#6 g6] [f#6 g6 a6 b6] [a6 g6 f#6 e6] [f#6 ~ ~ ~]>")
  .sound("piano")
  .room(0.8)
  .delay(".4:.2:.6")
  .gain(0.08)
  .pan(0.6)
  .color("orange")
  ._pianoroll({labels:1})

// Аранжировка
arrange(
  [4, melody],
  [16, stack(melody, arp)],
  [16, stack(melody, arp, bass)],
  [16, stack(melody, melodyHigh, arp, bass, bassOctave)],
  [8, stack(melody, arp)],
  [4, melody]
)`,
];
