import Loader from '@src/repl/components/Loader';
import { HorizontalPanel, VerticalPanel } from '@src/repl/components/panel/Panel';
import { Code } from '@src/repl/components/Code';
import UserFacingErrorMessage from '@src/repl/components/UserFacingErrorMessage';
import { Header } from './Header';
import { useSettings, settingsMap } from '@src/settings.mjs';
import { useRef } from 'react';

// Resize handle component
function ResizeHandle({ direction, containerRef, settingKey }) {
  const isHorizontal = direction === 'horizontal';
  const isDragging = useRef(false);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;

    const container = containerRef.current;
    const size = isHorizontal ? container.offsetHeight : container.offsetWidth;
    const movement = isHorizontal ? -e.movementY : -e.movementX;
    const deltaPercent = (movement / size) * 100;

    const currentSize = Number(settingsMap.get()[settingKey]) || (isHorizontal ? 35 : 30);
    const newSize = Math.max(5, Math.min(85, currentSize + deltaPercent));
    settingsMap.setKey(settingKey, newSize);
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className={`
        group flex items-center justify-center shrink-0
        ${isHorizontal ? 'h-2 cursor-row-resize w-full' : 'w-2 cursor-col-resize h-full'}
        hover:bg-foreground/10 active:bg-foreground/20
      `}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`
          ${isHorizontal ? 'w-12 h-1' : 'w-1 h-12'}
          bg-foreground/20 group-hover:bg-foreground/40
          rounded-full
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

  const showRightPanel = !isZen && panelPosition === 'right';
  const showBottomPanel = !isZen && panelPosition === 'bottom';

  return (
    <div ref={containerElRef} className="h-full flex flex-col relative" {...editorProps}>
      <Loader active={pending} />
      <Header context={context} />
      <div className="grow flex relative overflow-hidden">
        <Code containerRef={containerRef} editorRef={editorRef} init={init} />
        {showRightPanel && isPanelOpen && (
          <ResizeHandle direction="vertical" containerRef={containerElRef} settingKey="panelSizeRight" />
        )}
        {showRightPanel && (
          <div className="shrink-0 overflow-hidden h-full" style={{ width: isPanelOpen ? `${panelSizeRight}%` : '48px' }}>
            <VerticalPanel context={context} />
          </div>
        )}
      </div>
      <UserFacingErrorMessage error={error} />
      {showBottomPanel && isPanelOpen && (
        <ResizeHandle direction="horizontal" containerRef={containerElRef} settingKey="panelSizeBottom" />
      )}
      {showBottomPanel && (
        <div className="shrink-0 overflow-hidden" style={{ height: isPanelOpen ? `${panelSizeBottom}%` : '48px' }}>
          <HorizontalPanel context={context} />
        </div>
      )}
    </div>
  );
}
