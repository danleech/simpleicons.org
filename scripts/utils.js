import fs from 'node:fs/promises';
import path from 'node:path';
import {getIconDataPath} from '../sdk.mjs';

/**
 * Get JSON schema data.
 * @param {String} rootDirectory Path to the root directory of the project.
 */
export const getJsonSchemaData = async (
  rootDirectory = path.resolve(import.meta.dirname, '..'),
) => {
  const jsonSchemaPath = path.resolve(rootDirectory, '.jsonschema.json');
  const jsonSchemaString = await fs.readFile(jsonSchemaPath, 'utf8');
  return JSON.parse(jsonSchemaString);
};

/**
 * Write icons data to _data/simple-icons.json.
 * @param {Object} iconsData Icons data object.
 * @param {String} rootDirectory Path to the root directory of the project.
 */
export const writeIconsData = async (
  iconsData,
  rootDirectory = path.resolve(import.meta.dirname, '..'),
) => {
  await fs.writeFile(
    getIconDataPath(rootDirectory),
    `${JSON.stringify(iconsData, null, 4)}\n`,
    'utf8',
  );
};
