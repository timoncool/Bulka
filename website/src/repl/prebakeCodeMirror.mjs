import { toggleLineComment } from '@codemirror/commands';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import { drawSelection, EditorView, keymap } from '@codemirror/view';
import { logger } from '@strudel/core';
import { basicSetup, flash, initTheme, extensions, parseBooleans, codemirrorSettings } from '@strudel/codemirror';
import { evaluate } from '@strudel/transpiler';

export class PrebakeCodeMirror {
  constructor(initialCode, storePrebake, container) {
    const settings = codemirrorSettings.get();
    this.storePrebake = storePrebake;
    const compartments = Object.fromEntries(Object.keys(extensions).map((key) => [key, new Compartment()]));
    const initialSettings = Object.keys(compartments).map((key) =>
      compartments[key].of(extensions[key](parseBooleans(settings[key]))),
    );
    initTheme(settings.theme);
    let state = EditorState.create({
      doc: initialCode,
      extensions: [
        ...initialSettings,
        basicSetup,
        javascript(),
        javascriptLanguage.data.of({
          closeBrackets: { brackets: ['(', '[', '{', "'", '"', '<'] },
          bracketMatching: { brackets: ['(', '[', '{', "'", '"', '<'] },
        }),
        syntaxHighlighting(defaultHighlightStyle),
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            this.code = v.state.doc.toString();
          }
        }),
        drawSelection({ cursorBlinkRate: 0 }),
        Prec.highest(
          keymap.of([
            {
              mac: 'Meta-Enter',
              run: () => {
                this.savePrebake();
              },
            },
            {
              key: 'Ctrl-Enter',
              run: () => {
                this.savePrebake();
              },
            },
            {
              key: 'Alt-Enter',
              run: () => {
                this.savePrebake();
              },
            },
          ]),
        ),
      ],
    });

    this.code = initialCode;
    this.view = new EditorView({
      state,
      parent: container,
    });

    const handleSaveEvent = async (e) => {
      if (e.detail.view !== this.view) {
        return; // ignore events from other editors
      }
      await this.savePrebake();
      e?.cancelable && e.preventDefault?.();
    };
    const handleToggleComment = (e) => {
      if (e.detail.view !== this.view) {
        return; // ignore events from other editors
      }
      this.toggleComment();
      e?.cancelable && e.preventDefault?.();
    };

    document.addEventListener('repl-evaluate', handleSaveEvent);
    document.addEventListener('repl-toggle-comment', handleToggleComment);
    this.cleanup = () => {
      document.removeEventListener('prebake-evaluate', handleSaveEvent);
      document.removeEventListener('prebake-toggle-comment', handleToggleComment);
    };
  }

  async savePrebake() {
    flash(this.view);
    this.storePrebake(this.code);
    evaluate(this.code, { addReturn: false }); // run prebake
    logger('[prebake] prebake saved');
  }

  toggleComment() {
    try {
      // Honor selections; toggleLineComment handles both selections and
      // single line
      toggleLineComment(this.view);
    } catch (err) {
      console.error('Error handling repl-toggle-comment event', err);
    }
  }

  setCode(code) {
    const changes = {
      from: 0,
      to: this.view.state.doc.length,
      insert: code,
    };
    this.view.dispatch({ changes });
  }
}
