#!/usr/bin/env node
/**
 * @fileoverview
 * Clean files built by the build process.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDirectory = path.resolve(import.meta.dirname, '..', '..');
const files = ['index.js', 'index.mjs', 'index.d.ts', 'sdk.js'];

const fileExists = (fpath) =>
  fs
    .access(fpath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);

try {
  Promise.all(
    files.map(async (file) => {
      const filepath = path.join(rootDirectory, file);
      if (!(await fileExists(filepath))) {
        console.error(`File ${file} does not exist, skipping...`);
        return;
      }

      return fs.unlink(filepath);
    }),
  );
} catch (error) {
  console.error('Error cleaning files:', error);
  process.exit(1);
}
