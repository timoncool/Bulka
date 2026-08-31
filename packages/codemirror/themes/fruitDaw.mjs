/*
 * Fruit Daw
 * made by Jade
 */
import { tags as t } from '@lezer/highlight';
import { createTheme } from './theme-helper.mjs';

const hex = [
  'rgb(84, 93, 98)',
  'rgb(255, 255, 255)',
  'rgba(255, 255, 255, .25)',
  'rgb(67, 76, 81)',
  'rgb(186, 230, 115)',
  'rgb(252, 184, 67)',
  'rgb(124, 206, 254)',
  'rgb(83, 101, 102)',
  'rgba(46, 62, 72,.5)',
  'rgb(94, 100, 108)',
  'rgb(167, 216, 177)',
];

export const settings = {
  background: hex[0],
  lineBackground: 'transparent',
  foreground: hex[10],
  muted: hex[7],
  selection: hex[8],
  selectionMatch: hex[0],
  gutterBackground: hex[3],
  gutterForeground: hex[2],
  gutterBorder: 'transparent',
  lineHighlight: hex[3],
};

export default createTheme({
  theme: 'dark',
  settings,
  styles: [
    {
      tag: [t.function(t.variableName), t.function(t.propertyName), t.url, t.processingInstruction],
      color: hex[1],
    },
    { tag: [t.bool, t.special(t.variableName)], color: hex[1] },
    { tag: [t.comment, t.brace, t.bracket], color: hex[2] },
    { tag: [t.variableName], color: hex[1] },
    { tag: [t.labelName, t.propertyName, t.self, t.atom], color: hex[5] },
    { tag: [t.attributeName, t.number], color: hex[6] },
    { tag: t.keyword, color: hex[5] },
    { tag: [t.string, t.regexp, t.special(t.propertyName)], color: hex[4] },
  ],
});
