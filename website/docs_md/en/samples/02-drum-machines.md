# Drum Machines (Драм-машины)

**Коллекция Tidal Drum Machines** - это огромная библиотека эмуляций классических и винтажных драм-машин, содержащая **70 легендарных устройств**. От Roland TR-808 до Linn Drum - все знаковые звуки электронной музыки в одном месте.

## 📊 Статистика

- **Всего драм-машин**: 70
- **Эпохи**: 1970-2000е годы
- **Производители**: Roland, Korg, Yamaha, Linn, Oberheim, E-mu, и др.
- **Типы**: Аналоговые, цифровые, гибридные

---

## 🎛️ Как использовать

### Базовый синтаксис

```javascript
// Простой способ - через имя инструмента
s("bd").bank("RolandTR808")
s("sd").bank("RolandTR909")
s("hh").bank("LinnDrum")

// Или прямое использование
s("rolandtr808bd")
s("rolandtr909sd")
s("linndrumhh")
```

### Доступные инструменты

Каждая драм-машина содержит следующие инструменты (где доступно):

- **bd** - Bass Drum (бочка)
- **sd** - Snare Drum (рабочий барабан)
- **rim** - Rimshot (римшот)
- **cp** - Clap (хлопок)
- **hh** - Closed Hi-hat (закрытый хэт)
- **oh** - Open Hi-hat (открытый хэт)
- **cr** - Crash Cymbal (крэш-тарелка)
- **rd** - Ride Cymbal (райд-тарелка)
- **sh** - Shaker (шейкер)
- **ht** - High Tom (высокий том)
- **mt** - Mid Tom (средний том)
- **lt** - Low Tom (низкий том)
- **cb** - Cowbell (ковбелл)
- **tb** - Tambourine (бубен)
- **perc** - Percussion (перкуссия)
- **misc** - Miscellaneous (разное)
- **fx** - Effects (эффекты)

---

## 🏆 Легендарные драм-машины

### Roland TR-808 (1980)
**Самая знаменитая драм-машина всех времен**

```javascript
// Классический 808 паттерн
stack(
  s("bd").bank("RolandTR808").n("0(3,8)"),
  s("sd").bank("RolandTR808").n("~ 0 ~ 0"),
  s("hh").bank("RolandTR808").n("0*8"),
  s("oh").bank("RolandTR808").n("~ ~ 0 ~")
)

// Или напрямую
stack(
  s("rolandtr808bd(3,8)"),
  s("rolandtr808sd").n("~ 0 ~ 0"),
  s("rolandtr808hh*8"),
  s("rolandtr808oh").n("~ ~ 0 ~")
)
```

**Доступные звуки**: bd, sd, rim, cp, hh, oh, ht, mt, lt, cb, misc
**Стили**: Hip-Hop, Trap, Techno, House
**Особенности**: Глубокая бочка, характерный снэйр, металлические хэты

---

### Roland TR-909 (1983)
**Классика техно и хауса**

```javascript
// Техно грув 909
stack(
  s("bd").bank("RolandTR909").n("0 ~ 0 ~"),
  s("sd").bank("RolandTR909").n("~ 0 ~ 0"),
  s("hh").bank("RolandTR909").n("0*16").gain("[1 0.7]*8"),
  s("oh").bank("RolandTR909").n("~ ~ 0 ~"),
  s("cr").bank("RolandTR909").n("0").every(4, x => x)
)
```

**Доступные звуки**: bd, sd, rim, cp, hh, oh, cr, rd, ht, mt, lt
**Стили**: Techno, House, Trance, Acid
**Особенности**: Пробивной снэйр, четкие хэты, длинная крэш-тарелка

---

### LinnDrum (1982)
**Звезда 80-х годов**

```javascript
// Классический поп-рок 80-х
stack(
  s("bd").bank("LinnDrum").n("0 ~ 0 ~"),
  s("sd").bank("LinnDrum").n("~ 0 ~ 0"),
  s("hh").bank("LinnDrum").n("0*8"),
  s("oh").bank("LinnDrum").n("~ ~ 0 ~")
)
```

**Доступные звуки**: bd, sd, rim, cp, hh, oh, cr, sh, ht, mt, lt, cb, tb, perc
**Стили**: Pop, Rock, R&B, New Wave
**Особенности**: Сэмплированные звуки, четкая атака, яркие тарелки

---

### Oberheim DMX (1981)
**Легенда хип-хопа**

```javascript
// Олдскульный хип-хоп
stack(
  s("bd").bank("OberheimDMX").n("0 ~ 0 ~"),
  s("sd").bank("OberheimDMX").n("~ 0 ~ 0"),
  s("hh").bank("OberheimDMX").n("0*8"),
  s("cp").bank("OberheimDMX").n("~ ~ ~ 0")
)
```

**Доступные звуки**: bd, sd, rim, cp, hh, oh, cr, sh, ht, mt, lt, cb, tb
**Стили**: Hip-Hop, Electro, R&B
**Особенности**: Узнаваемый снэйр, жирная бочка, характерные хлопки

---

## 📋 Полный список драм-машин (70 моделей)

### Roland (14 машин)

#### **RolandTR808** (1980)
Легендарная аналоговая драм-машина
```javascript
s("bd sd hh oh").bank("RolandTR808")
```

#### **RolandTR909** (1983)
Классика техно и хауса
```javascript
s("bd sd hh cr").bank("RolandTR909")
```

#### **RolandTR707** (1984)
Цифровая драм-машина
```javascript
s("bd sd hh").bank("RolandTR707")
```

#### **RolandTR727** (1985)
Латинская перкуссия
```javascript
s("perc perc perc").bank("RolandTR727")
```

#### **RolandTR505** (1986)
Компактная PCM драм-машина
```javascript
s("bd sd hh").bank("RolandTR505")
```

#### **RolandTR606** (1981)
Бюджетная драм-машина
```javascript
s("bd sd hh").bank("RolandTR606")
```

#### **RolandTR626** (1987)
Профессиональная PCM машина
```javascript
s("bd sd hh oh").bank("RolandTR626")
```

#### **RolandR8** (1987)
Студийная драм-машина
```javascript
s("bd sd hh rim").bank("RolandR8")
```

#### **RolandCompurhythm78** (1978)
Одна из первых программируемых
```javascript
s("bd sd hh").bank("RolandCompurhythm78")
```

#### **RolandCompurhythm1000** (1979)
Ранняя Roland
```javascript
s("bd sd hh").bank("RolandCompurhythm1000")
```

#### **RolandCompurhythm8000** (1980)
Профессиональная модель
```javascript
s("bd sd hh").bank("RolandCompurhythm8000")
```

#### **RolandDDR30** (1983)
Цифровая перкуссия
```javascript
s("bd sd perc").bank("RolandDDR30")
```

#### **RolandMC303** (1996)
Грувбокс с встроенными звуками
```javascript
s("bd sd hh").bank("RolandMC303")
```

#### **RolandMC202** (1983)
Микрокомпозер с ритм-секцией
```javascript
s("bd sd").bank("RolandMC202")
```

---

### Linn (4 машины)

#### **LinnDrum** (1982)
Классика 80-х
```javascript
s("bd sd hh oh").bank("LinnDrum")
```

#### **LinnLM1** (1980)
Первая драм-машина с сэмплами
```javascript
s("bd sd hh").bank("LinnLM1")
```

#### **LinnLM2** (1981)
Улучшенная версия LM1
```javascript
s("bd sd hh oh").bank("LinnLM2")
```

#### **Linn9000** (1984)
Драм-машина + секвенсор
```javascript
s("bd sd hh oh cr").bank("Linn9000")
```

---

### Oberheim (1 машина)

#### **OberheimDMX** (1981)
Легенда хип-хопа
```javascript
s("bd sd cp hh").bank("OberheimDMX")
```

---

### E-mu (3 машины)

#### **EmuDrumulator** (1983)
Клон LinnDrum
```javascript
s("bd sd hh").bank("EmuDrumulator")
```

#### **EmuSP12** (1985)
Классический сэмплер
```javascript
s("bd sd hh perc").bank("EmuSP12")
```

#### **EmuModular**
Модульные звуки E-mu
```javascript
s("bd sd fx").bank("EmuModular")
```

---

### Korg (9 машин)

#### **KorgDDM110** (1983)
Суперслимс
```javascript
s("bd sd hh oh").bank("KorgDDM110")
```

#### **KorgKPR77** (1983)
Программируемая ритм-машина
```javascript
s("bd sd hh").bank("KorgKPR77")
```

#### **KorgKR55** (1979)
Винтажная аналоговая
```javascript
s("bd sd hh").bank("KorgKR55")
```

#### **KorgKRZ**
Компактная модель
```javascript
s("bd sd hh").bank("KorgKRZ")
```

#### **KorgM1** (1988)
Рабочая станция с барабанами
```javascript
s("bd sd hh perc").bank("KorgM1")
```

#### **KorgMinipops** (1970s)
Ретро ритм-бокс
```javascript
s("bd sd hh").bank("KorgMinipops")
```

#### **KorgPoly800** (1983)
Синтезатор с барабанами
```javascript
s("bd sd hh").bank("KorgPoly800")
```

#### **KorgT3** (1988)
Рабочая станция
```javascript
s("bd sd hh misc").bank("KorgT3")
```

---

### Yamaha (7 машин)

#### **YamahaRX21** (1985)
Компактная драм-машина
```javascript
s("bd sd hh oh").bank("YamahaRX21")
```

#### **YamahaRX5** (1986)
Профессиональная PCM машина
```javascript
s("bd sd hh oh cr").bank("YamahaRX5")
```

#### **YamahaRY30** (1991)
Dance-ориентированная
```javascript
s("bd sd hh oh").bank("YamahaRY30")
```

#### **YamahaRM50** (1986)
Портативная драм-машина
```javascript
s("bd sd hh").bank("YamahaRM50")
```

#### **YamahaTG33** (1990)
Tone Generator с барабанами
```javascript
s("bd sd perc").bank("YamahaTG33")
```

---

### Boss (5 машин)

#### **BossDR110** (1983)
Графический секвенсор
```javascript
s("bd sd hh oh").bank("BossDR110")
```

#### **BossDR220** (1985)
Доступная PCM машина
```javascript
s("bd sd hh perc").bank("BossDR220")
```

#### **BossDR55** (1980)
Доктор Ритм
```javascript
s("bd sd hh").bank("BossDR55")
```

#### **BossDR550** (1990)
Профессиональная модель
```javascript
s("bd sd hh oh").bank("BossDR550")
```

#### **BossDR660** (1992)
Студийная драм-машина
```javascript
s("bd sd hh oh cr").bank("BossDR660")
```

---

### Alesis (2 машины)

#### **AlesisHR16** (1987)
Бюджетная цифровая машина
```javascript
s("bd sd hh oh").bank("AlesisHR16")
```

#### **AlesisSR16** (1990)
Студийный стандарт
```javascript
s("bd sd hh oh cr rim").bank("AlesisSR16")
```

---

### Casio (3 машины)

#### **CasioRZ1** (1986)
Драм-машина со сэмплированием
```javascript
s("bd sd hh oh").bank("CasioRZ1")
```

#### **CasioSK1** (1985)
Игрушечный сэмплер
```javascript
s("bd sd misc").bank("CasioSK1")
```

#### **CasioVL1** (1979)
Легендарный портативный синтезатор
```javascript
s("bd sd perc").bank("CasioVL1")
```

---

### Sequential Circuits (2 машины)

#### **SequentialCircuitsDrumtracks** (1984)
Аналоговая драм-машина
```javascript
s("bd sd hh oh cr").bank("SequentialCircuitsDrumtracks")
```

#### **SequentialCircuitsTom** (1984)
Том-модуль
```javascript
s("ht mt lt").bank("SequentialCircuitsTom")
```

---

### Akai (3 машины)

#### **AkaiLinn**
Akai версия Linn звуков
```javascript
s("bd sd hh oh").bank("AkaiLinn")
```

#### **AkaiMPC60** (1988)
Легендарный сэмплер/секвенсор
```javascript
s("bd sd hh oh").bank("AkaiMPC60")
```

#### **AkaiXR10** (1989)
Компактная драм-машина
```javascript
s("bd sd hh oh").bank("AkaiXR10")
```

---

### Другие производители

#### **AJKPercusyn**
Кастомная перкуссионная система
```javascript
s("bd sd perc").bank("AJKPercusyn")
```

#### **DoepferMS404**
Модульная система Doepfer
```javascript
s("bd sd fx").bank("DoepferMS404")
```

#### **MFB512**
Современная аналоговая машина
```javascript
s("bd sd hh oh").bank("MFB512")
```

#### **MPC1000** (2003)
Современный MPC
```javascript
s("bd sd hh oh").bank("MPC1000")
```

#### **MoogConcertMateMG1**
Moog ритм-модуль
```javascript
s("bd sd perc").bank("MoogConcertMateMG1")
```

#### **RhythmAce**
Винтажный ритм-бокс
```javascript
s("bd sd hh").bank("RhythmAce")
```

#### **RhodesPolaris**
Rhodes синтезатор с барабанами
```javascript
s("bd sd hh misc").bank("RhodesPolaris")
```

#### **SakataDPM48**
Японская драм-машина
```javascript
s("bd sd hh").bank("SakataDPM48")
```

#### **SergeModular**
Модульный синтезатор Serge
```javascript
s("bd sd fx perc").bank("SergeModular")
```

#### **SimmonsSDS400** (1982)
Электронные барабаны
```javascript
s("bd sd ht mt lt").bank("SimmonsSDS400")
```

#### **SimmonsSDS5** (1981)
Классические Simmons пэды
```javascript
s("bd sd ht mt lt").bank("SimmonsSDS5")
```

#### **SoundmastersR88**
Редкая драм-машина
```javascript
s("bd sd hh").bank("SoundmastersR88")
```

#### **UnivoxMicroRhythmer12**
Винтажная Univox
```javascript
s("bd sd hh").bank("UnivoxMicroRhythmer12")
```

#### **ViscoSpaceDrum** (1979)
Экспериментальная драм-машина
```javascript
s("bd sd fx perc").bank("ViscoSpaceDrum")
```

#### **XdrumLM8953**
Клон драм-машины
```javascript
s("bd sd hh oh").bank("XdrumLM8953")
```

---

## 🎵 Примеры использования

### 1. Сравнение классических машин

```javascript
// 808 vs 909
stack(
  s("bd sd hh oh").bank("RolandTR808").pan(0.3),
  s("bd sd hh oh").bank("RolandTR909").pan(0.7).gain(0.8)
)
```

### 2. Винтажный хип-хоп

```javascript
// Oberheim DMX + Linn
stack(
  s("bd").bank("OberheimDMX").n("0 ~ 0 ~"),
  s("sd").bank("LinnDrum").n("~ 0 ~ 0"),
  s("hh").bank("OberheimDMX").n("0*8").gain(0.6),
  s("cp").bank("OberheimDMX").n("~ ~ ~ 0")
)
```

### 3. Техно микс

```javascript
// 909 + 808 hybrid
stack(
  s("bd").bank("RolandTR909").n("0(3,8)"),
  s("sd").bank("RolandTR808").n("~ 0 ~ 0"),
  s("hh").bank("RolandTR909").n("0*16").gain("[1 0.7]*8"),
  s("oh").bank("RolandTR808").n("~ ~ 0 ~")
)
```

### 4. Эволюция звука

```javascript
// Смена драм-машин по паттерну
s("bd sd hh oh")
  .bank("<RolandTR808 RolandTR909 LinnDrum OberheimDMX>")
  .slow(4)
```

### 5. Современный поп

```javascript
// AlesisSR16 + LinnDrum
stack(
  s("bd").bank("AlesisSR16").n("0 ~ 0 ~"),
  s("sd").bank("LinnDrum").n("~ 0 ~ 0").room(0.3),
  s("hh").bank("AlesisSR16").n("0*8"),
  s("oh").bank("LinnDrum").n("~ ~ 0 ~"),
  s("cr").bank("AlesisSR16").every(4, x => x)
)
```

### 6. Экспериментальная перкуссия

```javascript
// Модульные системы
stack(
  s("bd perc fx").bank("SergeModular").n(irand(8)),
  s("sd perc fx").bank("EmuModular").n(irand(8)),
  s("misc fx").bank("DoepferMS404").n(irand(8))
).slow(2)
```

---

## 🎓 Советы по выбору драм-машины

### По стилю музыки

- **Hip-Hop**: OberheimDMX, LinnDrum, AkaiMPC60
- **Techno**: RolandTR909, RolandTR808
- **House**: RolandTR909, RolandTR707
- **Electro**: RolandTR808, OberheimDMX
- **Pop/Rock 80s**: LinnDrum, LinnLM2, RolandTR707
- **Industrial**: CasioRZ1, RolandR8
- **Jungle/DnB**: AlesisHR16, RolandR8
- **Ambient/Experimental**: SergeModular, EmuModular, ViscoSpaceDrum

### По характеру звука

- **Теплый аналоговый**: RolandTR808, RolandTR606, MFB512
- **Четкий цифровой**: RolandTR909, AlesisSR16
- **Винтажный сэмплированный**: LinnDrum, OberheimDMX
- **Жирный и мощный**: EmuDrumulator, AkaiMPC60
- **Хрустящий и яркий**: RolandTR707, YamahaRX5

### По эпохе

- **1970s**: KorgMinipops, RhythmAce, ViscoSpaceDrum
- **Early 80s**: RolandTR808, LinnLM1, OberheimDMX
- **Mid 80s**: LinnDrum, RolandTR707, CasioRZ1
- **Late 80s**: RolandR8, AkaiMPC60, YamahaRX5
- **1990s**: AlesisSR16, RolandTR626, BossDR660
- **2000s**: MPC1000, современные клоны

---

## 💡 Продвинутые техники

### 1. Слоение звуков разных машин

```javascript
// Комбинирование бочек
stack(
  s("bd").bank("RolandTR808").gain(0.8),
  s("bd").bank("RolandTR909").gain(0.6).lpf(800)
)
```

### 2. Динамическая смена банков

```javascript
// Эволюция по частям
s("bd*4")
  .bank(cat(
    "RolandTR808".slow(4),
    "RolandTR909".slow(4),
    "LinnDrum".slow(4),
    "OberheimDMX".slow(4)
  ))
```

### 3. Случайный выбор машин

```javascript
// Случайная драм-машина на каждый хит
s("bd sd hh oh")
  .bank(choose([
    "RolandTR808",
    "RolandTR909",
    "LinnDrum",
    "OberheimDMX"
  ]))
```

---

## 📚 Исторический контекст

### Эволюция драм-машин

1. **1970s** - Аналоговые ритм-боксы (Minipops, Rhythm Ace)
2. **1980-1982** - Революция: TR-808, LinnLM1, DMX
3. **1983-1985** - Расцвет сэмплирования: LinnDrum, TR-909, Drumulator
4. **1986-1990** - PCM эра: RX5, AlesisSR16, R8
5. **1990s** - Сэмплеры/секвенсоры: MPC серия
6. **2000s+** - Программные эмуляции и современные клоны

### Культовые звуки

- **808 бочка** - хип-хоп, трэп, современная поп-музыка
- **909 снэйр** - техно, хаус, транс
- **DMX снэйр** - олдскульный хип-хоп (Run-DMC, LL Cool J)
- **LinnDrum** - поп 80-х (Prince, Phil Collins)
- **TR-808 хлопок** - повсеместно в электронной музыке

---

**Версия**: 1.0
**Обновлено**: Декабрь 2025
**Всего машин**: 70
**Источник**: Tidal Drum Machines Collection
