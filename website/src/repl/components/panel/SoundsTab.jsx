import useEvent from '@src/useEvent.mjs';
import { useStore } from '@nanostores/react';
import { getAudioContext, soundMap, connectToDestination } from '@strudel/webaudio';
import { useCallback, useMemo, useRef, useState } from 'react';
import { settingsMap, soundFilterType, useSettings } from '../../../settings.mjs';
import { ButtonGroup } from './Forms.jsx';
import Squares2X2Icon from '@heroicons/react/20/solid/Squares2X2Icon';
import ListBulletIcon from '@heroicons/react/20/solid/ListBulletIcon';
import ImportSoundsButton from './ImportSoundsButton.jsx';
import { Textbox } from '../textbox/Textbox.jsx';
import { ActionButton } from '../button/action-button.jsx';
import { confirmDialog } from '@src/repl/util.mjs';
import { clearIDB, userSamplesDBConfig } from '@src/repl/idbutils.mjs';
import { prebake } from '@src/repl/prebake.mjs';
import { isTauri } from '../../../tauri.mjs';
import ClipboardDocumentIcon from '@heroicons/react/20/solid/ClipboardDocumentIcon';
import DocumentPlusIcon from '@heroicons/react/20/solid/DocumentPlusIcon';
import { TreeView, groupSoundsByPack } from './TreeView.jsx';

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

  const { soundsFilter, enabledPacks } = useSettings();
  const [search, setSearch] = useState('');
  const [showPackFilter, setShowPackFilter] = useState(false);
  const [expandedPacks, setExpandedPacks] = useState(new Set());
  const [viewMode, setViewMode] = useState('tree'); // 'flat' или 'tree'
  const { BASE_URL } = import.meta.env;
  const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

  // Извлекаем все доступные паки и подсчитываем звуки в каждом
  const availablePacks = useMemo(() => {
    if (!sounds) {
      return {};
    }
    const packs = {};
    Object.entries(sounds)
      .filter(([key]) => !key.startsWith('_'))
      .forEach(([_, { data }]) => {
        const pack = data.pack || 'other';
        packs[pack] = (packs[pack] || 0) + 1;
      });
    return packs;
  }, [sounds]);

  const soundEntries = useMemo(() => {
    if (!sounds) {
      return [];
    }

    let filtered = Object.entries(sounds)
      .filter(([key]) => !key.startsWith('_'))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()));

    // Применяем фильтр по пакам
    if (enabledPacks !== 'all' && Array.isArray(enabledPacks)) {
      filtered = filtered.filter(([_, { data }]) => {
        const pack = data.pack || 'other';
        return enabledPacks.includes(pack);
      });
    }

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
  }, [sounds, soundsFilter, search, enabledPacks]);

  // Группировка звуков по пакам
  const packedSounds = useMemo(() => {
    return groupSoundsByPack(soundEntries);
  }, [soundEntries]);

  // Функция для переключения раскрытых паков
  const handleTogglePack = (packName) => {
    setExpandedPacks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(packName)) {
        newSet.delete(packName);
      } else {
        newSet.add(packName);
      }
      return newSet;
    });
  };

  // Автоматически раскрывать паки при поиске
  useMemo(() => {
    if (search) {
      // Раскрыть все паки, которые имеют совпадения
      const packsToExpand = new Set(Object.keys(packedSounds));
      setExpandedPacks(packsToExpand);
    }
  }, [search, packedSounds]);

  // Функции для управления фильтром паков
  const togglePack = useEvent((packName) => {
    if (enabledPacks === 'all') {
      // Если все паки включены, выключаем только этот
      const allPacks = Object.keys(availablePacks);
      const newPacks = allPacks.filter((p) => p !== packName);
      settingsMap.setKey('enabledPacks', JSON.stringify(newPacks));
    } else {
      const currentPacks = Array.isArray(enabledPacks) ? enabledPacks : [];
      if (currentPacks.includes(packName)) {
        // Убираем пак из списка
        const newPacks = currentPacks.filter((p) => p !== packName);
        if (newPacks.length === 0) {
          settingsMap.setKey('enabledPacks', 'all');
        } else {
          settingsMap.setKey('enabledPacks', JSON.stringify(newPacks));
        }
      } else {
        // Добавляем пак в список
        const newPacks = [...currentPacks, packName];
        const allPacks = Object.keys(availablePacks);
        if (newPacks.length === allPacks.length) {
          settingsMap.setKey('enabledPacks', 'all');
        } else {
          settingsMap.setKey('enabledPacks', JSON.stringify(newPacks));
        }
      }
    }
  });

  const selectAllPacks = useEvent(() => {
    settingsMap.setKey('enabledPacks', 'all');
  });

  const deselectAllPacks = useEvent(() => {
    settingsMap.setKey('enabledPacks', JSON.stringify([]));
  });

  const isPackEnabled = (packName) => {
    if (enabledPacks === 'all') return true;
    if (!Array.isArray(enabledPacks)) return false;
    return enabledPacks.includes(packName);
  };

  // holds mutable ref to current triggered sound
  const trigRef = useRef();
  const numRef = useRef(0);

  // Функция для рендеринга одного звука
  const renderSound = useCallback((name, { data, onTrigger }) => {
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
            let errMsg;
            for (let attempt = 0; attempt < 10; attempt++) {
              try {
                const time = ctx.currentTime + 0.05;
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
  }, []);

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
      <div className="flex gap-2 items-center">
        <Textbox placeholder="Поиск" value={search} onChange={(v) => setSearch(v)} className="flex-grow" />
        {/* Переключатель режима отображения */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setViewMode('tree')}
            className={`p-1.5 rounded ${viewMode === 'tree' ? 'bg-foreground/20' : 'hover:bg-foreground/10'}`}
            title="Древовидный вид"
          >
            <ListBulletIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`p-1.5 rounded ${viewMode === 'flat' ? 'bg-foreground/20' : 'hover:bg-foreground/10'}`}
            title="Плоский список"
          >
            <Squares2X2Icon className="w-4 h-4" />
          </button>
        </div>
      </div>

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

      {/* Фильтр по пакам */}
      {Object.keys(availablePacks).length > 0 && soundsFilter !== 'importSounds' && (
        <div className="flex flex-col gap-2 text-sm">
          <button
            onClick={() => setShowPackFilter(!showPackFilter)}
            className="text-left text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            {showPackFilter ? '▼' : '▶'} Фильтр по пакам
          </button>
          {showPackFilter && (
            <div className="flex flex-col gap-1 pl-4 max-h-40 overflow-y-auto">
              <div className="flex gap-2 mb-1">
                <button
                  onClick={selectAllPacks}
                  className="text-xs opacity-70 hover:opacity-100 underline"
                >
                  Выбрать все
                </button>
                <button
                  onClick={deselectAllPacks}
                  className="text-xs opacity-70 hover:opacity-100 underline"
                >
                  Снять все
                </button>
              </div>
              {Object.entries(availablePacks)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([packName, count]) => (
                  <label key={packName} className="flex items-center gap-2 cursor-pointer hover:opacity-70">
                    <input
                      type="checkbox"
                      checked={isPackEnabled(packName)}
                      onChange={() => togglePack(packName)}
                      className="cursor-pointer"
                    />
                    <span className="text-xs">
                      {packName} ({count})
                    </span>
                  </label>
                ))}
            </div>
          )}
        </div>
      )}

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

      <div className="min-h-0 max-h-full grow overflow-auto text-sm break-normal bg-background p-2 rounded-md">
        {/* Древовидный режим */}
        {viewMode === 'tree' && soundEntries.length > 0 && (
          <TreeView
            packData={packedSounds}
            expandedPacks={expandedPacks}
            onTogglePack={handleTogglePack}
            renderSound={renderSound}
          />
        )}
        {/* Плоский режим */}
        {viewMode === 'flat' && soundEntries.map(([name, soundData]) => renderSound(name, soundData))}
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
