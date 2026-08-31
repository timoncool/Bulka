/*
transpiler.mjs - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/superdough.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import { parse } from 'acorn';
import escodegen from 'escodegen';
import { walk } from 'estree-walker';

let languages = new Map();
// config = { getLocations: (code: string, offset?: number) => number[][] }
// see mondough.mjs for example use
// the language will kick in when the code contains a template literal of type
// example: mondo`...` will use language of type "mondo"
// TODO: refactor tidal.mjs to use this
export function registerLanguage(type, config) {
  languages.set(type, config);
}
export function getLanguages() {
  return languages;
}

const plugins = [];

export function registerTranspilerPlugin(plugin) {
  plugins.push(plugin);
}
export function getPlugins() {
  return plugins.flat(Infinity);
}

export function transpiler(input, options = {}) {
  options = {
    wrapAsync: false,
    addReturn: true,
    emitMiniLocations: true,
    emitWidgets: true,
    blockBased: false,
    range: [],
    ...options,
  };

  const { wrapAsync, addReturn, emitMiniLocations, emitWidgets, blockBased, range } = options;

  const comments = [];
  let ast = parse(input, {
    ecmaVersion: 2022,
    allowAwaitOutsideFunction: true,
    locations: true,
    onComment: comments,
  });

  let miniDisableRanges = findMiniDisableRanges(comments, input.length);

  // Position offset for block-based evaluation
  let nodeOffset = range && range.length > 0 ? range[0] : 0;

  // Track declarations to add to strudelScope for block-based eval
  let scopeDeclarations = [];

  let labels = [];

  const context = { options, input, nodeOffset, miniDisableRanges, labels };
  const plugins = getPlugins().map((plugin) => plugin.walk?.(context));

  walk(ast, {
    enter(node, parent, prop, index) {
      // Apply position offset for block-based evaluation
      if (blockBased && node.start !== undefined) {
        node.start = node.start + nodeOffset;
        node.end = node.end + nodeOffset;
      }
      // Collect variable and function declarations for strudelScope (block-based eval)
      if (blockBased && parent?.type === 'Program') {
        if (node.type === 'VariableDeclaration') {
          for (const declarator of node.declarations) {
            if (declarator.id?.name) {
              scopeDeclarations.push(declarator.id.name);
            }
          }
        } else if (node.type === 'FunctionDeclaration' && node.id?.name) {
          scopeDeclarations.push(node.id.name);
        }
      }

      for (const plugin of plugins) {
        if (!plugin?.enter?.call(this, node, parent, prop, index)) continue;
        return;
      }

      if (isLabelStatement(node)) {
        // Collect label info for block-based evaluation
        // Store positions WITHOUT offset so repl can slice the transpiler output correctly
        if (blockBased) {
          labels.push({
            name: node.label.name,
            index: node.start - nodeOffset,
            end: node.label.end - nodeOffset,
            fullMatch: input.slice(node.start - nodeOffset, node.label.end - nodeOffset),
            activeVisualizer: findVisualizerInSubtree(node.body),
          });
        }
        return this.replace(labelToP(node));
      }
      // Detect all() calls as special labels for block management
      // Store positions WITHOUT offset so repl can slice the transpiler output correctly
      if (blockBased && isAllCall(node)) {
        labels.push({
          name: 'all',
          index: node.start - nodeOffset,
          end: node.end - nodeOffset,
          fullMatch: input.slice(node.start - nodeOffset, node.end - nodeOffset),
          activeVisualizer: node.arguments[0] ? findVisualizerInSubtree(node.arguments[0]) : null,
        });
      }
    },

    leave(node, parent, prop, index) {
      for (const plugin of plugins) {
        if (!plugin?.leave?.call(this, node, parent, prop, index)) continue;
        return;
      }
    },
  });

  let { body } = ast;

  const silenceExpression = {
    type: 'ExpressionStatement',
    expression: {
      type: 'Identifier',
      name: 'silence',
    },
  };

  if (!body.length) {
    console.warn('empty body -> fallback to silence');
    body.push(silenceExpression);
  } else if (!body?.[body.length - 1]?.expression) {
    // Last statement is not an expression (e.g., VariableDeclaration, FunctionDeclaration)
    body.push(silenceExpression);
  }

  // For block-based eval, add scope assignments before the return statement
  // This allows variables/functions defined in one block to be used in other blocks
  if (blockBased && scopeDeclarations.length > 0) {
    const scopeAssignments = scopeDeclarations.flatMap((name) => createScopeAssignment(name));
    // Insert scope assignments before the last statement (which will become the return)
    body.splice(body.length - 1, 0, ...scopeAssignments);
  }

  // add return to last statement
  if (addReturn) {
    const { expression } = body[body.length - 1];
    body[body.length - 1] = {
      type: 'ReturnStatement',
      argument: expression,
    };
  }
  let output = escodegen.generate(ast);
  if (wrapAsync) {
    output = `(async ()=>{${output}})()`;
  }
  if (!emitMiniLocations) {
    return { output };
  }

  let pluginContext;
  ({ options, input, miniDisableRanges, nodeOffset, ...pluginContext } = context);

  return { output, ...pluginContext };
}

function isAllCall(node) {
  return node.type === 'CallExpression' && node.callee.name === 'all';
}

function isLabelStatement(node) {
  return node.type === 'LabeledStatement';
}

// converts label expressions to p calls: "x: y" to "y.p('x')"
// see https://codeberg.org/uzu/strudel/issues/990
function labelToP(node) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: node.body.expression,
        property: {
          type: 'Identifier',
          name: 'p',
        },
      },
      arguments: [
        {
          type: 'Literal',
          value: node.label.name,
          raw: `'${node.label.name}'`,
        },
      ],
    },
  };
}

// List of non-inline widgets that need cleanup
// These are Pattern.prototype methods that create persistent visualizations
// (should be repalced by a function call producing an actual list of registered widgets)
const nonInlineWidgets = ['punchcard', 'spiral', 'scope', 'pitchwheel', 'spectrum', 'pianoroll', 'wordfall'];

function isVisualizerCall(node) {
  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    nonInlineWidgets.includes(node.callee.property?.name)
  ) {
    return node.callee.property.name;
  }
  return null;
}

function findVisualizerInSubtree(node) {
  if (!node || typeof node !== 'object') return null;

  // Check if this node is a visualizer call
  const viz = isVisualizerCall(node);
  if (viz) return viz;

  // Recursively search children
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue; // Skip parent references to avoid cycles
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        const found = findVisualizerInSubtree(item);
        if (found) return found;
      }
    } else if (child && typeof child === 'object' && child.type) {
      const found = findVisualizerInSubtree(child);
      if (found) return found;
    }
  }
  return null;
}

// Creates AST nodes for: userDefinedKeys.add('name'); strudelScope.name = name; globalThis.name = name;
// Used in block-based evaluation to persist variables/functions across blocks
// We add to both strudelScope (for internal lookups) and globalThis (for direct access)
// We also track the key in userDefinedKeys so clearScope() can remove it later
function createScopeAssignment(name) {
  return [
    // userDefinedKeys.add('name');
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'userDefinedKeys',
          },
          property: {
            type: 'Identifier',
            name: 'add',
          },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: name,
          },
        ],
      },
    },
    // strudelScope.name = name;
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'strudelScope',
          },
          property: {
            type: 'Identifier',
            name: name,
          },
          computed: false,
        },
        right: {
          type: 'Identifier',
          name: name,
        },
      },
    },
    // globalThis.name = name;
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'globalThis',
          },
          property: {
            type: 'Identifier',
            name: name,
          },
          computed: false,
        },
        right: {
          type: 'Identifier',
          name: name,
        },
      },
    },
  ];
}

function findMiniDisableRanges(comments, codeEnd) {
  const ranges = [];
  const stack = []; // used to track on/off pairs
  for (const comment of comments) {
    const value = comment.value.trim();
    if (value.startsWith('mini-off')) {
      stack.push(comment.start);
    } else if (value.startsWith('mini-on')) {
      const start = stack.pop();
      ranges.push([start, comment.end]);
    }
  }
  while (stack.length) {
    // If no closing mini-on is found, just turn it off until `codeEnd`
    const start = stack.pop();
    ranges.push([start, codeEnd]);
  }
  return ranges;
}
