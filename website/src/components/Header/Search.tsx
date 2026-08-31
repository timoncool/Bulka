/** @jsxImportSource react */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import MiniSearch from 'minisearch';
import { createPortal } from 'react-dom';
import docsIndex from '../../data/docs-index.json';
import './Search.css';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

interface DocEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  path: string;
}

interface SearchResult extends DocEntry {
  score: number;
  match: Record<string, string[]>;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize MiniSearch with docs index
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch<DocEntry>({
      fields: ['title', 'content', 'keywords'],
      storeFields: ['title', 'content', 'category', 'path', 'keywords'],
      searchOptions: {
        boost: { title: 3, keywords: 2, content: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
    ms.addAll(docsIndex as DocEntry[]);
    return ms;
  }, []);

  // Search handler
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchResults = miniSearch.search(query, {
      boost: { title: 3, keywords: 2, content: 1 },
      fuzzy: 0.2,
      prefix: true,
    }) as SearchResult[];

    setResults(searchResults.slice(0, 15));
    setSelectedIndex(0);
  }, [query, miniSearch]);

  const onOpen = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setResults([]);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            navigateToResult(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [results, selectedIndex, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Open on "/" key (not in input fields)
      if (e.key === '/' && !isOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        onOpen();
      }
      // Open on Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onOpen, onClose]);

  const navigateToResult = (result: SearchResult) => {
    const path = result.path.replace(/\.mdx?$/, '').replace(/\/index$/, '');
    const url = `${baseNoTrailing}/${path}`;
    window.location.href = url;
    onClose();
  };

  const getResultUrl = (result: SearchResult) => {
    const path = result.path.replace(/\.mdx?$/, '').replace(/\/index$/, '');
    return `${baseNoTrailing}/${path}`;
  };

  // Highlight matching text
  const highlightMatch = (text: string, maxLength = 150) => {
    if (!query.trim() || !text) return text.slice(0, maxLength);

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);

    if (index === -1) return text.slice(0, maxLength);

    // Show context around match
    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + query.length + 80);
    let snippet = text.slice(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      learn: 'Обучение',
      workshop: 'Воркшоп',
      functions: 'Функции',
      reference: 'Справка',
      general: 'Общее',
      technical: 'Технические',
      blog: 'Блог',
    };
    return labels[category] || category;
  };

  return (
    <>
      <button
        type="button"
        ref={searchButtonRef}
        onClick={onOpen}
        className="rounded-md bg-slate-900 w-full px-2 search-button"
      >
        <svg width="24" height="24" fill="none">
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="search-hint">
          <span className="sr-only">Press </span>
          <kbd>/</kbd>
          <span className="sr-only"> to search</span>
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div className="search-overlay" onClick={onClose}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>
              {/* Search Header */}
              <div className="search-header">
                <svg className="search-icon" width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input-field"
                  placeholder="Поиск по документации..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="search-cancel" onClick={onClose}>
                  <kbd>Esc</kbd>
                </button>
              </div>

              {/* Search Results */}
              <div className="search-results" ref={resultsRef}>
                {query && results.length === 0 && (
                  <div className="search-no-results">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="search-no-results-icon">
                      <path
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>Ничего не найдено для "{query}"</p>
                    <p className="search-no-results-hint">Попробуйте другой запрос</p>
                  </div>
                )}

                {results.map((result, index) => (
                  <a
                    key={result.id}
                    href={getResultUrl(result)}
                    data-index={index}
                    className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToResult(result);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="search-result-category">
                      {getCategoryLabel(result.category)}
                    </div>
                    <div className="search-result-title">{result.title}</div>
                    <div className="search-result-content">
                      {highlightMatch(result.content)}
                    </div>
                  </a>
                ))}

                {!query && (
                  <div className="search-empty-state">
                    <p>Начните вводить для поиска</p>
                    <div className="search-shortcuts">
                      <div className="search-shortcut">
                        <kbd>↑</kbd><kbd>↓</kbd> навигация
                      </div>
                      <div className="search-shortcut">
                        <kbd>Enter</kbd> открыть
                      </div>
                      <div className="search-shortcut">
                        <kbd>Esc</kbd> закрыть
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Footer */}
              <div className="search-footer">
                <span className="search-footer-hint">
                  Локальный поиск по документации Bulka
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
