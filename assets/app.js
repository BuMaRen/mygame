// Shared helpers for every practise page.

if (location.protocol === 'file:') {
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('div');
    b.className = 'banner';
    b.textContent = '请在 practise 目录运行 npm start，然后打开 http://localhost:4600/ —— 直接双击打开文件无法读取和保存数据。';
    document.body.prepend(b);
  });
}

try {
  const t = localStorage.getItem('theme');
  if (t) document.documentElement.dataset.theme = t;
} catch {}

export const api = {
  async get(skill, name, fallback) {
    const r = await fetch(`/api/data/${skill}/${name}`);
    if (!r.ok) throw new Error(`读取 ${name} 失败：${r.status}`);
    const data = await r.json();
    return data ?? structuredClone(fallback);
  },
  async put(skill, name, data) {
    const r = await fetch(`/api/data/${skill}/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`保存 ${name} 失败：${r.status}`);
  },
};

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function ymd(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export const today = () => ymd();
export function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let toastEl;
export function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.append(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast('已复制');
}

// Renders the sticky top bar. `nav` is [{href, label, key}], `active` matches a key.
export function topbar({ brand, brandHref = '/', sub, nav = [], active }) {
  const el = document.createElement('header');
  el.className = 'topbar';
  el.innerHTML = `<div class="topbar-inner">
    <a class="brand" href="${brandHref}">${esc(brand)}${sub ? ` <span>/ ${esc(sub)}</span>` : ''}</a>
    <nav class="nav">${nav.map((n) => `<a href="${n.href}" class="${n.key && n.key === active ? 'active' : ''}">${esc(n.label)}</a>`).join('')}</nav>
    <button class="btn ghost sm theme-btn" title="切换深浅色" aria-label="切换深浅色"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg></button>
  </div>`;
  el.querySelector('.theme-btn').onclick = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
  };
  document.body.prepend(el);
}

// Simple tab switcher: buttons with data-tab, panels with data-panel. Remembers via location.hash.
export function tabs(container, onChange) {
  const buttons = [...container.querySelectorAll('.tabs [data-tab]')];
  const panels = [...container.querySelectorAll('[data-panel]')];
  const show = (key) => {
    if (!buttons.some((b) => b.dataset.tab === key)) key = buttons[0].dataset.tab;
    buttons.forEach((b) => b.classList.toggle('active', b.dataset.tab === key));
    panels.forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== key));
    onChange?.(key);
  };
  buttons.forEach((b) => (b.onclick = () => { history.replaceState(null, '', '#' + b.dataset.tab); show(b.dataset.tab); }));
  show(location.hash.slice(1));
  return show;
}

export function fail(e) {
  console.error(e);
  toast(e.message || String(e));
}

// Keep long-running local CLI work visible even when its original button scrolls away.
let aiStatusEl;
const aiTasks = new Map();
let aiTimer;
function renderAIStatus() {
  if (!aiStatusEl) {
    aiStatusEl = document.createElement('div');
    aiStatusEl.className = 'ai-status hidden';
    aiStatusEl.setAttribute('role', 'status');
    aiStatusEl.setAttribute('aria-live', 'polite');
    document.body.append(aiStatusEl);
  }
  const entries = [...aiTasks.values()];
  aiStatusEl.classList.toggle('hidden', !entries.length);
  aiStatusEl.innerHTML = entries.map(task => `<div class="ai-status-row ${task.state}"><span class="ai-status-icon" aria-hidden="true"></span><span>${esc(task.label)}${task.state === 'running' ? ` · ${Math.floor((Date.now() - task.started) / 1000)} 秒` : task.state === 'done' ? ' · 已完成' : ` · 失败：${esc(task.error)}`}</span>${task.state === 'error' ? `<button type="button" class="btn ghost sm" data-ai-close="${task.id}" aria-label="关闭错误提示">×</button>` : ''}</div>`).join('');
  aiStatusEl.querySelectorAll('[data-ai-close]').forEach(button => button.onclick = () => { aiTasks.delete(Number(button.dataset.aiClose)); renderAIStatus(); });
  if (entries.some(task => task.state === 'running')) {
    if (!aiTimer) aiTimer = setInterval(renderAIStatus, 1000);
  } else if (aiTimer) { clearInterval(aiTimer); aiTimer = null; }
}
let nextAIId = 0;
export function beginAI(label) {
  const id = ++nextAIId;
  aiTasks.set(id, { id, label, started: Date.now(), state: 'running' });
  renderAIStatus();
  return (error = null) => {
    const task = aiTasks.get(id);
    if (!task) return;
    task.state = error ? 'error' : 'done';
    task.error = error?.message || String(error || '');
    renderAIStatus();
    if (!error) setTimeout(() => { if (aiTasks.get(id) === task) { aiTasks.delete(id); renderAIStatus(); } }, 4500);
  };
}

export async function trackAI(label, work) {
  const finish = beginAI(label);
  try { const value = await work(); finish(); return value; }
  catch (error) { finish(error); throw error; }
}
