# Внешние источники

Hydra позволяет использовать внешние медиа-источники: веб-камеру, видео, изображения и даже экран компьютера. Они загружаются в переменные `s0`, `s1`, `s2`, `s3`.

## Доступные источники

| Метод | Описание |
|-------|----------|
| `initCam()` | Веб-камера |
| `initImage()` | Изображение |
| `initVideo()` | Видео файл |
| `initScreen()` | Захват экрана |
| `init()` | Произвольный HTML элемент |
| `initStream()` | Поток от другого пользователя |

---

## initCam() — Веб-камера

Инициализирует видеопоток с веб-камеры.

### Синтаксис

```javascript
s0.initCam(index)
```

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| index | 0 | Номер камеры (при нескольких) |

### Примеры

**Базовое использование камеры:**
```javascript
s0.initCam()
src(s0).out()
```

**Камера с калейдоскопом:**
```javascript
s0.initCam()
src(s0)
  .kaleid(4)
  .out()
```

**Камера с цветовыми эффектами:**
```javascript
s0.initCam()
src(s0)
  .saturate(3)
  .contrast(1.5)
  .kaleid(6)
  .out()
```

**Несколько камер:**
```javascript
s0.initCam(0)  // Первая камера
s1.initCam(1)  // Вторая камера

src(s0).blend(src(s1), 0.5).out()
```

**Камера как модулятор:**
```javascript
s0.initCam()
osc(10)
  .modulate(src(s0), 0.3)
  .out()
```

**Эффект зеркала:**
```javascript
s0.initCam()
src(s0)
  .scale(-1, 1)  // Отразить по горизонтали
  .out()
```

---

## initImage() — Изображение

Загружает изображение как источник.

### Синтаксис

```javascript
s0.initImage(url)
```

### Поддерживаемые форматы
- `.jpeg`, `.jpg`
- `.png`
- `.bmp`
- `.gif`
- `.webp`

### Примеры

**Загрузка изображения:**
```javascript
s0.initImage("https://example.com/image.jpg")
src(s0).out()
```

**Изображение с эффектами:**
```javascript
s0.initImage("https://upload.wikimedia.org/wikipedia/commons/2/2a/Heckert_GNU_white.svg")
src(s0)
  .kaleid(6)
  .modulate(noise(3), 0.2)
  .out()
```

### Решение проблем CORS

Если изображение не загружается из-за CORS:
1. Используйте сервисы, разрешающие CORS (Imgur, Wikimedia Commons)
2. Запустите Hydra локально
3. Используйте data URI

---

## initVideo() — Видео

Загружает видео файл как источник.

### Синтаксис

```javascript
s0.initVideo(url)
```

### Поддерживаемые форматы
- `.mp4`
- `.ogg`
- `.webm`

### Примеры

**Загрузка видео:**
```javascript
s0.initVideo("https://example.com/video.mp4")
src(s0).out()
```

**Управление воспроизведением:**
```javascript
s0.initVideo("video.mp4")

// Доступ к HTML video элементу
s0.src.playbackRate = 0.5  // Замедлить в 2 раза
s0.src.currentTime = 10    // Перемотать на 10 секунду
s0.src.loop = true         // Зациклить
```

**Видео с эффектами:**
```javascript
s0.initVideo("video.mp4")
src(s0)
  .pixelate(20, 20)
  .colorama(0.5)
  .out()
```

### Важно

Прямые ссылки на YouTube/Vimeo **не работают** — эти сервисы возвращают HTML страницы, а не видео файлы.

Решения:
1. Скачайте видео и запустите локальный сервер
2. Используйте `initScreen()` для захвата окна с видео

---

## initScreen() — Захват экрана

Захватывает содержимое экрана, окна или вкладки браузера.

### Синтаксис

```javascript
s0.initScreen()
```

При вызове браузер спросит, что именно захватить:
- Весь экран
- Окно приложения
- Вкладку браузера

### Примеры

**Базовый захват:**
```javascript
s0.initScreen()
src(s0).out()
```

**Захват с эффектами:**
```javascript
s0.initScreen()
src(s0)
  .scale(0.5)
  .kaleid(4)
  .out()
```

### Применения

- Захват видео с YouTube/Vimeo
- Визуализация других приложений
- Создание рекурсивных эффектов

---

## init() — Произвольный элемент

Загружает произвольный HTML элемент (canvas, video и т.д.).

### Синтаксис

```javascript
s0.init({
  src: element,
  dynamic: true/false
})
```

| Параметр | Описание |
|----------|----------|
| src | HTML элемент |
| dynamic | true — обновлять постоянно, false — статичная картинка |

### Примеры

**Интеграция с p5.js:**
```javascript
// p5.js предзагружен в Hydra
p5 = new P5()

// p5 код
p5.draw = () => {
  p5.background(0)
  p5.fill(255)
  p5.ellipse(p5.mouseX, p5.mouseY, 50)
}

// Использование p5 canvas в Hydra
s0.init({ src: p5.canvas, dynamic: true })
src(s0).kaleid(4).out()
```

---

## initStream() — Сетевой поток

Подключается к потоку другого пользователя Hydra.

### Синтаксис

```javascript
s0.initStream(sessionName)
```

### Примеры

**Получение потока:**
```javascript
s0.initStream("user123")
src(s0).out()
```

**Отправка своего потока:**
```javascript
// Установить имя сессии
pb.setName("mySession")

// Другие пользователи могут подключиться:
// s0.initStream("mySession")
```

---

## Комплексные примеры

### Камера + генеративный фон

```javascript
s0.initCam()

// Генеративный фон
osc(10, 0.1, 0.5)
  .rotate(() => time * 0.1)
  .out(o1)

// Камера поверх фона
src(s0)
  .luma(0.5, 0.1)
  .layer(src(o1))
  .out(o0)
```

### Двойное зеркало

```javascript
s0.initCam()
src(s0)
  .scale(-1, 1)
  .blend(src(s0), 0.5)
  .kaleid(2)
  .out()
```

### Камера как текстура шума

```javascript
s0.initCam()
osc(60, 0.1, 0.5)
  .modulate(src(s0).saturate(0), 0.3)
  .out()
```

### Глитч-эффект с камерой

```javascript
s0.initCam()
src(s0)
  .modulate(noise(5), () => Math.random() * 0.1)
  .pixelate([100, 50, 20].fast(2))
  .out()
```

### Силуэт

```javascript
s0.initCam()
src(s0)
  .luma(0.5, 0.01)
  .color(0, 1, 1)
  .layer(gradient())
  .out()
```

---

## Решение проблем

### CORS ошибки

**Симптом:** Изображение или видео не загружается

**Причина:** Сервер запрещает загрузку с других доменов

**Решения:**
1. Используйте CORS-friendly сервисы:
   - Imgur
   - Wikimedia Commons
   - Giphy
2. Запустите Hydra локально
3. Загрузите файл на свой сервер с правильными заголовками

### YouTube/Vimeo не работает

**Симптом:** Видео не воспроизводится

**Причина:** Ссылка ведёт на HTML страницу, а не на видео файл

**Решения:**
1. Скачайте видео
2. Используйте `initScreen()` для захвата окна браузера с видео

### Камера не работает

**Симптом:** Чёрный экран или ошибка

**Возможные причины:**
1. Браузер не запросил разрешение — обновите страницу
2. Камера используется другим приложением
3. Нет камеры в системе

## Следующие шаги

- [Аудио-реактивность](./08-audio-reaktivnost.md) — реакция на звук
- [Feedback эффекты](./10-feedback-effekty.md) — использование выходов как источников
