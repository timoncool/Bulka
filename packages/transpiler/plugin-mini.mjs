/*
plugin-mini.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdough.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import { getLeafLocations } from '@strudel/mini';
import { getLanguages, registerTranspilerPlugin } from './transpiler.mjs';

const languageLiteral = {
  walk: (context) => ({
    enter: function (node, parent, prop, index) {
      if (!isLanguageLiteral(node)) return;
      context.miniLocations ??= [];
      const { options, miniLocations } = context;
      const { emitMiniLocations } = options;
      const { name } = node.tag;
      const language = getLanguages().get(name);
      const code = node.quasi.quasis[0].value.raw;
      const offset = node.quasi.start + 1;
      if (emitMiniLocations) {
        const locs = language.getLocations(code, offset);
        miniLocations.push(...locs);
      }
      this.skip();
      return this.replace(languageWithLocation(name, code, offset));
    },
  }),
};

const tidal = {
  walk: (context) => ({
    enter: function (node, parent, prop, index) {
      if (!isTemplateLiteral(node, 'tidal')) return;
      context.miniLocations ??= [];
      const { options, miniLocations } = context;
      const { emitMiniLocations } = options;
      const raw = node.quasi.quasis[0].value.raw;
      const offset = node.quasi.start + 1;
      if (emitMiniLocations) {
        const stringLocs = collectHaskellMiniLocations(raw, offset);
        miniLocations.push(...stringLocs);
      }
      this.skip();
      return this.replace(tidalWithLocation(raw, offset));
    },
  }),
};

const backtick = {
  walk: (context) => ({
    enter: function (node, parent, prop, index) {
      if (!isBackTickString(node, parent)) return;
      context.miniLocations ??= [];
      const { options, input, miniDisableRanges, miniLocations } = context;
      const { emitMiniLocations } = options;
      if (isMiniDisabled(node.start, miniDisableRanges)) {
        return;
      }
      const { quasis } = node;
      const { raw } = quasis[0].value;
      this.skip();
      emitMiniLocations && collectMiniLocations(raw, node, miniLocations, input);
      return this.replace(miniWithLocation(raw, node));
    },
  }),
};

const doublequotes = {
  walk: (context) => ({
    enter: function (node, parent, prop, index) {
      if (!isStringWithDoubleQuotes(node)) return;
      context.miniLocations ??= [];
      const { options, input, miniDisableRanges, miniLocations } = context;
      const { emitMiniLocations } = options;
      if (isMiniDisabled(node.start, miniDisableRanges)) {
        return;
      }
      const { value } = node;
      this.skip();
      emitMiniLocations && collectMiniLocations(value, node, miniLocations, input);
      return this.replace(miniWithLocation(value, node));
    },
  }),
};

function isLanguageLiteral(node) {
  return node.type === 'TaggedTemplateExpression' && getLanguages().has(node.tag.name);
}

function languageWithLocation(name, value, offset) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: name,
    },
    arguments: [
      { type: 'Literal', value },
      { type: 'Literal', value: offset },
    ],
    optional: false,
  };
}

function collectHaskellMiniLocations(haskellCode, offset) {
  return haskellCode
    .split('')
    .reduce((acc, char, i) => {
      if (char !== '"') {
        return acc;
      }
      if (!acc.length || acc[acc.length - 1].length > 1) {
        acc.push([i + 1]);
      } else {
        acc[acc.length - 1].push(i);
      }
      return acc;
    }, [])
    .map(([start, end]) => {
      const miniString = haskellCode.slice(start, end);
      return getLeafLocations(`"${miniString}"`, offset + start - 1);
    })
    .flat();
}

function isTemplateLiteral(node, value) {
  return node.type === 'TaggedTemplateExpression' && node.tag.name === value;
}

function tidalWithLocation(value, offset) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'tidal',
    },
    arguments: [
      { type: 'Literal', value },
      { type: 'Literal', value: offset },
    ],
    optional: false,
  };
}

function isBackTickString(node, parent) {
  return node.type === 'TemplateLiteral' && parent.type !== 'TaggedTemplateExpression';
}

function isMiniDisabled(offset, miniDisableRanges) {
  for (const [start, end] of miniDisableRanges) {
    if (offset >= start && offset < end) {
      return true;
    }
  }
  return false;
}

function miniWithLocation(value, node) {
  const { start: fromOffset } = node;

  const minilang = getLanguages().get('minilang');
  let name = 'm';
  if (minilang && minilang.name) {
    name = minilang.name; // name is expected to be exported from the package of the minilang
  }

  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name,
    },
    arguments: [
      { type: 'Literal', value },
      { type: 'Literal', value: fromOffset },
    ],
    optional: false,
  };
}

const collectMiniLocations = (value, node, miniLocations, input) => {
  const minilang = getLanguages().get('minilang');
  if (minilang) {
    const code = `[${value}]`;
    const locs = minilang.getLocations(code, node.start);
    miniLocations.push(...locs);
  } else {
    const leafLocs = getLeafLocations(`"${value}"`, node.start, input);
    miniLocations.push(...leafLocs);
  }
};

function isStringWithDoubleQuotes(node, locations, code) {
  if (node.type !== 'Literal') {
    return false;
  }
  return node.raw[0] === '"';
}

registerTranspilerPlugin([languageLiteral, tidal, backtick, doublequotes]);
