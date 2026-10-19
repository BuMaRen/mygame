// Local server for the practise site: serves static files and persists each
// skill's data as JSON under <skill>/data/<name>.json so progress lives in git.
// A skill can add its own endpoints by exporting handle() from <skill>/api.mjs,
// reached at /api/<skill>/<action>.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, normalize, extname, dirname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PRACTISE_PORT || process.argv[2] || 4600);
const HOST = process.env.PRACTISE_HOST || '127.0.0.1';
const NAME = /^[a-z0-9-]+$/;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function sendJson(res, code, data) {
  send(res, code, JSON.stringify(data), TYPES['.json']);
}

const skillApis = new Map();
async function skillApi(skill) {
  if (!skillApis.has(skill)) {
    const file = join(ROOT, skill, 'api.mjs');
    skillApis.set(skill, stat(file).then(() => import(pathToFileURL(file).href), () => null));
  }
  return skillApis.get(skill);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 5 * 1024 * 1024) throw new Error('body too large');
    chunks.push(c);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function handleData(req, res, skill, name) {
  if (!NAME.test(skill) || !NAME.test(name)) return send(res, 400, 'bad name');
  const skillDir = join(ROOT, skill);
  try {
    if (!(await stat(skillDir)).isDirectory()) throw new Error();
  } catch {
    return send(res, 404, 'unknown skill');
  }
  const file = join(skillDir, 'data', `${name}.json`);

  if (req.method === 'GET') {
    try {
      return send(res, 200, await readFile(file), TYPES['.json']);
    } catch {
      return send(res, 200, 'null', TYPES['.json']); // no data yet
    }
  }
  if (req.method === 'PUT') {
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch (e) {
      return send(res, 400, `invalid JSON: ${e.message}`);
    }
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data, null, 2) + '\n');
    return send(res, 204, '');
  }
  return send(res, 405, 'method not allowed');
}

async function handleStatic(res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = normalize(join(ROOT, rel));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return send(res, 403, 'forbidden');
  if (file.split(sep).includes('.git')) return send(res, 403, 'forbidden');
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      res.writeHead(301, { Location: pathname.replace(/\/?$/, '/') });
      return res.end();
    }
    return send(res, 200, await readFile(file), TYPES[extname(file)] || 'application/octet-stream');
  } catch {
    return send(res, 404, 'not found');
  }
}

createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    const m = pathname.match(/^\/api\/data\/([^/]+)\/([^/]+)$/);
    if (m) return await handleData(req, res, m[1], m[2]);
    const a = pathname.match(/^\/api\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (a) {
      const mod = await skillApi(a[1]);
      if (!mod) return send(res, 404, 'unknown api');
      return await mod.handle(req, res, a[2], new URL(req.url, 'http://localhost'), { send, sendJson, readBody });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed');
    return await handleStatic(res, pathname);
  } catch (e) {
    console.error(e);
    send(res, 500, 'server error');
  }
}).listen(PORT, HOST, () => {
  console.log(`practise → http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/`);
});
