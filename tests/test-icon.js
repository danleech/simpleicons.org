import {strict as assert} from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import {describe, it} from 'mocha';
import {SVG_PATH_REGEX, URL_REGEX, titleToSlug} from '../sdk.mjs';

const iconsDirectory = path.resolve(import.meta.dirname, '..', 'icons');

/**
 * @typedef {import('..').SimpleIcon} SimpleIcon
 */

/**
 * Checks if icon data matches a subject icon.
 * @param {SimpleIcon} icon Icon data
 * @param {SimpleIcon} subject Icon to check against icon data
 * @param {String} slug Icon data slug
 */
export const testIcon = (icon, subject, slug) => {
  const svgPath = path.resolve(iconsDirectory, `${slug}.svg`);

  describe(icon.title, () => {
    it('has the correct "title"', () => {
      assert.equal(subject.title, icon.title);
    });

    it('has the correct "slug"', () => {
      assert.equal(subject.slug, slug);
    });

    it('has the correct "hex" value', () => {
      assert.equal(subject.hex, icon.hex);
    });

    it('has the correct "source"', () => {
      assert.equal(subject.source, icon.source);
      assert.match(subject.source, URL_REGEX);
    });

    it('has an "svg" value', () => {
      assert.equal(typeof subject.svg, 'string');
    });

    it('has a valid "path" value', () => {
      assert.match(subject.path, SVG_PATH_REGEX);
    });

    it(`has ${icon.guidelines ? 'the correct' : 'no'} "guidelines"`, () => {
      if (icon.guidelines) {
        assert.equal(subject.guidelines, icon.guidelines);
      } else {
        assert.equal(subject.guidelines, undefined);
      }
    });

    it(`has ${icon.license ? 'the correct' : 'no'} "license"`, () => {
      if (icon.license) {
        assert.equal(subject.license.type, icon.license.type);
        if (icon.license.type === 'custom') {
          assert.equal(subject.license.url, icon.license.url);
        } else {
          assert.match(subject.license.url, URL_REGEX);
        }
      } else {
        assert.equal(subject.license, undefined);
      }
    });

    it('has a valid svg value', async () => {
      const svgFileContents = await fs.readFile(svgPath, 'utf8');
      assert.equal(subject.svg, svgFileContents);
    });

    if (icon.slug) {
      // If an icon data has a slug, it must be different to the
      // slug inferred from the title, which prevents adding
      // unnecessary slugs to icons data
      it(`'${icon.title}' slug must be necessary`, () => {
        assert.notEqual(titleToSlug(icon.title), icon.slug);
      });
    }
  });
};
