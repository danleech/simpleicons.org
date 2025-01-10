/**
 * @file
 * Script for generating release note.
 */
import {execSync} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import {getDirnameFromImportMeta, titleToSlug} from '../../sdk.mjs';

const loadRevision = (revision) => {
	const projectRoot = path.join(
		getDirnameFromImportMeta(import.meta.url),
		'..',
		'..',
	);
	const json = JSON.parse(
		execSync(`git show ${revision}:_data/simple-icons.json`).toString(),
	);

	const hashes = new Map(
		execSync(
			`git ls-tree --format="%(objectname) %(path)" ${revision} icons/*`,
			{cwd: projectRoot, shell: true},
		)
			.toString()
			.trim()
			.replaceAll(/(icons\/|\.svg)/g, '')
			.split('\n')
			.map((line) => {
				const [hash, slug] = line.split(' ');
				return [slug, hash];
			}),
	);
	const icons = new Map(
		json.icons
			? json.icons.map((icon) => [icon.slug ?? titleToSlug(icon.title), icon])
			: json.map((icon) => [icon.slug ?? titleToSlug(icon.title), icon]),
	);
	return {hashes, icons};
};

const iconDiff = (beforeRevision, afterRevision) => {
	const before = loadRevision(beforeRevision);
	const after = loadRevision(afterRevision);
	const beforeSlugs = new Set(before.icons.keys());
	const afterSlugs = new Set(after.icons.keys());

	const newSlugs = afterSlugs.difference(beforeSlugs);
	const removedSlugs = beforeSlugs.difference(afterSlugs);
	const restSlugs = beforeSlugs.intersection(afterSlugs);

	const updatedSlugs = new Set();
	for (const slug of restSlugs) {
		const beforeIconString = JSON.stringify(before.icons.get(slug));
		const afterIconString = JSON.stringify(after.icons.get(slug));
		if (beforeIconString !== afterIconString) updatedSlugs.add(slug);

		const beforeIconHash = before.hashes.get(slug);
		const afterIconHash = after.hashes.get(slug);
		if (beforeIconHash !== afterIconHash) updatedSlugs.add(slug);
	}

	return {
		newIcons: [...newSlugs].map((x) => after.icons.get(x)),
		removeIcons: [...removedSlugs].map((x) => before.icons.get(x)),
		updatedIcons: [...updatedSlugs].map((x) => after.icons.get(x)),
	};
};

const diff = iconDiff('master', 'develop');
const releaseNote = Object.entries(diff)
	.map(([key, icons]) => {
		const title = key.replace(/Icons$/, ' icons');
		return icons.length > 0
			? `## ${icons.length} ${title}\n\n${icons.map((icon) => `- ${icon.title}`).join('\n')}`
			: '';
	})
	.filter(Boolean)
	.join('\n\n');

process.stdout.write(releaseNote);
