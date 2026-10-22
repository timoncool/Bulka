import { useState } from 'react';
import { t } from '../../i18n/index.mjs';
import { getBulkaHub } from '../../hub/bulkaHub.mjs';

/** What a report looks like today, or the shape of an empty one before anything was counted. */
export function TelemetryPreview({ hub }) {
  const day = new Date().toISOString().slice(0, 10);
  const report = hub.reportFor(day) ?? {
    schema: 1,
    install: t('telemetry.previewInstall'),
    ...(hub.config.machine ? { machine: hub.config.machine } : {}),
    app: hub.config.app,
    version: hub.config.version,
    day,
    os: hub.config.os,
    ui_lang: hub.config.lang(),
    gpu: { vendor: 'none', vram_gb: '?', backend: hub.config.backend },
    counts: { pattern_play_done: 12, record_done: 1, agent_reply_done: 3 },
    models: [],
    model_sets: [{ set: 'free', components: ['gpt-oss-20b'], count: 3 }],
    notices: {},
  };
  return (
    <pre className="text-[11px] bg-background p-2 rounded border border-foreground/20 max-h-48 overflow-auto whitespace-pre-wrap">
      {JSON.stringify(report, null, 2)}
    </pre>
  );
}

/** First run: nothing is counted or sent until the person presses "done" with the box checked. */
export function TelemetryConsent() {
  const hub = getBulkaHub();
  const [open, setOpen] = useState(() => !!hub && !hub.state.acknowledged);
  const [checked, setChecked] = useState(true);
  const [preview, setPreview] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed bottom-4 left-4 z-[200] max-w-sm rounded-lg border border-foreground/20 bg-lineHighlight p-4 text-sm text-foreground shadow-lg space-y-2">
      <div className="font-semibold">{t('telemetry.title')}</div>
      <p className="opacity-80">{t('telemetry.about')}</p>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        {t('telemetry.checkbox')}
      </label>
      <button type="button" className="underline opacity-70 hover:opacity-100" onClick={() => setPreview(!preview)}>
        {t('telemetry.what')}
      </button>
      {preview && <TelemetryPreview hub={hub} />}
      <div className="flex justify-end">
        <button
          type="button"
          className="px-3 py-1 rounded border border-foreground/30 hover:bg-background"
          onClick={() => {
            hub.acknowledge(checked);
            setOpen(false);
          }}
        >
          {t('telemetry.done')}
        </button>
      </div>
    </div>
  );
}
