/*
nodePools.mjs - Helper functions related to pooling and re-using audio nodes

Copyright (C) 2025 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/packages/superdough/nodePools.mjs>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { releaseAudioNode } from './helpers.mjs';

const nodePools = new Map();
const POOL_KEY = Symbol('nodePoolKey');

export const isPoolable = (node) => !!node[POOL_KEY];

export const clearNodePool = () => {
  for (const pool of nodePools) {
    for (const node of pool) {
      if (node instanceof AudioNode) {
        releaseAudioNode(node);
      }
    }
  }
  nodePools.clear();
};

const getNodeTime = (node) => {
  return node.context?.currentTime ?? 0;
};

const getParams = (node) => {
  const params = new Set();
  node.parameters?.forEach((param) => params.add(param));
  const visited = new Set(); // prioritize deepest definition
  let proto = node;
  // Move up the prototype chain
  while (proto !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (visited.has(key)) continue;
      visited.add(key);
      const value = node[key];
      if (value instanceof AudioParam) {
        params.add(value);
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return params;
};

export const releaseNodeToPool = (node) => {
  node.disconnect();
  if (node instanceof AudioScheduledSourceNode) {
    // not reusable
    return;
  }
  const key = node[POOL_KEY];
  if (key == null) return;
  const now = getNodeTime(node);
  getParams(node).forEach((param) => param.cancelScheduledValues(now));
  const pool = nodePools.get(key) ?? [];
  pool.push(new WeakRef(node));
  nodePools.set(key, pool);
};

// Audio worklets are given a grace period to survive (`return true`) after
// being released. This concludes at time `end + 0.5`. We test here whether we are
// within some safe distance of that (`end + 0.45`) and if so, permit the node to be
// released. This helps to prevent race conditions between node termination and node
// re-use
const isNodeAlive = (node) => {
  // Skip check if node is not a worklet
  if (!(node instanceof AudioWorkletNode)) return true;
  const now = getNodeTime(node);
  const end = node?.parameters?.get('end').value ?? 0;
  return now < end + 0.45;
};

// Attempt to get node from the pool. If this fails, fall back
// to building it with the factory
export const getNodeFromPool = (key, factory) => {
  const pool = nodePools.get(key) ?? [];
  let node;
  let found = false;
  while (pool.length) {
    const ref = pool.pop();
    node = ref?.deref();
    if (node != null && isNodeAlive(node)) {
      found = true;
      break;
    }
  }
  if (!found) {
    node = factory();
  }
  node[POOL_KEY] = key;
  return node;
};
