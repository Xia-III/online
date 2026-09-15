/* 临时诊断脚本：用当前 AST_API_KEY 同时探测『语音网关』与『方舟』（检测后删除） */
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')

const src = fs.readFileSync(path.join(__dirname, 'src/api/astTranslate.js'), 'utf8')
const m = src.match(/AST_API_KEY\s*=\s*['"]([^'"]+)['"]/)
const key = m ? m[1] : ''
console.log('当前 AST_API_KEY:', key ? `[${key.slice(0, 6)}...${key.slice(-4)}] (长度${key.length})` : '(未配置)')

const speechUrl = 'wss://openspeech.bytedance.com/api/v4/ast/v2/translate'
const ws = new WebSocket(speechUrl, {
  headers: {
    'X-Api-Key': key || '',
    'X-Api-Resource-Id': 'volc.service_type.10053',
  },
  handshakeTimeout: 15000,
})

ws.on('open', () => {
  console.log('[语音网关] RESULT: OPEN — 鉴权通过！问题在 dev 代理（未重启/未注入新 Key）')
  ws.close()
  probeArk(key)
})
ws.on('unexpected-response', (_req, res) => {
  console.log('[语音网关] RESULT: HTTP', res.statusCode, '— 网关仍拒绝该 Key')
  res.resume()
  probeArk(key)
})
ws.on('error', (e) => {
  console.log('[语音网关] RESULT: ERROR —', e.message)
  probeArk(key)
})
ws.on('close', () => {})

async function probeArk(k) {
  try {
    const res = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + k },
      body: JSON.stringify({ model: 'ep-not-exist-probe', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 }),
    })
    const body = await res.text()
    console.log('[方舟探测] HTTP', res.status)
    console.log('[方舟探测]', body.slice(0, 200))
    console.log('解读：404/400(Endpoint/Model 不存在)=有效方舟Key；401=非方舟Key 或 Key 无效')
  } catch (e) {
    console.log('[方舟探测] 网络错误:', e.message)
  }
}