// Copyright 2014 Alan deLespinasse
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var reverbGen = {};

/** Генерирует импульсный отклик reverb.

 @param {!Object} params TODO: Документировать свойства.
 @param {!function(!AudioBuffer)} callback Функция для вызова, когда
  импульсный отклик был сгенерирован. Импульсный отклик
  передается этой функции в качестве параметра. Может быть вызвана
  немедленно в текущем контексте выполнения или позже. */
reverbGen.generateReverb = function (params, callback) {
  var audioContext = params.audioContext || new AudioContext();
  var sampleRate = audioContext.sampleRate;
  var numChannels = params.numChannels || 2;
  // params.decayTime is the -60dB fade time. We let it go 50% longer to get to -90dB.
  var totalTime = params.decayTime * 1.5;
  var decaySampleFrames = Math.round(params.decayTime * sampleRate);
  var numSampleFrames = Math.round(totalTime * sampleRate);
  var fadeInSampleFrames = Math.round((params.fadeInTime || 0) * sampleRate);
  // 60dB is a factor of 1 million in power, or 1000 in amplitude.
  var decayBase = Math.pow(1 / 1000, 1 / decaySampleFrames);
  var reverbIR = audioContext.createBuffer(numChannels, numSampleFrames, sampleRate);
  for (var i = 0; i < numChannels; i++) {
    var chan = reverbIR.getChannelData(i);
    for (var j = 0; j < numSampleFrames; j++) {
      chan[j] = randomSample() * Math.pow(decayBase, j);
    }
    for (var j = 0; j < fadeInSampleFrames; j++) {
      chan[j] *= j / fadeInSampleFrames;
    }
  }

  applyGradualLowpass(reverbIR, params.lpFreqStart || 0, params.lpFreqEnd || 0, params.decayTime, callback);
};

/** Создает элемент canvas с графиком предоставленных данных.


 @param {!Float32Array} data Массив чисел или Float32Array.
 @param {number} width Ширина canvas в пикселях.
 @param {number} height Высота canvas в пикселях.
 @param {number} min Минимальное значение данных для графика (нижний край).
 @param {number} max Максимальное значение данных на графике (верхний край).
 @return {!CanvasElement} Сгенерированный элемент canvas. */
reverbGen.generateGraph = function (data, width, height, min, max) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var gc = canvas.getContext('2d');
  gc.fillStyle = '#000';
  gc.fillRect(0, 0, canvas.width, canvas.height);
  gc.fillStyle = '#fff';
  var xscale = width / data.length;
  var yscale = height / (max - min);
  for (var i = 0; i < data.length; i++) {
    gc.fillRect(i * xscale, height - (data[i] - min) * yscale, 1, 1);
  }
  return canvas;
};

/** Применяет постоянно изменяющийся lowpass filter к данному звуку.

 @private
 @param {!AudioBuffer} input
 @param {number} lpFreqStart
 @param {number} lpFreqEnd
 @param {number} lpFreqEndAt
 @param {!function(!AudioBuffer)} callback Может быть вызвана
  немедленно в текущем контексте выполнения или позже.*/
var applyGradualLowpass = function (input, lpFreqStart, lpFreqEnd, lpFreqEndAt, callback) {
  if (lpFreqStart == 0) {
    callback(input);
    return;
  }
  var channelData = getAllChannelData(input);
  var context = new OfflineAudioContext(input.numberOfChannels, channelData[0].length, input.sampleRate);
  var player = context.createBufferSource();
  player.buffer = input;
  var filter = context.createBiquadFilter();

  lpFreqStart = Math.min(lpFreqStart, input.sampleRate / 2);
  lpFreqEnd = Math.min(lpFreqEnd, input.sampleRate / 2);

  filter.type = 'lowpass';
  filter.Q.value = 0.0001;
  filter.frequency.setValueAtTime(lpFreqStart, 0);
  filter.frequency.linearRampToValueAtTime(lpFreqEnd, lpFreqEndAt);

  player.connect(filter);
  filter.connect(context.destination);
  player.start();
  context.oncomplete = function (event) {
    callback(event.renderedBuffer);
    filter.disconnect();
    player.disconnect();
  };
  context.startRendering();

  window.filterNode = filter;
};

/** @private
 @param {!AudioBuffer} buffer
 @return {!Array.<!Float32Array>} Массив, содержащий Float32Array с sample каждого канала. */
var getAllChannelData = function (buffer) {
  var channels = [];
  for (var i = 0; i < buffer.numberOfChannels; i++) {
    channels[i] = buffer.getChannelData(i);
  }
  return channels;
};

/** @private
 @return {number} Случайное число от -1 до 1. */
var randomSample = function () {
  return Math.random() * 2 - 1;
};

export default reverbGen;
