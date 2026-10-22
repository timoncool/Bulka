import { useState } from 'react';
import cx from '@src/cx.mjs';
import { currentLang, t } from '../../../i18n/index.mjs';

// Вкладка «Поддержать» — варианты доната автора (как в остальных его приложениях).
const CRYPTO = [
  { name: 'BTC — Bitcoin', addr: '1E7dHL22RpyhJGVpcvKdbyZgksSYkYeEBC' },
  { name: 'ETH — Ethereum (ERC20)', addr: '0xb5db65adf478983186d4897ba92fe2c25c594a0c' },
  { name: 'USDT — Tether (TRC20)', addr: 'TQST9Lp2TjK6FiVkn4fwfGUee7NmkxEE7C' },
];

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="grid gap-1">
      <span className="text-xs opacity-70">{label}</span>
      <div className="flex gap-2 items-center">
        <code className="text-xs bg-background px-2 py-1 rounded border border-foreground/20 flex-1 overflow-x-auto whitespace-nowrap">
          {value}
        </code>
        <button
          onClick={copy}
          title={t('common.copy')}
          aria-label={t('common.copy')}
          className="px-2 py-1 text-sm rounded border border-foreground/30 hover:bg-lineBackground shrink-0"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  );
}

const linkBtn =
  'block text-center px-4 py-2 rounded-md border border-foreground/30 hover:bg-lineBackground font-medium';

export function SupportTab() {
  return (
    <div className="text-foreground p-4 space-y-4 w-full max-w-2xl">
      <h3 className="text-base font-medium">{t('support.title')}</h3>
      {currentLang() === 'en' ? (
        <p className="text-sm opacity-80">
          I'm Ilya (
          <a className="underline" href="https://t.me/nerual_dreming" target="_blank" rel="noopener">
            Nerual Dreming
          </a>
          ) and I make open source AI tools you can run locally: free, no cloud, no subscriptions. Bulka is free too.
          Servers, domains, test hardware and time are not. Donations let me keep building instead of looking for a way
          to pay the bills.
        </p>
      ) : (
        <p className="text-sm opacity-80">
          Я Илья (
          <a className="underline" href="https://t.me/nerual_dreming" target="_blank" rel="noopener">
            Nerual Dreming
          </a>
          ) — делаю опенсорс AI-инструменты, которые можно запускать локально: бесплатно, без облака и подписок. Bulka
          тоже бесплатна. Серверы, домены, железо для тестов и время — нет. Донат позволяет мне пилить дальше, а не
          искать, на что жить.
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <a href="https://dalink.to/nerual_dreming" target="_blank" rel="noopener" className={linkBtn}>
          {t('support.card')}
          <span className="block text-xs opacity-60">dalink.to/nerual_dreming</span>
        </a>
        <a href="https://boosty.to/neuro_art" target="_blank" rel="noopener" className={linkBtn}>
          {t('support.boosty')}
          <span className="block text-xs opacity-60">boosty.to/neuro_art</span>
        </a>
      </div>

      <div className="grid gap-2 p-3 rounded-md border border-foreground/20">
        <span className="text-sm font-medium">{t('support.crypto')}</span>
        {CRYPTO.map((c) => (
          <CopyRow key={c.addr} label={c.name} value={c.addr} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded border border-foreground/15 text-center">
          <div className="font-medium">$5</div>
          <div className="opacity-60">{t('support.tier5')}</div>
        </div>
        <div className="p-2 rounded border border-foreground/15 text-center">
          <div className="font-medium">$25</div>
          <div className="opacity-60">{t('support.tier25')}</div>
        </div>
        <div className="p-2 rounded border border-foreground/15 text-center">
          <div className="font-medium">$100</div>
          <div className="opacity-60">{t('support.tier100')}</div>
        </div>
        <div className="p-2 rounded border border-foreground/15 text-center">
          <div className="font-medium">$500</div>
          <div className="opacity-60">{t('support.tier500')}</div>
        </div>
      </div>

      <p className="text-xs opacity-50">{t('support.thanks')}</p>
    </div>
  );
}
