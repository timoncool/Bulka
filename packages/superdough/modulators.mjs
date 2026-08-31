/*
modulators.mjs - Helpers for constructing modulators (envelopes, LFOs, etc.)
Copyright (C) 2025 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/modulators.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { getAudioContext } from './audioContext.mjs';
import { gainNode, getEnvelope, getLfo, webAudioTimeout } from './helpers.mjs';
import { errorLogger } from './logger.mjs';
import { getSuperdoughControlTargets } from './superdoughdata.mjs';
import { clamp } from './util.mjs';

const getNodeParam = (node, name) => {
  // Worklet case
  if (node?.parameters) {
    const p = node.parameters.get(name);
    if (p instanceof AudioParam) {
      return p;
    }
  }
  // Built-in node case
  let p = node?.[name];
  if (p === undefined && name === 'frequency') {
    // Fallbacks for source nodes without 'frequency' params (e.g. soundfonts)
    p = node?.['detune'] ?? node?.['playbackRate'];
  }
  if (p instanceof AudioParam) {
    return p;
  }
  return undefined;
};

const controlTargets = getSuperdoughControlTargets();

const getControlData = (control, subControl) => {
  const controlNoIdx = control.split('_')[0];
  return controlTargets[`${controlNoIdx}_${subControl}`] ?? controlTargets[controlNoIdx];
};

const getRangeForParam = (paramName, currentValue) => {
  // We clamp the frequency to a reasonable range unless the currentValue
  // is low, which indicates this may be an LFO
  if (paramName === 'frequency' && currentValue >= 30) {
    return { min: 20 - currentValue, max: 24000 - currentValue };
  }
  return { min: undefined, max: undefined };
};

const clampWithWaveShaper = (modulator, min, max) => {
  const ac = getAudioContext();
  const curve = new Float32Array(256);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = clamp(x * max, min, max);
  }
  const shaper = new WaveShaperNode(ac, { curve });
  const scaleGain = gainNode(1 / max);
  modulator.connect(scaleGain).connect(shaper);
  return { modulator, toCleanup: [shaper, scaleGain] };
};

const getTargetParamsForControl = (control, nodes, subControl) => {
  const targetInfo = getControlData(control, subControl);
  if (!targetInfo) {
    errorLogger(
      new Error(`Could not find control data for target '${control}'. It may not be modulatable.`),
      'superdough',
    );
    return { targetParams: [], paramName: control };
  }
  const paramName = targetInfo.param;
  const nodeKey = nodes[targetInfo.node] ? targetInfo.node : control;
  const targetNodes = nodes[nodeKey];
  if (!targetNodes) {
    const keys = Object.keys(nodes);
    errorLogger(
      new Error(`Could not connect to target '${nodeKey}' — it does not exist. Available targets: ${keys.join(', ')}`),
      'superdough',
    );
    return { targetParams: [], paramName };
  }
  const audioParams = [];
  targetNodes.forEach((targetNode) => {
    const targetParam = getNodeParam(targetNode, paramName);
    audioParams.push(targetParam);
  });
  return { targetParams: audioParams, paramName };
};

export const connectLFO = (id, params, nodeTracker) => {
  const {
    rate = 1,
    sync,
    cps,
    cycle,
    control = 'lfo',
    subControl,
    fxi = 'main',
    depth = 1,
    depthabs,
    retrig = 0,
    ...filteredParams
  } = params;
  const { targetParams, paramName } = getTargetParamsForControl(control, nodeTracker[fxi], subControl);
  if (!targetParams.length) return;
  let currentValue = targetParams[0].value;
  currentValue = currentValue === 0 ? 1 : currentValue;
  const { min, max } = getRangeForParam(paramName, currentValue);
  const depthValue = depthabs != null ? depthabs : depth * currentValue;
  const modParams = {
    ...filteredParams,
    frequency: sync !== undefined ? sync * cps : rate,
    time: retrig > 0.5 ? 0 : cycle / cps,
    depth: depthValue,
    min,
    max,
  };
  const lfoNode = getLfo(getAudioContext(), modParams);
  nodeTracker.main[`lfo_${id}`] = [lfoNode];
  targetParams.forEach((t) => lfoNode.connect(t));
  return lfoNode;
};

export const connectEnvelope = (id, params, nodeTracker) => {
  const { control, subControl, acurve, dcurve, rcurve, depth = 1, depthabs, fxi = 'main', ...filteredParams } = params;
  const { targetParams, paramName } = getTargetParamsForControl(control, nodeTracker[fxi], subControl);
  if (!targetParams.length) return;
  let currentValue = targetParams[0].value;
  currentValue = currentValue === 0 ? 1 : currentValue;
  const { min, max } = getRangeForParam(paramName, currentValue);
  const depthValue = depthabs != null ? depthabs : depth * currentValue;
  const envNode = getEnvelope(getAudioContext(), {
    ...filteredParams,
    depth: depthValue,
    min,
    max,
    attackCurve: acurve,
    decayCurve: dcurve,
    releaseCurve: rcurve,
  });
  nodeTracker.main[`env_${id}`] = [envNode];
  targetParams.forEach((t) => envNode.connect(t));
  return envNode;
};

export const connectBusModulator = (params, nodeTracker, controller) => {
  const ac = getAudioContext();
  const { control, subControl, depth = 1, depthabs, fxi = 'main' } = params;
  const { targetParams, paramName } = getTargetParamsForControl(control, nodeTracker[fxi], subControl);
  if (!targetParams.length) return { toCleanup: [] };
  const signal = controller.getBus(params.bus);
  const dc = new ConstantSourceNode(ac, { offset: params.dc ?? 0 });
  dc.start(params.begin);
  const shifted = dc.connect(gainNode(1));
  signal.connect(shifted);
  let currentValue = targetParams[0].value;
  currentValue = currentValue === 0 ? 1 : currentValue;
  const { min, max } = getRangeForParam(paramName, currentValue);
  const depthValue = depthabs != null ? depthabs : depth * currentValue;
  const depthGain = gainNode((Math.sign(depthValue) * Math.abs(depthValue)) / 0.3);
  const unClamped = shifted.connect(depthGain);
  const toCleanup = [];
  let modulator = unClamped;
  if (min !== undefined && max !== undefined) {
    const wsData = clampWithWaveShaper(unClamped, min, max);
    modulator = wsData.modulator;
    toCleanup.push(...wsData.toCleanup);
  }
  webAudioTimeout(
    ac,
    () => {
      targetParams.forEach((t) => modulator.connect(t));
    },
    0,
    params.begin,
  );
  toCleanup.push(dc, shifted, depthGain);
  return { modulator, toCleanup };
};
