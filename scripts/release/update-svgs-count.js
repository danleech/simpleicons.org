#!/usr/bin/env node
/**
 * @fileoverview
 * Replaces the SVG count milestone "Over <NUMBER> Free SVG icons..." located
 * at README every time the number of current icons is more than `updateRange`
 * more than the previous milestone.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {getIconsData} from '../../sdk.mjs';

const regexMatcher = /Over\s(\d+)\s/;
const updateRange = 100;

const rootDirectory = path.resolve(import.meta.dirname, '..', '..');
const readmeFile = path.resolve(rootDirectory, 'README.md');

const readmeContent = await fs.readFile(readmeFile, 'utf8');

let overNIconsInReadme;
try {
  overNIconsInReadme = Number.parseInt(regexMatcher.exec(readmeContent)[1], 10);
} catch (error) {
  console.error(
    'Failed to obtain number of SVG icons of current milestone in README:',
    error,
  );
  process.exit(1);
}

const iconsData = await getIconsData();
const nIcons = iconsData.length;
const newNIcons = overNIconsInReadme + updateRange;

if (nIcons > newNIcons) {
  const newContent = readmeContent.replace(regexMatcher, `Over ${newNIcons} `);
  await fs.writeFile(readmeFile, newContent);
}
