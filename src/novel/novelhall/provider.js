/**
 * Monarch novel provider for NovelHall (https://www.novelhall.com).
 *
 * Broad catalog of translated web novels, plain server-rendered HTML, no CF:
 *   - search   -> /index.php?s=so&module=book&keyword=   (result table)
 *   - chapters -> novel page, #morelist li a  (full catalog inline)
 *   - content  -> chapter page, #htmlContent
 *
 * IDs are absolute URLs. Book links don't end in ".html"; chapter links do.
 *
 * ponytail: selectors from knowledge, built offline. If a method returns
 * empty in-app, curl the endpoint and fix the one selector.
 */
class Provider {
  constructor() {
    this.api = "https://www.novelhall.com";
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.novelhall.com/",
    };
  }

  getSettings() {
    return { supportsMultiLanguage: false };
  }

  async search(opts) {
    const url = `${this.api}/index.php?s=so&module=book&keyword=${encodeURIComponent(opts.query)}`;
    try {
      const doc = await this.load(url);
      if (!doc) return [];
      const results = [];
      const seen = {};
      doc("table tr").each((_, tr) => {
        // Pick the row's book link: an <a> whose href isn't a chapter (.html).
        let href, title;
        tr.find("a").each((__, a) => {
          if (href) return;
          const h = a.attr("href");
          if (h && !/\.html?($|\?)/i.test(h)) {
            href = h;
            title = a.text().trim();
          }
        });
        if (!href || !title || seen[href]) return;
        seen[href] = true;
        results.push({ id: this.abs(href), title });
      });
      return results;
    } catch (e) {
      console.error("[NovelHall] search:", e.message);
      return [];
    }
  }

  async findChapters(novelId) {
    try {
      const doc = await this.load(this.abs(novelId));
      if (!doc) return [];
      let items = doc("#morelist li a");
      if (!items.length()) items = doc(".book-catalog a, .all-catalog li a");

      const chapters = [];
      const seen = {};
      items.each((_, a) => {
        const href = a.attr("href");
        if (!href || seen[href]) return;
        seen[href] = true;
        const title = a.text().trim();
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
      console.error("[NovelHall] findChapters:", e.message);
      return [];
    }
  }

  async findChapterContent(chapterId) {
    try {
      const doc = await this.load(this.abs(chapterId));
      if (!doc) return null;
      let node = doc("#htmlContent").first();
      if (!node.html()) node = doc(".entry-content, #content").first();
      const html = node.html();
      return html ? { html: html.trim() } : null;
    } catch (e) {
      console.error("[NovelHall] findChapterContent:", e.message);
      return null;
    }
  }

  // --- helpers ---

  async load(url) {
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) return null;
    return LoadDoc(await res.text());
  }

  abs(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href)) return href;
    return this.api + (href.startsWith("/") ? "" : "/") + href;
  }

  chapterNumber(title) {
    const m = /chapter\s*([\d.]+)/i.exec(title) || /([\d.]+)/.exec(title);
    return m ? m[1] : "";
  }
}
