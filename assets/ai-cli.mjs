import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const provider = process.env.PRACTISE_AI_CLI || 'claude';
if (!['claude', 'codex'].includes(provider)) throw new Error('PRACTISE_AI_CLI 只能是 claude 或 codex');
const timeoutMs = Number(process.env.PRACTISE_AI_TIMEOUT_MS || 300000);
const maxOutput = 4 * 1024 * 1024;

function parseJson(text) {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(clean);
}

export async function askJson(prompt, schema, options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'practise-ai-'));
  const outFile = join(dir, 'answer.json');
  const schemaFile = join(dir, 'schema.json');
  const limitMs = options.timeoutMs || timeoutMs;
  const bin = provider === 'claude' ? process.env.PRACTISE_CLAUDE_BIN || 'claude' : process.env.PRACTISE_CODEX_BIN || 'codex';
  // Claude defaults to sonnet unless the caller asks for another model (system design uses opus);
  // PRACTISE_CLAUDE_MODEL overrides both. Codex uses its own default unless PRACTISE_CODEX_MODEL is set.
  const model = provider === 'claude'
    ? process.env.PRACTISE_CLAUDE_MODEL || options.claudeModel || 'sonnet'
    : process.env.PRACTISE_CODEX_MODEL;
  const args = provider === 'claude'
    ? ['-p', '--output-format', 'json', '--tools', '', '--no-session-persistence', '--json-schema', JSON.stringify(schema)]
    : ['exec', '--skip-git-repo-check', '--ephemeral', '--ignore-user-config', '--sandbox', 'read-only', '--output-schema', schemaFile, '--output-last-message', outFile, '-'];
  if (model) args.splice(provider === 'codex' ? args.length - 1 : args.length, 0, '--model', model);
  try {
    if (provider === 'codex') await writeFile(schemaFile, JSON.stringify(schema));
    const result = await new Promise((resolve, reject) => {
      const child = spawn(bin, args, { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '', stderr = '', finished = false;
      const done = (error, value) => { if (finished) return; finished = true; clearTimeout(timer); error ? reject(error) : resolve(value); };
      const timer = setTimeout(() => { child.kill('SIGTERM'); done(new Error(`${provider} CLI 超时（${Math.round(limitMs / 1000)} 秒）`)); }, limitMs);
      child.on('error', e => done(new Error(`无法启动 ${provider} CLI：${e.message}`)));
      child.stdout.on('data', d => { stdout += d; if (stdout.length > maxOutput) { child.kill('SIGTERM'); done(new Error('AI 输出过大')); } });
      child.stderr.on('data', d => { stderr += d; if (stderr.length > maxOutput) stderr = stderr.slice(-maxOutput); });
      child.on('close', code => done(code === 0 ? null : new Error(`${provider} CLI 退出码 ${code}：${stderr.trim().slice(-500)}`), stdout));
      child.stdin.on('error', () => {});
      child.stdin.end(`${prompt}\n\n只输出一个符合要求的 JSON 对象，不要 Markdown 或其他文字。`);
    });
    if (provider === 'claude') {
      const envelope = parseJson(result);
      if (envelope.is_error || envelope.subtype !== 'success') throw new Error(`claude CLI 失败：${String(envelope.result || envelope.subtype).slice(0, 400)}`);
      return { output: envelope.structured_output ?? parseJson(envelope.result), provider, model: Object.keys(envelope.modelUsage || {}).at(-1) || model || null, costUsd: envelope.total_cost_usd ?? null, durationMs: envelope.duration_ms ?? null };
    }
    return { output: parseJson(await readFile(outFile, 'utf8')), provider, model: model || null, costUsd: null, durationMs: null };
  } finally { await rm(dir, { recursive: true, force: true }); }
}

export function respond(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

export async function bodyJson(req, limit = 200_000) {
  let raw = '';
  for await (const part of req) { raw += part; if (raw.length > limit) throw new Error('请求内容过大'); }
  return JSON.parse(raw);
}
