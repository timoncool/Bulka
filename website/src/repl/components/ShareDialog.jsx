import { CheckIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/react/20/solid';
import cx from '@src/cx.mjs';
import { useState, useEffect, useRef } from 'react';

export function ShareToast({ isOpen, onClose, shareUrl, hash, onPublicChange, isPublic, anchorRef }) {
  const [copied, setCopied] = useState(false);
  const toastRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position relative to anchor button
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(10, rect.right - 320), // 320 = min-width, keep on screen
      });
    }
  }, [isOpen, anchorRef]);

  // Auto-copy on open
  useEffect(() => {
    if (isOpen && shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(console.error);
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div
      ref={toastRef}
      style={{ top: position.top, left: position.left }}
      className={cx(
        'fixed z-[9999]',
        'bg-background border border-foreground/30 rounded-lg',
        'p-4 shadow-2xl min-w-[320px] max-w-[400px]',
        'text-foreground'
      )}
    >
      {/* Header with title and close */}
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium">Поделиться</span>
        <button
          onClick={onClose}
          className="hover:opacity-50 p-1"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* URL field + copy button */}
      <div className="mb-3">
        <label className="text-xs opacity-70 mb-1 block">Ссылка на паттерн</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className={cx(
              'flex-1 bg-lineHighlight border border-foreground/30 rounded-md',
              'px-3 py-2 text-sm text-foreground',
              'focus:outline-none focus:border-foreground'
            )}
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={handleCopy}
            className={cx(
              'bg-lineHighlight border border-foreground/30 rounded-md',
              'px-3 py-2 hover:opacity-50 transition-opacity',
              'flex items-center gap-1 shrink-0'
            )}
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm">Ок</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4" />
                <span className="text-sm">Копировать</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Public checkbox */}
      {hash && (
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="share-public-checkbox"
            checked={isPublic}
            onChange={(e) => onPublicChange(e.target.checked)}
            className={cx(
              'w-5 h-5 rounded border border-foreground',
              'bg-background cursor-pointer',
              'accent-foreground'
            )}
          />
          <label htmlFor="share-public-checkbox" className="cursor-pointer select-none">
            Опубликовать в ленте
          </label>
        </div>
      )}

      {/* Info text */}
      <p className="text-xs opacity-50 mb-4">
        {isPublic
          ? 'Паттерн будет виден в ленте сообщества'
          : 'Паттерн доступен только по ссылке'}
      </p>

      {/* OK button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className={cx(
            'bg-foreground text-background rounded-md',
            'px-4 py-2 hover:opacity-80 transition-opacity'
          )}
        >
          Готово
        </button>
      </div>
    </div>
  );
}

// Keep old export for compatibility
export function ShareDialog(props) {
  return <ShareToast {...props} />;
}
