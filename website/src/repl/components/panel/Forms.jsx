import cx from '@src/cx.mjs';

export function ButtonGroup({ value, onChange, items, wrap = false }) {
  return (
    <div className={cx('flex max-w-lg space-x-0 text-xs', wrap && 'flex-wrap')}>
      {Object.entries(items).map(([key, label], i, arr) => (
        <button
          key={key}
          id={key}
          onClick={() => onChange(key)}
          className={cx(
            'px-2 border-b-2 h-8 whitespace-nowrap border-box max-h-8 hover:opacity-50',
            // i === 0 && 'rounded-l-md',
            // i === arr.length - 1 && 'rounded-r-md',
            // value === key ? 'bg-background' : 'bg-lineHighlight',
            value === key ? 'border-foreground' : 'border-transparent',
          )}
        >
          {label.toLowerCase()}
        </button>
      ))}
    </div>
  );
}
