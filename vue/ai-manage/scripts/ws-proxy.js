/**
 * Qwen WebSocket 代理服务器
 *
 * 浏览器原生 WebSocket 不支持自定义 HTTP 头，
 * 因此无法在握手阶段发送 Authorization 头。
 * 本代理在转发时注入 API Key。
 *
 * 启动方式：
 *   node scripts/ws-proxy.js
 *   或 npm run ws-proxy
 *
 * 环境变量：
 *   DASHSCOPE_API_KEY  — 必填，DashScope API Key
 *   WS_PROXY_PORT      — 可选，监听端口，默认 8089
 */

const http = require('http')
const { WebSocketServer } = require('ws')
const url = require('url')

// ============================================================
// 配置 — 优先读环境变量，其次从 qwenTranslate.js 提取
// ============================================================
let API_KEY = process.env.DASHSCOPE_API_KEY

if (!API_KEY) {
  // 从 qwenTranslate.js 读取（正则匹配 DASHSCOPE_API_KEY = 'xxx'）
  try {
    const fs = require('fs')
    const path = require('path')
    const srcPath = path.resolve(__dirname, '../src/api/qwenTranslate.js')
    const src = fs.readFileSync(srcPath, 'utf-8')
    const match = src.match(/DASHSCOPE_API_KEY\s*=\s*['"](.+?)['"]/)
    if (match) {
      API_KEY = match[1]
    }
  } catch (e) {
    // 忽略读取错误
  }
}

const PORT = parseInt(process.env.WS_PROXY_PORT || '8089', 10)
const QWEN_HOST = 'dashscope-intl.aliyuncs.com'
const QWEN_PATH = '/api-ws/v1/realtime'

if (!API_KEY) {
  console.error('❌ 未找到 API Key')
  console.error('   方式一：set DASHSCOPE_API_KEY=sk-xxx && node scripts/ws-proxy.js')
  console.error('   方式二：在 src/api/qwenTranslate.js 中配置 DASHSCOPE_API_KEY')
  process.exit(1)
}

// ============================================================
// HTTP 服务器（健康检查 + WebSocket 升级）
// ============================================================
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', port: PORT }))
    return
  }
  res.writeHead(404)
  res.end()
})

// ============================================================
// WebSocket 代理
// ============================================================
const wss = new WebSocketServer({ server })

wss.on('connection', (clientWs, req) => {
  const parsedUrl = url.parse(req.url, true)
  const clientModel = parsedUrl.query.model || 'qwen3.5-livetranslate-flash-realtime'

  // 构造上游 WebSocket URL（携带 Authorization 头）
  const upstreamUrl = new URL(`wss://${QWEN_HOST}${QWEN_PATH}`)
  upstreamUrl.searchParams.set('model', clientModel)

  const upstreamWs = new (require('ws'))(upstreamUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  })

  const clientId = Math.random().toString(36).slice(2, 8)
  console.log(`[${clientId}] 客户端已连接，代理 → ${upstreamUrl.href}`)

  // 上游连接成功 → 转发给客户端
  upstreamWs.on('open', () => {
    console.log(`[${clientId}] 上游连接已建立`)
  })

  // 上游 → 客户端
  upstreamWs.on('message', (data, isBinary) => {
    if (clientWs.readyState === 1) { // WebSocket.OPEN
      clientWs.send(data, { binary: isBinary })
    }
  })

  // 客户端 → 上游
  clientWs.on('message', (data, isBinary) => {
    if (upstreamWs.readyState === 1) {
      upstreamWs.send(data, { binary: isBinary })
    }
  })

  // 错误处理
  upstreamWs.on('error', (err) => {
    console.error(`[${clientId}] 上游错误:`, err.message)
    if (clientWs.readyState === 1) {
      clientWs.close(1011, '上游连接错误')
    }
  })

  clientWs.on('error', (err) => {
    console.error(`[${clientId}] 客户端错误:`, err.message)
    if (upstreamWs.readyState === 1) {
      upstreamWs.close(1011, '客户端连接错误')
    }
  })

  // 关闭处理
  upstreamWs.on('close', (code, reason) => {
    console.log(`[${clientId}] 上游已关闭 (${code})`)
    if (clientWs.readyState === 1) {
      clientWs.close(code, reason)
    }
  })

  clientWs.on('close', (code, reason) => {
    console.log(`[${clientId}] 客户端已关闭 (${code})`)
    if (upstreamWs.readyState === 1) {
      upstreamWs.close(code, reason)
    }
  })
})

// ============================================================
// 启动
// ============================================================
server.listen(PORT, () => {
  console.log(`✅ Qwen WebSocket 代理已启动: ws://localhost:${PORT}`)
  console.log(`   API Key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`)
  console.log(`   按 Ctrl+C 停止`)
})
