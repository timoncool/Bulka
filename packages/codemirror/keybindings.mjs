import { defaultKeymap } from '@codemirror/commands';
import { Prec, EditorState } from '@codemirror/state';
import { keymap, ViewPlugin } from '@codemirror/view';
// import { searchKeymap } from '@codemirror/search';
import { emacs } from '@replit/codemirror-emacs';
import { vim } from '@replit/codemirror-vim';
// import { vim } from './vim_test.mjs';
import { vscodeKeymap } from '@replit/codemirror-vscode-keymap';

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

const keymaps = {
  vim,
  emacs,
  codemirror: () => keymap.of(defaultKeymap),
  vscode: vscodeExtension,
};

export { Vim } from '@replit/codemirror-vim';

export function keybindings(name) {
  const active = keymaps[name];
  const extensions = active ? [Prec.high(active())] : [];
  if (name === 'vim') {
    extensions.push(EditorState.allowMultipleSelections.of(true));
  }
  return extensions;
}
