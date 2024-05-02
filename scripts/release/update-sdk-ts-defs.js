#!/usr/bin/env node
/**
 * @fileoverview
 * Updates the SDK Typescript definitions located in the file sdk.d.ts
 * to match the current definitions of functions of sdk.mjs.
 */

import {execSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {getDirnameFromImportMeta} from '../../sdk.mjs';

const __dirname = getDirnameFromImportMeta(import.meta.url);
const rootDirectory = path.resolve(__dirname, '..', '..');

const sdkTs = path.resolve(rootDirectory, 'sdk.d.ts');
const sdkMts = path.resolve(rootDirectory, 'sdk.d.mts');
const sdkMjs = path.resolve(rootDirectory, 'sdk.mjs');

const generateSdkMts = async () => {
  // Remove temporally type definitions imported with comments
  // in sdk.mjs to avoid circular imports
  const originalSdkMjsContent = await fs.readFile(sdkMjs, 'utf8');
  const temporarySdkMjsContent = originalSdkMjsContent
    .split('\n')
    .filter((line) => {
      return !line.startsWith(' * @typedef {import("./sdk")');
    })
    .join('\n');
  await fs.writeFile(sdkMjs, temporarySdkMjsContent);
  try {
    execSync(
      'npx tsc sdk.mjs' +
        ' --declaration --emitDeclarationOnly --allowJs --removeComments',
    );
  } catch (error) {
    await fs.writeFile(sdkMjs, originalSdkMjsContent);
    process.stdout.write(
      `Error ${error.status} generating Typescript` +
        ` definitions: '${error.message}'`,
    );
    process.exit(1);
  }

  await fs.writeFile(sdkMjs, originalSdkMjsContent);
};

const generateSdkTs = async () => {
  const fileExists = await fs
    .access(sdkMts)
    .then(() => true)
    .catch(() => false);
  if (fileExists) await fs.unlink(sdkMts);
  await generateSdkMts();

  const autogeneratedMessage =
    '/* The next code is autogenerated from sdk.mjs */\n/* eslint-disable */';
  const newSdkTsContent =
    // eslint-disable-next-line unicorn/no-await-expression-member
    (await fs.readFile(sdkTs, 'utf8')).split(autogeneratedMessage)[0] +
    `${autogeneratedMessage}\n\n${await fs.readFile(sdkMts, 'utf8')}`;

  await fs.writeFile(sdkTs, newSdkTsContent);
  await fs.unlink(sdkMts);

  try {
    execSync('npx prettier -w sdk.d.ts');
  } catch (error) {
    process.stdout.write(
      `Error ${error.status} executing Prettier` +
        ` to prettify SDK TS definitions: '${error.message}'`,
    );
    process.exit(1);
  }
};

await generateSdkTs();
