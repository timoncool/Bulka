# Темы редактора

Bulka поддерживает 40 встроенных цветовых тем для редактора кода. Вы можете переключать темы прямо из музыкального кода или через настройки.

## Список всех тем

### Тёмные темы (30)

| Тема | Описание |
|------|----------|
| `strudelTheme` | Стандартная тёмная тема (по умолчанию) |
| `algoboy` | Ретро-стиль Game Boy |
| `archBtw` | Arch Linux стиль |
| `androidstudio` | Android Studio |
| `atomone` | Atom One Dark |
| `aura` | Фиолетовая Aura |
| `bbedit` | BBEdit |
| `blackscreen` | Чёрный экран |
| `bluescreen` | Синий экран (BSOD стиль) |
| `CutiePi` | Милая розовая тема |
| `darcula` | JetBrains Darcula |
| `dracula` | Популярная Dracula |
| `duotoneDark` | Двухтоновая тёмная |
| `eclipse` | Eclipse Dark |
| `fruitDaw` | Fruit DAW стиль |
| `githubDark` | GitHub Dark |
| `greenText` | Зелёный текст на чёрном |
| `gruvboxDark` | Gruvbox Dark |
| `sonicPink` | Sonic Pink |
| `materialDark` | Material Dark |
| `monokai` | Классическая Monokai |
| `noctisLilac` | Noctis Lilac |
| `nord` | Nord (скандинавский стиль) |
| `redText` | Красный текст на чёрном |
| `solarizedDark` | Solarized Dark |
| `sublime` | Sublime Text |
| `teletext` | Телетекст ретро |
| `tokyoNight` | Tokyo Night |
| `tokyoNightStorm` | Tokyo Night Storm |
| `vscodeDark` | VS Code Dark |

### Светлые темы (10)

| Тема | Описание |
|------|----------|
| `bluescreenlight` | Светлый синий |
| `githubLight` | GitHub Light |
| `gruvboxLight` | Gruvbox Light |
| `materialLight` | Material Light |
| `solarizedLight` | Solarized Light |
| `tokyoNightDay` | Tokyo Night Day |
| `vscodeLight` | VS Code Light |
| `whitescreen` | Белый экран |
| `xcodeLight` | Xcode Light |

## Переключение темы из кода

Используйте функцию `theme()` для динамического переключения темы во время игры:

```javascript
// Устанавливает тему dracula
$: s("bd sd").theme("dracula")
```

### Автоматическое переключение тем

Можно переключать темы по очереди в такт музыке:

```javascript
// Меняет тему каждый такт
$: s("bd sd bd sd")
  .theme("<strudelTheme dracula nord monokai>")
```

```javascript
// Меняет тему каждые 4 такта
$: s("bd sd bd sd")
  .theme("<strudelTheme dracula nord monokai>/4")
```

### Все 40 тем в одном паттерне

```javascript
// Переключает все темы каждые 2 такта
$: s("bd sd bd sd")
  .theme("<strudelTheme algoboy archBtw androidstudio atomone aura bbedit blackscreen bluescreen bluescreenlight CutiePi darcula dracula duotoneDark eclipse fruitDaw githubDark githubLight greenText gruvboxDark gruvboxLight sonicPink materialDark materialLight monokai noctisLilac nord redText solarizedDark solarizedLight sublime teletext tokyoNight tokyoNightDay tokyoNightStorm vscodeDark vscodeLight whitescreen xcodeLight>/2")
```

### Примеры с музыкой

```javascript
// Мелодия со сменой тем
$: n("0 2 4 7".fast(2))
  .scale("C:minor")
  .s("piano")
  .theme("<nord dracula monokai tokyoNight>/4")
```

```javascript
// Драм-машина + темы
$: s("bd [~ bd] sd [bd ~]")
  .bank("RolandTR909")
  .theme("<strudelTheme algoboy archBtw blackscreen bluescreen>/2")

$: s("hh*8").bank("RolandTR909").gain(0.5)
```

## Переключение через настройки

1. Откройте панель настроек (иконка шестерёнки)
2. Найдите раздел "Theme"
3. Выберите тему из выпадающего списка

Выбранная тема сохраняется в localStorage и восстанавливается при следующем посещении.

## Создание кастомных тем

Каждая тема определяется в отдельном `.mjs` файле в папке `packages/codemirror/themes/`.

### Структура темы

```javascript
import { tags as t } from '@lezer/highlight';
import { createTheme } from './theme-helper.mjs';

// Основные настройки цветов
export const settings = {
  background: '#222',           // Фон редактора
  lineBackground: '#22222299',  // Фон строки кода
  foreground: '#fff',           // Цвет текста
  caret: '#ffcc00',             // Цвет курсора
  selection: 'rgba(128, 203, 196, 0.5)', // Цвет выделения
  selectionMatch: '#036dd626',  // Цвет совпадений при поиске
  lineHighlight: '#00000050',   // Подсветка активной строки
  gutterBackground: 'transparent', // Фон панели номеров строк
  gutterForeground: '#8a919966',   // Цвет номеров строк
  light: false,                 // true для светлых тем
};

// Создание темы с подсветкой синтаксиса
export default createTheme({
  theme: 'dark', // или 'light'
  settings,
  styles: [
    { tag: t.keyword, color: '#c792ea' },      // Ключевые слова
    { tag: t.string, color: '#c3e88d' },       // Строки
    { tag: t.number, color: '#c3e88d' },       // Числа
    { tag: t.comment, color: '#7d8799' },      // Комментарии
    { tag: t.variableName, color: '#c792ea' }, // Переменные
    { tag: t.operator, color: '#89ddff' },     // Операторы
    { tag: t.bracket, color: '#525154' },      // Скобки
    // ... другие теги
  ],
});
```

### Доступные теги для подсветки синтаксиса

- `t.keyword` — ключевые слова (if, else, function)
- `t.string` — строки в кавычках
- `t.number` — числа
- `t.comment` — комментарии
- `t.variableName` — имена переменных
- `t.operator` — операторы (+, -, *, /)
- `t.bracket` — скобки
- `t.propertyName` — свойства объектов
- `t.className` — имена классов
- `t.tagName` — теги
- `t.meta` — метаданные
- `t.atom` — атомарные значения
- `t.bool` — булевы значения

### Добавление новой темы

1. Создайте файл `packages/codemirror/themes/my-theme.mjs`
2. Экспортируйте `settings` и тему по умолчанию
3. Импортируйте тему в `packages/codemirror/themes.mjs`:

```javascript
import myTheme, { settings as myThemeSettings } from './themes/my-theme.mjs';

// Добавьте в объект themes:
export const themes = {
  // ... другие темы
  myTheme,
};

// Добавьте в объект settings:
export const settings = {
  // ... другие настройки
  myTheme: myThemeSettings,
};
```

После этого тема будет доступна через `theme("myTheme")` и в настройках.

## CSS переменные

Темы автоматически устанавливают CSS переменные в `:root`:

```css
:root {
  --background: #222;
  --foreground: #fff;
  --caret: #ffcc00;
  --selection: rgba(128, 203, 196, 0.5);
  --lineHighlight: #00000050;
  --gutterBackground: transparent;
  --gutterForeground: #8a919966;
}
```

Эти переменные можно использовать в своих стилях для согласованности с текущей темой.

## Ссылки

- [Исходный код тем](https://github.com/timoncool/Bulka/tree/main/packages/codemirror/themes)
- [Документация CodeMirror](https://codemirror.net/docs/ref/#language.HighlightStyle)
