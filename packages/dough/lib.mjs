import { register, registerControl, stack, Pattern, noteToMidi } from '@strudel/core';

export const { group } = registerControl('group');
export const { voices } = registerControl('voices');
export const { glide } = registerControl('glide');

export const groupmod = register('groupmod', function (modulator, pat) {
  const modpat = modulator
    .withValue((vm) => pat.withValue(({ group }) => ({ ...vm, group })))
    .outerJoin()
    .set({ dough: 'update_group' });
  return stack(pat.set(modulator), modpat);
});
Pattern.prototype.gmod = Pattern.prototype.groupmod;

export function hap2dough(hap, time, cps) {
  hap.ensureObjectValue();
  const event = {
    dough: 'play',
    ...hap.value,
    time,
    duration: hap.duration / cps,
  };
  if (typeof event.note === 'string') {
    event.note = noteToMidi(event.note);
  }
  return event;
}
