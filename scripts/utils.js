/**
 * @file Internal utilities.
 *
 * Here resides all the functionality that does not qualifies to reside
 * in the SDK because is not publicly exposed.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
	collator,
	getDirnameFromImportMeta,
	getIconSlug,
	getIconsDataPath,
} from '../sdk.mjs';

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
) =>
	JSON.parse(
		await fs.readFile(path.resolve(rootDirectory, '.jsonschema.json'), 'utf8'),
	);

/**
 * Write icons data to _data/simple-icons.json.
 * @param {IconData[]} iconsData Icons data array.
 * @param {string} rootDirectory Path to the root directory of the project.
 * @param {boolean} minify Whether to minify the JSON output.
 */
export const writeIconsData = async (
	iconsData,
	rootDirectory = path.resolve(__dirname, '..'),
	minify,
) => {
	await fs.writeFile(
		getIconsDataPath(rootDirectory),
		`${JSON.stringify(iconsData, null, minify ? 0 : '\t')}\n`,
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
) =>
	JSON.parse(
		await fs.readFile(
			path.resolve(
				rootDirectory,
				'node_modules',
				'spdx-license-ids',
				'index.json',
			),
			'utf8',
		),
	);

/**
 * The compare function for sortng icons in _data/simple-icons.json.
 * @param {IconData} a Icon A.
 * @param {IconData} b Icon B.
 * @returns {number} Comparison result.
 */
export const sortIconsCompare = (a, b) => {
	return a.title === b.title
		? collator.compare(getIconSlug(a), getIconSlug(b))
		: collator.compare(a.title, b.title);
};

/**
 * Sort icon data obeject.
 * @param {IconData} icon The icon data as it appears in *_data/simple-icons.json*.
 * @returns {IconData} The sorted icon data.
 */
const sortIcon = (icon) => {
	const keyOrder = [
		'title',
		'slug',
		'hex',
		'source',
		'guidelines',
		'license',
		'aliases',
		// This is not appears in icon data but it's in the alias object.
		'loc',
	];
	const sortedIcon = Object.fromEntries(
		Object.entries(icon).sort(
			([key1], [key2]) => keyOrder.indexOf(key1) - keyOrder.indexOf(key2),
		),
	);
	return sortedIcon;
};

/**
 * Sort license object.
 * @param {IconData['license']} license The license object as it appears in *_data/simple-icons.json*.
 * @returns {IconData['license'] | undefined} The sorted license object.
 */
const sortLicense = (license) => {
	if (!license) return undefined;
	const keyOrder = ['type', 'url'];
	const sortedLicense = Object.fromEntries(
		Object.entries(license).sort(
			([key1], [key2]) => keyOrder.indexOf(key1) - keyOrder.indexOf(key2),
		),
	);
	return sortedLicense;
};

/**
 * Sort object key alphabetically.
 * @param {IconData['aliases']} object The aliases object as it appears in *_data/simple-icons.json*.
 * @returns {IconData['aliases'] | undefined} The sorted aliases object.
 */
const sortAlphabetically = (object) => {
	if (!object) return undefined;
	const sorted = Object.fromEntries(
		Object.entries(object).sort(([key1], [key2]) => (key1 > key2 ? 1 : -1)),
	);
	return sorted;
};

/**
 * Sort icons data.
 * @param {IconData[]} iconsData The icons data as it appears in *_data/simple-icons.json*.
 * @returns {IconData[]} The sorted icons data.
 */
export const formatIconData = (iconsData) => {
	const mappedIcons = iconsData.map((icon) => {
		return sortIcon({
			...icon,
			license: sortLicense(icon.license),
			aliases: icon.aliases
				? sortAlphabetically({
						aka: icon.aliases.aka?.sort(collator.compare),
						dup: icon.aliases.dup
							? icon.aliases.dup.sort(sortIconsCompare).map((d) =>
									sortIcon({
										...d,
										loc: sortAlphabetically(d.loc),
									}),
								)
							: undefined,
						loc: sortAlphabetically(icon.aliases.loc),
						old: icon.aliases.old?.sort(collator.compare),
					})
				: undefined,
		});
	});
	const sortedIcons = [...mappedIcons].sort(sortIconsCompare);
	return sortedIcons;
};
