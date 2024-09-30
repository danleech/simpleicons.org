/**
 * @file
 * Linting rules for SVGLint to check SVG icons.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {svgPathBbox} from 'svg-path-bbox';
import parsePath from 'svg-path-segments';
import svgpath from 'svgpath';
import {
  SVG_PATH_REGEX,
  collator,
  getDirnameFromImportMeta,
  getIconsData,
  htmlFriendlyToTitle,
} from './sdk.mjs';

const __dirname = getDirnameFromImportMeta(import.meta.url);
const htmlNamedEntitiesFile = path.join(
  __dirname,
  'node_modules',
  'named-html-entities-json',
  'index.json',
);
const svglintIgnoredFile = path.join(__dirname, '.svglint-ignored.json');

const icons = await getIconsData();
const htmlNamedEntities = JSON.parse(
  await fs.readFile(htmlNamedEntitiesFile, 'utf8'),
);
/** @type {{ [key: string]: { [key: string]: string } }} */
const svglintIgnores = JSON.parse(
  await fs.readFile(svglintIgnoredFile, 'utf8'),
);

const svgRegexp =
  /^<svg( \S*=".*"){3}><title>.*<\/title><path d=".*"\/><\/svg>$/;
const negativeZerosRegexp = /-0(?=[^.]|[\s\d\w]|$)/g;

const iconSize = 24;
const iconTargetCenter = iconSize / 2;
const iconFloatPrecision = 3;
const iconMaxFloatPrecision = 5;
const iconTolerance = 0.001;

// Set env SI_UPDATE_IGNORE to recreate the ignore file
const updateIgnoreFile = process.env.SI_UPDATE_IGNORE === 'true';
const ignoreFile = './.svglint-ignored.json';
const iconIgnored = updateIgnoreFile ? {} : svglintIgnores;

/**
 * Sort an object alphabetically by key converting it to an array.
 * @param {{ [key: string]: any }} object Object to sort by key.
 * @returns {{ [key: string]: any }} Object sorted by key.
 */
const sortObjectByKey = (object) => {
  return Object.fromEntries(
    Object.keys(object)
      .sort()
      .map((k) => [k, object[k]]),
  );
};

/**
 * Sort an object alphabetically by value converting it to an array.
 * @param {{ [key: string]: any }} object Object to sort by value.
 * @returns {{ [key: string]: any }} Object sorted by value.
 */
const sortObjectByValue = (object) => {
  return Object.fromEntries(
    Object.keys(object)
      .sort((a, b) => collator.compare(object[a], object[b]))
      .map((k) => [k, object[k]]),
  );
};

/**
 * Remove leading zeros from a number as a string.
 * @param {number | string} numberOrString The number or string to remove leading zeros from.
 * @returns {string} The number as a string without leading zeros.
 */
const removeLeadingZeros = (numberOrString) => {
  // Convert 0.03 to '.03'
  return numberOrString.toString().replace(/^(-?)(0)(\.?.+)/, '$1$3');
};

/**
 * Given three points, returns if the middle one (x2, y2) is collinear
 *   to the line formed by the two limit points.
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 * @param {number} x3 The x coordinate of the third point.
 * @param {number} y3 The y coordinate of the third point.
 * @returns {boolean} Whether the middle point is collinear to the line.
 */
// eslint-disable-next-line max-params
const collinear = (x1, y1, x2, y2, x3, y3) => {
  return x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2) === 0;
};

/**
 * Returns the number of digits after the decimal point.
 * @param {number} number_ The number to count the decimals of.
 * @returns {number} The number of digits after the decimal point.
 */
const countDecimals = (number_) => {
  if (number_ && number_ % 1) {
    const [base, op, trail] = number_.toExponential().split(/e([+-])/);
    const elen = Number.parseInt(trail, 10);
    const index = base.indexOf('.');
    return index === -1
      ? elen
      : base.length - index - 1 + (op === '+' ? -elen : elen);
  }

  return 0;
};

/**
 * Get the index at which the first path value of an SVG starts.
 * @param {string} svgFileContent The raw SVG as text.
 * @returns {number} The index at which the path value starts.
 */
const getPathDIndex = (svgFileContent) => {
  const pathDStart = '<path d="';
  return svgFileContent.indexOf(pathDStart) + pathDStart.length;
};

/**
 * Get the index at which the text of the first `<title></title>` tag starts.
 * @param {string} svgFileContent The raw SVG as text.
 * @returns {number} The index at which the title text starts.
 */
const getTitleTextIndex = (svgFileContent) => {
  const titleStart = '<title>';
  return svgFileContent.indexOf(titleStart) + titleStart.length;
};

/**
 * Shorten a string with ellipsis if it exceeds 20 characters.
 * @param {string} string_ The string to shorten.
 * @returns {string} The shortened string.
 */
const maybeShortenedWithEllipsis = (string_) => {
  return string_.length > 20 ? `${string_.slice(0, 20)}...` : string_;
};

/**
 * Check if a string is a number.
 * @param {string} string_ The string to check.
 * @returns {boolean} Whether the string is a number.
 */
const isNumber = (string_) =>
  [...string_].every((character) => '0123456789'.includes(character));

/**
 * Memoize a function which accepts a single argument.
 * A second argument can be passed to be used as key.
 * @param {(arg0: any) => any} function_ The function to memoize.
 * @returns {(arg0: any) => any} The memoized function.
 */
const memoize = (function_) => {
  /** @type {{ [key: string]: any }} */
  const results = {};

  /**
   * Memoized function.
   * @param {any} argument The argument to memoize.
   * @returns {any} The result of the memoized function.
   */
  return (argument) => {
    results[argument] ||= function_(argument);

    return results[argument];
  };
};

/** @typedef {import('cheerio').Cheerio<import('domhandler').Document>} Cheerio */

/** @type {($icon: Cheerio) => string} */
const getIconPath = memoize(($icon) => $icon.find('path').attr('d'));
/** @type {(iconPath: string) => import('svg-path-segments').Segment[]} */
const getIconPathSegments = memoize((iconPath) => parsePath(iconPath));
/** @type {(iconPath: string) => import('svg-path-bbox').BBox} */
const getIconPathBbox = memoize((iconPath) => svgPathBbox(iconPath));

if (updateIgnoreFile) {
  process.on('exit', async () => {
    // Ensure object output order is consistent due to async svglint processing
    const sorted = sortObjectByKey(iconIgnored);
    for (const linterName in sorted) {
      if (linterName) {
        sorted[linterName] = sortObjectByValue(sorted[linterName]);
      }
    }

    await fs.writeFile(ignoreFile, JSON.stringify(sorted, null, 2) + '\n', {
      flag: 'w',
    });
  });
}

/**
 * Check if an icon is ignored by a linter rule.
 * @param {string} linterRule The name of the linter rule.
 * @param {string} path SVG path of the icon.
 * @returns {boolean} Whether the icon is ignored by the linter rule.
 */
const isIgnored = (linterRule, path) => {
  return (
    iconIgnored[linterRule] && Object.hasOwn(iconIgnored[linterRule], path)
  );
};

/**
 * Ignore an icon for a linter rule.
 * @param {string} linterRule The name of the linter rule.
 * @param {string} path SVG path of the icon.
 * @param {Cheerio} $ The SVG object.
 */
const ignoreIcon = (linterRule, path, $) => {
  iconIgnored[linterRule] ||= {};

  const title = $.find('title').text();
  const iconName = htmlFriendlyToTitle(title);

  iconIgnored[linterRule][path] = iconName;
};

/** @type {import('svglint').Config} */
const config = {
  rules: {
    elm: {
      svg: 1,
      'svg > title': 1,
      'svg > path': 1,
      '*': false,
    },
    attr: [
      {
        // Ensure that the SVG element has the appropriate attributes
        // alphabetically ordered
        role: 'img',
        viewBox: `0 0 ${iconSize} ${iconSize}`,
        xmlns: 'http://www.w3.org/2000/svg',
        'rule::selector': 'svg',
        'rule::whitelist': true,
        'rule::order': true,
      },
      {
        // Ensure that the title element has the appropriate attribute
        'rule::selector': 'svg > title',
        'rule::whitelist': true,
      },
      {
        // Ensure that the path element only has the 'd' attribute
        // (no style, opacity, etc.)
        d: SVG_PATH_REGEX,
        'rule::selector': 'svg > path',
        'rule::whitelist': true,
      },
    ],
    custom: [
      // eslint-disable-next-line complexity
      (reporter, $, ast) => {
        reporter.name = 'icon-title';

        const iconTitleText = $.find('title').text();
        const xmlNamedEntitiesCodepoints = [38, 60, 62];
        const xmlNamedEntities = ['amp', 'lt', 'gt'];
        let _validCodepointsRepr = true;

        // Avoid character codepoints as hexadecimal representation
        const hexadecimalCodepoints = [
          ...iconTitleText.matchAll(/&#x([A-Fa-f\d]+);/g),
        ];
        if (hexadecimalCodepoints.length > 0) {
          _validCodepointsRepr = false;

          for (const match of hexadecimalCodepoints) {
            const charHexReprIndex =
              getTitleTextIndex(ast.source) + match.index + 1;
            const charDec = Number.parseInt(match[1], 16);

            let charRepr;
            if (xmlNamedEntitiesCodepoints.includes(charDec)) {
              charRepr = `&${
                xmlNamedEntities[xmlNamedEntitiesCodepoints.indexOf(charDec)]
              };`;
            } else if (charDec < 128) {
              charRepr = String.fromCodePoint(charDec);
            } else {
              charRepr = `&#${charDec};`;
            }

            reporter.error(
              'Hexadecimal representation of encoded character' +
                ` "${match[0]}" found at index ${charHexReprIndex}:` +
                ` replace it with "${charRepr}".`,
            );
          }
        }

        // Avoid character codepoints as named entities
        const namedEntitiesCodepoints = [
          ...iconTitleText.matchAll(/&([A-Za-z\d]+);/g),
        ];
        if (namedEntitiesCodepoints.length > 0) {
          for (const match of namedEntitiesCodepoints) {
            const namedEntiyReprIndex =
              getTitleTextIndex(ast.source) + match.index + 1;

            if (!xmlNamedEntities.includes(match[1].toLowerCase())) {
              _validCodepointsRepr = false;
              const namedEntityJsRepr = htmlNamedEntities[match[1]];
              let replacement;

              if (
                namedEntityJsRepr === undefined ||
                namedEntityJsRepr.length !== 1
              ) {
                replacement = 'its decimal or literal representation';
              } else {
                const namedEntityDec = namedEntityJsRepr.codePointAt(0);
                replacement =
                  namedEntityDec < 128
                    ? `"${namedEntityJsRepr}"`
                    : `"&#${namedEntityDec};"`;
              }

              reporter.error(
                'Named entity representation of encoded character' +
                  ` "${match[0]}" found at index ${namedEntiyReprIndex}.` +
                  ` Replace it with ${replacement}.`,
              );
            }
          }
        }

        if (_validCodepointsRepr) {
          // Compare encoded title with original title and report error if not equal
          const encodingMatches = [
            ...iconTitleText.matchAll(/&(#(\d+)|(amp|quot|lt|gt));/g),
          ];
          const encodedBuf = [];

          const indexesToIgnore = [];
          for (const match of encodingMatches) {
            for (let r = match.index; r < match.index + match[0].length; r++) {
              indexesToIgnore.push(r);
            }
          }

          for (let i = iconTitleText.length - 1; i >= 0; i--) {
            if (indexesToIgnore.includes(i)) {
              encodedBuf.unshift(iconTitleText[i]);
            } else {
              // Encode all non ascii characters plus "'&<> (XML named entities)
              /** @type {number} */
              // @ts-ignore
              const charDecimalCode = iconTitleText.codePointAt(i);

              if (charDecimalCode > 127) {
                encodedBuf.unshift(`&#${charDecimalCode};`);
              } else if (xmlNamedEntitiesCodepoints.includes(charDecimalCode)) {
                encodedBuf.unshift(
                  `&${
                    xmlNamedEntities[
                      xmlNamedEntitiesCodepoints.indexOf(charDecimalCode)
                    ]
                  };`,
                );
              } else {
                encodedBuf.unshift(iconTitleText[i]);
              }
            }
          }

          const encodedIconTitleText = encodedBuf.join('');
          if (encodedIconTitleText !== iconTitleText) {
            _validCodepointsRepr = false;

            reporter.error(
              `Unencoded unicode characters found in title "${iconTitleText}":` +
                ` rewrite it as "${encodedIconTitleText}".`,
            );
          }

          // Check if there are some other encoded characters in decimal notation
          // which shouldn't be encoded
          const numberMatches = encodingMatches.filter(
            (m) => m[2] !== undefined && isNumber(m[2]),
          );
          for (const match of numberMatches) {
            const decimalNumber = Number.parseInt(match[2], 10);
            if (decimalNumber > 127) {
              continue;
            }

            _validCodepointsRepr = false;

            const decimalCodepointCharIndex =
              getTitleTextIndex(ast.source) + match.index + 1;
            let replacement;
            if (xmlNamedEntitiesCodepoints.includes(decimalNumber)) {
              replacement = `"&${
                xmlNamedEntities[
                  xmlNamedEntitiesCodepoints.indexOf(decimalNumber)
                ]
              };"`;
            } else {
              replacement = String.fromCodePoint(decimalNumber);
              replacement = replacement === '"' ? `'"'` : `"${replacement}"`;
            }

            reporter.error(
              `Unnecessary encoded character "${match[0]}" found` +
                ` at index ${decimalCodepointCharIndex}:` +
                ` replace it with ${replacement}.`,
            );
          }

          if (_validCodepointsRepr) {
            const iconName = htmlFriendlyToTitle(iconTitleText);
            const iconExists = icons.some((icon) => icon.title === iconName);
            if (!iconExists) {
              reporter.error(
                `No icon with title "${iconName}" found in simple-icons.json`,
              );
            }
          }
        }
      },
      (reporter, $) => {
        reporter.name = 'icon-size';

        const iconPath = getIconPath($);
        if (!updateIgnoreFile && isIgnored(reporter.name, iconPath)) {
          return;
        }

        const [minX, minY, maxX, maxY] = getIconPathBbox(iconPath);
        const width = Number((maxX - minX).toFixed(iconFloatPrecision));
        const height = Number((maxY - minY).toFixed(iconFloatPrecision));

        if (width === 0 && height === 0) {
          reporter.error(
            'Path bounds were reported as 0 x 0; check if the path is valid',
          );
          if (updateIgnoreFile) {
            ignoreIcon(reporter.name, iconPath, $);
          }
        } else if (width !== iconSize && height !== iconSize) {
          reporter.error(
            `Size of <path> must be exactly ${iconSize} in one dimension;` +
              ` the size is currently ${width} x ${height}`,
          );
          if (updateIgnoreFile) {
            ignoreIcon(reporter.name, iconPath, $);
          }
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'icon-precision';

        const iconPath = getIconPath($);
        const segments = getIconPathSegments(iconPath);

        for (const segment of segments) {
          /** @type {number[]} */
          // @ts-ignore
          const numberParameters = segment.params.slice(1);
          const precisionMax = Math.max(
            // eslint-disable-next-line unicorn/no-array-callback-reference
            ...numberParameters.map(countDecimals),
          );
          if (precisionMax > iconMaxFloatPrecision) {
            let errorMessage =
              `found ${precisionMax} decimals in segment` +
              ` "${iconPath.slice(segment.start, segment.end)}"`;
            if (segment.chain !== undefined) {
              const readableChain = maybeShortenedWithEllipsis(
                iconPath.slice(segment.chain.start, segment.chain.end),
              );
              errorMessage += ` of chain "${readableChain}"`;
            }

            errorMessage += ` at index ${
              segment.start + getPathDIndex(ast.source)
            }`;
            reporter.error(
              'Maximum precision should not be greater than' +
                ` ${iconMaxFloatPrecision}; ${errorMessage}`,
            );
          }
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'ineffective-segments';

        const iconPath = getIconPath($);
        const segments = getIconPathSegments(iconPath);

        /** @type {import('svg-path-segments').Segment[]} */
        // TODO: svgpath does not includes the `segments` property on the interface,
        //       see https://github.com/fontello/svgpath/pull/67/files
        //
        /** @typedef {[string, ...number[]]} Segment  */
        /** @type {Segment[]} */
        const absSegments =
          // @ts-ignore
          svgpath(iconPath).abs().unshort().segments;

        const lowerMovementCommands = ['m', 'l'];
        const lowerDirectionCommands = ['h', 'v'];
        const lowerCurveCommand = 'c';
        const lowerShorthandCurveCommand = 's';
        const lowerCurveCommands = [
          lowerCurveCommand,
          lowerShorthandCurveCommand,
        ];
        const upperMovementCommands = ['M', 'L'];
        const upperHorDirectionCommand = 'H';
        const upperVersionDirectionCommand = 'V';
        const upperDirectionCommands = [
          upperHorDirectionCommand,
          upperVersionDirectionCommand,
        ];
        const upperCurveCommand = 'C';
        const upperShorthandCurveCommand = 'S';
        const upperCurveCommands = [
          upperCurveCommand,
          upperShorthandCurveCommand,
        ];
        const curveCommands = [...lowerCurveCommands, ...upperCurveCommands];
        const commands = new Set([
          ...lowerMovementCommands,
          ...lowerDirectionCommands,
          ...upperMovementCommands,
          ...upperDirectionCommands,
          ...curveCommands,
        ]);

        /**
         * Check if a segment is ineffective.
         * @param {import('svg-path-segments').Segment} segment The segment to check.
         * @param {number} index The index of the segment in the path.
         * @param {boolean} previousSegmentIsZ Whether the previous segment is a Z command.
         * @returns {boolean} Whether the segment is ineffective.
         */
        // eslint-disable-next-line complexity
        const isInvalidSegment = (segment, index, previousSegmentIsZ) => {
          const [command, x1Coord, y1Coord, ...rest] = segment.params;
          if (commands.has(command)) {
            // Relative directions (h or v) having a length of 0
            if (lowerDirectionCommands.includes(command) && x1Coord === 0) {
              return true;
            }

            // Relative movement (m or l) having a distance of 0
            if (
              index > 0 &&
              lowerMovementCommands.includes(command) &&
              x1Coord === 0 &&
              y1Coord === 0
            ) {
              // When the path is closed (z), the new segment can start with
              // a relative placement (m) as if it were absolute (M)
              return command.toLowerCase() === 'm' ? !previousSegmentIsZ : true;
            }

            if (
              lowerCurveCommands.includes(command) &&
              x1Coord === 0 &&
              y1Coord === 0
            ) {
              const [x2Coord, y2Coord] = rest;
              if (
                // Relative shorthand curve (s) having a control point of 0
                command === lowerShorthandCurveCommand ||
                // Relative bézier curve (c) having control points of 0
                (command === lowerCurveCommand &&
                  x2Coord === 0 &&
                  y2Coord === 0)
              ) {
                return true;
              }
            }

            if (index > 0) {
              let [yPreviousCoord, xPreviousCoord] = [
                ...absSegments[index - 1],
              ].reverse();
              // If the previous command was a direction one,
              // we need to iterate back until we find the missing coordinates
              // @ts-ignore
              if (upperDirectionCommands.includes(xPreviousCoord)) {
                // @ts-ignore
                xPreviousCoord = undefined;
                // @ts-ignore
                yPreviousCoord = undefined;
                let index_ = index;
                while (
                  --index_ > 0 &&
                  (xPreviousCoord === undefined || yPreviousCoord === undefined)
                ) {
                  let [yPreviousCoordDeep, xPreviousCoordDeep] = [
                    ...absSegments[index_],
                  ].reverse();

                  // If the previous command was a horizontal movement,
                  // we need to consider the single coordinate as x
                  if (upperHorDirectionCommand === xPreviousCoordDeep) {
                    xPreviousCoordDeep = yPreviousCoordDeep;
                    // @ts-ignore
                    yPreviousCoordDeep = undefined;
                  }

                  // If the previous command was a vertical movement,
                  // we need to consider the single coordinate as y
                  if (upperVersionDirectionCommand === xPreviousCoordDeep) {
                    // @ts-ignore
                    xPreviousCoordDeep = undefined;
                  }

                  if (
                    xPreviousCoord === undefined &&
                    xPreviousCoordDeep !== undefined
                  ) {
                    xPreviousCoord = xPreviousCoordDeep;
                  }

                  if (
                    yPreviousCoord === undefined &&
                    yPreviousCoordDeep !== undefined
                  ) {
                    yPreviousCoord = yPreviousCoordDeep;
                  }
                }
              }

              if (upperCurveCommands.includes(command)) {
                const [x2Coord, y2Coord, xCoord, yCoord] = rest;
                // Absolute shorthand curve (S) having
                // the same coordinate as the previous segment
                // and a control point equal to the ending point
                if (
                  upperShorthandCurveCommand === command &&
                  x1Coord === xPreviousCoord &&
                  y1Coord === yPreviousCoord &&
                  x1Coord === x2Coord &&
                  y1Coord === y2Coord
                ) {
                  return true;
                }

                // Absolute bézier curve (C) having
                // the same coordinate as the previous segment
                // and last control point equal to the ending point
                if (
                  upperCurveCommand === command &&
                  x1Coord === xPreviousCoord &&
                  y1Coord === yPreviousCoord &&
                  x2Coord === xCoord &&
                  y2Coord === yCoord
                ) {
                  return true;
                }
              }

              return (
                // Absolute horizontal direction (H) having
                // the same x coordinate as the previous segment
                (upperHorDirectionCommand === command &&
                  x1Coord === xPreviousCoord) ||
                // Absolute vertical direction (V) having
                // the same y coordinate as the previous segment
                (upperVersionDirectionCommand === command &&
                  x1Coord === yPreviousCoord) ||
                // Absolute movement (M or L) having the same
                // coordinate as the previous segment
                (upperMovementCommands.includes(command) &&
                  x1Coord === xPreviousCoord &&
                  y1Coord === yPreviousCoord)
              );
            }
          }

          return false;
        };

        for (let index = 0; index < segments.length; index++) {
          const segment = segments[index];
          const previousSegmentIsZ =
            index > 0 && segments[index - 1].params[0].toLowerCase() === 'z';

          if (isInvalidSegment(segment, index, previousSegmentIsZ)) {
            const [command, _x1, _y1, ...rest] = segment.params;

            let errorMessage = `Ineffective segment "${iconPath.slice(
              segment.start,
              segment.end,
            )}" found`;
            let resolutionTip = 'should be removed';

            if (curveCommands.includes(command)) {
              const [x2, y2, x, y] = rest;

              if (
                command === lowerShorthandCurveCommand &&
                (x2 !== 0 || y2 !== 0)
              ) {
                resolutionTip = `should be "l${removeLeadingZeros(
                  x2,
                )} ${removeLeadingZeros(y2)}" or removed`;
              }

              if (command === upperShorthandCurveCommand) {
                resolutionTip = `should be "L${removeLeadingZeros(
                  x2,
                )} ${removeLeadingZeros(y2)}" or removed`;
              }

              if (command === lowerCurveCommand && (x !== 0 || y !== 0)) {
                resolutionTip = `should be "l${removeLeadingZeros(
                  x,
                )} ${removeLeadingZeros(y)}" or removed`;
              }

              if (command === upperCurveCommand) {
                resolutionTip = `should be "L${removeLeadingZeros(
                  x,
                )} ${removeLeadingZeros(y)}" or removed`;
              }
            }

            if (segment.chain !== undefined) {
              const readableChain = maybeShortenedWithEllipsis(
                iconPath.slice(segment.chain.start, segment.chain.end),
              );
              errorMessage += ` in chain "${readableChain}"`;
            }

            errorMessage += ` at index ${
              segment.start + getPathDIndex(ast.source)
            }`;

            reporter.error(`${errorMessage} (${resolutionTip})`);
          }
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'collinear-segments';
        /**
         * Extracts collinear coordinates from SVG path straight lines
         * (does not extracts collinear coordinates from curves).
         * @param {string} iconPath The SVG path of the icon.
         * @returns {import('svg-path-segments').Segment[]} The collinear segments.
         */
        // eslint-disable-next-line complexity
        const getCollinearSegments = (iconPath) => {
          const segments = getIconPathSegments(iconPath);
          const collinearSegments = [];
          const straightLineCommands = 'HhVvLlMm';

          let currentLine = [];
          let currentAbsCoord = [undefined, undefined];
          let startPoint;
          let _inStraightLine = false;
          let _nextInStraightLine = false;
          let _resetStartPoint = false;

          for (let s = 0; s < segments.length; s++) {
            const seg = segments[s];
            const parms = seg.params;
            const cmd = parms[0];
            const nextCmd =
              s + 1 < segments.length ? segments[s + 1].params[0] : null;

            switch (cmd) {
              // Next switch cases have been ordered by frequency
              // of occurrence in the SVG paths of the icons
              case 'M': {
                // @ts-ignore
                currentAbsCoord[0] = parms[1];
                // @ts-ignore
                currentAbsCoord[1] = parms[2];
                // SVG 1.1:
                // If a moveto is followed by multiple pairs of coordinates,
                // the subsequent pairs are treated as implicit lineto commands.
                if (seg.chain === undefined || seg.chain.start === seg.start) {
                  startPoint = undefined;
                }

                break;
              }

              case 'm': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                if (seg.chain === undefined || seg.chain.start === seg.start) {
                  startPoint = undefined;
                }

                break;
              }

              case 'H': {
                // @ts-ignore
                currentAbsCoord[0] = parms[1];
                break;
              }

              case 'h': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                break;
              }

              case 'V': {
                // @ts-ignore
                currentAbsCoord[1] = parms[1];
                break;
              }

              case 'v': {
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[1];
                break;
              }

              case 'L': {
                // @ts-ignore
                currentAbsCoord[0] = parms[1];
                // @ts-ignore
                currentAbsCoord[1] = parms[2];
                break;
              }

              case 'l': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                break;
              }

              case 'Z':
              case 'z': {
                // TODO: Overlapping in Z should be handled in another rule
                // @ts-ignore
                currentAbsCoord = [startPoint[0], startPoint[1]];
                _resetStartPoint = true;
                break;
              }

              case 'C': {
                // @ts-ignore
                currentAbsCoord[0] = parms[5];
                // @ts-ignore
                currentAbsCoord[1] = parms[6];
                break;
              }

              case 'c': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[5];
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[6];
                break;
              }

              case 'A': {
                // @ts-ignore
                currentAbsCoord[0] = parms[6];
                // @ts-ignore
                currentAbsCoord[1] = parms[7];
                break;
              }

              case 'a': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[6];
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[7];
                break;
              }

              case 's': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                break;
              }

              case 'S': {
                // @ts-ignore
                currentAbsCoord[0] = parms[1];
                // @ts-ignore
                currentAbsCoord[1] = parms[2];
                break;
              }

              case 't': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                break;
              }

              case 'T': {
                // @ts-ignore
                currentAbsCoord[0] = parms[1];
                // @ts-ignore
                currentAbsCoord[1] = parms[2];
                break;
              }

              case 'Q': {
                // @ts-ignore
                currentAbsCoord[0] = parms[3];
                // @ts-ignore
                currentAbsCoord[1] = parms[4];
                break;
              }

              case 'q': {
                // @ts-ignore
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[3];
                // @ts-ignore
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[4];
                break;
              }

              default: {
                throw new Error(`"${cmd}" command not handled`);
              }
            }

            if (startPoint === undefined) {
              startPoint = [currentAbsCoord[0], currentAbsCoord[1]];
            } else if (_resetStartPoint) {
              startPoint = undefined;
              _resetStartPoint = false;
            }

            // @ts-ignore
            _nextInStraightLine = straightLineCommands.includes(nextCmd);
            const _exitingStraightLine =
              _inStraightLine && !_nextInStraightLine;
            _inStraightLine = straightLineCommands.includes(cmd);

            if (_inStraightLine) {
              currentLine.push([currentAbsCoord[0], currentAbsCoord[1]]);
            } else {
              if (_exitingStraightLine) {
                if (straightLineCommands.includes(cmd)) {
                  currentLine.push([currentAbsCoord[0], currentAbsCoord[1]]);
                }

                // Get collinear coordinates
                for (let p = 1; p < currentLine.length - 1; p++) {
                  const _collinearCoord = collinear(
                    // @ts-ignore
                    currentLine[p - 1][0],
                    currentLine[p - 1][1],
                    currentLine[p][0],
                    currentLine[p][1],
                    currentLine[p + 1][0],
                    currentLine[p + 1][1],
                  );
                  if (_collinearCoord) {
                    collinearSegments.push(
                      segments[s - currentLine.length + p + 1],
                    );
                  }
                }
              }

              currentLine = [];
            }
          }

          return collinearSegments;
        };

        const iconPath = getIconPath($);
        const collinearSegments = getCollinearSegments(iconPath);
        if (collinearSegments.length === 0) {
          return;
        }

        const pathDIndex = getPathDIndex(ast.source);
        for (const segment of collinearSegments) {
          let errorMessage = `Collinear segment "${iconPath.slice(
            segment.start,
            segment.end,
          )}" found`;
          if (segment.chain !== undefined) {
            const readableChain = maybeShortenedWithEllipsis(
              iconPath.slice(segment.chain.start, segment.chain.end),
            );
            errorMessage += ` in chain "${readableChain}"`;
          }

          errorMessage += ` at index ${
            segment.start + pathDIndex
          } (should be removed)`;
          reporter.error(errorMessage);
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'extraneous';

        if (!svgRegexp.test(ast.source)) {
          if (ast.source.includes('\n') || ast.source.includes('\r')) {
            reporter.error(
              'Unexpected newline character(s) detected in SVG markup',
            );
          } else {
            reporter.error(
              'Unexpected character(s), most likely extraneous' +
                ' whitespace, detected in SVG markup',
            );
          }
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'negative-zeros';

        const iconPath = getIconPath($);

        // Find negative zeros inside path
        const negativeZeroMatches = [...iconPath.matchAll(negativeZerosRegexp)];
        if (negativeZeroMatches.length > 0) {
          // Calculate the index for each match in the file
          const pathDIndex = getPathDIndex(ast.source);

          for (const match of negativeZeroMatches) {
            const negativeZeroFileIndex = match.index + pathDIndex;
            const previousChar = ast.source[negativeZeroFileIndex - 1];
            const replacement = '0123456789'.includes(previousChar)
              ? ' 0'
              : '0';
            reporter.error(
              `Found "-0" at index ${negativeZeroFileIndex} (should` +
                ` be "${replacement}")`,
            );
          }
        }
      },
      (reporter, $) => {
        reporter.name = 'icon-centered';

        const iconPath = getIconPath($);
        if (!updateIgnoreFile && isIgnored(reporter.name, iconPath)) {
          return;
        }

        const [minX, minY, maxX, maxY] = getIconPathBbox(iconPath);
        const centerX = Number(((minX + maxX) / 2).toFixed(iconFloatPrecision));
        const devianceX = centerX - iconTargetCenter;
        const centerY = Number(((minY + maxY) / 2).toFixed(iconFloatPrecision));
        const devianceY = centerY - iconTargetCenter;

        if (
          Math.abs(devianceX) > iconTolerance ||
          Math.abs(devianceY) > iconTolerance
        ) {
          reporter.error(
            `<path> must be centered at (${iconTargetCenter}, ${iconTargetCenter});` +
              ` the center is currently (${centerX}, ${centerY})`,
          );
          if (updateIgnoreFile) {
            ignoreIcon(reporter.name, iconPath, $);
          }
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'final-closepath';

        const iconPath = getIconPath($);
        const segments = getIconPathSegments(iconPath);

        // Unnecessary characters after the final closepath
        /** @type {import('svg-path-segments').Segment} */
        // @ts-ignore
        const lastSegment = segments.at(-1);
        const endsWithZ = ['z', 'Z'].includes(lastSegment.params[0]);
        if (endsWithZ && lastSegment.end - lastSegment.start > 1) {
          const ending = iconPath.slice(lastSegment.start + 1);
          const closepath = iconPath.at(lastSegment.start);
          const pathDIndex = getPathDIndex(ast.source);
          const index = pathDIndex + lastSegment.start + 2;
          const errorMessage =
            `Invalid character(s) "${ending}" after the final` +
            ` closepath command "${closepath}" at index ${index}` +
            ` (should be removed)`;
          reporter.error(errorMessage);
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'path-format';

        const iconPath = getIconPath($);

        if (!SVG_PATH_REGEX.test(iconPath)) {
          const errorMessage = 'Invalid path format';
          let reason;

          if (!iconPath.startsWith('M') && !iconPath.startsWith('m')) {
            // Doesn't start with moveto
            reason =
              'should start with "moveto" command ("M" or "m"),' +
              ` but starts with "${iconPath[0]}"`;
            reporter.error(`${errorMessage}: ${reason}`);
          }

          const validPathCharacters = SVG_PATH_REGEX.source.replaceAll(
            /[[\]+^$]/g,
            '',
          );
          const invalidCharactersMsgs = [];
          const pathDIndex = getPathDIndex(ast.source);

          for (const [i, char] of Object.entries(iconPath)) {
            if (!validPathCharacters.includes(char)) {
              invalidCharactersMsgs.push(
                `"${char}" at index ${pathDIndex + Number.parseInt(i, 10)}`,
              );
            }
          }

          // Contains invalid characters
          if (invalidCharactersMsgs.length > 0) {
            reason = `unexpected character${
              invalidCharactersMsgs.length > 1 ? 's' : ''
            } found (${invalidCharactersMsgs.join(', ')})`;
            reporter.error(`${errorMessage}: ${reason}`);
          }
        }
      },
      (reporter, $, ast) => {
        reporter.name = 'svg-format';

        // Don't allow explicit '</path>' closing tag
        if (ast.source.includes('</path>')) {
          const reason =
            `found a closing "path" tag at index ${ast.source.indexOf(
              '</path>',
            )}. The path should be self-closing,` +
            ' use "/>" instead of "></path>".';
          reporter.error(`Invalid SVG content format: ${reason}`);
        }
      },
    ],
  },
};

export default config;
