import { currentLang } from '../i18n/lang.mjs';
import { DIRECT_URL, PROXY_URL, StudioHub } from './studioHub.mjs';

let hub = null;

function build() {
  const meta = document.querySelector('meta[name="bulka-build"]');
  if (!meta) throw new Error('studio hub: <meta name="bulka-build"> is missing');
  return JSON.parse(meta.content);
}

function platform() {
  const p = (navigator.userAgentData?.platform || navigator.userAgent).toLowerCase();
  if (p.includes('android')) return 'Android';
  // iPadOS Safari presents itself as a Mac; only the touch screen tells them apart
  if (/iphone|ipad|ios/.test(p) || (p.includes('mac') && navigator.maxTouchPoints > 1)) return 'iOS';
  if (p.includes('win')) return 'Windows';
  if (p.includes('mac')) return 'macOS';
  if (p.includes('linux') || p.includes('x11')) return 'Linux';
  return 'other';
}

function browser() {
  const ua = navigator.userAgent;
  if (ua.includes('YaBrowser/')) return 'Yandex';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/')) return 'Opera';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/')) return 'Safari';
  return 'other';
}

/** The hub script counts notice impressions only while statistics are on. When it failed to load from every hub
 * address (HeadCommon.astro has logged that) there is nothing to switch. */
function noticeEvents(on) {
  const script = document.querySelector('script[data-app="bulka"]');
  if (script) script.dataset.events = on ? 'on' : 'off';
}

/** The hub of this page, or null where statistics are not wired (local dev without PUBLIC_STUDIO_HUB_URL). */
export function initBulkaHub() {
  if (hub || typeof window === 'undefined') return hub;
  const { desktop, version, hubUrl, machine } = build();
  if (import.meta.env.DEV && !hubUrl) {
    console.info('[studio hub] dev: statistics are off; set PUBLIC_STUDIO_HUB_URL to send them to a local hub');
    return null;
  }
  hub = new StudioHub({
    app: 'bulka',
    version,
    os: desktop ? `desktop ${platform()}` : `web ${platform()} ${browser()}`,
    backend: desktop ? 'desktop' : 'web',
    lang: currentLang,
    urls: hubUrl ? [hubUrl] : [DIRECT_URL, PROXY_URL],
    storage: window.localStorage,
    fetch: window.fetch.bind(window),
    onTelemetry: noticeEvents,
    machine,
  });
  noticeEvents(hub.telemetryOn());
  window.__bulkaHub = hub;
  hub.start(window);
  return hub;
}

export const getBulkaHub = () => hub;

// Like the studios: `<kind>_done` for finished work, `<kind>_failed` plus the scrubbed reason for a failure.
export function recordDone(kind) {
  hub?.count(`${kind}_done`);
}

export function recordFailed(kind, reason) {
  if (!hub) return;
  hub.count(`${kind}_failed`);
  hub.failed(kind, reason);
}

/** The AI provider as the set and the model id as its part, kept as typed (`openrouter`, `google/gemma-3:free`). */
export function recordModel(provider, model) {
  hub?.usedModels(provider, [model]);
}
