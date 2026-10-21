// Fetch actual prose before asking the AI to prepare reading aids. The model never
// supplies the passage itself. URLs are fixed here, so the server cannot fetch an
// arbitrary URL returned by a model or submitted by a browser.
const SOURCES = {
  tech: [
    { type: 'markdown', name: 'Playwright · Writing tests', url: 'https://raw.githubusercontent.com/microsoft/playwright/main/docs/src/writing-tests-js.md', page: 'https://playwright.dev/docs/writing-tests' },
    { type: 'markdown', name: 'Playwright · Best Practices', url: 'https://raw.githubusercontent.com/microsoft/playwright/main/docs/src/best-practices-js.md', page: 'https://playwright.dev/docs/best-practices' },
    { type: 'markdown', name: 'Playwright · Generating tests', url: 'https://raw.githubusercontent.com/microsoft/playwright/main/docs/src/codegen-intro.md', page: 'https://playwright.dev/docs/codegen-intro' },
  ],
  daily: [
    { type: 'nasa', name: 'NASA News', url: 'https://www.nasa.gov/wp-json/wp/v2/posts?per_page=10', page: 'https://www.nasa.gov/news/' },
    { type: 'gutenberg', name: 'L. Frank Baum · The Wonderful Wizard of Oz', url: 'https://www.gutenberg.org/cache/epub/55/pg55.txt', page: 'https://www.gutenberg.org/ebooks/55' },
    { type: 'gutenberg', name: 'Frances Hodgson Burnett · The Secret Garden', url: 'https://www.gutenberg.org/cache/epub/113/pg113.txt', page: 'https://www.gutenberg.org/ebooks/113' },
  ],
};

const count = text => (text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || []).length;
const hash = text => [...text].reduce((n, c) => ((n * 31 + c.charCodeAt(0)) >>> 0), 0);
function difficulty(text) {
  const words = text.match(/[A-Za-z]+/g) || [];
  const sentences = Math.max(1, (text.match(/[.!?](?:\s|$)/g) || []).length);
  return words.length / sentences + words.filter(w => w.length >= 9).length * 30 / Math.max(1, words.length);
}
function entities(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp|rsquo|lsquo|rdquo|ldquo|mdash|ndash);/gi, (_, code) => {
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–' };
    return code[0] === '#' ? String.fromCodePoint(parseInt(code.slice(code[1]?.toLowerCase() === 'x' ? 2 : 1), code[1]?.toLowerCase() === 'x' ? 16 : 10)) : named[code.toLowerCase()] || _;
  });
}
const clean = text => entities(text).replace(/\s+/g, ' ').trim();

function novelParagraphs(raw) {
  const start = raw.search(/\*\*\* START OF THE PROJECT GUTENBERG EBOOK/i);
  const end = raw.search(/\*\*\* END OF THE PROJECT GUTENBERG EBOOK/i);
  if (start < 0 || end < 0) throw new Error('小说原文缺少正文边界');
  const body = raw.slice(start, end);
  const chapter = body.search(/\nChapter I\b/i);
  if (chapter < 0) throw new Error('小说原文缺少章节');
  // Early chapters use plainer prose; later chapters in these books include songs.
  return body.slice(chapter).split(/\n\s*\n/).map(clean).filter(p => count(p) >= 18 && count(p) <= 200 && !/^Chapter\b/i.test(p)).slice(0, 25);
}

function markdownParagraphs(raw) {
  const body = raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').replace(/```[\s\S]*?```/g, '\n\n');
  return body.split(/\n\s*\n/).map(p => clean(p
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\{[^\n]*\}/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`]/g, '')))
    .filter(p => count(p) >= 28 && count(p) <= 180 && !/^(?:#|import\b|export\b|\||\d+\.)/.test(p) && !/[{};]/.test(p));
}

function newsParagraphs(html) {
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(([, p]) => clean(p.replace(/<[^>]+>/g, ' ')))
    .filter(p => count(p) >= 28 && count(p) <= 180);
}

function excerpt(paragraphs, target, seed) {
  if (!paragraphs.length) throw new Error('来源中没有可读的英文段落');
  const starts = paragraphs.map((_, i) => i).filter(i => {
    let n = 0;
    for (let j = i; j < paragraphs.length && n < target * .8; j++) n += count(paragraphs[j]);
    return n >= target * .8;
  });
  if (!starts.length) throw new Error('来源中的正文太短');
  const chosen = starts[seed % starts.length];
  const parts = [];
  let words = 0;
  for (let i = chosen; i < paragraphs.length && words < target; i++) {
    parts.push(paragraphs[i]);
    words += count(paragraphs[i]);
  }
  return parts.join('\n\n');
}

async function fetchBounded(url, fetchImpl) {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'practise-reading/1.0' } });
  if (!response.ok) throw new Error(`来源返回 ${response.status}`);
  const size = Number(response.headers.get('content-length'));
  if (size > 2_000_000) throw new Error('来源内容过大');
  const body = await response.text();
  if (body.length > 2_000_000) throw new Error('来源内容过大');
  return body;
}

export async function selectReadingSource(ctx, fetchImpl = fetch) {
  const track = ctx.today.track.startsWith('技术') ? 'tech' : 'daily';
  const catalog = SOURCES[track];
  const recent = new Set(ctx.recentMaterials.map(m => m.sourceUrl).filter(Boolean));
  const offset = track === 'daily' ? 0 : hash(ctx.today.date) % catalog.length;
  const ordered = catalog.map((_, i) => catalog[(offset + i) % catalog.length]);
  const target = ctx.progress.phase?.n === 3 ? 550 : ctx.progress.phase?.n === 2 ? 350 : ctx.progress.week <= 2 ? 180 : 240;
  const errors = [];
  for (const source of ordered) {
    try {
      const raw = await fetchBounded(source.url, fetchImpl);
      if (source.type === 'nasa') {
        const posts = JSON.parse(raw).filter(p => p.link?.startsWith('https://www.nasa.gov/') && !recent.has(p.link));
        const candidates = [];
        for (const post of posts) {
          try {
            const paragraphs = newsParagraphs(post.content?.rendered || '');
            const text = excerpt(paragraphs, target, 0);
            candidates.push({ text, title: clean(post.title?.rendered || 'NASA News'), sourceName: source.name, sourceUrl: post.link, sourceType: 'news' });
          } catch { /* Try the next article. */ }
        }
        if (!candidates.length) throw new Error('近期新闻没有可用的正文');
        candidates.sort((a, b) => difficulty(a.text) - difficulty(b.text));
        return candidates[0];
      }
      const paragraphs = source.type === 'gutenberg' ? novelParagraphs(raw) : markdownParagraphs(raw);
      const page = source.page;
      if (recent.has(page) && ordered.some(s => !recent.has(s.page))) continue;
      return { text: excerpt(paragraphs, target, hash(ctx.today.date + source.name)), title: source.name, sourceName: source.name, sourceUrl: page, sourceType: source.type === 'gutenberg' ? 'novel' : 'documentation' };
    } catch (e) { errors.push(`${source.name}：${e.message}`); }
  }
  throw new Error(`无法取得真实阅读材料，请稍后重试。${errors.join('；')}`);
}
