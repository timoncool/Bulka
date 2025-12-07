import useEvent from '@src/useEvent.mjs';
import { useStore } from '@nanostores/react';
import { getAudioContext, soundMap, connectToDestination } from '@strudel/webaudio';
import { useMemo, useRef, useState } from 'react';
import { settingsMap, soundFilterType, useSettings } from '../../../settings.mjs';
import { ButtonGroup } from './Forms.jsx';
import ImportSoundsButton from './ImportSoundsButton.jsx';
import { Textbox } from '../textbox/Textbox.jsx';
import { ActionButton } from '../button/action-button.jsx';
import { confirmDialog } from '@src/repl/util.mjs';
import { clearIDB, userSamplesDBConfig } from '@src/repl/idbutils.mjs';
import { prebake } from '@src/repl/prebake.mjs';
import { isTauri } from '../../../tauri.mjs';
import ClipboardDocumentIcon from '@heroicons/react/20/solid/ClipboardDocumentIcon';
import DocumentPlusIcon from '@heroicons/react/20/solid/DocumentPlusIcon';

const getSamples = (samples) =>
  Array.isArray(samples) ? samples.length : typeof samples === 'object' ? Object.values(samples).length : 1;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function copyToClipboard(text) {
  try {
    if (isTauri()) {
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return true;
  } catch (e) {
    console.error('Failed to copy:', e);
    return false;
  }
}

function insertIntoEditor(text) {
  const strudelMirror = window.strudelMirror;
  if (strudelMirror?.editor) {
    const editor = strudelMirror.editor;
    const { state } = editor;
    const { from, to } = state.selection.main;
    editor.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    editor.focus();
    return true;
  }
  return false;
}

export function SoundsTab() {
  const sounds = useStore(soundMap);

  const { soundsFilter } = useSettings();
  const [search, setSearch] = useState('');
  const { BASE_URL } = import.meta.env;
  const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

  const soundEntries = useMemo(() => {
    if (!sounds) {
      return [];
    }

    let filtered = Object.entries(sounds)
      .filter(([key]) => !key.startsWith('_'))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()));

    if (soundsFilter === soundFilterType.USER) {
      return filtered.filter(([_, { data }]) => !data.prebake);
    }
    if (soundsFilter === soundFilterType.DRUMS) {
      return filtered.filter(([_, { data }]) => data.type === 'sample' && data.tag === 'drum-machines');
    }
    if (soundsFilter === soundFilterType.SAMPLES) {
      return filtered.filter(([_, { data }]) => data.type === 'sample' && data.tag !== 'drum-machines');
    }
    if (soundsFilter === soundFilterType.SYNTHS) {
      return filtered.filter(([_, { data }]) => ['synth', 'soundfont'].includes(data.type));
    }
    if (soundsFilter === soundFilterType.WAVETABLES) {
      return filtered.filter(([_, { data }]) => data.type === 'wavetable');
    }
    //TODO: tidy this up, it does not need to be saved in settings
    if (soundsFilter === 'importSounds') {
      return [];
    }
    return filtered;
  }, [sounds, soundsFilter, search]);

  // holds mutable ref to current triggered sound
  const trigRef = useRef();
  const numRef = useRef(0);

  // stop current sound on mouseup
  useEvent('mouseup', () => {
    const ref = trigRef.current;
    trigRef.current = undefined;
    ref?.stop?.(getAudioContext().currentTime + 0.01);
  });
  useEvent('keydown', (e) => {
    if (!isNaN(Number(e.key))) {
      numRef.current = Number(e.key);
    }
  });
  useEvent('keyup', (e) => {
    numRef.current = 0;
  });
  return (
    <div id="sounds-tab" className="px-4 flex gap-2 flex-col w-full h-full text-foreground">
      <Textbox placeholder="Поиск" value={search} onChange={(v) => setSearch(v)} />

      <div className=" flex shrink-0 flex-wrap">
        <ButtonGroup
          value={soundsFilter}
          onChange={(value) => settingsMap.setKey('soundsFilter', value)}
          items={{
            samples: 'сэмплы',
            drums: 'драм-машины',
            synths: 'синтезаторы',
            wavetables: 'волновые таблицы',
            user: 'свои',
            importSounds: 'импорт звуков',
          }}
        ></ButtonGroup>
      </div>

      {soundsFilter === soundFilterType.USER && soundEntries.length > 0 && (
        <ActionButton
          className="pl-2"
          label="удалить все"
          onClick={async () => {
            try {
              const confirmed = await confirmDialog('Удалить все импортированные сэмплы?');
              if (confirmed) {
                clearIDB(userSamplesDBConfig.dbName);
                soundMap.set({});
                await prebake();
              }
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      <div className="min-h-0 max-h-full grow overflow-auto  text-sm break-normal bg-background p-2 rounded-md">
        {soundEntries.map(([name, { data, onTrigger }]) => {
          const sampleCount =
            data?.type === 'sample'
              ? `(${getSamples(data.samples)})`
              : data?.type === 'wavetable'
                ? `(${getSamples(data.tables)})`
                : data?.type === 'soundfont'
                  ? `(${data.fonts.length})`
                  : '';
          return (
            <span key={name} className="inline-flex items-center mr-2 mb-1">
              <span
                className="cursor-pointer hover:opacity-50"
                onMouseDown={async () => {
                  const ctx = getAudioContext();
                  const params = {
                    note: ['synth', 'soundfont'].includes(data.type) ? 'a3' : undefined,
                    s: name,
                    n: numRef.current,
                    clip: 1,
                    release: 0.5,
                    sustain: 1,
                    duration: 0.5,
                  };
                  const onended = () => trigRef.current?.node?.disconnect();
                  // Attempt to play the sample and retry every 200ms until 10 attempts have been reached
                  let errMsg;
                  for (let attempt = 0; attempt < 10; attempt++) {
                    try {
                      // Pre-load the sample by calling onTrigger with a future time
                      // This triggers the loading but schedules playback for later
                      const time = ctx.currentTime + 0.05; // Give 50ms for loading
                      const ref = await onTrigger(time, params, onended);
                      trigRef.current = ref;
                      if (ref?.node) {
                        connectToDestination(ref.node);
                        break;
                      }
                    } catch (err) {
                      errMsg = err;
                    }
                    if (attempt == 9) {
                      console.warn('Failed to trigger sound after 10 attempts' + (errMsg ? `: ${errMsg}` : ''));
                    } else {
                      await wait(200);
                    }
                  }
                }}
              >
                {name}
                {sampleCount}
              </span>
              <button
                className="ml-0.5 p-0.5 hover:opacity-50 hover:bg-foreground/10 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(name);
                }}
                title="Скопировать название"
              >
                <ClipboardDocumentIcon className="w-3 h-3" />
              </button>
              <button
                className="p-0.5 hover:opacity-50 hover:bg-foreground/10 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  insertIntoEditor(`s("${name}")`);
                }}
                title="Вставить в редактор"
              >
                <DocumentPlusIcon className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        {!soundEntries.length && soundsFilter === 'importSounds' ? (
          <div className="prose dark:prose-invert min-w-full pt-2 pb-8 px-4">
            <ImportSoundsButton onComplete={() => settingsMap.setKey('soundsFilter', 'user')} />
            <p>
              Чтобы импортировать звуки, они должны находиться{' '}
              <a href={`${baseNoTrailing}/learn/samples/#from-disk-via-import-sounds-folder`} target="_blank">
                в папке или подпапке
              </a>
              . Лучший способ — загрузить папку "samples", содержащую подпапки с отдельными звуками или
              звуковыми банками (см. диаграмму ниже).{' '}
            </p>
            <pre className="bg-background" key={'sample-diagram'}>
              {`└─ samples <-- импортируй эту папку
   ├─ swoop
   │  ├─ swoopshort.wav
   │  ├─ swooplong.wav
   │  └─ swooptight.wav
   └─ smash
      ├─ smashhigh.wav
      ├─ smashlow.wav
      └─ smashmiddle.wav`}
            </pre>
            <p>
              Имя подпапки соответствует имени звука во вкладке "свои". Несколько сэмплов в одной
              подпапке имеют одинаковое имя, но доступны через ".n( )" — помни, что нумерация
              начинается с нуля и идёт в алфавитном порядке!
            </p>
            <p>
              Больше информации и другие способы использования своих звуков —{' '}
              <a href={`${baseNoTrailing}/learn/samples/#from-disk-via-import-sounds-folder`} target="_blank">
                в документации
              </a>
              !
            </p>
            <h3>Предпрослушка звуков</h3>
            <pre className="bg-background" key={'sample-preview'}>
              n("0 1 2 3 4 5").s("sample-name")
            </pre>
            <p>
              Вставь строку выше в редактор, чтобы услышать загруженную папку. Используй имя сэмпла
              как оно отображается во вкладке "свои".
            </p>
          </div>
        ) : (
          ''
        )}
        {!soundEntries.length && soundsFilter !== 'importSounds' ? 'Звуки не загружены' : ''}
      </div>
    </div>
  );
}
