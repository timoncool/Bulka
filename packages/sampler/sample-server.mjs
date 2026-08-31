#!/usr/bin/env node

import cowsay from 'cowsay';
import { createReadStream, existsSync, writeFileSync } from 'fs';
import { readdir } from 'fs/promises';
import http from 'http';
import { join, resolve, sep } from 'path';
import readline from 'readline';
import os from 'os';

const LOG = !!process.env.LOG || false;
const PORT = process.env.PORT || 5432;
const VALID_AUDIO_EXTENSIONS = ['wav', 'mp3', 'ogg'];

const isAudioFile = (f) => {
  const ext = f.split('.').slice(-1)[0].toLowerCase();
  return VALID_AUDIO_EXTENSIONS.includes(ext);
};

async function getFilesInDirectory(directory) {
  let files = [];
  const dirents = await readdir(directory, { withFileTypes: true });
  for (const dirent of dirents) {
    const fullPath = join(directory, dirent.name);
    if (dirent.isDirectory()) {
      if (dirent.name.startsWith('.')) {
        LOG && console.warn(`ignore hidden folder: ${fullPath}`);
        continue;
      }
      try {
        const subFiles = (await getFilesInDirectory(fullPath)).filter(isAudioFile);
        files = files.concat(subFiles);
        LOG && console.log(`${dirent.name} (${subFiles.length})`);
      } catch (err) {
        LOG && console.warn(`skipped due to error: ${fullPath}`);
      }
    } else {
      isAudioFile(fullPath) && files.push(fullPath);
    }
  }
  return files;
}

async function getBanks(directory, flat = false) {
  let files = await getFilesInDirectory(directory);
  let banks = {};
  directory = directory.split(sep).join('/');
  files = files.map((path) => {
    path = path.split(sep).join('/');
    const subDir = path.replace(directory, '');
    const subDirFlat = subDir.replaceAll('/', '_').slice(1); // remove initial underscore
    const subDirFlatStem = subDirFlat.replace(/\.[^.]+$/, ''); // remove extension
    let bank = flat ? subDirFlatStem : path.split('/').slice(-2)[0];
    banks[bank] = banks[bank] || [];
    banks[bank].push(subDir);
    return subDir;
  });
  return { banks, files };
}

const args = process.argv.slice(2);

function getArgValue(flag) {
  const i = args.indexOf(flag);
  if (i !== -1) {
    const nextIsFlag = args[i + 1]?.startsWith('--') ?? true;
    if (nextIsFlag) return true;
    return args[i + 1];
  }
}

function getInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (response) => {
      rl.close();
      resolve(response);
    }),
  );
}

let directory = getArgValue('--dir') || process.cwd();
directory = resolve(directory);
if (args.includes('--json')) {
  const { banks } = await getBanks(directory, getArgValue('--flat'));
  const json = JSON.stringify(banks);
  const outFile = resolve(directory, 'strudel.json');
  if (existsSync(outFile)) {
    const answer = await getInput(`Warning: File already exists at ${outFile}. Overwrite? (y/N): `);
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }
  }
  writeFileSync(outFile, json, 'utf8');
  console.log(`Wrote json to ${outFile}`);
}

console.log(
  cowsay.say({
    text: 'welcome to @strudel/sampler',
    e: 'oO',
    T: 'U ',
  }),
);

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { banks, files } = await getBanks(directory, getArgValue('--flat'));
  if (req.url === '/') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(banks));
  }
  let subpath = decodeURIComponent(req.url);
  const filePath = join(directory, subpath.split('/').join(sep));

  // console.log('GET:', filePath);
  const isFound = existsSync(filePath);
  if (!isFound) {
    res.statusCode = 404;
    res.end('File not found');
    return;
  }
  const readStream = createReadStream(filePath);
  readStream.on('error', (err) => {
    res.statusCode = 500;
    res.end('Internal server error');
    console.error(err);
  });
  readStream.pipe(res);
});

const IP_ADDRESS = '0.0.0.0';
let IP;
const networkInterfaces = os.networkInterfaces();

Object.keys(networkInterfaces).forEach((key) => {
  networkInterfaces[key].forEach((networkInterface) => {
    if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
      IP = networkInterface.address;
    }
  });
});

server.listen(PORT, IP_ADDRESS, () => {
  console.log(`@strudel/sampler is now serving audio files from:
 ${directory}

To use them in the Strudel REPL, run:
 samples('http://localhost:${PORT}')

Or on a machine in the same network:
 ${IP ? `samples('http://${IP}:${PORT}')` : `Unable to determine server's IP address.`}
`);
});
