import { currentLang } from '../../i18n/lang.mjs';

/**
 * Chat suggestions - показываются случайные из списка
 */
const SUGGESTIONS_RU = [
  // Создание треков
  { label: 'Создай техно трек 130bpm', prompt: 'Создай техно трек 130 bpm с кикдрамом, хэтами и синтезатором' },
  { label: 'Создай хип-хоп с басом 808', prompt: 'Создай хип-хоп бит с бумбапом и 808 басом' },
  { label: 'Создай драм-н-бейс 174bpm', prompt: 'Создай dnb трек 174 bpm с аменом и рисом' },
  { label: 'Создай хаус four-on-floor', prompt: 'Создай хаус грув с four-on-the-floor и органом' },
  { label: 'Создай эмбиент с пэдами', prompt: 'Создай эмбиентный пейзаж с пэдами и текстурами' },
  { label: 'Создай лоу-фай с шумом винила', prompt: 'Создай лоу-фай хип-хоп с виниловым шумом' },
  { label: 'Создай UK гэридж со скипом', prompt: 'Создай UK garage трек со скипом и вокальным чопом' },
  { label: 'Создай брейкбит с нарезкой', prompt: 'Создай брейкбит с нарезанными барабанами' },
  { label: 'Создай минимал с грувом', prompt: 'Создай минимал техно с простым грувом' },
  { label: 'Создай транс с арпеджио', prompt: 'Создай транс трек 140 bpm с арпеджио и пэдом' },
  { label: 'Создай дабстеп с воблом', prompt: 'Создай дабстеп трек с вобл басом и агрессивными ударными' },
  { label: 'Создай трэп с роллами хэтов', prompt: 'Создай трэп бит с роллами хай-хэтов и 808' },

  // Визуализация
  { label: 'Добавь визуал Hydra к треку', prompt: 'Добавь визуализацию Hydra к треку' },
  { label: 'Добавь пианоролл ноты', prompt: 'Добавь визуализацию пианоролл' },
  { label: 'Добавь осциллоскоп волну', prompt: 'Добавь визуализацию _scope()' },
  { label: 'Добавь спектр частот', prompt: 'Добавь визуализацию спектра' },
  {
    label: 'Добавь графику синхро музыке',
    prompt: 'Добавь генеративную визуализацию Hydra синхронизированную с музыкой',
  },

  // Инструменты
  { label: 'Замени сэмплы на другие паки', prompt: 'Замени инструменты на другие из доступных паков' },
  { label: 'Добавь синтезаторную партию', prompt: 'Добавь синтезаторную партию' },
  { label: 'Добавь партию пианино', prompt: 'Добавь партию пианино' },
  { label: 'Добавь орган Hammond B3', prompt: 'Добавь партию органа Hammond' },
  { label: 'Добавь струнные инструменты', prompt: 'Добавь партию струнных' },
  { label: 'Добавь нарезку вокала', prompt: 'Добавь вокальные сэмплы или чопы' },
  { label: 'Добавь FM синт как DX7', prompt: 'Добавь FM синтезатор типа DX7' },
  { label: 'Добавь pluck для мелодии', prompt: 'Добавь pluck синтезатор для мелодии' },

  // Мелодия и гармония
  { label: 'Добавь быстрое арпеджио 16-ми', prompt: 'Добавь арпеджио шестнадцатыми нотами к треку' },
  { label: 'Добавь аккордовую прогрессию', prompt: 'Добавь аккордовую прогрессию' },
  { label: 'Сделай мелодию интереснее', prompt: 'Измени мелодию на что-то более интересное' },
  { label: 'Добавь вторую мелодию', prompt: 'Добавь контрмелодию к основной' },
  { label: 'Переведи трек в минор', prompt: 'Переведи трек в минорную тональность' },
  { label: 'Переведи трек в мажор', prompt: 'Переведи трек в мажорную тональность' },
  { label: 'Смени тональность трека', prompt: 'Транспонируй трек на другую тональность' },
  { label: 'Добавь джазовые аккорды', prompt: 'Добавь джазовые расширенные аккорды' },
  { label: 'Добавь полифонию двух мелодий', prompt: 'Добавь вторую мелодию создав полифонию' },

  // Ритм
  { label: 'Добавь конги и шейкеры', prompt: 'Добавь перкуссию - конги, бонги, шейкер, тамбурин' },
  { label: 'Добавь сложный полиритм', prompt: 'Добавь синкопы и полиритмию' },
  { label: 'Добавь свинг в ритм', prompt: 'Добавь свинг к ритму' },
  { label: 'Добавь филл в конце', prompt: 'Добавь драм филл в конце паттерна' },
  { label: 'Добавь тихую секцию', prompt: 'Добавь брейкдаун секцию' },
  { label: 'Добавь тихие ноты снейра', prompt: 'Добавь ghost ноты на снейре' },
  { label: 'Сделай ритм в 2 раза медленнее', prompt: 'Измени ритм на half-time feel' },

  // Эффекты
  { label: 'Добавь эхо большого зала', prompt: 'Добавь реверберацию большого зала к треку' },
  { label: 'Добавь дилей с обратной связью', prompt: 'Добавь эхо/задержку с обратной связью' },
  { label: 'Добавь плавающий фильтр', prompt: 'Добавь движение фильтра low-pass' },
  { label: 'Добавь грязный дисторшн', prompt: 'Добавь дисторшн/сатурацию' },
  { label: 'Добавь лоу-фай хруст', prompt: 'Добавь лоу-фай битовое сжатие и даунсэмплинг' },
  { label: 'Добавь хорус на синтезатор', prompt: 'Добавь хорус эффект на синтезатор' },
  { label: 'Добавь фейзер качание', prompt: 'Добавь фейзер эффект' },
  { label: 'Добавь flanger свист', prompt: 'Добавь flanger эффект' },
  { label: 'Добавь робо-голос вокодер', prompt: 'Добавь вокодер эффект' },

  // Пространство
  { label: 'Добавь движение влево-вправо', prompt: 'Добавь панорамирование - движение звука влево-вправо' },
  { label: 'Сделай звук шире стерео', prompt: 'Расширь стерео картину трека' },
  { label: 'Добавь авто-движение панорамы', prompt: 'Добавь автоматическое панорамирование' },
  { label: 'Раскидай звуки по панораме', prompt: 'Распредели инструменты по стерео панораме' },

  // Динамика
  { label: 'Добавь пульсацию громкости', prompt: 'Добавь изменение громкости по паттерну' },
  { label: 'Добавь качание от бочки', prompt: 'Добавь сайдчейн компрессию от бочки' },
  { label: 'Добавь автоматизацию параметров', prompt: 'Добавь автоматизацию параметров' },
  { label: 'Добавь нарастание билд-ап', prompt: 'Добавь build-up секцию с нарастанием' },
  { label: 'Приглуши звук на бочке', prompt: 'Добавь ducking эффект когда играет кик' },

  // Модификации
  { label: 'Ускорь трек на 20bpm', prompt: 'Увеличь темп на 20 bpm' },
  { label: 'Замедли трек на 20bpm', prompt: 'Уменьши темп на 20 bpm' },
  { label: 'Удвой длину паттерна', prompt: 'Удвой длительность паттерна' },
  { label: 'Сократи паттерн вдвое', prompt: 'Сократи паттерн в два раза' },
  { label: 'Добавь звуки задом-наперёд', prompt: 'Добавь реверсированные элементы' },
  { label: 'Добавь случайные вариации', prompt: 'Добавь случайные вариации в паттерн' },
  { label: 'Сделай euclidean ритм', prompt: 'Используй euclidean алгоритм для ритма' },
  { label: 'Добавь случайные элементы', prompt: 'Добавь стохастические/случайные элементы' },

  // Интерактивность
  { label: 'Добавь слайдеры управления', prompt: 'Добавь интерактивные слайдеры для управления параметрами' },
  { label: 'Добавь кнопки переключения', prompt: 'Добавь интерактивные кнопки для переключения паттернов' },
  { label: 'Добавь управление по MIDI', prompt: 'Добавь MIDI контроль параметров' },

  // Анализ
  { label: 'Объясни что делает код', prompt: 'Объясни что делает текущий код' },
  { label: 'Найди ошибки и исправь', prompt: 'Проверь код на ошибки и исправь' },
  { label: 'Сделай код проще и быстрее', prompt: 'Оптимизируй и упрости код' },
  { label: 'Подскажи что улучшить', prompt: 'Какие улучшения можно внести в этот трек?' },
  { label: 'Покажи другой вариант', prompt: 'Покажи альтернативный вариант реализации' },
];

const SUGGESTIONS_EN = [
  { label: 'Make a 130bpm techno track', prompt: 'Make a 130 bpm techno track with a kick drum, hats and a synth' },
  { label: 'Make hip-hop with an 808 bass', prompt: 'Make a boom bap hip-hop beat with an 808 bass' },
  { label: 'Make 174bpm drum and bass', prompt: 'Make a 174 bpm dnb track with an amen break and a reese bass' },
  { label: 'Make four-on-the-floor house', prompt: 'Make a house groove with four-on-the-floor and an organ' },
  { label: 'Make ambient with pads', prompt: 'Make an ambient landscape with pads and textures' },
  { label: 'Make lo-fi with vinyl noise', prompt: 'Make lo-fi hip-hop with vinyl noise' },
  { label: 'Make UK garage with skips', prompt: 'Make a UK garage track with a skippy beat and vocal chops' },
  { label: 'Make a chopped breakbeat', prompt: 'Make a breakbeat with chopped drums' },
  { label: 'Make a minimal groove', prompt: 'Make minimal techno with a simple groove' },
  { label: 'Make trance with arpeggios', prompt: 'Make a 140 bpm trance track with an arpeggio and a pad' },
  { label: 'Make dubstep with a wobble', prompt: 'Make a dubstep track with a wobble bass and aggressive drums' },
  { label: 'Make trap with hat rolls', prompt: 'Make a trap beat with hi-hat rolls and an 808' },
  { label: 'Add a Hydra visual to the track', prompt: 'Add a Hydra visual to the track' },
  { label: 'Add a piano roll', prompt: 'Add a piano roll visualization' },
  { label: 'Add an oscilloscope', prompt: 'Add a _scope() visualization' },
  { label: 'Add a frequency spectrum', prompt: 'Add a spectrum visualization' },
  { label: 'Add visuals synced to the music', prompt: 'Add a generative Hydra visual synced to the music' },
  { label: 'Swap samples for other packs', prompt: 'Replace the instruments with others from the available packs' },
  { label: 'Add a synth part', prompt: 'Add a synth part' },
  { label: 'Add a piano part', prompt: 'Add a piano part' },
  { label: 'Add a Hammond B3 organ', prompt: 'Add a Hammond organ part' },
  { label: 'Add strings', prompt: 'Add a string part' },
  { label: 'Add vocal chops', prompt: 'Add vocal samples or chops' },
  { label: 'Add a DX7-style FM synth', prompt: 'Add a DX7-style FM synth' },
  { label: 'Add a pluck for the melody', prompt: 'Add a pluck synth for the melody' },
  { label: 'Add a fast 16th arpeggio', prompt: 'Add a sixteenth-note arpeggio to the track' },
  { label: 'Add a chord progression', prompt: 'Add a chord progression' },
  { label: 'Make the melody more interesting', prompt: 'Change the melody to something more interesting' },
  { label: 'Add a second melody', prompt: 'Add a countermelody to the main one' },
  { label: 'Move the track to minor', prompt: 'Move the track to a minor key' },
  { label: 'Move the track to major', prompt: 'Move the track to a major key' },
  { label: 'Change the key', prompt: 'Transpose the track to another key' },
  { label: 'Add jazz chords', prompt: 'Add jazz extended chords' },
  { label: 'Add two-voice polyphony', prompt: 'Add a second melody to make polyphony' },
  { label: 'Add congas and shakers', prompt: 'Add percussion: congas, bongos, shaker, tambourine' },
  { label: 'Add a complex polyrhythm', prompt: 'Add syncopation and polyrhythm' },
  { label: 'Add swing to the rhythm', prompt: 'Add swing to the rhythm' },
  { label: 'Add a fill at the end', prompt: 'Add a drum fill at the end of the pattern' },
  { label: 'Add a quiet section', prompt: 'Add a breakdown section' },
  { label: 'Add quiet snare notes', prompt: 'Add ghost notes on the snare' },
  { label: 'Make the rhythm half time', prompt: 'Change the rhythm to a half-time feel' },
  { label: 'Add big hall reverb', prompt: 'Add big hall reverb to the track' },
  { label: 'Add a feedback delay', prompt: 'Add an echo/delay with feedback' },
  { label: 'Add a moving filter', prompt: 'Add low-pass filter movement' },
  { label: 'Add dirty distortion', prompt: 'Add distortion/saturation' },
  { label: 'Add lo-fi crunch', prompt: 'Add lo-fi bit crushing and downsampling' },
  { label: 'Add chorus to the synth', prompt: 'Add a chorus effect to the synth' },
  { label: 'Add a phaser sweep', prompt: 'Add a phaser effect' },
  { label: 'Add a flanger whoosh', prompt: 'Add a flanger effect' },
  { label: 'Add a robot vocoder', prompt: 'Add a vocoder effect' },
  { label: 'Add left-right movement', prompt: 'Add panning: the sound moving left and right' },
  { label: 'Make the stereo wider', prompt: 'Widen the stereo image of the track' },
  { label: 'Add auto-panning', prompt: 'Add automatic panning' },
  { label: 'Spread sounds across the stereo field', prompt: 'Spread the instruments across the stereo field' },
  { label: 'Add volume pulsing', prompt: 'Add patterned volume changes' },
  { label: 'Add kick pumping', prompt: 'Add sidechain compression from the kick' },
  { label: 'Add parameter automation', prompt: 'Add parameter automation' },
  { label: 'Add a build-up', prompt: 'Add a build-up section that rises' },
  { label: 'Duck the sound on the kick', prompt: 'Add a ducking effect when the kick plays' },
  { label: 'Speed up by 20bpm', prompt: 'Raise the tempo by 20 bpm' },
  { label: 'Slow down by 20bpm', prompt: 'Lower the tempo by 20 bpm' },
  { label: 'Double the pattern length', prompt: 'Double the length of the pattern' },
  { label: 'Halve the pattern', prompt: 'Make the pattern half as long' },
  { label: 'Add reversed sounds', prompt: 'Add reversed elements' },
  { label: 'Add random variations', prompt: 'Add random variations to the pattern' },
  { label: 'Make a euclidean rhythm', prompt: 'Use the euclidean algorithm for the rhythm' },
  { label: 'Add random elements', prompt: 'Add stochastic/random elements' },
  { label: 'Add control sliders', prompt: 'Add interactive sliders to control parameters' },
  { label: 'Add toggle buttons', prompt: 'Add interactive buttons to switch patterns' },
  { label: 'Add MIDI control', prompt: 'Add MIDI control of parameters' },
  { label: 'Explain what the code does', prompt: 'Explain what the current code does' },
  { label: 'Find and fix bugs', prompt: 'Check the code for errors and fix them' },
  { label: 'Make the code simpler and faster', prompt: 'Optimize and simplify the code' },
  { label: 'Suggest improvements', prompt: 'What improvements could this track get?' },
  { label: 'Show another version', prompt: 'Show an alternative implementation' },
];

const SUGGESTIONS = { ru: SUGGESTIONS_RU, en: SUGGESTIONS_EN };

/**
 * Get random suggestions
 * @param {number} count - количество suggestions
 * @returns {Array} случайные suggestions на языке интерфейса
 */
export function getRandomSuggestions(count = 5) {
  const shuffled = [...SUGGESTIONS[currentLang()]].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
