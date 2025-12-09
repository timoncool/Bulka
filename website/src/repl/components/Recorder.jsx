import React, { useState, useCallback } from 'react';
import cx from '@src/cx.mjs';
import { startRecording, stopRecording, isRecording as checkIsRecording } from '@strudel/webaudio';

// Format milliseconds to MM:SS
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function Recorder({ started }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      stopRecording();
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      // Start recording
      startRecording((elapsed) => {
        setRecordingTime(elapsed);
      });
      setIsRecording(true);
    }
  }, [isRecording]);

  return (
    <div className="flex items-center">
      <button
        onClick={handleToggleRecording}
        title={isRecording ? 'остановить запись' : 'начать запись'}
        className={cx(
          'flex items-center space-x-1.5 px-2 py-1 rounded-md transition-all',
          isRecording
            ? 'bg-red-500/20 hover:bg-red-500/30'
            : 'hover:opacity-50',
        )}
      >
        {/* REC indicator */}
        <span
          className={cx(
            'w-3 h-3 rounded-full border-2 transition-all',
            isRecording
              ? 'bg-red-500 border-red-500 animate-pulse'
              : 'border-foreground/50 bg-transparent',
          )}
        />
        {/* Label or timer */}
        <span
          className={cx(
            'text-xs font-mono',
            isRecording ? 'text-red-400' : 'text-foreground opacity-70',
          )}
        >
          {isRecording ? formatTime(recordingTime) : 'REC'}
        </span>
      </button>
    </div>
  );
}
