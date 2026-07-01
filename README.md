# nuwa-free

**女娲免费 AI 工具工作流** —— 为 ReyMao 的网站设计、AI 产品原型、商业表达和内容生产精选的 8 个免费/有免费额度工具。

> 核查时间：2026-06-30
> 来源：使用 Playwright 核查 30 个 AI 工具官网/定价页后，筛选出最适合 UI/网站设计师与 AI 项目落地的 8 个。

## 目录

- [为什么叫 nuwa-free](#为什么叫-nuwa-free)
- [8 个核心工具](#8-个核心工具)
- [推荐工作流](#推荐工作流)
- [每个工具怎么用](#每个工具怎么用)
- [使用建议](#使用建议)
- [本仓库内容](#本仓库内容)
- [安装与使用 (macOS / Windows)](#安装与使用-macos--windows)
- [本地预览](#本地预览)
- [作者](#作者)
- [License](#license)

## 为什么叫 nuwa-free

“女娲”代表创造、修补和生成。这个清单不是泛泛收集 AI 工具，而是围绕一个真实工作流：

```text
调研方向 → 梳理结构 → 做方案 → 生成页面 → 构建原型 → 精修代码 → 处理视觉素材 → 上线
```

## 8 个核心工具

| # | 工具 | 地址 | 主要用途 | 免费情况 | 是否注册 |
|---:|---|---|---|---|---|
| 1 | Cursor | https://cursor.com/ | AI 编程、修代码、接 API、性能优化 | Hobby 免费，有限 Agent/Tab | AI 功能建议登录 |
| 2 | v0 | https://v0.app/ | 高质量前端页面/组件生成 | Free 计划，credits | 需要 |
| 3 | Bolt.new | https://bolt.new/ | 对话式建网站/应用原型 | Free $0，tokens 限额 | 需要 |
| 4 | Krea | https://www.krea.ai/ | 实时图像生成、视觉风格探索 | Free plan，daily credits | 需要 |
| 5 | Gamma | https://gamma.app/zh-cn | AI PPT、商业方案、网页式演示 | Free 计划，有限额度 | 需要 |
| 6 | Napkin | https://www.napkin.ai/ | 文本转信息图/流程图/商业模型图 | Free Forever，500 AI credits/week | 需要 |
| 7 | Perplexity | https://www.perplexity.ai/ | AI 搜索、竞品/趋势/技术调研 | 基础搜索免费 | 基础可选，高级需要 |
| 8 | Clipdrop | https://clipdrop.co/ | 去背景、清理、补光、放大、文字移除 | Free plan，多工具每日限额 | 部分免登录，更多额度需登录 |

## 推荐工作流

### 网站 / 产品原型

```text
Perplexity 调研产品方向和竞品
↓
Napkin 把信息结构变成图
↓
Gamma 生成商业方案或展示稿
↓
v0 生成高质量前端页面
↓
Bolt.new 生成可运行应用原型
↓
Cursor 精修代码、优化性能、接入 API
↓
Krea / Clipdrop 处理视觉素材
↓
部署上线
```

### 内容 / 商业表达

```text
Perplexity 找资料和来源
↓
Napkin 生成逻辑图/信息图
↓
Gamma 做成演示文稿
↓
Krea 生成视觉封面
↓
Clipdrop 清理素材
```

## 每个工具怎么用

### 1. Cursor

- 地址：https://cursor.com/
- 适合：本地代码开发、AI 修 bug、重构、接 API、优化网站性能。
- 免费：Hobby 免费；有限 Agent 请求和 Tab 补全。
- 推荐用法：把 v0 / Bolt 生成的代码拉到本地，用 Cursor 精修到可上线。

示例提示词：

```text
请检查这个 Next.js 页面性能问题，减少不必要的 JS，优先使用 CSS 动画，保持视觉效果不变。
```

### 2. v0

- 地址：https://v0.app/
- 适合：Landing Page、Dashboard、组件、SaaS 官网、个人品牌页。
- 免费：Free 计划，含 credits。
- 推荐用法：先用它做“高级感前端初稿”。

示例提示词：

```text
设计一个高级感 AI 工具导航网站首页，风格参考 Linear + Vercel，深色科技风，包含 Hero、分类卡片、工具排行榜、订阅 CTA。
```

### 3. Bolt.new

- 地址：https://bolt.new/
- 适合：从一句话生成可运行网站或 Web App 原型。
- 免费：Free $0；有每日/月度 tokens 限额。
- 推荐用法：当你想要的不只是页面，而是完整可运行原型，用 Bolt。

示例提示词：

```text
帮我做一个 AI 工具目录网站，支持分类筛选、搜索、收藏、本地数据 JSON 驱动，使用现代深色 UI。
```

### 4. Krea

- 地址：https://www.krea.ai/
- 适合：Hero 图、网站背景、视觉 moodboard、产品概念图、图像增强。
- 免费：Free plan，daily credits。
- 推荐用法：为网站和方案快速生成高质量视觉素材。

示例提示词：

```text
A premium futuristic AI workspace, dark background, glassmorphism panels, blue and purple glow, cinematic lighting, ultra clean, suitable for SaaS landing page hero image.
```

### 5. Gamma

- 地址：https://gamma.app/zh-cn
- 适合：PPT、商业方案、项目汇报、AI 分享课件、网页式文档。
- 免费：Free 计划，注册有限额度。
- 推荐用法：把你的管理经验、AI 方法论、项目方案快速包装成演示稿。

示例提示词：

```text
把“AI 工具如何提升个人生产力”整理成 10 页中文演示文稿，面向企业管理层，风格高级、逻辑清晰、每页一个核心观点。
```

### 6. Napkin

- 地址：https://www.napkin.ai/
- 适合：流程图、信息图、管理模型图、方法论图解、公众号/小红书配图。
- 免费：Free Forever，500 AI credits/week。
- 推荐用法：把复杂经验变成“看得懂、可传播”的视觉模型。

示例提示词：

```text
把这段文字变成一张高级商务信息图：AI 赋能个人生产力 = 搜索调研、内容生成、视觉设计、代码开发、自动化执行。
```

### 7. Perplexity

- 地址：https://www.perplexity.ai/
- 适合：带来源的 AI 搜索、竞品分析、趋势调研、技术选型。
- 免费：基础搜索免费。
- 推荐用法：做任何项目之前先用它判断方向和事实。

示例提示词：

```text
请调研 2026 年适合独立开发者构建 AI 工具导航站的技术栈，给出优缺点和来源链接。
```

### 8. Clipdrop

- 地址：https://clipdrop.co/
- 适合：去背景、图片清理、补光、文字移除、图片放大、替换背景。
- 免费：Free plan，多数工具有每日限额。
- 推荐用法：替代轻量 Photoshop 工作，快速处理网站素材。

示例场景：

```text
客户头像去背景、产品图清理、网站配图修复、社媒图快速处理。
```

## 使用建议

1. 先注册：Cursor、v0、Bolt.new、Krea、Gamma、Napkin、Perplexity、Clipdrop。
2. 免费额度通常会变化，重要项目上线前重新检查定价页。
3. 商业项目要特别注意：图片、音乐、声音克隆、模型生成内容的授权条款。
4. 生成型工具适合出初稿，最终上线前仍要人工检查性能、版权、错别字、合规性。

## 本仓库内容

```text
README.md                     中文说明和工作流
index.html                    可视化单页说明
nuwa-free-tools.json          8 个工具结构化数据
nuwa-free-tools.schema.json   JSON Schema 数据结构定义
package.json                  Node CLI 元数据 (author: ReyMao)
cli/nuwa-free.mjs             跨平台 CLI (validate / preview / build)
.gitignore                    忽略 OS/编辑器/日志/node_modules 等
LICENSE                       MIT 许可证 (© 2026 ReyMao)
```

## 安装与使用 (macOS / Windows)

本仓库带一个**跨平台 Node CLI**（Node 18+，零运行时依赖），在 macOS 与 Windows 上命令**完全一致**。

### 环境要求

- Node.js 18 或以上（`node -v` 应输出 `v18.x` 及以上）
- 无需 Python，无需 Ruby，无需 Go

### 安装

```bash
# macOS / Linux（zsh / bash）
git clone https://github.com/reymondmeking-dot/nuwa-free.git
cd nuwa-free
npm install
```

```powershell
# Windows（PowerShell 或 Git Bash 皆可）
git clone https://github.com/reymondmeking-dot/nuwa-free.git
cd nuwa-free
npm install
```

> `npm install` 目前**不引入任何生产依赖**（`package.json` 里没有 `dependencies`），只是初始化 lockfile 和 `node_modules/.bin/nuwa-free` 链接。若跳过此步，也可以直接 `node cli/nuwa-free.mjs <command>`。

### 常用命令（macOS 与 Windows 相同）

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动本地静态服务器，浏览器打开 <http://localhost:8080/> |
| `npm run preview` | 同上，语义化别名 |
| `npm run validate` | 用 JSON Schema 校验 `nuwa-free-tools.json` |
| `npm run build` | 静态站点，无需构建（占位命令） |
| `npx nuwa-free --help` | 查看 CLI 用法 |
| `node cli/nuwa-free.mjs preview --port 3000` | 自定义端口 |

### macOS 备注

- 端口 8080 若被占用，运行 `node cli/nuwa-free.mjs preview --port 8081`。
- 若曾用 `python -m http.server` 预览过、想改用 CLI，直接 `npm run dev` 即可，二者等价。

### Windows 备注

- CLI 用 Node 内置 `http` 起服务，**不依赖** `python` / `python3`，Windows 上没装 Python 也能跑。
- 推荐使用 PowerShell、Windows Terminal 或 Git Bash。命令与 macOS 完全一致，无需 `Set-ExecutionPolicy`（本仓库不提供 `.ps1` 脚本）。
- 若 Windows Defender / 防火墙首次弹窗询问是否允许 Node 监听本地端口，选择“允许专用网络”即可。

## 本地预览

推荐使用内置 CLI：

```bash
npm run dev
# 或
node cli/nuwa-free.mjs preview
```

浏览器打开 <http://localhost:8080/> 即可查看。

如果暂时不想装 npm，也可用替代方案：

```bash
# Node（无需全局安装）
npx --yes serve -l 8080 .

# Python 3（若本机已装）
python -m http.server 8080
```

想直接双击 `index.html` 打开也可以，但通过本地服务器访问才能保证 `nuwa-free-tools.json` 的相对路径链接工作正常。

## 作者

- **ReyMao** — 项目发起人 / 维护者
- 仓库：<https://github.com/reymondmeking-dot/nuwa-free>

本仓库中所有工具选择、工作流描述、图文与代码，均围绕 ReyMao 的 UI / 网站 / AI 项目落地场景整理和维护。

## License

本项目采用 [MIT License](LICENSE) 开源，Copyright © 2026 **ReyMao**。
