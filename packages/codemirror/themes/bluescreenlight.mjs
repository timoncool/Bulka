/*
 * A lighter blue screen theme
 * made by Jade
 */
import { tags as t } from '@lezer/highlight';
import { createTheme } from './theme-helper.mjs';

const hex = ['rgb(75, 130, 247)', 'rgb(47, 108, 246)', 'rgb(255, 255, 255)', 'rgba(255, 255, 255,.3)'];

export const settings = {
  background: hex[0],
  lineBackground: 'transparent',
  foreground: hex[2],
  selection: hex[3],
  selectionMatch: hex[0],
  gutterBackground: hex[0],
  gutterForeground: hex[2],
  gutterBorder: 'transparent',
  lineHighlight: hex[1],
};

export default createTheme({
  theme: 'dark',
  settings,
  styles: [
    {
      tag: [t.function(t.variableName), t.function(t.propertyName), t.url, t.processingInstruction],
      color: hex[2],
    },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: hex[2] },
    { tag: [t.comment, t.bracket, t.brace, t.compareOperator], color: hex[3] },
    { tag: [t.variableName, t.propertyName, t.labelName], color: hex[2] },
    { tag: [t.attributeName, t.number], color: hex[2] },
    { tag: t.keyword, color: hex[2] },
    { tag: [t.string, t.regexp, t.special(t.propertyName)], color: hex[2] },
  ],
});
