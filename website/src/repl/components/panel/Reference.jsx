import { memo, useEffect, useMemo, useState, Fragment } from 'react';

import jsdocJson from '../../../../../doc.json';
import { Textbox } from '@src/repl/components/panel/SettingsTab';
import { settingsMap, useSettings } from '@src/settings.mjs';

const isValid = ({ name, description, tags = [] }) => {
  const isSupradoughOnly = tags.includes('supradough') && !tags.includes('superdough');
  const isSuperdirtOnly = tags.includes('superdirt') && !tags.includes('superdough');
  return name && !name.startsWith('_') && !!description && !isSupradoughOnly && !isSuperdirtOnly;
};

const availableFunctions = (() => {
  const seen = new Set(); // avoid repetition
  const functions = [];
  for (const doc of jsdocJson.docs) {
    if (!isValid(doc)) continue;
    if (seen.has(doc.name)) continue;

    // jsdoc also uses "tags" for when you use @something in the comments and it doesn't know what
    // @something is. We only want data from comments like `@tags superdough` here.
    // If nothing is specified, we default to "untagged" for debugging
    doc.tags = doc.tags?.filter((t) => t && typeof t === 'string') || ['untagged'];

    const synonyms = doc.synonyms || [];
    let names = [doc.name];
    seen.add(doc.name);
    for (const s of synonyms) {
      if (!s || seen.has(s)) continue;
      names.push(s);
      seen.add(s);
    }
    doc.allNames = names.join(' ');
    doc.synonyms = names.slice(1);
    functions.push(doc);
  }
  return functions.sort((a, b) => /* a.meta.filename.localeCompare(b.meta.filename) +  */ a.name.localeCompare(b.name));
})();

const tagCounts = {};
const ignoredTags = ['supradough', 'superdirt'];
// const tagOptions = { all: `all (${availableFunctions.length})` };
const tagOptions = { all: `all` };
for (const doc of availableFunctions) {
  (doc.tags || ['untagged']).forEach((t) => {
    if (typeof t === 'string' && t && !ignoredTags.includes(t)) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
      //tagOptions[t] = `${t} (${tagCounts[t]})`;
      tagOptions[t] = t;
    }
  });
}

const getInnerText = (html) => {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export const Reference = memo(function Reference() {
  const [search, setSearch] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
  const { referenceTag } = useSettings();

  const toggleTag = (tag) => {
    if (referenceTag === tag) {
      setReferenceTag('all');
    } else {
      setReferenceTag(tag);
    }
  };

  const searchVisibleFunctions = useMemo(() => {
    return availableFunctions.filter((entry) => {
      if (referenceTag && referenceTag !== 'all') {
        if (!(entry.tags || ['untagged']).includes(referenceTag)) {
          return false;
        }
      }
      if (!search) {
        return true;
      }
      const lowerCaseSearch = search.toLowerCase();
      return (
        (entry.allNames || entry.name).toLowerCase().includes(lowerCaseSearch) ||
        (entry.synonyms?.some((s) => s.toLowerCase().includes(lowerCaseSearch)) ?? false)
      );
    });
  }, [search, referenceTag]);

  const detailVisibleFunctions = useMemo(() => {
    return searchVisibleFunctions.filter((x) => {
      if (referenceTag === null || referenceTag === 'all') {
        if (search) {
          return true;
        }
        return x.name === selectedFunction;
      } else {
        return true;
      }
    });
  }, [searchVisibleFunctions, selectedFunction, referenceTag]);

  const onSearchTagFilterClick = () => {
    setReferenceTag('all');
    setSelectedFunction(null);
  };

  useEffect(() => {
    if (selectedFunction) {
      const el = document.getElementById(`doc-${selectedFunction}`);
      const container = document.getElementById('reference-container');
      container.scrollTo(0, el.offsetTop);
    }
  }, [selectedFunction]);

  let setReferenceTag = (value) => settingsMap.setKey('referenceTag', value);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="h-full text-foreground flex flex-col w-1/3  border-r border-muted">
        {/* bg-background */}
        <div className="w-full flex">
          <Textbox
            className="w-full border-0 border-b border-muted"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSelectedFunction(null);
              setReferenceTag('all');
              setSearch(e);
            }}
          />
        </div>

        {/* <div className="flex shrink-0 flex-wrap w-full overflow-auto border-y border-muted">
          <ButtonGroup wrap value={referenceTag} onChange={setReferenceTag} items={tagOptions}></ButtonGroup>
        </div> */}
        {referenceTag && referenceTag !== 'all' && (
          <div className="w-72">
            <span
              className="text-foreground border border-muted border-t-0 border-l-0 px-1 py-0.5 my-2 cursor-pointer font-sans"
              onClick={onSearchTagFilterClick}
            >
              {referenceTag}
            </span>
          </div>
        )}
        <div className="h-full p-2 overflow-y-auto bg-opacity-50">
          {searchVisibleFunctions.map((entry, i) => (
            <Fragment key={`entry-${entry.name}`}>
              <a
                className={
                  'whitespace-nowrap cursor-pointer hover:opacity-50 text-ellipsis block' +
                  (entry.name === selectedFunction ? 'bg-lineHighlight font-bold' : '')
                }
                onClick={() => {
                  if (entry.name === selectedFunction) {
                    setSelectedFunction(null);
                  } else {
                    setSelectedFunction(entry.name);
                  }
                }}
              >
                {entry.name} {entry.synonyms && <small className="opacity-50">{entry.synonyms?.join(', ')}</small>}
              </a>{' '}
            </Fragment>
          ))}
        </div>
      </div>
      <div
        className="w-2/3 break-normal flex-col overflow-y-auto overflow-x-hidden p-2 flex relative"
        id="reference-container"
      >
        <div className="prose dark:prose-invert min-w-full px-1 text-sm">
          <h2>API Reference</h2>
          <p className="font-sans text-md">
            This is the long list of functions you can use. Remember that you don't need to remember all of those and
            that you can already make music with a small set of functions!
          </p>
          <div>
            {/* <ButtonGroup wrap value={referenceTag} onChange={setReferenceTag} items={tagOptions}/>*/}
            {Object.entries(tagCounts)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([t, count]) => (
                <span key={t}>
                  <a
                    className={[
                      'select-none text-white border border-muted px-1 py-0.5 my-2 cursor-pointer text-sm/8 no-underline font-sans',
                      `${referenceTag === t ? 'bg-muted text-foreground' : ''}`,
                    ].join(' ')}
                    onClick={() => toggleTag(t)}
                  >
                    {t}&nbsp;({count})
                  </a>{' '}
                </span>
              ))}
          </div>
          {detailVisibleFunctions.map((entry, i) => (
            <section key={i} className="font-sans">
              <div className="flex flex-row items-center mt-8 justify-between">
                <h3 className="font-mono my-0 pt-4" id={`doc-${entry.name}`}>
                  {entry.name}
                </h3>
                {entry.tags && (
                  <span className="ml-2 text-xs text-foreground border border-muted px-1 py-0.5">
                    {entry.tags.filter((t) => !ignoredTags.includes(t)).join(', ')}
                  </span>
                )}
              </div>
              {!!entry.synonyms_text && (
                <p>
                  Synonyms: <code>{entry.synonyms_text}</code>
                </p>
              )}

              <p dangerouslySetInnerHTML={{
                // If we have an external url make sure it opens in another tab to not interrupt the player
                __html: entry.description.replaceAll(/<a href="https:\/\//g, `<a target="_blank" href="https://`)
              }}></p>
              <ul>
                {entry.params?.map(({ name, type, description }, i) => (
                  <li key={i}>
                    {name} : {type?.names?.join(' | ')} {description ? <> - {getInnerText(description)}</> : ''}
                  </li>
                ))}
              </ul>
              {entry.examples?.map((example, j) => (
                <pre className="bg-background border border-muted" key={j}>
                  {example}
                </pre>
              ))}
            </section>
          )) || <p className="font-sans">Search or select a tag to get started.</p>}
          {detailVisibleFunctions.length > 0 && <div className="h-screen" />}
        </div>
      </div>
    </div>
  );
});
