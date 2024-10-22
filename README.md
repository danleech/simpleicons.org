<p align="center">
<img src="https://cdn.simpleicons.org/simpleicons/000/fff" alt="Simple Icons" width=70>
<h3 align="center">Simple Icons</h3>
<p align="center">
Over 3200 Free SVG icons for popular brands. See them all on one page at <a href="https://simpleicons.org">SimpleIcons.org</a>. Contributions, corrections & requests can be made on GitHub.</p>
</p>

<p align="center">
<a href="https://github.com/simple-icons/simple-icons/actions?query=workflow%3AVerify+branch%3Adevelop"><img src="https://img.shields.io/github/actions/workflow/status/simple-icons/simple-icons/verify.yml?branch=develop&logo=github&label=tests" alt="Build status"/></a>
<a href="https://www.npmjs.com/package/simple-icons"><img src="https://img.shields.io/npm/v/simple-icons.svg?logo=npm" alt="NPM version"/></a>
<a href="https://packagist.org/packages/simple-icons/simple-icons"><img src="https://img.shields.io/packagist/v/simple-icons/simple-icons?logo=packagist&logoColor=white" alt="Build status"/></a>
<br/>
<a href="https://simpleicons.org"><img src="https://img.shields.io/badge/dynamic/json?color=informational&label=icons&prefix=%20&logo=simpleicons&query=%24.icons.length&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsimple-icons%2Fsimple-icons%2Fdevelop%2F_data%2Fsimple-icons.json" alt="Number of icons currently in the library"/></a>
<a href="https://discord.gg/vUXFa7t5xJ"><img src="https://img.shields.io/discord/1142044630909726760?logo=discord&logoColor=white&label=discord" alt="Number of users active in our Discord server" /></a>
<a href="https://opencollective.com/simple-icons"><img src="https://img.shields.io/opencollective/all/simple-icons?logo=opencollective" alt="Backers and sponsors on Open Collective"/></a>
</p>

## Usage

> [!IMPORTANT]\
> We ask that all users read our [legal disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md) before using icons from Simple Icons.

### General Usage

Icons can be downloaded as SVGs directly from [our website](https://simpleicons.org/) - simply click the download button of the icon you want, and the download will start automatically.

### CDN Usage

Icons can be served from a CDN such as [jsDelivr](https://www.jsdelivr.com/package/npm/simple-icons) or [unpkg](https://unpkg.com/browse/simple-icons/). Simply use the `simple-icons` npm package and specify a version in the URL like the following:

```html
<img height="32" width="32" src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/[ICON SLUG].svg" />
<img height="32" width="32" src="https://unpkg.com/simple-icons@v13/icons/[ICON SLUG].svg" />
```

Where `[ICON SLUG]` is replaced by the [slug] of the icon you want to use, for example:

```html
<img height="32" width="32" src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/simpleicons.svg" />
<img height="32" width="32" src="https://unpkg.com/simple-icons@v13/icons/simpleicons.svg" />
```

These examples use the latest major version. This means you won't receive any updates following the next major release. You can use `@latest` instead to receive updates indefinitely. However, this will result in a `404` error if the icon is removed.

#### CDN with colors

We also provide a CDN service which allows you to use colors.

```html
<img height="32" width="32" src="https://cdn.simpleicons.org/[ICON SLUG]" />
<img height="32" width="32" src="https://cdn.simpleicons.org/[ICON SLUG]/[COLOR]" />
<img height="32" width="32" src="https://cdn.simpleicons.org/[ICON SLUG]/[COLOR]/[DARK_MODE_COLOR]" />
```

Where `[COLOR]` is optional, and can be replaced by the [hex colors](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) or [CSS keywords](https://www.w3.org/wiki/CSS/Properties/color/keywords) of the icon you want to you use. The color is defaulted to the HEX color of the icon shown in [simpleicons.org website](https://simpleicons.org). `[DARK_MODE_COLOR]` is used for dark mode. The [CSS prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) will be used when a value is specified. For example:

```html
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/gray" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/hotpink" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/0cf" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/0cf9" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/00ccff" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/00ccff99" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/orange/pink" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/_/eee" />
<img height="32" width="32" src="https://cdn.simpleicons.org/simpleicons/eee/_" />
```

You can use a `viewbox=auto` parameter to get a auto-sized viewbox. This is useful if you want all icons rendered with consistent size:

```html
<img height="20" src="https://cdn.simpleicons.org/github?viewbox=auto" />
<img height="20" src="https://cdn.simpleicons.org/simpleicons?viewbox=auto" />
<img height="20" src="https://cdn.simpleicons.org/awesomelists?viewbox=auto" />
```

### Node Usage <img src="https://cdn.simpleicons.org/nodedotjs/000/fff" alt="Node" align=left width=24>

The icons are also available through our npm package. To install, simply run:

```shell
npm install simple-icons
```

All icons are imported from a single file, where `[ICON SLUG]` is replaced by a capitalized [slug]. We highly recommend using a bundler that can tree shake such as [webpack](https://webpack.js.org/) to remove the unused icon code:
```javascript
// Import a specific icon by its slug as:
// import { si[ICON SLUG] } from 'simple-icons'

// For example:
// use import/esm to allow tree shaking
import { siSimpleicons } from 'simple-icons';
// or with require/cjs
const { siSimpleicons } = require('simple-icons');
```

It will return an icon object:

```javascript
console.log(siSimpleicons);

/*
{
    title: 'Simple Icons',
    slug: 'simpleicons',
    hex: '111111',
    source: 'https://simpleicons.org/',
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">...</svg>',
    path: 'M12 12v-1.5c-2.484 ...',
    guidelines: 'https://simpleicons.org/styleguide',
    license: {
        type: '...',
        url: 'https://example.com/'
    }
}

NOTE: the `guidelines` entry will be `undefined` if we do not yet have guidelines for the icon.
NOTE: the `license` entry will be `undefined` if we do not yet have license data for the icon.
*/
```

If you need to iterate over all icons, use:

```javascript
import * as icons from 'simple-icons';
```

#### TypeScript Usage <img src="https://cdn.simpleicons.org/typescript/000/fff" alt="Typescript" align=left width=19 height=19>

Type definitions are bundled with the package.

```typescript
import type { SimpleIcon } from 'simple-icons';
```

### PHP Usage <img src="https://cdn.simpleicons.org/php/000/fff" alt="Php" align=left width=24 height=24>

The icons are also available through our Packagist package. To install, simply run:

```shell
composer require simple-icons/simple-icons
```

The package can then be used as follows, where `[ICON SLUG]` is replaced by a [slug]:

```php
<?php
// Import a specific icon by its slug as:
echo file_get_contents('path/to/package/icons/[ICON SLUG].svg');

// For example:
echo file_get_contents('path/to/package/icons/simpleicons.svg');

// <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">...</svg>
?>
```

## Third-Party Extensions

The below are known extensions to third-party tools.

| Extension | Author |
| :- | :- |
| [Blender add-on](https://github.com/mondeja/simple-icons-blender) <img src="https://cdn.simpleicons.org/blender/000/fff" alt="Blender" align=left width=24 height=24> | [@mondeja](https://github.com/mondeja) |
| [Boxy SVG library](https://boxy-svg.com/ideas/298/simple-icons-library-provider) <img src="https://cdn.simpleicons.org/boxysvg/000/fff" alt="Boxy SVG" align=left width=24 height=24> | [@Jarek](https://boxy-svg.com/profiles/0000000000/jarek) |
| [Drawio library](https://github.com/mondeja/simple-icons-drawio) <img src="https://cdn.simpleicons.org/diagramsdotnet/000/fff" alt="Drawio" align=left width=24 height=24> | [@mondeja](https://github.com/mondeja) |
| [Figma plugin](https://www.figma.com/community/plugin/1149614463603005908) <img src="https://cdn.simpleicons.org/figma/000/fff" alt="Figma" align=left width=24 height=24> | [@LitoMore](https://github.com/LitoMore) |
| [Miro app](https://miro.com/marketplace/brand-icons/) <img src="https://cdn.simpleicons.org/miro/000/fff" alt="Miro" align=left width=24 height=24> | [@LitoMore](https://github.com/LitoMore) |
| [Raycast extension](https://www.raycast.com/litomore/simple-icons) <img src="https://cdn.simpleicons.org/raycast/000/fff" alt="Raycast" align=left width=24 height=24> | [@LitoMore](https://github.com/LitoMore) |
| [Stream Deck icon pack](https://github.com/mackenly/simple-icons-stream-deck) <img src="https://cdn.simpleicons.org/elgato/000/fff" alt="Stream Deck" align=left width=24 height=24> | [@mackenly](https://github.com/mackenly) | ![](https://img.shields.io/github/license/mackenly/simple-icons-stream-deck) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmackenly%2Fsimple-icons-stream-deck%2Fmain%2Ftemplate%2Fmanifest.json&query=Version&logo=simpleicons&label=version) |
| [Webflow app](https://webflow.com/apps/detail/simple-icons) <img src="https://cdn.simpleicons.org/webflow/000/fff" alt="Webflow" align=left width=24 height=24> | [@diegoliv](https://github.com/diegoliv) |

Maintain an extension? [Submit a PR][open-pr] to include it in the list above.

## Third-Party Libraries

The below are known third-party libraries for use in your own projects. We only keep items in the list that are at least up to date with our previous major version.

| Library | Author | License | Simple Icons Version |
| :-- | :-- | :-: | :-: |
| [Astro package](https://github.com/dzeiocom/simple-icons-astro) <img src="https://cdn.simpleicons.org/astro/000/fff" alt="Astro" align=left width=24 height=24> | [@Aviortheking](https://github.com/aviortheking)  | ![](https://img.shields.io/github/license/dzeiocom/simple-icons-astro) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fdzeiocom%2Fsimple-icons-astro%2Fmaster%2Fpackage.json&query=%24.version&logo=simpleicons&label=version) |
| [Blazor Nuget package](https://github.com/TimeWarpEngineering/timewarp-simple-icons) <img src="https://cdn.simpleicons.org/blazor/000/fff" alt="Blazor" align=left width=24 height=24> | [@TimeWarpEngineering](https://github.com/TimeWarpEngineering)  | ![](https://img.shields.io/github/license/TimeWarpEngineering/timewarp-simple-icons) | ![](https://img.shields.io/badge/dynamic/xml?url=https%3A%2F%2Fraw.githubusercontent.com%2FTimeWarpEngineering%2Ftimewarp-simple-icons%2Fmain%2Fsource%2Ftimewarp-simple-icons%2Ftimewarp-simple-icons.csproj&query=%2FProject%2FPropertyGroup%2FVersion&logo=simpleicons&label=version) |
| [Flutter package](https://github.com/jlnrrg/simple_icons) <img src="https://cdn.simpleicons.org/flutter/000/fff" alt="Flutter" align=left width=24 height=24> | [@jlnrrg](https://github.com/jlnrrg) | ![](https://img.shields.io/github/license/jlnrrg/simple_icons) | ![](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjlnrrg%2Fsimple_icons%2Fmaster%2Fpubspec.yaml&query=%24.version&logo=simpleicons&logoColor=white&label=version)
| [Framer component](https://github.com/LitoMore/simple-icons-framer) <img src="https://cdn.simpleicons.org/framer/000/fff" alt="Framer" align=left width=24 height=24> | [@LitoMore](https://github.com/LitoMore) | ![](https://img.shields.io/github/license/LitoMore/simple-icons-framer) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsimple-icons%2Fsimple-icons%2Fmaster%2Fpackage.json&query=%24.version&logo=simpleicons&label=version) |
| [Hugo module](https://github.com/foo-dogsquared/hugo-mod-simple-icons) <img src="https://cdn.simpleicons.org/hugo/000/fff" alt="Hugo" align=left width=24 height=24> | [@foo-dogsquared](https://github.com/foo-dogsquared) | ![](https://img.shields.io/github/license/foo-dogsquared/hugo-mod-simple-icons) | ![](https://img.shields.io/github/v/tag/foo-dogsquared/hugo-mod-simple-icons?logo=simpleicons&label=version) |
| [Kirby plugin](https://github.com/runxel/kirby3-simpleicons) <img src="https://cdn.simpleicons.org/kirby/000/fff" alt="Kirby" align=left width=24 height=24> | [@runxel](https://github.com/runxel) | ![](https://img.shields.io/github/license/runxel/kirby3-simpleicons) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Frunxel%2Fkirby3-simpleicons%2Fmaster%2Fcomposer.json&query=%24..%5B'simple-icons%2Fsimple-icons'%5D&logo=simpleicons&label=version) |
| [LaTeX package](https://github.com/ineshbose/simple-icons-latex) <img src="https://cdn.simpleicons.org/latex/000/fff" alt="LaTeX" align=left width=24 height=24> | [@ineshbose](https://github.com/ineshbose) | ![](https://img.shields.io/github/license/ineshbose/simple-icons-latex) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fineshbose%2Fsimple-icons-latex%2Fdevelop%2Fpackage.json&query=%24..%5B'simple-icons-font'%5D&logo=simpleicons&label=version) |
| [Laravel package](https://github.com/ublabs/blade-simple-icons) <img src="https://cdn.simpleicons.org/laravel/000/fff" alt="Laravel" align=left width=24 height=24> | [@adrian-ub](https://github.com/adrian-ub) | ![](https://img.shields.io/github/license/ublabs/blade-simple-icons) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsimple-icons%2Fsimple-icons%2Fmaster%2Fpackage.json&query=%24.version&logo=simpleicons&label=version) |
| [Python wheel](https://github.com/carstencodes/simplepycons) <img src="https://cdn.simpleicons.org/python/000/fff" alt="Python" align=left width=24 height=24> | [@carstencodes](https://github.com/carstencodes) | ![](https://img.shields.io/github/license/carstencodes/simplepycons) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fcarstencodes%2Fsimplepycons%2Fmaster%2Fsimple-icons.json&query=%24.simple-icons.version&logo=simpleicons&label=version) |
| [React package](https://github.com/icons-pack/react-simple-icons) <img src="https://cdn.simpleicons.org/react/000/fff" alt="React" align=left width=24 height=24> | [@wootsbot](https://github.com/wootsbot) | ![](https://img.shields.io/github/license/icons-pack/react-simple-icons) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ficons-pack%2Freact-simple-icons%2Fmain%2Fpackage.json&query=%24..%5B'simple-icons'%5D&logo=simpleicons&label=version) |
| [Ruby gem](https://rubygems.org/gems/simple-icons-rails) <img src="https://cdn.simpleicons.org/rubygems/000/fff" alt="Ruby" align=left width=24 height=24> | [@thepew](https://github.com/the-pew-inc) | ![](https://img.shields.io/github/license/the-pew-inc/simple-icons-rails) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsimple-icons%2Fsimple-icons%2Fmaster%2Fpackage.json&query=%24.version&logo=simpleicons&label=version) |
| [Svelte package](https://github.com/icons-pack/svelte-simple-icons) <img src="https://cdn.simpleicons.org/svelte/000/fff" alt="Svelte" align=left width=24 height=24> | [@wootsbot](https://github.com/wootsbot) | ![](https://img.shields.io/github/license/icons-pack/svelte-simple-icons) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Ficons-pack%2Fsvelte-simple-icons%2Fmain%2Fpackage.json&query=%24..%5B'simple-icons'%5D&logo=simpleicons&label=version) |
| [Vue 3 package](https://github.com/wyatt-herkamp/vue3-simple-icons) <img src="https://cdn.simpleicons.org/vuedotjs/000/fff" alt="Vue" align=left width=24 height=24> | [@wyatt-herkamp](https://github.com/wyatt-herkamp) | ![](https://img.shields.io/github/license/wyatt-herkamp/vue3-simple-icons) | ![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwyatt-herkamp%2Fvue3-simple-icons%2Fmain%2Fsimple-icons.json&query=simpleIconsVersion&logo=simpleicons&label=version) |

Maintain a library? [Submit a PR][open-pr] to include it in the list above.

## Contribute

[![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Fsearch%2Fissues%3Fq%3Drepo%3Asimple-icons%2Fsimple-icons%2520label%3A%2522good%2520first%2520issue%2522%2520is%3Aopen%2520-linked%3Apr&query=%24.total_count&suffix=%20open&logo=github&label=good%20first%20issues&color=228f6c&labelColor=228f6c&logoColor=white&style=flat-square)](https://github.com/simple-icons/simple-icons/issues?q=is%3Aopen+label%3A%22good+first+issue%22+-linked%3Apr)
[![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Fsearch%2Fissues%3Fq%3Drepo%3Asimple-icons%2Fsimple-icons%2520label%3A%2522update%2520icon%2Fdata%2522%2C%2522new%2520icon%2522%2520is%3Aopen%2520-linked%3Apr&query=%24.total_count&suffix=%20open&logo=svg&logoColor=333&label=icon%20issues&labelColor=FFB13B&color=FFB13B&style=flat-square)](https://github.com/simple-icons/simple-icons/issues?q=is%3Aissue+is%3Aopen+label%3A%22new+icon%22%2C%22update+icon%2Fdata%22)
[![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Fsearch%2Fissues%3Fq%3Drepo%3Asimple-icons%2Fsimple-icons%2520is%3Aissue%2520is%3Aopen%2520label%3Ameta%2Cpackage%2520-linked%3Apr&query=%24.total_count&suffix=%20open&logo=typescript&logoColor=white&label=code%20issues&labelColor=3178C6&color=3178C6&style=flat-square)](https://github.com/simple-icons/simple-icons/issues?q=is%3Aissue+is%3Aopen+label%3Adocs%2Cmeta%2Cpackage+-linked%3Apr)
[![](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Fsearch%2Fissues%3Fq%3Drepo%3Asimple-icons%2Fsimple-icons%2520label%3Adocs%2520is%3Aopen%2520-linked%3Apr&query=%24.total_count&suffix=%20open&logo=markdown&label=docs%20issues&labelColor=343a40&color=343a40&logoColor=FFF&style=flat-square)](https://github.com/simple-icons/simple-icons/issues?q=is%3Aopen+is%3Aissue+label%3Adocs+-linked%3Apr)

Information describing how to contribute can be found in the file [CONTRIBUTING.md](https://github.com/simple-icons/simple-icons/blob/develop/CONTRIBUTING.md)

[slug]: https://github.com/simple-icons/simple-icons/blob/master/slugs.md
[open-pr]: https://github.com/simple-icons/simple-icons/compare

## Contributors

<a href="https://github.com/simple-icons/simple-icons/graphs/contributors">
  <img src="https://opencollective.com/simple-icons/contributors.svg?width=890&button=false" />
</a>
