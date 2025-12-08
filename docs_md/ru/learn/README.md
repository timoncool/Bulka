# Документация Strudel - Раздел Learn

Эта директория содержит документацию по изучению Strudel, конвертированную из MDX в Markdown.

## Список файлов

1. **01-nachalo-raboty.md** - Начало работы со Strudel
2. **02-noty.md** - Работа с нотами и высотой звука
3. **03-zvuki.md** - Основы работы со звуками
4. **04-sintaksis-kodirovaniya.md** - Синтаксис кодирования
5. **05-mini-notation.md** - Mini Notation синтаксис
6. **06-samples.md** - Работа с сэмплами
7. **07-synths.md** - Синтезаторы
8. **08-audio-effects.md** - Аудио эффекты
9. **09-sozdanie-patterns.md** - Создание паттернов
10. **10-modifikatory-vremeni.md** - Модификаторы времени
11. **11-signaly.md** - Непрерывные сигналы
12. **12-sluchaynye-modifikatory.md** - Случайные модификаторы
13. **13-uslovnye-modifikatory.md** - Условные модификаторы
14. **14-modifikatory-nakopleniya.md** - Модификаторы накопления
15. **15-tonalnye-funktsii.md** - Тональные функции
16. **16-ksenogarmonicheskie-funktsii.md** - Ксеногармонические функции
17. **17-stepwise-patterning.md** - Stepwise patterning
18. **18-midi-osc-mqtt.md** - MIDI, OSC и MQTT
19. **19-ustroystva-vvoda.md** - Устройства ввода
20. **20-dvizhenie-ustroystva.md** - Движение устройства
21. **21-hydra.md** - Использование Hydra
22. **22-csound.md** - Использование CSound
23. **23-prodvinutye-integratsii.md** - Продвинутые интеграции
24. **24-vizualnaya-obratnaya-svyaz.md** - Визуальная обратная связь
25. **25-tsveta.md** - Работа с цветами
26. **26-metadannye-muzyki.md** - Метаданные музыки
27. **27-offline.md** - Использование Strudel в оффлайн режиме
28. **28-mondo-notation.md** - Mondo Notation
29. **29-strudel-vs-tidal.md** - Сравнение Strudel и Tidal
30. **30-soobshchestvo-i-resursy.md** - Сообщество и ресурсы

## Правила конвертации

При конвертации из MDX в Markdown были применены следующие правила:

1. Удалены импорты компонентов (import ... from)
2. Компоненты JSX (MiniRepl, JsDoc и т.д.) заменены на чистый Markdown
3. MiniRepl компоненты конвертированы в блоки кода ```javascript с пометкой "// Пример:"
4. JsDoc компоненты заменены на заголовки функций
5. Сохранены все примеры кода в блоках ```javascript
6. Frontmatter преобразован в заголовок первого уровня
7. Сохранена структура заголовков
8. Файлы названы с использованием транслитерации и номеров для упорядочивания

## Исходные файлы

Исходные MDX файлы находятся в: `/home/user/Bulka/website/src/pages/learn/`

## Дата конвертации

2025-12-08
