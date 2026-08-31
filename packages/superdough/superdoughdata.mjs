/*
superdoughdata.mjs - Data needed for running superdough (defaults, mappings, etc.)
Copyright (C) 2025 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdoughdata.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// Mapping from control name to webaudio node and parameter
const CONTROL_TARGETS = {
  stretch: { node: 'stretch', param: 'pitchFactor' },
  gain: { node: 'gain', param: 'gain' },
  postgain: { node: 'post', param: 'gain' },
  pan: { node: 'pan', param: 'pan' },
  tremolo: { node: 'tremolo', param: 'frequency' },
  tremolosync: { node: 'tremolo', param: 'frequency' },
  tremolodepth: { node: 'tremolo_gain', param: 'gain' },
  tremoloskew: { node: 'tremolo', param: 'skew' },
  tremolophase: { node: 'tremolo', param: 'phase' },
  tremoloshape: { node: 'tremolo', param: 'shape' },

  // MODULATORS
  lfo: { node: 'lfo', param: 'frequency' },
  lfo_rate: { node: 'lfo', param: 'frequency' },
  lfo_sync: { node: 'lfo', param: 'frequency' },
  lfo_depth: { node: 'lfo', param: 'depth' },
  lfo_depthabs: { node: 'lfo', param: 'depth' },
  lfo_skew: { node: 'lfo', param: 'skew' },
  lfo_curve: { node: 'lfo', param: 'curve' },
  lfo_dcoffset: { node: 'lfo', param: 'dcoffset' },
  env: { node: 'env', param: 'depth' },
  env_attack: { node: 'env', param: 'attack' },
  env_decay: { node: 'env', param: 'decay' },
  env_sustain: { node: 'env', param: 'sustain' },
  env_release: { node: 'env', param: 'release' },
  bmod: { node: 'bmod', param: 'depth' },
  bmod_depth: { node: 'bmod', param: 'depth' },
  bmod_depthabs: { node: 'bmod', param: 'depth' },

  // LPF
  cutoff: { node: 'lpf', param: 'frequency' },
  resonance: { node: 'lpf', param: 'Q' },
  lprate: { node: 'lpf_lfo', param: 'rate' },
  lpsync: { node: 'lpf_lfo', param: 'sync' },
  lpdepth: { node: 'lpf_lfo', param: 'depth' },
  lpdepthfrequency: { node: 'lpf_lfo', param: 'depth' },
  lpshape: { node: 'lpf_lfo', param: 'shape' },
  lpdc: { node: 'lpf_lfo', param: 'dcoffset' },
  lpskew: { node: 'lpf_lfo', param: 'skew' },

  // HPF
  hcutoff: { node: 'hpf', param: 'frequency' },
  hresonance: { node: 'hpf', param: 'Q' },
  hprate: { node: 'hpf_lfo', param: 'rate' },
  hpsync: { node: 'hpf_lfo', param: 'sync' },
  hpdepth: { node: 'hpf_lfo', param: 'depth' },
  hpdepthfrequency: { node: 'hpf_lfo', param: 'depth' },
  hpshape: { node: 'hpf_lfo', param: 'shape' },
  hpdc: { node: 'hpf_lfo', param: 'dcoffset' },
  hpskew: { node: 'hpf_lfo', param: 'skew' },

  // BPF
  bandf: { node: 'bpf', param: 'frequency' },
  bandq: { node: 'bpf', param: 'Q' },
  bprate: { node: 'bpf_lfo', param: 'rate' },
  bpsync: { node: 'bpf_lfo', param: 'sync' },
  bpdepth: { node: 'bpf_lfo', param: 'depth' },
  bpdepthfrequency: { node: 'bpf_lfo', param: 'depth' },
  bpshape: { node: 'bpf_lfo', param: 'shape' },
  bpdc: { node: 'bpf_lfo', param: 'dcoffset' },
  bpskew: { node: 'bpf_lfo', param: 'skew' },

  vowel: { node: 'vowel', param: 'frequency' },

  // DISTORTION
  coarse: { node: 'coarse', param: 'coarse' },
  crush: { node: 'crush', param: 'crush' },
  shape: { node: 'shape', param: 'shape' },
  shapevol: { node: 'shape', param: 'postgain' },
  distort: { node: 'distort', param: 'distort' },
  distortvol: { node: 'distort', param: 'postgain' },
  distorttype: { node: 'distort', param: 'distort' },

  // COMPRESSOR
  compressor: { node: 'compressor', param: 'threshold' },
  compressorRatio: { node: 'compressor', param: 'ratio' },
  compressorKnee: { node: 'compressor', param: 'knee' },
  compressorAttack: { node: 'compressor', param: 'attack' },
  compressorRelease: { node: 'compressor', param: 'release' },

  // PHASER
  phaserrate: { node: 'phaser_lfo', param: 'frequency' },
  phasersweep: { node: 'phaser_lfo', param: 'depth' },
  phasercenter: { node: 'phaser', param: 'frequency' },
  phaserdepth: { node: 'phaser', param: 'Q' },

  // ORBIT EFFECTS
  delay: { node: 'delay_mix', param: 'gain' },
  delaytime: { node: 'delay', param: 'delayTime' },
  delayfeedback: { node: 'delay', param: 'feedback' },
  delaysync: { node: 'delay', param: 'delayTime' },
  dry: { node: 'dry', param: 'gain' },
  room: { node: 'room_mix', param: 'gain' },
  djf: { node: 'djf', param: 'value' },
  busgain: { node: 'bus', param: 'gain' },

  // SYNTHS
  s: { node: 'source', param: 'frequency' },
  detune: { node: 'source', param: 'freqspread' },
  wt: { node: 'source', param: 'position' },
  warp: { node: 'source', param: 'warp' },
  freq: { node: 'source', param: 'frequency' },
  note: { node: 'source', param: 'frequency' },
  wtdc: { node: 'wt_lfo', param: 'dc' },
  wtskew: { node: 'wt_lfo', param: 'skew' },
  wtrate: { node: 'wt_lfo', param: 'frequency' },
  wtsync: { node: 'wt_lfo', param: 'frequency' },
  wtdepth: { node: 'wt_lfo', param: 'depth' },
  warpdc: { node: 'warp_lfo', param: 'dc' },
  warpskew: { node: 'warp_lfo', param: 'skew' },
  warprate: { node: 'warp_lfo', param: 'frequency' },
  warpsync: { node: 'warp_lfo', param: 'frequency' },
  warpdepth: { node: 'warp_lfo', param: 'depth' },
  fmi: { node: 'fm_1_gain', param: 'gain' },
  fmi2: { node: 'fm_2_gain', param: 'gain' },
  fmi3: { node: 'fm_3_gain', param: 'gain' },
  fmi4: { node: 'fm_4_gain', param: 'gain' },
  fmi5: { node: 'fm_5_gain', param: 'gain' },
  fmi6: { node: 'fm_6_gain', param: 'gain' },
  fmi7: { node: 'fm_7_gain', param: 'gain' },
  fmi8: { node: 'fm_8_gain', param: 'gain' },
  fmh: { node: 'fm_1', param: 'frequency' },
  fmh2: { node: 'fm_2', param: 'frequency' },
  fmh3: { node: 'fm_3', param: 'frequency' },
  fmh4: { node: 'fm_4', param: 'frequency' },
  fmh5: { node: 'fm_5', param: 'frequency' },
  fmh6: { node: 'fm_6', param: 'frequency' },
  fmh7: { node: 'fm_7', param: 'frequency' },
  fmh8: { node: 'fm_8', param: 'frequency' },
  pw: { node: 'source', param: 'pulsewidth' },
  pwrate: { node: 'pw_lfo', param: 'frequency' },
  pwsweep: { node: 'pw_lfo', param: 'depth' },
  vib: { node: 'vib', param: 'frequency' },
  vibmod: { node: 'vib_gain', param: 'gain' },
  byteBeatStartTime: { node: 'source', param: 'byteBeatStartTime' },
  spread: { node: 'source', param: 'panspread' },
  transient: { node: 'transient', param: 'attack' },
};

export function getSuperdoughControlTargets() {
  return CONTROL_TARGETS;
}
