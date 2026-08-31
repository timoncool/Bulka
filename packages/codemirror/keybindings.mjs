import { defaultKeymap } from '@codemirror/commands';
import { Prec } from '@codemirror/state';
import { keymap, ViewPlugin } from '@codemirror/view';
// import { searchKeymap } from '@codemirror/search';
import { emacs } from '@replit/codemirror-emacs';
import { vim, Vim } from '@replit/codemirror-vim';
// import { vim } from './vim_test.mjs';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';
import { logger } from '@strudel/core';

const vscodePlugin = ViewPlugin.fromClass(
  class {
    constructor() {}
  },
  {
    provide: () => {
      return Prec.highest(keymap.of([...vscodeKeymap]));
    },
  },
);
const vscodeExtension = (options) => [vscodePlugin].concat(options ?? []);

// Map Vim :w to trigger the same action as evaluation. We dispatch a custom
// event 'repl-evaluate' that the editor listens for, and also simulate
// Ctrl+Enter/Alt+Enter as a fallback. We log to the Strudel logger so it
// appears in the Console panel.
try {
  if (Vim && typeof Vim.defineEx === 'function') {
    // Map gc to toggle line comments by dispatching a custom event that our
    // CodeMirror integration listens to. This avoids depending on Vim's
    // internal actions and works with current selections/visual mode.
    try {
      Vim.defineAction('strudelToggleComment', (cm) => {
        const view = cm?.view || cm;
        try {
          const ev = new CustomEvent('repl-toggle-comment', { detail: { source: 'vim', view }, cancelable: true });
          document.dispatchEvent(ev);
        } catch (e) {
          console.error('strudelToggleComment dispatch failed', e);
        }
      });
      Vim.mapCommand('gc', 'action', 'strudelToggleComment', {}, { context: 'normal' });
      Vim.mapCommand('gc', 'action', 'strudelToggleComment', {}, { context: 'visual' });
    } catch (e) {
      console.error('Vim gc mapping failed', e);
    }

    // :q to pause/stop
    Vim.defineEx('quit', 'q', (cm) => {
      try {
        const view = cm?.view || cm;
        // First try dispatching our custom stop event, then fallback to Alt+.
        let handled = false;
        try {
          const ev = new CustomEvent('repl-stop', { detail: { source: 'vim', view }, cancelable: true });
          handled = document.dispatchEvent(ev) === false;
        } catch (e) {
          console.error('Error dispatching repl-stop event', e);
        }
        if (!handled) {
          const altDot = new KeyboardEvent('keydown', {
            key: '.',
            code: 'Period',
            altKey: true,
            bubbles: true,
            cancelable: true,
          });
          view?.dom?.dispatchEvent?.(altDot);
        }
      } catch (e) {
        console.error('Error dispatching :q stop event', e);
      }
    });

    // :w to evaluate
    Vim.defineEx('write', 'w', (cm) => {
      const view = cm?.view || cm; // CM6 Vim passes either an object with view or the view itself
      try {
        view?.focus?.();
        // Let the app know this came from Vim :w
        try {
          logger('[vim] :w — evaluating code');
        } catch (e) {
          console.error('Error logging Vim :w evaluation', e);
        }
        // Dispatch a dedicated evaluate event first
        let handled = false;
        try {
          const ev = new CustomEvent('repl-evaluate', { detail: { source: 'vim', view }, cancelable: true });
          handled = document.dispatchEvent(ev) === false; // false means preventDefault was called
        } catch (e) {
          console.error('Error dispatching repl-evaluate event', e);
        }
        if (handled) {
          return;
        }
        // Try Ctrl+Enter first if not handled by custom event
        const ctrlEnter = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        view?.dom?.dispatchEvent?.(ctrlEnter);
        // If not handled (no handler called preventDefault), try Alt+Enter as
        // fallback
        if (!ctrlEnter.defaultPrevented) {
          const altEnter = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            altKey: true,
            bubbles: true,
            cancelable: true,
          });
          view?.dom?.dispatchEvent?.(altEnter);
        }
      } catch (e) {
        console.error('Error dispatching :w evaluation event', e);
      }
    });
  }
} catch (e) {
  console.error('Vim ex command setup failed (defineEx missing or Vim unavailable)', e);
}

const keymaps = {
  vim,
  emacs,
  codemirror: () => keymap.of(defaultKeymap),
  vscode: vscodeExtension,
};

export function keybindings(name) {
  const active = keymaps[name];
  return [active ? Prec.high(active()) : []];
}
