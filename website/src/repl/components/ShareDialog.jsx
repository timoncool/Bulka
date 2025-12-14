import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/react/20/solid';
import cx from '@src/cx.mjs';
import { useState, useEffect } from 'react';

export function ShareDialog({ isOpen, onClose, shareUrl, hash, onPublicChange, isPublic }) {
  const [copied, setCopied] = useState(false);

  // Auto-copy on open
  useEffect(() => {
    if (isOpen && shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(console.error);
    }
  }, [isOpen, shareUrl]);

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
    <Dialog open={isOpen} onClose={onClose} className="relative z-[200]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog positioning */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cx(
            'bg-background border border-foreground/30 rounded-lg',
            'p-6 max-w-md w-full shadow-xl',
            'text-foreground'
          )}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-lg font-semibold">
              Поделиться
            </DialogTitle>
            <button
              onClick={onClose}
              className="hover:opacity-50 p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Share URL */}
          <div className="mb-4">
            <label className="text-sm opacity-70 mb-1 block">
              Ссылка на паттерн
            </label>
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
                  'flex items-center gap-1'
                )}
                title="Копировать"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Скопировано</span>
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
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="publish-checkbox"
                checked={isPublic}
                onChange={(e) => onPublicChange(e.target.checked)}
                className={cx(
                  'w-5 h-5 rounded border border-foreground',
                  'bg-background cursor-pointer',
                  'accent-foreground'
                )}
              />
              <label htmlFor="publish-checkbox" className="cursor-pointer select-none">
                Опубликовать в ленте
              </label>
            </div>
          )}

          {/* Info text */}
          <p className="text-xs opacity-50 mb-6">
            {isPublic
              ? 'Паттерн будет виден в ленте сообщества'
              : 'Паттерн доступен только по ссылке'}
          </p>

          {/* Action buttons */}
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
        </DialogPanel>
      </div>
    </Dialog>
  );
}
