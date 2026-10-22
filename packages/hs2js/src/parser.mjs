import Parser from 'web-tree-sitter';
import treeSitterWasm from 'web-tree-sitter/tree-sitter.wasm?url';
import grammarWasm from 'tree-sitter-haskell/tree-sitter-haskell.wasm?url';

let base;
export function setBase(path) {
  base = path;
}

let isReady = false,
  parser;
async function _loadParser() {
  await Parser.init({
    locateFile(scriptName, scriptDirectory) {
      if (base) {
        return `${base}${scriptName}`;
      }
      return treeSitterWasm;
    },
  });
  parser = new Parser();
  let grammarUrl = base ? `${base}tree-sitter-haskell.wasm` : grammarWasm;
  const Lang = await Parser.Language.load(grammarUrl);
  parser.setLanguage(Lang);
  isReady = true;
  return parser;
}

let parserLoaded;
export function loadParser() {
  if (!parserLoaded) {
    parserLoaded = _loadParser();
  }
  return parserLoaded;
}

export function parse(code) {
  if (!isReady) {
    throw new Error('hs2js not ready. await loadParser before calling evaluate or parse functions');
  }
  // for some reason, the parser doesn't like new lines..
  return parser.parse(code.replaceAll('\n\n', '~~~~').replaceAll('\n', ' ').replaceAll('~~~~', ' \n'));
}
