import cx from '@src/cx.mjs';

export function ActionButton({ children, label, labelIsHidden, className, ...buttonProps }) {
  return (
    <button className={cx('hover:opacity-50 text-nowrap w-fit', className)} title={label} {...buttonProps}>
      {labelIsHidden !== true && label}
      {children}
    </button>
  );
}

export function SpecialActionButton(props) {
  const { className, ...buttonProps } = props;

  return (
    <ActionButton
      {...buttonProps}
      className={cx('bg-background p-2 max-w-[300px] rounded-md hover:opacity-50', className)}
    />
  );
}

export function ActionInput({ label, className, ...props }) {
  return (
    <label className={cx('inline-flex items-center cursor-pointer', className)}>
      <input {...props} className="sr-only peer" />

      <span className="inline-flex items-center peer-hover:opacity-50">{label}</span>
    </label>
  );
}

export function SpecialActionInput({ className, ...props }) {
  return (
    <ActionInput
      {...props}
      className={className}
      label={<span className="bg-background p-2 max-w-[300px] rounded-md">{props.label}</span>}
    />
  );
}
