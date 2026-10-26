import { describe, expect, it } from 'vitest';
import { hostEnv, libraryPathOutside } from '../website/src/lib/hostProcess.mjs';

const APPDIR = '/tmp/.mount_BulkaX1';

describe('libraryPathOutside', () => {
  it('drops the image folders for a program of the computer', () => {
    expect(libraryPathOutside(APPDIR, 'xdg-open', `${APPDIR}/usr/lib/:/opt/lib:${APPDIR}/usr/lib/x86_64-linux-gnu/`)).toEqual({
      set: '/opt/lib',
    });
  });

  it('removes the variable when only image folders were in it', () => {
    expect(libraryPathOutside(APPDIR, 'xdg-open', `${APPDIR}/usr/lib/:${APPDIR}//usr/lib32/`)).toEqual({ remove: true });
  });

  it('keeps the path for a program inside the image', () => {
    expect(libraryPathOutside(APPDIR, `${APPDIR}/usr/lib/Bulka/app/node/node`, `${APPDIR}/usr/lib/`)).toEqual({ keep: true });
  });

  it('keeps a folder that only starts like the image', () => {
    expect(libraryPathOutside(APPDIR, 'xdg-open', `${APPDIR}other/usr/lib`)).toEqual({ keep: true });
  });
});

describe('hostEnv', () => {
  const env = { APPDIR, LD_LIBRARY_PATH: `${APPDIR}/usr/lib/:/opt/lib`, HOME: '/home/u' };

  it('cleans the library path on Linux inside an AppImage', () => {
    expect(hostEnv('xdg-open', env, 'linux')).toEqual({ APPDIR, LD_LIBRARY_PATH: '/opt/lib', HOME: '/home/u' });
    expect(env.LD_LIBRARY_PATH).toBe(`${APPDIR}/usr/lib/:/opt/lib`);
  });

  it('changes nothing outside an AppImage or off Linux', () => {
    const plain = { LD_LIBRARY_PATH: '/opt/lib' };
    expect(hostEnv('xdg-open', plain, 'linux')).toBe(plain);
    expect(hostEnv('explorer.exe', env, 'win32')).toBe(env);
  });
});
