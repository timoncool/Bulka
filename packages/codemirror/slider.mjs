import { ref, pure } from '@strudel/core';
import { WidgetType, ViewPlugin, Decoration } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';

// Global state storage for all widget types
export let sliderValues = {};

export class SliderWidget extends WidgetType {
  constructor(value, min, max, from, to, step, view, id) {
    super();
    this.value = value;
    this.min = min;
    this.max = max;
    this.from = from;
    this.originalFrom = from;
    this.to = to;
    this.step = step;
    this.view = view;
    this.id = id || `${from}:${to}`; // Range-based ID for stability
  }

  eq(other) {
    if (!(other instanceof SliderWidget)) {
      return false;
    }
    return (
      this.id === other.id &&
      this.from === other.from &&
      this.to === other.to &&
      this.value === other.value &&
      this.min === other.min &&
      this.max === other.max
    );
  }

  toDOM() {
    let wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = 'cm-slider'; // inline-flex items-center
    let slider = wrap.appendChild(document.createElement('input'));
    slider.type = 'range';
    slider.min = this.min;
    slider.max = this.max;
    slider.step = this.step ?? (this.max - this.min) / 1000;
    slider.originalValue = this.value;
    // to make sure the code stays in sync, let's save the original value
    // becuase .value automatically clamps values so it'll desync with the code
    slider.value = slider.originalValue;
    slider.from = this.from;
    slider.originalFrom = this.originalFrom;
    slider.to = this.to;
    slider.id = this.id; // Store range-based ID in DOM element
    slider.style = 'width:64px;margin-right:4px;transform:translateY(4px)';
    this.slider = slider;
    slider.addEventListener('input', (e) => {
      const next = e.target.value;
      let insert = next;
      //let insert = next.toFixed(2);
      const to = slider.from + slider.originalValue.length;
      let change = { from: slider.from, to, insert };
      slider.originalValue = insert;
      slider.value = insert;
      this.view.dispatch({ changes: change });
      const id = slider.id; // Use range-based ID
      window.postMessage({ type: 'cm-slider', value: Number(next), id });
    });
    return wrap;
  }

  ignoreEvent(e) {
    return true;
  }
}

export const setSliderWidgets = StateEffect.define();

export const setSliderWidgetsInRange = StateEffect.define();

export const updateSliderWidgets = (view, widgets, range = null) => {
  if (range) {
    // range argument passed for block-based evaluation
    view.dispatch({ effects: setSliderWidgetsInRange.of({ widgets, range }) });
  } else {
    view.dispatch({ effects: setSliderWidgets.of(widgets) });
  }
};

function getSliders(widgetConfigs, view) {
  return (
    widgetConfigs
      .filter((w) => w.type === 'slider')
      // Deduplicate sliders that might appear multiple times (e.g., during paste operations)
      .filter((slider, index, self) => index === self.findIndex((s) => s.from === slider.from && s.to === slider.to))
      .sort((a, b) => a.from - b.from)
      .map(({ from, to, value, min, max, step, id }) => {
        return Decoration.widget({
          widget: new SliderWidget(value, min, max, from, to, step, view, id),
          side: 0,
        }).range(from /* , to */);
      })
  );
}

export function getSliderWidgets(view) {
  if (!view || !view.state) {
    return [];
  }

  const sliderPluginInstance = view.plugin(sliderPlugin);
  if (!sliderPluginInstance || !sliderPluginInstance.decorations) {
    return [];
  }

  const sliderWidgets = [];

  sliderPluginInstance.decorations.between(0, view.state.doc.length, (from, to, decoration) => {
    if (decoration.widget instanceof SliderWidget) {
      sliderWidgets.push({
        type: 'slider',
        from: decoration.widget.from,
        to: decoration.widget.to,
        value: decoration.widget.value,
        min: decoration.widget.min,
        max: decoration.widget.max,
        step: decoration.widget.step,
      });
    }
  });

  return sliderWidgets;
}

export const sliderPlugin = ViewPlugin.fromClass(
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
          while (iterator.value) {
            // when the widgets are moved, we need to tell the dom node the current position
            // this is important because the updateSliderValue function has to work with the dom node
            if (iterator.value?.widget?.slider) {
              iterator.value.widget.slider.from = iterator.from;
              iterator.value.widget.slider.to = iterator.to;
            }
            iterator.next();
          }
        }
        for (let e of tr.effects) {
          if (e.is(setSliderWidgetsInRange)) {
            // Block-aware slider update logic
            const { widgets, range } = e.value;
            const [rangeStart, rangeEnd] = range;

            // Get existing slider widgets that should be preserved
            const existingSliders = [];
            this.decorations.between(0, update.view.state.doc.length, (from, to, decoration) => {
              if (decoration.widget instanceof SliderWidget) {
                // Preserve sliders outside the evaluation range
                // Use strict > for rangeEnd because when code is deleted, slider positions
                // map to the deletion boundary (rangeEnd), and those should be removed, not preserved
                if (from < rangeStart || from > rangeEnd) {
                  existingSliders.push({
                    from,
                    to,
                    value: decoration.widget.value,
                    min: decoration.widget.min,
                    max: decoration.widget.max,
                    step: decoration.widget.step,
                    id: decoration.widget.id || `${from}:${to}`,
                    type: 'slider',
                  });
                }
              }
            });

            // Merge preserved sliders with new widgets
            const mergedWidgets = [...existingSliders, ...widgets]
              .filter(
                (slider, index, self) => index === self.findIndex((s) => s.type === 'slider' && s.id === slider.id),
              )
              .sort((a, b) => a.from - b.from);

            this.decorations = Decoration.set(getSliders(mergedWidgets, update.view));
          } else if (e.is(setSliderWidgets)) {
            this.decorations = Decoration.set(getSliders(e.value, update.view));
          }
        }
      });
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

/**
 * Displays a slider widget to allow the user manipulate a value
 *
 * @name slider
 * @tags external_io, visualization
 * @param {number} value Initial value
 * @param {number} min Minimum value - optional, defaults to 0
 * @param {number} max Maximum value - optional, defaults to 1
 * @param {number} step Step size - optional
 */
export let slider = (value) => {
  console.warn('slider will only work when the transpiler is used... passing value as is');
  return pure(value);
};
// function transpiled from slider = (value, min, max)
export let sliderWithID = (id, value, min, max) => {
  sliderValues[id] = value; // sync state at eval time (code -> state)
  return ref(() => sliderValues[id]); // use state at query time
};

// update state when sliders are moved
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e) => {
    if (e.data.type === 'cm-slider') {
      if (sliderValues[e.data.id] !== undefined) {
        // update state when slider is moved
        sliderValues[e.data.id] = e.data.value;
      } else {
        console.error(`slider with id "${e.data.id}" is not registered. Only ${Object.keys(sliderValues)}`);
      }
    }
  });
}
