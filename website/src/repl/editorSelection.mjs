// Выделение в редакторе Bulka поверх StrudelMirror (его CodeMirror-вид — editor.editor).

export function getSelectedCode(editor) {
  const view = editor?.editor;
  if (!view) return null;
  const { from, to } = view.state.selection.main;
  return from === to ? null : view.state.sliceDoc(from, to);
}

export function selectText(editor, search) {
  const view = editor?.editor;
  if (!view || !search) return false;
  const index = view.state.doc.toString().indexOf(search);
  if (index === -1) return false;
  view.dispatch({ selection: { anchor: index, head: index + search.length }, scrollIntoView: true });
  view.focus();
  return true;
}
