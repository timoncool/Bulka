import { Pattern, clamp } from '@strudel/core';
import { getDrawContext, getTheme } from '@strudel/draw';
import { analysers, getAnalyzerData } from 'superdough';

export function drawTimeScope(
  analyser,
  {
    align = true,
    color = 'white',
    thickness = 3,
    scale = 0.25,
    pos = 0.75,
    trigger = 0,
    ctx = getDrawContext(),
    id = 1,
  } = {},
) {
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;
  let canvas = ctx.canvas;

  if (!analyser) {
    // if analyser is undefined, draw straight line
    // it may be undefined when no sound has been played yet
    ctx.beginPath();
    let y = pos * canvas.height;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    return;
  }
  const dataArray = getAnalyzerData('time', id);

  ctx.beginPath();

  const bufferSize = analyser.frequencyBinCount;
  let triggerIndex = align
    ? Array.from(dataArray).findIndex((v, i, arr) => i && arr[i - 1] > -trigger && v <= -trigger)
    : 0;
  triggerIndex = Math.max(triggerIndex, 0); // fallback to 0 when no trigger is found

  const sliceWidth = (canvas.width * 1.0) / bufferSize;
  let x = 0;
  for (let i = triggerIndex; i < bufferSize; i++) {
    const v = dataArray[i] + 1;
    const y = (pos - scale * (v - 1)) * canvas.height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
}

export function drawFrequencyScope(
  analyser,
  { color = 'white', scale = 0.25, pos = 0.75, lean = 0.5, min = -150, max = 0, ctx = getDrawContext(), id = 1 } = {},
) {
  if (!analyser) {
    ctx.beginPath();
    let y = pos * canvas.height;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    return;
  }
  const dataArray = getAnalyzerData('frequency', id);
  const canvas = ctx.canvas;

  ctx.fillStyle = color;
  const bufferSize = analyser.frequencyBinCount;
  const sliceWidth = (canvas.width * 1.0) / bufferSize;

  let x = 0;
  for (let i = 0; i < bufferSize; i++) {
    const normalized = clamp((dataArray[i] - min) / (max - min), 0, 1);
    const v = normalized * scale;
    const h = v * canvas.height;
    const y = (pos - v * lean) * canvas.height;

    ctx.fillRect(x, y, Math.max(sliceWidth, 1), h);
    x += sliceWidth;
  }
}

function clearScreen(smear = 0, smearRGB = `0,0,0`, ctx = getDrawContext()) {
  if (!smear) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.fillStyle = `rgba(${smearRGB},${1 - smear})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * Рендерит осциллограф для частотной области аудиосигнала.
 * @name fscope
 * @param {string} color Цвет линии в виде hex или названия цвета. По умолчанию белый.
 * @param {number} scale Масштабирует ось y. По умолчанию 0.25
 * @param {number} pos Позиция по оси y относительно высоты экрана. 0 = верх, 1 = низ экрана
 * @param {number} lean Выравнивание по оси y, где 0 = верх и 1 = низ
 * @param {number} min Минимальное значение
 * @param {number} max Максимальное значение
 * @example
 * s("sawtooth").fscope()
 */
Pattern.prototype.fscope = function (config = {}) {
  let id = config.id ?? 1;
  return this.analyze(id).draw(
    () => {
      clearScreen(config.smear, '0,0,0', config.ctx);
      analysers[id] && drawFrequencyScope(analysers[id], config);
    },
    { id },
  );
};

/**
 * Рендерит осциллограф для временной области аудиосигнала.
 * @name scope
 * @synonyms tscope
 * @param {object} config Опциональная конфигурация с параметрами:
 * @param {boolean} align Если 1, осциллограф будет выровнен по первому пересечению нуля. По умолчанию 1
 * @param {string} color Цвет линии в виде hex или названия цвета. По умолчанию белый.
 * @param {number} thickness Толщина линии. По умолчанию 3
 * @param {number} scale Масштабирует ось y. По умолчанию 0.25
 * @param {number} pos Позиция по оси y относительно высоты экрана. 0 = верх, 1 = низ экрана
 * @param {number} trigger Значение амплитуды, используемое для выравнивания осциллографа. По умолчанию 0.
 * @example
 * s("sawtooth")._scope()
 */
let latestColor = {};
Pattern.prototype.tscope = function (config = {}) {
  let id = config.id ?? 1;
  return this.analyze(id).draw(
    (haps) => {
      config.color = haps[0]?.value?.color || getTheme().foreground;
      latestColor[id] = config.color;
      clearScreen(config.smear, '0,0,0', config.ctx);
      drawTimeScope(analysers[id], config);
    },
    { id },
  );
};

Pattern.prototype.scope = Pattern.prototype.tscope;
