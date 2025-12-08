---
title: Xen Harmonic Functions
layout: ../../layouts/MainLayout.astro
---


```javascript
"<[0 3 1 -] [-1 4 2 8]> ~ ~,<-4 -5>"
  .transpose(4)
  .tune("iraq")
  .mul("<c3 d3 c#3>".fmap(getFreq))
  .freq().clip(.5).room(1).rfade(9)
```

# Xen Harmonic Functions

These functions allow the use of scales other than your typical chromatic 12 based ones.


```javascript
"4 5 6 7 8 9".tune("sanza")
  .mul(getFreq('c3'))
  .freq()
```

### tune(scale)

<!-- API documentation available in web version -->

Here's an example of how to configure a basic hexany scale:


```javascript
"0 1 2 3 4 5".tune("hexany15").mul("220").freq()
```


Try other scales like `hexany1`, `iraq`, `gumbeng`, `gunkali`, or `tranh3`

For a full list of available scales from tunejs, see http://abbernie.github.io/tune/scales.html

You can set your root to be a particular note with `getFreq`


```javascript
"4 8 9 10 - - 5 7 9 11 - -".tune("tranh3")
    .mul(getFreq('c3'))
    .freq().clip(.5).room(1)
```


Some tunings become more pronounced with a longer reverb decay:

<!-- MINIREPL_START --> -".tune("gumbeng")
  .mul(getFreq('c3'))
  .freq().clip(.8).room("3:10").rdim(10000).rfade(5)`}
/>

Additionally, you can combo this with `fmap` so that the base note changes:

<!-- MINIREPL_START -->".fmap(getFreq))
  .freq().legato("2 .7").room("1:15").rdim(8500).rlp(14000).rfade(8)`}
/>

Combining this with various polyrhythm tricks can become very evocative:

<!-- MINIREPL_START --> ~ ~,<-4 -5>"
  .transpose(4)
  .tune("iraq")
  .mul("<c3 d3 c#3>".fmap(getFreq))
  .freq().clip(.5).room(1).rfade(9)`}
/>

Another helpful trick when exploring new tunings is to strum them.
Many have a much more enchanting sound that was chosen over many generations of musicians for being strummed.

Take the `sanza` tuning:


```javascript
"<[5 6 8 10] - [5 7 9 12] -> -".tune("gumbeng")
  .mul(getFreq('c3'))
  .freq().clip(.8).room("3:10").rdim(10000).rfade(5)
```


Notes 7 and 9 will clash quite a bit if you arp them normally. Many tunings will have this sort of sound, and it can feel distracting on its own.
See how close they are on the pitch wheel?


```javascript
"9 11 12 10 - - -".tune("gunkali")
  .mul("<c3 c3 a3 d#3>".fmap(getFreq))
  .freq().legato("2 .7").room("1:15").rdim(8500).rlp(14000).rfade(8)
```


This quality is often due to how the tunings were formed with instruments that were played differently than a piano.
As such, some tunings are much better strummed, with the subtle clash of the detuned notes actually making the sound much more magical:

<!-- MINIREPL_START -->")
  .tune("sanza")
  .mul(getFreq('c3')).freq()
  .legato("3").room(1).rfade(5)`}
/>

Note the legato and reverb effects make sure the sound of the strumming gets to wash together. Alternating the direction of the strum can make the
tones sound even more alive, too.

The `tranh3` tuning has a similar set of notes, with two clashing. You might trying plugging that in above and see if you find a favorite strumming pattern.

