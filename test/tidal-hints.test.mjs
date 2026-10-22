import { describe, expect, it } from 'vitest';
import { errorWithHint, tidalHint } from '../website/src/repl/tidalHints.mjs';

describe('TidalCycles hints for undefined names', () => {
  it('explains up in Chromium, Firefox and Safari wording', () => {
    for (const message of ['up is not defined', "Can't find variable: up"]) {
      expect(tidalHint(new ReferenceError(message))).toContain('.add(note(12))');
    }
  });

  it('explains Tidal channels d1 to d16', () => {
    expect(tidalHint(new ReferenceError('d1 is not defined'))).toContain('d1');
    expect(tidalHint(new ReferenceError('d16 is not defined'))).toContain('stack(');
  });

  it('stays silent on other errors and names', () => {
    expect(tidalHint(new ReferenceError('foo is not defined'))).toBeNull();
    expect(tidalHint(new SyntaxError('Unexpected token'))).toBeNull();
    expect(tidalHint(null)).toBeNull();
  });

  it('appends the hint to the message the agent gets', () => {
    expect(errorWithHint(new ReferenceError('toScale is not defined'))).toMatch(
      /^toScale is not defined\. .*scale\("C:major"\)/,
    );
    expect(errorWithHint(new Error('boom'))).toBe('boom');
  });
});
