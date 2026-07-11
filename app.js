const elements = {
  toolCount: document.querySelector('#toolCount'),
  search: document.querySelector('#toolSearch'),
  category: document.querySelector('#categoryFilter'),
  clear: document.querySelector('#clearFilter'),
  summary: document.querySelector('#resultSummary'),
  grid: document.querySelector('#toolGrid'),
}

const collator = new Intl.Collator('zh-CN', { sensitivity: 'base' })
let tools = []
let toolOrder = new Map()

function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('zh-CN')
}

function isTool(value) {
  return value &&
    typeof value.name === 'string' &&
    typeof value.url === 'string' &&
    typeof value.category === 'string' &&
    typeof value.free === 'string' &&
    typeof value.registration === 'string' &&
    Array.isArray(value.best_for) &&
    typeof value.why_useful_for_reymao === 'string'
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

function createTag(text, variant = '') {
  const tag = document.createElement('span')
  tag.className = `tag${variant ? ` ${variant}` : ''}`
  tag.textContent = text
  return tag
}

function createToolCard(tool, index) {
  const article = document.createElement('article')
  article.className = 'tool'

  const top = document.createElement('div')
  top.className = 'toolTop'
  const title = document.createElement('h3')
  title.textContent = tool.name
  const number = document.createElement('span')
  number.className = 'num'
  number.textContent = `#${String(index + 1).padStart(2, '0')}`
  top.append(title, number)

  const tags = document.createElement('div')
  tags.className = 'tags'
  tags.append(createTag(tool.category), createTag(tool.free, 'free'))

  const registration = document.createElement('p')
  const registrationLabel = document.createElement('strong')
  registrationLabel.textContent = '注册：'
  registration.append(registrationLabel, tool.registration)

  const description = document.createElement('p')
  description.textContent = tool.why_useful_for_reymao

  const useList = document.createElement('ul')
  for (const use of tool.best_for) {
    const item = document.createElement('li')
    item.textContent = String(use)
    useList.append(item)
  }

  const href = safeExternalUrl(tool.url)
  const link = document.createElement('a')
  link.className = 'open'
  link.textContent = href ? `打开 ${tool.name}` : '网址不可用'
  if (href) {
    link.href = href
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.setAttribute('aria-label', `打开 ${tool.name} 官网（新窗口）`)
  } else {
    link.setAttribute('aria-disabled', 'true')
  }

  article.append(top, tags, registration, description, useList, link)
  return article
}

function updateUrl(query, category) {
  const url = new URL(window.location.href)
  if (query) url.searchParams.set('q', query)
  else url.searchParams.delete('q')
  if (category) url.searchParams.set('category', category)
  else url.searchParams.delete('category')
  window.history.replaceState(null, '', url)
}

function render() {
  const query = elements.search.value.trim()
  const category = elements.category.value
  const normalizedQuery = normalize(query)
  const filtered = tools.filter((tool) => {
    if (category && tool.category !== category) return false
    if (!normalizedQuery) return true
    const haystack = normalize([
      tool.name,
      tool.category,
      tool.free,
      tool.registration,
      tool.why_useful_for_reymao,
      ...tool.best_for,
    ].join(' '))
    return haystack.includes(normalizedQuery)
  })

  const fragment = document.createDocumentFragment()
  filtered.forEach((tool) => fragment.append(createToolCard(tool, toolOrder.get(tool) ?? 0)))
  elements.grid.replaceChildren(fragment)
  elements.grid.setAttribute('aria-busy', 'false')
  elements.clear.disabled = !query && !category
  elements.summary.textContent = filtered.length
    ? `显示 ${filtered.length} / ${tools.length} 个工具`
    : '没有匹配的工具，请调整关键词或分类。'
  elements.grid.classList.toggle('is-empty', filtered.length === 0)
  updateUrl(query, category)
}

function showLoadError(error) {
  elements.grid.setAttribute('aria-busy', 'false')
  elements.grid.replaceChildren()
  const message = document.createElement('div')
  message.className = 'empty-state'
  message.textContent = `工具数据加载失败：${error instanceof Error ? error.message : String(error)}`
  const link = document.createElement('a')
  link.href = './nuwa-free-tools.json'
  link.textContent = '直接打开 JSON 数据'
  message.append(document.createElement('br'), link)
  elements.grid.append(message)
  elements.summary.textContent = '加载失败'
}

async function init() {
  try {
    const response = await fetch('./nuwa-free-tools.json')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data) || !data.every(isTool)) throw new Error('JSON 数据结构不完整')
    tools = [...data]
    toolOrder = new Map(tools.map((tool, index) => [tool, index]))
    elements.toolCount.textContent = String(tools.length)

    const categories = [...new Set(tools.map((tool) => tool.category))].sort(collator.compare)
    for (const category of categories) {
      const option = document.createElement('option')
      option.value = category
      option.textContent = category
      elements.category.append(option)
    }

    const params = new URLSearchParams(window.location.search)
    elements.search.value = params.get('q') ?? ''
    const requestedCategory = params.get('category') ?? ''
    if (categories.includes(requestedCategory)) elements.category.value = requestedCategory
    render()
  } catch (error) {
    showLoadError(error)
  }
}

elements.search.addEventListener('input', render)
elements.category.addEventListener('change', render)
elements.clear.addEventListener('click', () => {
  elements.search.value = ''
  elements.category.value = ''
  render()
  elements.search.focus()
})

window.addEventListener('keydown', (event) => {
  const target = event.target
  const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
  if (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault()
    elements.search.focus()
  }
})

void init()
