# Packages Strudel

[Репозиторий strudel](https://codeberg.org/uzu/strudel) организован как monorepo, содержащий несколько npm packages.
Цель множественных packages:

- организовать кодовую базу на более модульные, инкапсулированные части
- иметь возможность отказаться от определенных функциональностей
- поддерживать зависимости core packages небольшими

## Обзор

[См. последние опубликованные packages на npm](https://www.npmjs.com/search?q=%40strudel).
Вот обзор всех packages:

### Зонтичные Packages

Эти packages дают вам полностью укомплектованную отправную точку, и, скорее всего, то, что вы хотите использовать в своем проекте:

- [repl](https://codeberg.org/uzu/strudel/src/branch/main/packages/repl): Strudel REPL как веб-компонент.
- [web](https://codeberg.org/uzu/strudel/src/branch/main/packages/web): Библиотека Strudel для браузера, без UI.

Чтобы узнать больше об этих двух, прочитайте [Использование Strudel в вашем проекте](/technical-manual/project-start)

### Основные Packages

Эти packages наиболее важные. Вы можете захотеть использовать все из них, если используете strudel в своем проекте:

- [core](https://codeberg.org/uzu/strudel/src/branch/main/packages/core#strudelcore): движок tidal pattern с базовыми примитивами
- [mini](https://codeberg.org/uzu/strudel/src/branch/main/packages/mini#strudelmini): парсер mini notation + привязки к core
- [transpiler](https://codeberg.org/uzu/strudel/src/branch/main/packages/transpiler#strudeltranspiler): транспилятор пользовательского кода. синтаксический сахар + подсветка

### Языковые расширения

Эти packages расширяют язык pattern специфическими функциями

- [tonal](https://codeberg.org/uzu/strudel/src/branch/main/packages/tonal): функции tonal для гамм и аккордов
- [xen](https://codeberg.org/uzu/strudel/src/branch/main/packages/xen): микротональные / ксеногармонические функции

### Выходы

Эти packages предоставляют привязки для различных способов вывода strudel patterns:

- [webaudio](https://codeberg.org/uzu/strudel/src/branch/main/packages/webaudio#strudelwebaudio): вывод webaudio по умолчанию
- [osc](https://codeberg.org/uzu/strudel/src/branch/main/packages/osc#strudelosc): привязки для коммуникации через OSC
- [midi](https://codeberg.org/uzu/strudel/src/branch/main/packages/midi#strudelmidi): привязки webmidi
- [csound](https://codeberg.org/uzu/strudel/src/branch/main/packages/csound#strudelcsound): привязки csound
- [soundfonts](https://codeberg.org/uzu/strudel/src/branch/main/packages/serial#strudelsoundfonts): поддержка Soundfont
- [serial](https://codeberg.org/uzu/strudel/src/branch/main/packages/serial#strudelserial): привязки webserial

### Другие

- [embed](https://codeberg.org/uzu/strudel/src/branch/main/packages/embed#strudelembed): встраиваемый REPL веб-компонент

### Не поддерживаются

- [react](https://www.npmjs.com/package/@strudel.cycles/react): react hooks и компоненты для strudel
- [eval](https://www.npmjs.com/package/@strudel.cycles/eval): старый транспилятор кода
- [tone](https://www.npmjs.com/package/@strudel.cycles/tone): привязки для инструментов и эффектов Tone.js
- [webdirt](https://www.npmjs.com/package/@strudel.cycles/webdirt): привязки webdirt, заменены на webaudio package
- любые `@strudel.cycles/*` packages были переименованы в `@strudel/*` начиная с версии 0.10.0.

## Инструменты

- [pnpm](https://pnpm.io/) для управления packages, workspaces и публикации
- [lerna](https://lerna.js.org/) для обновления версий
- см. CONTRIBUTING.md для получения дополнительной информации
