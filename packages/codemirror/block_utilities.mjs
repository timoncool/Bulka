// Block-based evaluation utilities

export function getBlockRegions(code) {
  const chars = code.split('');
  let i = 0,
    blanks = [],
    blockStart = 0,
    regions = [];
  while (i < chars.length) {
    const isBlank = chars[i] === '\n';
    if (isBlank) {
      blanks.push(i);
    } else if (chars[i].trim() !== '') {
      if (blanks.length > 1) {
        regions.push([blockStart, blanks[0]]);
        blockStart = i;
      }
      blanks = [];
    }
    i++;
  }
  regions.push([blockStart, blanks.length ? blanks[0] : i]);
  return regions;
}

export function getBlockAt(code, cursor) {
  const regions = getBlockRegions(code);
  for (const [start, end] of regions) {
    if (cursor >= start && cursor <= end) {
      return [start, end];
    }
  }
  return null;
}

export const evalBlock = (strudelMirror) => {
  const { state } = strudelMirror.editor;
  const code = state.doc.toString();
  const cursor = state.selection.main.head;
  const range = getBlockAt(code, cursor);
  if (range) {
    const [a, b] = range;
    const block = code.slice(a, b);
    if (block) {
      // Flash the block being evaluated
      strudelMirror.flash(200, { from: a, to: b });
      strudelMirror.repl.evaluateBlock(block, true, { range });
    }
  }
  return true;
};
