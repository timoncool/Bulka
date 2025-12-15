import Loader from '@src/repl/components/Loader';
import { HorizontalPanel, VerticalPanel } from '@src/repl/components/panel/Panel';
import { Code } from '@src/repl/components/Code';
import UserFacingErrorMessage from '@src/repl/components/UserFacingErrorMessage';
import { Header } from './Header';
import { useSettings, settingsMap } from '@src/settings.mjs';
import { useCallback, useRef } from 'react';

// Resize handle component
function ResizeHandle({ direction, onResize }) {
  const isHorizontal = direction === 'horizontal';
  const isDragging = useRef(false);
  const startPos = useRef(0);

  const handlePointerDown = useCallback((e) => {
    isDragging.current = true;
    startPos.current = isHorizontal ? e.clientY : e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = isHorizontal ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [isHorizontal]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    const currentPos = isHorizontal ? e.clientY : e.clientX;
    const delta = startPos.current - currentPos;
    onResize?.(delta);
  }, [isHorizontal, onResize]);

  const handlePointerUp = useCallback((e) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  return (
    <div
      className={`
        group flex items-center justify-center shrink-0
        ${isHorizontal ? 'h-2 cursor-row-resize w-full' : 'w-2 cursor-col-resize h-full'}
        bg-transparent hover:bg-foreground/10 active:bg-foreground/20
        transition-colors duration-150
      `}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`
          ${isHorizontal ? 'w-12 h-1' : 'w-1 h-12'}
          bg-foreground/20 group-hover:bg-foreground/40 group-active:bg-foreground/60
          rounded-full transition-colors duration-150
        `}
      />
    </div>
  );
}

export default function ReplEditor(Props) {
  const { context, ...editorProps } = Props;
  const { containerRef, editorRef, error, init, pending } = context;
  const settings = useSettings();
  const { panelPosition, isZen, isPanelOpen, panelSizeBottom, panelSizeRight } = settings;

  const containerElRef = useRef(null);

  // Handle resize for right panel (width in %)
  const handleResizeRight = useCallback((delta) => {
    if (!containerElRef.current) return;
    const containerWidth = containerElRef.current.offsetWidth;
    const deltaPercent = (delta / containerWidth) * 100;
    const newSize = Math.max(15, Math.min(60, panelSizeRight + deltaPercent));
    settingsMap.setKey('panelSizeRight', newSize);
  }, [panelSizeRight]);

  // Handle resize for bottom panel (height in %)
  const handleResizeBottom = useCallback((delta) => {
    if (!containerElRef.current) return;
    const containerHeight = containerElRef.current.offsetHeight;
    const deltaPercent = (delta / containerHeight) * 100;
    const newSize = Math.max(15, Math.min(60, panelSizeBottom + deltaPercent));
    settingsMap.setKey('panelSizeBottom', newSize);
  }, [panelSizeBottom]);

  const showRightPanel = !isZen && panelPosition === 'right';
  const showBottomPanel = !isZen && panelPosition === 'bottom';

  // Code component is ALWAYS in the same DOM position - never moves between renders
  return (
    <div ref={containerElRef} className="h-full flex flex-col relative" {...editorProps}>
      <Loader active={pending} />
      <Header context={context} />
      <div className="grow flex relative overflow-hidden">
        {/* Code is always the first child here - never changes position */}
        <Code containerRef={containerRef} editorRef={editorRef} init={init} />
        {showRightPanel && isPanelOpen && (
          <ResizeHandle direction="vertical" onResize={handleResizeRight} />
        )}
        {showRightPanel && (
          <div
            className="shrink-0 overflow-hidden h-full"
            style={{ width: isPanelOpen ? `${panelSizeRight}%` : '48px' }}
          >
            <VerticalPanel context={context} />
          </div>
        )}
      </div>
      <UserFacingErrorMessage error={error} />
      {showBottomPanel && isPanelOpen && (
        <ResizeHandle direction="horizontal" onResize={handleResizeBottom} />
      )}
      {showBottomPanel && (
        <div
          className="shrink-0 overflow-hidden"
          style={{ height: isPanelOpen ? `${panelSizeBottom}%` : '48px' }}
        >
          <HorizontalPanel context={context} />
        </div>
      )}
    </div>
  );
}
