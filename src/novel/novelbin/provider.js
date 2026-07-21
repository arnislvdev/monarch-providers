/**
 * Monarch novel provider for NovelBin (https://novelbin.com).
 *
 * NovelBin runs the same "novelfull" template family as the built-in
 * `readnovelfull` provider, so selectors are modelled on that scraper:
 *   - search   -> /ajax/search-novel?keyword=   (h3.novel-title items)
 *   - novel id -> [data-novel-id] on the novel page
 *   - chapters -> /ajax/chapter-archive?novelId= (ul.list-chapter li a)
 *   - content  -> #chr-content
 *
 * IDs are stored as absolute URLs so nothing has to be reconstructed from a
 * base that NovelBin periodically rotates (novelbin.com/.me/.net). If the
 * domain changes, update `api` below.
 *
 * ponytail: selectors unverified against live HTML (built offline). If a
 * method returns empty in-app, curl the endpoint and adjust the one selector.
 */
class Provider {
  constructor() {
    this.api = "https://novelbin.com";
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://novelbin.com/",
    };
  }

  getSettings() {
    return { supportsMultiLanguage: false };
  }

  async search(opts) {
    const url = `${this.api}/ajax/search-novel?keyword=${encodeURIComponent(opts.query)}`;
    try {
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) return [];
      const doc = LoadDoc(await res.text());
      if (!doc) return [];

      const results = [];
      const seen = {};
      doc("h3.novel-title").each((_, el) => {
        // The anchor may wrap the title (AJAX list) or sit inside it (search page).
        let a = el.closest("a");
        if (!a.attr("href")) a = el.find("a").first();
        const href = a.attr("href");
        const title = el.text().trim();
        if (!href || !title || seen[href]) return;
        seen[href] = true;

        let img = a.find("img").first();
        if (!img.attr("src") && !img.attr("data-src")) {
          img = el.closest(".row").find("img").first();
        }
        const cover = img.attr("src") || img.attr("data-src");

        results.push({
          id: this.abs(href),
          title,
          image: cover ? this.abs(cover) : undefined,
        });
      });
      return results;
    } catch (e) {
      console.error("[NovelBin] search:", e.message);
      return [];
    }
  }

  async findChapters(novelId) {
    try {
      const page = await fetch(this.abs(novelId), { headers: this.headers });
      if (!page.ok) return [];
      const pageDoc = LoadDoc(await page.text());
      if (!pageDoc) return [];

      // NovelBin exposes the numeric id via [data-novel-id]; fall back to the
      // slug, which the archive endpoint also accepts on some mirrors.
      const numericId = pageDoc("[data-novel-id]").first().attr("data-novel-id");
      const novelKey = numericId || this.slug(novelId);

      const res = await fetch(
        `${this.api}/ajax/chapter-archive?novelId=${encodeURIComponent(novelKey)}`,
        { headers: this.headers },
      );
      if (!res.ok) return [];
      const doc = LoadDoc(await res.text());
      if (!doc) return [];

      const chapters = [];
      const seen = {};
      doc("ul.list-chapter li a").each((_, a) => {
        const href = a.attr("href");
        if (!href || seen[href]) return;
        seen[href] = true;
        const title = (a.attr("title") || a.text()).trim();
        chapters.push({
          id: this.abs(href),
          url: this.abs(href),
          title,
          chapter: this.chapterNumber(title),
          index: 0,
        });
      });
      chapters.forEach((c, i) => (c.index = i));
      return chapters;
    } catch (e) {
      console.error("[NovelBin] findChapters:", e.message);
      return [];
    }
  }

  async findChapterContent(chapterId) {
    try {
      const res = await fetch(this.abs(chapterId), { headers: this.headers });
      if (!res.ok) return null;
      const doc = LoadDoc(await res.text());
      if (!doc) return null;

      const html = doc("#chr-content").first().html();
      if (!html) return null;
      return { html: html.trim() };
    } catch (e) {
      console.error("[NovelBin] findChapterContent:", e.message);
      return null;
    }
  }

  // --- helpers ---

  abs(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href)) return href;
    return this.api + (href.startsWith("/") ? "" : "/") + href;
  }

  slug(idOrUrl) {
    const clean = String(idOrUrl).split(/[?#]/)[0].replace(/\/+$/, "");
    return clean.substring(clean.lastIndexOf("/") + 1);
  }

  chapterNumber(title) {
    const m = /chapter\s*([\d.]+)/i.exec(title) || /([\d.]+)/.exec(title);
    return m ? m[1] : "";
  }
}
