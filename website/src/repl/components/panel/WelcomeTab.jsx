import { useSettings } from '@src/settings.mjs';
import { currentLang, href } from '../../../i18n/index.mjs';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

const site = new URL(import.meta.env.SITE);

const brand = { fontFamily: "'Fredoka', sans-serif", color: '#D4A574' };

function WelcomeRu() {
  return (
    <>
      <h3>🍞 добро пожаловать</h3>
      <p>
        Вы нашли{' '}
        <span className="underline" style={brand}>
          bulka
        </span>{' '}
        — платформу для лайв-кодинга музыки прямо в браузере! Это бесплатный проект с открытым исходным кодом, созданный
        как для новичков, так и для экспертов.
        <br />
        <br />
        <span className="underline">1. нажми «играть»</span> - <span className="underline">2. измени что-нибудь</span> -{' '}
        <span className="underline">3. нажми «обновить»</span>
      </p>
      <p>
        Чтобы начать, изучите{' '}
        <a href={`${baseNoTrailing}/workshop/getting-started/`} target="_blank">
          интерактивный туториал
        </a>
        .
      </p>
      <h3>🍞 о проекте</h3>
      <p>
        <span style={brand}>Bulka</span> — это русскоязычный форк проекта{' '}
        <a href="https://strudel.cc/" target="_blank">
          Strudel
        </a>{' '}
        с встроенным AI-агентом. Исходный код доступен на{' '}
        <a href="https://github.com/timoncool/Bulka" target="_blank">
          GitHub
        </a>
        . Присоединяйтесь к нашему{' '}
        <a href="https://t.me/bulka_app" target="_blank">
          Telegram-сообществу
        </a>
        ! Нашли ошибку?{' '}
        <a href={issueReportUrl()} target="_blank">
          Сообщите о проблеме
        </a>
        .
      </p>
      <p>
        🌐 Официальный сайт:{' '}
        <a href={site.href} target="_blank">
          {site.host}
        </a>
      </p>
      <p>
        Проект развивается{' '}
        <a href="https://t.me/nerual_dreming" target="_blank">
          Nerual Dreming
        </a>{' '}
        — основателем{' '}
        <a href="https://artgeneration.me/" target="_blank">
          ArtGeneration.me
        </a>
        ,{' '}
        <a href="https://www.youtube.com/@nerual_dreming" target="_blank">
          техноблогером
        </a>{' '}
        и нейро-евангелистом.
      </p>
    </>
  );
}

function WelcomeEn() {
  return (
    <>
      <h3>🍞 welcome</h3>
      <p>
        You have found{' '}
        <span className="underline" style={brand}>
          bulka
        </span>
        , a platform for live coding music right in the browser! It is free and open source, made for beginners and
        experts alike.
        <br />
        <br />
        <span className="underline">1. hit play</span> - <span className="underline">2. change something</span> -{' '}
        <span className="underline">3. hit update</span>
      </p>
      <p>
        To get started, check out the{' '}
        <a href={href(`${baseNoTrailing}/workshop/getting-started/`, 'en')} target="_blank">
          interactive tutorial
        </a>
        .
      </p>
      <h3>🍞 about</h3>
      <p>
        <span style={brand}>Bulka</span> is a fork of{' '}
        <a href="https://strudel.cc/" target="_blank">
          Strudel
        </a>{' '}
        with a built-in AI agent. The source code is on{' '}
        <a href="https://github.com/timoncool/Bulka" target="_blank">
          GitHub
        </a>
        . Join our{' '}
        <a href="https://t.me/bulka_app" target="_blank">
          Telegram community
        </a>
        ! Found a bug?{' '}
        <a href={issueReportUrl()} target="_blank">
          Report a problem
        </a>
        .
      </p>
      <p>
        🌐 Website:{' '}
        <a href={new URL('/en/', site).href} target="_blank">
          {site.host}
        </a>
      </p>
      <p>
        Bulka is developed by{' '}
        <a href="https://t.me/nerual_dreming" target="_blank">
          Nerual Dreming
        </a>
        , founder of{' '}
        <a href="https://artgeneration.me/" target="_blank">
          ArtGeneration.me
        </a>
        ,{' '}
        <a href="https://www.youtube.com/@nerual_dreming" target="_blank">
          tech blogger
        </a>{' '}
        and AI evangelist.
      </p>
    </>
  );
}

/**
 * GitHub's choice of forms (bug, idea, question) with the browser and system passed along: the key is the `id` of
 * the text field in `.github/ISSUE_TEMPLATE/*.yml`, and the chosen form fills it from the query parameter.
 */
function issueReportUrl() {
  const agent = navigator.userAgent;
  const known = [
    ['Edg', 'Edge'],
    ['OPR', 'Opera'],
    ['YaBrowser', 'Yandex'],
    ['Firefox', 'Firefox'],
    ['Chrome', 'Chrome'],
    ['Version', 'Safari'],
  ];
  const found = known.map(([token, label]) => [label, agent.match(new RegExp(`${token}/(\\d+)`))]).find(([, m]) => m);
  const name = found ? `${found[0]} ${found[1][1]}` : '';
  const os = /Windows/.test(agent)
    ? 'Windows'
    : /Mac OS X|Macintosh/.test(agent)
      ? 'macOS'
      : /Android/.test(agent)
        ? 'Android'
        : /Linux/.test(agent)
          ? 'Linux'
          : '';
  const query = new URLSearchParams();
  const described = [name, os].filter(Boolean).join(', ');
  if (described) query.set('browser', described);
  return `https://github.com/timoncool/Bulka/issues/new/choose?${query.toString()}`;
}

export function WelcomeTab() {
  const { fontFamily } = useSettings();
  return (
    <div className="prose dark:prose-invert min-w-full pt-2 font-sans pb-8 px-4 " style={{ fontFamily }}>
      {currentLang() === 'en' ? <WelcomeEn /> : <WelcomeRu />}
    </div>
  );
}
