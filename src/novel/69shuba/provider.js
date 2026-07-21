/**
 * Monarch novel provider for 69shuba (https://www.69shuba.com) — Chinese raws.
 *
 * Massive catalog of untranslated CN web novels; matches AniList via the
 * `native` (Chinese) title. Biquge-family layout:
 *   - search   -> /modules/article/search.php?searchkey=  (.newbox list)
 *   - chapters -> /book/<id>/                              (#catalog li a)
 *   - content  -> chapter page, .txtnav
 *
 * ponytail: selectors from knowledge, built offline. TWO risks to check on
 * the first smoke test: (1) domain rotates (69shuba.com/.cx, 69shu.com);
 * (2) some biquge mirrors serve GBK, not UTF-8 — if titles/content come back
 * as mojibake, the site charset is the cause, not the selectors.
 */
class Provider {
  constructor() {
    this.api = "https://www.69shuba.com";
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.69shuba.com/",
    };
  }

  getSettings() {
    return { supportsMultiLanguage: false };
  }

  async search(opts) {
    const url = `${this.api}/modules/article/search.php?searchkey=${encodeURIComponent(opts.query)}`;
    try {
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) return [];
      // A single exact match redirects straight to the book page.
      if (res.redirected && /\/book\//i.test(res.url)) {
        const doc = LoadDoc(await res.text());
        const title = doc ? doc("h1").first().text().trim() : "";
        return title ? [{ id: res.url, title }] : [];
      }

      const doc = LoadDoc(await res.text());
      if (!doc) return [];
      const results = [];
      const seen = {};
      doc(".newbox li, .search-result li, .grid li").each((_, li) => {
        const a = li.find("h3 a, .bookname a, a").first();
        const href = a.attr("href");
        if (!href || seen[href]) return;
        seen[href] = true;
        const title = a.text().trim() || (a.attr("title") || "").trim();
        if (!title) return;
        const img = li.find("img").first();
        const cover = img.attr("data-original") || img.attr("src") || img.attr("_src");
        results.push({ id: this.abs(href), title, image: cover ? this.abs(cover) : undefined });
      });
      return results;
    } catch (e) {
      console.error("[69shuba] search:", e.message);
      return [];
    }
  }

  async findChapters(novelId) {
    try {
      // Book info page is /book/<id>.htm; the chapter catalog is /book/<id>/.
      const bookId = this.bookId(novelId);
      const listUrl = bookId ? `${this.api}/book/${bookId}/` : String(novelId).replace(/\.htm.*$/i, "/");
      const doc = await this.load(listUrl);
      if (!doc) return [];

      let items = doc("#catalog li a");
      if (!items.length()) items = doc(".catalog li a, .qustime li a, dl dd a");

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
      console.error("[69shuba] findChapters:", e.message);
      return [];
    }
  }

  async findChapterContent(chapterId) {
    try {
      const doc = await this.load(this.abs(chapterId));
      if (!doc) return null;
      let node = doc(".txtnav").first();
      if (!node.html()) node = doc("#content, .content, #txt").first();
      let html = node.html();
      if (!html) return null;
      // .txtnav leads with the chapter <h1> and trailing ad/nav divs — drop them.
      html = html.replace(/<h1[\s\S]*?<\/h1>/i, "").replace(/<div class="txtinfo[\s\S]*$/i, "");
      return { html: html.trim() };
    } catch (e) {
      console.error("[69shuba] findChapterContent:", e.message);
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

  bookId(idOrUrl) {
    const m = /\/book\/(\d+)/.exec(String(idOrUrl));
    return m ? m[1] : "";
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
