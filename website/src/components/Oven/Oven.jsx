import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadFeaturedPatterns, loadPublicPatterns, toggleLike, isTrackLiked } from '@src/user_pattern_utils.mjs';
import { MiniRepl } from '@src/docs/MiniRepl';
import { PatternLabel } from '@src/repl/components/panel/PatternsTab';
import { getMetadata } from '@src/metadata_parser.js';
import cx from '@src/cx.mjs';

// Priority authors - their patterns will be shown first
const PRIORITY_AUTHORS = ['KAIXI', 'neural'];

// Heart Icon
function HeartIcon({ filled }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
  );
}

// Sort patterns: priority authors first (by date), then others (by date)
function sortPatternsWithPriority(patterns) {
  if (!patterns || !Array.isArray(patterns)) return [];

  return [...patterns].sort((a, b) => {
    const metaA = getMetadata(a.code);
    const metaB = getMetadata(b.code);
    const authorA = Array.isArray(metaA.by) ? metaA.by[0] : '';
    const authorB = Array.isArray(metaB.by) ? metaB.by[0] : '';

    const isPriorityA = PRIORITY_AUTHORS.some(p => authorA?.toLowerCase().includes(p.toLowerCase()));
    const isPriorityB = PRIORITY_AUTHORS.some(p => authorB?.toLowerCase().includes(p.toLowerCase()));

    // Priority authors first
    if (isPriorityA && !isPriorityB) return -1;
    if (!isPriorityA && isPriorityB) return 1;

    // Within same priority group, sort by date (newest first)
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });
}

// Pattern Item with like button
function PatternItem({ pattern }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(pattern.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (pattern.hash) {
      setLiked(isTrackLiked(pattern.hash));
    }
  }, [pattern.hash]);

  const handleLike = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking || !pattern.hash) return;
    setIsLiking(true);

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
      setLiked(!newLiked);
      setLikeCount(prev => newLiked ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setIsLiking(false);
    }
  }, [liked, isLiking, pattern.hash]);

  return (
    <div key={pattern.id}>
      <div className="flex justify-between items-center not-prose pb-2">
        <h2 className="text-lg flex-1">
          <a href={`/?${pattern.hash}`} target="_blank" className="underline">
            <PatternLabel pattern={pattern} />
          </a>
        </h2>
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={cx(
            'flex items-center gap-1 px-2 py-1 rounded transition-colors ml-2',
            liked ? 'text-red-400' : 'text-foreground/50 hover:text-red-400'
          )}
          title={liked ? 'Убрать лайк' : 'Поставить лайк'}
        >
          <HeartIcon filled={liked} />
          <span className="text-sm">{likeCount}</span>
        </button>
      </div>
      <MiniRepl tune={pattern.code.trim()} maxHeight={300} />
    </div>
  );
}

function PatternList({ patterns }) {
  return (
    <div className="space-y-4">
      {patterns.map((pat) => (
        <PatternItem key={pat.id} pattern={pat} />
      ))}
    </div>
  );
}

export function Oven() {
  const [featuredPatterns, setFeaturedPatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);
  useEffect(() => {
    loadPublicPatterns().then(({ data: pats }) => {
      const sorted = sortPatternsWithPriority(pats);
      setPublicPatterns(sorted);
    });
    loadFeaturedPatterns().then(({ data: pats }) => {
      const sorted = sortPatternsWithPriority(pats);
      setFeaturedPatterns(sorted);
    });
  }, []);
  return (
    <div>
      <h2 id="featured">Избранные паттерны</h2>
      <PatternList patterns={featuredPatterns} />
      <h2 id="latest">Последние творения</h2>
      <PatternList patterns={publicPatterns} />
    </div>
  );
}
