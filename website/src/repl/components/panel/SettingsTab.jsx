import { defaultSettings, settingsMap, useSettings } from '../../../settings.mjs';
import { themes } from '@strudel/codemirror';
import { Textbox } from '../textbox/Textbox.jsx';
import { isUdels } from '../../util.mjs';
import { ButtonGroup } from './Forms.jsx';
import { AudioDeviceSelector } from './AudioDeviceSelector.jsx';
import { AudioEngineTargetSelector } from './AudioEngineTargetSelector.jsx';
import { confirmDialog } from '../../util.mjs';
import { DEFAULT_MAX_POLYPHONY, setMaxPolyphony, setMultiChannelOrbits } from '@strudel/webaudio';
import { ActionButton, SpecialActionButton } from '../button/action-button.jsx';
import { ImportPrebakeScriptButton } from './ImportPrebakeScriptButton.jsx';

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

const RELOAD_MSG = 'Для применения этой настройки требуется перезагрузка страницы. ОК?';

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
    patternAutoStart,
    includePrebakeScriptInShare,
  } = useSettings();
  const shouldAlwaysSync = isUdels();
  const canChangeAudioDevice = AudioContext.prototype.setSinkId != null;
  return (
    <div className="text-foreground p-4 space-y-4 w-full" style={{ fontFamily }}>
      {canChangeAudioDevice && (
        <FormItem label="Аудио устройство">
          <AudioDeviceSelector
            isDisabled={started}
            audioDeviceName={audioDeviceName}
            onChange={(audioDeviceName) => {
              confirmDialog(RELOAD_MSG).then((r) => {
                if (r == true) {
                  settingsMap.setKey('audioDeviceName', audioDeviceName);
                  return window.location.reload();
                }
              });
            }}
          />
        </FormItem>
      )}
      <FormItem label="Цель аудио движка">
        <AudioEngineTargetSelector
          target={audioEngineTarget}
          onChange={(target) => {
            confirmDialog(RELOAD_MSG).then((r) => {
              if (r == true) {
                settingsMap.setKey('audioEngineTarget', target);
                return window.location.reload();
              }
            });
          }}
        />
      </FormItem>

      <FormItem label="Максимальная полифония">
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
          label="Многоканальные орбиты"
          onChange={(cbEvent) => {
            const val = cbEvent.target.checked;
            confirmDialog(RELOAD_MSG).then((r) => {
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
      <FormItem label="Тема">
        <SelectInput options={themeOptions} value={theme} onChange={(theme) => settingsMap.setKey('theme', theme)} />
      </FormItem>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        <FormItem label="Шрифт">
          <SelectInput
            options={fontFamilyOptions}
            value={fontFamily}
            onChange={(fontFamily) => settingsMap.setKey('fontFamily', fontFamily)}
          />
        </FormItem>
        <FormItem label="Размер шрифта">
          <NumberSlider
            value={fontSize}
            onChange={(fontSize) => settingsMap.setKey('fontSize', fontSize)}
            min={10}
            max={40}
            step={2}
          />
        </FormItem>
      </div>
      <FormItem label="Prebake-скрипт">
        <ImportPrebakeScriptButton />
        <Checkbox
          label="Включать prebake-скрипт в ссылку"
          onChange={(cbEvent) => settingsMap.setKey('includePrebakeScriptInShare', cbEvent.target.checked)}
          value={includePrebakeScriptInShare}
        />
      </FormItem>

      <FormItem label="Клавиши">
        <ButtonGroup
          value={keybindings}
          onChange={(keybindings) => settingsMap.setKey('keybindings', keybindings)}
          items={{ codemirror: 'Codemirror', vim: 'Vim', emacs: 'Emacs', vscode: 'VSCode' }}
        ></ButtonGroup>
      </FormItem>
      <FormItem label="Позиция панели">
        <ButtonGroup
          value={panelPosition}
          onChange={(value) => settingsMap.setKey('panelPosition', value)}
          items={{ bottom: 'Снизу', right: 'Справа' }}
        ></ButtonGroup>
      </FormItem>
      <FormItem label="Открывать панель по:">
        <ButtonGroup
          value={togglePanelTrigger}
          onChange={(value) => settingsMap.setKey('togglePanelTrigger', value)}
          items={{ click: 'Клик', hover: 'Наведение' }}
        />
      </FormItem>
      <FormItem label="Дополнительные настройки">
        <Checkbox
          label="Подсветка парных скобок"
          onChange={(cbEvent) => settingsMap.setKey('isBracketMatchingEnabled', cbEvent.target.checked)}
          value={isBracketMatchingEnabled}
        />
        <Checkbox
          label="Автозакрытие скобок"
          onChange={(cbEvent) => settingsMap.setKey('isBracketClosingEnabled', cbEvent.target.checked)}
          value={isBracketClosingEnabled}
        />
        <Checkbox
          label="Показывать номера строк"
          onChange={(cbEvent) => settingsMap.setKey('isLineNumbersDisplayed', cbEvent.target.checked)}
          value={isLineNumbersDisplayed}
        />
        <Checkbox
          label="Подсветка активной строки"
          onChange={(cbEvent) => settingsMap.setKey('isActiveLineHighlighted', cbEvent.target.checked)}
          value={isActiveLineHighlighted}
        />
        <Checkbox
          label="Подсветка событий в коде"
          onChange={(cbEvent) => settingsMap.setKey('isPatternHighlightingEnabled', cbEvent.target.checked)}
          value={isPatternHighlightingEnabled}
        />
        <Checkbox
          label="Автодополнение"
          onChange={(cbEvent) => settingsMap.setKey('isAutoCompletionEnabled', cbEvent.target.checked)}
          value={isAutoCompletionEnabled}
        />
        <Checkbox
          label="Подсказки по Ctrl и наведению"
          onChange={(cbEvent) => settingsMap.setKey('isTooltipEnabled', cbEvent.target.checked)}
          value={isTooltipEnabled}
        />
        <Checkbox
          label="Перенос строк"
          onChange={(cbEvent) => settingsMap.setKey('isLineWrappingEnabled', cbEvent.target.checked)}
          value={isLineWrappingEnabled}
        />
        <Checkbox
          label="Отступы по Tab"
          onChange={(cbEvent) => settingsMap.setKey('isTabIndentationEnabled', cbEvent.target.checked)}
          value={isTabIndentationEnabled}
        />
        <Checkbox
          label="Мульти-курсор (Cmd/Ctrl+Click)"
          onChange={(cbEvent) => settingsMap.setKey('isMultiCursorEnabled', cbEvent.target.checked)}
          value={isMultiCursorEnabled}
        />
        <Checkbox
          label="Вспышка при выполнении"
          onChange={(cbEvent) => settingsMap.setKey('isFlashEnabled', cbEvent.target.checked)}
          value={isFlashEnabled}
        />
        <Checkbox
          label="Синхронизация между вкладками"
          onChange={(cbEvent) => {
            const newVal = cbEvent.target.checked;
            confirmDialog(RELOAD_MSG).then((r) => {
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
          label="Скрыть верхние кнопки"
          onChange={(cbEvent) => settingsMap.setKey('isButtonRowHidden', cbEvent.target.checked)}
          value={isButtonRowHidden}
        />
        <Checkbox
          label="Отключить CSS-анимации"
          onChange={(cbEvent) => settingsMap.setKey('isCSSAnimationDisabled', cbEvent.target.checked)}
          value={isCSSAnimationDisabled}
        />
        <Checkbox
          label="Авто-старт паттерна при изменении"
          onChange={(cbEvent) => settingsMap.setKey('patternAutoStart', cbEvent.target.checked)}
          value={patternAutoStart}
        />
      </FormItem>
      <FormItem label="Дзен-режим">Нажми на логотип слева вверху!</FormItem>
      <FormItem label="Сброс настроек">
        <SpecialActionButton
          onClick={() => {
            confirmDialog('Уверены?').then((r) => {
              if (r) {
                const { userPatterns } = settingsMap.get(); // keep current patterns
                settingsMap.set({ ...defaultSettings, userPatterns });
              }
            });
          }}
        >
          восстановить настройки
        </SpecialActionButton>
      </FormItem>
    </div>
  );
}
