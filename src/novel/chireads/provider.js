/**
 * Monarch novel provider for Chireads (https://chireads.com) — French.
 *
 * French translations of CN/KR/JP web novels. WordPress, custom theme:
 *   - search   -> /?s=<q>                    (article .entry-title a)
 *   - chapters -> novel page                 (links containing /chapitre)
 *   - content  -> chapter page, .entry-content / .chapter-content
 *
 * ponytail: Chireads uses a custom (non-Madara) theme I could not verify
 * offline, so this is the LOWEST-confidence provider of the batch — the
 * selectors are generic-WordPress best-guesses. Smoke-test first; if search
 * or the chapter list comes back empty, curl a page and adjust, or say the
 * word and I'll swap French to a site with a structure I can pin down.
 */
class Provider {
  constructor() {
    this.api = "https://chireads.com";
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://chireads.com/",
    };
  }

  getSettings() {
    return { supportsMultiLanguage: false };
  }

  async search(opts) {
    try {
      const doc = await this.load(`${this.api}/?s=${encodeURIComponent(opts.query)}`);
      if (!doc) return [];
      const results = [];
      const seen = {};
      doc("article .entry-title a, h2.entry-title a, .post-title a, .book-list a").each((_, a) => {
        const href = a.attr("href");
        const title = a.text().trim();
        if (!href || !title || seen[href]) return;
        seen[href] = true;
        const img = a.closest("article").find("img").first();
        const cover = img.attr("data-src") || img.attr("src");
        results.push({ id: this.abs(href), title, image: cover ? this.abs(cover) : undefined });
      });
      return results;
    } catch (e) {
      console.error("[Chireads] search:", e.message);
      return [];
    }
  }

  async findChapters(novelId) {
    try {
      const doc = await this.load(this.abs(novelId));
      if (!doc) return [];
      // Chapter links point at /chapitre-... under the same novel path.
      let items = doc(".chapter-list a, .book-chapter-list a, ul.chapters a");
      if (!items.length()) {
        items = doc("a").filter((_, a) => /\/chapitre/i.test(a.attr("href") || ""));
      }

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
      chapters.sort((a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0));
      chapters.forEach((c, i) => (c.index = i));
      return chapters;
    } catch (e) {
      console.error("[Chireads] findChapters:", e.message);
      return [];
    }
  }

  async findChapterContent(chapterId) {
    try {
      const doc = await this.load(this.abs(chapterId));
      if (!doc) return null;
      let node = doc(".chapter-content").first();
      if (!node.html()) node = doc(".entry-content, article .content, #content").first();
      const html = node.html();
      return html ? { html: html.trim() } : null;
    } catch (e) {
      console.error("[Chireads] findChapterContent:", e.message);
      return null;
    }
  }

  // --- helpers ---

  async load(url) {
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? LoadDoc(text) : null;
  }

  abs(href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href)) return href;
    if (href.startsWith("//")) return "https:" + href;
    return this.api + (href.startsWith("/") ? "" : "/") + href;
  }

  chapterNumber(title) {
    const m = /(\d+(?:\.\d+)?)/.exec(title || "");
    return m ? m[1] : "";
  }
}
