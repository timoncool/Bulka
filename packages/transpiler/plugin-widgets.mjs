/*
plugin-widgets.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdough.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { registerTranspilerPlugin } from './transpiler.mjs';

let widgetMethods = [];
export function registerWidgetType(type) {
  widgetMethods.push(type);
}

const widgetTranspilerPlugin = {
  walk: (context) => ({
    enter: function (node, parent, prop, index) {
      if (!isWidgetMethod(node)) return;
      context.widgets ??= [];
      const { widgets, options } = context;
      const { emitWidgets } = options;
      const type = node.callee.property.name;
      const idx = widgets.filter((w) => w.type === type).length;
      const widgetConfig = {
        from: node.start,
        to: node.end,
        index: idx,
        type,
        id: options.id,
      };
      emitWidgets && widgets.push(widgetConfig);
      return this.replace(widgetWithLocation(node, widgetConfig));
    },
  }),
};

const sliderTranspilerPlugin = {
  walk: (context) => ({
    enter: function (node, parent, prop, index) {
      if (!isSliderFunction(node)) return;
      context.widgets ??= [];
      context.sliders ??= [];
      const { options, widgets, sliders } = context;
      const { emitWidgets } = options;
      const sliderConfig = {
        from: node.arguments[0].start,
        to: node.arguments[0].end,
        value: node.arguments[0].raw, // don't use value!
        min: node.arguments[1]?.value ?? 0,
        max: node.arguments[2]?.value ?? 1,
        step: node.arguments[3]?.value,
        type: 'slider',
      };
      emitWidgets && widgets.push(sliderConfig);
      sliders.push(sliderConfig);
      return this.replace(sliderWithLocation(node));
    },
  }),
};

export const widgetTranspilerPlugins = [sliderTranspilerPlugin, widgetTranspilerPlugin];

// these functions are connected to @strudel/codemirror -> slider.mjs
// maybe someday there will be pluggable transpiler functions, then move this there
function isSliderFunction(node) {
  return node.type === 'CallExpression' && node.callee.name === 'slider';
}

function isWidgetMethod(node) {
  return node.type === 'CallExpression' && widgetMethods.includes(node.callee.property?.name);
}

function sliderWithLocation(node) {
  const id = 'slider_' + node.arguments[0].start; // use loc of first arg for id

  // add loc as identifier to first argument
  // the sliderWithID function is assumed to be sliderWithID(id, value, min?, max?)
  node.arguments.unshift({
    type: 'Literal',
    value: id,
    raw: id,
  });
  node.callee.name = 'sliderWithID';
  return node;
}

export function getWidgetID(widgetConfig) {
  // the widget id is used as id for the dom element + as key for eventual resources
  // for example, for each scope widget, a new analyser + buffer (large) is created
  // that means, if we use the index index of line position as id, less garbage is generated
  // return `widget_${widgetConfig.to}`; // more gargabe
  //return `widget_${widgetConfig.index}_${widgetConfig.to}`; // also more garbage
  return `${widgetConfig.id || ''}_widget_${widgetConfig.type}_${widgetConfig.index}`; // less garbage
}

function widgetWithLocation(node, widgetConfig) {
  const id = getWidgetID(widgetConfig);
  // add loc as identifier to first argument
  // the sliderWithID function is assumed to be sliderWithID(id, value, min?, max?)
  node.arguments.unshift({
    type: 'Literal',
    value: id,
    raw: id,
  });
  return node;
}

registerTranspilerPlugin(widgetTranspilerPlugins);
