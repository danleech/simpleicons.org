/**
 * @file Internal utilities.
 *
 * Here resides all the functionality that does not qualifies to reside
 * in the SDK because is not publicly exposed.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {getDirnameFromImportMeta, getIconDataPath} from '../sdk.mjs';

const __dirname = getDirnameFromImportMeta(import.meta.url);

/**
 * @typedef {import("../sdk.js").IconData} IconData
 */

/**
 * Get JSON schema data.
 * @param {string} rootDirectory Path to the root directory of the project.
 * @returns {Promise<any>} JSON schema data.
 */
export const getJsonSchemaData = async (
  rootDirectory = path.resolve(__dirname, '..'),
) => {
  const jsonSchemaPath = path.resolve(rootDirectory, '.jsonschema.json');
  const jsonSchemaString = await fs.readFile(jsonSchemaPath, 'utf8');
  return JSON.parse(jsonSchemaString);
};

/**
 * Write icons data to _data/simple-icons.json.
 * @param {{icons: IconData[]}} iconsData Icons data object.
 * @param {string} rootDirectory Path to the root directory of the project.
 * @param {boolean} minify Whether to minify the JSON output.
 */
export const writeIconsData = async (
  iconsData,
  rootDirectory = path.resolve(__dirname, '..'),
  minify,
) => {
  await fs.writeFile(
    getIconDataPath(rootDirectory),
    `${JSON.stringify(iconsData, null, minify ? 0 : 4)}\n`,
    'utf8',
  );
};

/**
 * Get SPDX license IDs from `spdx-license-ids` package.
 * @param {string} rootDirectory Path to the root directory of the project.
 * @returns {Promise<string[]>} Set of SPDX license IDs.
 */
export const getSpdxLicenseIds = async (
  rootDirectory = path.resolve(__dirname, '..'),
) => {
  const getSpdxLicenseJson = path.resolve(
    rootDirectory,
    'node_modules',
    'spdx-license-ids',
    'index.json',
  );
  const getSpdxLicenseString = await fs.readFile(getSpdxLicenseJson, 'utf8');
  return JSON.parse(getSpdxLicenseString);
};
