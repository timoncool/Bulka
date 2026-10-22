import jsdoc from '../../doc.json';
import { autocompletion } from '@codemirror/autocomplete';
import { h } from './html';

const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
};

const stripHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const getDocLabel = (doc) => doc.name || doc.longname;

const buildParamsList = (params) =>
  params?.length
    ? `
    <div class="autocomplete-info-params-section">
      <h4 class="autocomplete-info-section-title">Parameters</h4>
      <ul class="autocomplete-info-params-list">
        ${params
          .map(
            ({ name, type, description }) => `
          <li class="autocomplete-info-param-item">
            <span class="autocomplete-info-param-name">${name}</span>
            <span class="autocomplete-info-param-type">${type.names?.join(' | ')}</span>
            ${description ? `<div class="autocomplete-info-param-desc">${stripHtml(description)}</div>` : ''}
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>
  `
    : '';

const buildExamples = (examples) =>
  examples?.length
    ? `
    <div class="autocomplete-info-examples-section">
      <h4 class="autocomplete-info-section-title">Examples</h4>
      ${examples
        .map(
          (example) => `
        <pre class="autocomplete-info-example-code">${escapeHtml(example)}</pre>
      `,
        )
        .join('')}
    </div>
  `
    : '';

export const Autocomplete = (doc) =>
  h`
  <div class="autocomplete-info-container">
    <div class="autocomplete-info-tooltip">
      <h3 class="autocomplete-info-function-name">${getDocLabel(doc)}</h3>
      ${doc.synonyms_text ? `<div class="autocomplete-info-function-synonyms">Synonyms: ${doc.synonyms_text}</div>` : ''}
      ${doc.description ? `<div class="autocomplete-info-function-description">${doc.description}</div>` : ''}
      ${buildParamsList(doc.params)}
      ${buildExamples(doc.examples)}
    </div>
  </div>
`[0];

const isValidDoc = (doc) => {
  const label = getDocLabel(doc);
  return label && !label.startsWith('_') && !['package'].includes(doc.kind);
};

const hasExcludedTags = (doc) =>
  ['superdirtOnly', 'noAutocomplete'].some((tag) => doc.tags?.find((t) => t.originalTitle === tag));

export const getSynonymDoc = (doc, synonym) => {
  const synonyms = doc.synonyms || [];
  const docLabel = getDocLabel(doc);
  // Swap `doc.name` in for `s` in the list of synonyms
  const synonymsWithDoc = [docLabel, ...synonyms].filter((x) => x && x !== synonym);
  return {
    ...doc,
    name: synonym,
    longname: synonym,
    synonyms: synonymsWithDoc,
    synonyms_text: synonymsWithDoc.join(', '),
  };
};

const jsdocCompletions = (() => {
  const seen = new Set(); // avoid repetition
  const completions = [];
  for (const doc of jsdoc.docs) {
    if (!isValidDoc(doc) || hasExcludedTags(doc)) continue;
    const docLabel = getDocLabel(doc);
    // Remove duplicates
    const synonyms = doc.synonyms || [];
    let labels = [docLabel, ...synonyms];
    for (const label of labels) {
      // https://codemirror.net/docs/ref/#autocomplete.Completion
      if (label && !seen.has(label)) {
        seen.add(label);
        completions.push({
          label,
          info: () => Autocomplete(getSynonymDoc(doc, label)),
          type: 'function', // https://codemirror.net/docs/ref/#autocomplete.Completion.type
        });
      }
    }
  }
  return completions;
})();

export const strudelAutocomplete = (context) => {
  const word = context.matchBefore(/\w*/);
  if (word.from === word.to && !context.explicit) return null;

  return {
    from: word.from,
    options: jsdocCompletions,
    /*     options: [
      { label: 'match', type: 'keyword' },
      { label: 'hello', type: 'variable', info: '(World)' },
      { label: 'magic', type: 'text', apply: '⠁⭒*.✩.*⭒⠁', detail: 'macro' },
    ], */
  };
};

export const isAutoCompletionEnabled = (enabled) =>
  enabled ? [autocompletion({ override: [strudelAutocomplete], closeOnBlur: false })] : [];
