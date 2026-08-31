import { closeBrackets } from '@codemirror/autocomplete';
import { indentWithTab, toggleLineComment } from '@codemirror/commands';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { bracketMatching, defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { persistentAtom } from '@nanostores/persistent';
import { logger, registerControl, repl } from '@strudel/core';
import { cleanupDraw, cleanupDrawContext, Drawer } from '@strudel/draw';
import { isAutoCompletionEnabled } from './autocomplete.mjs';
import { basicSetup } from './basicSetup.mjs';
import { evalBlock } from './block_utilities.mjs';
import { flash, isFlashEnabled } from './flash.mjs';
import { highlightMiniLocations, isPatternHighlightingEnabled, updateMiniLocations } from './highlight.mjs';
import { keybindings } from './keybindings.mjs';
import { jumpToCharacter } from './labelJump.mjs';
import { getSliderWidgets, sliderPlugin, updateSliderWidgets } from './slider.mjs';
import { activateTheme, initTheme, theme } from './themes.mjs';
import { isTooltipEnabled } from './tooltip.mjs';
import { getActiveWidgets, updateWidgets, widgetPlugin } from './widget.mjs';

export { toggleBlockComment, toggleBlockCommentByLine, toggleComment, toggleLineComment } from '@codemirror/commands';

export const extensions = {
  isLineWrappingEnabled: (on) => (on ? EditorView.lineWrapping : []),
  isBracketMatchingEnabled: (on) => (on ? bracketMatching({ brackets: '()[]{}<>' }) : []),
  isBracketClosingEnabled: (on) => (on ? closeBrackets() : []),
  isLineNumbersDisplayed: (on) => (on ? lineNumbers() : []),
  theme,
  isAutoCompletionEnabled,
  isTooltipEnabled,
  isPatternHighlightingEnabled,
  isActiveLineHighlighted: (on) => (on ? [highlightActiveLine(), highlightActiveLineGutter()] : []),
  isFlashEnabled,
  keybindings,
  isTabIndentationEnabled: (on) => (on ? keymap.of([indentWithTab]) : []),
  isMultiCursorEnabled: (on) =>
    on
      ? [
          EditorState.allowMultipleSelections.of(true),
          EditorView.clickAddsSelectionRange.of((ev) => ev.metaKey || ev.ctrlKey),
        ]
      : [],
};
export const compartments = Object.fromEntries(Object.keys(extensions).map((key) => [key, new Compartment()]));

export const defaultSettings = {
  keybindings: 'codemirror',
  isBracketMatchingEnabled: false,
  isBracketClosingEnabled: true,
  isLineNumbersDisplayed: true,
  isActiveLineHighlighted: false,
  isAutoCompletionEnabled: false,
  isPatternHighlightingEnabled: true,
  isFlashEnabled: true,
  isTooltipEnabled: false,
  isLineWrappingEnabled: false,
  isTabIndentationEnabled: false,
  isMultiCursorEnabled: false,
  isBlockBasedEvalEnabled: false,
  theme: 'strudelTheme',
  fontFamily: 'monospace',
  fontSize: 18,
};

export const codemirrorSettings = persistentAtom('codemirror-settings', defaultSettings, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// https://codemirror.net/docs/guide/
export function initEditor({ initialCode = '', onChange, onEvaluate, onStop, root, mondo, strudelMirror }) {
  const settings = codemirrorSettings.get();
  const initialSettings = Object.keys(compartments).map((key) =>
    compartments[key].of(extensions[key](parseBooleans(settings[key]))),
  );

  initTheme(settings.theme);
  let state = EditorState.create({
    doc: initialCode,
    extensions: [
      /* search(),
      highlightSelectionMatches(), */
      ...initialSettings,
      basicSetup,
      mondo ? [] : javascript(),
      javascriptLanguage.data.of({
        closeBrackets: { brackets: ['(', '[', '{', "'", '"', '<'] },
        bracketMatching: { brackets: ['(', '[', '{', "'", '"', '<'] },
      }),
      sliderPlugin,
      widgetPlugin,
      // indentOnInput(), // works without. already brought with javascript
      // extension? bracketMatching(), // does not do anything
      syntaxHighlighting(defaultHighlightStyle),
      EditorView.updateListener.of((v) => onChange(v)),
      drawSelection({ cursorBlinkRate: 0 }),
      Prec.highest(
        keymap.of([
          {
            key: 'Ctrl-Enter',
            run: () => {
              // issue with referencing settings, this works more reliably
              if (strudelMirror?.isBlockBasedEvalEnabled) {
                evalBlock(strudelMirror);
                return true;
              } else {
                return onEvaluate?.();
              }
            },
          },
          {
            key: 'Alt-Enter',
            run: () => {
              if (strudelMirror?.isBlockBasedEvalEnabled) {
                evalBlock(strudelMirror);
                return true;
              } else {
                return onEvaluate?.();
              }
            },
          },
          {
            key: 'Ctrl-.',
            run: () => onStop?.(),
          },
          {
            key: 'Alt-.',
            preventDefault: true,
            run: () => onStop?.(),
          },
          {
            key: 'Alt-w',
            run: (view) => jumpToCharacter(view, '$', 1),
          },
          {
            key: 'Alt-q',
            run: (view) => jumpToCharacter(view, '$', -1),
          },
          /* {
            key: 'Ctrl-Shift-.',
            run: () => (onPanic ? onPanic() : onStop?.()),
          },
          {
            key: 'Ctrl-Shift-Enter',
            run: () => (onReEvaluate ? onReEvaluate() : onEvaluate?.()),
          }, */
        ]),
      ),
    ],
  });

  return new EditorView({
    state,
    parent: root,
  });
}

export class StrudelMirror {
  constructor(options) {
    const {
      root,
      id,
      initialCode = '',
      onDraw,
      drawContext,
      drawTime = [0, 0],
      autodraw,
      prebake,
      bgFill = true,
      solo = true,
      ...replOptions
    } = options;
    this.code = initialCode;
    this.root = root;
    this.miniLocations = [];
    this.widgets = [];
    this.drawTime = drawTime;
    this.drawContext = drawContext;
    this.onDraw = onDraw || this.draw;
    this.id = id || s4();
    this.solo = solo;
    this.isBlockBasedEvalEnabled = false; // Will be updated via updateSettings()

    this.drawer = new Drawer((haps, time, _, painters) => {
      const currentFrame = haps.filter((hap) => hap.isActive(time));
      this.highlight(currentFrame, time);
      this.onDraw(haps, time, painters);
    }, drawTime);

    this.prebaked = prebake();
    autodraw && this.drawFirstFrame();
    this.repl = repl({
      ...replOptions,
      id,
      onToggle: (started) => {
        replOptions?.onToggle?.(started);
        if (started) {
          this.drawer.start(this.repl.scheduler);
          if (this.solo) {
            // stop other repls when this one is started
            document.dispatchEvent(
              new CustomEvent('start-repl', {
                detail: this.id,
              }),
            );
          }
        } else {
          this.drawer.stop();
          updateMiniLocations(this.editor, []);
          cleanupDraw(true, id);
        }
      },
      beforeEval: async ({ blockBased } = {}) => {
        // Only clean up all drawings for full evaluation
        // Block-based eval should preserve animations (like .scope()) from other blocks
        if (!blockBased) {
          cleanupDraw(true, id);
        }
        await this.prebaked;
        await replOptions?.beforeEval?.();
      },
      afterEval: (options) => {
        // remember for when highlighting is toggled on
        this.miniLocations = options.meta?.miniLocations || [];
        this.widgets = options.meta?.widgets || [];

        const sliders = this.widgets.filter((w) => w.type === 'slider');
        const widgets = this.widgets.filter((w) => w.type !== 'slider');
        // range-aware update for block-based evaluation
        const range = options.range && options.range.length >= 2 ? options.range : null;

        updateSliderWidgets(this.editor, sliders, range);
        updateWidgets(this.editor, widgets, range);
        updateMiniLocations(this.editor, this.miniLocations, range);
        replOptions?.afterEval?.(options);
        // if no painters are set (.onPaint was not called), then we only need
        // the present moment (for highlighting)
        const drawTime = options.pattern.getPainters().length ? this.drawTime : [0, 0];
        this.drawer.setDrawTime(drawTime);
        // invalidate drawer after we've set the appropriate drawTime
        this.drawer.invalidate(this.repl.scheduler);

        // Clean up draw context if a non-inline widget was removed
        if (options.widgetRemoved) {
          cleanupDrawContext(id);
        }
      },
    });
    this.cleanupDrawContext = () => cleanupDrawContext(id);
    this.editor = initEditor({
      root,
      initialCode,
      onChange: (v) => {
        if (v.docChanged) {
          this.code = v.state.doc.toString();
          this.repl.setCode?.(this.code);
        }
      },
      onEvaluate: () => this.evaluate(),
      onStop: () => this.stop(),
      mondo: replOptions.mondo,
      strudelMirror: this,
    });

    const cmEditor = this.root.querySelector('.cm-editor');
    if (cmEditor) {
      this.root.style.display = 'block';
      if (bgFill) {
        this.root.style.backgroundColor = 'var(--background)';
      }
      cmEditor.style.backgroundColor = 'transparent';
    }
    const settings = codemirrorSettings.get();
    this.setFontSize(settings.fontSize);
    this.setFontFamily(settings.fontFamily);

    // stop this repl when another repl is started
    this.onStartRepl = (e) => {
      if (this.solo && e.detail !== this.id) {
        this.stop();
      }
    };
    document.addEventListener('start-repl', this.onStartRepl);

    // Handle global evaluation requests (e.g., from Vim :w)
    this.onEvaluateRequest = (e) => {
      try {
        if (e.detail.view !== this.editor) {
          return; // ignore events from other editors
        }
        // Evaluate current editor on repl-evaluate
        logger('[repl] evaluate via event');
        this.evaluate();
        e?.cancelable && e.preventDefault?.();
      } catch (err) {
        console.error('Error handling repl-evaluate event', err);
      }
    };
    document.addEventListener('repl-evaluate', this.onEvaluateRequest);
    document.addEventListener('repl-stop', this.onStopRequest);

    // Toggle comments requested from Vim (gc)
    this.onToggleComment = (e) => {
      try {
        if (e.detail.view !== this.editor) {
          return; // ignore events from other editors
        }
        // Honor selections; toggleLineComment handles both selections and
        // single line
        toggleLineComment(this.editor);
        e?.cancelable && e.preventDefault?.();
      } catch (err) {
        console.error('Error handling repl-toggle-comment event', err);
      }
    };
    document.addEventListener('repl-toggle-comment', this.onToggleComment);
  }
  draw(haps, time, painters) {
    painters?.forEach((painter) => painter(this.drawContext, time, haps, this.drawTime));
  }
  async drawFirstFrame() {
    if (!this.onDraw) {
      return;
    }
    // draw first frame instantly
    await this.prebaked;
    try {
      await this.repl.evaluate(this.code, false);
      this.drawer.invalidate(this.repl.scheduler, -0.001);
      // draw at -0.001 to avoid haps at 0 to be visualized as active
      this.onDraw?.(this.drawer.visibleHaps, -0.001, this.drawer.painters);
    } catch (err) {
      console.warn('first frame could not be painted');
    }
  }
  async evaluate(autostart = true) {
    this.flash();
    await this.repl.evaluate(this.code, autostart);
  }

  async stop() {
    this.repl.stop();
  }

  // Listen for global stop requests (e.g., from Vim :q)
  onStopRequest = (e) => {
    try {
      if (e.detail.view !== this.editor) {
        return; // ignore events from other editors
      }
      this.stop();
      e?.cancelable && e.preventDefault?.();
    } catch (err) {
      console.error('Error handling repl-stop event', err);
    }
  };
  async toggle() {
    if (this.repl.scheduler.started) {
      this.repl.stop();
    } else {
      this.evaluate();
    }
  }
  flash(ms, range) {
    flash(this.editor, ms, range);
  }
  highlight(haps, time) {
    highlightMiniLocations(this.editor, time, haps);
  }
  setFontSize(size) {
    this.root.style.fontSize = size + 'px';
  }
  setFontFamily(family) {
    this.root.style.fontFamily = family;
    const scroller = this.root.querySelector('.cm-scroller');
    if (scroller) {
      scroller.style.fontFamily = family;
    }
  }
  reconfigureExtension(key, value) {
    if (!extensions[key]) {
      console.warn(`extension ${key} is not known`);
      return;
    }
    value = parseBooleans(value);
    const newValue = extensions[key](value, this);
    this.editor.dispatch({
      effects: compartments[key].reconfigure(newValue),
    });
    if (key === 'theme') {
      activateTheme(value);
    }
  }
  setLineWrappingEnabled(enabled) {
    this.reconfigureExtension('isLineWrappingEnabled', enabled);
  }

  setBlockBasedEvalEnabled(enabled) {
    this.reconfigureExtension('isBlockBasedEvalEnabled', enabled);
  }
  setBracketMatchingEnabled(enabled) {
    this.reconfigureExtension('isBracketMatchingEnabled', enabled);
  }
  setLineNumbersDisplayed(enabled) {
    this.reconfigureExtension('isLineNumbersDisplayed', enabled);
  }
  setBracketClosingEnabled(enabled) {
    this.reconfigureExtension('isBracketClosingEnabled', enabled);
  }
  setTheme(theme) {
    this.reconfigureExtension('theme', theme);
  }
  setAutocompletionEnabled(enabled) {
    this.reconfigureExtension('isAutoCompletionEnabled', enabled);
  }
  updateSettings(settings) {
    this.setFontSize(settings.fontSize);
    this.setFontFamily(settings.fontFamily);
    for (let key in extensions) {
      this.reconfigureExtension(key, settings[key]);
    }
    // Update block-based eval setting on the instance
    if (settings.isBlockBasedEvalEnabled !== undefined) {
      this.isBlockBasedEvalEnabled = parseBooleans(settings.isBlockBasedEvalEnabled);
    }
    const updated = { ...codemirrorSettings.get(), ...settings };
    codemirrorSettings.set(updated);
  }
  changeSetting(key, value) {
    if (extensions[key]) {
      this.reconfigureExtension(key, value);
      return;
    } else if (key === 'fontFamily') {
      this.setFontFamily(value);
    } else if (key === 'fontSize') {
      this.setFontSize(value);
    }
  }
  replaceCode(code, from, to) {
    const changes = { from, to, insert: code };
    this.editor.dispatch({ changes });
  }
  insertCode(code, position) {
    this.replaceCode(code, position, position);
  }
  setCode(code) {
    this.replaceCode(code, 0, this.editor.state.doc.length);
  }
  // used for debugging but could serve other purposes
  getActiveWidgets() {
    return getActiveWidgets(this.editor);
  }
  getSliderWidgets() {
    return getSliderWidgets(this.editor);
  }
  getMiniLocations() {
    return this.miniLocations;
  }
  clear() {
    this.onStartRepl && document.removeEventListener('start-repl', this.onStartRepl);
    this.onEvaluateRequest && document.removeEventListener('repl-evaluate', this.onEvaluateRequest);
    this.onStopRequest && document.removeEventListener('repl-stop', this.onStopRequest);
    this.onToggleComment && document.removeEventListener('repl-toggle-comment', this.onToggleComment);
  }
  getCursorLocation() {
    return this.editor.state.selection.main.head;
  }
  setCursorLocation(col) {
    return this.editor.dispatch({ selection: { anchor: col } });
  }
  appendCode(code) {
    const cursor = this.getCursorLocation();
    this.setCode(this.code + code);
    this.setCursorLocation(cursor);
  }
}

export function parseBooleans(value) {
  return { true: true, false: false }[value] ?? value;
}

// helper function to generate repl ids
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

/**
 * Overrides the css of highlighted events. Make sure to use single quotes!
 * @name markcss
 * @tag visualization
 * @example
 * note("c a f e")
 * .markcss('text-decoration:underline')
 */
export const markcss = registerControl('markcss');
