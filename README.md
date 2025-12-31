# 🍞 Bulka

<div align="center">
  <img src="screens/1.png" alt="Bulka REPL" width="800"/>

  **Платформа для лайв-кодинга музыки с AI-агентом**

  🌐 [bulka.app](https://bulka.app/) • 💬 [Telegram](https://t.me/bulka_app) • 📸 [Скриншоты](SCREENSHOTS.md)
</div>

---

## Что это?

**Bulka** — это браузерный редактор для создания музыки кодом в реальном времени. Открываешь сайт, пишешь пару строчек — музыка играет мгновенно. Никаких установок, DAW или плагинов.

Это русскоязычный форк [Strudel](https://strudel.cc/) с встроенным AI-агентом, который помогает писать код, объясняет как что работает и ищет по документации. Идеально подходит как для музыкантов, которые хотят попробовать программирование, так и для программистов, которые хотят делать музыку.

**Для кого:**
- Музыканты и продюсеры — новый инструмент для live-выступлений и экспериментов
- Программисты — творчество через код, generative-музыка и algorave
- Новички — самый простой способ начать программировать (через музыку это весело)
- VJ и визуальщики — встроенная Hydra для live-визуалов синхронно с музыкой

## Ключевые возможности

**🤖 AI-агент (теперь бесплатно!)**
Встроенный ассистент на базе GPT-5.2, Claude Opus 4.5 или Gemini 3 Pro. Пишешь "сделай техно-бит" — получаешь готовый код. Агент умеет редактировать твой код, искать по документации и объяснять как всё работает. Для продвинутых моделей видно процесс рассуждения в реальном времени.

**🆓 Бесплатный режим через GPT4Free**
Благодаря интеграции с [GPT4Free](https://github.com/xtekky/gpt4free) агент доступен бесплатно — без API ключей. Мы сделали симуляцию инструментов: код автоматически вставляется в редактор и музыка запускается. Это не идеально (нет поиска по документации, возможны лимиты провайдеров), но работает и лучше чем ничего. Для максимального опыта используй Claude Opus 4.5 со своим ключом.

**🎵 Мгновенное воспроизведение**
Изменил код → нажал Ctrl+Enter → музыка обновилась. Никаких рендеров и экспортов. Всё происходит в браузере через Web Audio API. Сотни готовых сэмплов и синтезаторов уже встроены. Можно загружать свои звуки.

**🎙️ Запись треков**
Одна кнопка — и всё что играет записывается в WAV. Сразу можешь скачать готовый трек или продолжить дорабатывать в DAW.

**🎨 Live-визуалы**
Встроенная Hydra синхронизируется с музыкой. Пишешь код для звука и визуалов в одном окне. Идеально для VJ-сетов и live-выступлений.

**📚 Интерактивная документация**
Не нужно гуглить — вся документация встроена в редактор с live-примерами. Кликнул на функцию → увидел что она делает → скопировал себе. Полностью на русском языке.

## Быстрый старт

Открой [bulka.app](https://bulka.app/) и вставь этот код:

```javascript
// Простой drum-паттерн
s("bd sd bd sd, hh*8")

// Добавь басовую линию
note("c2 e2 g2 a2").s("sawtooth").lpf(800)
```

Нажми **Play** или **Ctrl+Enter** — всё, музыка играет!

Дальше можешь:
- Спросить у AI-агента: "добавь кислотный бас"
- Изменить код и нажать **Update** (Ctrl+Enter снова)
- Нажать **Record** чтобы записать трек в WAV
- Открыть панель **Sounds** и выбрать другие сэмплы
- Нажать `/` и начать вводить название функции для поиска по документации

## Разработка

Хочешь запустить локально или доработать проект:

```bash
git clone https://github.com/timoncool/Bulka.git
cd Bulka
pnpm i      # нужен Node.js 18+ и pnpm
pnpm dev    # сайт откроется на localhost:4321
```

Пакеты Bulka доступны на npm под неймспейсом `@strudel` — можешь встроить редактор в свой проект. Подробности в [документации](https://strudel.cc/technical-manual/project-start).

## Автор

Проект развивается [Nerual Dreming](https://t.me/nerual_dreming) — основателем [ArtGeneration.me](https://artgeneration.me/), [техноблогером](https://www.youtube.com/@nerual_dreming) и нейро-евангелистом.

## Благодарности

Bulka основана на проекте [Strudel](https://strudel.cc/) от Alex McLean и сообщества. Спасибо всем контрибьюторам оригинального проекта.

## 🌍 Сообщество

### Bulka (русскоязычное)
- **Telegram**: [t.me/bulka_app](https://t.me/bulka_app) — обсуждения, помощь, новости проекта
- **GitHub**: [github.com/timoncool/Bulka](https://github.com/timoncool/Bulka) — код, issues, pull requests

### Strudel/TidalCycles (международное)
- **Discord**: [#strudel](https://discord.com/invite/HGEdXmRkzT) — 7000+ участников
- **Форум**: [club.tidalcycles.org](https://club.tidalcycles.org/) — обсуждения и вопросы

## ⭐ Поддержи проект

## Star History

<a href="https://www.star-history.com/#timoncool/Bulka&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=timoncool/Bulka&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=timoncool/Bulka&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=timoncool/Bulka&type=date&legend=top-left" />
 </picture>
</a>

Если тебе нравится Bulka — поставь звезду! Это помогает проекту расти и мотивирует команду развивать его дальше.

**Как ещё можно помочь:**
- 🐛 Нашёл баг? Создай [issue](https://github.com/timoncool/Bulka/issues)
- 💡 Есть идея? Предложи в [Telegram](https://t.me/bulka_app) или [issues](https://github.com/timoncool/Bulka/issues)
- 🛠️ Хочешь контрибьютить? Форкай репозиторий и присылай pull request
- 📢 Расскажи друзьям — музыкантам, программистам, всем кто любит творить

Присоединяйся к сообществу в [Telegram](https://t.me/bulka_app) — там мы обсуждаем идеи, помогаем новичкам и делимся своими треками!

## Лицензия

[GNU Affero General Public License v3.0](LICENSE)
