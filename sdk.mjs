/**
 * @fileoverview
 * Simple Icons SDK.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @typedef {import("./sdk").ThirdPartyExtension} ThirdPartyExtension
 * @typedef {import("./sdk").IconData} IconData
 */

const TITLE_TO_SLUG_REPLACEMENTS = {
  '+': 'plus',
  '.': 'dot',
  '&': 'and',
  đ: 'd',
  ħ: 'h',
  ı: 'i',
  ĸ: 'k',
  ŀ: 'l',
  ł: 'l',
  ß: 'ss',
  ŧ: 't',
};

const TITLE_TO_SLUG_CHARS_REGEX = new RegExp(
  `[${Object.keys(TITLE_TO_SLUG_REPLACEMENTS).join('')}]`,
  'g',
);

const TITLE_TO_SLUG_RANGE_REGEX = /[^a-z\d]/g;

/**
 * Regex to validate HTTPs URLs.
 */
export const URL_REGEX = /^https:\/\/[^\s"']+$/;

/**
 * Regex to validate SVG paths.
 */
export const SVG_PATH_REGEX = /^m[-mzlhvcsqtae\d,. ]+$/i;

/**
 * Get the slug/filename for an icon.
 * @param {IconData} icon The icon data as it appears in *_data/simple-icons.json*
 * @returns {String} The slug/filename for the icon
 */
export const getIconSlug = (icon) => icon.slug || titleToSlug(icon.title);

/**
 * Extract the path from an icon SVG content.
 * @param {String} svg The icon SVG content
 * @returns {String} The path from the icon SVG content
 **/
export const svgToPath = (svg) => svg.split('"', 8)[7];

/**
 * Converts a brand title into a slug/filename.
 * @param {String} title The title to convert
 * @returns {String} The slug/filename for the title
 */
export const titleToSlug = (title) =>
  title
    .toLowerCase()
    .replaceAll(
      TITLE_TO_SLUG_CHARS_REGEX,
      (char) => TITLE_TO_SLUG_REPLACEMENTS[char],
    )
    .normalize('NFD')
    .replaceAll(TITLE_TO_SLUG_RANGE_REGEX, '');

/**
 * Converts a slug into a variable name that can be exported.
 * @param {String} slug The slug to convert
 * @returns {String} The variable name for the slug
 */
export const slugToVariableName = (slug) => {
  const slugFirstLetter = slug[0].toUpperCase();
  return `si${slugFirstLetter}${slug.slice(1)}`;
};

/**
 * Converts a brand title as defined in *_data/simple-icons.json* into a brand
 * title in HTML/SVG friendly format.
 * @param {String} brandTitle The title to convert
 * @returns {String} The brand title in HTML/SVG friendly format
 */
export const titleToHtmlFriendly = (brandTitle) =>
  brandTitle
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll(/./g, (char) => {
      const charCode = char.codePointAt(0);
      return charCode > 127 ? `&#${charCode};` : char;
    });

/**
 * Converts a brand title in HTML/SVG friendly format into a brand title (as
 * it is seen in *_data/simple-icons.json*)
 * @param {String} htmlFriendlyTitle The title to convert
 * @returns {String} The brand title in HTML/SVG friendly format
 */
export const htmlFriendlyToTitle = (htmlFriendlyTitle) =>
  htmlFriendlyTitle
    .replaceAll(/&#(\d+);/g, (_, number_) =>
      String.fromCodePoint(Number.parseInt(number_, 10)),
    )
    .replaceAll(
      /&(quot|amp|lt|gt);/g,
      (_, reference) => ({quot: '"', amp: '&', lt: '<', gt: '>'})[reference],
    );

/**
 * Get path of *_data/simple-icons.json*.
 * @param {String} rootDirectory Path to the root directory of the project
 * @returns {String} Path of *_data/simple-icons.json*
 */
export const getIconDataPath = (rootDirectory = import.meta.dirname) => {
  return path.resolve(rootDirectory, '_data', 'simple-icons.json');
};

/**
 * Get contents of *_data/simple-icons.json*.
 * @param {String} rootDirectory Path to the root directory of the project
 * @returns {String} Content of *_data/simple-icons.json*
 */
export const getIconsDataString = (rootDirectory = import.meta.dirname) => {
  return fs.readFile(getIconDataPath(rootDirectory), 'utf8');
};

/**
 * Get icons data as object from *_data/simple-icons.json*.
 * @param {String} rootDirectory Path to the root directory of the project
 * @returns {IconData[]} Icons data as array from *_data/simple-icons.json*
 */
export const getIconsData = async (rootDirectory = import.meta.dirname) => {
  const fileContents = await getIconsDataString(rootDirectory);
  return JSON.parse(fileContents).icons;
};

/**
 * Replace Windows newline characters by Unix ones.
 * @param {String} text The text to replace
 * @returns {String} The text with Windows newline characters replaced by Unix ones
 */
export const normalizeNewlines = (text) => {
  return text.replaceAll('\r\n', '\n');
};

/**
 * Convert non-6-digit hex color to 6-digit with the character `#` stripped.
 * @param {String} text The color text
 * @returns {String} The color text in 6-digit hex format
 */
export const normalizeColor = (text) => {
  let color = text.replace('#', '').toUpperCase();
  if (color.length < 6) {
    // eslint-disable-next-line unicorn/no-useless-spread
    color = [...color.slice(0, 3)].map((x) => x.repeat(2)).join('');
  } else if (color.length > 6) {
    color = color.slice(0, 6);
  }

  return color;
};

/**
 * Get information about third party extensions from the README table.
 * @param {String} readmePath Path to the README file
 * @returns {Promise<ThirdPartyExtension[]>} Information about third party extensions
 */
export const getThirdPartyExtensions = async (
  readmePath = path.join(import.meta.dirname, 'README.md'),
) =>
  normalizeNewlines(await fs.readFile(readmePath, 'utf8'))
    .split('## Third-Party Extensions\n\n')[1]
    .split('\n\n', 1)[0]
    .split('\n')
    .slice(2)
    .map((line) => {
      let [module, author] = line.split(' | ');
      module = module.split('<img src="')[0];
      return {
        module: {
          name: /\[(.+)]/.exec(module)[1],
          url: /\((.+)\)/.exec(module)[1],
        },
        author: {
          name: /\[(.+)]/.exec(author)[1],
          url: /\((.+)\)/.exec(author)[1],
        },
      };
    });

/**
 * `Intl.Collator` object ready to be used for icon titles sorting.
 * @type {Intl.Collator}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator Intl.Collator}
 **/
export const collator = new Intl.Collator('en', {
  usage: 'search',
  caseFirst: 'upper',
});
