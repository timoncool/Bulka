import { useState } from 'react';
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon';
import ClipboardDocumentIcon from '@heroicons/react/20/solid/ClipboardDocumentIcon';
import DocumentPlusIcon from '@heroicons/react/20/solid/DocumentPlusIcon';
import { getAudioContext, connectToDestination } from '@strudel/webaudio';
import { isTauri } from '../../../tauri.mjs';

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

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Извлекает имя файла из пути
function getFileName(path) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

/**
 * Компонент для отображения одного банка с возможностью раскрытия семплов
 */
function ExpandableBank({ name, data, onTrigger, trigRef }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Получаем список семплов
  const samples = data?.type === 'sample' && Array.isArray(data.samples) ? data.samples : [];
  const sampleCount = samples.length;
  const hasSamples = sampleCount > 1;

  const playSample = async (sampleIndex = 0) => {
    const ctx = getAudioContext();
    const params = {
      note: ['synth', 'soundfont'].includes(data.type) ? 'a3' : undefined,
      s: name,
      n: sampleIndex,
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
  };

  return (
    <div className="mb-1">
      {/* Основной заголовок банка */}
      <div className="flex items-center">
        {/* Кнопка раскрытия (только если есть несколько семплов) */}
        {hasSamples ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 mr-1 flex-shrink-0 hover:opacity-50"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 mr-1 flex-shrink-0" />
        )}

        {/* Название банка */}
        <span
          className="cursor-pointer hover:opacity-50"
          onMouseDown={() => playSample(0)}
        >
          {name}
          {sampleCount > 0 && `(${sampleCount})`}
        </span>

        {/* Кнопки действий */}
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
      </div>

      {/* Раскрытый список семплов */}
      {isExpanded && hasSamples && (
        <div className="ml-5 mt-1 border-l border-foreground/20 pl-2">
          {samples.map((samplePath, index) => {
            const fileName = getFileName(samplePath);
            return (
              <div key={index} className="flex items-center mb-0.5">
                <span
                  className="cursor-pointer hover:opacity-50 text-xs opacity-80"
                  onMouseDown={() => playSample(index)}
                  title={samplePath}
                >
                  {index}: {fileName}
                </span>
                <button
                  className="ml-0.5 p-0.5 hover:opacity-50 hover:bg-foreground/10 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    insertIntoEditor(`s("${name}").n(${index})`);
                  }}
                  title="Вставить в редактор"
                >
                  <DocumentPlusIcon className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Компонент для отображения древовидной структуры паков с звуками
 */
export function TreeView({ packData, expandedPacks, onTogglePack, renderSound, trigRef }) {
  // Сортируем паки по имени
  const sortedPacks = Object.entries(packData).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="tree-view">
      {sortedPacks.map(([packName, sounds]) => {
        const isExpanded = expandedPacks.has(packName);
        const soundCount = sounds.length;

        // Считаем общее количество семплов
        const totalSamples = sounds.reduce((acc, [_, { data }]) => {
          if (data?.type === 'sample' && Array.isArray(data.samples)) {
            return acc + data.samples.length;
          }
          return acc + 1;
        }, 0);

        return (
          <div key={packName} className="pack-group mb-2">
            {/* Заголовок пака */}
            <div
              className="pack-header flex items-center cursor-pointer hover:bg-foreground/10 rounded px-2 py-1 select-none"
              onClick={() => onTogglePack(packName)}
            >
              {/* Иконка разворачивания/сворачивания */}
              <span className="flex-shrink-0 w-4 h-4 mr-1">
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </span>

              {/* Название пака */}
              <span className="font-medium flex-grow">
                {packName}
              </span>

              {/* Счётчик: банков / семплов */}
              <span className="text-xs opacity-60 ml-2">
                {soundCount} банков / {totalSamples} семплов
              </span>
            </div>

            {/* Список звуков внутри пака */}
            {isExpanded && (
              <div className="pack-sounds ml-6 mt-1">
                {sounds.map(([name, soundData]) => (
                  <ExpandableBank
                    key={name}
                    name={name}
                    data={soundData.data}
                    onTrigger={soundData.onTrigger}
                    trigRef={trigRef}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Группирует звуки по пакам
 */
export function groupSoundsByPack(soundEntries) {
  const packData = {};

  soundEntries.forEach((entry) => {
    const [name, { data }] = entry;
    let packName = data.pack || 'Другие';

    if (!packData[packName]) {
      packData[packName] = [];
    }

    packData[packName].push(entry);
  });

  return packData;
}
