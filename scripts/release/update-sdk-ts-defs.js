#!/usr/bin/env node
/**
 * @file
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
  } catch (/** @type {unknown} */ error) {
    await fs.writeFile(sdkMjs, originalSdkMjsContent);

    let errorMessage = error;
    if (error instanceof Error) {
      // The `execSync` function throws a generic Node.js Error
      errorMessage = error.message;
    }

    process.stdout.write(
      `Error generating Typescript definitions: '${errorMessage}'\n`,
    );

    process.exit(1);
  }

  await fs.writeFile(sdkMjs, originalSdkMjsContent);
};

/**
 * We must remove the duplicated export types that tsc generates from
 * JSDoc `typedef` comments.
 * See {@link https://github.com/microsoft/TypeScript/issues/46011}.
 * @param {string} content Content of the file.
 * @returns {string} The content without duplicated export types.
 */
const removeDuplicatedExportTypes = (content) => {
  const newContent = [];
  const lines = content.split('\n');
  /** @type {string[]} */
  const exportTypesFound = [];

  for (const line of lines) {
    if (line.startsWith('export type ')) {
      const type = line.split(' ')[2];
      if (!exportTypesFound.includes(type)) {
        newContent.push(line);
        exportTypesFound.push(type);
      }
    } else {
      newContent.push(line);
    }
  }

  return newContent.join('\n');
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

  await fs.writeFile(sdkTs, removeDuplicatedExportTypes(newSdkTsContent));
  await fs.unlink(sdkMts);

  try {
    execSync('npx prettier -w sdk.d.ts');
  } catch (error) {
    let errorMessage = error;
    if (error instanceof Error) {
      // The `execSync` function throws a generic Node.js Error
      errorMessage = error.message;
    }

    process.stdout.write(
      'Error executing Prettier to prettify' +
        ` SDK TS definitions: '${errorMessage}'` +
        '\n',
    );
    process.exit(1);
  }
};

await generateSdkTs();
