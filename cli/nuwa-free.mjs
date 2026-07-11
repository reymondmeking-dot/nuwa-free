#!/usr/bin/env node
// nuwa-free CLI — cross-platform (macOS / Windows / Linux), Node 18+, zero deps.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const DIST_ROOT = path.resolve(REPO_ROOT, 'dist')
const PUBLIC_FILES = [
  'index.html',
  'styles.css',
  'app.js',
  'nuwa-free-tools.json',
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}
const supportsColor = process.stdout.isTTY && !process.env.NO_COLOR
const color = (name, value) => supportsColor ? `${COLORS[name]}${value}${COLORS.reset}` : String(value)

function printHelp() {
  process.stdout.write(`${color('bold', 'nuwa-free')} — 女娲免费 AI 工具目录 CLI

${color('bold', '用法:')}
  nuwa-free <command> [options]

${color('bold', '命令:')}
  ${color('cyan', 'validate')}              用 JSON Schema 校验工具数据
  ${color('cyan', 'check-html')}            校验页面元数据与资源引用
  ${color('cyan', 'preview')} [--port N]    启动本机静态服务器（默认 8080）
  ${color('cyan', 'build')}                 生成仅含公开站点文件的 dist/
  ${color('cyan', '--help, -h')}            显示本帮助

${color('bold', '示例:')}
  npm run check
  npm run dev
  node cli/nuwa-free.mjs preview --port 3000
`)
}

function validateAgainstSchema(data, schema, dataPath = '') {
  const errors = []
  const push = (message) => errors.push(`${dataPath || '<root>'}: ${message}`)

  if (schema.type === 'array') {
    if (!Array.isArray(data)) {
      push(`应为 array，实际为 ${typeof data}`)
      return errors
    }
    if (typeof schema.minItems === 'number' && data.length < schema.minItems) {
      push(`数组长度 ${data.length} 小于 minItems ${schema.minItems}`)
    }
    if (schema.items) {
      data.forEach((item, index) => {
        errors.push(...validateAgainstSchema(item, schema.items, `${dataPath}[${index}]`))
      })
    }
    return errors
  }

  if (schema.type === 'object') {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      push('应为 object')
      return errors
    }
    for (const key of schema.required || []) {
      if (!(key in data)) push(`缺少必填字段 "${key}"`)
    }
    const properties = schema.properties || {}
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in properties)) push(`出现未声明字段 "${key}"`)
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in data) {
        errors.push(...validateAgainstSchema(data[key], childSchema, dataPath ? `${dataPath}.${key}` : key))
      }
    }
    return errors
  }

  if (schema.type === 'string') {
    if (typeof data !== 'string') {
      push(`应为 string，实际为 ${typeof data}`)
      return errors
    }
    if (typeof schema.minLength === 'number' && data.length < schema.minLength) {
      push(`字符串长度 ${data.length} 小于 minLength ${schema.minLength}`)
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      push(`不匹配 pattern ${schema.pattern}`)
    }
    if (schema.format === 'uri') {
      try {
        new URL(data)
      } catch {
        push(`不是合法 URI: ${data}`)
      }
    }
    return errors
  }

  if (schema.type === 'number' && typeof data !== 'number') push('应为 number')
  if (schema.type === 'integer' && (!Number.isInteger(data))) push('应为 integer')
  if (schema.type === 'boolean' && typeof data !== 'boolean') push('应为 boolean')
  return errors
}

function readJson(filename) {
  const filePath = path.join(REPO_ROOT, filename)
  if (!fs.existsSync(filePath)) throw new Error(`找不到 ${filename}`)
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`${filename} 不是合法 JSON: ${error.message}`)
  }
}

function validateData({ quiet = false } = {}) {
  let data
  let schema
  try {
    data = readJson('nuwa-free-tools.json')
    schema = readJson('nuwa-free-tools.schema.json')
  } catch (error) {
    if (!quiet) console.error(color('red', `✗ ${error.message}`))
    return { ok: false, count: 0, errors: [error.message] }
  }

  const errors = validateAgainstSchema(data, schema)
  if (!quiet) {
    if (errors.length === 0) {
      console.log(color('green', '✓ validate OK') + `  (${data.length} 条工具通过 schema 校验)`)
    } else {
      console.error(color('red', `✗ validate FAILED  (${errors.length} 处错误)`))
      errors.forEach((message) => console.error(`  - ${message}`))
    }
  }
  return { ok: errors.length === 0, count: Array.isArray(data) ? data.length : 0, errors }
}

function checkHtml({ quiet = false } = {}) {
  const htmlPath = path.join(REPO_ROOT, 'index.html')
  if (!fs.existsSync(htmlPath)) {
    if (!quiet) console.error(color('red', '✗ 找不到 index.html'))
    return false
  }
  const html = fs.readFileSync(htmlPath, 'utf8')
  const checks = [
    ['lang=zh-CN', /<html\b[^>]*lang=["']zh-CN["']/i.test(html)],
    ['非空 title', /<title>\s*[^<]+\s*<\/title>/i.test(html)],
    ['viewport', /<meta\b[^>]*name=["']viewport["']/i.test(html)],
    ['description', /<meta\b[^>]*name=["']description["']/i.test(html)],
    ['canonical', /<link\b[^>]*rel=["']canonical["']/i.test(html)],
    ['styles.css', /href=["']\.\/styles\.css["']/i.test(html)],
    ['app.js module', /<script\b[^>]*type=["']module["'][^>]*src=["']\.\/app\.js["']/i.test(html)],
    ['toolGrid 容器', /id=["']toolGrid["']/i.test(html)],
    ['无重复硬编码 tools 数组', !/const\s+tools\s*=\s*\[/i.test(html)],
  ]
  const missingFiles = PUBLIC_FILES.filter((file) => !fs.existsSync(path.join(REPO_ROOT, file)))
  const failed = checks.filter(([, ok]) => !ok).map(([label]) => label)
  failed.push(...missingFiles.map((file) => `缺少 ${file}`))

  if (!quiet) {
    checks.forEach(([label, ok]) => console.log(`  [${ok ? color('green', 'PASS') : color('red', 'FAIL')}] ${label}`))
    if (missingFiles.length) missingFiles.forEach((file) => console.log(`  [${color('red', 'FAIL')}] 缺少 ${file}`))
    console.log(failed.length ? color('red', `✗ HTML 检查失败 (${failed.length})`) : color('green', '✓ HTML 检查通过'))
  }
  return failed.length === 0
}

function parsePreviewOptions(args) {
  let port = 8080
  let host = '127.0.0.1'
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--port' || arg === '-p') port = Number.parseInt(args[++index], 10)
    else if (arg.startsWith('--port=')) port = Number.parseInt(arg.slice(7), 10)
    else if (arg === '--host') host = args[++index]
    else if (arg.startsWith('--host=')) host = arg.slice(7)
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) throw new Error(`非法端口: ${port}`)
  if (!host || !/^[a-zA-Z0-9.:-]+$/.test(host)) throw new Error(`非法 host: ${host}`)
  return { port, host }
}

function publicFileFromUrl(urlValue) {
  try {
    const pathname = decodeURIComponent(new URL(urlValue || '/', 'http://localhost').pathname)
    const filename = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
    if (!PUBLIC_FILES.includes(filename)) return null
    const filePath = path.join(DIST_ROOT, filename)
    const fileStat = fs.lstatSync(filePath)
    if (!fileStat.isFile() || fileStat.isSymbolicLink()) return null
    const realPath = fs.realpathSync(filePath)
    if (!realPath.startsWith(DIST_ROOT + path.sep)) return null
    return realPath
  } catch {
    return null
  }
}

function cmdPreview(args) {
  if (!buildPublicSite({ quiet: true })) {
    console.error(color('red', '[preview] 无法生成安全预览目录，请先运行 npm run check'))
    process.exitCode = 1
    return
  }
  let options
  try {
    options = parsePreviewOptions(args)
  } catch (error) {
    console.error(color('red', `[preview] ${error.message}`))
    process.exitCode = 2
    return
  }

  const server = http.createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end('405 Method Not Allowed')
      return
    }
    const target = publicFileFromUrl(request.url)
    if (!target) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found')
      return
    }
    fs.readFile(target, (error, buffer) => {
      if (error) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found')
        return
      }
      response.writeHead(200, {
        'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
      })
      response.end(request.method === 'HEAD' ? undefined : buffer)
    })
  })

  server.on('error', (error) => {
    const message = error.code === 'EADDRINUSE'
      ? `端口 ${options.port} 已被占用，请使用 --port 指定其它端口`
      : error.message
    console.error(color('red', `[preview] ${message}`))
    process.exit(1)
  })

  server.listen(options.port, options.host, () => {
    console.log(color('green', '✓ nuwa-free preview'))
    console.log(`  open: ${color('cyan', `http://${options.host}:${options.port}/`)}`)
    console.log(color('gray', '  默认只允许访问公开站点文件；按 Ctrl+C 停止'))
  })

  const stop = () => server.close(() => process.exit(0))
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
}

function buildPublicSite({ quiet = false } = {}) {
  const dataResult = validateData({ quiet: true })
  const htmlOk = checkHtml({ quiet: true })
  if (!dataResult.ok || !htmlOk) {
    if (!quiet) console.error(color('red', '✗ build 失败：请先运行 npm run check 查看详情'))
    return false
  }
  if (DIST_ROOT !== path.join(REPO_ROOT, 'dist') || !DIST_ROOT.startsWith(REPO_ROOT + path.sep)) {
    throw new Error(`拒绝清理非预期目录: ${DIST_ROOT}`)
  }
  for (const file of PUBLIC_FILES) {
    const source = path.join(REPO_ROOT, file)
    const sourceStat = fs.lstatSync(source)
    const realSource = fs.realpathSync(source)
    if (!sourceStat.isFile() || sourceStat.isSymbolicLink() || !realSource.startsWith(REPO_ROOT + path.sep)) {
      if (!quiet) console.error(color('red', `✗ 拒绝发布非普通仓库文件: ${file}`))
      return false
    }
  }
  fs.rmSync(DIST_ROOT, { recursive: true, force: true })
  fs.mkdirSync(DIST_ROOT, { recursive: true })
  PUBLIC_FILES.forEach((file) => fs.copyFileSync(path.join(REPO_ROOT, file), path.join(DIST_ROOT, file)))
  if (!quiet) console.log(color('green', `✓ build 完成`) + `  (${PUBLIC_FILES.length} 个公开文件 → dist/)`)
  return true
}

function cmdBuild() {
  if (!buildPublicSite()) process.exitCode = 1
}

function main() {
  const [command, ...rest] = process.argv.slice(2)
  if (!command || command === '-h' || command === '--help' || command === 'help') {
    printHelp()
    return
  }
  switch (command) {
    case 'validate':
      if (!validateData().ok) process.exitCode = 1
      break
    case 'check-html':
      if (!checkHtml()) process.exitCode = 1
      break
    case 'preview':
    case 'dev':
      cmdPreview(rest)
      break
    case 'build':
      cmdBuild()
      break
    default:
      console.error(color('red', `未知命令: ${command}`))
      printHelp()
      process.exitCode = 2
  }
}

main()
