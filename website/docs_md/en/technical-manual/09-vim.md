---
title: Vim Shortcuts
layout: ../../layouts/MainLayout.astro
---

# Vim Shortcuts in the REPL

When the REPL editor (CodeMirror) is configured to use Vim keybindings, the following commands are available:

- :w — Evaluate the current code

  - Triggers the same evaluation as Ctrl+Enter / Alt+Enter
  - You'll see messages in the Console panel such as:
    - [vim] :w — evaluating code
    - [repl] evaluate via event
    - [eval] code updated

- :q — Stop/pause playback

  - Triggers the same stop action as Alt+.
  - Useful to quickly stop scheduling without leaving Vim mode

- gc — Toggle line comments for the current selection(s)

  - Works in normal and visual mode
  - If there's a selection, all selected lines are toggled

Notes

- Behavior respects the current language mode in the editor for comment syntax.
- If multiple REPL editors are open, commands target the active editor. The implementation dispatches custom events handled by the editor.
- If you don't see the Console panel, open the right panel in the REPL UI.

Troubleshooting

- If :w logs but evaluation doesn't apply, ensure Vim keybindings are active and try again. You can also use Ctrl+Enter as a fallback.
- For :q / gc, ensure focus is inside the editor. If an error occurs, reload the page to reset editor state and try again.
