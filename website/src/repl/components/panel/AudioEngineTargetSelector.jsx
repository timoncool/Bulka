import React from 'react';
import { audioEngineTargets } from '../../../settings.mjs';
import { SelectInput } from './SelectInput';
import { href, t } from '../../../i18n/index.mjs';

// Allows the user to select an audio interface for Strudel to play through
export function AudioEngineTargetSelector({ target, onChange, isDisabled }) {
  const onTargetChange = (target) => {
    onChange(target);
  };
  const options = new Map([
    [audioEngineTargets.webaudio, audioEngineTargets.webaudio],
    [audioEngineTargets.osc, audioEngineTargets.osc],
  ]);
  return (
    <div className=" flex flex-col gap-1">
      <SelectInput isDisabled={isDisabled} options={options} value={target} onChange={onTargetChange} />
      {target === audioEngineTargets.osc && (
        <div>
          <p className="text-sm italic">
            {t('osc.warning')}{' '}
            <a className="text-blue-500" href={href('/learn/input-output/')}>
              {t('osc.docs')}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
