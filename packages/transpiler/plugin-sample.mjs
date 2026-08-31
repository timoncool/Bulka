/*
plugin-sample.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdough.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { registerTranspilerPlugin } from './transpiler.mjs';

export function withAwait(node) {
  return {
    type: 'AwaitExpression',
    argument: node,
  };
}

const bareSample = {
  walk: (context) => ({
    enter: function (node, parent, prop, index) {
      if (!isBareSamplesCall(node, parent)) return;
      this.replace(withAwait(node));
    },
  }),
};

function isBareSamplesCall(node, parent) {
  return node.type === 'CallExpression' && node.callee.name === 'samples' && parent.type !== 'AwaitExpression';
}

registerTranspilerPlugin(bareSample);
