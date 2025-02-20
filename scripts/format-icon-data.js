/**
 * @file
 * Format _data/simple-icons.json.
 */
import {getIconsData} from '../sdk.mjs';
import {formatIconData, writeIconsData} from './utils.js';

const icons = await getIconsData();
writeIconsData(formatIconData(icons));
