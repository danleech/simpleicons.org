/**
 * @fileoverview
 * Reformat README to regular markdown.
 */

import path from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
import { getDirnameFromImportMeta } from '../../sdk.mjs';

const LINKS_BRANCH = process.argv[2] || 'develop';

const __dirname = getDirnameFromImportMeta(import.meta.url);

const rootDir = path.resolve(__dirname, '..', '..');
const readmeFile = path.resolve(rootDir, 'README.md');

const readme = await readFile(readmeFile, 'utf8');
await writeFile(
  readmeFile,
  readme
    .replace(
      /https:\/\/cdn.simpleicons.org\/(.+)\/000\/fff/g,
      `https://raw.githubusercontent.com/simple-icons/simple-icons/${LINKS_BRANCH}/icons/$1.svg`,
    )
    .replace(
      /\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?!\()/g,
      function (str, $0) {
        const capital = $0.substr(0, 1);
        const body = $0.substr(1).toLowerCase();
        return `**${capital + body}**`;
      },
    ),
);
