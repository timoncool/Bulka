import { describe, expect, it } from 'vitest';
import { loadFailureHost } from '../website/src/hub/bulkaHub.mjs';
import { scrubReason } from '../website/src/hub/scrub.mjs';

describe('a failed sample map load keeps its host in statistics', () => {
  it('names the host of an absolute address, and the scrub keeps it', () => {
    const reason = loadFailureHost('error loading "https://raw.githubusercontent.com/someone/pack/main/strudel.json"');
    expect(reason).toBe('error loading raw.githubusercontent.com');
    expect(scrubReason(reason)).toBe('error loading raw.githubusercontent.com');
  });

  it('resolves a relative address against the page', () => {
    expect(loadFailureHost('error loading "/samples/x/strudel.json"', 'https://bulka.app/')).toBe(
      'error loading bulka.app',
    );
  });

  it('says so when the address is not one', () => {
    expect(loadFailureHost('error loading "::"', undefined)).toBe('error loading (invalid address)');
  });

  it('leaves other reasons as they are', () => {
    expect(loadFailureHost('up is not defined')).toBe('up is not defined');
  });
});
