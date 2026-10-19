// Vocabulary tracking from reading: every material is read with unknown words marked,
// so each reading record says which words were seen and which were not known.
// No imports, so both the pages and the server-side plan generator can use it.

const WORD = /[A-Za-z]+(?:['’][A-Za-z]+)*/g;

export const normWord = (w) => w.toLowerCase().replace(/’/g, "'");

// Split text into [{t: text, w: normalisedWord|null}] so each word can be made clickable.
export function tokenize(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(WORD)) {
    if (m.index > last) out.push({ t: text.slice(last, m.index), w: null });
    out.push({ t: m[0], w: normWord(m[0]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last), w: null });
  return out;
}

export function wordsOf(text) {
  return [...text.matchAll(WORD)].map((m) => normWord(m[0]));
}

// Replays reading records in order: a word marked unknown is unknown until it is
// read again without being marked.
export function lexiconProfile(reading) {
  const known = new Set();
  const unknown = new Set();
  const sessions = [];
  for (const r of reading.slice().sort((a, b) => a.date.localeCompare(b.date))) {
    if (!Array.isArray(r.distinct)) continue;
    const marked = new Set(r.unknown || []);
    for (const w of r.distinct) {
      if (marked.has(w)) { unknown.add(w); known.delete(w); } else { known.add(w); unknown.delete(w); }
    }
    sessions.push({ date: r.date, title: r.title, level: r.level, track: r.track, wordCount: r.wordCount, unknownCount: marked.size, unknownRatio: r.unknownRatio, understood: r.understood });
  }
  return { known, unknown, sessions };
}
