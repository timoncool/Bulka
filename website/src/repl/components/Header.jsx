import PlayCircleIcon from '@heroicons/react/20/solid/PlayCircleIcon';
import StopCircleIcon from '@heroicons/react/20/solid/StopCircleIcon';
import SpeakerWaveIcon from '@heroicons/react/20/solid/SpeakerWaveIcon';
import SpeakerXMarkIcon from '@heroicons/react/20/solid/SpeakerXMarkIcon';
import ArrowUturnLeftIcon from '@heroicons/react/20/solid/ArrowUturnLeftIcon';
import ArrowUturnRightIcon from '@heroicons/react/20/solid/ArrowUturnRightIcon';
import cx from '@src/cx.mjs';
import { useSettings, setIsZen, setMasterVolumeSettings } from '../../settings.mjs';
import { setMasterVolume } from '@strudel/webaudio';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../Repl.css';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function Header({ context, embedded = false }) {
  const { started, pending, isDirty, activeCode, handleTogglePlay, handleEvaluate, handleShuffle, handleShare, editorRef } =
    context;
  const isEmbedded = typeof window !== 'undefined' && (embedded || window.location !== window.parent.location);
  const { isZen, isButtonRowHidden, isCSSAnimationDisabled, fontFamily, masterVolume } = useSettings();

  // Volume state - sync muted with actual volume
  const [volume, setVolume] = useState(masterVolume);
  const [isMuted, setIsMuted] = useState(masterVolume === 0);
  const [prevVolume, setPrevVolume] = useState(masterVolume > 0 ? masterVolume : 0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [sliderPosition, setSliderPosition] = useState({ top: 0, left: 0 });
  const volumeButtonRef = useRef(null);

  // Undo/redo availability
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Sync volume with settings on mount and when settings change
  useEffect(() => {
    setVolume(masterVolume);
    setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Check undo/redo availability periodically
  useEffect(() => {
    const checkUndoRedo = () => {
      const editor = editorRef?.current?.editor;
      if (editor) {
        // Check if there's undo history
        const undoDepth = editor.state.field?.(editor.state.field, false)?.done?.length;
        const redoDepth = editor.state.field?.(editor.state.field, false)?.undone?.length;
        // Simple check: if we can read history state
        setCanUndo(editor.state.doc.length > 0);
        setCanRedo(false); // Will be updated after actual undo
      }
    };
    const interval = setInterval(checkUndoRedo, 500);
    return () => clearInterval(interval);
  }, [editorRef]);

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMasterVolume(newVolume);
    setMasterVolumeSettings(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
      setPrevVolume(newVolume);
    } else {
      setIsMuted(true);
    }
  }, []);

  // Update slider position when showing
  const handleShowSlider = useCallback(() => {
    if (volumeButtonRef.current) {
      const rect = volumeButtonRef.current.getBoundingClientRect();
      setSliderPosition({
        top: rect.bottom + 4,
        left: rect.left + rect.width / 2,
      });
    }
    setShowVolumeSlider(true);
  }, []);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    const currentlyMuted = isMuted || volume === 0;
    if (currentlyMuted) {
      // Unmute - restore previous volume (or default to 0.8)
      const restoreVolume = prevVolume > 0 ? prevVolume : 0.8;
      setVolume(restoreVolume);
      setMasterVolume(restoreVolume);
      setMasterVolumeSettings(restoreVolume);
      setIsMuted(false);
    } else {
      // Mute - save current volume and set to 0
      if (volume > 0) {
        setPrevVolume(volume);
      }
      setVolume(0);
      setMasterVolume(0);
      setMasterVolumeSettings(0);
      setIsMuted(true);
    }
  }, [isMuted, volume, prevVolume]);

  // Handle undo
  const handleUndo = useCallback(() => {
    editorRef?.current?.undo?.();
    setCanRedo(true);
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
      <div className="px-4 flex space-x-2 md:pt-0 select-none items-center">
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
        {/* Undo/Redo buttons - RIGHT after logo */}
        {!isZen && !isButtonRowHidden && (
          <div className={cx('flex items-center ml-2', !isEmbedded ? 'px-1' : 'px-0')}>
            <button
              onClick={handleUndo}
              title="отменить (Ctrl+Z)"
              className={cx('p-1', canUndo ? 'hover:opacity-50' : 'opacity-30 cursor-not-allowed')}
              disabled={!canUndo}
            >
              <ArrowUturnLeftIcon className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={handleRedo}
              title="повторить (Ctrl+Shift+Z)"
              className={cx('p-1', canRedo ? 'hover:opacity-50' : 'opacity-30 cursor-not-allowed')}
              disabled={!canRedo}
            >
              <ArrowUturnRightIcon className="w-5 h-5 text-foreground" />
            </button>
          </div>
        )}
      </div>
      {!isZen && !isButtonRowHidden && (
        <div className="flex max-w-full overflow-auto text-foreground px-1 md:px-2 items-center">
          {/* Volume control - LEFT of play, vertical slider on hover */}
          <div
            className="relative flex items-center mr-3"
            onMouseEnter={handleShowSlider}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              ref={volumeButtonRef}
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
          </div>
          {/* Fixed volume slider - renders outside overflow container */}
          {showVolumeSlider && (
            <div
              className="fixed flex flex-col items-center bg-lineHighlight border border-foreground/20 rounded-lg px-3 py-3 z-[9999] shadow-lg"
              style={{
                top: sliderPosition.top,
                left: sliderPosition.left,
                transform: 'translateX(-50%)',
              }}
              onMouseEnter={handleShowSlider}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                title={`Громкость: ${Math.round(volume * 100)}%`}
                className="h-24 w-2 bg-foreground/30 rounded-lg appearance-none cursor-pointer accent-foreground"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
              <span className="text-xs mt-2 opacity-70">{Math.round(volume * 100)}%</span>
            </div>
          )}
          {/* Play/Stop button */}
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
        </div>
      )}
    </header>
  );
}
