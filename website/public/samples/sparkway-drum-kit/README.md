# Sparkway Drum Kit

Drum kit by @wonderluverz. 168 samples total.

## Banks

| Bank | Description | Count |
|------|-------------|-------|
| `spk_808` | 808 bass samples | 12 |
| `spk_reese` | Reese/Moog bass samples | 6 |
| `spk_clap` | Clap samples | 8 |
| `spk_crash` | Crash cymbal samples | 8 |
| `spk_drumloop` | Drum loops (104-150 BPM) | 40 |
| `spk_hat` | Hi-hat samples | 14 |
| `spk_kick` | Kick drum samples | 13 |
| `spk_oh` | Open hi-hat samples | 3 |
| `spk_perc` | Percussion samples | 23 |
| `spk_percloop` | Percussion loops | 8 |
| `spk_shot` | One-shot samples | 5 |
| `spk_snare` | Snare drum samples | 14 |
| `spk_vocal` | Vocal loops (various keys) | 14 |

## Usage

```js
s("spk_kick spk_snare spk_hat*2 spk_clap")
```

```js
s("spk_808:0").note("c2 e2 g2 c3")
```

```js
s("spk_drumloop:5").fit().loopAt(4)
```
