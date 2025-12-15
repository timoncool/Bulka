import Loader from '@src/repl/components/Loader';
import { HorizontalPanel, VerticalPanel } from '@src/repl/components/panel/Panel';
import { Code } from '@src/repl/components/Code';
import UserFacingErrorMessage from '@src/repl/components/UserFacingErrorMessage';
import { Header } from './Header';
import { useSettings, settingsMap } from '@src/settings.mjs';
import { useCallback, useRef } from 'react';

// Resize handle component
function ResizeHandle({ direction, containerRef, onResize }) {
  const isHorizontal = direction === 'horizontal';
  const isDragging = useRef(false);

  const handlePointerDown = useCallback((e) => {
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = isHorizontal ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }, [isHorizontal]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isHorizontal) {
      // Bottom panel: height = container bottom - mouse Y
      const newSize = ((rect.bottom - e.clientY) / rect.height) * 100;
      onResize(Math.max(15, Math.min(60, newSize)));
    } else {
      // Right panel: width = container right - mouse X
      const newSize = ((rect.right - e.clientX) / rect.width) * 100;
      onResize(Math.max(15, Math.min(60, newSize)));
    }
  }, [isHorizontal, containerRef, onResize]);

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

  const handleResizeRight = useCallback((size) => {
    settingsMap.setKey('panelSizeRight', size);
  }, []);

  const handleResizeBottom = useCallback((size) => {
    settingsMap.setKey('panelSizeBottom', size);
  }, []);

  const showRightPanel = !isZen && panelPosition === 'right';
  const showBottomPanel = !isZen && panelPosition === 'bottom';

  return (
    <div ref={containerElRef} className="h-full flex flex-col relative" {...editorProps}>
      <Loader active={pending} />
      <Header context={context} />
      <div className="grow flex relative overflow-hidden">
        <Code containerRef={containerRef} editorRef={editorRef} init={init} />
        {showRightPanel && isPanelOpen && (
          <ResizeHandle
            direction="vertical"
            containerRef={containerElRef}
            onResize={handleResizeRight}
          />
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
        <ResizeHandle
          direction="horizontal"
          containerRef={containerElRef}
          onResize={handleResizeBottom}
        />
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
