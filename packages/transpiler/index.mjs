/*
index.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdough.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import { evaluate as _evaluate } from '@strudel/core';
import { transpiler } from './transpiler.mjs';

export * from './transpiler.mjs';

import './plugin-kabelsalat.mjs';
import './plugin-mini.mjs';
import './plugin-sample.mjs';
import './plugin-widgets.mjs';

export { registerWidgetType, getWidgetID } from './plugin-widgets.mjs';
export const evaluate = (code, transpilerOptions) => _evaluate(code, transpiler, transpilerOptions);
