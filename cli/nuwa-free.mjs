#!/usr/bin/env node
// nuwa-free CLI — cross-platform (macOS / Windows / Linux), Node 18+, zero deps.
// Author: ReyMao
// License: MIT
//
// 子命令：
//   nuwa-free validate            —— 用内置 schema 校验 nuwa-free-tools.json
//   nuwa-free preview [--port N]  —— 启动本地静态服务器（Node 内置 http，不依赖 python）
//   nuwa-free build               —— 静态站点占位符，无需构建
//   nuwa-free --help              —— 使用说明

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};
const supportsColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (name, s) => (supportsColor ? `${COLORS[name]}${s}${COLORS.reset}` : s);

// ---------------------------------------------------------------------------
// help
// ---------------------------------------------------------------------------
function printHelp() {
  const lines = [
    `${c('bold', 'nuwa-free')} — 女娲免费 AI 工具清单 CLI (author: ReyMao)`,
    '',
    `${c('bold', '用法:')}`,
    '  nuwa-free <command> [options]',
    '',
    `${c('bold', '命令:')}`,
    `  ${c('cyan', 'validate')}            用 JSON Schema 校验 nuwa-free-tools.json`,
    `  ${c('cyan', 'preview')} [--port N]  启动本地静态服务器 (默认 8080)`,
    `  ${c('cyan', 'build')}               静态站点，无需构建`,
    `  ${c('cyan', '--help, -h')}          显示本帮助`,
    '',
    `${c('bold', '示例:')}`,
    '  npm run dev                       # = nuwa-free preview',
    '  npm run validate                  # = nuwa-free validate',
    '  node cli/nuwa-free.mjs preview --port 3000',
    ''
  ];
  process.stdout.write(lines.join('\n'));
}

// ---------------------------------------------------------------------------
// 轻量 JSON Schema 校验器 —— 仅覆盖本仓库 schema 用到的关键字，零依赖
// ---------------------------------------------------------------------------
function validateAgainstSchema(data, schema, dataPath = '') {
  const errs = [];

  const push = (msg) => errs.push(`${dataPath || '<root>'}: ${msg}`);

  const type = schema.type;
  if (type === 'array') {
    if (!Array.isArray(data)) {
      push(`应为 array，实际为 ${typeof data}`);
      return errs;
    }
    if (typeof schema.minItems === 'number' && data.length < schema.minItems) {
      push(`数组长度 ${data.length} 小于 minItems ${schema.minItems}`);
    }
    if (schema.items) {
      data.forEach((item, i) => {
        errs.push(...validateAgainstSchema(item, schema.items, `${dataPath}[${i}]`));
      });
    }
    return errs;
  }

  if (type === 'object') {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      push(`应为 object`);
      return errs;
    }
    const required = schema.required || [];
    for (const key of required) {
      if (!(key in data)) push(`缺少必填字段 "${key}"`);
    }
    const props = schema.properties || {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in props)) push(`出现未声明字段 "${key}"`);
      }
    }
    for (const [key, sub] of Object.entries(props)) {
      if (key in data) {
        errs.push(...validateAgainstSchema(data[key], sub, dataPath ? `${dataPath}.${key}` : key));
      }
    }
    return errs;
  }

  if (type === 'string') {
    if (typeof data !== 'string') {
      push(`应为 string，实际为 ${typeof data}`);
      return errs;
    }
    if (typeof schema.minLength === 'number' && data.length < schema.minLength) {
      push(`字符串长度 ${data.length} 小于 minLength ${schema.minLength}`);
    }
    if (schema.pattern) {
      const re = new RegExp(schema.pattern);
      if (!re.test(data)) push(`不匹配 pattern ${schema.pattern}`);
    }
    if (schema.format === 'uri') {
      try {
        // eslint-disable-next-line no-new
        new URL(data);
      } catch {
        push(`不是合法 URI: ${data}`);
      }
    }
    return errs;
  }

  if (type === 'number' || type === 'integer') {
    if (typeof data !== 'number') push(`应为 ${type}`);
    return errs;
  }

  if (type === 'boolean') {
    if (typeof data !== 'boolean') push(`应为 boolean`);
    return errs;
  }

  return errs;
}

function cmdValidate() {
  const dataPath = path.join(REPO_ROOT, 'nuwa-free-tools.json');
  const schemaPath = path.join(REPO_ROOT, 'nuwa-free-tools.schema.json');

  for (const p of [dataPath, schemaPath]) {
    if (!fs.existsSync(p)) {
      console.error(c('red', `[validate] 找不到 ${p}`));
      process.exit(2);
    }
  }

  let data, schema;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.error(c('red', `[validate] nuwa-free-tools.json 不是合法 JSON: ${e.message}`));
    process.exit(2);
  }
  try {
    schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  } catch (e) {
    console.error(c('red', `[validate] schema 不是合法 JSON: ${e.message}`));
    process.exit(2);
  }

  const errors = validateAgainstSchema(data, schema);
  if (errors.length === 0) {
    const n = Array.isArray(data) ? data.length : 0;
    console.log(c('green', `✓ validate OK`) + `  (${n} 条工具通过 schema 校验)`);
    console.log(c('gray', `  data:   nuwa-free-tools.json`));
    console.log(c('gray', `  schema: nuwa-free-tools.schema.json`));
    process.exit(0);
  } else {
    console.error(c('red', `✗ validate FAILED  (${errors.length} 处错误)`));
    for (const msg of errors) console.error(`  - ${msg}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// preview —— 内置静态服务器
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const normalized = path.normalize(decoded).replace(/^([/\\])+/, '');
  const full = path.join(root, normalized);
  const rel = path.relative(root, full);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return full;
}

function cmdPreview(args) {
  let port = 8080;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' || args[i] === '-p') {
      port = parseInt(args[++i], 10);
    } else if (args[i].startsWith('--port=')) {
      port = parseInt(args[i].slice('--port='.length), 10);
    }
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    console.error(c('red', `[preview] 非法端口: ${port}`));
    process.exit(2);
  }

  const root = REPO_ROOT;
  const server = http.createServer((req, res) => {
    let target = safeJoin(root, req.url || '/');
    if (!target) {
      res.writeHead(403).end('403 Forbidden');
      return;
    }
    fs.stat(target, (err, st) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
        return;
      }
      if (st.isDirectory()) target = path.join(target, 'index.html');
      fs.readFile(target, (e2, buf) => {
        if (e2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
          return;
        }
        const ext = path.extname(target).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache'
        });
        res.end(buf);
      });
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(c('red', `[preview] 端口 ${port} 已被占用，请换端口: nuwa-free preview --port 8081`));
    } else {
      console.error(c('red', `[preview] ${err.message}`));
    }
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(c('green', `✓ nuwa-free preview`) + c('gray', ` (author: ReyMao)`));
    console.log(`  root: ${root}`);
    console.log(`  open: ${c('cyan', `http://localhost:${port}/`)}`);
    console.log(c('gray', `  Ctrl+C 停止`));
  });

  const stop = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

// ---------------------------------------------------------------------------
// build (占位)
// ---------------------------------------------------------------------------
function cmdBuild() {
  console.log(c('green', '✓ build') + '  Static site, no build step needed.');
  console.log(c('gray', '  (纯静态：index.html + JSON + Schema，直接托管到任意静态服务器即可)'));
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------
function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const rest = argv.slice(1);

  if (!cmd || cmd === '-h' || cmd === '--help' || cmd === 'help') {
    printHelp();
    process.exit(0);
  }
  switch (cmd) {
    case 'validate':
      return cmdValidate();
    case 'preview':
    case 'dev':
      return cmdPreview(rest);
    case 'build':
      return cmdBuild();
    default:
      console.error(c('red', `未知命令: ${cmd}`));
      printHelp();
      process.exit(2);
  }
}

main();
