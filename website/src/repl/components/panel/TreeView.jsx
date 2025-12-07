import { useState } from 'react';
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon';
import ChevronDownIcon from '@heroicons/react/20/solid/ChevronDownIcon';

/**
 * Компонент для отображения древовидной структуры паков с звуками
 * @param {Object} props
 * @param {Object} props.packData - Объект с группированными по пакам звуками { packName: [...soundEntries] }
 * @param {Set} props.expandedPacks - Множество названий раскрытых паков
 * @param {Function} props.onTogglePack - Callback для переключения состояния пака
 * @param {Function} props.renderSound - Функция для рендеринга отдельного звука
 */
export function TreeView({ packData, expandedPacks, onTogglePack, renderSound }) {
  // Сортируем паки по имени
  const sortedPacks = Object.entries(packData).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="tree-view">
      {sortedPacks.map(([packName, sounds]) => {
        const isExpanded = expandedPacks.has(packName);
        const soundCount = sounds.length;

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

              {/* Счётчик звуков */}
              <span className="text-xs opacity-60 ml-2">
                ({soundCount})
              </span>
            </div>

            {/* Список звуков внутри пака */}
            {isExpanded && (
              <div className="pack-sounds ml-6 mt-1">
                {sounds.map(([name, soundData]) => renderSound(name, soundData))}
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
 * @param {Array} soundEntries - Массив звуков [[name, { data, onTrigger }], ...]
 * @returns {Object} Объект с группированными звуками { packName: [...soundEntries] }
 */
export function groupSoundsByPack(soundEntries) {
  const packData = {};

  soundEntries.forEach((entry) => {
    const [name, { data }] = entry;
    // Определяем название пака
    let packName = data.pack || 'Другие';

    // Если пака еще нет, создаем массив
    if (!packData[packName]) {
      packData[packName] = [];
    }

    packData[packName].push(entry);
  });

  return packData;
}
