import { EditorSelection } from '@codemirror/state';
import { SearchCursor } from '@codemirror/search';

export function jumpToCharacter(view, character, direction = 1) {
  const { state, dispatch } = view;
  const pos = state.selection.main.head;
  const cursor = new SearchCursor(state.doc, character);

  let characterPositions = [];
  let jumpPos;
  while (!cursor.next().done) {
    characterPositions.push(cursor.value.to);
  }
  if (!characterPositions.length) {
    return false;
  }
  if (direction > 0) {
    jumpPos = characterPositions.find((x) => x > pos + 1) ?? characterPositions.at(0); // Loop back around for convenience
  } else {
    jumpPos = characterPositions.reverse().find((x) => x < pos + 1) ?? characterPositions.at(0);
  }

  if (jumpPos == null) {
    return false;
  }
  dispatch({
    selection: EditorSelection.cursor(jumpPos - 1),
    scrollIntoView: true,
  });
  return true;
}
