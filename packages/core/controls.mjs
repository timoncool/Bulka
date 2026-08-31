/*
controls.mjs - Registers audio controls for pattern manipulation and effects.
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/controls.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Pattern, register, reify } from './pattern.mjs';

export function createParam(names) {
  let isMulti = Array.isArray(names);
  names = !isMulti ? [names] : names;
  const name = names[0];

  // todo: make this less confusing
  const withVal = (xs) => {
    let bag;
    // check if we have an object with an unnamed control (.value)
    if (typeof xs === 'object' && xs.value !== undefined) {
      bag = { ...xs }; // grab props that are already there
      xs = xs.value; // grab the unnamed control for this one
      delete bag.value;
    }
    if (isMulti && Array.isArray(xs)) {
      const result = bag || {};
      xs.forEach((x, i) => {
        if (i < names.length) {
          result[names[i]] = x;
        }
      });
      return result;
    } else if (bag) {
      bag[name] = xs;
      return bag;
    } else {
      return { [name]: xs };
    }
  };

  // todo: make this less confusing
  const func = function (value, pat) {
    if (!pat) {
      return reify(value).withValue(withVal);
    }
    if (typeof value === 'undefined') {
      return pat.fmap(withVal);
    }
    return pat.set(reify(value).withValue(withVal));
  };
  Pattern.prototype[name] = function (value) {
    return func(value, this);
  };
  return func;
}

// maps control alias names to the "main" control name
const controlAlias = new Map();

export function isControlName(name) {
  return controlAlias.has(name);
}

export function registerControl(names, ...aliases) {
  const name = Array.isArray(names) ? names[0] : names;
  let bag = {};
  bag[name] = createParam(names);
  controlAlias.set(name, name);
  aliases.forEach((alias) => {
    bag[alias] = bag[name];
    controlAlias.set(alias, name);
    Pattern.prototype[alias] = Pattern.prototype[name];
  });
  return bag;
}

export function registerMultiControl(names, maxControls, ...aliases) {
  names = Array.isArray(names) ? names : [names];
  let bag = {};
  for (let i = 1; i <= maxControls; i++) {
    let theseAliases = [...aliases];
    let theseNames = [...names];
    if (i === 1) {
      // adds e.g. fm1 as an alias for fm
      const aliases1 = theseAliases.map((a) => `${a}1`);
      const names1 = theseNames.map((n) => `${n}1`);
      theseAliases = theseAliases.concat(aliases1).concat(names1);
    } else {
      theseAliases = theseAliases.map((a) => `${a}${i}`);
      theseNames = theseNames.map((n) => `${n}${i}`);
    }
    const subBag = registerControl(theseNames, ...theseAliases);
    bag = { ...bag, ...subBag };
  }
  return bag;
}

/**
 * Выбирает звук / sample по имени. При использовании mininotation можно также опционально указать параметры 'n' и 'gain',
 * разделённые ':'.
 *
 * @name s
 * @param {string | Pattern} sound Звук / pattern звуков для выбора
 * @synonyms sound
 * @example
 * s("bd hh")
 * @example
 * s("bd:0 bd:1 bd:0:0.3 bd:1:1.4")
 *
 */
export const { s, sound } = registerControl(['s', 'n', 'gain'], 'sound');

/**
 * Позиция в wavetable wavetable oscillator
 *
 * @name wt
 * @param {number | Pattern} position Позиция в wavetable от 0 до 1
 * @synonyms wavetablePosition
 * @example
 * s("squelch").bank("wt_digital").seg(8).note("F1").wt("0 0.25 0.5 0.75 1")
 */
export const { wt, wavetablePosition } = registerControl('wt', 'wavetablePosition');

/**
 * Количество envelope, применяемое к position envelope wavetable oscillator
 *
 * @name wtenv
 * @param {number | Pattern} amount от 0 до 1
 */
export const { wtenv } = registerControl('wtenv');
/**
 * Время attack position envelope wavetable oscillator
 *
 * @name wtattack
 * @synonyms wtatt
 * @param {number | Pattern} time время attack в секундах
 */
export const { wtattack, wtatt } = registerControl('wtattack', 'wtatt');

/**
 * Время decay position envelope wavetable oscillator
 *
 * @name wtdecay
 * @synonyms wtdec
 * @param {number | Pattern} time время decay в секундах
 */
export const { wtdecay, wtdec } = registerControl('wtdecay', 'wtdec');

/**
 * Время sustain position envelope wavetable oscillator
 *
 * @name wtsustain
 * @synonyms wtsus
 * @param {number | Pattern} gain уровень sustain (от 0 до 1)
 */
export const { wtsustain, wtsus } = registerControl('wtsustain', 'wtsus');

/**
 * Время release position envelope wavetable oscillator
 *
 * @name wtrelease
 * @synonyms wtrel
 * @param {number | Pattern} time время release в секундах
 */
export const { wtrelease, wtrel } = registerControl('wtrelease', 'wtrel');

/**
 * Частота LFO для позиции wavetable oscillator
 *
 * @name wtrate
 * @param {number | Pattern} rate частота в герцах
 */
export const { wtrate } = registerControl('wtrate');
/**
 * Частота LFO для позиции wavetable oscillator, синхронизированная с циклами
 *
 * @name wtsync
 * @param {number | Pattern} rate частота в циклах
 */
export const { wtsync } = registerControl('wtsync');

/**
 * Глубина LFO для позиции wavetable oscillator
 *
 * @name wtdepth
 * @param {number | Pattern} depth глубина модуляции
 */
export const { wtdepth } = registerControl('wtdepth');

/**
 * Форма LFO для позиции wavetable oscillator
 *
 * @name wtshape
 * @param {number | Pattern} shape Форма lfo (0, 1, 2, ..)
 */
export const { wtshape } = registerControl('wtshape');

/**
 * Смещение DC LFO для позиции wavetable oscillator
 *
 * @name wtdc
 * @param {number | Pattern} dcoffset смещение dc. установите 0 для unipolar
 */
export const { wtdc } = registerControl('wtdc');

/**
 * Искажение LFO для позиции wavetable oscillator
 *
 * @name wtskew
 * @param {number | Pattern} skew Насколько сильно изгибать форму LFO
 */
export const { wtskew } = registerControl('wtskew');

/**
 * Количество warp (изменения формы волны), применяемое к wavetable oscillator
 *
 * @name warp
 * @param {number | Pattern} amount Warp wavetable от 0 до 1
 * @synonyms wavetableWarp
 * @example
 * s("basique").bank("wt_digital").seg(8).note("F1").warp("0 0.25 0.5 0.75 1")
 *   .warpmode("spin")
 */
export const { warp, wavetableWarp } = registerControl('warp', 'wavetableWarp');

/**
 * Время attack warp envelope wavetable oscillator
 *
 * @name warpattack
 * @synonyms warpatt
 * @param {number | Pattern} time время attack в секундах
 */
export const { warpattack, warpatt } = registerControl('warpattack', 'warpatt');

/**
 * Время decay warp envelope wavetable oscillator
 *
 * @name warpdecay
 * @synonyms warpdec
 * @param {number | Pattern} time время decay в секундах
 */
export const { warpdecay, warpdec } = registerControl('warpdecay', 'warpdec');

/**
 * Время sustain warp envelope wavetable oscillator
 *
 * @name warpsustain
 * @synonyms warpsus
 * @param {number | Pattern} gain уровень sustain (от 0 до 1)
 */
export const { warpsustain, warpsus } = registerControl('warpsustain', 'warpsus');

/**
 * Время release warp envelope wavetable oscillator
 *
 * @name warprelease
 * @synonyms warprel
 * @param {number | Pattern} time время release в секундах
 */
export const { warprelease, warprel } = registerControl('warprelease', 'warprel');

/**
 * Частота LFO для warp wavetable oscillator
 *
 * @name warprate
 * @param {number | Pattern} rate частота в герцах
 */
export const { warprate } = registerControl('warprate');

/**
 * Глубина LFO для warp wavetable oscillator
 *
 * @name warpdepth
 * @param {number | Pattern} depth глубина модуляции
 */
export const { warpdepth } = registerControl('warpdepth');

/**
 * Форма LFO для warp wavetable oscillator
 *
 * @name warpshape
 * @param {number | Pattern} shape Форма lfo (0, 1, 2, ..)
 */
export const { warpshape } = registerControl('warpshape');

/**
 * Смещение DC LFO для warp wavetable oscillator
 *
 * @name warpdc
 * @param {number | Pattern} dcoffset смещение dc. установите 0 для unipolar
 */
export const { warpdc } = registerControl('warpdc');

/**
 * Искажение LFO для warp wavetable oscillator
 *
 * @name warpskew
 * @param {number | Pattern} skew Насколько сильно изгибать форму LFO
 */
export const { warpskew } = registerControl('warpskew');

/**
 * Тип warp (изменения формы волны), применяемый к wavetable oscillator.
 *
 * Доступные варианты: none, asym, bendp, bendm, bendmp, sync, quant, fold, pwm, orbit,
 * spin, chaos, primes, binary, brownian, reciprocal, wormhole, logistic, sigmoid, fractal, flip
 *
 * @name warpmode
 * @param {number | string | Pattern} mode Режим warp
 * @synonyms wavetableWarpMode
 * @example
 * s("morgana").bank("wt_digital").seg(8).note("F1").warp("0 0.25 0.5 0.75 1")
 *   .warpmode("<asym bendp spin logistic sync wormhole brownian>*2")
 *
 */
export const { warpmode, wavetableWarpMode } = registerControl('warpmode', 'wavetableWarpMode');

/**
 * Количество случайности начальной фазы wavetable oscillator.
 *
 * @name wtphaserand
 * @param {number | Pattern} amount Случайность начальной фазы. От 0 (не случайно) до 1 (полностью случайно)
 * @synonyms wavetablePhaseRand
 * @example
 * s("basique").bank("wt_digital").seg(16).wtphaserand("<0 1>")
 *
 */
export const { wtphaserand, wavetablePhaseRand } = registerControl('wtphaserand', 'wavetablePhaseRand');

/**
 * Количество envelope, применяемое к position envelope wavetable oscillator
 *
 * @name warpenv
 * @param {number | Pattern} amount от 0 до 1
 */
export const { warpenv } = registerControl('warpenv');

/**
 * Частота LFO для warp позиции wavetable, синхронизированная с циклами
 *
 * @name warpsync
 * @param {number | Pattern} rate частота в циклах
 */
export const { warpsync } = registerControl('warpsync');

/**
 * Определяет пользовательский webaudio node для использования в качестве источника звука.
 *
 * @name source
 * @synonyms src
 * @param {function} getSource
 * @synonyms src
 *
 */
export const { source, src } = registerControl('source', 'src');
/**
 * Выбирает указанный индекс из карты sample.
 * Слишком большие числа будут циклически повторяться.
 * `n` также можно использовать для воспроизведения midi-нот, но рекомендуется использовать `note`.
 *
 * @name n
 * @param {number | Pattern} value индекс sample, начиная с 0
 * @example
 * s("bd sd [~ bd] sd,hh*6").n("<0 1>")
 */
// also see https://codeberg.org/uzu/strudel/pulls/63
export const { n } = registerControl('n');
/**
 * Воспроизводит указанное имя ноты или midi-номер. Имя ноты состоит из:
 *
 * - буквы (a-g или A-G)
 * - опциональных знаков альтерации (b или #)
 * - опционального (возможно отрицательного) номера октавы (0-9). По умолчанию 3
 *
 * Примеры допустимых имён нот: `c`, `bb`, `Bb`, `f#`, `c3`, `A4`, `Eb2`, `c#5`
 *
 * Также можно использовать midi-номера вместо имён нот, где 69 соответствует A4 440Hz в 12EDO.
 *
 * @name note
 * @example
 * note("c a f e")
 * @example
 * note("c4 a4 f4 e4")
 * @example
 * note("60 69 65 64")
 * @example
 * note("fbb1 a#0 cbbb-1 e##-2").sound("saw")
 */
export const { note } = registerControl(['note', 'n']);

/**
 * Pattern чисел, которые ускоряют (или замедляют) sample во время воспроизведения. В настоящее время поддерживается только в osc / superdirt.
 *
 * @name accelerate
 * @param {number | Pattern} amount ускорение.
 * @superdirtOnly
 * @example
 * s("sax").accelerate("<0 1 2 4 8 16>").slow(2).osc()
 *
 */
export const { accelerate } = registerControl('accelerate');
/**
 * Устанавливает силу нажатия от 0 до 1. Умножается вместе с gain.
 *
 * @name velocity
 * @example
 * s("hh*8")
 * .gain(".4!2 1 .4!2 1 .4 1")
 * .velocity(".4 1")
 */
export const { velocity } = registerControl('velocity');
/**
 * Управляет gain экспоненциальным образом.
 *
 * @name gain
 * @param {number | Pattern} amount громкость.
 * @example
 * s("hh*8").gain(".4!2 1 .4!2 1 .4 1").fast(2)
 *
 */
export const { gain } = registerControl('gain');
/**
 * Gain, применяемый после обработки всех эффектов.
 *
 * @name postgain
 * @example
 * s("bd sd [~ bd] sd,hh*8")
 * .compressor("-20:20:10:.002:.02").postgain(1.5)
 *
 */
export const { postgain } = registerControl('postgain');
/**
 * Как `gain`, но линейный.
 *
 * @name amp
 * @param {number | Pattern} amount громкость.
 * @superdirtOnly
 * @example
 * s("bd*8").amp(".1*2 .5 .1*2 .5 .1 .5").osc()
 *
 */
export const { amp } = registerControl('amp');
/**
 * Время attack амплитудного envelope: Определяет, сколько времени требуется звуку для достижения пикового значения относительно начала.
 *
 * @name attack
 * @param {number | Pattern} attack время в секундах.
 * @synonyms att
 * @example
 * note("c3 e3 f3 g3").attack("<0 .1 .5>")
 *
 */
export const { attack, att } = registerControl('attack', 'att');

/**
 * Устанавливает коэффициент гармоничности частотной модуляции.
 * Управляет тембром звука.
 * Целые числа и простые соотношения звучат более естественно,
 * тогда как десятичные числа и сложные соотношения звучат металлически.
 *
 * Можно добавить номер для управления гармоничностью
 * любого из 8 индивидуальных FM (например, `fmh2`)
 *
 * @name fmh
 * @param {number | Pattern} harmonicity
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmh("<1 2 1.5 1.61>")
 * ._scope()
 *
 */
export const { fmh, fmh1, fmh2, fmh3, fmh4, fmh5, fmh6, fmh7, fmh8 } = registerMultiControl(['fmh', 'fmi'], 8, 'fmh');

/**
 * Устанавливает частотную модуляцию синтезатора.
 * Управляет индексом модуляции, который определяет яркость звука.
 *
 * Можно добавить номер для управления индексом модуляции
 * любого из 8 индивидуальных FM (например, `fm3`). Также FM могут маршрутизироваться друг в друга
 * с помощью матричных команд типа `fm13`, которая отправит `fm1` обратно в
 * `fm3`
 *
 * @name fmi
 * @param {number | Pattern} brightness индекс модуляции
 * @synonyms fm
 * @example
 * note("c e g b g e")
 * .fm("<0 1 2 8 32>")
 * ._scope()
 * @example
 * s("sine").note("F1").seg(8)
 *  .fm(4).fm2(rand.mul(4)).fm3(saw.mul(8).slow(8))
 *  .fmh(1.06).fmh2(10).fmh3(0.1)
 *
 */
export const { fmi, fmi1, fmi2, fmi3, fmi4, fmi5, fmi6, fmi7, fmi8, fm, fm1, fm2, fm3, fm4, fm5, fm6, fm7, fm8 } =
  registerMultiControl(['fmi', 'fmh'], 8, 'fm');

// fm envelope
/**
 * Тип нарастания fm envelope. Exp может работать некорректно..
 *
 * Можно добавить номер для управления envelope
 * любого из 8 индивидуальных FM (например, `fmenv4`)
 *
 * @name fmenv
 * @param {number | Pattern} type lin | exp
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmdecay(.2)
 * .fmsustain(0)
 * .fmenv("<exp lin>")
 * ._scope()
 *
 */
export const { fmenv, fmenv1, fmenv2, fmenv3, fmenv4, fmenv5, fmenv6, fmenv7, fmenv8 } = registerMultiControl(
  'fmenv',
  8,
);

/**
 * Время attack для FM envelope: время, необходимое для достижения максимальной модуляции
 *
 * Можно добавить номер для управления attack envelope
 * любого из 8 индивидуальных FM (например, `fmatt5`)
 *
 * @name fmattack
 * @synonyms fmatt
 * @param {number | Pattern} time время attack
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmattack("<0 .05 .1 .2>")
 * ._scope()
 *
 */
export const {
  fmattack,
  fmattack1,
  fmattack2,
  fmattack3,
  fmattack4,
  fmattack5,
  fmattack6,
  fmattack7,
  fmattack8,
  fmatt,
  fmatt1,
  fmatt2,
  fmatt3,
  fmatt4,
  fmatt5,
  fmatt6,
  fmatt7,
  fmatt8,
} = registerMultiControl('fmattack', 8, 'fmatt');

/**
 * Форма волны fm модулятора
 *
 * Можно добавить номер для управления формой волны
 * любого из 8 индивидуальных FM (например, `fmwave6`)
 *
 * @name fmwave
 * @param {number | Pattern} wave форма волны
 * @example
 * n("0 1 2 3".fast(4)).scale("d:minor").s("sine").fmwave("<sine square sawtooth crackle>").fm(4).fmh(2.01)
 * @example
 * n("0 1 2 3".fast(4)).chord("<Dm Am F G>").voicing().s("sawtooth").fmwave("brown").fm(.6)
 *
 */
export const { fmwave, fmwave1, fmwave2, fmwave3, fmwave4, fmwave5, fmwave6, fmwave7, fmwave8 } = registerMultiControl(
  'fmwave',
  8,
);

/**
 * Время decay для FM envelope: секунды до достижения уровня sustain после фазы attack.
 *
 * Можно добавить номер для управления decay envelope
 * любого из 8 индивидуальных FM (например, `fmdec6`)
 *
 * @name fmdecay
 * @synonyms fmdec
 * @param {number | Pattern} time время decay
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmdecay("<.01 .05 .1 .2>")
 * .fmsustain(.4)
 * ._scope()
 *
 */
export const {
  fmdecay,
  fmdecay1,
  fmdecay2,
  fmdecay3,
  fmdecay4,
  fmdecay5,
  fmdecay6,
  fmdecay7,
  fmdecay8,
  fmdec,
  fmdec1,
  fmdec2,
  fmdec3,
  fmdec4,
  fmdec5,
  fmdec6,
  fmdec7,
  fmdec8,
} = registerMultiControl('fmdecay', 8, 'fmdec');

/**
 * Уровень sustain для FM envelope: какая модуляция применяется после фазы decay
 *
 * Можно добавить номер для управления sustain envelope
 * любого из 8 индивидуальных FM (например, `fmsus7`)
 *
 * @name fmsustain
 * @synonyms fmsus
 * @param {number | Pattern} level уровень sustain
 * @example
 * note("c e g b g e")
 * .fm(4)
 * .fmdecay(.1)
 * .fmsustain("<1 .75 .5 0>")
 * ._scope()
 *
 */
export const {
  fmsustain,
  fmsustain1,
  fmsustain2,
  fmsustain3,
  fmsustain4,
  fmsustain5,
  fmsustain6,
  fmsustain7,
  fmsustain8,
  fmsus,
  fmsus1,
  fmsus2,
  fmsus3,
  fmsus4,
  fmsus5,
  fmsus6,
  fmsus7,
  fmsus8,
} = registerMultiControl('fmsustain', 8, 'fmsus');

/**
 * Время release для FM envelope: какая модуляция применяется после отпускания ноты
 *
 * Можно добавить номер для управления release envelope
 * любого из 8 индивидуальных FM (например, `fmrel8`)
 *
 * @name fmrelease
 * @synonyms fmrel
 * @param {number | Pattern} time время release
 *
 */
export const {
  fmrelease,
  fmrelease1,
  fmrelease2,
  fmrelease3,
  fmrelease4,
  fmrelease5,
  fmrelease6,
  fmrelease7,
  fmrelease8,
  fmrel,
  fmrel1,
  fmrel2,
  fmrel3,
  fmrel4,
  fmrel5,
  fmrel6,
  fmrel7,
  fmrel8,
} = registerMultiControl('fmrelease', 8, 'fmrel');

// FM Matrix
// Note: we do not declare top-level exports here since it would add
// ~162 more explicit exports. This is likely fine as the most common use-case would be to at least
// declare one other FM prior to utilizing the matrix functionality, but if we ever decide we need it,
// TODO to add it explicitly / go with the globalThis approach
for (let i = 0; i <= 8; i++) {
  for (let j = 0; j <= 8; j++) {
    registerControl(`fmi${i}${j}`, `fm${i}${j}`);
  }
}

/**
 * Выбирает банк звуков для использования. Используется вместе с `s`. Имя банка (+ "_") будет добавлено к значению `s`.
 *
 * @name bank
 * @param {string | Pattern} bank имя банка
 * @example
 * s("bd sd [~ bd] sd").bank('RolandTR909') // = s("RolandTR909_bd RolandTR909_sd")
 *
 */
export const { bank } = registerControl('bank');

/**
 * Управление микшированием эффекта chorus
 *
 * @name chorus
 * @param {string | Pattern} chorus количество микширования от 0 до 1
 * @example
 * note("d d a# a").s("sawtooth").chorus(.5)
 *
 */
export const { chorus } = registerControl('chorus');

// analyser node send amount 0 - 1 (used by scope)
export const { analyze } = registerControl('analyze');
// fftSize of analyser
export const { fft } = registerControl('fft');

/**
 * Время decay амплитудного envelope: время, которое требуется после attack для достижения уровня sustain.
 * Обратите внимание, что decay слышен только если значение sustain меньше 1.
 *
 * @name decay
 * @param {number | Pattern} time время decay в секундах
 * @synonyms dec
 * @example
 * note("c3 e3 f3 g3").decay("<.1 .2 .3 .4>").sustain(0)
 *
 */
export const { decay, dec } = registerControl('decay', 'dec');
/**
 * Уровень sustain амплитудного envelope: Уровень, который достигается после attack / decay и поддерживается до окончания.
 *
 * @name sustain
 * @param {number | Pattern} gain уровень sustain от 0 до 1
 * @synonyms sus
 * @example
 * note("c3 e3 f3 g3").decay(.2).sustain("<0 .1 .4 .6 1>")
 *
 */
export const { sustain, sus } = registerControl('sustain', 'sus');
/**
 * Время release амплитудного envelope: Время, которое требуется после окончания для перехода от уровня sustain к нулю.
 *
 * @name release
 * @param {number | Pattern} time время release в секундах
 * @synonyms rel
 * @example
 * note("c3 e3 g3 c4").release("<0 .1 .4 .6 1>/2")
 *
 */
export const { release, rel } = registerControl('release', 'rel');
export const { hold } = registerControl('hold');
// TODO: in tidal, it seems to be normalized
/**
 * Устанавливает центральную частоту **b**and-**p**ass **f**ilter. При использовании mininotation можно
 * также опционально указать параметр 'bpq', разделённый ':'.
 *
 * @name bpf
 * @param {number | Pattern} frequency центральная частота
 * @synonyms bandf, bp
 * @example
 * s("bd sd [~ bd] sd,hh*6").bpf("<1000 2000 4000 8000>")
 *
 */
export const { bandf, bpf, bp } = registerControl(['bandf', 'bandq', 'bpenv'], 'bpf', 'bp');
// TODO: in tidal, it seems to be normalized
/**
 * Устанавливает **b**and-**p**ass **q**-фактор (резонанс).
 *
 * @name bpq
 * @param {number | Pattern} q q-фактор
 * @synonyms bandq
 * @example
 * s("bd sd [~ bd] sd").bpf(500).bpq("<0 1 2 3>")
 *
 */
// currently an alias of 'bandq' https://codeberg.org/uzu/strudel/issues/496
// ['bpq'],
export const { bandq, bpq } = registerControl('bandq', 'bpq');
/**
 * Pattern чисел от 0 до 1. Пропускает начало каждого sample, например, `0.25` обрезает первую четверть каждого sample.
 *
 * @memberof Pattern
 * @name begin
 * @param {number | Pattern} amount от 0 до 1, где 1 это длина sample
 * @example
 * samples({ rave: 'rave/AREUREADY.wav' }, 'github:tidalcycles/dirt-samples')
 * s("rave").begin("<0 .25 .5 .75>").fast(2)
 *
 */
export const { begin } = registerControl('begin');
/**
 * То же, что .begin, но обрезает конец каждого sample.
 *
 * @memberof Pattern
 * @name end
 * @param {number | Pattern} length 1 = весь sample, .5 = половина sample, .25 = четверть sample и т.д.
 * @example
 * s("bd*2,oh*4").end("<.1 .2 .5 1>").fast(2)
 *
 */
export const { end } = registerControl('end');
/**
 * Зацикливает sample.
 * Обратите внимание, что темп loop не синхронизирован с темпом цикла.
 * Для изменения области loop используйте loopBegin / loopEnd.
 *
 * @name loop
 * @param {number | Pattern} on Если 1, sample зациклен
 * @example
 * s("casio").loop(1)
 *
 */
export const { loop } = registerControl('loop');
/**
 * Начинает loop в определённой точке sample (между `begin` и `end`).
 * Обратите внимание, что точка loop должна находиться между `begin` и `end`, и перед `loopEnd`!
 * Примечание: Sample, начинающиеся с wt_, автоматически зацикливаются! (wt = wavetable)
 *
 * @name loopBegin
 * @param {number | Pattern} time от 0 до 1, где 1 это длина sample
 * @synonyms loopb
 * @example
 * s("space").loop(1)
 * .loopBegin("<0 .125 .25>")._scope()
 */
export const { loopBegin, loopb } = registerControl('loopBegin', 'loopb');
/**
 *
 * Заканчивает секцию loop в определённой точке sample (между `begin` и `end`).
 * Обратите внимание, что точка loop должна находиться между `begin` и `end`, и после `loopBegin`!
 *
 * @name loopEnd
 * @param {number | Pattern} time от 0 до 1, где 1 это длина sample
 * @synonyms loope
 * @example
 * s("space").loop(1)
 * .loopEnd("<1 .75 .5 .25>")._scope()
 */
export const { loopEnd, loope } = registerControl('loopEnd', 'loope');
/**
 * Эффект bit crusher.
 *
 * @name crush
 * @param {number | Pattern} depth от 1 (сильное снижение битности) до 16 (почти без снижения).
 * @example
 * s("<bd sd>,hh*3").fast(2).crush("<16 8 7 6 5 4 3 2>")
 *
 */
// ['clhatdecay'],
export const { crush } = registerControl('crush');
/**
 * Имитация ресэмплинга для снижения частоты дискретизации. Внимание: Этот эффект, похоже, работает только в браузерах на основе chromium
 *
 * @name coarse
 * @param {number | Pattern} factor 1 для оригинала, 2 для половины, 3 для трети и так далее.
 * @example
 * s("bd sd [~ bd] sd,hh*8").coarse("<1 4 8 16 32>")
 *
 */
export const { coarse } = registerControl('coarse');

/**
 * Модулирует амплитуду звука непрерывной формой волны
 *
 * @name tremolo
 * @synonyms trem
 * @param {number | Pattern} speed скорость модуляции в Гц
 * @example
 * note("d d d# d".fast(4)).s("supersaw").tremolo("<3 2 100> ").tremoloskew("<.5>")
 *
 */
export const { tremolo } = registerControl(['tremolo', 'tremolodepth', 'tremoloskew', 'tremolophase'], 'trem');

/**
 * Модулирует амплитуду звука непрерывной формой волны
 *
 * @name tremolosync
 * @synonyms tremsync
 * @param {number | Pattern} cycles скорость модуляции в циклах
 * @example
 * note("d d d# d".fast(4)).s("supersaw").tremolosync("4").tremoloskew("<1 .5 0>")
 *
 */
export const { tremolosync } = registerControl(
  ['tremolosync', 'tremolodepth', 'tremoloskew', 'tremolophase'],
  'tremsync',
);

/**
 * Глубина амплитудной модуляции
 *
 * @name tremolodepth
 * @synonyms tremdepth
 * @param {number | Pattern} depth
 * @example
 * note("a1 a1 a#1 a1".fast(4)).s("pulse").tremsync(4).tremolodepth("<1 2 .7>")
 *
 */
export const { tremolodepth } = registerControl('tremolodepth', 'tremdepth');
/**
 * Изменяет форму волны модуляции
 *
 * @name tremoloskew
 * @synonyms tremskew
 * @param {number | Pattern} amount от 0 до 1, форма волны
 * @example
 * note("{f a c e}%16").s("sawtooth").tremsync(4).tremoloskew("<.5 0 1>")
 *
 */
export const { tremoloskew } = registerControl('tremoloskew', 'tremskew');

/**
 * Изменяет фазу волны модуляции
 *
 * @name tremolophase
 * @synonyms tremphase
 * @param {number | Pattern} offset смещение в циклах модуляции
 * @example
 * note("{f a c e}%16").s("sawtooth").tremsync(4).tremolophase("<0 .25 .66>")
 *
 */
export const { tremolophase } = registerControl('tremolophase', 'tremphase');

/**
 * Форма амплитудной модуляции
 *
 * @name tremoloshape
 * @synonyms tremshape
 * @param {number | Pattern} shape tri | square | sine | saw | ramp
 * @example
 * note("{f g c d}%16").tremsync(4).tremoloshape("<sine tri square>").s("sawtooth")
 *
 */
export const { tremoloshape } = registerControl('tremoloshape', 'tremshape');
/**
 * Перегрузка filter для поддерживаемых типов filter
 *
 * @name drive
 * @param {number | Pattern} amount
 * @example
 * note("{f g g c d a a#}%16".sub(17)).s("supersaw").lpenv(8).lpf(150).lpq(.8).ftype('ladder').drive("<.5 4>")
 *
 */
export const { drive } = registerControl('drive');

/**
 * Модулирует амплитуду orbit для создания эффекта типа "sidechain".
 *
 * Может применяться к нескольким orbit с помощью ':' mininotation, например, `duckorbit("2:3")`
 *
 * @name duckorbit
 * @synonyms duck
 * @param {number | Pattern} orbit целевой orbit
 * @example
 * $: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
 * $: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack(0.2).duckdepth(1)
 * @example
 * $: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
 * $: s("hh*16").orbit(3)
 * $: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:3").duckattack(0.2).duckdepth(1)
 *
 */
export const { duck } = registerControl('duckorbit', 'duck');

/**
 * Количество ducking, применяемое к целевому orbit
 *
 * Может варьироваться между orbit с помощью ':' mininotation, например, `duckdepth("0.3:0.1")`.
 * Примечание: это требует сначала применить эффект к нескольким orbit, например, `duckorbit("2:3")`.
 *
 * @name duckdepth
 * @param {number | Pattern} depth глубина модуляции от 0 до 1
 * @example
 * stack( n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2), s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack(0.2).duckdepth("<1 .9 .6 0>"))
 * @example
 * $: n(run(16)).scale("c:minor:pentatonic").s("sawtooth").delay(.7).orbit(2)
 * $: s("hh*16").orbit(3)
 * $: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:3").duckattack(0.2).duckdepth("1:0.5")
 *
 */
export const { duckdepth } = registerControl('duckdepth');

/**
 * Время, необходимое для того, чтобы обработанный сигнал(ы) достиг самой низкой громкости.
 * Может использоваться для предотвращения щелчков или для творческих ритмических эффектов.
 *
 * Может варьироваться между orbit с помощью ':' mininotation, например, `duckonset("0:0.003")`.
 * Примечание: это требует сначала применить эффект к нескольким orbit, например, `duckorbit("2:3")`.
 *
 * @name duckonset
 * @synonyms duckons
 *
 * @param {number | Pattern} time Время начала в секундах
 * @example
 * // Щелчки
 * sound: freq("63.2388").s("sine").orbit(2).gain(4)
 * duckerWithClick: s("bd*4").duckorbit(2).duckattack(0.3).duckonset(0).postgain(0)
 * @example
 * // Без щелчков
 * sound: freq("63.2388").s("sine").orbit(2).gain(4)
 * duckerWithoutClick: s("bd*4").duckorbit(2).duckattack(0.3).duckonset(0.01).postgain(0)
 * @example
 * // Ритмичный
 * noise: s("pink").distort("2:1").orbit(4) // используется ритмично с 0.3 onset ниже
 * hhat: s("hh*16").orbit(7)
 * ducker: s("bd*4").bank("tr909").duckorbit("4:7").duckonset("0.3:0.003").duckattack(0.25)
 *
 */
export const { duckonset } = registerControl('duckonset', 'duckons');

/**
 * Время, необходимое для того, чтобы обработанный сигнал(ы) вернулся к нормальной громкости.
 *
 * Может варьироваться между orbit с помощью ':' mininotation, например, `duckonset("0:0.003")`.
 * Примечание: это требует сначала применить эффект к нескольким orbit, например, `duckorbit("2:3")`.
 *
 * @name duckattack
 * @synonyms duckatt
 *
 * @param {number | Pattern} time Время attack в секундах
 * @example
 * sound: n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2)
 * ducker: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit(2).duckattack("<0.2 0 0.4>").duckdepth(1)
 * @example
 * moreduck: n(run(8)).scale("c:minor").s("sawtooth").delay(.7).orbit(2)
 * lessduck: s("hh*16").orbit(5)
 * ducker: s("bd:4!4").beat("0,4,8,11,14",16).duckorbit("2:5").duckattack("0.4:0.1")
 *
 */
export const { duckattack } = registerControl('duckattack', 'duckatt');

/**
 * Создаёт byte beat с пользовательскими выражениями
 *
 * @name byteBeatExpression
 * @synonyms bbexpr
 *
 * @param {number | Pattern} byteBeatExpression побитовое выражение для создания bytebeat
 * @example
 * s("bytebeat").bbexpr('t*(t>>15^t>>66)')
 *
 */
export const { byteBeatExpression, bbexpr } = registerControl('byteBeatExpression', 'bbexpr');

/**
 * Создаёт byte beat с пользовательскими выражениями
 *
 * @name byteBeatStartTime
 * @synonyms bbst
 *
 * @param {number | Pattern} byteBeatStartTime в sample (t)
 * @example
 * note("c3!8".add("{0 0 12 0 7 5 3}%8")).s("bytebeat:5").bbst("<3 1>".mul(10000))._scope()
 *
 */
export const { byteBeatStartTime, bbst } = registerControl('byteBeatStartTime', 'bbst');

/**
 * Позволяет установить выходные каналы на интерфейсе
 *
 * @name channels
 * @synonyms ch
 *
 * @param {number | Pattern} channels pattern выходных каналов
 * @example
 * note("e a d b g").channels("3:4")
 *
 */
export const { channels, ch } = registerControl('channels', 'ch');

/**
 * Управляет шириной импульса pulse oscillator
 *
 * @name pw
 * @param {number | Pattern} pulsewidth
 * @example
 * note("{f a c e}%16").s("pulse").pw(".8:1:.2")
 * @example
 * n(run(8)).scale("D:pentatonic").s("pulse").pw("0 .75 .5 1")
 */
export const { pw } = registerControl(['pw', 'pwrate', 'pwsweep']);

/**
 * Управляет частотой lfo для ширины импульса pulse oscillator
 *
 * @name pwrate
 * @param {number | Pattern} rate
 * @example
 * n(run(8)).scale("D:pentatonic").s("pulse").pw("0.5").pwrate("<5 .1 25>").pwsweep("<0.3 .8>")

 *
 */
export const { pwrate } = registerControl('pwrate');

/**
 * Управляет sweep lfo для ширины импульса pulse oscillator
 *
 * @name pwsweep
 * @param {number | Pattern} sweep
 * @example
 * n(run(8)).scale("D:pentatonic").s("pulse").pw("0.5").pwrate("<5 .1 25>").pwsweep("<0.3 .8>")
 *
 */
export const { pwsweep } = registerControl('pwsweep');

/**
 * Аудио эффект phaser, приближенный к популярным гитарным педалям.
 *
 * @name phaser
 * @synonyms ph
 * @param {number | Pattern} speed скорость модуляции
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser("<1 2 4 8>")
 *
 */
export const { phaserrate, ph, phaser } = registerControl(
  ['phaserrate', 'phaserdepth', 'phasercenter', 'phasersweep'],
  'ph',
  'phaser',
);

/**
 * Диапазон частотного sweep lfo для эффекта phaser. По умолчанию 2000
 *
 * @name phasersweep
 * @synonyms phs
 * @param {number | Pattern} phasersweep наиболее полезные значения между 0 и 4000
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser(2).phasersweep("<800 2000 4000>")
 *
 */
export const { phasersweep, phs } = registerControl('phasersweep', 'phs');

/**
 * Центральная частота phaser в Гц. По умолчанию 1000
 *
 * @name phasercenter
 * @synonyms phc
 * @param {number | Pattern} centerfrequency в Гц
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser(2).phasercenter("<800 2000 4000>")
 *
 */

export const { phasercenter, phc } = registerControl('phasercenter', 'phc');

/**
 * Количество влияния эффекта phaser на сигнал. По умолчанию 0.75
 *
 * @name phaserdepth
 * @synonyms phd, phasdp
 * @param {number | Pattern} depth число от 0 до 1
 * @example
 * n(run(8)).scale("D:pentatonic").s("sawtooth").release(0.5)
 * .phaser(2).phaserdepth("<0 .5 .75 1>")
 *
 */
// also a superdirt control
export const { phaserdepth, phd, phasdp } = registerControl('phaserdepth', 'phd', 'phasdp');

/**
 * Выбирает канал, на который отправляется pattern в superdirt
 *
 * @name channel
 * @param {number | Pattern} channel номер канала
 *
 */
export const { channel } = registerControl('channel');
/**
 * В стиле классических драм-машин, `cut` остановит воспроизводящийся sample, как только будет воспроизведён другой sample в той же группе cut. Примером может быть открытый хэт, за которым следует закрытый, фактически заглушая открытый.
 *
 * @name cut
 * @param {number | Pattern} group номер группы cut
 * @example
 * s("[oh hh]*4").cut(1)
 *
 */
export const { cut } = registerControl('cut');
/**
 * Устанавливает частоту среза **l**ow-**p**ass **f**ilter.
 *
 * При использовании mininotation можно также опционально добавить параметр 'lpq', разделённый ':'.
 *
 * @name lpf
 * @param {number | Pattern} frequency слышимая частота от 0 до 20000
 * @synonyms cutoff, ctf, lp
 * @example
 * s("bd sd [~ bd] sd,hh*6").lpf("<4000 2000 1000 500 200 100>")
 * @example
 * s("bd*16").lpf("1000:0 1000:10 1000:20 1000:30")
 *
 */
export const { cutoff, ctf, lpf, lp } = registerControl(['cutoff', 'resonance', 'lpenv'], 'ctf', 'lpf', 'lp');

/**
 * Устанавливает глубину модуляции envelope lowpass filter.
 * @name lpenv
 * @param {number | Pattern} modulation глубина envelope lowpass filter от 0 до _n_
 * @synonyms lpe
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpa(.5)
 * .lpenv("<4 2 1 0 -1 -2 -4>/4")
 */
export const { lpenv, lpe } = registerControl('lpenv', 'lpe');
/**
 * Устанавливает глубину модуляции envelope highpass filter.
 * @name hpenv
 * @param {number | Pattern} modulation глубина envelope highpass filter от 0 до _n_
 * @synonyms hpe
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpa(.5)
 * .hpenv("<4 2 1 0 -1 -2 -4>/4")
 */
export const { hpenv, hpe } = registerControl('hpenv', 'hpe');
/**
 * Устанавливает глубину модуляции envelope bandpass filter.
 * @name bpenv
 * @param {number | Pattern} modulation глубина envelope bandpass filter от 0 до _n_
 * @synonyms bpe
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpa(.5)
 * .bpenv("<4 2 1 0 -1 -2 -4>/4")
 */
export const { bpenv, bpe } = registerControl('bpenv', 'bpe');
/**
 * Устанавливает длительность attack для envelope lowpass filter.
 * @name lpattack
 * @param {number | Pattern} attack время envelope filter
 * @synonyms lpa
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpa("<.5 .25 .1 .01>/4")
 * .lpenv(4)
 */
export const { lpattack, lpa } = registerControl('lpattack', 'lpa');
/**
 * Устанавливает длительность attack для envelope highpass filter.
 * @name hpattack
 * @param {number | Pattern} attack время envelope highpass filter
 * @synonyms hpa
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpa("<.5 .25 .1 .01>/4")
 * .hpenv(4)
 */
export const { hpattack, hpa } = registerControl('hpattack', 'hpa');
/**
 * Устанавливает длительность attack для envelope bandpass filter.
 * @name bpattack
 * @param {number | Pattern} attack время envelope bandpass filter
 * @synonyms bpa
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpa("<.5 .25 .1 .01>/4")
 * .bpenv(4)
 */
export const { bpattack, bpa } = registerControl('bpattack', 'bpa');
/**
 * Устанавливает длительность decay для envelope lowpass filter.
 * @name lpdecay
 * @param {number | Pattern} decay время envelope filter
 * @synonyms lpd
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpd("<.5 .25 .1 0>/4")
 * .lpenv(4)
 */
export const { lpdecay, lpd } = registerControl('lpdecay', 'lpd');
/**
 * Устанавливает длительность decay для envelope highpass filter.
 * @name hpdecay
 * @param {number | Pattern} decay время envelope highpass filter
 * @synonyms hpd
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpd("<.5 .25 .1 0>/4")
 * .hps(0.2)
 * .hpenv(4)
 */
export const { hpdecay, hpd } = registerControl('hpdecay', 'hpd');
/**
 * Устанавливает длительность decay для envelope bandpass filter.
 * @name bpdecay
 * @param {number | Pattern} decay время envelope bandpass filter
 * @synonyms bpd
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpd("<.5 .25 .1 0>/4")
 * .bps(0.2)
 * .bpenv(4)
 */
export const { bpdecay, bpd } = registerControl('bpdecay', 'bpd');
/**
 * Устанавливает амплитуду sustain для envelope lowpass filter.
 * @name lpsustain
 * @param {number | Pattern} sustain амплитуда envelope lowpass filter
 * @synonyms lps
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .lpf(300)
 * .lpd(.5)
 * .lps("<0 .25 .5 1>/4")
 * .lpenv(4)
 */
export const { lpsustain, lps } = registerControl('lpsustain', 'lps');
/**
 * Устанавливает амплитуду sustain для envelope highpass filter.
 * @name hpsustain
 * @param {number | Pattern} sustain амплитуда envelope highpass filter
 * @synonyms hps
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .hpf(500)
 * .hpd(.5)
 * .hps("<0 .25 .5 1>/4")
 * .hpenv(4)
 */
export const { hpsustain, hps } = registerControl('hpsustain', 'hps');
/**
 * Устанавливает амплитуду sustain для envelope bandpass filter.
 * @name bpsustain
 * @param {number | Pattern} sustain амплитуда envelope bandpass filter
 * @synonyms bps
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .bpf(500)
 * .bpd(.5)
 * .bps("<0 .25 .5 1>/4")
 * .bpenv(4)
 */
export const { bpsustain, bps } = registerControl('bpsustain', 'bps');
/**
 * Устанавливает время release для envelope lowpass filter.
 * @name lprelease
 * @param {number | Pattern} release время envelope filter
 * @synonyms lpr
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .clip(.5)
 * .lpf(300)
 * .lpenv(4)
 * .lpr("<.5 .25 .1 0>/4")
 * .release(.5)
 */
export const { lprelease, lpr } = registerControl('lprelease', 'lpr');
/**
 * Устанавливает время release для envelope highpass filter.
 * @name hprelease
 * @param {number | Pattern} release время envelope highpass filter
 * @synonyms hpr
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .clip(.5)
 * .hpf(500)
 * .hpenv(4)
 * .hpr("<.5 .25 .1 0>/4")
 * .release(.5)
 */
export const { hprelease, hpr } = registerControl('hprelease', 'hpr');
/**
 * Устанавливает время release для envelope bandpass filter.
 * @name bprelease
 * @param {number | Pattern} release время envelope bandpass filter
 * @synonyms bpr
 * @example
 * note("c2 e2 f2 g2")
 * .sound('sawtooth')
 * .clip(.5)
 * .bpf(500)
 * .bpenv(4)
 * .bpr("<.5 .25 .1 0>/4")
 * .release(.5)
 */
export const { bprelease, bpr } = registerControl('bprelease', 'bpr');
/**
 * Устанавливает тип filter. Ladder filter более агрессивный. В будущем могут быть добавлены другие типы.
 * @name ftype
 * @param {number | Pattern} type 12db (0), ladder (1), или 24db (2)
 * @example
 * note("{f g g c d a a#}%8").s("sawtooth").lpenv(4).lpf(500).ftype("<0 1 2>").lpq(1)
 * @example
 * note("c f g g a c d4").fast(2)
 * .sound('sawtooth')
 * .lpf(200).fanchor(0)
 * .lpenv(3).lpq(1)
 * .ftype("<ladder 12db 24db>")
 */
export const { ftype } = registerControl('ftype');

/**
 * Управляет центром envelope filter. 0 это униполярный положительный, .5 это биполярный, 1 это униполярный отрицательный
 * @name fanchor
 * @param {number | Pattern} center от 0 до 1
 * @example
 * note("{f g g c d a a#}%8").s("sawtooth").lpf("{1000}%2")
 * .lpenv(8).fanchor("<0 .5 1>")
 */
export const { fanchor } = registerControl('fanchor');
/**
 * Устанавливает частоту среза **h**igh-**p**ass **f**ilter.
 *
 * При использовании mininotation можно также опционально добавить параметр 'hpq', разделённый ':'.
 *
 * @name hpf
 * @param {number | Pattern} frequency слышимая частота от 0 до 20000
 * @synonyms hp, hcutoff
 * @example
 * s("bd sd [~ bd] sd,hh*8").hpf("<4000 2000 1000 500 200 100>")
 * @example
 * s("bd sd [~ bd] sd,hh*8").hpf("<2000 2000:25>")
 *
 */
// currently an alias of 'hcutoff' https://codeberg.org/uzu/strudel/issues/496
// ['hpf'],

/**
 * Частота LFO для lowpass filter
 *
 * @name lprate
 * @param {number | Pattern} rate частота в герцах
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lprate("<4 8 2 1>")
 */
export const { lprate } = registerControl('lprate');

/**
 * Синхронизированная с циклом частота LFO для lowpass filter
 *
 * @name lpsync
 * @param {number | Pattern} rate частота в циклах
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpsync("<4 8 2 1>")
 */
export const { lpsync } = registerControl('lpsync');

/**
 * Глубина LFO для lowpass filter
 *
 * @name lpdepth
 * @param {number | Pattern} depth глубина модуляции
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpdepth("<1 .5 1.8 0>")
 */

export const { lpdepth } = registerControl('lpdepth');
/**
 * Глубина LFO для lowpass filter, в Гц
 *
 * @name lpdepthfrequency
 * @synonyms
 * lpdethfreq
 * @param {number | Pattern} depth глубина модуляции
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).lpdepthfrequency("<200 500 100 0>")
 */

export const { lpdepthfrequency } = registerControl('lpdepthfrequency', 'lpdepthfreq');

/**
 * Форма LFO для lowpass filter
 *
 * @name lpshape
 * @param {number | Pattern} shape Форма lfo (0, 1, 2, ..)
 */
export const { lpshape } = registerControl('lpshape');

/**
 * DC смещение LFO для lowpass filter
 *
 * @name lpdc
 * @param {number | Pattern} dcoffset dc смещение. установите 0 для unipolar
 */
export const { lpdc } = registerControl('lpdc');

/**
 * Искривление LFO для lowpass filter
 *
 * @name lpskew
 * @param {number | Pattern} skew Насколько изгибать форму LFO
 */
export const { lpskew } = registerControl('lpskew');

/**
 * Частота LFO для bandpass filter
 *
 * @name bprate
 * @param {number | Pattern} rate частота в герцах
 */
export const { bprate } = registerControl('bprate');

/**
 * Синхронизированная с циклом частота LFO для bandpass filter
 *
 * @name bpsync
 * @param {number | Pattern} rate частота в циклах
 */
export const { bpsync } = registerControl('bpsync');

/**
 * Глубина LFO для bandpass filter
 *
 * @name bpdepth
 * @param {number | Pattern} depth глубина модуляции
 */
export const { bpdepth } = registerControl('bpdepth');

/**
 * Глубина LFO для bandpass filter, в Гц
 *
 * @name bpdepthfrequency
 * @synonyms
 * bpdethfreq
 * @param {number | Pattern} depth глубина модуляции
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).bpdepthfrequency("<200 500 100 0>")
 */

export const { bpdepthfrequency } = registerControl('bpdepthfrequency', 'bpdepthfreq');

/**
 * Форма LFO для bandpass filter
 *
 * @name bpshape
 * @param {number | Pattern} shape Форма lfo (0, 1, 2, ..)
 */
export const { bpshape } = registerControl('bpshape');

/**
 * DC смещение LFO для bandpass filter
 *
 * @name bpdc
 * @param {number | Pattern} dcoffset dc смещение. установите 0 для unipolar
 */
export const { bpdc } = registerControl('bpdc');

/**
 * Искривление LFO для bandpass filter
 *
 * @name bpskew
 * @param {number | Pattern} skew Насколько изгибать форму LFO
 */
export const { bpskew } = registerControl('bpskew');

/**
 * Частота LFO для highpass filter
 *
 * @name hprate
 * @param {number | Pattern} rate частота в герцах
 */
export const { hprate } = registerControl('hprate');

/**
 * Синхронизированная с циклом частота LFO для highpass filter
 *
 * @name hpsync
 * @param {number | Pattern} rate частота в циклах
 */
export const { hpsync } = registerControl('hpsync');

/**
 * Глубина LFO для highpass filter
 *
 * @name hpdepth
 * @param {number | Pattern} depth глубина модуляции
 */
export const { hpdepth, hpdepthfreq } = registerControl('hpdepth');

/**
 * Глубина LFO для highpass filter, в Гц
 *
 * @name hpdepthfrequency
 * @synonyms
 * hpdethfreq
 * @param {number | Pattern} depth глубина модуляции
 * @example
 * note("<c c c# c c c4>*16").s("sawtooth").lpf(600).hpdepthfrequency("<200 500 100 0>")
 */

export const { hpdepthfrequency } = registerControl('hpdepthfrequency', 'hpdepthfreq');

/**
 * Форма LFO для highpass filter
 *
 * @name hpshape
 * @param {number | Pattern} shape Форма lfo (0, 1, 2, ..)
 */
export const { hpshape } = registerControl('hpshape');

/**
 * DC смещение LFO для highpass filter
 *
 * @name hpdc
 * @param {number | Pattern} dcoffset dc смещение. установите 0 для unipolar
 */
export const { hpdc } = registerControl('hpdc');

/**
 * Искривление LFO для highpass filter
 *
 * @name hpskew
 * @param {number | Pattern} skew Насколько изгибать форму LFO
 */
export const { hpskew } = registerControl('hpskew');

/**
 * Применяет vibrato к частоте oscillator.
 *
 * @name vib
 * @synonyms vibrato, v
 * @param {number | Pattern} frequency частота vibrato в герцах
 * @example
 * note("a e")
 * .vib("<.5 1 2 4 8 16>")
 * ._scope()
 * @example
 * // изменить глубину модуляции с помощью ":"
 * note("a e")
 * .vib("<.5 1 2 4 8 16>:12")
 * ._scope()
 */
export const { vib, vibrato, v } = registerControl(['vib', 'vibmod'], 'vibrato', 'v');
/**
 * Добавляет розовый шум в микс
 *
 * @name noise
 * @param {number | Pattern} wet количество wet
 * @example
 * sound("<white pink brown>/2")
 */
export const { noise } = registerControl('noise');
/**
 * Устанавливает глубину vibrato в полутонах. Имеет эффект только если `vibrato` | `vib` | `v` также установлен
 *
 * @name vibmod
 * @synonyms vmod
 * @param {number | Pattern} depth глубина vibrato (в полутонах)
 * @example
 * note("a e").vib(4)
 * .vibmod("<.25 .5 1 2 12>")
 * ._scope()
 * @example
 * // изменить частоту vibrato с помощью ":"
 * note("a e")
 * .vibmod("<.25 .5 1 2 12>:8")
 * ._scope()
 */
export const { vibmod, vmod } = registerControl(['vibmod', 'vib'], 'vmod');
export const { hcutoff, hpf, hp } = registerControl(['hcutoff', 'hresonance', 'hpenv'], 'hpf', 'hp');
/**
 * Управляет **h**igh-**p**ass **q**-значением.
 *
 * @name hpq
 * @param {number | Pattern} q фактор резонанса от 0 до 50
 * @synonyms hresonance
 * @example
 * s("bd sd [~ bd] sd,hh*8").hpf(2000).hpq("<0 10 20 30>")
 *
 */
export const { hresonance, hpq } = registerControl('hresonance', 'hpq');
/**
 * Управляет **l**ow-**p**ass **q**-значением.
 *
 * @name lpq
 * @param {number | Pattern} q фактор резонанса от 0 до 50
 * @synonyms resonance
 * @example
 * s("bd sd [~ bd] sd,hh*8").lpf(2000).lpq("<0 10 20 30>")
 *
 */
// currently an alias of 'resonance' https://codeberg.org/uzu/strudel/issues/496
export const { resonance, lpq } = registerControl('resonance', 'lpq');
/**
 * DJ filter, ниже 0.5 это low pass filter, выше это high pass filter.
 *
 * @name djf
 * @param {number | Pattern} cutoff ниже 0.5 это low pass filter, выше это high pass filter
 * @example
 * n(irand(16).seg(8)).scale("d:phrygian").s("supersaw").djf("<.5 .3 .2 .75>")
 *
 */
export const { djf } = registerControl('djf');
// ['cutoffegint'],
// TODO: does not seem to work
/**
 * Устанавливает уровень сигнала delay.
 *
 * При использовании mininotation можно также опционально добавить параметры 'delaytime' и 'delayfeedback',
 * разделённые ':'.
 *
 *
 * @name delay
 * @param {number | Pattern} level от 0 до 1
 * @example
 * s("bd bd").delay("<0 .25 .5 1>")
 * @example
 * s("bd bd").delay("0.65:0.25:0.9 0.65:0.125:0.7")
 *
 */
export const { delay } = registerControl(['delay', 'delaytime', 'delayfeedback']);
/**
 * Устанавливает уровень сигнала, который возвращается обратно в delay.
 * Внимание: Значения >= 1 приведут к тому, что сигнал будет становиться всё громче и громче! Не делайте этого
 *
 * @name delayfeedback
 * @param {number | Pattern} feedback от 0 до 1
 * @synonyms delayfb, dfb
 * @example
 * s("bd").delay(.25).delayfeedback("<.25 .5 .75 1>")
 *
 */
export const { delayfeedback, delayfb, dfb } = registerControl('delayfeedback', 'delayfb', 'dfb');

/**
 * Устанавливает уровень сигнала, который возвращается обратно в delay.
 * Осторожно: Значения >= 1 приведут к сигналу, который становится всё громче и громче! Не делайте этого
 *
 * @name delayfeedback
 * @param {number | Pattern} feedback от 0 до 1
 * @synonyms delayfb, dfb
 * @example
 * s("bd").delay(.25).delayfeedback("<.25 .5 .75 1>")
 *
 */
export const { delayspeed } = registerControl('delayspeed');
/**
 * Устанавливает время эффекта delay.
 *
 * @name delayspeed
 * @param {number | Pattern} delayspeed контролирует высоту тона delay feedback
 * @synonyms delayt, dt
 * @example
 * note("d d a# a".fast(2)).s("sawtooth").delay(.8).delaytime(1/2).delayspeed("<2 .5 -1 -2>")
 *
 */
export const { delaytime, delayt, dt } = registerControl('delaytime', 'delayt', 'dt');

/**
 * Устанавливает время эффекта delay в циклах.
 *
 * @name delaysync
 * @param {number | Pattern} cycles длина delay в циклах
 * @synonyms delayt, dt
 * @example
 * s("bd bd").delay(.25).delaysync("<1 2 3 5>".div(8))
 *
 */
export const { delaysync } = registerControl('delaysync');

/**
 * Указывает, рассчитывается ли delaytime относительно cps.
 *
 * @name lock
 * @param {number | Pattern} enable Когда установлено в 1, delaytime является прямым кратным цикла.
 * @superdirtOnly
 * @example
 * s("sd").delay().lock(1).osc()
 *
 *
 */

export const { lock } = registerControl('lock');
/**
 * Устанавливает детюн для наложенных голосов поддерживаемых oscillator
 *
 * @name detune
 * @param {number | Pattern} amount
 * @synonyms det
 * @example
 * note("d f a a# a d3").fast(2).s("supersaw").detune("<.1 .2 .5 24.1>")
 *
 */
export const { detune, det } = registerControl('detune', 'det');
/**
 * Устанавливает количество наложенных голосов для поддерживаемых oscillator
 *
 * @name unison
 * @param {number | Pattern} numvoices
 * @example
 * note("d f a a# a d3").fast(2).s("supersaw").unison("<1 2 7>")
 *
 */
export const { unison } = registerControl('unison');

/**
 * Устанавливает stereo pan spread для поддерживаемых oscillator
 *
 * @name spread
 * @param {number | Pattern} spread от 0 до 1
 * @example
 * note("d f a a# a d3").fast(2).s("supersaw").spread("<0 .3 1>")
 *
 */
export const { spread } = registerControl('spread');
/**
 * Устанавливает сухость reverb. Смотрите `room` и `size` для дополнительной информации о reverb.
 *
 * @name dry
 * @param {number | Pattern} dry 0 = wet, 1 = dry
 * @example
 * n("[0,3,7](3,8)").s("superpiano").room(.7).dry("<0 .5 .75 1>").osc()
 * @superdirtOnly
 *
 */
export const { dry } = registerControl('dry');
// TODO: does not seem to do anything
/*
 * Используется при использовании `begin`/`end` или `chop`/`striate` и подобных, для изменения времени затухания 'grain' envelope.
 *
 * @name fadeTime
 * @synonyms fadeOutTime
 * @param {number | Pattern} time от 0 до 1
 * @example
 * s("oh*4").end(.1).fadeTime("<0 .2 .4 .8>").osc()
 *
 */
export const { fadeTime, fadeOutTime } = registerControl('fadeTime', 'fadeOutTime');
// TODO: see above
export const { fadeInTime } = registerControl('fadeInTime');
/**
 * Устанавливает частоту звука.
 *
 * @name freq
 * @param {number | Pattern} frequency в Гц. Слышимый диапазон от 20 до 20000 Гц
 * @example
 * freq("220 110 440 110").s("superzow").osc()
 * @example
 * freq("110".mul.out(".5 1.5 .6 [2 3]")).s("superzow").osc()
 *
 */
export const { freq } = registerControl('freq');
// pitch envelope
/**
 * Время attack для pitch envelope.
 *
 * @name pattack
 * @synonyms patt
 * @param {number | Pattern} time время в секундах
 * @example
 * note("c eb g bb").pattack("0 .1 .25 .5").slow(2)
 *
 */
export const { pattack, patt } = registerControl('pattack', 'patt');
/**
 * Время decay для pitch envelope.
 *
 * @name pdecay
 * @synonyms pdec
 * @param {number | Pattern} time время в секундах
 * @example
 * note("<c eb g bb>").pdecay("<0 .1 .25 .5>")
 *
 */
export const { pdecay, pdec } = registerControl('pdecay', 'pdec');
// TODO: how to use psustain?!
export const { psustain, psus } = registerControl('psustain', 'psus');
/**
 * Время release для pitch envelope
 *
 * @name prelease
 * @synonyms prel
 * @param {number | Pattern} time время в секундах
 * @example
 * note("<c eb g bb> ~")
 * .release(.5) // чтобы услышать pitch release
 * .prelease("<0 .1 .25 .5>")
 *
 */
export const { prelease, prel } = registerControl('prelease', 'prel');
/**
 * Величина pitch envelope. Отрицательные значения переворачивают envelope.
 * Если вы не установите другие параметры pitch envelope, `pattack:.2` будет значением по умолчанию.
 *
 * @name penv
 * @param {number | Pattern} semitones изменение в полутонах
 * @example
 * note("c")
 * .penv("<12 7 1 .5 0 -1 -7 -12>")
 *
 */
export const { penv } = registerControl('penv');
/**
 * Кривая envelope. По умолчанию линейная. exponential хорошо подходит для kicks
 *
 * @name pcurve
 * @param {number | Pattern} type 0 = linear, 1 = exponential
 * @example
 * note("g1*4")
 * .s("sine").pdec(.5)
 * .penv(32)
 * .pcurve("<0 1>")
 *
 */
export const { pcurve } = registerControl('pcurve');
/**
 * Устанавливает опорную точку диапазона envelope:
 * - anchor 0: range = [note, note + penv]
 * - anchor 1: range = [note - penv, note]
 * Если не установить anchor, значение по умолчанию будет равно значению psustain.
 *
 * @name panchor
 * @param {number | Pattern} anchor смещение опорной точки
 * @example
 * note("c c4").penv(12).panchor("<0 .5 1 .5>")
 *
 */
export const { panchor } = registerControl('panchor');
// TODO: https://tidalcycles.org/docs/configuration/MIDIOSC/control-voltage/#gate
export const { gate, gat } = registerControl('gate', 'gat');
// ['hatgrain'],
// ['lagogo'],
// ['lclap'],
// ['lclaves'],
// ['lclhat'],
// ['lcrash'],
// TODO:
// https://tidalcycles.org/docs/reference/audio_effects/#leslie-1
// https://tidalcycles.org/docs/reference/audio_effects/#leslie
/**
 * Эмуляция Leslie speaker: вращающиеся динамики в деревянном усиленном корпусе.
 *
 * @name leslie
 * @param {number | Pattern} wet от 0 до 1
 * @example
 * n("0,4,7").s("supersquare").leslie("<0 .4 .6 1>").osc()
 * @superdirtOnly
 *
 */
export const { leslie } = registerControl('leslie');
/**
 * Скорость модуляции / вращения для leslie эффекта
 *
 * @name lrate
 * @param {number | Pattern} rate 6.7 для быстрого, 0.7 для медленного
 * @example
 * n("0,4,7").s("supersquare").leslie(1).lrate("<1 2 4 8>").osc()
 * @superdirtOnly
 *
 */
// TODO: the rate seems to "lag" (in the example, 1 will be fast)
export const { lrate } = registerControl('lrate');
/**
 * Физический размер корпуса в метрах. Будьте осторожны, он может быть немного больше вашего компьютера. Влияет на величину эффекта Doppler (колебание высоты тона)
 *
 * @name lsize
 * @param {number | Pattern} meters где-то между 0 и 1
 * @example
 * n("0,4,7").s("supersquare").leslie(1).lrate(2).lsize("<.1 .5 1>").osc()
 * @superdirtOnly
 *
 */
export const { lsize } = registerControl('lsize');
/**
 * Устанавливает отображаемый текст для события на pianoroll
 *
 * @name label
 * @param {string} label текст для отображения
 */
export const { activeLabel } = registerControl('activeLabel');
export const { label } = registerControl(['label', 'activeLabel']);
// ['lfo'],
// ['lfocutoffint'],
// ['lfodelay'],
// ['lfoint'],
// ['lfopitchint'],
// ['lfoshape'],
// ['lfosync'],
// ['lhitom'],
// ['lkick'],
// ['llotom'],
// ['lophat'],
// ['lsnare'],
// TODO: what is this? not found in tidal doc
export const { degree } = registerControl('degree');
// TODO: what is this? not found in tidal doc
export const { mtranspose } = registerControl('mtranspose');
// TODO: what is this? not found in tidal doc
export const { ctranspose } = registerControl('ctranspose');
// TODO: what is this? not found in tidal doc
export const { harmonic } = registerControl('harmonic');
// TODO: what is this? not found in tidal doc
export const { stepsPerOctave } = registerControl('stepsPerOctave');
// TODO: what is this? not found in tidal doc
export const { octaveR } = registerControl('octaveR');
// TODO: why is this needed? what's the difference to late / early? Answer: it's in seconds, and delays the message at
// OSC time (so can't be negative, at least not beyond the latency value)
export const { nudge } = registerControl('nudge');
// TODO: the following doc is just a guess, it's not documented in tidal doc.
/**
 * Устанавливает октаву по умолчанию для synth.
 *
 * @name octave
 * @synonyms oct
 * @param {number | Pattern} octave номер октавы
 * @example
 * n("0,4,7").scale("F:minor").s('supersaw').octave("<0 1 2 3>")
 */
export const { octave, oct } = registerControl('octave', 'oct');

// ['ophatdecay'],
// TODO: example
/**
 * `orbit` это глобальный параметрический контекст для pattern. Pattern с одним и тем же orbit будут использовать одни и те же глобальные эффекты.
 *
 * @name orbit
 * @synonyms o
 * @param {number | Pattern} number
 * @example
 * stack(
 *   s("hh*6").delay(.5).delaytime(.25).orbit(1),
 *   s("~ sd ~ sd").delay(.5).delaytime(.125).orbit(2)
 * )
 */
export const { orbit } = registerControl('orbit', 'o');
// TODO: what is this? not found in tidal doc Answer: gain is limited to maximum of 2. This allows you to go over that
export const { overgain } = registerControl('overgain');
// TODO: what is this? not found in tidal doc. Similar to above, but limited to 1
export const { overshape } = registerControl('overshape');
/**
 * Устанавливает позицию в stereo.
 *
 * @name pan
 * @param {number | Pattern} pan от 0 до 1, слева направо (для stereo), один круг (для многоканальности)
 * @example
 * s("[bd hh]*2").pan("<.5 1 .5 0>")
 * @example
 * s("bd rim sd rim bd ~ cp rim").pan(sine.slow(2))
 *
 */
export const { pan } = registerControl('pan');
// TODO: this has no effect (see example)
/*
 * Контролирует, насколько многоканальный выход распределяется веером
 *
 * @name panspan
 * @param {number | Pattern} span от -inf до inf, отрицательные значения меняют порядок
 * @example
 * s("[bd hh]*2").pan("<.5 1 .5 0>").panspan("<0 .5 1>").osc()
 *
 */
export const { panspan } = registerControl('panspan');
// TODO: this has no effect (see example)
/*
 * Контролирует, насколько многоканальный выход распространяется
 *
 * @name pansplay
 * @param {number | Pattern} spread от 0 до 1
 * @example
 * s("[bd hh]*2").pan("<.5 1 .5 0>").pansplay("<0 .5 1>").osc()
 *
 */
export const { pansplay } = registerControl('pansplay');
export const { panwidth } = registerControl('panwidth');
export const { panorient } = registerControl('panorient');
// ['pitch1'],
// ['pitch2'],
// ['pitch3'],
// ['portamento'],
// TODO: LFO rate see https://tidalcycles.org/docs/patternlib/tutorials/synthesizers/#supersquare
export const { rate } = registerControl('rate');
// TODO: slide param for certain synths
export const { slide } = registerControl('slide');
// TODO: detune? https://tidalcycles.org/docs/patternlib/tutorials/synthesizers/#supersquare
export const { semitone } = registerControl('semitone');

// TODO: synth param
export const { voice } = registerControl('voice');
// voicings // https://codeberg.org/uzu/strudel/issues/506
/**
 * Аккорд для озвучивания
 * @name chord
 * @param {string | Pattern} symbols символы аккорда для озвучивания, например, C, Eb, Fm7, G7. Символы можно определить через addVoicings
 * @example
 * chord("<Am C D F Am E Am E>").voicing()
 **/
export const { chord } = registerControl('chord');
/**
 * Какой словарь использовать для озвучивания. По умолчанию используется стандартный словарь, если не указан
 *
 * @name dictionary
 * @param {string} dictionaryName какой словарь (определённый через `addVoicings`) использовать
 * @example
 * addVoicings('house', {
'': ['7 12 16', '0 7 16', '4 7 12'],
'm': ['0 3 7']
})
chord("<Am C D F Am E Am E>")
.dict('house').anchor(66)
.voicing().room(.5)
 **/
export const { dictionary, dict } = registerControl('dictionary', 'dict');
/** Верхняя нота для выравнивания озвучивания. По умолчанию c5
 *
 * @name anchor
 * @param {string | Pattern} anchorNote нота для выравнивания озвучивания
 * @example
 * anchor("<c4 g4 c5 g5>").chord("C").voicing()
 **/
export const { anchor } = registerControl('anchor');
/**
 * Устанавливает смещение озвучивания от закреплённой позиции
 *
 * @name offset
 * @param {number | Pattern} shift величина смещения озвучивания вверх или вниз
 * @example
 * chord("<Am C D F Am E Am E>").offset("<0 1 2 3 4 5>") // изменить озвучивание каждый раз
 **/
export const { offset } = registerControl('offset');
/**
 *  Сколько октав между шагами озвучивания, по умолчанию 1
 *
 *  @name octaves
 *  @param {number | Pattern} count количество октав
 *  @example
 *  chord("<Am C D F Am E Am E>").octaves("<2 4>").voicing()
 **/
export const { octaves } = registerControl('octaves');
/**
 * Убрать опорную ноту из озвучивания. Полезно для гармонизации мелодии
 *
 * @name mode
 * @param {string | Pattern} modeName один из {below | above | duck | root}
 * @example
 * mode("<below above duck root>").chord("C").voicing()
 *
 **/
export const { mode } = registerControl(['mode', 'anchor']);

/**
 * Устанавливает уровень reverb.
 *
 * При использовании mininotation можно также опционально добавить параметр 'size', разделённый ':'.
 *
 * @name room
 * @param {number | Pattern} level от 0 до 1
 * @example
 * s("bd sd [~ bd] sd").room("<0 .2 .4 .6 .8 1>")
 * @example
 * s("bd sd [~ bd] sd").room("<0.9:1 0.9:4>")
 *
 */
export const { room } = registerControl(['room', 'size']);
/**
 * Начальная частота lowpass reverb (в герцах).
 * При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..
 *
 * @name roomlp
 * @synonyms rlp
 * @param {number} frequency от 0 до 20000 Гц
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(10000)
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(5000)
 */
export const { roomlp, rlp } = registerControl('roomlp', 'rlp');
/**
 * Частота lowpass reverb на -60dB (в герцах).
 * При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..
 *
 * @name roomdim
 * @synonyms rdim
 * @param {number} frequency от 0 до 20000 Гц
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(10000).rdim(8000)
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(5000).rdim(400)
 *
 */
export const { roomdim, rdim } = registerControl('roomdim', 'rdim');
/**
 * Время затухания reverb (в секундах).
 * При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..
 *
 * @name roomfade
 * @synonyms rfade
 * @param {number} seconds секунды затухания reverb
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(10000).rfade(0.5)
 * @example
 * s("bd sd [~ bd] sd").room(0.5).rlp(5000).rfade(4)
 *
 */
export const { roomfade, rfade } = registerControl('roomfade', 'rfade');
/**
 * Устанавливает sample для использования в качестве импульсной характеристики для reverb.
 * @name iresponse
 * @param {string | Pattern} sample для использования в качестве импульсной характеристики
 * @synonyms ir
 * @example
 * s("bd sd [~ bd] sd").room(.8).ir("<shaker_large:0 shaker_large:2>")
 *
 */
export const { ir, iresponse } = registerControl(['ir', 'i'], 'iresponse');

/**
 * Устанавливает скорость sample для импульсной характеристики.
 * @name irspeed
 * @param {string | Pattern} speed
 * @example
 * samples('github:switchangel/pad')
 * $: s("brk/2").fit().scrub(irand(16).div(16).seg(8)).ir("swpad:4").room(.2).irspeed("<2 1 .5>/2").irbegin(.5).roomsize(.5)
 *
 */
export const { irspeed } = registerControl('irspeed');

/**
 * Устанавливает начальную позицию sample импульсной характеристики
 * @name irbegin
 * @param {string | Pattern} begin от 0 до 1
 * @synonyms ir
 * @example
 * samples('github:switchangel/pad')
 * $: s("brk/2").fit().scrub(irand(16).div(16).seg(8)).ir("swpad:4").room(.65).irspeed("-2").irbegin("<0 .5 .75>/2").roomsize(.6)
 *
 */
export const { irbegin } = registerControl('irbegin');
/**
 * Устанавливает размер комнаты для reverb, смотрите `room`.
 * При изменении этого свойства reverb будет пересчитан, поэтому изменяйте его редко..
 *
 * @name roomsize
 * @param {number | Pattern} size от 0 до 10
 * @synonyms rsize, sz, size
 * @example
 * s("bd sd [~ bd] sd").room(.8).rsize(1)
 * @example
 * s("bd sd [~ bd] sd").room(.8).rsize(4)
 *
 */
// TODO: find out why :
// s("bd sd [~ bd] sd").room(.8).roomsize("<0 .2 .4 .6 .8 [1,0]>").osc()
// .. does not work. Is it because room is only one effect?
export const { roomsize, size, sz, rsize } = registerControl('roomsize', 'size', 'sz', 'rsize');
// ['sagogo'],
// ['sclap'],
// ['sclaves'],
// ['scrash'],
/**
 * (Устаревший) Дисторшн с формированием волны. ВНИМАНИЕ: может внезапно стать непредсказуемо громким.
 * Пожалуйста, используйте distort вместо этого, который имеет более предсказуемую кривую отклика
 * второй параметр в опциональном синтаксисе массива (например: ".9:.5") применяет postgain к выходу
 *
 *
 * @name shape
 * @param {number | Pattern} distortion от 0 до 1
 * @example
 * s("bd sd [~ bd] sd,hh*8").shape("<0 .2 .4 .6 .8>")
 *
 */
export const { shape } = registerControl(['shape', 'shapevol']);
/**
 * Дисторшн с формированием волны. ВНИМАНИЕ: может быть очень громким.
 * Второй параметр в опциональном синтаксисе массива (например: ".9:.5") применяет postgain к выходу. Третий параметр устанавливает тип формирования волны.
 * Наиболее полезные значения обычно между 0 и 10 (в зависимости от исходного gain). Если чувствуете себя смелым, можете увеличить до 11 и выше ;)
 *
 * @name distort
 * @synonyms dist
 * @param {number | Pattern} distortion количество дисторшна для применения
 * @param {number | Pattern} volume линейный postgain дисторшна
 * @param {number | string | Pattern} type тип дисторшна для применения
 * @example
 * s("bd sd [~ bd] sd,hh*8").distort("<0 2 3 10:.5>")
 * @example
 * note("d1!8").s("sine").penv(36).pdecay(.12).decay(.23).distort("8:.4")
 * @example
 * s("bd:4*4").bank("tr808").distort("3:0.5:diode")
 *
 */
export const { distort, dist } = registerControl(['distort', 'distortvol', 'distorttype'], 'dist');

/**
 * Postgain для дисторшна с формированием волны.
 *
 * @name distortvol
 * @synonyms distvol
 * @param {number | Pattern} volume линейный postgain дисторшна
 * @example
 * s("bd*4").bank("tr909").distort(2).distortvol(0.8)
 */
export const { distortvol } = registerControl('distortvol', 'distvol');

/**
 * Тип дисторшна с формированием волны для применения.
 *
 * @name distorttype
 * @synonyms disttype
 * @param {number | string | Pattern} type тип дисторшна для применения
 * @example
 * s("bd*4").bank("tr909").distort(2).distorttype("<0 1 2>")
 *
 * @example
 * s("sine").note("F1*2").release(1)
 *   .penv(24).pdecay(0.05)
 *   .distort(rand.range(1, 8))
 *   .distorttype("<fold chebyshev scurve diode asym sinefold>")
 */
export const { distorttype } = registerControl('distorttype', 'disttype');

/**
 * Динамический компрессор. Параметры: `compressor("threshold:ratio:knee:attack:release")`
 * Больше информации [здесь](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode?retiredLocale=de#instance_properties)
 *
 * @name compressor
 * @example
 * s("bd sd [~ bd] sd,hh*8")
 * .compressor("-20:20:10:.002:.02")
 *
 */
export const { compressor } = registerControl([
  'compressor',
  'compressorRatio',
  'compressorKnee',
  'compressorAttack',
  'compressorRelease',
]);
export const { compressorKnee } = registerControl('compressorKnee');
export const { compressorRatio } = registerControl('compressorRatio');
export const { compressorAttack } = registerControl('compressorAttack');
export const { compressorRelease } = registerControl('compressorRelease');
/**
 * Изменяет скорость воспроизведения sample, т.е. дешёвый способ изменить высоту тона.
 *
 * @name speed
 * @param {number | Pattern} speed от -inf до inf, отрицательные числа воспроизводят sample в обратном направлении.
 * @example
 * s("bd*6").speed("1 2 4 1 -2 -4")
 * @example
 * speed("1 1.5*2 [2 1.1]").s("piano").clip(1)
 *
 */
export const { speed } = registerControl('speed');

/**
 * Изменяет скорость воспроизведения sample, т.е. дешёвый способ изменить высоту тона.
 *
 * @name stretch
 * @param {number | Pattern} factor от -inf до inf, отрицательные числа воспроизводят sample в обратном направлении.
 * @example
 * s("gm_flute").stretch("1 2 .5")
 *
 */
export const { stretch } = registerControl('stretch');
/**
 * Используется в сочетании с `speed`, принимает значения "r" (rate, поведение по умолчанию), "c" (cycles), или "s" (seconds). Использование `unit "c"` означает, что `speed` будет интерпретироваться в единицах циклов, например, `speed "1"` означает, что sample будет растянут на весь цикл. Использование `unit "s"` означает, что скорость воспроизведения будет настроена так, чтобы длительность была равна количеству секунд, указанному в `speed`.
 *
 * @name unit
 * @param {number | string | Pattern} unit смотрите описание выше
 * @example
 * speed("1 2 .5 3").s("bd").unit("c").osc()
 * @superdirtOnly
 *
 */

export const { unit } = registerControl('unit');
/**
 * Создан Calum Gunn. Напоминает странную смесь filter, ring-modulator и pitch-shifter. Руководство SuperCollider определяет Squiz как:
 *
 * "Упрощённый алгоритм повышения высоты тона. Он не предназначен для естественного звучания; его звук напоминает странную смесь filter, ring-modulator и pitch-shifter, в зависимости от входного сигнала. Алгоритм работает, разрезая сигнал на фрагменты (разделённые восходящими пересечениями нуля) и сжимая эти фрагменты во временной области (т.е. просто воспроизводя их быстрее, чем они поступили), оставляя паузы между ними. Все параметры, кроме memlen, могут модулироваться."
 *
 * @name squiz
 * @param {number | Pattern} squiz Попробуйте передавать кратные 2 - 2, 4, 8 и т.д.
 * @example
 * squiz("2 4/2 6 [8 16]").s("bd").osc()
 * @superdirtOnly
 *
 */
export const { squiz } = registerControl('squiz');
// TODO: what is this? not found in tidal doc
// ['stutterdepth'],
// TODO: what is this? not found in tidal doc
// ['stuttertime'],
// TODO: what is this? not found in tidal doc
// ['timescale'],
// TODO: what is this? not found in tidal doc
// ['timescalewin'],
// ['tomdecay'],
// ['vcfegint'],
// ['vcoegint'],
// TODO: Use a rest (~) to override the effect <- vowel
/**
 *
 * Формантный filter, чтобы звук был похож на гласные.
 *
 * @name vowel
 * @param {string | Pattern} vowel Можно использовать a e i o u ae aa oe ue y uh un en an on, соответствующие [a] [e] [i] [o] [u] [æ] [ɑ] [ø] [y] [ɯ] [ʌ] [œ̃] [ɛ̃] [ɑ̃] [ɔ̃]. Алиасы: aa = å = ɑ, oe = ø = ö, y = ı, ae = æ.
 * @example
 * note("[c2 <eb2 <g2 g1>>]*2").s('sawtooth')
 * .vowel("<a e i <o u>>")
 * @example
 * s("bd sd mt ht bd [~ cp] ht lt").vowel("[a|e|i|o|u]")
 *
 */
export const { vowel } = registerControl('vowel');
/* // TODO: find out how it works
 * Создан Calum Gunn. Делит аудио поток на крошечные сегменты, используя пересечения нуля сигнала в качестве границ сегментов, и отбрасывает часть из них. Принимает число от 1 до 100, обозначающее процент отбрасываемых сегментов. Руководство SuperCollider описывает эффект Waveloss следующим образом:
 *
 * Разделяет аудио поток на крошечные сегменты, используя пересечения нуля сигнала в качестве границ сегментов, и отбрасывает часть из них (т.е. заменяет их тишиной той же длины). Эта техника была описана Trevor Wishart в лекции. Параметры: filter отбрасывает drop из out сегментов. mode может быть 1 для отбрасывания сегментов простым детерминированным способом (например, всегда отбрасывая первые 30 из набора из 40 сегментов), или 2 для случайного отбрасывания сегментов, но в соответствующей пропорции.)
 *
 * mode: ?
 * waveloss: ?
 *
 * @name waveloss
 */
export const { waveloss } = registerControl('waveloss');
/**
 * Плотность шума crackle
 *
 * @name density
 * @param {number | Pattern} density от 0 до x
 * @example
 * s("crackle*4").density("<0.01 0.04 0.2 0.5>".slow(4))
 *
 */
export const { density } = registerControl('density');
// ['modwheel'],
export const { expression } = registerControl('expression');
export const { sustainpedal } = registerControl('sustainpedal');

export const { fshift } = registerControl('fshift');
export const { fshiftnote } = registerControl('fshiftnote');
export const { fshiftphase } = registerControl('fshiftphase');

export const { triode } = registerControl('triode');
export const { krush } = registerControl('krush');
export const { kcutoff } = registerControl('kcutoff');
export const { octer } = registerControl('octer');
export const { octersub } = registerControl('octersub');
export const { octersubsub } = registerControl('octersubsub');
export const { ring } = registerControl('ring');
export const { ringf } = registerControl('ringf');
export const { ringdf } = registerControl('ringdf');
export const { freeze } = registerControl('freeze');
export const { xsdelay } = registerControl('xsdelay');
export const { tsdelay } = registerControl('tsdelay');
export const { real } = registerControl('real');
export const { imag } = registerControl('imag');
export const { enhance } = registerControl('enhance');
export const { comb } = registerControl('comb');
export const { smear } = registerControl('smear');
export const { scram } = registerControl('scram');
export const { binshift } = registerControl('binshift');
export const { hbrick } = registerControl('hbrick');
export const { lbrick } = registerControl('lbrick');

export const { frameRate } = registerControl('frameRate');
export const { frames } = registerControl('frames');
export const { hours } = registerControl('hours');
export const { minutes } = registerControl('minutes');
export const { seconds } = registerControl('seconds');
export const { songPtr } = registerControl('songPtr');
export const { uid } = registerControl('uid');
export const { val } = registerControl('val');
export const { cps } = registerControl('cps');
/**
 * Умножает длительность на заданное число. Также обрезает sample в конце, если они превышают длительность.
 *
 * @name clip
 * @synonyms legato
 * @param {number | Pattern} factor >= 0
 * @example
 * note("c a f e").s("piano").clip("<.5 1 2>")
 *
 */
export const { clip, legato } = registerControl('clip', 'legato');

/**
 * Устанавливает длительность события в циклах. Аналогично clip / legato, также обрезает sample в конце, если они превышают длительность.
 *
 * @name duration
 * @synonyms dur
 * @param {number | Pattern} seconds >= 0
 * @example
 * note("c a f e").s("piano").dur("<.5 1 2>")
 *
 */
export const { duration, dur } = registerControl('duration', 'dur');

// ZZFX
export const { zrand } = registerControl('zrand');
export const { curve } = registerControl('curve');
// superdirt duplicate
// export const {slide]} = registerControl('slide']);
export const { deltaSlide } = registerControl('deltaSlide');
export const { pitchJump } = registerControl('pitchJump');
export const { pitchJumpTime } = registerControl('pitchJumpTime');
export const { lfo, repeatTime } = registerControl('lfo', 'repeatTime');
// noise on the frequency or as bubo calls it "frequency fog" :)
export const { znoise } = registerControl('znoise');
export const { zmod } = registerControl('zmod');
// like crush but scaled differently
export const { zcrush } = registerControl('zcrush');
export const { zdelay } = registerControl('zdelay');
export const { zzfx } = registerControl('zzfx');

/**
 * Устанавливает цвет hap в визуализациях, таких как pianoroll или подсветка.
 * @name color
 * @synonyms colour
 * @param {string} color Шестнадцатеричное значение или название цвета CSS
 */
export const { color, colour } = registerControl(['color', 'colour']);

// TODO: slice / splice https://www.youtube.com/watch?v=hKhPdO0RKDQ&list=PL2lW1zNIIwj3bDkh-Y3LUGDuRcoUigoDs&index=13

export let createParams = (...names) =>
  names.reduce((acc, name) => Object.assign(acc, { [name]: createParam(name) }), {});

/**
 * ADSR envelope: Комбинация Attack, Decay, Sustain и Release.
 *
 * @name adsr
 * @param {number | Pattern} time время attack в секундах
 * @param {number | Pattern} time время decay в секундах
 * @param {number | Pattern} gain уровень sustain (от 0 до 1)
 * @param {number | Pattern} time время release в секундах
 * @example
 * note("[c3 bb2 f3 eb3]*2").sound("sawtooth").lpf(600).adsr(".1:.1:.5:.2")
 */
export const adsr = register('adsr', (adsr, pat) => {
  adsr = !Array.isArray(adsr) ? [adsr] : adsr;
  const [attack, decay, sustain, release] = adsr;
  return pat.set({ attack, decay, sustain, release });
});
export const ad = register('ad', (t, pat) => {
  t = !Array.isArray(t) ? [t] : t;
  const [attack, decay = attack] = t;
  return pat.attack(attack).decay(decay);
});
export const ds = register('ds', (t, pat) => {
  t = !Array.isArray(t) ? [t] : t;
  const [decay, sustain = 0] = t;
  return pat.set({ decay, sustain });
});
export const ar = register('ar', (t, pat) => {
  t = !Array.isArray(t) ? [t] : t;
  const [attack, release = attack] = t;
  return pat.set({ attack, release });
});

//MIDI

/**
 * MIDI канал: Устанавливает MIDI канал для события.
 *
 * @name midichan
 * @param {number | Pattern} channel номер MIDI канала (0-15)
 * @example
 * note("c4").midichan(1).midi()
 */
export const { midichan } = registerControl('midichan');

export const { midimap } = registerControl('midimap');

/**
 * MIDI порт: Устанавливает MIDI порт для события.
 *
 * @name midiport
 * @param {number | Pattern} port MIDI порт
 * @example
 * note("c a f e").midiport("<0 1 2 3>").midi()
 */
export const { midiport } = registerControl('midiport');

/**
 * MIDI команда: Отправляет сообщение MIDI команды.
 *
 * @name midicmd
 * @param {number | Pattern} command MIDI команда
 * @example
 * midicmd("clock*48,<start stop>/2").midi()
 */
export const { midicmd } = registerControl('midicmd');

/**
 * MIDI контроллер: Отправляет сообщение изменения MIDI контроллера.
 *
 * @name control
 * @param {number | Pattern}  номер MIDI контроллера (0-127)
 * @param {number | Pattern}  значение MIDI контроллера (0-127)
 */
export const control = register('control', (args, pat) => {
  if (!Array.isArray(args)) {
    throw new Error('control expects an array of [ccn, ccv]');
  }
  const [_ccn, _ccv] = args;
  return pat.ccn(_ccn).ccv(_ccv);
});

/**
 * MIDI номер контроллера: Отправляет сообщение изменения MIDI контроллера.
 *
 * @name ccn
 * @param {number | Pattern}  номер MIDI контроллера (0-127)
 */
export const { ccn } = registerControl('ccn');
/**
 * MIDI значение контроллера: Отправляет сообщение изменения MIDI контроллера.
 *
 * @name ccv
 * @param {number | Pattern}  значение MIDI контроллера (0-127)
 */
export const { ccv } = registerControl('ccv');
export const { ctlNum } = registerControl('ctlNum');
// TODO: ctlVal?

/**
 * MIDI NRPN номер нерегистрированного параметра: Отправляет сообщение MIDI NRPN номера нерегистрированного параметра.
 * @name nrpnn
 * @param {number | Pattern} nrpnn MIDI NRPN номер нерегистрированного параметра (0-127)
 * @example
 * note("c4").nrpnn("1:8").nrpv("123").midichan(1).midi()
 */
export const { nrpnn } = registerControl('nrpnn');
/**
 * MIDI NRPN значение нерегистрированного параметра: Отправляет сообщение MIDI NRPN значения нерегистрированного параметра.
 * @name nrpv
 * @param {number | Pattern} nrpv MIDI NRPN значение нерегистрированного параметра (0-127)
 * @example
 * note("c4").nrpnn("1:8").nrpv("123").midichan(1).midi()
 */
export const { nrpv } = registerControl('nrpv');

/**
 * MIDI номер программы: Отправляет сообщение изменения MIDI программы.
 *
 * @name progNum
 * @param {number | Pattern} program номер MIDI программы (0-127)
 * @example
 * note("c4").progNum(10).midichan(1).midi()
 */
export const { progNum } = registerControl('progNum');

/**
 * MIDI sysex: Отправляет сообщение MIDI sysex.
 * @name sysex
 * @param {number | Pattern} id Sysex ID
 * @param {number | Pattern} data Sysex данные
 * @example
 * note("c4").sysex(["0x77", "0x01:0x02:0x03:0x04"]).midichan(1).midi()
 */
export const sysex = register('sysex', (args, pat) => {
  if (!Array.isArray(args)) {
    throw new Error('sysex expects an array of [id, data]');
  }
  const [id, data] = args;
  return pat.sysexid(id).sysexdata(data);
});
/**
 * MIDI sysex ID: Отправляет сообщение идентификатора MIDI sysex.
 * @name sysexid
 * @param {number | Pattern} id Sysex ID
 * @example
 * note("c4").sysexid("0x77").sysexdata("0x01:0x02:0x03:0x04").midichan(1).midi()
 */
export const { sysexid } = registerControl('sysexid');
/**
 * MIDI sysex данные: Отправляет сообщение MIDI sysex.
 * @name sysexdata
 * @param {number | Pattern} data Sysex данные
 * @example
 * note("c4").sysexid("0x77").sysexdata("0x01:0x02:0x03:0x04").midichan(1).midi()
 */
export const { sysexdata } = registerControl('sysexdata');

/**
 * MIDI pitch bend: Отправляет сообщение MIDI pitch bend.
 * @name midibend
 * @param {number | Pattern} midibend MIDI pitch bend (-1 - 1)
 * @example
 * note("c4").midibend(sine.slow(4).range(-0.4,0.4)).midi()
 */
export const { midibend } = registerControl('midibend');
/**
 * MIDI key after touch: Отправляет сообщение MIDI key after touch.
 * @name miditouch
 * @param {number | Pattern} miditouch MIDI key after touch (0-1)
 * @example
 * note("c4").miditouch(sine.slow(4).range(0,1)).midi()
 */
export const { miditouch } = registerControl('miditouch');

// TODO: what is this?
export const { polyTouch } = registerControl('polyTouch');

/**
 * Хост для отправки сообщений open sound control. Требует запущенный OSC bridge.
 * @name oschost
 * @param {string | Pattern} oschost например, 'localhost'
 * @example
 * note("c4").oschost('127.0.0.1').oscport(57120).osc();
 */
export const { oschost } = registerControl('oschost');

/**
 * Порт для отправки сообщений open sound control. Требует запущенный OSC bridge.
 * @name oscport
 * @param {number | Pattern} oscport например, 57120
 * @example
 * note("c4").oschost('127.0.0.1').oscport(57120).osc();
 */
export const { oscport } = registerControl('oscport');

export const getControlName = (alias) => {
  if (controlAlias.has(alias)) {
    return controlAlias.get(alias);
  }
  return alias;
};

/**
 * Устанавливает свойства в пакетном режиме.
 *
 * @name as
 * @param {String | Array} mapping названия контроллеров, которые устанавливаются
 * @example
 * "c:.5 a:1 f:.25 e:.8".as("note:clip")
 * @example
 * "{0@2 0.25 0 0.5 .3 .5}%8".as("begin").s("sax_vib").clip(1)
 */
export const as = register('as', (mapping, pat) => {
  mapping = Array.isArray(mapping) ? mapping : [mapping];
  return pat.fmap((v) => {
    v = Array.isArray(v) ? v : [v];
    v = Object.fromEntries(mapping.map((prop, i) => [getControlName(prop), v[i]]));
    return v;
  });
});

/**
 * Позволяет "скрабить" аудио файл, как ленточную петлю, передавая значения, представляющие позицию в аудио файле
 * в опциональном синтаксисе массива, например: "0.5:2", второе значение контролирует скорость воспроизведения
 * @name scrub
 * @memberof Pattern
 * @returns Pattern
 * @example
 * samples('github:switchangel/pad')
 * s("swpad:0").scrub("{0.1!2 .25@3 0.7!2 <0.8:1.5>}%8")
 * @example
 * samples('github:yaxu/clean-breaks/main');
 * s("amen/4").fit().scrub("{0@3 0@2 4@3}%8".div(16))
 */

export const scrub = register(
  'scrub',
  (beginPat, pat) => {
    return beginPat.outerBind((v) => {
      if (!Array.isArray(v)) {
        v = [v];
      }
      const [beginVal, speedMultiplier = 1] = v;

      return pat.begin(beginVal).mul(speed(speedMultiplier)).clip(1);
    });
  },
  false,
);
