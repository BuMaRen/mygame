import { topbar, api, esc, today, uid, toast, fail } from '/assets/app.js';
import { TRACK_BY_DAY } from './plan.js';

export const SKILL = 'english';

export const NAV = [
  { key: 'home', href: '/english/', label: '今日' },
  { key: 'grammar', href: '/english/grammar.html', label: '语法' },
  { key: 'vocab', href: '/english/vocab.html', label: '词汇' },
  { key: 'reading', href: '/english/reading.html', label: '阅读' },
  { key: 'writing', href: '/english/writing.html', label: '写作' },
  { key: 'prompts', href: '/english/prompts.html', label: 'AI 陪练' },
  { key: 'progress', href: '/english/progress.html', label: '进度' },
];

// Data files under english/data/, each with its empty default.
export const DEFAULTS = {
  settings: { startDate: null },
  words: [],
  reading: [],
  journal: [],
  checkins: [],
  reviews: [],
  grammar: {},
  phases: {},
};

export const load = (name) => api.get(SKILL, name, DEFAULTS[name]);
export const save = (name, data) => api.put(SKILL, name, data);

export function header(active) {
  topbar({ brand: 'practise', sub: 'English', nav: NAV, active });
  planReturnBar();
}

// ---------- plan → practice → plan ----------

// A link from today's plan into a practice page carries ?from=plan&task=<id>.
export function planLink(link, taskId) {
  const [path, hash] = link.split('#');
  return `${path}?from=plan&task=${encodeURIComponent(taskId)}${hash ? '#' + hash : ''}`;
}

// Marks (or unmarks) a task of today's plan as done in checkins.json.
export async function setTaskDone(taskId, done = true) {
  const checkins = await load('checkins');
  let rec = checkins.find((c) => c.date === today());
  if (!rec) {
    rec = { date: today(), track: TRACK_BY_DAY[new Date().getDay()] || null, tasks: [], minutes: 0, note: '', done: false };
    checkins.push(rec);
    checkins.sort((a, b) => a.date.localeCompare(b.date));
  }
  const set = new Set(rec.tasks);
  done ? set.add(taskId) : set.delete(taskId);
  rec.tasks = [...set];
  await save('checkins', checkins);
}

async function planReturnBar() {
  const params = new URLSearchParams(location.search);
  if (params.get('from') !== 'plan') return;
  const taskId = params.get('task');
  const bar = document.createElement('div');
  bar.className = 'plan-bar';
  bar.innerHTML = `<div class="plan-bar-inner">
    <span class="plan-bar-label">今日计划</span><span class="plan-bar-task"></span><span class="spacer"></span>
    ${taskId ? '<button class="btn sm ok" data-act="done">完成，回到计划</button>' : ''}
    <a class="btn sm" href="/english/">回到计划</a></div>`;
  document.querySelector('.topbar').append(bar);
  bar.querySelector('[data-act=done]')?.addEventListener('click', async () => {
    try {
      await setTaskDone(taskId);
      location.href = '/english/';
    } catch (e) { fail(e); }
  });
  try {
    const plan = await (await fetch('/api/english/plan')).json();
    const task = plan?.tasks.find((t) => t.id === taskId);
    if (task) bar.querySelector('.plan-bar-task').textContent = task.title;
  } catch {}
}

// ---------- add-word dialog ----------

let dlg;
// Opens a dialog to add a word to the word book; resolves to the saved word or null.
export function addWordDialog({ word = '', meaning = '', sentence = '', source = '' } = {}) {
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.className = 'dialog';
    dlg.innerHTML = `<form method="dialog">
      <h3 style="margin-top:0">加入生词本</h3>
      <div class="field"><label>词 / 短语</label><input type="text" name="word" required></div>
      <div class="field"><label>中文（这个语境下的）</label><input type="text" name="meaning"></div>
      <div class="field"><label>原句（最好是你读到它的那句话）</label><textarea name="sentence" rows="2"></textarea></div>
      <div class="field"><label>出处</label><input type="text" name="source"></div>
      <div class="row" style="justify-content:flex-end">
        <button class="btn" value="cancel" formnovalidate>取消</button>
        <button class="btn primary" value="save">加入</button>
      </div></form>`;
    document.body.append(dlg);
  }
  const f = dlg.querySelector('form');
  Object.entries({ word, meaning, sentence, source }).forEach(([k, v]) => (f.elements[k].value = v));
  dlg.showModal();
  (meaning ? f.elements.sentence : f.elements.meaning).focus();
  return new Promise((resolve) => {
    dlg.onclose = async () => {
      if (dlg.returnValue !== 'save' || !f.elements.word.value.trim()) return resolve(null);
      try {
        const words = await load('words');
        const w = {
          id: uid(), date: today(), word: f.elements.word.value.trim(), meaning: f.elements.meaning.value.trim(),
          sentence: f.elements.sentence.value.trim(), source: f.elements.source.value.trim(), streak: 0, known: false,
        };
        words.push(w);
        await save('words', words);
        toast(`已加入：${w.word}`);
        resolve(w);
      } catch (e) { fail(e); resolve(null); }
    };
    dlg.returnValue = '';
  });
}

export { esc };
