import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/20/solid';
import cx from '@src/cx.mjs';
import { useState, useEffect, useRef } from 'react';

export function ShareToast({ isOpen, onClose, shareUrl, hash, onPublicChange, isPublic, anchorRef }) {
  const [copied, setCopied] = useState(false);
  const toastRef = useRef(null);

  // Auto-copy on open
  useEffect(() => {
    if (isOpen && shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
      }).catch(console.error);
    }
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen, shareUrl]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (toastRef.current && !toastRef.current.contains(e.target)) {
        // Don't close if clicking the share button itself
        if (anchorRef?.current && anchorRef.current.contains(e.target)) return;
        onClose();
      }
    };

    // Delay to prevent immediate close
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Auto-hide after 5 seconds if not interacting
  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timeout);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div
      ref={toastRef}
      className={cx(
        'absolute top-full right-0 mt-2 z-[100]',
        'bg-background border border-foreground/30 rounded-lg',
        'p-3 shadow-xl min-w-[280px]',
        'text-foreground text-sm',
        'animate-in fade-in slide-in-from-top-2 duration-200'
      )}
    >
      {/* Success message */}
      <div className="flex items-center gap-2 mb-3">
        <CheckIcon className="w-5 h-5 text-green-500 shrink-0" />
        <span className="font-medium">Ссылка скопирована!</span>
      </div>

      {/* URL display */}
      <div
        className={cx(
          'flex items-center gap-2 bg-lineHighlight rounded px-2 py-1.5 mb-3',
          'cursor-pointer hover:opacity-80 transition-opacity'
        )}
        onClick={handleCopy}
        title="Копировать ещё раз"
      >
        <span className="text-xs opacity-70 truncate flex-1">{shareUrl}</span>
        <ClipboardDocumentIcon className="w-4 h-4 shrink-0 opacity-50" />
      </div>

      {/* Public checkbox */}
      {hash && (
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => onPublicChange(e.target.checked)}
            className={cx(
              'w-4 h-4 rounded border border-foreground/50',
              'bg-background cursor-pointer',
              'accent-foreground'
            )}
          />
          <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
            {isPublic ? 'Виден в ленте' : 'Только по ссылке'}
          </span>
        </label>
      )}
    </div>
  );
}

// Keep old export for compatibility, but point to new component
export function ShareDialog(props) {
  return <ShareToast {...props} />;
}
