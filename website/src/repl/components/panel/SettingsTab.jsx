import { defaultSettings, settingsMap, storePrebakeScript, useSettings } from '../../../settings.mjs';
import { themes } from '@strudel/codemirror';
import { Textbox } from '../textbox/Textbox.jsx';
import { isUdels } from '../../util.mjs';
import { ButtonGroup } from './Forms.jsx';
import { AudioDeviceSelector } from './AudioDeviceSelector.jsx';
import { AudioEngineTargetSelector } from './AudioEngineTargetSelector.jsx';
import { confirmDialog } from '../../util.mjs';
import { DEFAULT_MAX_POLYPHONY, setMaxPolyphony, setMultiChannelOrbits } from '@strudel/webaudio';
import { ActionButton, SpecialActionButton } from '../button/action-button.jsx';
import { exportScript, ImportPrebakeScriptButton } from './ImportPrebakeScriptButton.jsx';
import { PrebakeCodeMirror } from '../../prebakeCodeMirror.mjs';
import { useEffect, useRef, useState } from 'react';
import { getBulkaHub } from '../../../hub/bulkaHub.mjs';
import { TelemetryPreview } from '../TelemetryConsent';
import { McpPanel } from './McpPanel.jsx';
import { t } from '../../../i18n/index.mjs';

function Checkbox({ label, value, onChange, disabled = false }) {
  return (
    <label>
      <input disabled={disabled} type="checkbox" checked={value} onChange={onChange} />
      {' ' + label}
    </label>
  );
}

function SelectInput({ value, options, onChange }) {
  return (
    <select
      className="p-2 bg-background rounded-md text-foreground  border-foreground"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {Object.entries(options).map(([k, label]) => (
        <option key={k} className="bg-background" value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}

function NumberSlider({ value, onChange, step = 1, ...rest }) {
  return (
    <div className="flex space-x-2 gap-1">
      <input
        className="p-2 grow"
        type="range"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        {...rest}
      />
      <input
        type="number"
        value={value}
        step={step}
        className="w-16 bg-background rounded-md"
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function FormItem({ label, children, sublabel }) {
  return (
    <div className="grid gap-2">
      <label>{label}</label>
      {children}
    </div>
  );
}

const themeOptions = Object.fromEntries(Object.keys(themes).map((k) => [k, k]));
const fontFamilyOptions = {
  monospace: 'monospace',
  Courier: 'Courier',
  CutiePi: 'CutiePi',
  JetBrains: 'JetBrains',
  Hack: 'Hack',
  FiraCode: 'FiraCode',
  'FiraCode-SemiBold': 'FiraCode SemiBold',
  teletext: 'teletext',
  tic80: 'tic80',
  mode7: 'mode7',
  BigBlueTerminal: 'BigBlueTerminal',
  x3270: 'x3270',
  Monocraft: 'Monocraft',
  PressStart: 'PressStart2P',
  'we-come-in-peace': 'we-come-in-peace',
  galactico: 'galactico',
};

const reloadMessage = () => t('settings.reloadConfirm');

function PrebakeEditor() {
  const { includePrebakeScriptInShare, prebakeScript } = useSettings();
  const editorRef = useRef();
  useEffect(() => () => editorRef.current?.cleanup(), []);
  return (
    <div className="flex flex-col gap-2">
      <section
        className="code-container border border-muted rounded-md max-h-64 overflow-auto"
        ref={(el) => {
          if (!el || editorRef.current) return;
          editorRef.current = new PrebakeCodeMirror(prebakeScript, (code) => storePrebakeScript(code), el);
        }}
      ></section>
      <div className="flex flex-wrap items-center gap-3">
        <ActionButton label={t('settings.prebakeSave')} onClick={() => editorRef.current?.savePrebake()} />
        <ActionButton label={t('settings.prebakeExport')} onClick={() => exportScript(prebakeScript)} />
        <ImportPrebakeScriptButton updateEditor={(code) => editorRef.current?.setCode(code)} />
      </div>
      <Checkbox
        label={t('settings.prebakeInShare')}
        onChange={(cbEvent) => settingsMap.setKey('includePrebakeScriptInShare', cbEvent.target.checked)}
        value={includePrebakeScriptInShare}
      />
    </div>
  );
}

function TelemetrySetting() {
  const hub = getBulkaHub();
  const [on, setOn] = useState(() => !!hub?.telemetryOn());
  const [preview, setPreview] = useState(false);
  if (!hub) return null;
  return (
    <FormItem label={t('telemetry.title')}>
      <Checkbox
        label={t('telemetry.checkbox')}
        value={on}
        onChange={(cbEvent) => {
          if (hub.state.acknowledged) hub.setTelemetry(cbEvent.target.checked);
          else hub.acknowledge(cbEvent.target.checked);
          setOn(hub.telemetryOn());
        }}
      />
      <p className="text-xs opacity-70">{t('telemetry.about')}</p>
      <button
        type="button"
        className="text-xs underline opacity-70 hover:opacity-100 text-left"
        onClick={() => setPreview(!preview)}
      >
        {t('telemetry.what')}
      </button>
      {preview && <TelemetryPreview hub={hub} />}
    </FormItem>
  );
}

export function SettingsTab({ started }) {
  const {
    theme,
    keybindings,
    isBracketClosingEnabled,
    isBracketMatchingEnabled,
    isLineNumbersDisplayed,
    isPatternHighlightingEnabled,
    isActiveLineHighlighted,
    isAutoCompletionEnabled,
    isTooltipEnabled,
    isFlashEnabled,
    isButtonRowHidden,
    isCSSAnimationDisabled,
    isSyncEnabled,
    isLineWrappingEnabled,
    fontSize,
    fontFamily,
    panelPosition,
    audioDeviceName,
    audioEngineTarget,
    togglePanelTrigger,
    maxPolyphony,
    multiChannelOrbits,
    isTabIndentationEnabled,
    isMultiCursorEnabled,
    isBlockBasedEvalEnabled,
    patternAutoStart,
  } = useSettings();
  const shouldAlwaysSync = isUdels();
  const canChangeAudioDevice = AudioContext.prototype.setSinkId != null;
  return (
    <div className="text-foreground p-4 space-y-4 w-full" style={{ fontFamily }}>
      <McpPanel />
      {canChangeAudioDevice && (
        <FormItem label={t('settings.audioDevice')}>
          <AudioDeviceSelector
            isDisabled={started}
            audioDeviceName={audioDeviceName}
            onChange={(audioDeviceName) => {
              confirmDialog(reloadMessage()).then((r) => {
                if (r == true) {
                  settingsMap.setKey('audioDeviceName', audioDeviceName);
                  return window.location.reload();
                }
              });
            }}
          />
        </FormItem>
      )}
      <FormItem label={t('settings.audioEngine')}>
        <AudioEngineTargetSelector
          target={audioEngineTarget}
          onChange={(target) => {
            confirmDialog(reloadMessage()).then((r) => {
              if (r == true) {
                settingsMap.setKey('audioEngineTarget', target);
                return window.location.reload();
              }
            });
          }}
        />
      </FormItem>

      <FormItem label={t('settings.maxPolyphony')}>
        <Textbox
          min={1}
          max={Infinity}
          onBlur={(e) => {
            let v = parseInt(e.target.value);
            v = isNaN(v) ? DEFAULT_MAX_POLYPHONY : v;
            setMaxPolyphony(v);
            settingsMap.setKey('maxPolyphony', v);
          }}
          onChange={(v) => {
            v = Math.max(1, parseInt(v));
            settingsMap.setKey('maxPolyphony', isNaN(v) ? undefined : v);
          }}
          type="number"
          placeholder=""
          value={maxPolyphony ?? ''}
        />
      </FormItem>
      <FormItem>
        <Checkbox
          label={t('settings.multiOrbits')}
          onChange={(cbEvent) => {
            const val = cbEvent.target.checked;
            confirmDialog(reloadMessage()).then((r) => {
              if (r == true) {
                settingsMap.setKey('multiChannelOrbits', val);
                setMultiChannelOrbits(val);
                return window.location.reload();
              }
            });
          }}
          value={multiChannelOrbits}
        />
      </FormItem>
      <FormItem label={t('settings.theme')}>
        <SelectInput options={themeOptions} value={theme} onChange={(theme) => settingsMap.setKey('theme', theme)} />
      </FormItem>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        <FormItem label={t('settings.font')}>
          <SelectInput
            options={fontFamilyOptions}
            value={fontFamily}
            onChange={(fontFamily) => settingsMap.setKey('fontFamily', fontFamily)}
          />
        </FormItem>
        <FormItem label={t('settings.fontSize')}>
          <NumberSlider
            value={fontSize}
            onChange={(fontSize) => settingsMap.setKey('fontSize', fontSize)}
            min={10}
            max={40}
            step={2}
          />
        </FormItem>
      </div>
      <FormItem label={t('settings.prebake')}>
        <PrebakeEditor />
      </FormItem>

      <FormItem label={t('settings.keybindings')}>
        <ButtonGroup
          value={keybindings}
          onChange={(keybindings) => settingsMap.setKey('keybindings', keybindings)}
          items={{ codemirror: 'Codemirror', vim: 'Vim', emacs: 'Emacs', helix: 'Helix', vscode: 'VSCode' }}
        ></ButtonGroup>
      </FormItem>
      <FormItem label={t('settings.panelPosition')}>
        <ButtonGroup
          value={panelPosition}
          onChange={(value) => settingsMap.setKey('panelPosition', value)}
          items={{ bottom: t('settings.panelBottom'), right: t('settings.panelRight') }}
        ></ButtonGroup>
      </FormItem>
      <FormItem label={t('settings.panelTrigger')}>
        <ButtonGroup
          value={togglePanelTrigger}
          onChange={(value) => settingsMap.setKey('togglePanelTrigger', value)}
          items={{ click: t('settings.panelClick'), hover: t('settings.panelHover') }}
        />
      </FormItem>
      <FormItem label={t('settings.more')}>
        <Checkbox
          label={t('settings.bracketMatching')}
          onChange={(cbEvent) => settingsMap.setKey('isBracketMatchingEnabled', cbEvent.target.checked)}
          value={isBracketMatchingEnabled}
        />
        <Checkbox
          label={t('settings.bracketClosing')}
          onChange={(cbEvent) => settingsMap.setKey('isBracketClosingEnabled', cbEvent.target.checked)}
          value={isBracketClosingEnabled}
        />
        <Checkbox
          label={t('settings.lineNumbers')}
          onChange={(cbEvent) => settingsMap.setKey('isLineNumbersDisplayed', cbEvent.target.checked)}
          value={isLineNumbersDisplayed}
        />
        <Checkbox
          label={t('settings.activeLine')}
          onChange={(cbEvent) => settingsMap.setKey('isActiveLineHighlighted', cbEvent.target.checked)}
          value={isActiveLineHighlighted}
        />
        <Checkbox
          label={t('settings.patternHighlight')}
          onChange={(cbEvent) => settingsMap.setKey('isPatternHighlightingEnabled', cbEvent.target.checked)}
          value={isPatternHighlightingEnabled}
        />
        <Checkbox
          label={t('settings.autocomplete')}
          onChange={(cbEvent) => settingsMap.setKey('isAutoCompletionEnabled', cbEvent.target.checked)}
          value={isAutoCompletionEnabled}
        />
        <Checkbox
          label={t('settings.tooltips')}
          onChange={(cbEvent) => settingsMap.setKey('isTooltipEnabled', cbEvent.target.checked)}
          value={isTooltipEnabled}
        />
        <Checkbox
          label={t('settings.lineWrap')}
          onChange={(cbEvent) => settingsMap.setKey('isLineWrappingEnabled', cbEvent.target.checked)}
          value={isLineWrappingEnabled}
        />
        <Checkbox
          label={t('settings.tabIndent')}
          onChange={(cbEvent) => settingsMap.setKey('isTabIndentationEnabled', cbEvent.target.checked)}
          value={isTabIndentationEnabled}
        />
        <Checkbox
          label={t('settings.multiCursor')}
          onChange={(cbEvent) => settingsMap.setKey('isMultiCursorEnabled', cbEvent.target.checked)}
          value={isMultiCursorEnabled}
        />
        <Checkbox
          label={t('settings.blockEval')}
          onChange={(cbEvent) => settingsMap.setKey('isBlockBasedEvalEnabled', cbEvent.target.checked)}
          value={isBlockBasedEvalEnabled}
        />
        <Checkbox
          label={t('settings.flash')}
          onChange={(cbEvent) => settingsMap.setKey('isFlashEnabled', cbEvent.target.checked)}
          value={isFlashEnabled}
        />
        <Checkbox
          label={t('settings.sync')}
          onChange={(cbEvent) => {
            const newVal = cbEvent.target.checked;
            confirmDialog(reloadMessage()).then((r) => {
              if (r) {
                settingsMap.setKey('isSyncEnabled', newVal);
                window.location.reload();
              }
            });
          }}
          disabled={shouldAlwaysSync}
          value={isSyncEnabled}
        />
        <Checkbox
          label={t('settings.hideButtons')}
          onChange={(cbEvent) => settingsMap.setKey('isButtonRowHidden', cbEvent.target.checked)}
          value={isButtonRowHidden}
        />
        <Checkbox
          label={t('settings.noAnimations')}
          onChange={(cbEvent) => settingsMap.setKey('isCSSAnimationDisabled', cbEvent.target.checked)}
          value={isCSSAnimationDisabled}
        />
        <Checkbox
          label={t('settings.autoStart')}
          onChange={(cbEvent) => settingsMap.setKey('patternAutoStart', cbEvent.target.checked)}
          value={patternAutoStart}
        />
      </FormItem>
      <FormItem label={t('settings.zen')}>{t('settings.zenHint')}</FormItem>
      <TelemetrySetting />
      <FormItem label={t('settings.reset')}>
        <SpecialActionButton
          onClick={() => {
            confirmDialog(t('settings.resetConfirm')).then((r) => {
              if (r) {
                const { userPatterns } = settingsMap.get(); // keep current patterns
                settingsMap.set({ ...defaultSettings, userPatterns });
              }
            });
          }}
        >
          {t('settings.resetButton')}
        </SpecialActionButton>
      </FormItem>
    </div>
  );
}
