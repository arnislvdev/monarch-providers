/**
 * Monarch novel provider for MTLNovel (https://www.mtlnovel.com).
 *
 * Machine-translated CN/KR/JP web novels — huge catalog of ongoing/unlicensed
 * titles the licensed sites don't carry. WordPress + AMP backend:
 *   - search   -> /wp-admin/admin-ajax.php?action=autosuggest  (JSON)
 *   - chapters -> <novel>/chapter-list/                        (a.ch-link)
 *   - content  -> chapter page, div.par
 *
 * IDs are absolute URLs (permalinks). MTL quality is rough by nature.
 *
 * ponytail: selectors from knowledge, built offline. If a method returns
 * empty in-app, curl the endpoint and fix the one selector.
 */
class Provider {
  constructor() {
    this.api = "https://www.mtlnovel.com";
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.mtlnovel.com/",
      "X-Requested-With": "XMLHttpRequest",
    };
  }

  getSettings() {
    return { supportsMultiLanguage: false };
  }

  async search(opts) {
    const url =
      `${this.api}/wp-admin/admin-ajax.php?action=autosuggest` +
      `&q=${encodeURIComponent(opts.query)}` +
      `&__amp_source_origin=${encodeURIComponent(this.api)}`;
    try {
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) return [];
      const data = this.parseJson(await res.text());
      const items = (data && data.items && data.items[0] && data.items[0].results) || [];
      const results = [];
      for (const it of items) {
        if (!it || !it.permalink) continue;
        results.push({
          id: it.permalink,
          title: this.stripTags(it.title),
          image: it.thumbnail || undefined,
        });
      }
      return results;
    } catch (e) {
      console.error("[MTLNovel] search:", e.message);
      return [];
    }
  }

  async findChapters(novelId) {
    const base = String(novelId).replace(/\/?$/, "/");
    try {
      let doc = await this.load(`${base}chapter-list/`);
      let items = doc ? doc("a.ch-link") : null;
      // Fallbacks for template drift.
      if (doc && (!items || !items.length())) items = doc(".ch-list a, #chapterlist a");
      if (!doc) return [];

      const chapters = [];
      const seen = {};
      items.each((_, a) => {
        const href = a.attr("href");
        if (!href || seen[href]) return;
        seen[href] = true;
        const title = a.text().trim();
        chapters.push({
          id: this.abs(base, href),
          url: this.abs(base, href),
          title,
          chapter: this.chapterNumber(title),
          index: 0,
        });
      });
      chapters.sort((a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0));
      chapters.forEach((c, i) => (c.index = i));
      return chapters;
    } catch (e) {
      console.error("[MTLNovel] findChapters:", e.message);
      return [];
    }
  }

  async findChapterContent(chapterId) {
    try {
      const doc = await this.load(String(chapterId));
      if (!doc) return null;
      let node = doc("div.par").first();
      if (!node.html()) node = doc(".chapter-content, #chapter-content").first();
      const html = node.html();
      return html ? { html: html.trim() } : null;
    } catch (e) {
      console.error("[MTLNovel] findChapterContent:", e.message);
      return null;
    }
  }

  // --- helpers ---

  async load(url) {
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) return null;
    return LoadDoc(await res.text());
  }

  parseJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  stripTags(s) {
    return String(s || "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }

  abs(base, href) {
    if (!href) return href;
    if (/^https?:\/\//i.test(href)) return href;
    return this.api + (href.startsWith("/") ? "" : "/") + href;
  }

  chapterNumber(title) {
    const m = /chapter\s*([\d.]+)/i.exec(title) || /([\d.]+)/.exec(title);
    return m ? m[1] : "";
  }
}
