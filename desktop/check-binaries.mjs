#!/usr/bin/env node
// Compatibility checks of the built desktop binaries (D:\Projects\claude-skills\engine-build-compat-checklist.md):
//   - Windows: every DLL the shell and the bundled node import (also delay-loaded) is part of Windows;
//   - Windows and Linux: AVX-512 code of the shell sits only in functions that pick it after a CPUID check
//     (the release binary is stripped, so the link map written by src-tauri/build.rs names them).
// Linux libraries are checked against the .deb dependencies in build-linux-docker.sh.
//
// node desktop/check-binaries.mjs --shell <bulka-desktop[.exe]> --map <bulka-desktop.map> --node <node[.exe]>

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Decoder, DecoderOptions, Instruction, Register } = require('iced-x86');

// Crates and libraries that choose AVX-512 at run time after a CPUID check, matched as whole crate names in Rust
// mangled names (`9crc32fast11specialized…`) and as the prefix of aws-lc's C functions.
const CPUID_DISPATCH = /\d(?:crc32fast|zlib_rs|aws_lc_rs|aws_lc_sys|ort_sys|ort)\d|^_?aws_lc_/;

const WINDOWS_DLLS = new Set(
  [
    'advapi32',
    'bcrypt',
    'bcryptprimitives',
    'cfgmgr32',
    'combase',
    'comctl32',
    'comdlg32',
    'crypt32',
    'd2d1',
    'd3d11',
    'dbghelp',
    'dwmapi',
    'dwrite',
    'dxgi',
    'gdi32',
    'imm32',
    'iphlpapi',
    'kernel32',
    'mswsock',
    'ncrypt',
    'netapi32',
    'ntdll',
    'ole32',
    'oleaut32',
    'powrprof',
    'propsys',
    'psapi',
    'rpcrt4',
    'secur32',
    'setupapi',
    'shell32',
    'shlwapi',
    'uiautomationcore',
    'user32',
    'userenv',
    'uxtheme',
    'version',
    'windowscodecs',
    'winhttp',
    'wininet',
    'winmm',
    'ws2_32',
  ].map((n) => `${n}.dll`),
);

function args() {
  const out = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith('--') || argv[i + 1] === undefined) throw new Error(`bad argument ${argv[i]}`);
    out[argv[i].slice(2)] = argv[i + 1];
  }
  for (const k of ['shell', 'map', 'node']) if (!out[k]) throw new Error(`--${k} is required`);
  return out;
}

// ---------- PE ----------

function readPe(buf) {
  if (buf.readUInt16LE(0) !== 0x5a4d) return null; // MZ
  const pe = buf.readUInt32LE(0x3c);
  if (buf.readUInt32LE(pe) !== 0x4550) return null;
  const nsec = buf.readUInt16LE(pe + 6);
  const optSize = buf.readUInt16LE(pe + 20);
  const opt = pe + 24;
  if (buf.readUInt16LE(opt) !== 0x20b) throw new Error('only PE32+ binaries are checked');
  const imageBase = buf.readBigUInt64LE(opt + 24);
  const dirs = opt + 112;
  const dir = (i) => ({ rva: buf.readUInt32LE(dirs + 8 * i), size: buf.readUInt32LE(dirs + 8 * i + 4) });
  const sections = [];
  for (let i = 0; i < nsec; i++) {
    const s = opt + optSize + 40 * i;
    sections.push({
      name: buf.toString('latin1', s, s + 8).replace(/\0+$/, ''),
      va: buf.readUInt32LE(s + 12),
      vsize: buf.readUInt32LE(s + 8),
      size: buf.readUInt32LE(s + 16),
      offset: buf.readUInt32LE(s + 20),
      exec: (buf.readUInt32LE(s + 36) & 0x20000000) !== 0,
    });
  }
  const at = (rva) => {
    const s = sections.find((x) => rva >= x.va && rva < x.va + Math.max(x.vsize, x.size));
    if (!s) throw new Error(`RVA 0x${rva.toString(16)} outside the sections`);
    return s.offset + rva - s.va;
  };
  const cstr = (rva) => {
    const o = at(rva);
    return buf.toString('latin1', o, buf.indexOf(0, o));
  };
  const dlls = [];
  const imports = dir(1);
  for (let o = imports.rva && at(imports.rva); imports.rva; o += 20) {
    const name = buf.readUInt32LE(o + 12);
    if (!name) break;
    dlls.push(cstr(name));
  }
  const delay = dir(13);
  for (let o = delay.rva && at(delay.rva); delay.rva; o += 32) {
    const name = buf.readUInt32LE(o + 4);
    if (!name) break;
    dlls.push(`${cstr(name)} (delay-load)`);
  }
  const code = sections
    .filter((s) => s.exec)
    .map((s) => ({ addr: imageBase + BigInt(s.va), bytes: buf.subarray(s.offset, s.offset + s.size) }));
  return { dlls, code };
}

// ---------- ELF ----------

function readElf(buf) {
  if (buf.readUInt32BE(0) !== 0x7f454c46) return null;
  if (buf[4] !== 2 || buf[5] !== 1) throw new Error('only 64-bit little-endian ELF binaries are checked');
  const shoff = Number(buf.readBigUInt64LE(0x28));
  const shentsize = buf.readUInt16LE(0x3a);
  const shnum = buf.readUInt16LE(0x3c);
  const code = [];
  for (let i = 0; i < shnum; i++) {
    const s = shoff + i * shentsize;
    const type = buf.readUInt32LE(s + 4);
    const flags = buf.readBigUInt64LE(s + 8);
    if (type !== 1 || !(flags & 4n)) continue; // PROGBITS with SHF_EXECINSTR
    const addr = buf.readBigUInt64LE(s + 16);
    const offset = Number(buf.readBigUInt64LE(s + 24));
    const size = Number(buf.readBigUInt64LE(s + 32));
    code.push({ addr, bytes: buf.subarray(offset, offset + size) });
  }
  return { dlls: null, code };
}

// ---------- link maps ----------

// MSVC /MAP: " 0001:00012345       _ZN7zlib_rs...       0000000140013345 f   lib:obj"
// lld -Map (rust-lld, the Linux default): "   17803   17803   15a   1   /…/x.rcgu.o:(.text._RNv…9crc32fast…)"
// GNU ld -Map: " .text._ZN7zlib_rs...\n                0x0000000000012345      0x1a0 obj" (one function per section)
function readMap(file) {
  const text = fs.readFileSync(file, 'latin1');
  const symbols = [];
  const msvc = /^\s*[0-9a-f]{4}:[0-9a-f]{8}\s+(\S+)\s+([0-9a-f]{16})\s+f\b/gim;
  for (const m of text.matchAll(msvc)) symbols.push({ addr: BigInt(`0x${m[2]}`), name: m[1] });
  const lld = /^\s*([0-9a-f]+)\s+[0-9a-f]+\s+[0-9a-f]+\s+\d+\s+\S*:\(\.text\.([^)]+)\)/gim;
  for (const m of text.matchAll(lld)) symbols.push({ addr: BigInt(`0x${m[1]}`), name: m[2] });
  const gnu = /^ \.text\.(\S+)\s+0x([0-9a-f]+)\s+0x([0-9a-f]+)/gim;
  for (const m of text.replace(/^( \.text\.\S+)\n\s+(0x)/gm, '$1 $2').matchAll(gnu)) {
    symbols.push({ addr: BigInt(`0x${m[2]}`), name: m[1] });
  }
  if (!symbols.length) throw new Error(`${file}: no functions in the link map`);
  symbols.sort((a, b) => (a.addr < b.addr ? -1 : a.addr > b.addr ? 1 : 0));
  return (addr) => {
    let lo = 0;
    let hi = symbols.length - 1;
    if (addr < symbols[0].addr) return null;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (symbols[mid].addr <= addr) lo = mid;
      else hi = mid - 1;
    }
    return symbols[lo].name;
  };
}

// ---------- AVX-512 ----------

const isZmm = (r) => r >= Register.ZMM0 && r <= Register.ZMM31;

function zmmAddresses(code) {
  const found = [];
  const instr = new Instruction();
  for (const { addr, bytes } of code) {
    const decoder = new Decoder(64, bytes, DecoderOptions.None);
    decoder.ip = addr;
    while (decoder.canDecode) {
      decoder.decodeOut(instr);
      let zmm = isZmm(instr.memoryIndex);
      for (let i = 0; !zmm && i < instr.opCount; i++) zmm = isZmm(instr.opRegister(i));
      if (zmm) found.push(instr.ip);
    }
    decoder.free();
  }
  instr.free();
  return found;
}

// ---------- checks ----------

const errors = [];

function checkWindowsImports(label, dlls) {
  const foreign = dlls.filter((dll) => {
    const name = dll.replace(/ \(delay-load\)$/, '').toLowerCase();
    return !WINDOWS_DLLS.has(name) && !/^(api|ext)-ms-win-/.test(name);
  });
  for (const dll of foreign)
    errors.push(`${label} imports ${dll}, which Windows does not have and the app does not ship`);
  console.log(`[..] ${label}: ${dlls.length} imported DLLs, ${dlls.length - foreign.length} of them part of Windows`);
}

const opts = args();
const shellBuf = fs.readFileSync(opts.shell);
const shell = readElf(shellBuf) ?? readPe(shellBuf);
if (!shell) throw new Error(`${opts.shell}: neither PE nor ELF`);

if (shell.dlls) {
  checkWindowsImports(path.basename(opts.shell), shell.dlls);
  const node = readPe(fs.readFileSync(opts.node));
  if (!node) throw new Error(`${opts.node}: not a PE binary`);
  checkWindowsImports(path.basename(opts.node), node.dlls);
}

const nameAt = readMap(opts.map);
const byFunction = new Map();
for (const addr of zmmAddresses(shell.code)) {
  const name = nameAt(addr) ?? `0x${addr.toString(16)} (not in the link map)`;
  byFunction.set(name, (byFunction.get(name) ?? 0) + 1);
}
for (const [name, count] of byFunction) {
  const dispatched = CPUID_DISPATCH.test(name);
  console.log(
    `[..] ${path.basename(opts.shell)}: AVX-512 x${count} in ${name}${dispatched ? ' (CPUID dispatch)' : ''}`,
  );
  if (!dispatched) errors.push(`${path.basename(opts.shell)}: AVX-512 in ${name} without a CPUID dispatcher`);
}
if (!byFunction.size) console.log(`[..] ${path.basename(opts.shell)}: no AVX-512`);
console.log(
  `[..] ${path.basename(opts.node)}: official nodejs.org build, its AVX-512 is chosen by V8 and simdutf at run time`,
);

if (errors.length) {
  for (const e of errors) console.log(`[ERROR] ${e}`);
  process.exit(1);
}
console.log('[OK] binaries: imports and AVX-512 checked');
