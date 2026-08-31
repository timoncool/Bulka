/*
Repl.jsx - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/repl/src/App.js>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { code2hash, getPerformanceTimeSeconds, logger, silence } from '@strudel/core';
import { getDrawContext } from '@strudel/draw';
import { transpiler, evaluate } from '@strudel/transpiler';
import {
  getAudioContextCurrentTime,
  webaudioOutput,
  resetGlobalEffects,
  resetLoadedSounds,
  initAudioOnFirstClick,
  resetDefaults,
} from '@strudel/webaudio';
import { setVersionDefaultsFrom } from './util.mjs';
import { StrudelMirror, defaultSettings } from '@strudel/codemirror';
import { clearHydra } from '@strudel/hydra';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseBoolean, settingsMap, useSettings } from '../settings.mjs';
import {
  setActivePattern,
  setLatestCode,
  createPatternID,
  userPattern,
  getViewingPatternData,
  setViewingPatternData,
} from '../user_pattern_utils.mjs';
import { superdirtOutput } from '@strudel/osc/superdirtoutput';
import { audioEngineTargets } from '../settings.mjs';
import { useStore } from '@nanostores/react';
import { prebake } from './prebake.mjs';
import { getRandomTune, initCode, loadModules, shareCode } from './util.mjs';
import './Repl.css';
import { setInterval, clearInterval } from 'worker-timers';
import { getMetadata } from '../metadata_parser';

const { latestCode, maxPolyphony, audioDeviceName, multiChannelOrbits } = settingsMap.get();
let modulesLoading, presets, drawContext, clearCanvas, audioReady;

if (typeof window !== 'undefined') {
  audioReady = initAudioOnFirstClick({
    maxPolyphony,
    audioDeviceName,
    multiChannelOrbits: parseBoolean(multiChannelOrbits),
  });
  modulesLoading = loadModules();
  presets = prebake();
  drawContext = getDrawContext();
  clearCanvas = () => drawContext.clearRect(0, 0, drawContext.canvas.height, drawContext.canvas.width);
}

async function getModule(name) {
  if (!modulesLoading) {
    return;
  }
  const modules = await modulesLoading;
  return modules.find((m) => m.packageName === name);
}

const initialCode = `// LOADING`;

export function useReplContext() {
  const { isSyncEnabled, audioEngineTarget, prebakeScript, includePrebakeScriptInShare } = useSettings();
  const shouldUseWebaudio = audioEngineTarget !== audioEngineTargets.osc;
  const defaultOutput = shouldUseWebaudio ? webaudioOutput : superdirtOutput;
  const getTime = shouldUseWebaudio ? getAudioContextCurrentTime : getPerformanceTimeSeconds;
  const init = useCallback(() => {
    setActivePattern(getViewingPatternData().id);
    const drawTime = [-2, 2];
    const drawContext = getDrawContext();
    const editor = new StrudelMirror({
      sync: isSyncEnabled,
      defaultOutput,
      getTime,
      setInterval,
      clearInterval,
      transpiler,
      autodraw: false,
      root: containerRef.current,
      initialCode,
      pattern: silence,
      drawTime,
      drawContext,
      prebake: async () => {
        await Promise.all([modulesLoading, presets]);
        if (prebakeScript) {
          return evaluate(prebakeScript, { addReturn: false });
        }
      },
      onUpdateState: (state) => {
        setReplState({ ...state });
      },
      onToggle: (playing) => {
        if (!playing) {
          clearHydra();
        }
      },
      beforeEval: () => audioReady,
      afterEval: (all) => {
        const { code } = all;
        //post to iframe parent (like Udels) if it exists...
        window.parent?.postMessage(code);

        // Get the full buffer content from the editor instead of just the evaluated block
        const fullBufferCode = editorRef.current?.code || code;
        setLatestCode(fullBufferCode);

        try {
          window.location.hash = '#' + code2hash(fullBufferCode);
        } catch (e) {
          console.warn('[useReplContext] Failed to update hash:', e.message);
        }
        setDocumentTitle(fullBufferCode);
        const viewingPatternData = getViewingPatternData();
        setVersionDefaultsFrom(fullBufferCode);
        const data = { ...viewingPatternData, code: fullBufferCode };
        let id = data.id;
        const isExamplePattern = viewingPatternData.collection !== userPattern.collection;

        if (isExamplePattern) {
          const codeHasChanged = fullBufferCode !== viewingPatternData.code;
          if (codeHasChanged) {
            // fork example
            const newPattern = userPattern.duplicate(data);
            id = newPattern.id;
            setViewingPatternData(newPattern.data);
          }
        } else {
          id = userPattern.isValidID(id) ? id : createPatternID();
          setViewingPatternData(userPattern.update(id, data).data);
        }
        setActivePattern(id);
      },
      bgFill: false,
    });
    window.strudelMirror = editor;

    // init settings
    const urlParams = new URLSearchParams(window.location.search);
    const isNewSession = urlParams.has('new');
    if (isNewSession) {
      // clear persisted session state
      localStorage.removeItem('bulka-chat-messages');
      localStorage.removeItem('bulka-chat-draft');
      sessionStorage.removeItem('viewingPatternData');
      sessionStorage.removeItem('activePattern');
      // clean up ?new from URL without reload
      urlParams.delete('new');
      const cleanUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
    initCode().then(async (decoded) => {
      let code, msg;
      if (isNewSession) {
        code = '';
        msg = `Новая сессия!`;
      } else if (decoded) {
        code = decoded;
        msg = `I have loaded the code from the URL.`;
      } else if (latestCode) {
        code = latestCode;
        msg = `Your last session has been loaded!`;
      } else {
        /* const { code: randomTune, name } = await getRandomTune();
        code = randomTune; */
        code = `// @title Pixel Sunrise
// @by Nerual Dreming

cpm(180/2);

stack(
  arrange(
    // === БЛОК 1: ВСТУПЛЕНИЕ ===
    [4,
      stack(
        s("bd sd bd [sd sd*2]").crush(6).gain(0.1).bank("RolandTR808"),
        s("hh*16").gain(0.08).bank("RolandTR808").bpf(sine.range(500, 4000).slow(6)).bpq(4).pan(sine.slow(5))
      )
      ._scope()
    ],

    // === БЛОК 2: ОСНОВНАЯ ЧАСТЬ ===
    [16,
      stack(
        stack(
          s("bd sd bd [sd sd*2]").crush(6).gain(0.1).bank("RolandTR808"),
          s("hh*16").gain(0.08).bank("RolandTR808").bpf(sine.range(500, 4000).slow(6)).bpq(4).pan(sine.slow(5))
        )._scope(),

        n("0").chord("<Am F C G>").voicing()
          .s("square").decay(0.1).sustain(0).lpf(400).gain(0.12)
          .pan(sine.slow(8))
          ._scope(),

        n("0").chord("<Am F C G>").mode("root:c1").voicing()
          .s("triangle").lpf(sine.range(150, 500).slow(16)).lpq(3).room(0.5).gain(0.08)
          .pan(sine.slow(12))
          ._scope(),

        n("<0 2 4 5 7 5 4 2 7 5 9 7 11 9 7 5>").chord("<Am F C G>").voicing()
          .s("square").decay(0.15).sustain(0).gain(0.1)
          .phaser(sine.slow(6).range(2, 6))
          .jux(x => x.gain(0.5).speed(0.99))
          ._scope(),

        n("~ 4 ~ 3 ~ 2 ~ 0")
          .chord("<Am F C G>")
          .voicing()
          .s("triangle").decay(0.3).sustain(0).gain(0.08).room(0.4)
          .phaser(sine.slow(9).range(1, 5))
          .jux(x => x.gain(0.6).speed(1.01))
          ._scope()
      )
    ],

    // === БЛОК 3: БРЕЙКДАУН ===
    [8,
      stack(
        chord("<Am F C G>").voicing().s("sawtooth").attack(1).release(1.5).lpf(800).gain(0.07)
          .phaser(1)
          .pan(sine.slow(10))
          ._scope(),
        n("4 3 2 0 2 3 4 5")
          .chord("<Am F C G>").voicing()
          .s("triangle").decay(0.4).sustain(0).gain(0.1)
          .phaser(4)
          .delay(0.25).delayfeedback(0.5)
          .pan(sine.slow(4))
          ._scope()
      )
    ],

    // === БЛОК 4: КОНЦОВКА ===
    [8,
      stack(
        stack(
          s("bd sd bd [sd sd*2]").crush(6).gain(0.1).bank("RolandTR808"),
          s("hh*16").gain(0.08).bank("RolandTR808").bpf(sine.range(500, 4000).slow(6)).bpq(4).pan(sine.slow(5))
        )._scope(),

        n("0").chord("<Am F C G>").voicing()
          .s("square").decay(0.1).sustain(0).lpf(400).gain(0.12)
          .pan(sine.slow(8))
          ._scope(),
        n("0").chord("<Am F C G>").mode("root:c1").voicing()
          .s("triangle").lpf(sine.range(150, 500).slow(16)).lpq(3).room(0.5).gain(0.08)
          .pan(sine.slow(12))
          ._scope(),

        n("<0 2 4 5 7 5 4 2 7 5 9 7 11 9 7 5>").chord("<Am F C G>").voicing()
          .s("square").decay(0.15).sustain(0).gain(0.1)
          .phaser(sine.slow(6).range(2, 6))
          .jux(x => x.gain(0.5).speed(0.99))
          ._scope(),

        n("~ 4 ~ 3 ~ 2 ~ 0")
          .chord("<Am F C G>")
          .voicing()
          .s("triangle").decay(0.3).sustain(0).gain(0.08).room(0.4)
          .phaser(sine.slow(9).range(1, 5))
          .jux(x => x.gain(0.6).speed(1.01))
          ._scope()
      )
    ]
  )
).gain(0.15);`;
        msg = `Default code has been loaded`;
      }
      editor.setCode(code);
      setDocumentTitle(code);
      logger(`Добро пожаловать в Bulka! ${msg} Нажми играть или ctrl+enter чтобы запустить!`, 'highlight');
    });

    editorRef.current = editor;
  }, []);

  const [replState, setReplState] = useState({});
  const { started, isDirty, error, activeCode, pending } = replState;
  const editorRef = useRef();
  const containerRef = useRef();

  // this can be simplified once SettingsTab has been refactored to change codemirrorSettings directly!
  // this will be the case when the main repl is being replaced
  const _settings = useStore(settingsMap, { keys: Object.keys(defaultSettings) });
  useEffect(() => {
    let editorSettings = {};
    Object.keys(defaultSettings).forEach((key) => {
      // Don't use hasOwnProperty - nanostore uses proxies so values may not be own properties
      editorSettings[key] = _settings[key];
    });
    editorRef.current?.updateSettings(editorSettings);
  }, [_settings]);

  //
  // UI Actions
  //

  const setDocumentTitle = (code) => {
    const meta = getMetadata(code);
    document.title = (meta.title ? `${meta.title} - ` : '') + 'Bulka редактор';
  };

  const handleTogglePlay = async () => {
    editorRef.current?.toggle();
  };

  const resetEditor = async () => {
    (await getModule('@strudel/tonal'))?.resetVoicings();
    resetDefaults();
    resetGlobalEffects();
    clearCanvas();
    clearHydra();
    resetLoadedSounds();
    editorRef.current.repl.setCps(0.5);
    await prebake(); // declare default samples
  };

  const handleUpdate = async (patternData, reset = false) => {
    setViewingPatternData(patternData);
    editorRef.current.setCode(patternData.code);
    if (reset) {
      await resetEditor();
      handleEvaluate();
    }
  };

  const handleEvaluate = () => {
    editorRef.current.evaluate();
  };
  const handleShuffle = async () => {
    const patternData = await getRandomTune();
    const code = patternData.code;
    logger(`[repl] ✨ loading random tune "${patternData.id}"`);
    setActivePattern(patternData.id);
    setViewingPatternData(patternData);
    await resetEditor();
    editorRef.current.setCode(code);
    editorRef.current.repl.evaluate(code);
  };

  const handleShare = async () => {
    let code = replState.code;
    if (includePrebakeScriptInShare) {
      code = prebakeScript + '\n' + code;
    }
    shareCode(code);
  };
  const context = {
    started,
    pending,
    isDirty,
    activeCode,
    handleTogglePlay,
    handleUpdate,
    handleShuffle,
    handleShare,
    handleEvaluate,
    init,
    error,
    editorRef,
    containerRef,
  };
  return context;
}
