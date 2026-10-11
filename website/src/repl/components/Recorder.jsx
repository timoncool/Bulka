import React, { useCallback } from 'react';
import { useStore } from '@nanostores/react';
import cx from '@src/cx.mjs';
import { $isRecording, $recordingElapsed, beginRecording, endRecording } from '../recordingState.mjs';

// Custom record icon component - matches heroicons style
const RecordIcon = ({ className, filled = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill={filled ? 'currentColor' : 'none'}
    className={className}
  >
    <circle
      cx="10"
      cy="10"
      r="7"
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
);

// Format milliseconds to MM:SS
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Extract @title from code
function extractTitle(code) {
  if (!code) return null;
  const match = code.match(/\/\/\s*@title\s+(.+?)(?:\n|$)/);
  return match ? match[1].trim() : null;
}

// Sanitize filename
function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
}

export function Recorder({ started, activeCode }) {
  // Единый стор записи: индикатор загорается независимо от источника старта
  // (кнопка REC, тулзы агента/MCP, метод паттерна .record()).
  const isRecording = useStore($isRecording);
  const recordingTime = useStore($recordingElapsed);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      const title = extractTitle(activeCode);
      endRecording(title ? sanitizeFilename(title) : undefined);
    } else {
      beginRecording();
    }
  }, [isRecording, activeCode]);

  return (
    <div className="flex items-center ml-1">
      <button
        onClick={handleToggleRecording}
        title={isRecording ? 'остановить запись' : 'начать запись'}
        className={cx(
          'flex items-center space-x-1.5 px-2 py-1 rounded transition-all',
          isRecording
            ? 'bg-red-500/20 hover:bg-red-500/30'
            : 'hover:opacity-50',
        )}
      >
        {/* REC icon - matches heroicons style */}
        <RecordIcon
          filled={isRecording}
          className={cx(
            'w-5 h-5 transition-all',
            isRecording
              ? 'text-red-500 animate-pulse'
              : 'text-foreground',
          )}
        />
        {/* Label or timer */}
        <span
          className={cx(
            'text-xs font-mono',
            isRecording ? 'text-red-400' : 'text-foreground opacity-60',
          )}
        >
          {isRecording ? formatTime(recordingTime) : 'REC'}
        </span>
      </button>
    </div>
  );
}
