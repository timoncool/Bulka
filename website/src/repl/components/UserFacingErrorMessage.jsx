import { t } from '../../i18n/index.mjs';
import { codeHint } from '../codeHints.mjs';
// type Props = { error: Error | null };
export default function UserFacingErrorMessage(Props) {
  const { error } = Props;
  if (error == null) {
    return;
  }
  const hint = codeHint(error);
  return (
    <div className="text-background px-2 py-1 bg-foreground w-full ml-auto">
      {t('error.prefix')} {error.message || t('error.unknown')}
      {hint && <div>{hint}</div>}
    </div>
  );
}
