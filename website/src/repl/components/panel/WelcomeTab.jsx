import { useSettings } from '@src/settings.mjs';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function WelcomeTab({ context }) {
  const { fontFamily } = useSettings();
  return (
    <div className="prose dark:prose-invert min-w-full pt-2 font-sans pb-8 px-4 " style={{ fontFamily }}>
      <h3>🍞 добро пожаловать</h3>
      <p>
        Вы нашли <span className="underline" style={{ fontFamily: "'Fredoka', sans-serif", color: '#D4A574' }}>bulka</span> — платформу для лайв-кодинга музыки
        прямо в браузере! Это бесплатный проект с открытым исходным кодом, созданный как для новичков, так и для экспертов.
        <br />
        <br />
        <span className="underline">1. нажми play</span> - <span className="underline">2. измени что-нибудь</span> -{' '}
        <span className="underline">3. нажми update</span>
      </p>
      <p>
        Чтобы начать, изучите{' '}
        <a href={`${baseNoTrailing}/workshop/getting-started/`} target="_blank">
          интерактивный туториал
        </a>
        . Также присоединяйтесь к{' '}
        <a href="https://discord.com/invite/HGEdXmRkzT" target="_blank">
          discord-каналу
        </a>{' '}
        для вопросов и общения.
      </p>
      <h3>🍞 о проекте</h3>
      <p>
        <span style={{ fontFamily: "'Fredoka', sans-serif", color: '#D4A574' }}>Bulka</span> — это русскоязычный форк проекта{' '}
        <a href="https://strudel.cc/" target="_blank">
          Strudel
        </a>
        , который является JavaScript-версией{' '}
        <a href="https://tidalcycles.org/" target="_blank">
          TidalCycles
        </a>
        . Оригинальный Strudel создан Alex McLean и сообществом. Это свободное ПО под лицензией{' '}
        <a href="https://codeberg.org/uzu/strudel/src/branch/main/LICENSE" target="_blank">
          GNU Affero General Public License
        </a>
        . Исходный код доступен на{' '}
        <a href="https://codeberg.org/uzu/strudel" target="_blank">
          Codeberg
        </a>
        . Информация о лицензировании звуков:{' '}
        <a href="https://github.com/felixroos/dough-samples/blob/main/README.md">dough-samples</a>.
        Поддержите оригинальный проект на{' '}
        <a href="https://opencollective.com/tidalcycles" target="_blank">
          Open Collective
        </a>
        {' '}💖
      </p>
    </div>
  );
}
