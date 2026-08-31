import { RangeSetBuilder, StateEffect, StateField, Prec } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';

export const setMiniLocations = StateEffect.define();
export const showMiniLocations = StateEffect.define();
export const displayMiniLocations = StateEffect.define();
export const updateMiniLocations = (view, locations, range = null) => {
  view.dispatch({ effects: setMiniLocations.of({ locations, range }) });
};
export const highlightMiniLocations = (view, atTime, haps) => {
  view.dispatch({ effects: showMiniLocations.of({ atTime, haps }) });
};

const miniLocations = StateField.define({
  create() {
    return Decoration.none;
  },
  update(locations, tr) {
    if (tr.docChanged) {
      locations = locations.map(tr.changes);
    }

    for (let e of tr.effects) {
      if (e.is(setMiniLocations)) {
        //block-based eval case
        if (e.value.range) {
          const stateMiniLocations = getMiniLocationsFromDecorations(locations);

          const normalized = e.value.locations
            .filter(([from]) => from < tr.newDoc.length)
            .map(([from, to]) => [from, Math.min(to, tr.newDoc.length)]);

          const newIds = new Set(normalized.map((r) => r.join(':')));

          const marks = normalized.map((range) => {
            const id = range.join(':');
            return Decoration.mark({
              id,
              // this green is only to verify that the decoration moves when the document is edited
              // it will be removed later, so the mark is not visible by default
              attributes: { style: `background-color: #00CA2880` },
            }).range(...range); // -> Decoration
          });

          const previousMarks = stateMiniLocations
            .filter(({ id }) => !newIds.has(id))
            .map(({ from, to, id }) =>
              Decoration.mark({
                id,
                attributes: { style: `background-color: #00CA2880` },
              }).range(from, to),
            );

          locations = Decoration.set(previousMarks.concat(marks), true); // -> DecorationSet === RangeSet<Decoration>
        } else {
          // this is called on eval, with the mini locations obtained from the transpiler
          // codemirror will automatically remap the marks when the document is edited
          // create a mark for each mini location, adding the range to the spec to find it later
          const marks = e.value.locations
            .filter(([from]) => from < tr.newDoc.length)
            .map(([from, to]) => [from, Math.min(to, tr.newDoc.length)])
            .map(
              (range) =>
                Decoration.mark({
                  id: range.join(':'),
                  // this green is only to verify that the decoration moves when the document is edited
                  // it will be removed later, so the mark is not visible by default
                  attributes: { style: `background-color: #00CA2880` },
                }).range(...range), // -> Decoration
            );
          locations = Decoration.set(marks, true); // -> DecorationSet === RangeSet<Decoration>
        }
      }
    }

    return locations;
  },
});

const visibleMiniLocations = StateField.define({
  create() {
    return { atTime: 0, haps: new Map() };
  },
  update(visible, tr) {
    for (let e of tr.effects) {
      if (e.is(showMiniLocations)) {
        // this is called every frame to show the locations that are currently active
        // we can NOT create new marks because the context.locations haven't changed since eval time
        // this is why we need to find a way to update the existing decorations, showing the ones that have an active range
        const haps = new Map();
        for (let hap of e.value.haps) {
          if (!hap.context?.locations || !hap.whole) {
            continue;
          }
          for (let { start, end } of hap.context.locations) {
            let id = `${start}:${end}`;
            if (!haps.has(id) || haps.get(id).whole.begin.lt(hap.whole.begin)) {
              haps.set(id, hap);
            }
          }
        }
        visible = { atTime: e.value.atTime, haps };
      }
    }

    return visible;
  },
});

const displayMiniLocationsState = StateField.define({
  create() {
    return true; // default to showing miniLocations
  },
  update(display, tr) {
    for (let e of tr.effects) {
      if (e.is(displayMiniLocations)) {
        display = e.value;
      }
    }
    return display;
  },
});

// // Derive the set of decorations from the miniLocations and visibleLocations
const miniLocationHighlights = EditorView.decorations.compute(
  [miniLocations, visibleMiniLocations, displayMiniLocationsState],
  (state) => {
    // Check if miniLocations display is disabled
    const shouldDisplay = state.field(displayMiniLocationsState);
    if (!shouldDisplay) {
      return Decoration.none; // Return empty decorations if display is disabled
    }

    const iterator = state.field(miniLocations).iter();
    const { haps } = state.field(visibleMiniLocations);
    const builder = new RangeSetBuilder();

    while (iterator.value) {
      const {
        from,
        to,
        value: {
          spec: { id },
        },
      } = iterator;

      if (haps.has(id)) {
        const hap = haps.get(id);
        const color = hap.value?.color ?? 'var(--foreground)';
        const style = hap.value?.markcss || `outline: solid 2px ${color}`;
        // Get explicit channels for color values
        /* 
    const swatch = document.createElement('div');
    swatch.style.color = color;
    document.body.appendChild(swatch);
    let channels = getComputedStyle(swatch)
      .color.match(/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*(\d*(?:\.\d+)?))?\)$/)
      .slice(1)
      .map((c) => parseFloat(c || 1));
    document.body.removeChild(swatch);

    // Get percentage of event
    const percent = 1 - (atTime - hap.whole.begin) / hap.whole.duration;
    channels[3] *= percent;
    */

        builder.add(
          from,
          to,
          Decoration.mark({
            // attributes: { style: `outline: solid 2px rgba(${channels.join(', ')})` },
            attributes: { style },
          }),
        );
      }

      iterator.next();
    }

    return builder.finish();
  },
);

const getMiniLocationsFromDecorations = (decorations) => {
  const iterator = decorations.iter();
  const miniLocationsArray = [];
  while (iterator.value) {
    const {
      from,
      to,
      value: {
        spec: { id },
      },
    } = iterator;
    miniLocationsArray.push({
      from,
      to,
      id,
    });
    iterator.next();
  }
  return miniLocationsArray;
};

export const getMiniLocations = (state) => {
  const decorations = state.field(miniLocations);
  return getMiniLocationsFromDecorations(decorations);
};

export const getActiveMiniLocations = (state) => {
  const miniLocations = getMiniLocations(state);
  const { haps } = state.field(visibleMiniLocations);

  const activeMiniLocations = miniLocations.filter((location) => haps.has(location.id));
  return activeMiniLocations;
};

export const highlightExtension = [
  miniLocations,
  visibleMiniLocations,
  displayMiniLocationsState,
  miniLocationHighlights,
];

export const isPatternHighlightingEnabled = (on, config) => {
  // NOTE:
  // Modified this function to always return the highlightExtension, and instead just toggle whether or not the miniLocations are displayed.
  // This is because block based evaluation only updates regions of miniLocations, and those updates need to be kept track of constantly.
  // The setTimeout was also removed because it conflicted with the range-specific updates required by
  // block based evaluation.
  // Not sure if this is the best approach, but for block based eval I can't think of a better way to do it.

  if (config) {
    // Toggle the display state for miniLocations
    config.editor.dispatch({ effects: displayMiniLocations.of(on) });
  }

  return Prec.highest(highlightExtension);
};
