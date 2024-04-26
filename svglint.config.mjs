/* eslint complexity: off, max-depth: off */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import svgPathBbox from 'svg-path-bbox';
import parsePath from 'svg-path-segments';
import svgpath from 'svgpath';
import {SVG_PATH_REGEX, collator, htmlFriendlyToTitle} from './sdk.mjs';

const dataFile = path.join(import.meta.dirname, '_data', 'simple-icons.json');
const htmlNamedEntitiesFile = path.join(
  import.meta.dirname,
  'node_modules',
  'named-html-entities-json',
  'index.json',
);
const svglintIgnoredFile = path.join(
  import.meta.dirname,
  '.svglint-ignored.json',
);

const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
const htmlNamedEntities = JSON.parse(
  await fs.readFile(htmlNamedEntitiesFile, 'utf8'),
);
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

const sortObjectByKey = (object) => {
  return Object.fromEntries(
    Object.keys(object)
      .sort()
      .map((k) => [k, object[k]]),
  );
};

const sortObjectByValue = (object) => {
  return Object.fromEntries(
    Object.keys(object)
      .sort((a, b) => collator.compare(object[a], object[b]))
      .map((k) => [k, object[k]]),
  );
};

const removeLeadingZeros = (number) => {
  // Convert 0.03 to '.03'
  return number.toString().replace(/^(-?)(0)(\.?.+)/, '$1$3');
};

/**
 * Given three points, returns if the middle one (x2, y2) is collinear
 *   to the line formed by the two limit points.
 **/
// eslint-disable-next-line max-params
const collinear = (x1, y1, x2, y2, x3, y3) => {
  return x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2) === 0;
};

/**
 * Returns the number of digits after the decimal point.
 * @param num The number of interest.
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
 * @param svgFileContent The raw SVG as text.
 */
const getPathDIndex = (svgFileContent) => {
  const pathDStart = '<path d="';
  return svgFileContent.indexOf(pathDStart) + pathDStart.length;
};

/**
 * Get the index at which the text of the first `<title></title>` tag starts.
 * @param svgFileContent The raw SVG as text.
 **/
const getTitleTextIndex = (svgFileContent) => {
  const titleStart = '<title>';
  return svgFileContent.indexOf(titleStart) + titleStart.length;
};

/**
 * Convert a hexadecimal number passed as string to decimal number as integer.
 * @param hex The hexadecimal number representation to convert.
 **/
const hexadecimalToDecimal = (hex) => {
  let result = 0;
  let digitValue;
  for (const digit of hex.toLowerCase()) {
    digitValue = '0123456789abcdefgh'.indexOf(digit);
    result = result * 16 + digitValue;
  }

  return result;
};

const maybeShortenedWithEllipsis = (string_) => {
  return string_.length > 20 ? `${string_.slice(0, 20)}...` : string_;
};

/**
 * Memoize a function which accepts a single argument.
 * A second argument can be passed to be used as key.
 */
const memoize = (function_) => {
  const results = {};

  return (argument, defaultKey = null) => {
    const key = defaultKey || argument;

    results[key] ||= function_(argument);

    return results[key];
  };
};

const getIconPath = memoize(($icon, _filepath) => $icon.find('path').attr('d'));
const getIconPathSegments = memoize((iconPath) => parsePath(iconPath));
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

const isIgnored = (linterName, path) => {
  return (
    iconIgnored[linterName] && Object.hasOwn(iconIgnored[linterName], path)
  );
};

const ignoreIcon = (linterName, path, $) => {
  iconIgnored[linterName] ||= {};

  const title = $.find('title').text();
  const iconName = htmlFriendlyToTitle(title);

  iconIgnored[linterName][path] = iconName;
};

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
            const charDec = hexadecimalToDecimal(match[1]);

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
          // eslint-disable-next-line unicorn/prefer-number-properties
          for (const match of encodingMatches.filter((m) => !isNaN(m[2]))) {
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
            const iconExists = data.icons.some(
              (icon) => icon.title === iconName,
            );
            if (!iconExists) {
              reporter.error(
                `No icon with title "${iconName}" found in simple-icons.json`,
              );
            }
          }
        }
      },
      (reporter, $, ast, {filepath}) => {
        reporter.name = 'icon-size';

        const iconPath = getIconPath($, filepath);
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
      (reporter, $, ast, {filepath}) => {
        reporter.name = 'icon-precision';

        const iconPath = getIconPath($, filepath);
        const segments = getIconPathSegments(iconPath);

        for (const segment of segments) {
          const precisionMax = Math.max(
            // eslint-disable-next-line unicorn/no-array-callback-reference
            ...segment.params.slice(1).map(countDecimals),
          );
          if (precisionMax > iconMaxFloatPrecision) {
            let errorMessage =
              `found ${precisionMax} decimals in segment` +
              ` "${iconPath.slice(segment.start, segment.end)}"`;
            if (segment.chained) {
              const readableChain = maybeShortenedWithEllipsis(
                iconPath.slice(segment.chainStart, segment.chainEnd),
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
      (reporter, $, ast, {filepath}) => {
        reporter.name = 'ineffective-segments';

        const iconPath = getIconPath($, filepath);
        const segments = getIconPathSegments(iconPath);
        const absSegments = svgpath(iconPath).abs().unshort().segments;

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

        const isInvalidSegment = (
          [command, x1Coord, y1Coord, ...rest],
          index,
          previousSegmentIsZ,
        ) => {
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
              if (upperDirectionCommands.includes(xPreviousCoord)) {
                xPreviousCoord = undefined;
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
                    yPreviousCoordDeep = undefined;
                  }

                  // If the previous command was a vertical movement,
                  // we need to consider the single coordinate as y
                  if (upperVersionDirectionCommand === xPreviousCoordDeep) {
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
        };

        for (let index = 0; index < segments.length; index++) {
          const segment = segments[index];
          const previousSegmentIsZ =
            index > 0 && segments[index - 1].params[0].toLowerCase() === 'z';

          if (isInvalidSegment(segment.params, index, previousSegmentIsZ)) {
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

            if (segment.chained) {
              const readableChain = maybeShortenedWithEllipsis(
                iconPath.slice(segment.chainStart, segment.chainEnd),
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
      (reporter, $, ast, {filepath}) => {
        reporter.name = 'collinear-segments';

        /**
         * Extracts collinear coordinates from SVG path straight lines
         *   (does not extracts collinear coordinates from curves).
         **/
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
            const nextCmd = s + 1 < segments.length ? segments[s + 1][0] : null;

            switch (cmd) {
              // Next switch cases have been ordered by frequency
              // of occurrence in the SVG paths of the icons
              case 'M': {
                currentAbsCoord[0] = parms[1];
                currentAbsCoord[1] = parms[2];
                // SVG 1.1:
                // If a moveto is followed by multiple pairs of coordinates,
                // the subsequent pairs are treated as implicit lineto commands.
                if (!seg.chained || seg.chainStart === seg.start) {
                  startPoint = undefined;
                }

                break;
              }

              case 'm': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                if (!seg.chained || seg.chainStart === seg.start) {
                  startPoint = undefined;
                }

                break;
              }

              case 'H': {
                currentAbsCoord[0] = parms[1];
                break;
              }

              case 'h': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                break;
              }

              case 'V': {
                currentAbsCoord[1] = parms[1];
                break;
              }

              case 'v': {
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[1];
                break;
              }

              case 'L': {
                currentAbsCoord[0] = parms[1];
                currentAbsCoord[1] = parms[2];
                break;
              }

              case 'l': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                break;
              }

              case 'Z':
              case 'z': {
                // TODO: Overlapping in Z should be handled in another rule
                currentAbsCoord = [startPoint[0], startPoint[1]];
                _resetStartPoint = true;
                break;
              }

              case 'C': {
                currentAbsCoord[0] = parms[5];
                currentAbsCoord[1] = parms[6];
                break;
              }

              case 'c': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[5];
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[6];
                break;
              }

              case 'A': {
                currentAbsCoord[0] = parms[6];
                currentAbsCoord[1] = parms[7];
                break;
              }

              case 'a': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[6];
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[7];
                break;
              }

              case 's': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                break;
              }

              case 'S': {
                currentAbsCoord[0] = parms[1];
                currentAbsCoord[1] = parms[2];
                break;
              }

              case 't': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[1];
                currentAbsCoord[1] = (currentAbsCoord[1] || 0) + parms[2];
                break;
              }

              case 'T': {
                currentAbsCoord[0] = parms[1];
                currentAbsCoord[1] = parms[2];
                break;
              }

              case 'Q': {
                currentAbsCoord[0] = parms[3];
                currentAbsCoord[1] = parms[4];
                break;
              }

              case 'q': {
                currentAbsCoord[0] = (currentAbsCoord[0] || 0) + parms[3];
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

        const iconPath = getIconPath($, filepath);
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
          if (segment.chained) {
            const readableChain = maybeShortenedWithEllipsis(
              iconPath.slice(segment.chainStart, segment.chainEnd),
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
      (reporter, $, ast, {filepath}) => {
        reporter.name = 'negative-zeros';

        const iconPath = getIconPath($, filepath);

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
      (reporter, $, ast, {filepath}) => {
        reporter.name = 'icon-centered';

        const iconPath = getIconPath($, filepath);
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
      (reporter, $, ast, {filepath}) => {
        reporter.name = 'path-format';

        const iconPath = getIconPath($, filepath);

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
