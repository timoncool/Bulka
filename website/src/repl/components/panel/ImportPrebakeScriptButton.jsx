import { errorLogger } from '@strudel/core';
import { useSettings, storePrebakeScript } from '../../../settings.mjs';
import { SpecialActionInput } from '../button/action-button';

async function importScript(script) {
  const reader = new FileReader();
  reader.readAsText(script);

  reader.onload = () => {
    const text = reader.result;
    storePrebakeScript(text);
  };

  reader.onerror = () => {
    errorLogger(new Error('не удалось импортировать prebake-скрипт'), 'importScript');
  };
}
export function ImportPrebakeScriptButton() {
  const settings = useSettings();

  return (
    <SpecialActionInput
      type="file"
      label="импортировать prebake-скрипт"
      accept=".strudel"
      onChange={(e) => importScript(e.target.files[0])}
    />
  );
}
