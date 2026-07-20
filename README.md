<h1 align="center">Monarch Providers</h1>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/arnislvdev/monarch-providers?logo=git&logoColor=white&labelColor=2d3748&color=805ad5&style=for-the-badge" />
  <img src="https://img.shields.io/github/license/arnislvdev/monarch-providers?style=for-the-badge" />
  <img src="https://img.shields.io/website?url=https://arnislvdev.github.io/monarch-providers/&label=Marketplace&logoColor=white&color=2ea44f&style=for-the-badge" />
</p>

> [!IMPORTANT]
> This repository is the built-in provider source for **[Monarch](https://arnislvdev.github.io/monarch-web)**. It is a fork of Pal's MIT-licensed [Seanime-Providers](https://github.com/Pal-droid/Seanime-Providers) — the extensions use the Seanime extension format, so they remain compatible with [Seanime](https://github.com/5rahim/seanime) as well.

<p align="center">
This repository contains manga and anime provider extensions (and some plugins) for <strong><a href="https://arnislvdev.github.io/monarch-web">Monarch</a></strong>, adding support for various online sources.
</p>

<h3 align="center">Powered by:</h3>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</p>

## Repository Structure

```
src/
├── anime/
│   └── animeheaven/
|       ├── ...
|        ...
└── manga/
    ├── mangafreak/
    │   ├── provider.js
    │   ├── README.md
    │   ├── manga-provider.d.ts
    │   └── manifest.json
    └── scanita/
        ├── provider.js
        ├── ....
         ...
```

Each folder is a standalone extension provider. The manga providers listed in [`marketplace/main.json`](./marketplace/main.json) ship built into Monarch; the rest are one-click or manifest-URL installs.

---

## Installation

Monarch ships the core manga sources built in, so most users don't need to install anything. To add another source manually:

1. Open Monarch.
2. Go to **Settings → Manga** (or **Anime**).
3. Under **Add Provider**, paste the **raw GitHub URL** of the desired `manifest.json`, for example:

```
https://raw.githubusercontent.com/arnislvdev/monarch-providers/main/src/manga/mangabuddy/manifest.json
```

4. Monarch fetches and registers the provider immediately.

---

## Where can I find the manifest URLs?

[Click here](https://github.com/arnislvdev/monarch-providers/tree/main/marketplace/README.md) to see the full list of extensions.

---

### Want to suggest more providers?

> PRs welcome!

[Open an issue](https://github.com/arnislvdev/monarch-providers/issues/new?template=provider_request.yml)

---

### Credits ❤️

This repository is a fork of Pal's MIT-licensed provider collection. Full credit to the original authors:

* [Pal](https://github.com/Pal-droid) — original [Seanime-Providers](https://github.com/Pal-droid/Seanime-Providers) repository this fork is based on.

* [Seanime](https://github.com/5rahim/seanime) made by [5rahim](https://github.com/5rahim) — the extension format these providers target.

* [kRYstall9](https://github.com/kRYstall9) *(For the source code of [MangaWorldAdult](https://raw.githubusercontent.com/arnislvdev/monarch-providers/main/src/manga/MangaWorldAdult/manifest.json), [HentaiWorld](https://raw.githubusercontent.com/arnislvdev/monarch-providers/main/src/anime/hentaiworld/manifest.json), and [HentaiSaturn](https://raw.githubusercontent.com/arnislvdev/monarch-providers/main/src/anime/hentaisaturn/manifest.json))*

* [SyntaxSama / FracturedSora](https://github.com/syntaxsama) *(For the source code of the visual marketplace; original owner of the Anime News, Always Advanced Search, Cookie Clicker, Anti-Seeding plugins and AnimePahe extension)*

* [Dantotsu](https://discord.gg/MSJvfJzS7R) *(The AniList activity plugin is inspired by Dantotsu's stories feature.)*

### Contributors

| [<img src="https://avatars.githubusercontent.com/u/64171580?v=4" width="64">](https://github.com/Ari-03) |
|:---:|
| [Ari-03](https://github.com/Ari-03) |

---

### Extra info

- [License](./LICENSE)
