#!/usr/bin/env node
/**
 * @fileoverview
 * Updates the CDN URLs in the README.md to match the major version in the
 * NPM package manifest. Does nothing if the README.md is already up-to-date.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDirectory = path.resolve(import.meta.dirname, '..', '..');
const packageJsonFile = path.resolve(rootDirectory, 'package.json');
const readmeFile = path.resolve(rootDirectory, 'README.md');

const getMajorVersion = (semVersion) => {
  const majorVersionAsString = semVersion.split('.')[0];
  return Number.parseInt(majorVersionAsString, 10);
};

const getManifest = async () => {
  const manifestRaw = await fs.readFile(packageJsonFile, 'utf8');
  return JSON.parse(manifestRaw);
};

const updateVersionInReadmeIfNecessary = async (majorVersion) => {
  let content = await fs.readFile(readmeFile, 'utf8');

  content = content.replaceAll(
    /simple-icons@v\d+/g,
    `simple-icons@v${majorVersion}`,
  );

  await fs.writeFile(readmeFile, content);
};

const main = async () => {
  try {
    const manifest = await getManifest();
    const majorVersion = getMajorVersion(manifest.version);
    await updateVersionInReadmeIfNecessary(majorVersion);
  } catch (error) {
    console.error('Failed to update CDN version number:', error);
    process.exit(1);
  }
};

await main();
