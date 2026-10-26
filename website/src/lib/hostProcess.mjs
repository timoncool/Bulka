import { posix } from 'node:path';

// The AppImage's AppRun puts the image's libraries first in LD_LIBRARY_PATH ($APPDIR/usr/lib); a program of the
// computer (xdg-open and what it starts) loading them fails on systems newer than the image's. Such a program gets
// the library path without the image's folders; outside an AppImage, and off Linux, the environment is unchanged.

function under(path, dir) {
  const strip = (p) => (p.length > 1 ? posix.normalize(p).replace(/\/+$/, '') : p);
  const a = strip(path);
  const d = strip(dir);
  return a === d || a.startsWith(d === '/' ? '/' : `${d}/`);
}

// { keep } | { remove } | { set: value } for `program` and the `:`-separated library path `current`.
export function libraryPathOutside(appdir, program, current) {
  if (program.startsWith('/') && under(program, appdir)) return { keep: true };
  const parts = current.split(':');
  const kept = parts.filter((part) => !(part.startsWith('/') && under(part, appdir)));
  if (kept.length === parts.length) return { keep: true };
  if (kept.every((part) => part === '')) return { remove: true };
  return { set: kept.join(':') };
}

// The environment for spawning `program` of the computer.
export function hostEnv(program, env = process.env, platform = process.platform) {
  const appdir = env.APPDIR;
  if (platform !== 'linux' || !appdir || env.LD_LIBRARY_PATH === undefined) return env;
  const path = libraryPathOutside(appdir, program, env.LD_LIBRARY_PATH);
  if (path.keep) return env;
  const out = { ...env };
  if (path.remove) delete out.LD_LIBRARY_PATH;
  else out.LD_LIBRARY_PATH = path.set;
  return out;
}
