import React, { useState, useCallback } from 'react';
import cx from '@src/cx.mjs';
import { startRecording, stopRecording } from '@strudel/webaudio';

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording - pass title for filename
      const title = extractTitle(activeCode);
      const filename = title ? sanitizeFilename(title) : null;
      stopRecording(filename);
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      // Start recording
      startRecording((elapsed) => {
        setRecordingTime(elapsed);
      });
      setIsRecording(true);
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
