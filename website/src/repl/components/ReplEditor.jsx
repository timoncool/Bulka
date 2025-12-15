import Loader from '@src/repl/components/Loader';
import { HorizontalPanel, VerticalPanel } from '@src/repl/components/panel/Panel';
import { Code } from '@src/repl/components/Code';
import UserFacingErrorMessage from '@src/repl/components/UserFacingErrorMessage';
import { Header } from './Header';
import { useSettings, settingsMap } from '@src/settings.mjs';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useCallback } from 'react';

// Resize handle component with visual feedback
function ResizeHandle({ direction = 'horizontal' }) {
  const isHorizontal = direction === 'horizontal';
  return (
    <PanelResizeHandle
      className={`
        group relative flex items-center justify-center
        ${isHorizontal ? 'h-2 cursor-row-resize' : 'w-2 cursor-col-resize'}
        bg-transparent hover:bg-foreground/10 active:bg-foreground/20
        transition-colors duration-150
      `}
    >
      {/* Visual indicator */}
      <div
        className={`
          ${isHorizontal ? 'w-12 h-1' : 'w-1 h-12'}
          bg-foreground/20 group-hover:bg-foreground/40 group-active:bg-foreground/60
          rounded-full transition-colors duration-150
        `}
      />
    </PanelResizeHandle>
  );
}

export default function ReplEditor(Props) {
  const { context, ...editorProps } = Props;
  const { containerRef, editorRef, error, init, pending } = context;
  const settings = useSettings();
  const { panelPosition, isZen, isPanelOpen, panelSizeBottom, panelSizeRight } = settings;

  // Handler for saving panel sizes to localStorage
  const handleLayoutChange = useCallback((sizes) => {
    if (panelPosition === 'bottom' && sizes.length === 2) {
      // sizes[1] is the bottom panel size in percentage
      settingsMap.setKey('panelSizeBottom', sizes[1]);
    } else if (panelPosition === 'right' && sizes.length === 2) {
      // sizes[1] is the right panel size in percentage
      settingsMap.setKey('panelSizeRight', sizes[1]);
    }
  }, [panelPosition]);

  // Zen mode - no panels
  if (isZen) {
    return (
      <div className="h-full flex flex-col relative" {...editorProps}>
        <Loader active={pending} />
        <Header context={context} />
        <div className="grow flex relative overflow-hidden">
          <Code containerRef={containerRef} editorRef={editorRef} init={init} />
        </div>
        <UserFacingErrorMessage error={error} />
      </div>
    );
  }

  // Right panel layout
  if (panelPosition === 'right') {
    return (
      <div className="h-full flex flex-col relative" {...editorProps}>
        <Loader active={pending} />
        <Header context={context} />
        <PanelGroup
          key="horizontal"
          direction="horizontal"
          onLayout={handleLayoutChange}
          className="grow overflow-hidden"
        >
          <Panel defaultSize={100 - (isPanelOpen ? panelSizeRight : 3)} minSize={30}>
            <Code containerRef={containerRef} editorRef={editorRef} init={init} />
          </Panel>
          {isPanelOpen && <ResizeHandle direction="vertical" />}
          <Panel
            defaultSize={isPanelOpen ? panelSizeRight : 3}
            minSize={isPanelOpen ? 15 : 3}
            maxSize={isPanelOpen ? 60 : 3}
            collapsible={true}
          >
            <VerticalPanel context={context} />
          </Panel>
        </PanelGroup>
        <UserFacingErrorMessage error={error} />
      </div>
    );
  }

  // Bottom panel layout
  return (
    <div className="h-full flex flex-col relative" {...editorProps}>
      <Loader active={pending} />
      <Header context={context} />
      <PanelGroup
        key="vertical"
        direction="vertical"
        onLayout={handleLayoutChange}
        className="grow overflow-hidden"
      >
        <Panel defaultSize={100 - (isPanelOpen ? panelSizeBottom : 5)} minSize={30}>
          <div className="h-full flex relative overflow-hidden">
            <Code containerRef={containerRef} editorRef={editorRef} init={init} />
          </div>
        </Panel>
        {isPanelOpen && <ResizeHandle direction="horizontal" />}
        <Panel
          defaultSize={isPanelOpen ? panelSizeBottom : 5}
          minSize={isPanelOpen ? 15 : 5}
          maxSize={isPanelOpen ? 70 : 5}
          collapsible={true}
        >
          <HorizontalPanel context={context} />
        </Panel>
      </PanelGroup>
      <UserFacingErrorMessage error={error} />
    </div>
  );
}
