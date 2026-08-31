/*
drawLine.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/core/drawLine.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Fraction, { gcd } from './fraction.mjs';

/**
 * Предназначена для отладки, drawLine рендерит pattern как строку, где каждый символ представляет одинаковый отрезок времени.
 * Следует использовать только с одиночными символами в качестве значений, иначе символьные слоты будут испорчены.
 * Легенда символов:
 *
 * - "|" разделитель cycle
 * - "-" удержание предыдущего значения
 * - "." silence
 *
 * @param {Pattern} pattern pattern для использования
 * @param {number} chars максимальное количество символов (приблизительно)
 * @returns string
 * @example
 * const line = drawLine("0 [1 2 3]", 10); // |0--123|0--123
 * console.log(line);
 * silence;
 */
function drawLine(pat, chars = 60) {
  let cycle = 0;
  let pos = Fraction(0);
  let lines = [''];
  let emptyLine = ''; // this will be the "reference" empty line, which will be copied into extra lines
  while (lines[0].length < chars) {
    const haps = pat.queryArc(cycle, cycle + 1);
    const durations = haps.filter((hap) => hap.hasOnset()).map((hap) => hap.duration);
    const charFraction = gcd(...durations);
    const totalSlots = charFraction.inverse(); // number of character slots for the current cycle
    lines = lines.map((line) => line + '|'); // add pipe character before each cycle
    emptyLine += '|';
    for (let i = 0; i < totalSlots; i++) {
      const [begin, end] = [pos, pos.add(charFraction)];
      const matches = haps.filter((hap) => hap.whole.begin.lte(begin) && hap.whole.end.gte(end));
      const missingLines = matches.length - lines.length;
      if (missingLines > 0) {
        lines = lines.concat(Array(missingLines).fill(emptyLine));
      }
      lines = lines.map((line, i) => {
        const hap = matches[i];
        if (hap) {
          const isOnset = hap.whole.begin.eq(begin);
          const char = isOnset ? '' + hap.value : '-';
          return line + char;
        }
        return line + '.';
      });
      emptyLine += '.';
      pos = pos.add(charFraction);
    }
    cycle++;
  }
  return lines.join('\n');
}

export default drawLine;
