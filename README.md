<p align="center">
<svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
  <foreignObject width="100%" height="100%">
       <img src="./readme-icons/simpleicons.svg#gh-light-mode-only" alt="Simple Icons" width=70>
       <img class="dark-mode" style='filter:invert(1);' src="./readme-icons/simpleicons.svg#gh-dark-mode-only" alt="Simple Icons" width=70>
  </foreignObject>
</svg>

<h3 align="center">Simple Icons</h3>
<p align="center">
Over 2000 Free SVG icons for popular brands. See them all on one page at <a href="https://simpleicons.org">SimpleIcons.org</a>. Contributions, corrections & requests can be made on GitHub.</p>
</p>

<p align="center">
<a href="https://github.com/simple-icons/simple-icons/actions?query=workflow%3AVerify+branch%3Adevelop"><img src="https://img.shields.io/github/workflow/status/simple-icons/simple-icons/Verify/develop?logo=github" alt="Build status" /></a>
<a href="https://www.npmjs.com/package/simple-icons"><img src="https://img.shields.io/npm/v/simple-icons.svg?logo=npm" alt="NPM version" /></a>
<a href="https://packagist.org/packages/simple-icons/simple-icons"><img src="https://img.shields.io/packagist/v/simple-icons/simple-icons?logo=packagist&logoColor=white" alt="Build status" /></a>
</p>

## Usage

> :information_source: We ask that all users read our [legal disclaimer](./DISCLAIMER.md) before using icons from Simple Icons.

### General Usage

Icons can be downloaded as SVGs directly from [our website](https://simpleicons.org/) - simply click the icon you want, and the download should start automatically.

### CDN Usage

Icons can be served from a CDN such as [JSDelivr](https://www.jsdelivr.com/package/npm/simple-icons) or [Unpkg](https://unpkg.com/browse/simple-icons/). Simply use the `simple-icons` npm package and specify a version in the URL like the following:

```html
<img height="32" width="32" src="https://cdn.jsdelivr.net/npm/simple-icons@v6/icons/[ICON SLUG].svg" />
<img height="32" width="32" src="https://unpkg.com/simple-icons@v6/icons/[ICON SLUG].svg" />
```

Where `[ICON SLUG]` is replaced by the [slug] of the icon you want to use, for example:

```html
<img height="32" width="32" src="https://cdn.jsdelivr.net/npm/simple-icons@v6/icons/simpleicons.svg" />
<img height="32" width="32" src="https://unpkg.com/simple-icons@v6/icons/simpleicons.svg" />
```

These examples use the latest major version. This means you won't receive any updates following the next major release. You can use `@latest` instead to receive updates indefinitely. However, this will result in a `404` error if the icon is removed.

### Node Usage <img src="./readme-icons/nodedotjs-white.svg#gh-dark-mode-only" alt="Node" align=left width=24><img src="./readme-icons/nodedotjs.svg#gh-light-mode-only" alt="Node" align=left width=24>

The icons are also available through our npm package. To install, simply run:

```shell
npm install simple-icons
```

The API can then be used as follows, where `[ICON SLUG]` is replaced by a [slug]:

```javascript
const simpleIcons = require('simple-icons');

// Get a specific icon by its slug as:
// simpleIcons.Get('[ICON SLUG]');

// For example:
const icon = simpleIcons.Get('simpleicons');

```

Alternatively, you can also import all icons from a single file, where `[ICON SLUG]` is replaced by a capitalized [slug]. We highly recommend using a bundler that can tree shake such as [webpack](https://webpack.js.org/) to remove the unused icon code:
```javascript
// Import a specific icon by its slug as:
// import { si[ICON SLUG] } from 'simple-icons/icons'

// For example:
// use import/esm to allow tree shaking
import { siSimpleicons } from 'simple-icons/icons'
```

You can also import the needed icons individually, where `[ICON SLUG]` is replaced by a [slug].
```javascript
// Import a specific icon by its slug as:
// require('simple-icons/icons/[ICON SLUG]');

// For example:
const icon = require('simple-icons/icons/simpleicons');
```

Either method will return an icon object:

```javascript
console.log(icon);

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

Lastly, the `simpleIcons` object is also enumerable.
This is useful if you want to do a computation on every icon:

```javascript
const simpleIcons = require('simple-icons');

for (const iconSlug in simpleIcons) {
    const icon = simpleIcons.Get(iconSlug);
    // do stuff
}
```

#### TypeScript Usage <img src="./readme-icons/typescript-white.svg#gh-dark-mode-only" alt="Typescript" align=left width=24 height=24><img src="./readme-icons/typescript.svg#gh-light-mode-only" alt="Typescript" align=left width=24 height=24>


Type definitions are bundled with the package.

### PHP Usage <img src="./readme-icons/php-white.svg#gh-dark-mode-only" alt="Php" align=left width=24 height=24><img src="./readme-icons/php.svg#gh-light-mode-only" alt="Php" align=left width=24 height=24>

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

| Extension | Author |
| :--- | :--- |
| <img src="./readme-icons/blender-white.svg#gh-dark-mode-only" alt="Blender" align=left width=24 height=24><img src="./readme-icons/blender.svg#gh-light-mode-only" alt="Blender" align=left width=24 height=24> [Blender add-on](https://github.com/mondeja/simple-icons-blender) | [@mondeja](https://github.com/mondeja) |
| [Drawio library](https://github.com/mondeja/simple-icons-drawio) | [@mondeja](https://github.com/mondeja) |
| <img src="./readme-icons/drupal-white.svg#gh-dark-mode-only" alt="Drupal" align=left width=24 height=24><img src="./readme-icons/drupal.svg#gh-light-mode-only" alt="Drupal" align=left width=24 height=24>[Drupal module](https://www.drupal.org/project/simple_icons) | [Phil Wolstenholme](https://www.drupal.org/u/phil-wolstenholme) |
| <img src="./readme-icons/flutter-white.svg#gh-dark-mode-only" alt="Flutter" align=left width=24 height=24><img src="./readme-icons/flutter.svg#gh-light-mode-only" alt="Flutter" align=left width=24 height=24> [Flutter package](https://pub.dev/packages/simple_icons) | [@jlnrrg](https://jlnrrg.github.io/) |
| [Hexo plugin](https://github.com/nidbCN/hexo-simpleIcons) | [@nidbCN](https://github.com/nidbCN/) |
| <img src="./readme-icons/homeassistant-white.svg#gh-dark-mode-only" alt="Home Assistant" align=left width=24 height=24><img src="./readme-icons/homeassistant.svg#gh-light-mode-only" alt="Home Assistant" align=left width=24 height=24>[Home Assistant plugin](https://github.com/vigonotion/hass-simpleicons) | [@vigonotion](https://github.com/vigonotion/) |
| [Jetpack Compose library](https://github.com/DevSrSouza/compose-icons) | [@devsrsouza](https://github.com/devsrsouza/) |
| <img src="./readme-icons/kirby-white.svg#gh-dark-mode-only" alt="Kirby" align=left width=24 height=24><img src="./readme-icons/kirby.svg#gh-light-mode-only" alt="Kirby" align=left width=24 height=24>[Kirby plugin](https://github.com/runxel/kirby3-simpleicons) | [@runxel](https://github.com/runxel) |
| <img src="./readme-icons/laravel-white.svg#gh-dark-mode-only" alt="Laravel" align=left width=24 height=24><img src="./readme-icons/laravel.svg#gh-light-mode-only" alt="Laravel" align=left width=24 height=24>[Laravel Package](https://github.com/ublabs/blade-simple-icons) | [@adrian-ub](https://github.com/adrian-ub) |
| <img src="./readme-icons/python-white.svg#gh-dark-mode-only" alt="Python" align=left width=24 height=24><img src="./readme-icons/python.svg#gh-light-mode-only" alt="Python" align=left width=24 height=24>[Python package](https://github.com/sachinraja/simple-icons-py) | [@sachinraja](https://github.com/sachinraja) |
| <img src="./readme-icons/react-white.svg#gh-dark-mode-only" alt="React" align=left width=24 height=24><img src="./readme-icons/react.svg#gh-light-mode-only" alt="React" align=left width=24 height=24>[React package](https://github.com/icons-pack/react-simple-icons) | [@wootsbot](https://github.com/wootsbot) |
| <img src="./readme-icons/svelte-white.svg#gh-dark-mode-only" alt="Svelte" align=left width=24 height=24><img src="./readme-icons/svelte.svg#gh-light-mode-only" alt="Svelte" align=left width=24 height=24>[Svelte package](https://github.com/icons-pack/svelte-simple-icons) | [@wootsbot](https://github.com/wootsbot) |
| <img src="./readme-icons/vuedotjs-white.svg#gh-dark-mode-only" alt="Vue" align=left width=24 height=24><img src="./readme-icons/vuedotjs.svg#gh-light-mode-only" alt="Vue" align=left width=24 height=24>[Vue package](https://github.com/mainvest/vue-simple-icons) | [@noahlitvin](https://github.com/noahlitvin) |
| <img src="./readme-icons/wordpress-white.svg#gh-dark-mode-only" alt="Wordpress" align=left width=24 height=24><img src="./readme-icons/wordpress.svg#gh-light-mode-only" alt="Wordpress" align=left width=24 height=24>[WordPress plugin](https://wordpress.org/plugins/simple-icons/) | [@tjtaylo](https://github.com/tjtaylo) |

[slug]: ./slugs.md

## Contribute

Information describing how to contribute can be found here:

https://github.com/simple-icons/simple-icons/blob/develop/CONTRIBUTING.md
