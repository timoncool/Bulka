import cx from '@src/cx.mjs';

export function ActionButton({ children, label, labelIsHidden, className, ...buttonProps }) {
  return (
    <button className={cx('hover:opacity-50 text-xs text-nowrap w-fit', className)} title={label} {...buttonProps}>
      {labelIsHidden !== true && label}
      {children}
    </button>
  );
}
