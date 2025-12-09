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
        <span style={{ fontFamily: "'Fredoka', sans-serif", color: '#D4A574' }}>Bulka</span> — это русскоязычный форк проекта{' '}
        <a href="https://strudel.cc/" target="_blank">
          Strudel
        </a>
        {' '}с встроенным AI-агентом. Исходный код доступен на{' '}
        <a href="https://github.com/timoncool/Bulka" target="_blank">
          GitHub
        </a>
        .
      </p>
      <p>
        Проект развивается{' '}
        <a href="https://t.me/nerual_dreming" target="_blank">
          Nerual Dreming
        </a>
        {' '}— основателем{' '}
        <a href="https://artgeneration.me/" target="_blank">
          ArtGeneration.me
        </a>
        ,{' '}
        <a href="https://www.youtube.com/@nerual_dreming" target="_blank">
          техноблогером
        </a>
        {' '}и нейро-евангелистом.
      </p>
    </div>
  );
}
