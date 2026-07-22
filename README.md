<h1 align="center">Monarch Providers</h1>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/arnislvdev/monarch-providers?logo=git&logoColor=white&labelColor=2d3748&color=805ad5&style=for-the-badge" />
  <img src="https://img.shields.io/github/license/arnislvdev/monarch-providers?style=for-the-badge" />
</p>

> [!IMPORTANT]
> This repository is the built-in provider source for **[Monarch](https://arnislvdev.github.io/monarch-web)**. It is a fork of Pal's MIT-licensed [Seanime-Providers](https://github.com/Pal-droid/Seanime-Providers) — the extensions use the Seanime extension format, so they remain compatible with [Seanime](https://github.com/5rahim/seanime) as well.

<p align="center">
This repository contains anime, manga, and novel provider extensions for <strong><a href="https://arnislvdev.github.io/monarch-web">Monarch</a></strong>, adding support for various online sources.
</p>

<h3 align="center">Powered by:</h3>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

## Repository Structure

```
src/
├── anime/
│   └── animeheaven/
|       ├── ...
|        ...
├── manga/
│   ├── mangafreak/
│   │   ├── provider.js
│   │   ├── README.md
│   │   ├── manga-provider.d.ts
│   │   └── manifest.json
│   └── scanita/
│       ├── provider.js
│       ├── ....
│        ...
└── novel/
    └── novelbin/
        ├── ...
         ...
```

Each folder is a standalone extension provider. A handful of manga providers (AsuraScans, Comix, MangaBuddy, MangaFreak, MangaKatana, Manganato) ship built into Monarch itself; everything else in [`marketplace/main.json`](./marketplace/main.json), including every anime and novel provider, is a one-click or manifest-URL install from this repo.

---

## Installation

Monarch ships a handful of manga sources built in, so most users don't need to install anything. To add another source:

1. Open Monarch.
2. Go to the **Marketplace** page and pick the **Anime**, **Manga**, or **Novels** tab.
3. Click a curated source to install it in one click, or under **Add Provider**, paste the **raw GitHub URL** of the desired `manifest.json`, for example:

```
https://raw.githubusercontent.com/arnislvdev/monarch-providers/main/src/manga/mangabuddy/manifest.json
```

4. Monarch fetches and registers the provider immediately. Installed sources can be managed (hidden or removed) from **Settings**.

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

* [SyntaxSama / FracturedSora](https://github.com/syntaxsama) *(Original owner of the AnimePahe extension)*

### Contributors

| [<img src="https://avatars.githubusercontent.com/u/64171580?v=4" width="64">](https://github.com/Ari-03) |
|:---:|
| [Ari-03](https://github.com/Ari-03) |

---

### Extra info

- [License](./LICENSE)
