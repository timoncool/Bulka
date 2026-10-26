import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { t } from '../i18n/index.mjs';
import { currentLang, href } from '../i18n/lang.mjs';
import { countNewsEvent as count } from '../hub/newsEvents.mjs';

const RELEASES_URL = 'https://github.com/timoncool/Bulka/releases/latest';
const DISMISSED_KEY = 'bulka-hub-news-dismissed';

/** The hub that served the notices script: its media and events live there. */
function hubOrigin() {
  const script = document.querySelector('script[data-app="bulka"][src*="/embed/notices.js"]');
  return script ? new URL(script.src).origin : null;
}

function readDismissed() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'));
  } catch (e) {
    console.warn('[hub news] the closed news could not be read:', e);
    return new Set();
  }
}

function content(item) {
  return item.content[currentLang()] ?? item.content.en ?? Object.values(item.content)[0];
}

function newestFirst(a, b) {
  return (b.date ?? '').localeCompare(a.date ?? '');
}

function openTarget(target) {
  if (target === 'update') return RELEASES_URL;
  if (target === 'news') return href('/whatsnew');
  return href('/');
}

/** One news item: shown is counted once, when the card is on screen. */
function NewsCard({ item, hub, onDismiss }) {
  const card = useRef(null);
  const text = content(item);
  useEffect(() => {
    const element = card.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        count(item.id, 'shown');
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [item.id]);

  const press = (button, index) => {
    if (button.action === 'dismiss') {
      count(item.id, 'dismissed');
      onDismiss(item.id);
      return;
    }
    count(item.id, 'clicked', `b${index}`);
    const url = button.action === 'url' ? button.url : openTarget(button.target);
    if (button.action === 'url') window.open(url, '_blank', 'noopener');
    else window.location.href = url;
  };

  return (
    <article ref={card} className="rounded-lg bg-gray-800/50 border border-gray-700 overflow-hidden">
      {item.image && hub && (
        <img src={`${hub}/v1/media/${item.image}`} alt="" className="w-full max-h-72 object-cover" />
      )}
      <div className="p-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
          {item.date && <time dateTime={item.date}>{item.date}</time>}
          {item.ad?.label && (
            <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300">
              {t('news.ad')}
              {item.ad.erid ? ` · erid: ${item.ad.erid}` : ''}
            </span>
          )}
        </div>
        {text.title && <h3 className="text-lg font-semibold text-white">{text.title}</h3>}
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              a: ({ href: link, children }) => (
                <a href={link} target="_blank" rel="noopener" onClick={() => count(item.id, 'clicked', 'link')}>
                  {children}
                </a>
              ),
            }}
          >
            {text.body}
          </ReactMarkdown>
        </div>
        {text.buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {text.buttons.map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={() => press(button, index)}
                className={
                  button.style === 'primary'
                    ? 'px-3 py-1.5 rounded bg-foreground text-background text-sm font-semibold'
                    : 'px-3 py-1.5 rounded bg-gray-700 text-gray-100 text-sm'
                }
              >
                {button.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/** The hub's news items (`kind: news`) for the What's New page, newest first. */
export function HubNews() {
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState(() => new Set());
  const [hub, setHub] = useState(null);

  useEffect(() => {
    setDismissed(readDismissed());
    const take = (list) => {
      setHub(hubOrigin());
      setItems(list.filter((item) => item.kind === 'news' && content(item)).sort(newestFirst));
    };
    if (window.StudioHub) take(window.StudioHub.items());
    const listener = (event) => take(event.detail);
    addEventListener('studiohub:items', listener);
    return () => removeEventListener('studiohub:items', listener);
  }, []);

  const dismiss = (id) => {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
    } catch (e) {
      console.warn('[hub news] the closed news could not be remembered:', e);
    }
  };

  const visible = items.filter((item) => !dismissed.has(item.id));
  if (!visible.length) return null;
  return (
    <section className="mb-10 space-y-4">
      <h2 className="text-2xl font-bold">{t('news.title')}</h2>
      {visible.map((item) => (
        <NewsCard key={item.id} item={item} hub={hub} onDismiss={dismiss} />
      ))}
    </section>
  );
}
