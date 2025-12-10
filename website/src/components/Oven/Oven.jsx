import { useState, useEffect } from 'react';
import { loadFeaturedPatterns, loadPublicPatterns } from '@src/user_pattern_utils.mjs';
import { MiniRepl } from '@src/docs/MiniRepl';
import { PatternLabel } from '@src/repl/components/panel/PatternsTab';
import { getMetadata } from '@src/metadata_parser.js';

// Priority authors - their patterns will be shown first
const PRIORITY_AUTHORS = ['KAIXI', 'neural'];

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

function PatternList({ patterns }) {
  return (
    <div className="space-y-4">
      {/* <MiniRepl tunes={patterns.map((pat) => pat.code.trim())} /> */}
      {patterns.map((pat) => (
        <div key={pat.id}>
          <div className="flex justify-between not-prose pb-2">
            <h2 className="text-lg">
              <a href={`/?${pat.hash}`} target="_blank" className="underline">
                <PatternLabel pattern={pat} />
              </a>
            </h2>
          </div>
          <MiniRepl tune={pat.code.trim()} maxHeight={300} />
        </div>
      ))}
    </div>
  );
}

export function Oven() {
  const [featuredPatterns, setFeaturedPatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);
  useEffect(() => {
    loadPublicPatterns().then(({ data: pats }) => {
      console.log('pats', pats);
      // Sort by date (newest first) - already sorted by API, but ensure it
      const sorted = sortPatternsWithPriority(pats);
      setPublicPatterns(sorted);
    });
    loadFeaturedPatterns().then(({ data: pats }) => {
      console.log('pats', pats);
      // Sort featured patterns with priority authors first
      const sorted = sortPatternsWithPriority(pats);
      setFeaturedPatterns(sorted);
    });
  }, []);
  return (
    <div>
      <h2 id="featured">Featured Patterns</h2>
      <PatternList patterns={featuredPatterns} />
      <h2 id="latest">Last Creations</h2>
      <PatternList patterns={publicPatterns} />
    </div>
  );
}
