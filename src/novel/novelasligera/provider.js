/**
 * Monarch novel provider — Madara theme (WordPress wp-manga).
 *
 * This same class body is reused across the Madara-based novel sites
 * (NovelasLigera / CentralNovel / SakuraNovel); only `name` + `api` differ.
 * Madara scraping pattern:
 *   - search   -> /?s=<q>&post_type=wp-manga  (+ admin-ajax fallback)
 *   - chapters -> <novel>/ajax/chapters/      (+ manga_get_chapters fallback)
 *   - content  -> .reading-content .text-left
 *
 * chapterNumber() is language-agnostic (first number in the title) so
 * "Capítulo 12" / "Capítulo 12" / "Bab 12" all parse.
 *
 * ponytail: selectors from the standard Madara theme, built offline. If a
 * method returns empty in-app, curl the endpoint and fix the one selector.
 */
class Provider {
  constructor() {
    this.name = "NovelasLigera";
    this.api = "https://novelasligera.com";
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: this.api + "/",
      "X-Requested-With": "XMLHttpRequest",
    };
  }

  getSettings() {
    return { supportsMultiLanguage: false };
  }

  async search(opts) {
    try {
      // Primary: rendered search page (carries covers).
      const doc = await this.load(`${this.api}/?s=${encodeURIComponent(opts.query)}&post_type=wp-manga`);
      const results = [];
      const seen = {};
      if (doc) {
        doc("div.c-tabs-item__content").each((_, el) => {
          const a = el.find("div.tab-thumb a, .post-title h3 a, .post-title h5 a").first();
          const href = a.attr("href");
          if (!href || seen[href]) return;
          seen[href] = true;
          const title = (a.attr("title") || el.find(".post-title").first().text()).trim();
          const img = el.find("img").first();
          const cover = img.attr("data-src") || img.attr("src") || img.attr("data-lazy-src");
          results.push({ id: href, title, image: cover ? this.abs(cover) : undefined });
        });
      }
      if (results.length) return results;

      // Fallback: Madara autosuggest AJAX (title + url only, no cover).
      const res = await fetch(`${this.api}/wp-admin/admin-ajax.php`, {
        method: "POST",
        headers: { ...this.headers, "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=wp-manga-search-manga&title=${encodeURIComponent(opts.query)}`,
      });
      if (!res.ok) return [];
      const json = JSON.parse(await res.text());
      const data = (json && json.data) || [];
      for (const it of data) {
        if (!it || !it.url || seen[it.url]) continue;
        seen[it.url] = true;
        results.push({ id: it.url, title: (it.title || "").trim() });
      }
      return results;
    } catch (e) {
      console.error(`[${this.name}] search:`, e.message);
      return [];
    }
  }

  async findChapters(novelId) {
    const base = String(novelId).replace(/\/?$/, "/");
    try {
      // Modern Madara: POST <novel>/ajax/chapters/
      let doc = await this.loadPost(`${base}ajax/chapters/`);
      let items = doc ? doc("li.wp-manga-chapter a") : null;

      // Older Madara: admin-ajax with the numeric data-id from the novel page.
      if (!items || !items.length()) {
        const page = await this.load(base);
        const dataId = page ? page("#manga-chapters-holder").first().attr("data-id") : null;
        if (dataId) {
          doc = await this.loadPost(
            `${this.api}/wp-admin/admin-ajax.php`,
            `action=manga_get_chapters&manga=${encodeURIComponent(dataId)}`,
          );
          items = doc ? doc("li.wp-manga-chapter a") : null;
        }
      }
      if (!items) return [];

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
      // Madara lists newest-first; sort ascending by parsed number.
      chapters.sort((a, b) => (parseFloat(a.chapter) || 0) - (parseFloat(b.chapter) || 0));
      chapters.forEach((c, i) => (c.index = i));
      return chapters;
    } catch (e) {
      console.error(`[${this.name}] findChapters:`, e.message);
      return [];
    }
  }

  async findChapterContent(chapterId) {
    try {
      const doc = await this.load(this.abs(chapterId));
      if (!doc) return null;
      let node = doc(".reading-content .text-left").first();
      if (!node.html()) node = doc(".reading-content").first();
      if (!node.html()) node = doc(".text-left, .entry-content").first();
      const html = node.html();
      return html ? { html: html.trim() } : null;
    } catch (e) {
      console.error(`[${this.name}] findChapterContent:`, e.message);
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

  async loadPost(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/x-www-form-urlencoded" },
      body: body || "",
    });
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
