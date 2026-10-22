import { describe, expect, it } from 'vitest';
import { scrubReason } from '../website/src/hub/scrub.mjs';

// the cases of studio-hub-client/src/scrub.rs: the web client must scrub exactly like the studios
describe('scrubReason', () => {
  it('nothing personal leaves', () => {
    expect(scrubReason(String.raw`open C:\Users\Ivan Petrov\Music\my song.flac: access denied`)).toBe(
      'open <path>: access denied',
    );
    expect(scrubReason('read /home/ivan/my music/x.wav: no such file')).toBe('read <path>: no such file');
    expect(scrubReason('song "Мой дом" could not be saved')).toBe('song "…" could not be saved');
    expect(scrubReason('«Привет» не найдено')).toBe('"…" не найдено');
    expect(
      scrubReason('GET https://example.com/a?token=1 refused, mail ivan@example.com, peer 192.168.1.20:8080'),
    ).toBe('GET <url> refused, mail <email>, peer <ip>');
    expect(scrubReason('job 0199e2a4-7b1c-7d3e-9f00-123456789abc failed at frame 1234567')).toBe(
      'job <id> failed at frame <n>',
    );
    expect(scrubReason(String.raw`\\server\share\my file.wav: missing`)).toBe('<path>: missing');
  });

  it('the cause stays readable and short', () => {
    expect(scrubReason('CUDA error: out of memory\n  at stage 2/4')).toBe('CUDA error: out of memory at stage 2/4');
    expect(scrubReason('the song would last 640 seconds; songs go up to 600')).toBe(
      'the song would last 640 seconds; songs go up to 600',
    );
    const long = scrubReason('x'.repeat(500));
    expect([...long].length).toBe(200);
    expect(long.endsWith('…')).toBe(true);
    expect(scrubReason('🎵'.repeat(150)).length).toBe(199);
  });
});
