const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const fs = require('fs')

// ============================================================
// 读取 DashScope API Key（从 qwenTranslate.js 中提取）
// ============================================================
function getApiKey() {
  try {
    const src = fs.readFileSync(path.resolve(__dirname, 'src/api/qwenTranslate.js'), 'utf-8')
    const match = src.match(/DASHSCOPE_API_KEY\s*=\s*['"](.+?)['"]/)
    if (match) return match[1]
  } catch (e) { /* 忽略 */ }
  return null
}

const apiKey = getApiKey()
if (apiKey) {
  console.log('[Qwen WS Proxy] ✅ API Key 已加载，实时传译可用')
} else {
  console.warn('[Qwen WS Proxy] ⚠️ 未找到 API Key，实时传译将不可用')
}

// ============================================================
// 读取火山引擎 AST API Key（从 astTranslate.js 中提取，新版控制台单一 Key）
// ============================================================
function getAstApiKey() {
  try {
    const src = fs.readFileSync(path.resolve(__dirname, 'src/api/astTranslate.js'), 'utf-8')
    const match = src.match(/AST_API_KEY\s*=\s*['"](.+?)['"]/)
    if (match) return match[1]
  } catch (e) { /* 忽略 */ }
  return null
}

const astApiKey = getAstApiKey()
if (astApiKey && !astApiKey.startsWith('YOUR_')) {
  console.log('[AST WS Proxy] ✅ 火山引擎 API Key 已加载，同声传译可用')
} else {
  console.warn('[AST WS Proxy] ⚠️ 未配置火山引擎 API Key，同声传译（火山引擎）将不可用')
}

// 生成 X-Api-Request-Id（每次请求必须唯一，RFC4122 v4 风格）
function genRequestId() {
  const bytes = new Uint8Array(16)
  // 优先使用 Node 内置 crypto，否则用 Math.random 兜底
  try {
    const crypto = require('crypto')
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    crypto.randomFillSync(bytes)
  } catch (e) {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

module.exports = defineConfig({
  outputDir: 'dist',
  filenameHashing: true,
  assetsDir: 'static',
  parallel: true,
  publicPath: './',
  transpileDependencies: true,
  lintOnSave: false,
  productionSourceMap: false,// 生产环境是否生成 sourceMap 文件,关闭防止源码泄漏
  configureWebpack: {
    devServer: {
      proxy: {
        '/qwen-ws': {
          target: 'wss://dashscope-intl.aliyuncs.com',
          changeOrigin: true,
          ws: true,
          pathRewrite: {
            '^/qwen-ws': '/api-ws/v1/realtime'
          },
          onProxyReqWs(proxyReq) {
            if (apiKey) {
              proxyReq.setHeader('Authorization', `Bearer ${apiKey}`)
            }
          },
        },
        '/ast-ws': {
          target: 'wss://openspeech.bytedance.com',
          changeOrigin: true,
          ws: true,
          pathRewrite: {
            '^/ast-ws': '/api/v4/ast/v2/translate'
          },
          onProxyReqWs(proxyReq) {
            if (astApiKey) {
              proxyReq.setHeader('X-Api-Key', astApiKey)
              console.log(`[AST WS Proxy] 注入 X-Api-Key: ${astApiKey.slice(0, 6)}...${astApiKey.slice(-4)} (长度${astApiKey.length})`)
            } else {
              console.warn('[AST WS Proxy] ⚠️ 未注入 X-Api-Key（getAstApiKey 未匹配到 AST_API_KEY）')
            }
            proxyReq.setHeader('X-Api-Resource-Id', 'volc.service_type.10053')
          },
        },
        '/v1': {
          target: 'http://120.26.123.36:8008', 
          changeOrigin: true, 
          pathRewrite: {
          },

        },
        '/api': {
          target: 'https://www.huanxizn.com', 
          changeOrigin: true,
          pathRewrite: {
            // 并将/api其重定向到 /PublicAccount/api
            '^/api': '/PublicAccount/api'
          }
        },
        '/q1': {
          target: 'http://120.26.123.36:5261',//http://localhost:5261 http://120.26.123.36:5261
          changeOrigin: true,
          pathRewrite: {
            '^/q1': '/api'
          }
        },
        '/siliconflow': {
          target: 'https://api.siliconflow.cn',
          changeOrigin: true,
          pathRewrite: {
            '^/siliconflow': '/v1'
          }
        },
        // 火山引擎 TTS 语音合成（豆包种子音色 seed-tts-2.0）
        // 浏览器无法携带自定义请求头，鉴权头由代理注入（与 /ast-ws 同模式）
        '/tts': {
          target: 'https://openspeech.bytedance.com',
          changeOrigin: true,
          pathRewrite: {
            '^/tts': '/api/v3/tts/unidirectional'
          },
          onProxyReq(proxyReq) {
            if (astApiKey) {
              proxyReq.setHeader('X-Api-Key', astApiKey)
            }
            proxyReq.setHeader('X-Api-Resource-Id', 'seed-tts-2.0')
            proxyReq.setHeader('X-Api-Request-Id', genRequestId())
          },
        },
        // 火山引擎 BigASR 大模型录音文件识别（极速版 / flash，同步返回）
        // 浏览器无法携带自定义请求头，鉴权头由代理注入（与 /tts 同模式）
        '/recognize': {
          target: 'https://openspeech.bytedance.com',
          changeOrigin: true,
          pathRewrite: {
            '^/recognize': '/api/v3/auc/bigmodel/recognize/flash'
          },
          onProxyReq(proxyReq) {
            if (astApiKey) {
              proxyReq.setHeader('X-Api-Key', astApiKey)
            }
            proxyReq.setHeader('X-Api-Resource-Id', 'volc.bigasr.auc_turbo')
            proxyReq.setHeader('X-Api-Request-Id', genRequestId())
            proxyReq.setHeader('X-Api-Sequence', '-1')
          },
        },
      },
    }

  }
}
)
