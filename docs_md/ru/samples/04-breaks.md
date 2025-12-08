# Breaks (Брейкбиты)

**Коллекция Breaks** включает легендарные брейкбиты, которые стали основой хип-хопа, jungle, drum'n'bass и многих других жанров электронной музыки. От классического Amen Break до Funky Drummer - здесь собраны самые культовые барабанные лупы в истории музыки.

## 📊 Статистика

- **Clean Breaks**: 34 классических брейка
- **Dough-Amen**: 80 вариаций Amen Break (3 набора)
- **Общий BPM диапазон**: 135-175 BPM
- **Источники**: Оригинальные виниловые записи 1960-1980х

---

## 🎵 Clean Breaks (34 легендарных брейка)

### Использование

```javascript
// Простое воспроизведение
s("amen")                              // Amen Break
s("funkydrummer")                      // Funky Drummer
s("apache")                            // Apache

// С эффектами
s("amen").chop(16).rev()               // Нарезанный и реверсированный
s("funkydrummer").speed(1.2).crush(3) // Ускоренный с битовой редукцией
```

---

## 🥇 Топ-10 легендарных брейков

### 1. **amen** - The Amen Break
**The Winstons - "Amen, Brother" (1969)**
Самый сэмплированный барабанный лупп в истории музыки

```javascript
// Классический Amen
s("amen")

// Быстрый jungle
s("amen").speed(1.3).chop(16)

// С эффектами
s("amen")
  .chop(16)
  .rarely(x => x.rev())
  .sometimes(x => x.speed(0.5))
```

**BPM**: ~138
**Стили**: Jungle, Drum'n'Bass, Hip-Hop, Breakbeat
**Использован в**: Тысячи треков от Salt-N-Pepa до Aphex Twin

---

### 2. **funkydrummer** - Funky Drummer
**James Brown - "Funky Drummer" (1970)**
Культовый брейк Клайда Стабблфилда

```javascript
// Оригинальный темп
s("funkydrummer")

// Хип-хоп стиль
s("funkydrummer").chop(8).gain("[1 0.8]*4")

// С фильтром
s("funkydrummer").lpf(1500).res(0.2)
```

**BPM**: ~101
**Стили**: Hip-Hop, Funk, Breakbeat
**Использован в**: Public Enemy, LL Cool J, Sinead O'Connor

---

### 3. **apache** - Apache
**Michael Viner's Incredible Bongo Band - "Apache" (1973)**
Легендарный перкуссионный брейк

```javascript
// Классический Apache
s("apache")

// Хип-хоп брейкданс
s("apache").speed(0.95)

// С чоппингом
s("apache").chop(16).fast(2)
```

**BPM**: ~126
**Стили**: Hip-Hop, Breakbeat, Electro
**Использован в**: Sugarhill Gang, Grandmaster Flash

---

### 4. **think** - Think (About It)
**Lyn Collins - "Think (About It)" (1972)**
Классический фанк-брейк

```javascript
// Оригинал
s("think")

// С реверсом
s("think").chop(16).every(4, x => x.rev())

// NuSkool breaks
s("think").speed(1.1).crush(2)
```

**BPM**: ~133
**Стили**: Hip-Hop, Jungle, Nu-Funk
**Использован в**: Rob Base, Freestylers

---

### 5. **impeach** - Impeach the President
**The Honeydrippers - "Impeach the President" (1973)**
Знаменитый хип-хоп брейк

```javascript
// Классический хип-хоп
s("impeach")

// С фильтром
s("impeach").lpf(2000).hpf(100)

// Чоп и скретч эффект
s("impeach").chop(32).speed(rand.range(0.9,1.1))
```

**BPM**: ~112
**Стили**: Hip-Hop, Breakbeat
**Использован в**: EPMD, Audio Two, Salt-N-Pepa

---

### 6. **action** - Action
**Orange Krush - "Action" (1982)**
Электро брейк

```javascript
s("action")
s("action").speed(1.2)
s("action").chop(16).crush(4)
```

**BPM**: ~110
**Стили**: Electro, Hip-Hop

---

### 7. **kool** - Chocolate Buttermilk
**Kool & The Gang - "Chocolate Buttermilk" (1979)**
Фанковый грув

```javascript
s("kool")
s("kool").speed(0.95).lpf(1800)
```

**BPM**: ~108
**Стили**: Funk, Hip-Hop

---

### 8. **swat** - Theme from S.W.A.T.
**Rhythm Heritage - "Theme from S.W.A.T." (1975)**
Энергичный брейк

```javascript
s("swat")
s("swat").chop(16).fast(1.5)
```

**BPM**: ~130
**Стили**: Breakbeat, Big Beat

---

### 9. **marymary** - Mary, Mary
**The Monkees - "Mary, Mary" (1968)**
Роковый брейк 60-х

```javascript
s("marymary")
s("marymary").speed(1.1).room(0.3)
```

**BPM**: ~140
**Стили**: Rock, Breakbeat

---

### 10. **squib** - Squib Cakes
**Tower of Power - "Squib Cakes" (1974)**
Фанк-брейк

```javascript
s("squib")
s("squib").chop(8).gain("[1 0.9]*4")
```

**BPM**: ~108
**Стили**: Funk, Hip-Hop, Breakbeat

---

## 📋 Полный список Clean Breaks (34 брейка)

### Алфавитный список

| Название | Исполнитель | Трек | BPM |
|----------|-------------|------|-----|
| **action** | Orange Krush | Action | ~110 |
| **apache** | Incredible Bongo Band | Apache | ~126 |
| **amen** | The Winstons | Amen Brother | ~138 |
| **around** | Mark Putney | Don't Come Around Here Anymore | ~115 |
| **boogiewoogie** | Sound Experience | Boogie Woogie | ~120 |
| **delight** | Sugarhill Gang | Rapper's Delight | ~115 |
| **do** | Bobby Byrd Feat. The J.B's | Doin' The Do | ~125 |
| **eeloil** | The Bamboos | Eel Oil | ~130 |
| **fireeater** | Rusty Bryant | Fire Eater | ~140 |
| **funkydrummer** | James Brown | Funky Drummer | ~101 |
| **groove** | Wilbur Bascomb & The Zodiac | Just A Groove In 'G' | ~118 |
| **hitormiss** | Odetta | Hit Or Miss | ~145 |
| **hotline** | Rance Allen Group | Hot Line To Jesus | ~125 |
| **hungup** | Salt | Hung Up | ~135 |
| **impeach** | The Honeydrippers | Impeach The President | ~112 |
| **king** | Mantronix | King Of The Beats | ~105 |
| **kool** | Kool & The Gang | Chocolate Buttermilk | ~108 |
| **marymary** | The Monkees | Mary Mary | ~140 |
| **mechanicalman** | Jerry Butler | I'm Your Mechanical Man | ~110 |
| **movement** | SL Troopers | Movement | ~128 |
| **newday** | Skull Snaps | Its A New Day | ~132 |
| **neworleans** | Nat Adderley | New Orleans | ~145 |
| **riffin** | M.c Duke | I'm Riffin' | ~95 |
| **rill** | Little Richard | The Rill Thing | ~150 |
| **ripple** | Ripple | A Funky Song | ~122 |
| **sesame** | Blowfly | Sesame Street | ~115 |
| **sneakin** | Tom Scott And The L.A. Express | Sneakin' In The Back | ~108 |
| **sport** | Lightnin' Rod | Sport | ~135 |
| **squib** | Tower Of Power | Squib Cakes | ~108 |
| **swat** | Rhythm Heritage | Theme From S.W.A.T | ~130 |
| **think** | Lyn Collins | Think | ~133 |
| **useme** | Bill Withers | Use Me | ~101 |

---

## 🎯 Dough-Amen (80 вариаций Amen Break)

### Три набора вариаций

#### **amen1** - Первый набор (20 файлов)
Вариации Amen Break на разных скоростях: 135-175 BPM

```javascript
// Базовое использование
s("amen1:0")                           // Первая вариация
s("amen1:10")                          // Средняя вариация
s("amen1:19")                          // Последняя вариация

// Случайный выбор
s("amen1").n(irand(20))

// Последовательность
s("amen1*4").n("0 5 10 15")
```

**Диапазон BPM**: 135-175
**Количество**: 20 файлов (cw_amen01_175.wav - cw_amen20_135.wav)

---

#### **amen2** - Второй набор (40 файлов)
Расширенная коллекция с большим количеством вариаций

```javascript
// Использование
s("amen2:0")                           // Первая вариация
s("amen2:20")                          // Средняя
s("amen2:39")                          // Последняя

// Сканирование через набор
s("amen2").n(irand(40))

// Эволюция
s("amen2*8").n("0..39").slow(8)
```

**Количество**: 40 файлов
**Особенности**: Больше вариаций темпа и обработки

---

#### **amen3** - Третий набор (20 файлов)
Дополнительные версии для разнообразия

```javascript
// Использование
s("amen3").n(irand(20))

// Комбинирование наборов
s("<amen1 amen2 amen3>").n(irand(20))
```

**Количество**: 20 файлов

---

## 🎨 Техники работы с брейками

### 1. Чоппинг (Нарезка)

```javascript
// Базовый чоппинг на 16 частей
s("amen").chop(16)

// Нарезка с реверсом
s("funkydrummer").chop(16).rev()

// Случайная нарезка
s("apache").chop(16).shuffle(4)
```

### 2. Изменение скорости

```javascript
// Ускорение
s("amen").speed(1.3)                   // Jungle speed

// Замедление
s("funkydrummer").speed(0.7)           // Hip-hop tempo

// Переменная скорость
s("think").speed(rand.range(0.8, 1.2))
```

### 3. Эффекты обработки

```javascript
// Фильтрация
s("impeach").lpf(1500).hpf(100)

// Дисторшн
s("apache").crush(4).gain(0.9)

// Реверберация
s("amen").room(0.5).size(0.8)

// Дилей
s("think").delay(0.5).delayfb(0.6)
```

### 4. Комбинированная обработка

```javascript
// Jungle стиль
s("amen")
  .chop(16)
  .speed(1.3)
  .lpf(2000)
  .rarely(x => x.rev())

// Hip-hop стиль
s("funkydrummer")
  .chop(8)
  .speed(0.95)
  .lpf(1800)
  .crush(2)

// Breakbeat стиль
s("apache")
  .chop(16)
  .sometimes(x => x.speed(0.5))
  .room(0.3)
```

### 5. Реаранжировка

```javascript
// Случайный порядок слайсов
s("amen").chop(16).shuffle(4)

// Реверс определенных частей
s("think")
  .chop(16)
  .every(4, x => x.rev())

// Пропуск частей
s("impeach")
  .chop(16)
  .sometimes(x => x.silence())
```

### 6. Слоение брейков

```javascript
// Два брейка вместе
stack(
  s("amen").gain(0.7),
  s("funkydrummer").gain(0.5).lpf(1000)
)

// Брейк + дополнительная перкуссия
stack(
  s("apache"),
  s("bd").n("0 ~ 0 ~").gain(0.6),
  s("sd").n("~ 0 ~ 0").gain(0.5)
)
```

### 7. Глитч-эффекты

```javascript
// Stuttering (заикание)
s("amen")
  .chop(16)
  .sometimes(x => x.fast(4))

// Битовая редукция
s("think")
  .crush(perlin.range(0, 8))
  .speed(perlin.range(0.9, 1.1))

// Случайный хаос
s("apache")
  .chop(32)
  .rarely(x => x.rev())
  .sometimes(x => x.speed(rand.range(0.5, 2)))
```

---

## 🎛️ Продвинутые паттерны

### 1. Jungle Breaks

```javascript
// Классический jungle
s("amen")
  .chop(16)
  .speed(1.3)
  .n("0 4 8 12 2 6 10 14 1 5 9 13 3 7 11 15")
  .gain("1 0.8 0.9 0.7 1 0.8 0.9 0.7 0.9 0.8 0.8 0.7 1 0.8 0.9 0.8")

// Amen bass
s("amen")
  .chop(16)
  .speed(1.4)
  .lpf(300)
  .res(0.3)
  .gain(1.2)
```

### 2. Hip-Hop Breaks

```javascript
// Олдскул хип-хоп
s("funkydrummer")
  .chop(8)
  .speed(0.95)
  .lpf(1800)
  .sometimes(x => x.crush(2))

// С scratch эффектом
s("impeach")
  .chop(32)
  .rarely(x => x.speed(-1).fast(8))
```

### 3. Breakbeat

```javascript
// Big beat стиль
s("apache")
  .chop(16)
  .speed(1.1)
  .crush(2)
  .room(0.2)

// Chemical Brothers style
s("think")
  .chop(8)
  .speed(1.2)
  .lpf(2000)
  .distort(0.3)
```

### 4. Drum'n'Bass

```javascript
// Fast DnB
s("amen")
  .chop(16)
  .speed(1.5)
  .rarely(x => x.rev())
  .sometimes(x => x.fast(2))

// Neurofunk
s("amen2:20")
  .chop(32)
  .speed(1.4)
  .lpf(1500)
  .crush(3)
```

### 5. Experimental

```javascript
// Глитч-хоп
s("amen")
  .chop(32)
  .shuffle(8)
  .speed(perlin.range(0.8, 1.2))
  .crush(perlin.range(0, 8))

// Ambient breaks
s("think")
  .chop(16)
  .slow(4)
  .room(0.9)
  .delay(0.7)
  .gain(0.6)
```

---

## 📚 История и культура

### Amen Break - История

- **Оригинал**: The Winstons - "Amen, Brother" (1969)
- **Барабанщик**: Gregory Coleman
- **Длительность**: 7 секунд
- **Влияние**: Основа jungle, drum'n'bass, hip-hop

### Funky Drummer - Наследие

- **Исполнитель**: Clyde Stubblefield (барабанщик James Brown)
- **Год**: 1970
- **Влияние**: Один из самых сэмплированных брейков
- **Использован**: Public Enemy, Run-DMC, Dr. Dre

### Apache - Культурный феномен

- **Год**: 1973
- **Особенность**: Перкуссионный брейк без басовых барабанов
- **Влияние**: Брейкданс культура 1980х
- **Значение**: Антемброковый брейк хип-хопа

---

## 💡 Советы от профессионалов

### 1. Подбор темпа

```javascript
// Оригинальный темп
s("funkydrummer")                      // 101 BPM

// Jungle темп
s("amen").speed(1.3)                   // ~180 BPM

// Hip-hop темп
s("impeach").speed(0.85)               // ~95 BPM
```

### 2. EQ и фильтрация

```javascript
// Убрать грязь
s("apache").hpf(100)                   // Срезать низкий rumble

// Убрать шипение
s("think").lpf(10000)                  // Приглушить высокие

// Фокус на snare
s("funkydrummer").bpf(2000).bpq(2)    // Bandpass на snare
```

### 3. Динамика

```javascript
// Естественная динамика
s("amen")
  .chop(16)
  .gain("1 0.8 0.9 0.7 1 0.8 0.9 0.7 0.9 0.8 0.8 0.7 1 0.8 0.9 0.8")

// Компрессия
s("impeach").gain(1.2).clip(0.9)
```

---

## 🎯 Quick Reference

### Брейки по BPM

- **~95-105**: riffin, king
- **~105-115**: impeach, action, around, sesame, useme
- **~115-125**: do, hotline, groove, ripple
- **~125-135**: apache, movement, newday, sport, hungup
- **~135-145**: think, amen, hitormiss, neworleans
- **~145-155**: rill, fireeater, marymary

### Брейки по стилю

- **Hip-Hop**: impeach, funkydrummer, apache, think
- **Jungle/DnB**: amen, amen1, amen2, amen3, think
- **Breakbeat**: apache, think, swat, squib
- **Funk**: funkydrummer, kool, fireeater, groove
- **Electro**: action, king

---

**Версия**: 1.0
**Обновлено**: Декабрь 2025
**Всего брейков**: 114 (34 clean + 80 amen variations)
**Источники**: Оригинальные виниловые записи, Dough-Amen коллекция
