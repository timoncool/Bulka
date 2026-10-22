import { describe, expect, it } from 'vitest';
import { codeHint, errorWithHint } from '../website/src/repl/codeHints.mjs';

describe('hints for names Strudel does not have', () => {
  it('explains up in Chromium, Firefox and Safari wording', () => {
    for (const message of ['up is not defined', "Can't find variable: up"]) {
      expect(codeHint(new ReferenceError(message))).toContain('.add(note(12))');
    }
  });

  it('explains Tidal channels d1 to d16', () => {
    expect(codeHint(new ReferenceError('d1 is not defined'))).toContain('d1');
    expect(codeHint(new ReferenceError('d16 is not defined'))).toContain('stack(');
  });

  it("explains Switch Angel's prebake functions called as methods", () => {
    const chain = new TypeError('leadNotes.note(...).o(...).s(...).acidenv is not a function');
    expect(codeHint(chain)).toContain('.lpenv(x * 9)');
    const safari = new TypeError(
      "pat.trancegate is not a function. (In 'pat.trancegate(1.5)', 'pat.trancegate' is undefined)",
    );
    expect(codeHint(safari)).toMatch(/^trancegate .*\/learn\/faq/);
    expect(codeHint(new TypeError('x.up is not a function'))).toContain('.transpose(12)');
  });

  it('points to the place of a parse error, columns counted from 1', () => {
    const hint = codeHint(new SyntaxError('Unexpected token (28:23)'));
    expect(hint).toContain('28');
    expect(hint).toContain('24');
    expect(codeHint(new Error('Unexpected token (3:0)'))).toContain('1');
  });

  it('stays silent on other errors and on names Strudel has', () => {
    expect(codeHint(new ReferenceError('foo is not defined'))).toBeNull();
    expect(codeHint(new TypeError('pat.fill is not a function'))).toBeNull();
    expect(codeHint(null)).toBeNull();
  });

  it('appends the hint to the message the agent gets', () => {
    expect(errorWithHint(new ReferenceError('toScale is not defined'))).toMatch(
      /^toScale is not defined\. .*scale\("C:major"\)/,
    );
    expect(errorWithHint(new Error('boom'))).toBe('boom');
  });
});
