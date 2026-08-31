# Техническое задание: Улучшение UX браузера семплов

**Версия:** 1.0
**Дата:** 2025-12-07
**Компонент:** `/home/user/Bulka/website/src/repl/components/panel/SoundsTab.jsx`

---

## Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Текущее состояние](#текущее-состояние)
3. [Древовидная структура паков](#1-древовидная-структура-паков)
4. [Фильтр по пакам](#2-фильтр-по-пакам)
5. [Улучшенный поиск](#3-улучшенный-поиск)
6. [Избранное](#4-избранное)
7. [Превью улучшения](#5-превью-улучшения)
8. [Горячие клавиши](#6-горячие-клавиши)
9. [Структура данных](#структура-данных)
10. [План реализации](#план-реализации)

---

## Обзор проекта

Bulka — это браузерная DAW на основе Strudel, позволяющая создавать музыку через live coding. Браузер семплов является критически важным компонентом для работы со звуками.

### Анализ лучших практик DAW

| Функция | FL Studio | Ableton | Logic Pro | Bitwig | Приоритет |
|---------|-----------|---------|-----------|--------|-----------|
| Древовидная структура | ✅ | ✅ | ✅ | ✅ | **Высокий** |
| Фильтр по категориям | ✅ | ✅ | ✅ | ✅ | **Высокий** |
| Fuzzy search | ✅ | ✅ | ⚠️ | ✅ | Средний |
| Избранное | ✅ | ✅ | ✅ | ✅ | **Высокий** |
| Превью с визуализацией | ✅ | ✅ | ✅ | ✅ | Средний |
| Горячие клавиши | ✅ | ✅ | ✅ | ✅ | **Высокий** |

---

## Текущее состояние

### Что работает хорошо ✅

- Базовый поиск через `includes()`
- Фильтрация по типам звуков (samples, drums, synths, wavetables, user)
- Превью звуков по клику (mousedown/mouseup)
- Копирование названия звука в буфер обмена
- Вставка в редактор через кнопку
- Отображение количества семплов в паке: `(N)`

### Проблемы текущей реализации ❌

1. **Плоский список всех звуков** — сложно ориентироваться при большом количестве паков
2. **Нет группировки по пакам** — звуки из разных источников смешаны
3. **Примитивный поиск** — не учитывает опечатки, не подсвечивает совпадения
4. **Нет избранного** — невозможно сохранить часто используемые звуки
5. **Нет информации о длительности** — неясно, сколько длится семпл
6. **Только мышь** — нет навигации с клавиатуры

### Архитектура данных

```javascript
// soundMap structure (nanostores map)
soundMap.get() = {
  "sound_name": {
    onTrigger: Function,
    data: {
      type: 'sample' | 'synth' | 'soundfont' | 'wavetable',
      samples: Array | Object,  // массив URL или объект {note: [urls]}
      tag: 'drum-machines' | undefined,
      prebake: boolean,
      // + другие метаданные
    }
  }
}
```

---

## 1. Древовидная структура паков

### Цель
Организовать звуки в древовидную структуру для удобной навигации, как в FL Studio Browser или Ableton Browser.

### Требования

#### 1.1 Группировка по источникам

- [ ] Автоматически группировать звуки по источнику загрузки
- [ ] Использовать префиксы из имен звуков для определения пака (до `_`)
- [ ] Для звуков без префикса создавать группу "Другие"

**Примеры:**
```
tidal-drum-machines.json:
  └─ 808_bd, 808_sd, 808_hh
     → Пак "808"

Dirt-Samples.json:
  └─ arpy, bass, casio
     → Паки "arpy", "bass", "casio"
```

#### 1.2 UI компоненты

- [ ] Использовать `@headlessui/react` `Disclosure` для раскрывающихся элементов
- [ ] Иконки из `@heroicons/react`:
  - `ChevronRightIcon` — свернутая папка
  - `ChevronDownIcon` — развернутая папка
  - `FolderIcon` — иконка пака
  - `MusicalNoteIcon` — иконка звука

**Пример кода:**
```jsx
import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon, FolderIcon } from '@heroicons/react/20/solid';

function PackItem({ packName, sounds }) {
  return (
    <Disclosure defaultOpen={false}>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center gap-1 w-full hover:bg-foreground/5 px-2 py-1 rounded">
            {open ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
            <FolderIcon className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{packName}</span>
            <span className="text-xs opacity-60">({sounds.length})</span>
          </Disclosure.Button>
          <Disclosure.Panel className="pl-6">
            {sounds.map(sound => <SoundItem key={sound.name} {...sound} />)}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
```

#### 1.3 Структура данных

```javascript
// Функция для группировки звуков
function groupSoundsByPack(soundEntries) {
  const packs = new Map();

  soundEntries.forEach(([name, sound]) => {
    // Определяем имя пака
    const packName = getPackName(name, sound.data);

    if (!packs.has(packName)) {
      packs.set(packName, {
        name: packName,
        sounds: [],
        type: sound.data.type,
        tag: sound.data.tag,
        source: getSourceURL(sound.data),
      });
    }

    packs.get(packName).sounds.push({ name, ...sound });
  });

  return Array.from(packs.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function getPackName(soundName, data) {
  // Для drum machines используем префикс
  if (data.tag === 'drum-machines') {
    return soundName.split('_')[0];
  }

  // Для других семплов - имя самого звука как пак
  if (data.type === 'sample') {
    return soundName;
  }

  // Для синтезаторов и soundfont
  return soundName;
}

function getSourceURL(data) {
  if (!data.samples) return null;
  const firstSample = Array.isArray(data.samples)
    ? data.samples[0]
    : Object.values(data.samples)[0]?.[0];
  // Извлекаем базовый URL
  return firstSample ? extractBaseURL(firstSample) : null;
}
```

#### 1.4 Сохранение состояния

- [ ] Сохранять развернутые паки в `localStorage`
- [ ] Ключ: `strudel-expanded-packs`
- [ ] Формат: `{ [packName]: boolean }`

```javascript
import { persistentMap } from '@nanostores/persistent';

export const expandedPacksMap = persistentMap('strudel-expanded-packs', {});
```

---

## 2. Фильтр по пакам

### Цель
Позволить пользователю скрывать ненужные паки для уменьшения визуального шума.

### Требования

#### 2.1 UI фильтра

- [ ] Добавить раздел "Фильтр паков" над списком звуков
- [ ] Использовать чекбоксы для каждого доступного пака
- [ ] Добавить кнопки "Выбрать все" / "Снять все"
- [ ] Компонент сворачивается/разворачивается (по умолчанию свернут)

**Макет:**
```
┌─────────────────────────────────────┐
│ ▼ Фильтр паков (12 выбрано из 15)  │
├─────────────────────────────────────┤
│ [Выбрать все] [Снять все]           │
│ ☑ 808                    (24)       │
│ ☑ 909                    (18)       │
│ ☐ CR78                   (12)       │
│ ☑ piano                  (31)       │
│ ...                                 │
└─────────────────────────────────────┘
```

#### 2.2 Компонент фильтра

```jsx
import { useState, useMemo } from 'react';
import { Disclosure } from '@headlessui/react';
import { FunnelIcon, CheckIcon } from '@heroicons/react/20/solid';

function PackFilter({ packs, selectedPacks, onPackToggle }) {
  const allPackNames = useMemo(() => packs.map(p => p.name), [packs]);
  const selectedCount = selectedPacks.size;

  return (
    <Disclosure defaultOpen={false}>
      {({ open }) => (
        <div className="border-b border-foreground/10 pb-2 mb-2">
          <Disclosure.Button className="flex items-center gap-2 text-sm">
            <FunnelIcon className="w-4 h-4" />
            <span>
              Фильтр паков ({selectedCount} из {allPackNames.length})
            </span>
          </Disclosure.Button>

          <Disclosure.Panel className="mt-2 space-y-1">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => onPackToggle(allPackNames, true)}
                className="text-xs px-2 py-1 bg-foreground/5 hover:bg-foreground/10 rounded"
              >
                Выбрать все
              </button>
              <button
                onClick={() => onPackToggle([], false)}
                className="text-xs px-2 py-1 bg-foreground/5 hover:bg-foreground/10 rounded"
              >
                Снять все
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {packs.map(pack => (
                <label
                  key={pack.name}
                  className="flex items-center gap-2 text-sm hover:bg-foreground/5 px-2 py-1 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPacks.has(pack.name)}
                    onChange={(e) => onPackToggle(pack.name, e.target.checked)}
                    className="rounded"
                  />
                  <span className="flex-1">{pack.name}</span>
                  <span className="text-xs opacity-60">({pack.sounds.length})</span>
                </label>
              ))}
            </div>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
}
```

#### 2.3 Управление состоянием

```javascript
import { persistentMap } from '@nanostores/persistent';

// Хранение выбранных паков
export const selectedPacksMap = persistentMap('strudel-selected-packs', {
  // По умолчанию все включены
  _initialized: false,
});

// В компоненте
function SoundsTab() {
  const selectedPacksData = useStore(selectedPacksMap);
  const [selectedPacks, setSelectedPacks] = useState(() => {
    if (!selectedPacksData._initialized) {
      // Первый запуск - выбрать все паки
      return new Set();
    }
    return new Set(Object.keys(selectedPacksData).filter(k => k !== '_initialized'));
  });

  useEffect(() => {
    // Синхронизация с localStorage
    const newData = { _initialized: true };
    selectedPacks.forEach(pack => newData[pack] = true);
    selectedPacksMap.set(newData);
  }, [selectedPacks]);

  // Фильтрация паков
  const visiblePacks = useMemo(() => {
    if (selectedPacks.size === 0) return allPacks; // Если ничего не выбрано - показать все
    return allPacks.filter(pack => selectedPacks.has(pack.name));
  }, [allPacks, selectedPacks]);
}
```

---

## 3. Улучшенный поиск

### Цель
Реализовать "умный" поиск с учетом опечаток и подсветкой совпадений, как в Ableton Live.

### Требования

#### 3.1 Fuzzy search

- [ ] Использовать библиотеку `fuse.js` для fuzzy search
- [ ] Поиск по имени пака + имени звука
- [ ] Настройка порога релевантности (threshold: 0.3)
- [ ] Сортировка результатов по релевантности

**Установка:**
```bash
npm install fuse.js
```

**Пример использования:**
```javascript
import Fuse from 'fuse.js';

function useFuzzySearch(sounds, searchQuery) {
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'packName', weight: 0.7 },
        { name: 'soundName', weight: 1.0 },
        { name: 'tag', weight: 0.5 },
      ],
      threshold: 0.3,  // 0 = точное совпадение, 1 = любое
      includeScore: true,
      includeMatches: true,  // Для подсветки
      minMatchCharLength: 2,
    };

    const searchData = sounds.map(([name, sound]) => ({
      packName: getPackName(name, sound.data),
      soundName: name,
      tag: sound.data.tag || '',
      original: [name, sound],
    }));

    return new Fuse(searchData, options);
  }, [sounds]);

  return useMemo(() => {
    if (!searchQuery) return sounds;

    const results = fuse.search(searchQuery);
    return results.map(result => ({
      ...result.item.original,
      matches: result.matches,  // Для подсветки
      score: result.score,
    }));
  }, [searchQuery, fuse, sounds]);
}
```

#### 3.2 Подсветка совпадений

- [ ] Выделять найденные части текста желтым фоном
- [ ] Использовать `mark` элемент для семантической разметки

```jsx
function HighlightedText({ text, matches }) {
  if (!matches || matches.length === 0) {
    return <span>{text}</span>;
  }

  // Найти индексы для подсветки
  const highlights = matches
    .filter(m => m.key === 'soundName')
    .flatMap(m => m.indices);

  if (highlights.length === 0) {
    return <span>{text}</span>;
  }

  // Разбить текст на части
  const parts = [];
  let lastIndex = 0;

  highlights.forEach(([start, end]) => {
    if (start > lastIndex) {
      parts.push({ text: text.slice(lastIndex, start), highlight: false });
    }
    parts.push({ text: text.slice(start, end + 1), highlight: true });
    lastIndex = end + 1;
  });

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }

  return (
    <span>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} className="bg-yellow-300 dark:bg-yellow-600">{part.text}</mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}
```

#### 3.3 Улучшения поля поиска

- [ ] Добавить иконку поиска (MagnifyingGlassIcon)
- [ ] Кнопка очистки поиска (XMarkIcon)
- [ ] Показывать количество найденных результатов
- [ ] Debounce для производительности (300ms)

```jsx
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useMemo, useState } from 'react';
import { useDebounce } from '@src/hooks/useDebounce';

function SearchBox({ value, onChange, resultsCount }) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск звуков..."
        className="w-full pl-8 pr-8 py-2 bg-background border border-foreground/20 rounded"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
      {value && (
        <div className="text-xs opacity-60 mt-1">
          Найдено: {resultsCount}
        </div>
      )}
    </div>
  );
}

// Хук для debounce
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 4. Избранное

### Цель
Позволить пользователям сохранять часто используемые звуки для быстрого доступа.

### Требования

#### 4.1 UI избранного

- [ ] Иконка звезды рядом с каждым звуком (StarIcon)
- [ ] Заполненная звезда для избранных звуков
- [ ] Отдельная вкладка "Избранное" в фильтре типов
- [ ] Подсчет количества избранных в UI

**Иконки:**
```jsx
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

function FavoriteButton({ soundName, isFavorite, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(soundName);
      }}
      className="p-0.5 hover:opacity-50 hover:bg-foreground/10 rounded"
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
    >
      {isFavorite ? (
        <StarSolid className="w-3.5 h-3.5 text-yellow-500" />
      ) : (
        <StarOutline className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
```

#### 4.2 Хранение избранного

```javascript
import { persistentMap } from '@nanostores/persistent';

// Хранение избранных звуков
export const favoriteSoundsMap = persistentMap('strudel-favorite-sounds', {});

// Хуки для работы с избранным
export function useFavorites() {
  const favoritesData = useStore(favoriteSoundsMap);
  const favorites = useMemo(() => new Set(Object.keys(favoritesData)), [favoritesData]);

  const toggleFavorite = useCallback((soundName) => {
    const current = favoriteSoundsMap.get();
    if (current[soundName]) {
      const { [soundName]: _, ...rest } = current;
      favoriteSoundsMap.set(rest);
    } else {
      favoriteSoundsMap.set({ ...current, [soundName]: true });
    }
  }, []);

  const isFavorite = useCallback((soundName) => {
    return favorites.has(soundName);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite, count: favorites.size };
}
```

#### 4.3 Фильтр избранного

- [ ] Добавить значение `FAVORITES` в `soundFilterType`
- [ ] Обновить `ButtonGroup` для отображения "избранное"
- [ ] Показывать количество избранных в кнопке

```javascript
// В settings.mjs
export const soundFilterType = {
  USER: 'user',
  DRUMS: 'drums',
  SAMPLES: 'samples',
  SYNTHS: 'synths',
  WAVETABLES: 'wavetables',
  FAVORITES: 'favorites',  // НОВОЕ
  ALL: 'all',
};

// В SoundsTab.jsx
const { favorites } = useFavorites();

const soundEntries = useMemo(() => {
  // ... существующая логика ...

  if (soundsFilter === soundFilterType.FAVORITES) {
    return filtered.filter(([name]) => favorites.has(name));
  }

  return filtered;
}, [sounds, soundsFilter, search, favorites]);

// В ButtonGroup
<ButtonGroup
  value={soundsFilter}
  onChange={(value) => settingsMap.setKey('soundsFilter', value)}
  items={{
    favorites: `избранное (${favoritesCount})`,  // НОВОЕ
    samples: 'сэмплы',
    drums: 'драм-машины',
    synths: 'синтезаторы',
    wavetables: 'волновые таблицы',
    user: 'свои',
    importSounds: 'импорт звуков',
  }}
/>
```

---

## 5. Превью улучшения

### Цель
Добавить больше информации о звуке перед его использованием.

### Требования

#### 5.1 Длительность звука

- [ ] Отображать длительность семпла рядом с именем
- [ ] Формат: `MM:SS` или `S.Ss` для коротких
- [ ] Получать из загруженного буфера

```javascript
import { getCachedBuffer } from '@strudel/webaudio';

function getSampleDuration(soundData) {
  if (!soundData.samples) return null;

  // Получить первый семпл
  const firstSample = Array.isArray(soundData.samples)
    ? soundData.samples[0]
    : Object.values(soundData.samples)[0]?.[0];

  if (!firstSample) return null;

  // Попробовать получить из кэша
  const buffer = getCachedBuffer(firstSample);
  if (buffer) {
    return formatDuration(buffer.duration);
  }

  return null;
}

function formatDuration(seconds) {
  if (seconds < 10) {
    return `${seconds.toFixed(1)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

#### 5.2 Информация о паке

- [ ] При развороте пака показывать метаданные
- [ ] Количество звуков в паке
- [ ] Тип (sample/synth/etc)
- [ ] Источник (GitHub URL)

```jsx
function PackInfo({ pack }) {
  return (
    <div className="text-xs opacity-60 px-2 py-1 bg-foreground/5 rounded mb-1">
      <div className="flex justify-between">
        <span>Звуков: {pack.sounds.length}</span>
        <span>Тип: {pack.type}</span>
      </div>
      {pack.source && (
        <div className="truncate" title={pack.source}>
          Источник: {pack.source}
        </div>
      )}
    </div>
  );
}
```

#### 5.3 Миниатюра формы волны (опционально)

**Примечание:** Эта функция требует дополнительной работы и может быть реализована во второй итерации.

- [ ] Использовать Canvas для отрисовки waveform
- [ ] Показывать при наведении или в развернутом виде
- [ ] Кэширование отрисованных waveform

```jsx
import { useEffect, useRef } from 'react';

function WaveformPreview({ soundData, width = 120, height = 30 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const buffer = getCachedBuffer(soundData.samples[0]);
    if (!buffer) return;

    const ctx = canvas.getContext('2d');
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(100, 100, 255, 0.5)';

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  }, [soundData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded opacity-70"
    />
  );
}
```

---

## 6. Горячие клавиши

### Цель
Ускорить работу со звуками через клавиатуру, как в профессиональных DAW.

### Требования

#### 6.1 Навигация

| Клавиша | Действие | Приоритет |
|---------|----------|-----------|
| `Space` | Превью звука | **Высокий** |
| `Enter` | Вставить в редактор | **Высокий** |
| `F` | Добавить/убрать из избранного | Средний |
| `↑` / `↓` | Навигация по списку | **Высокий** |
| `→` | Развернуть пак | Средний |
| `←` | Свернуть пак | Средний |
| `Esc` | Сбросить выбор / закрыть поиск | Средний |
| `/` | Фокус на поиск | Низкий |
| `Ctrl/Cmd + C` | Копировать название | Низкий |

#### 6.2 Реализация навигации

```jsx
import { useEffect, useState, useCallback, useRef } from 'react';

function useSoundNavigation(sounds, onPreview, onInsert) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const soundsListRef = useRef(null);

  // Автоматическая прокрутка к выбранному элементу
  useEffect(() => {
    if (selectedIndex >= 0 && soundsListRef.current) {
      const element = soundsListRef.current.children[selectedIndex];
      element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e) => {
    // Игнорировать если фокус в input
    if (e.target.tagName === 'INPUT' && e.key !== 'Escape') {
      return;
    }

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, sounds.length - 1));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;

      case ' ':  // Space
        e.preventDefault();
        if (selectedIndex >= 0) {
          onPreview(sounds[selectedIndex]);
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onInsert(sounds[selectedIndex]);
        }
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        if (selectedIndex >= 0) {
          toggleFavorite(sounds[selectedIndex][0]);
        }
        break;

      case 'Escape':
        setSelectedIndex(-1);
        // Снять фокус с поиска
        document.activeElement?.blur();
        break;

      case '/':
        e.preventDefault();
        // Фокус на поле поиска
        document.querySelector('#sound-search')?.focus();
        break;
    }
  }, [sounds, selectedIndex, onPreview, onInsert]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { selectedIndex, setSelectedIndex, soundsListRef };
}
```

#### 6.3 Визуальная индикация выбранного элемента

```jsx
function SoundItem({ name, data, isSelected, onClick }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded cursor-pointer',
        isSelected && 'bg-blue-500/20 ring-1 ring-blue-500',
        !isSelected && 'hover:bg-foreground/5'
      )}
      onClick={onClick}
    >
      {/* ... содержимое ... */}
    </div>
  );
}
```

#### 6.4 Подсказки по клавишам

- [ ] Добавить всплывающую подсказку при первом открытии
- [ ] Кнопка "?" для показа справки по клавишам
- [ ] Использовать `@headlessui/react` Dialog для модального окна

```jsx
import { Dialog } from '@headlessui/react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 opacity-60 hover:opacity-100"
        title="Горячие клавиши"
      >
        <QuestionMarkCircleIcon className="w-5 h-5" />
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-background rounded-lg p-6 max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">
              Горячие клавиши
            </Dialog.Title>

            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 font-mono">Space</td><td>Превью звука</td></tr>
                <tr><td className="py-1 font-mono">Enter</td><td>Вставить в редактор</td></tr>
                <tr><td className="py-1 font-mono">F</td><td>Избранное</td></tr>
                <tr><td className="py-1 font-mono">↑ / ↓</td><td>Навигация</td></tr>
                <tr><td className="py-1 font-mono">Esc</td><td>Сбросить</td></tr>
                <tr><td className="py-1 font-mono">/</td><td>Поиск</td></tr>
              </tbody>
            </table>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              Закрыть
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
```

---

## Структура данных

### Новые хранилища (nanostores)

```javascript
// /home/user/Bulka/website/src/soundsSettings.mjs

import { persistentMap } from '@nanostores/persistent';

// Избранные звуки: { [soundName]: true }
export const favoriteSoundsMap = persistentMap('strudel-favorite-sounds', {});

// Развернутые паки: { [packName]: boolean }
export const expandedPacksMap = persistentMap('strudel-expanded-packs', {});

// Выбранные паки для фильтра: { [packName]: true, _initialized: boolean }
export const selectedPacksMap = persistentMap('strudel-selected-packs', {
  _initialized: false,
});

// Показывать ли подсказку по горячим клавишам
export const showKeyboardHintMap = persistentMap('strudel-keyboard-hint', {
  shown: false,
});
```

### Типы

```typescript
// types.ts

type SoundType = 'sample' | 'synth' | 'soundfont' | 'wavetable';

type SoundTag = 'drum-machines' | string;

interface SoundData {
  type: SoundType;
  samples: string[] | Record<string, string[]>;
  tag?: SoundTag;
  prebake?: boolean;
}

interface Sound {
  onTrigger: Function;
  data: SoundData;
}

interface Pack {
  name: string;
  sounds: Array<[string, Sound]>;
  type: SoundType;
  tag?: SoundTag;
  source?: string;
  totalSamples: number;
}

interface FuzzySearchResult {
  item: [string, Sound];
  matches?: Array<{
    key: string;
    indices: Array<[number, number]>;
  }>;
  score?: number;
}
```

---

## План реализации

### Фаза 1: Древовидная структура (1-2 дня)

- [x] **День 1: Группировка и базовый UI**
  - [ ] Создать функцию `groupSoundsByPack()`
  - [ ] Реализовать компонент `PackItem` с Disclosure
  - [ ] Интегрировать в `SoundsTab.jsx`
  - [ ] Добавить хранилище `expandedPacksMap`
  - [ ] Тестирование с разными типами паков

- [x] **День 2: Полировка**
  - [ ] Иконки для паков и звуков
  - [ ] Анимации открытия/закрытия
  - [ ] Сохранение состояния в localStorage
  - [ ] Рефакторинг кода

### Фаза 2: Фильтр и поиск (2-3 дня)

- [x] **День 3: Фильтр по пакам**
  - [ ] Компонент `PackFilter`
  - [ ] Хранилище `selectedPacksMap`
  - [ ] Логика фильтрации
  - [ ] UI чекбоксов

- [x] **День 4: Fuzzy search**
  - [ ] Установить и настроить `fuse.js`
  - [ ] Хук `useFuzzySearch()`
  - [ ] Интеграция в поиск

- [x] **День 5: Подсветка совпадений**
  - [ ] Компонент `HighlightedText`
  - [ ] Улучшенное поле поиска
  - [ ] Счетчик результатов
  - [ ] Debounce

### Фаза 3: Избранное (1 день)

- [x] **День 6: Избранное**
  - [ ] Хранилище `favoriteSoundsMap`
  - [ ] Компонент `FavoriteButton`
  - [ ] Фильтр "Избранное"
  - [ ] Хук `useFavorites()`
  - [ ] Интеграция в UI

### Фаза 4: Превью и метаданные (1-2 дня)

- [x] **День 7: Информация о звуках**
  - [ ] Функция `getSampleDuration()`
  - [ ] Отображение длительности
  - [ ] Компонент `PackInfo`
  - [ ] Подсчет семплов в паке

- [x] **День 8 (опционально): Waveform**
  - [ ] Компонент `WaveformPreview`
  - [ ] Кэширование отрисовок
  - [ ] Оптимизация производительности

### Фаза 5: Горячие клавиши (1-2 дня)

- [x] **День 9: Навигация**
  - [ ] Хук `useSoundNavigation()`
  - [ ] Обработчики клавиш
  - [ ] Визуальная индикация выбора
  - [ ] Автопрокрутка

- [x] **День 10: Документация**
  - [ ] Компонент `KeyboardShortcutsHelp`
  - [ ] Подсказки для пользователей
  - [ ] Первый запуск (onboarding)

### Фаза 6: Тестирование и оптимизация (1-2 дня)

- [x] **День 11: Тестирование**
  - [ ] Тестирование с большими библиотеками (>500 звуков)
  - [ ] Проверка производительности
  - [ ] Кросс-браузерное тестирование
  - [ ] Мобильная версия

- [x] **День 12: Оптимизация**
  - [ ] Виртуализация списка (если нужно)
  - [ ] Lazy loading паков
  - [ ] Мемоизация дорогих вычислений
  - [ ] Финальный рефакторинг

---

## Чек-лист готовности

### Обязательные функции (MVP)

- [ ] ✅ Древовидная структура паков с раскрытием
- [ ] ✅ Сохранение состояния развернутых паков
- [ ] ✅ Фильтр по пакам с чекбоксами
- [ ] ✅ Fuzzy search по имени звука и пака
- [ ] ✅ Избранное с сохранением в localStorage
- [ ] ✅ Базовая навигация с клавиатуры (↑↓ Enter Space)
- [ ] ✅ Отображение количества звуков в паке

### Желательные функции

- [ ] 🎯 Подсветка совпадений в поиске
- [ ] 🎯 Полный набор горячих клавиш (F, Esc, /, →, ←)
- [ ] 🎯 Отображение длительности звуков
- [ ] 🎯 Справка по горячим клавишам
- [ ] 🎯 Информация о паке (источник, тип)

### Опциональные функции

- [ ] 💡 Waveform preview
- [ ] 💡 Виртуализация для очень больших списков
- [ ] 💡 Drag & drop звуков в редактор
- [ ] 💡 Экспорт/импорт избранного
- [ ] 💡 История недавно использованных звуков

---

## Производительность

### Требования

- Время рендеринга списка из 500 звуков: < 100ms
- Время поиска в 1000 звуках: < 50ms
- Плавная прокрутка: 60 FPS
- Размер localStorage: < 100KB

### Оптимизации

1. **Мемоизация:**
```javascript
const groupedPacks = useMemo(() => groupSoundsByPack(soundEntries), [soundEntries]);
const searchResults = useMemo(() => fuzzySearch(sounds, query), [sounds, query]);
```

2. **Виртуализация (если нужно):**
```bash
npm install react-window
```

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedSoundList({ sounds }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={sounds.length}
      itemSize={35}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <SoundItem {...sounds[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

3. **Debounce для поиска:**
```javascript
const debouncedSearch = useDebounce(searchQuery, 300);
```

4. **Lazy loading паков:**
```javascript
// Загружать metadata только для развернутых паков
const packMetadata = useMemo(() => {
  if (!expandedPacks.has(pack.name)) return null;
  return getPackMetadata(pack);
}, [pack, expandedPacks]);
```

---

## Совместимость

### Браузеры

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+

### Зависимости

```json
{
  "dependencies": {
    "fuse.js": "^7.0.0",
    "@headlessui/react": "^2.2.0",
    "@heroicons/react": "^2.2.0",
    "@nanostores/persistent": "^0.10.2",
    "@nanostores/react": "^0.8.4"
  }
}
```

---

## Примеры использования

### Сценарий 1: Быстрый поиск драм-машины

```
1. Пользователь открывает вкладку "Звуки"
2. Нажимает "/" для фокуса на поиске
3. Вводит "808 bd"
4. Fuzzy search находит "808_bd" даже с опечатками
5. Нажимает ↓ для выбора
6. Нажимает Enter для вставки в редактор
```

### Сценарий 2: Работа с избранным

```
1. Пользователь ищет интересные звуки
2. Нажимает "F" на понравившихся звуках
3. Переключается на фильтр "Избранное"
4. Видит только свои избранные звуки
5. Быстро выбирает нужные для проекта
```

### Сценарий 3: Исследование пака

```
1. Пользователь видит список паков
2. Кликает на "808" для разворота
3. Видит метаинформацию: "24 звука, драм-машина"
4. Просматривает список звуков с длительностью
5. Слушает превью по Space
6. Добавляет нужные в избранное
```

---

## Будущие улучшения (v2.0)

1. **Теги и категории**
   - Пользовательские теги для звуков
   - Автоматическая категоризация (kick, snare, hi-hat)
   - Фильтр по нескольким тегам

2. **Коллекции**
   - Создание пользовательских коллекций
   - Экспорт/импорт коллекций
   - Шаринг коллекций с другими

3. **Превью с эффектами**
   - Применение базовых эффектов при превью
   - Сохранение настроек превью

4. **AI функции**
   - Похожие звуки ("Find similar")
   - Автоматические рекомендации
   - Анализ используемых звуков в паттерне

5. **Интеграция с DAW**
   - Drag & drop в другие приложения
   - Экспорт звуков
   - Синхронизация с облаком

---

## Вопросы для обсуждения

1. **Виртуализация:** Нужна ли она сейчас или отложить до появления проблем с производительностью?
2. **Waveform:** Включить в MVP или сделать отдельной фичей?
3. **Мобильная версия:** Какие адаптации нужны для touch-устройств?
4. **Импорт звуков:** Как интегрировать новую структуру с ImportSoundsButton?

---

## Контакты и ссылки

- **Репозиторий:** https://github.com/timoncool/Bulka
- **Документация Strudel:** https://strudel.tidalcycles.org/
- **Fuse.js docs:** https://fusejs.io/
- **Headless UI:** https://headlessui.com/

---

## История изменений

| Версия | Дата | Изменения |
|--------|------|-----------|
| 1.0 | 2025-12-07 | Первая версия ТЗ |

