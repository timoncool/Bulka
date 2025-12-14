import { useState, useEffect, useMemo, useCallback } from 'react';
import { loadPublicPatterns, loadPatternsByLikes, toggleLike, isTrackLiked } from '@src/user_pattern_utils.mjs';
import { MiniRepl } from '@src/docs/MiniRepl';
import { PatternLabel } from '@src/repl/components/panel/PatternsTab';
import { getMetadata } from '@src/metadata_parser.js';
import cx from '@src/cx.mjs';

// Icons
function HeartIcon({ filled }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}

// Sort options
const SORT_OPTIONS = {
  date: 'По дате',
  likes: 'По популярности',
};

// Extract unique genres from patterns
function extractGenres(patterns) {
  const genreSet = new Set();
  patterns.forEach(pat => {
    const meta = getMetadata(pat.code);
    if (meta.genre) {
      const genres = Array.isArray(meta.genre) ? meta.genre : [meta.genre];
      genres.forEach(g => genreSet.add(g.trim().toLowerCase()));
    }
  });
  return Array.from(genreSet).sort();
}

// Filter Bar Component
function FilterBar({ genres, selectedGenre, onGenreChange, sortBy, onSortChange, searchQuery, onSearchChange }) {
  return (
    <div className="bg-lineHighlight rounded-lg p-4 mb-6 space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Поиск по названию или автору..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 bg-background rounded-md text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Genre Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-foreground/70">Жанр:</span>
          <button
            onClick={() => onGenreChange('')}
            className={cx(
              'px-3 py-1 rounded-full text-sm transition-colors',
              selectedGenre === '' ? 'bg-foreground text-background' : 'bg-background text-foreground hover:opacity-70'
            )}
          >
            Все
          </button>
          {genres.slice(0, 6).map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={cx(
                'px-3 py-1 rounded-full text-sm capitalize transition-colors',
                selectedGenre === genre ? 'bg-foreground text-background' : 'bg-background text-foreground hover:opacity-70'
              )}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-foreground/70">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1 bg-background rounded-md text-foreground focus:outline-none"
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// Track Card Component
function TrackCard({ pattern, onRefresh }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(pattern.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  const metadata = useMemo(() => getMetadata(pattern.code), [pattern.code]);
  const title = metadata.title || 'Без названия';
  const author = Array.isArray(metadata.by) ? metadata.by.join(', ') : (metadata.by || 'Аноним');
  const genres = Array.isArray(metadata.genre) ? metadata.genre : (metadata.genre ? [metadata.genre] : []);

  const formattedDate = useMemo(() => {
    const date = new Date(pattern.created_at);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [pattern.created_at]);

  // Check if liked on mount
  useEffect(() => {
    if (pattern.hash) {
      setLiked(isTrackLiked(pattern.hash));
    }
  }, [pattern.hash]);

  const handleLike = useCallback(async () => {
    if (isLiking || !pattern.hash) return;
    setIsLiking(true);

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const result = await toggleLike(pattern.hash);
      // If result is null, it means rate limited or cooldown - revert
      if (result === null) {
        setLiked(!newLiked);
        setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (err) {
      // Revert on error
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setIsLiking(false);
    }
  }, [liked, isLiking, pattern.hash]);

  const handleShare = useCallback(async () => {
    if (!pattern.hash) return;
    // Формируем ссылку напрямую на редактор (без /feed/)
    const shareUrl = window.location.origin + '/?' + pattern.hash;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy:', e);
    }
  }, [pattern.hash]);

  const handleEdit = useCallback(() => {
    window.open(`/?${pattern.hash}`, '_blank');
  }, [pattern.hash]);

  return (
    <article className="bg-lineHighlight rounded-lg overflow-hidden border border-transparent hover:border-foreground/20 transition-colors">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium truncate">
              <a
                href={`/?${pattern.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {title}
              </a>
            </h3>
            <p className="text-sm text-foreground/70">
              от <span className="text-foreground/80">{author}</span>
            </p>
          </div>
          <time className="text-xs text-foreground/50 whitespace-nowrap">
            {formattedDate}
          </time>
        </div>

        {/* Genre Tags */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {genres.map((genre, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-background rounded-full text-foreground/70 capitalize"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* MiniRepl */}
      <div className="max-h-[250px] overflow-hidden">
        <MiniRepl tune={pattern.code.trim()} maxHeight={200} punchcard />
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-background flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={cx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
              liked
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-background hover:bg-background/80 text-foreground/60 hover:text-red-400'
            )}
            title={liked ? 'Убрать лайк' : 'Поставить лайк'}
          >
            <HeartIcon filled={liked} />
            <span className="text-sm">{likeCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className={cx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-background hover:bg-background/80 text-foreground/60 hover:text-foreground'
            )}
            title={copied ? 'Скопировано!' : 'Поделиться'}
          >
            {copied ? <CheckIcon /> : <ShareIcon />}
            {copied && <span className="text-sm">Скопировано</span>}
          </button>

          {/* Edit */}
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background hover:bg-background/80 text-foreground/60 hover:text-foreground transition-colors"
            title="Открыть в редакторе"
          >
            <EditIcon />
            <span className="text-sm hidden sm:inline">Редактировать</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// Main Feed Component
export function Feed() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('likes');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load patterns
  useEffect(() => {
    setLoading(true);
    const loadFn = sortBy === 'likes' ? loadPatternsByLikes : loadPublicPatterns;
    loadFn().then(({ data }) => {
      setPatterns(data || []);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load patterns:', err);
      setLoading(false);
    });
  }, [sortBy]);

  // Extract genres
  const genres = useMemo(() => extractGenres(patterns), [patterns]);

  // Filter patterns
  const filteredPatterns = useMemo(() => {
    let result = [...patterns];

    // Filter by genre
    if (selectedGenre) {
      result = result.filter(pat => {
        const meta = getMetadata(pat.code);
        if (!meta.genre) return false;
        const patGenres = Array.isArray(meta.genre) ? meta.genre : [meta.genre];
        return patGenres.some(g => g.toLowerCase().trim() === selectedGenre);
      });
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(pat => {
        const meta = getMetadata(pat.code);
        const title = (meta.title || '').toLowerCase();
        const authors = Array.isArray(meta.by) ? meta.by.join(' ').toLowerCase() : (meta.by || '').toLowerCase();
        return title.includes(query) || authors.includes(query);
      });
    }

    return result;
  }, [patterns, selectedGenre, searchQuery]);

  const handleRefresh = useCallback(() => {
    const loadFn = sortBy === 'likes' ? loadPatternsByLikes : loadPublicPatterns;
    loadFn().then(({ data }) => setPatterns(data || []));
  }, [sortBy]);

  return (
    <div>
      <FilterBar
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-foreground/50">Загрузка треков...</div>
        </div>
      ) : filteredPatterns.length === 0 ? (
        <div className="text-center py-8 text-foreground/50">
          {searchQuery || selectedGenre
            ? 'Треки не найдены. Попробуйте изменить фильтры.'
            : 'Пока нет опубликованных треков. Будь первым!'}
        </div>
      ) : (
        <>
          <div className="text-sm text-foreground/50 mb-4">
            Найдено треков: {filteredPatterns.length}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatterns.map((pattern) => (
              <TrackCard key={pattern.id} pattern={pattern} onRefresh={handleRefresh} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
