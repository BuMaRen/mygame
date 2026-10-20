// Part 1 UI: drill single theories and design methods, one concept at a time.
// Data: system-design/data/concepts.json → { [conceptId]: { lesson, drills: [...] } }.
import { api, esc, today, uid, toast, fail, trackAI } from '/assets/app.js';
import { CONCEPTS, GROUPS, LEVELS, conceptById } from '../content/concepts.js';
import { TOPICS } from '../content/topics.js';

const MASTERED = 80;
const VERDICT = { 正确: 'ok', 部分正确: 'warn', 错误或缺失: 'bad' };

let records = {};
let selected = CONCEPTS[0].id;
let selectedDrill = null;
let coreOnly = false;
let busy = null; // 'lesson' | 'drill' | 'evaluate'
let saveTimer;
let root;

const rec = (id) => records[id] || { drills: [] };
const latestEval = (r) => r.drills.filter((d) => d.evaluation).at(-1)?.evaluation;
const mastered = (id) => (latestEval(rec(id))?.score ?? 0) >= MASTERED;

function status(id) {
  const r = rec(id);
  const ev = latestEval(r);
  if (ev) return ev.score >= MASTERED ? `掌握 · ${ev.score} 分` : `练习中 · ${ev.score} 分`;
  if (r.drills.length) return `已出题 ${r.drills.length} 组`;
  return r.lesson ? '已看讲解' : '未开始';
}

async function persist(id, record) {
  const next = { ...records, [id]: record };
  await api.put('system-design', 'concepts', next);
  records = next;
}

async function callAI(action, payload) {
  const labels = { 'concept-lesson': 'AI 正在生成知识点讲解', 'concept-drill': 'AI 正在生成知识点练习', 'concept-evaluate': 'AI 正在评估知识点回答' };
  return trackAI(labels[action] || 'AI 正在处理', async () => {
    const res = await fetch(`/api/system-design/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI 请求失败');
    return data;
  });
}

// ---------- rendering ----------

function renderStats() {
  const core = CONCEPTS.filter((c) => c.level === 'core');
  const drills = Object.values(records).reduce((n, r) => n + (r.drills?.filter((d) => d.evaluation).length || 0), 0);
  root.querySelector('#c-stats').innerHTML = [
    [`${core.filter((c) => mastered(c.id)).length}<span class="small muted"> / ${core.length}</span>`, '★ 核心知识点掌握'],
    [`${CONCEPTS.filter((c) => mastered(c.id)).length}<span class="small muted"> / ${CONCEPTS.length}</span>`, '全部知识点掌握'],
    [drills, '已评估的练习'],
  ].map(([n, l]) => `<div class="card stat"><div class="num">${n}</div><div class="label">${l}</div></div>`).join('');
}

function renderList() {
  const el = root.querySelector('#c-list');
  el.innerHTML = GROUPS.map((g) => {
    const items = CONCEPTS.filter((c) => c.group === g && (!coreOnly || c.level === 'core'));
    if (!items.length) return '';
    return `<div class="sd-group">${esc(g)}</div>` + items.map((c) => `
      <button class="problem-item sd-concept lv-${c.level} ${c.id === selected ? 'selected' : ''}" data-concept="${c.id}">
        <b>${esc(c.name)} <span class="sd-level lv-${c.level}">${LEVELS[c.level].label}</span></b>
        <span class="small muted">${mastered(c.id) ? '✓ ' : ''}${esc(status(c.id))}</span>
      </button>`).join('');
  }).join('');
  el.querySelectorAll('[data-concept]').forEach((b) => (b.onclick = () => select(b.dataset.concept)));
}

function lessonHtml(c, r) {
  if (!r.lesson) {
    return `<p class="muted">先看讲解把知识点本身弄懂，再做练习。</p>
      <button class="btn primary" id="c-lesson" ${busy ? 'disabled' : ''}>${busy === 'lesson' ? '生成中…' : 'AI 生成讲解'}</button>`;
  }
  const L = r.lesson;
  const list = (title, items, tag = 'ul') => `<h4>${title}</h4><${tag}>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</${tag}>`;
  return `<p>${esc(L.summary)}</p>
    ${list('怎么工作', L.howItWorks, 'ol')}${list('什么时候用 / 不用', L.whenToUse)}${list('代价与取舍', L.tradeoffs)}${list('常见误区', L.pitfalls)}${list('面试官常见追问', L.interviewQuestions, 'ol')}
    <p class="small muted">${esc(r.lessonProvider || '本地 AI')} 生成 · ${esc(r.lessonDate || '')}
      <button class="btn ghost sm" id="c-lesson" ${busy ? 'disabled' : ''}>${busy === 'lesson' ? '生成中…' : '重新生成讲解'}</button></p>`;
}

function drillHtml(c, r) {
  const list = r.drills.slice().reverse();
  const d = r.drills.find((x) => x.id === selectedDrill);
  let html = `<div class="row" style="margin-bottom:10px">
      <button class="btn primary" id="c-drill" ${busy ? 'disabled' : ''}>${busy === 'drill' ? '出题中…' : 'AI 出一组新练习'}</button>
      <span class="muted small">每组 4–5 道小题：概念、原理、应用、取舍、陷阱。可以反复出新的。</span></div>`;
  if (list.length) {
    html += `<div class="coding-question-list">${list.map((x) => `<button class="coding-question ${x.id === selectedDrill ? 'selected' : ''}" data-drill="${x.id}">
      <b>${esc(x.drill.title)}</b><span class="small muted">${esc(x.date)} · ${x.evaluation ? `${x.evaluation.score} 分` : '未评估'}</span></button>`).join('')}</div>`;
  }
  if (!d) return html;

  const ev = d.evaluation;
  html += `<div class="sd-drill">${d.drill.questions.map((q, i) => {
    const pq = ev?.perQuestion[i];
    return `<div class="field sd-drill-q">
      <label for="c-ans-${i}"><span class="badge">${esc(q.kind)}</span> ${i + 1}. ${esc(q.prompt)}</label>
      <textarea id="c-ans-${i}" data-ans="${i}" rows="3">${esc(d.answers?.[i] || '')}</textarea>
      ${pq ? `<div class="sd-verdict ${VERDICT[pq.verdict] || ''}"><b>${esc(pq.verdict)}</b> ${esc(pq.feedback)}
        <div class="small" style="margin-top:6px"><span class="muted">参考答案：</span>${esc(pq.referenceAnswer)}</div>
        <div class="small muted" style="margin-top:4px">评分要点：${q.keyPoints.map(esc).join('；')}</div></div>` : ''}
    </div>`;
  }).join('')}
    <div class="row"><button class="btn primary" id="c-evaluate" ${busy ? 'disabled' : ''}>${busy === 'evaluate' ? '评估中…' : ev ? '改完后重新评估' : 'AI 评估'}</button>
      <span class="muted small">回答会自动保存。几句话说清要点即可，不必写成长文。</span></div>
    ${ev ? `<div class="card" style="margin-top:14px"><h3 style="margin-top:0">评估 · ${ev.score}/100 ${ev.score >= MASTERED ? '<span class="badge ok">达到掌握线</span>' : ''}</h3>
      <p>${esc(ev.summary)}</p>
      ${ev.misconceptions.length ? `<b>暴露的误解</b><ul>${ev.misconceptions.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <p><b>下一步：</b>${esc(ev.nextStep)}</p></div>` : ''}
  </div>`;
  return html;
}

function renderDetail() {
  const c = conceptById(selected);
  const r = rec(selected);
  const scenarios = TOPICS.filter((t) => t.concepts?.includes(c.id));
  const el = root.querySelector('#c-detail');
  el.innerHTML = `
    <div class="row"><h2 style="margin:0">${esc(c.name)}</h2><span class="sd-level lv-${c.level}">${LEVELS[c.level].label}</span><span class="badge">${esc(c.group)}</span></div>
    <p class="muted small" style="margin:6px 0 0">${esc(c.brief)} · ${esc(LEVELS[c.level].note)}</p>
    <h3>1. 讲解</h3><div class="sd-lesson">${lessonHtml(c, r)}</div>
    <h3>2. 专项练习</h3>${drillHtml(c, r)}
    ${scenarios.length ? `<h3>3. 用到它的业务场景题</h3><p class="small">${scenarios.map((t) => `<a href="#scenarios:${t.id}">${t.id} ${esc(t.title)}</a>`).join(' · ')}</p>` : ''}`;
  bindDetail(c);
}

function render() {
  renderStats();
  renderList();
  renderDetail();
}

// ---------- actions ----------

async function select(id) {
  try { await saveAnswers(); } catch (e) { fail(e); return; }
  selected = id;
  selectedDrill = rec(id).drills.at(-1)?.id || null;
  history.replaceState(null, '', `#concepts:${id}`);
  render();
}

function answersFromForm() {
  return [...root.querySelectorAll('[data-ans]')].map((t) => t.value);
}

async function saveAnswers() {
  clearTimeout(saveTimer);
  const r = rec(selected);
  const d = r.drills.find((x) => x.id === selectedDrill);
  if (!d || !root.querySelector('[data-ans]')) return;
  const answers = answersFromForm();
  if (JSON.stringify(answers) === JSON.stringify(d.answers || [])) return;
  await persist(selected, { ...r, drills: r.drills.map((x) => (x.id === d.id ? { ...x, answers } : x)) });
}

async function run(kind, fn) {
  try { await saveAnswers(); } catch (e) { fail(e); return; }
  const initialConcept = selected, initialDrill = selectedDrill;
  busy = kind;
  renderDetail();
  try { await fn(); } catch (e) { fail(e); }
  if (selected === initialConcept && selectedDrill === initialDrill) {
    try { await saveAnswers(); } catch (e) { fail(e); }
  }
  busy = null;
  render();
}

function bindDetail(c) {
  const id = c.id;
  root.querySelector('#c-lesson')?.addEventListener('click', () => run('lesson', async () => {
    const data = await callAI('concept-lesson', { conceptId: id });
    await persist(id, { ...rec(id), lesson: data.lesson, lessonProvider: data.provider, lessonDate: today() });
    toast('讲解已生成');
  }));
  root.querySelector('#c-drill')?.addEventListener('click', () => run('drill', async () => {
    await saveAnswers();
    const r = rec(id);
    const weaknesses = r.drills.flatMap((d) => d.evaluation?.misconceptions || []);
    const data = await callAI('concept-drill', { conceptId: id, recent: r.drills.map((d) => d.drill.title), weaknesses });
    const item = { id: uid(), date: today(), drill: data.drill, answers: data.drill.questions.map(() => ''), evaluation: null, provider: data.provider };
    await persist(id, { ...rec(id), drills: [...rec(id).drills, item] });
    if (selected === id) selectedDrill = item.id;
    toast('新练习已生成');
  }));
  root.querySelectorAll('[data-drill]').forEach((b) => (b.onclick = async () => {
    try { await saveAnswers(); } catch (e) { fail(e); return; }
    selectedDrill = b.dataset.drill;
    renderDetail();
  }));
  root.querySelectorAll('[data-ans]').forEach((t) => t.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveAnswers().catch(fail), 900);
  }));
  root.querySelector('#c-evaluate')?.addEventListener('click', () => {
    const answers = answersFromForm();
    if (!answers.some((a) => a.trim())) return toast('先作答再评估');
    const drillId = selectedDrill;
    run('evaluate', async () => {
      const r = rec(id);
      const d = r.drills.find((x) => x.id === drillId);
      const data = await callAI('concept-evaluate', { conceptId: id, drill: d.drill, answers });
      await persist(id, { ...rec(id), drills: rec(id).drills.map((x) => (x.id === drillId ? { ...x, answers, evaluation: data.evaluation, evaluatedAt: today() } : x)) });
      toast(`评估完成：${data.evaluation.score} 分`);
    });
  });
}

export async function mountConcepts(el) {
  root = el;
  root.innerHTML = `
    <div class="grid grid-3" id="c-stats" style="margin-bottom:16px"></div>
    <div class="card" style="margin-bottom:16px"><b>怎么练</b>
      <p class="muted" style="margin:6px 0 0">先练 <span class="sd-level lv-core">★ 核心</span> 知识点，再练 <span class="sd-level lv-common">常见</span>，最后 <span class="sd-level lv-advanced">进阶</span>。每个知识点：看讲解 → 做一组 4–5 道小题 → AI 评估，达到 ${MASTERED} 分算掌握；没到就再出一组新题。核心知识点基本掌握后，再去第二部分做业务场景设计。</p></div>
    <div class="grid" style="grid-template-columns:minmax(250px,320px) minmax(0,1fr)">
      <aside class="card"><div class="row" style="margin-bottom:8px"><h3 style="margin:0">知识点</h3><span class="spacer"></span>
        <label class="row small" style="margin:0;color:var(--text)"><input type="checkbox" id="c-core-only"> 只看核心</label></div>
        <div id="c-list" class="problem-list"></div></aside>
      <section class="card" id="c-detail"></section>
    </div>`;
  root.querySelector('#c-core-only').onchange = (e) => { coreOnly = e.target.checked; renderList(); };
  records = await api.get('system-design', 'concepts', {});
  const fromHash = location.hash.match(/^#concepts:(.+)$/)?.[1];
  // Start at the first core concept not yet mastered.
  selected = conceptById(fromHash)?.id || CONCEPTS.find((c) => c.level === 'core' && !mastered(c.id))?.id || CONCEPTS[0].id;
  selectedDrill = rec(selected).drills.at(-1)?.id || null;
  history.replaceState(null, '', `#concepts:${selected}`); // a reload stays on this concept
  render();
}

export function selectConcept(id) {
  if (root && conceptById(id) && id !== selected) select(id);
}
