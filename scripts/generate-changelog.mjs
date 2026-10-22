#!/usr/bin/env node
/**
 * Генератор changelog для Bulka
 *
 * Читает историю git-коммитов и пишет website/src/data/changelog.json для страницы /whatsnew.
 *
 * Запуск: node scripts/generate-changelog.mjs [--since-date=YYYY-MM-DD]
 *
 * ⚠️  ВАЖНО: НИКОГДА не редактируй website/src/data/changelog.json вручную!
 *     Всегда запускай этот скрипт: pnpm changelog
 *     Скрипт автоматически читает коммиты из git и генерирует changelog.
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Типы коммитов и их отображение
const COMMIT_TYPES = {
  feat: { label: 'Новые возможности', emoji: '✨', order: 1 },
  fix: { label: 'Исправления', emoji: '🐛', order: 2 },
  perf: { label: 'Производительность', emoji: '⚡', order: 3 },
  docs: { label: 'Документация', emoji: '📚', order: 4 },
  refactor: { label: 'Рефакторинг', emoji: '♻️', order: 5 },
  style: { label: 'Стили', emoji: '🎨', order: 6 },
  test: { label: 'Тесты', emoji: '🧪', order: 7 },
  chore: { label: 'Обслуживание', emoji: '🔧', order: 8 },
  debug: { label: 'Отладка', emoji: '🔍', order: 9 },
  blog: { label: 'Блог', emoji: '📝', order: 10 },
};

// Коммиты, которые нужно пропустить
const SKIP_PATTERNS = [/^Merge pull request/, /^Merge branch/, /^Revert "/, /^Reapply "/];

const isBot = (author) => /\[bot\]$/.test(author ?? '');

function parseCommit(line) {
  const [date, message, author, hash] = line.split('|');

  // Пропускаем merge коммиты, реверты и коммиты ботов (график звёзд)
  if (SKIP_PATTERNS.some((pattern) => pattern.test(message)) || isBot(author)) {
    return null;
  }

  // Парсим conventional commit
  const match = message.match(/^(\w+)(?:\(([^)]+)\))?\s*:\s*(.+)$/);

  if (match) {
    const [, type, scope, description] = match;
    return {
      date,
      type: type.toLowerCase(),
      scope: scope || null,
      description: description.trim(),
      author,
      hash,
      message,
    };
  }

  // Для обычных коммитов без типа
  return {
    date,
    type: 'other',
    scope: null,
    description: message.trim(),
    author,
    hash,
    message,
  };
}

function getExistingChangelog() {
  const jsonPath = path.join(ROOT_DIR, 'website/src/data/changelog.json');
  if (!fs.existsSync(jsonPath)) return [];
  return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

function getLastKnownHash(existingChangelog) {
  // Ищем последний (самый новый) хэш в существующем changelog
  for (const day of existingChangelog) {
    if (day.changes && day.changes.length > 0) {
      return day.changes[0].hash;
    }
  }
  return null;
}

function getGitLog({ sinceHash = null, sinceDate = null } = {}) {
  const args = ['log', '--pretty=format:%ad|%s|%an|%h', '--date=short'];
  if (sinceHash) args.push(`${sinceHash}..HEAD`);
  if (sinceDate) args.push(`--since=${sinceDate}`);
  const log = execFileSync('git', args, { encoding: 'utf-8', cwd: ROOT_DIR, maxBuffer: 10 * 1024 * 1024 });
  return log.split('\n').filter(Boolean).map(parseCommit).filter(Boolean);
}

function commitExists(hash) {
  try {
    execFileSync('git', ['cat-file', '-e', `${hash}^{commit}`], { cwd: ROOT_DIR, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function groupByDate(commits) {
  const grouped = {};

  for (const commit of commits) {
    if (!grouped[commit.date]) {
      grouped[commit.date] = [];
    }
    grouped[commit.date].push(commit);
  }

  // Сортируем даты по убыванию (новые сверху)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return sortedDates.map((date) => ({
    date,
    commits: grouped[date],
  }));
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function generateJSON(groupedByDate) {
  const changelog = groupedByDate.map((day) => ({
    date: day.date,
    dateFormatted: formatDate(day.date),
    changes: day.commits.map((c) => ({
      type: c.type,
      typeLabel: COMMIT_TYPES[c.type]?.label || 'Прочее',
      emoji: COMMIT_TYPES[c.type]?.emoji || '📦',
      description: c.description,
      scope: c.scope,
      author: c.author,
      hash: c.hash,
    })),
  }));

  return changelog;
}

function mergeChangelogs(existing, newChanges) {
  // Собираем все известные хэши для дедупликации
  const knownHashes = new Set();
  for (const day of existing) {
    for (const change of day.changes) {
      knownHashes.add(change.hash);
    }
  }

  // Создаём map по датам для быстрого доступа
  const byDate = {};

  // Сначала добавляем существующие
  for (const day of existing) {
    const changes = day.changes.filter((c) => !isBot(c.author));
    if (changes.length > 0 || day.date === '_DO_NOT_EDIT') byDate[day.date] = { ...day, changes };
  }

  // Добавляем только новые коммиты (без дубликатов)
  for (const day of newChanges) {
    const uniqueChanges = day.changes.filter((c) => !knownHashes.has(c.hash));
    if (uniqueChanges.length === 0) continue;

    if (byDate[day.date]) {
      byDate[day.date].changes = [...uniqueChanges, ...byDate[day.date].changes];
    } else {
      byDate[day.date] = { ...day, changes: uniqueChanges };
    }
  }

  // Дедупликация внутри каждого дня (на всякий случай)
  for (const date of Object.keys(byDate)) {
    const seen = new Set();
    byDate[date].changes = byDate[date].changes.filter((c) => {
      if (seen.has(c.hash)) return false;
      seen.add(c.hash);
      return true;
    });
  }

  // Сортируем по датам (новые сверху)
  return Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date));
}

function main() {
  console.log('🍞 Обновление changelog для Bulka...\n');

  // Читаем существующий changelog
  const existingChangelog = getExistingChangelog();
  const lastHash = getLastKnownHash(existingChangelog);

  const sinceDateArg = process.argv.find((a) => a.startsWith('--since-date='));
  const sinceDate = sinceDateArg ? sinceDateArg.slice('--since-date='.length) : null;
  if (sinceDate && !/^\d{4}-\d{2}-\d{2}$/.test(sinceDate)) {
    throw new Error(`--since-date ждёт YYYY-MM-DD, получено «${sinceDate}»`);
  }

  if (lastHash) {
    console.log(`📌 Последний известный коммит: ${lastHash}`);
  }
  if (lastHash && !sinceDate && !commitExists(lastHash)) {
    throw new Error(
      `Коммита ${lastHash} из changelog.json нет в истории (история переписана). ` +
        'Запусти один раз: node scripts/generate-changelog.mjs --since-date=<день после последней записи>',
    );
  }

  const newCommits = sinceDate ? getGitLog({ sinceDate }) : getGitLog({ sinceHash: lastHash });

  if (newCommits.length === 0) {
    console.log('✅ Changelog актуален, новых коммитов нет.\n');
    return;
  }

  console.log(`📊 Найдено ${newCommits.length} новых коммитов\n`);

  // Группируем новые коммиты по датам
  const newGroupedByDate = groupByDate(newCommits);
  const newJsonData = generateJSON(newGroupedByDate);

  // Мерджим с существующим changelog
  const mergedChangelog = mergeChangelogs(existingChangelog, newJsonData);

  // Добавляем предупреждение как первый элемент (для Claude и других AI)
  const warningEntry = {
    _AI_WARNING: '⚠️ НЕ РЕДАКТИРУЙ ЭТОТ ФАЙЛ ВРУЧНУЮ! Запусти: pnpm changelog',
    date: '_DO_NOT_EDIT',
    dateFormatted: '⚠️ ГЕНЕРИРУЕТСЯ АВТОМАТИЧЕСКИ',
    changes: [],
  };

  // Убираем старое предупреждение если есть, добавляем новое в начало
  const finalChangelog = [warningEntry, ...mergedChangelog.filter((day) => day.date !== '_DO_NOT_EDIT')];

  // Сохраняем JSON
  const jsonPath = path.join(ROOT_DIR, 'website/src/data/changelog.json');
  const dataDir = path.dirname(jsonPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(jsonPath, JSON.stringify(finalChangelog, null, 2), 'utf-8');
  console.log(`✅ JSON: ${jsonPath}`);

  console.log(`\n✨ Добавлено ${newCommits.length} новых записей!`);
}

try {
  main();
} catch (error) {
  console.error(`[ERROR] changelog: ${error.message}`);
  process.exit(1);
}
