import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, WidgetType, ViewPlugin } from '@codemirror/view';
import { getWidgetID, registerWidgetType } from '@strudel/transpiler';
import { Pattern } from '@strudel/core';

export const setWidgets = StateEffect.define();

export const setWidgetsInRange = StateEffect.define();

export const updateWidgets = (view, widgets, range = null) => {
  if (range) {
    // range argument passed for block-based evaluation
    view.dispatch({ effects: setWidgetsInRange.of({ widgets, range }) });
  } else {
    view.dispatch({ effects: setWidgets.of(widgets) });
  }
};

function getWidgets(widgetConfigs, view) {
  const filtered = widgetConfigs
    // Filter to widget configs only (exclude sliders)
    .filter((w) => w && w.type && w.type !== 'slider')
    // Deduplicate widgets by ID, matching slider behavior for stable widget identity
    .filter((widget, index, self) => index === self.findIndex((w) => w.type === widget.type && w.id === widget.id));

  // Filter out widgets whose range is encompassed by another widget
  // const nonEncompassed = filterEncompassedWidgets(filtered);

  return filtered
    .sort((a, b) => (a.to || 0) - (b.to || 0))
    .map((widgetConfig) => {
      try {
        return Decoration.widget({
          widget: new BlockWidget(widgetConfig, view),
          side: 0,
        }).range(widgetConfig.to || widgetConfig.from || 0);
      } catch (error) {
        console.error('error creating widget', error);
        return null;
      }
    })
    .filter(Boolean); // Remove any null results from failed creations
}

export const widgetPlugin = ViewPlugin.fromClass(
  class {
    decorations; //: DecorationSet

    constructor(view /* : EditorView */) {
      this.decorations = Decoration.set([]);
    }

    update(update /* : ViewUpdate */) {
      update.transactions.forEach((tr) => {
        if (tr.docChanged) {
          this.decorations = this.decorations.map(tr.changes);
          const iterator = this.decorations.iter();
          // Apply changes to iterator.from and iterator.to if docChanged
          while (iterator.value) {
            // when the widgets are moved, we need to tell the dom node the current position
            // this is important because the widget functions have to work with the dom node
            if (iterator.value?.widget instanceof BlockWidget) {
              iterator.value.widget.from = iterator.from;
              iterator.value.widget.to = iterator.to;
            }
            iterator.next();
          }
        }
        for (let e of tr.effects) {
          if (e.is(setWidgetsInRange)) {
            // Block-aware widget update logic
            const { widgets, range } = e.value;
            const [rangeStart, rangeEnd] = range;

            // Get existing widget widgets that should be preserved
            const existingWidgets = [];
            this.decorations.between(0, update.view.state.doc.length, (from, to, decoration) => {
              if (decoration.widget instanceof BlockWidget) {
                // Preserve widgets outside the evaluation range
                // Use strict > for rangeEnd because when code is deleted, widget positions
                // map to the deletion boundary (rangeEnd), and those should be removed, not preserved
                if (from < rangeStart || from > rangeEnd) {
                  existingWidgets.push({
                    from: decoration.widget.from,
                    to: decoration.widget.to,
                    type: decoration.widget.type,
                    index: decoration.widget.index,
                    id: decoration.widget.id,
                  });
                }
              }
            });

            // Merge preserved widgets with new widgets, deduplicating by ID
            const mergedWidgets = [...existingWidgets, ...widgets].filter(
              (widget, index, self) => index === self.findIndex((w) => w.type === widget.type && w.id === widget.id),
            );

            this.decorations = Decoration.set(getWidgets(mergedWidgets, update.view));
          } else if (e.is(setWidgets)) {
            this.decorations = Decoration.set(getWidgets(e.value, update.view));
          }
        }
      });
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

const widgetElements = {};
export function setWidget(id, el) {
  widgetElements[id] = el;
  el.id = id;
}

export class BlockWidget extends WidgetType {
  constructor(widgetConfig, view) {
    super();

    // Graceful handling of invalid configs like sliders
    if (!widgetConfig || typeof widgetConfig !== 'object') {
      widgetConfig = { type: 'unknown', from: 0, to: 0 };
    }

    this.from = widgetConfig.from || 0;
    this.originalFrom = widgetConfig.from || 0;
    this.to = widgetConfig.to || this.from;
    this.originalTo = widgetConfig.to || this.from;
    this.type = widgetConfig.type || 'unknown';
    this.index = widgetConfig.index || 0;
    this.view = view;

    // Use range-based ID for stability, similar to sliders
    this.id = widgetConfig.id || getWidgetID?.(widgetConfig);
    this.widgetConfig = widgetConfig;
  }

  eq(other) {
    if (!(other instanceof BlockWidget)) {
      return false;
    }
    return (
      this.id === other.id &&
      this.from === other.from &&
      this.to === other.to &&
      this.type === other.type &&
      this.index === other.index
    );
  }

  toDOM() {
    let wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = 'cm-widget-container';

    let el = widgetElements[this.id];
    if (el) {
      // Ensure the element has the correct ID
      el.id = this.id;
      wrap.appendChild(el);
    } else {
      // Create a placeholder element if the widget element doesn't exist
      // This prevents CodeMirror errors when widget is missing
      const placeholder = document.createElement('span');
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.className = 'cm-widget-placeholder';
      placeholder.style.cssText = 'display: none;'; // Hide placeholder
      placeholder.id = this.id;
      wrap.appendChild(placeholder);
    }

    return wrap;
  }

  ignoreEvent(e) {
    return true;
  }
}

export function getActiveWidgets(view) {
  if (!view || !view.state) {
    return [];
  }

  const widgetPluginInstance = view.plugin(widgetPlugin);
  if (!widgetPluginInstance || !widgetPluginInstance.decorations) {
    return [];
  }

  const widgets = [];

  widgetPluginInstance.decorations.between(0, view.state.doc.length, (from, to, decoration) => {
    if (decoration.widget instanceof BlockWidget) {
      widgets.push({
        type: decoration.widget.type,
        from: decoration.widget.from,
        to: decoration.widget.to,
        index: decoration.widget.index,
        id: decoration.widget.id,
      });
    }
  });

  return widgets;
}

export function getAllWidgetIds(view) {
  if (!view || !view.state) {
    return [];
  }

  const widgetPluginInstance = view.plugin(widgetPlugin);
  if (!widgetPluginInstance || !widgetPluginInstance.decorations) {
    return [];
  }

  const widgetIds = [];

  widgetPluginInstance.decorations.between(0, view.state.doc.length, (from, to, decoration) => {
    if (decoration.widget instanceof BlockWidget) {
      widgetIds.push(decoration.widget.id);
    }
  });

  return widgetIds;
}

// widget implementer API to create a new widget type
export function registerWidget(type, fn) {
  registerWidgetType(type);
  if (fn) {
    Pattern.prototype[type] = function (id, options = { fold: 1 }) {
      // fn is expected to create a dom element and call setWidget(id, el);
      // fn should also return the pattern
      return fn(id, options, this);
    };
  }
}

// wire up @strudel/draw functions

function getCanvasWidget(id, options = {}) {
  const { width = 500, height = 60, pixelRatio = window.devicePixelRatio } = options;
  let canvas = document.getElementById(id) || document.createElement('canvas');
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  setWidget(id, canvas);
  return canvas;
}

registerWidget('_pianoroll', (id, options = {}, pat) => {
  const ctx = getCanvasWidget(id, options).getContext('2d');
  return pat.tag(id).pianoroll({ fold: 1, ...options, ctx, id });
});

registerWidget('_punchcard', (id, options = {}, pat) => {
  const ctx = getCanvasWidget(id, options).getContext('2d');
  return pat.tag(id).punchcard({ fold: 1, ...options, ctx, id });
});

registerWidget('_spiral', (id, options = {}, pat) => {
  let _size = options.size || 275;
  options = { width: _size, height: _size, ...options, size: _size / 5 };
  const ctx = getCanvasWidget(id, options).getContext('2d');
  return pat.tag(id).spiral({ ...options, ctx, id });
});

registerWidget('_scope', (id, options = {}, pat) => {
  options = { width: 500, height: 60, pos: 0.5, scale: 1, ...options };
  const ctx = getCanvasWidget(id, options).getContext('2d');
  return pat.tag(id).scope({ ...options, ctx, id });
});

registerWidget('_pitchwheel', (id, options = {}, pat) => {
  let _size = options.size || 200;
  options = { width: _size, height: _size, ...options, size: _size / 5 };
  const ctx = getCanvasWidget(id, options).getContext('2d');
  return pat.pitchwheel({ ...options, ctx, id });
});

registerWidget('_spectrum', (id, options = {}, pat) => {
  let _size = options.size || 200;
  options = { width: _size, height: _size, ...options, size: _size / 5 };
  const ctx = getCanvasWidget(id, options).getContext('2d');
  return pat.spectrum({ ...options, ctx, id });
});
