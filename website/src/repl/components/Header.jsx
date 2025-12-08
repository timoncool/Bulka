import PlayCircleIcon from '@heroicons/react/20/solid/PlayCircleIcon';
import StopCircleIcon from '@heroicons/react/20/solid/StopCircleIcon';
import SpeakerWaveIcon from '@heroicons/react/20/solid/SpeakerWaveIcon';
import SpeakerXMarkIcon from '@heroicons/react/20/solid/SpeakerXMarkIcon';
import ArrowUturnLeftIcon from '@heroicons/react/20/solid/ArrowUturnLeftIcon';
import ArrowUturnRightIcon from '@heroicons/react/20/solid/ArrowUturnRightIcon';
import cx from '@src/cx.mjs';
import { useSettings, setIsZen, setMasterVolumeSettings } from '../../settings.mjs';
import { setMasterVolume } from '@strudel/superdough';
import { useState, useEffect, useCallback } from 'react';
import '../Repl.css';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function Header({ context, embedded = false }) {
  const { started, pending, isDirty, activeCode, handleTogglePlay, handleEvaluate, handleShuffle, handleShare, editorRef } =
    context;
  const isEmbedded = typeof window !== 'undefined' && (embedded || window.location !== window.parent.location);
  const { isZen, isButtonRowHidden, isCSSAnimationDisabled, fontFamily, masterVolume } = useSettings();

  // Volume state
  const [volume, setVolume] = useState(masterVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(masterVolume);

  // Sync volume with settings on mount and when settings change
  useEffect(() => {
    setVolume(masterVolume);
    setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMasterVolume(newVolume);
    setMasterVolumeSettings(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
      setPrevVolume(newVolume);
    }
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      // Unmute
      setVolume(prevVolume);
      setMasterVolume(prevVolume);
      setMasterVolumeSettings(prevVolume);
      setIsMuted(false);
    } else {
      // Mute
      setPrevVolume(volume);
      setVolume(0);
      setMasterVolume(0);
      setMasterVolumeSettings(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, prevVolume]);

  // Handle undo
  const handleUndo = useCallback(() => {
    editorRef?.current?.undo?.();
  }, [editorRef]);

  // Handle redo
  const handleRedo = useCallback(() => {
    editorRef?.current?.redo?.();
  }, [editorRef]);

  return (
    <header
      id="header"
      className={cx(
        'flex-none text-black  z-[100] text-lg select-none h-20 md:h-14',
        !isZen && !isEmbedded && 'bg-lineHighlight',
        isZen ? 'h-12 w-8 fixed top-0 left-0' : 'sticky top-0 w-full py-1 justify-between',
        isEmbedded ? 'flex' : 'md:flex',
      )}
      style={{ fontFamily }}
    >
      <div className="px-4 flex space-x-2 md:pt-0 select-none">
        <h1
          onClick={() => {
            if (isEmbedded) window.open(window.location.href.replace('embed', ''));
          }}
          className={cx(
            isEmbedded ? 'text-l cursor-pointer' : 'text-xl',
            'text-foreground font-bold flex space-x-2 items-center',
          )}
        >
          <div
            className={cx(
              'mt-[1px]',
              started && !isCSSAnimationDisabled && 'animate-bounce',
              'cursor-pointer',
              isZen && 'fixed top-2 right-4',
            )}
            onClick={() => {
              if (!isEmbedded) {
                setIsZen(!isZen);
              }
            }}
          >
            <span className="block text-2xl">🍞</span>
          </div>
          {!isZen && (
            <div className="space-x-2">
              <span style={{ fontFamily: "'Fredoka', sans-serif", color: '#D4A574' }}>bulka</span>
              <span className="text-sm font-medium">редактор</span>
              {!isEmbedded && isButtonRowHidden && (
                <a href={`${baseNoTrailing}/learn`} className="text-sm opacity-25 font-medium">
                  ДОКИ
                </a>
              )}
            </div>
          )}
        </h1>
      </div>
      {!isZen && !isButtonRowHidden && (
        <div className="flex max-w-full overflow-auto text-foreground px-1 md:px-2">
          <button
            onClick={handleTogglePlay}
            title={started ? 'стоп' : 'играть'}
            className={cx(
              !isEmbedded ? 'p-2' : 'px-2',
              'hover:opacity-50',
              !started && !isCSSAnimationDisabled && 'animate-pulse',
            )}
          >
            {!pending ? (
              <span className={cx('flex items-center space-x-2')}>
                {started ? <StopCircleIcon className="w-6 h-6" /> : <PlayCircleIcon className="w-6 h-6" />}
                {!isEmbedded && <span>{started ? 'стоп' : 'играть'}</span>}
              </span>
            ) : (
              <>загрузка...</>
            )}
          </button>
          {/* Volume control */}
          <div className={cx('flex items-center', !isEmbedded ? 'px-2' : 'px-1')}>
            <button
              onClick={handleMuteToggle}
              title={isMuted || volume === 0 ? 'включить звук' : 'выключить звук'}
              className="hover:opacity-50 p-1"
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              title={`Громкость: ${Math.round(volume * 100)}%`}
              className="w-16 md:w-20 h-1 bg-foreground/30 rounded-lg appearance-none cursor-pointer accent-foreground"
            />
          </div>
          {/* Undo/Redo buttons */}
          <div className={cx('flex items-center', !isEmbedded ? 'px-1' : 'px-0')}>
            <button
              onClick={handleUndo}
              title="отменить (Ctrl+Z)"
              className="hover:opacity-50 p-1"
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              title="повторить (Ctrl+Shift+Z)"
              className="hover:opacity-50 p-1"
            >
              <ArrowUturnRightIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleEvaluate}
            title="обновить"
            className={cx(
              'flex items-center space-x-1',
              !isEmbedded ? 'p-2' : 'px-2',
              !isDirty || !activeCode ? 'opacity-50' : 'hover:opacity-50',
            )}
          >
            {!isEmbedded && <span>обновить</span>}
          </button>
          {/* !isEmbedded && (
            <button
              title="shuffle"
              className="hover:opacity-50 p-2 flex items-center space-x-1"
              onClick={handleShuffle}
            >
              <span> shuffle</span>
            </button>
          ) */}
          {!isEmbedded && (
            <button
              title="поделиться"
              className={cx(
                'cursor-pointer hover:opacity-50 flex items-center space-x-1',
                !isEmbedded ? 'p-2' : 'px-2',
              )}
              onClick={handleShare}
            >
              <span>поделиться</span>
            </button>
          )}
          {!isEmbedded && (
            <a
              title="уроки"
              href={`${baseNoTrailing}/workshop/getting-started/`}
              className={cx('hover:opacity-50 flex items-center space-x-1', !isEmbedded ? 'p-2' : 'px-2')}
            >
              <span>уроки</span>
            </a>
          )}
          {/* {isEmbedded && (
            <button className={cx('hover:opacity-50 px-2')}>
              <a href={window.location.href} target="_blank" rel="noopener noreferrer" title="Open in REPL">
                🚀
              </a>
            </button>
          )}
          {isEmbedded && (
            <button className={cx('hover:opacity-50 px-2')}>
              <a
                onClick={() => {
                  window.location.href = initialUrl;
                  window.location.reload();
                }}
                title="Reset"
              >
                💔
              </a>
            </button>
          )} */}
        </div>
      )}
    </header>
  );
}
