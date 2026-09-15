/**
 * 火山引擎 同声传译大模型 (AST 2.0) API 封装
 *
 * 服务介绍：通过 WebSocket 实时访问同传大模型，支持：
 *   - s2s（语音到语音）：支持公版音色 / 复刻说话人音色
 *   - s2t（语音到文本）：只返回文字
 *
 * 协议要点（详见火山引擎文档《同声传译-API接入文档》）：
 *   - 地址：wss://openspeech.bytedance.com/api/v4/ast/v2/translate
 *   - 鉴权：在 WebSocket 建连 HTTP 请求头中注入 X-Api-Key / X-Api-Resource-Id（新版控制台只使用单一的 API Key）
 *           浏览器原生 WebSocket 无法自定义请求头，故开发环境通过 dev server 代理注入（见 vue.config.js）
 *   - 传输：WebSocket 二进制帧，内容为纯 protobuf（TranslateRequest / TranslateResponse）
 *   - 流程：WS 建连后直接发送 StartSession(100) → 等待 SessionStarted(150) →
 *           循环发送 TaskRequest(200)（音频数据）→ 发送 FinishSession(102) → SessionFinished(152)
 *   - 音频：输入必须为 PCM 16kHz / 16bit / 单声道，建议 80ms 一包（1280 采样 = 2560 字节）
 *   - 成功状态码：20000000
 *
 * 本文件内置轻量 protobuf 编解码实现（零第三方依赖），字段编号与官方 .proto 完全一致。
 */

// ============================================================
// API Key - 火山引擎新版控制台 API Key（X-Api-Key 鉴权）
// 控制台获取：https://console.volcengine.com/speech/new
// ============================================================
const AST_API_KEY = '30a78276-0088-45a5-aafa-ccb4d0fa61bf' // 控制台 API Key 管理中的 API Key（新版控制台，单 Key 鉴权）
const AST_RESOURCE_ID = 'volc.service_type.10053' // 固定资源 ID
// 真实服务端地址（仅作参考：浏览器不直连，由同源代理注入鉴权头后转发，见 vue.config.js / nginx.txt）
// wss://openspeech.bytedance.com/api/v4/ast/v2/translate

/** 服务端成功状态码 */
export const AST_STATUS_SUCCESS = 20000000

/** 事件类型（发送端/接收端共用，与官方 events.proto 一致） */
export const EVENT = {
  // 发送端
  StartSession: 100,
  FinishSession: 102,
  TaskRequest: 200,
  UpdateConfig: 201,
  // 接收端
  SessionStarted: 150,
  SessionFinished: 152,
  SessionFailed: 153,
  SessionCanceled: 151,
  UsageResponse: 154,
  AudioMuted: 250,
  TTSSentenceStart: 350,
  TTSSentenceEnd: 351,
  TTSResponse: 352,
  TTSEnded: 359,
  SourceSubtitleStart: 650,
  SourceSubtitleResponse: 651,
  SourceSubtitleEnd: 652,
  TranslationSubtitleStart: 653,
  TranslationSubtitleResponse: 654,
  TranslationSubtitleEnd: 655,
}

export const EVENT_LABELS = {
  100: 'StartSession', 102: 'FinishSession', 200: 'TaskRequest', 201: 'UpdateConfig',
  150: 'SessionStarted', 151: 'SessionCanceled', 152: 'SessionFinished', 153: 'SessionFailed',
  154: 'UsageResponse', 250: 'AudioMuted',
  350: 'TTSSentenceStart', 351: 'TTSSentenceEnd', 352: 'TTSResponse', 359: 'TTSEnded',
  650: 'SourceSubtitleStart', 651: 'SourceSubtitleResponse', 652: 'SourceSubtitleEnd',
  653: 'TranslationSubtitleStart', 654: 'TranslationSubtitleResponse', 655: 'TranslationSubtitleEnd',
}

// ============================================================
// 语言配置（语种集：lang_20 + 2 方言 + 中英反转互译）
// ============================================================
/** lang_8：复刻音色模式（s2s 无 speaker_id）支持的语种 */
export const AST_LANG_8 = ['zh', 'en', 'de', 'fr', 'es', 'id', 'ja', 'pt']

/** lang_20 + 方言 */
export const AST_LANGUAGES = [
  { label: '中文', value: 'zh' },
  { label: '英文', value: 'en' },
  { label: '德文', value: 'de' },
  { label: '法文', value: 'fr' },
  { label: '西班牙文', value: 'es' },
  { label: '印尼语', value: 'id' },
  { label: '日文', value: 'ja' },
  { label: '葡萄牙语', value: 'pt' },
  { label: '韩文', value: 'ko' },
  { label: '土耳其语', value: 'tr' },
  { label: '马来语', value: 'ms' },
  { label: '荷兰语', value: 'nl' },
  { label: '罗马尼亚语', value: 'ro' },
  { label: '波兰语', value: 'pl' },
  { label: '捷克语', value: 'cs' },
  { label: '阿拉伯语', value: 'ar' },
  { label: '泰语', value: 'th' },
  { label: '越南语', value: 'vi' },
  { label: '俄语', value: 'ru' },
  { label: '意大利语', value: 'it' },
  { label: '粤语', value: 'yue-CN' },   // 方言，仅支持作为源语种
  { label: '上海话', value: 'sh-CN' },  // 方言，仅支持作为源语种
  { label: '中英互译（自动）', value: 'zhen' }, // source/target 需同时传 zhen
]

/** 公版音色（s2s 指定音色模式） */
export const AST_SPEAKERS = [
  { label: '女声', value: 'zh_female_vv_uranus_bigtts' },
  { label: '男声', value: 'zh_male_jingqiangkanye_emo_mars_bigtts' },
]

const LANG_8_SET = new Set(AST_LANG_8)
const LANG_20_SET = new Set(AST_LANGUAGES.filter(l => l.value !== 'zhen').map(l => l.value))
const DIALECT_SET = new Set(['yue-CN', 'sh-CN'])
const ZH_EN_SET = new Set(['zh', 'en'])

/**
 * 校验源/目标语言与模式是否匹配（约束见官方文档"模式与语种匹配/约束关系"）
 * @returns {{ ok: boolean, message?: string }}
 */
export function validateAstPair({ mode, sourceLang, targetLang, speakerId = '' }) {
  // 中英反转互译
  if (sourceLang === 'zhen' || targetLang === 'zhen') {
    if (sourceLang !== 'zhen' || targetLang !== 'zhen') {
      return { ok: false, message: '中英互译模式需要源语言和目标语言同时选择"中英互译（自动）"' }
    }
    return { ok: true }
  }

  if (mode === 's2t') {
    // 源：lang_20 + 方言；目标：lang_20；源或目标必须为中英
    if (!LANG_20_SET.has(sourceLang)) return { ok: false, message: '不支持的源语言' }
    if (!LANG_20_SET.has(targetLang) || DIALECT_SET.has(targetLang)) return { ok: false, message: '不支持的目标语言（方言仅支持作为源语种）' }
    if (!ZH_EN_SET.has(sourceLang) && !ZH_EN_SET.has(targetLang)) {
      return { ok: false, message: '语音到文本模式：源语言或目标语言必须为中文(zh)或英文(en)' }
    }
  } else {
    // s2s
    if (speakerId) {
      // 指定音色模式：目标必须为中英；源为 lang_20 + 方言
      if (!ZH_EN_SET.has(targetLang)) return { ok: false, message: '指定音色模式下，目标语言必须为中文(zh)或英文(en)' }
      if (!LANG_20_SET.has(sourceLang)) return { ok: false, message: '不支持的源语言' }
    } else {
      // 复刻音色模式：源/目标均需在 lang_8 内，且其中之一必须为中英
      if (!LANG_8_SET.has(sourceLang) || !LANG_8_SET.has(targetLang)) {
        return { ok: false, message: '复刻音色模式仅支持 8 种核心语言（中/英/德/法/西/印尼/日/葡）' }
      }
      if (!ZH_EN_SET.has(sourceLang) && !ZH_EN_SET.has(targetLang)) {
        return { ok: false, message: '语音到语音模式：源语言或目标语言必须为中文(zh)或英文(en)' }
      }
    }
  }
  return { ok: true }
}

/** 检查 API Key 是否已配置 */
export function isAstKeyConfigured() {
  return !AST_API_KEY.startsWith('YOUR_')
}

/** 获取连接地址：浏览器原生 WebSocket 无法自定义请求头，鉴权头必须由服务端代理注入。
 *  开发环境走 dev server 代理（vue.config.js 的 /ast-ws），生产环境走 nginx 代理（/ast-ws），
 *  两者均在同源转发时注入 X-Api-Key / X-Api-Resource-Id。 */
function getWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${location.host}/ast-ws`
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================
// 轻量 protobuf 编码（仅覆盖 AST 协议所需字段，proto3 语义）
// ============================================================
class PbWriter {
  constructor() {
    this.buf = []
  }

  /** varint（支持最大 2^53，足以覆盖 int32/int64/enum/bool 场景） */
  varint(value) {
    let v = value
    if (v < 0) v = v >>> 0 // 负数按 uint32 补码处理
    while (v >= 0x80) {
      this.buf.push((v & 0x7f) | 0x80)
      v = Math.floor(v / 128)
    }
    this.buf.push(v)
  }

  tag(field, wireType) {
    this.varint((field << 3) | wireType)
  }

  /** length-delimited：嵌套 message / string / bytes 通用 */
  len(field, uint8) {
    if (!uint8 || uint8.length === 0) return
    this.tag(field, 2)
    this.varint(uint8.length)
    for (let i = 0; i < uint8.length; i++) this.buf.push(uint8[i])
  }

  string(field, str) {
    if (!str) return
    this.len(field, new TextEncoder().encode(str))
  }

  bytes(field, uint8) {
    if (!uint8 || uint8.length === 0) return
    this.len(field, uint8)
  }

  message(field, uint8) {
    this.bytes(field, uint8)
  }

  /** varint 字段（int32/enum/uint32），0 值按 proto3 省略 */
  varintField(field, value) {
    if (value === 0 || value === undefined || value === null) return
    this.tag(field, 0)
    this.varint(value)
  }

  boolField(field, value) {
    if (!value) return
    this.tag(field, 0)
    this.varint(1)
  }

  finish() {
    return Uint8Array.from(this.buf)
  }
}

// ---------- 上行消息构造（TranslateRequest） ----------

/** common.RequestMeta：只需 session_id（与官方 demo 对齐，网关层已用 header 鉴权） */
function encodeRequestMeta({ sessionId } = {}) {
  const w = new PbWriter()
  w.string(6, sessionId) // SessionID
  return w.finish()
}

/** understanding.User */
function encodeUser() {
  const w = new PbWriter()
  w.string(1, 'ai-manage') // uid
  w.string(2, 'ai-manage') // did
  return w.finish()
}

/** understanding.Audio（source_audio / target_audio） */
function encodeAudio({ format, codec, rate, bits, channel, binaryData }) {
  const w = new PbWriter()
  w.string(4, format)            // format
  w.string(5, codec)             // codec
  w.varintField(7, rate)         // rate
  w.varintField(8, bits)         // bits
  w.varintField(9, channel || 1) // channel
  w.bytes(14, binaryData)        // binary_data
  return w.finish()
}

/** data.speech.ast.ReqParams */
function encodeReqParams({ mode, sourceLang, targetLang, speakerId = '' }) {
  const w = new PbWriter()
  w.string(1, mode)
  w.string(2, sourceLang)
  w.string(3, targetLang)
  w.string(4, speakerId)
  return w.finish()
}

/** StartSession(100) */
function encodeStartSession({ sessionId, mode, sourceLang, targetLang, speakerId = '', denoise = false }) {
  const w = new PbWriter()
  w.message(1, encodeRequestMeta({ sessionId }))
  w.varintField(2, EVENT.StartSession)
  w.message(3, encodeUser())
  // 源音频：固定 wav / 16k / 16bit / 单声道（发送时实际的 payload 为裸 PCM）
  w.message(4, encodeAudio({ format: 'wav', rate: 16000, bits: 16, channel: 1 }))
  // 目标音频（s2s 必填）：pcm @ 24000Hz → 32 位浮点（Float32LE）
  if (mode === 's2s') {
    w.message(5, encodeAudio({ format: 'pcm', rate: 24000 }))
  }
  w.message(6, encodeReqParams({ mode, sourceLang, targetLang, speakerId }))
  w.boolField(7, denoise)
  return w.finish()
}

/** TaskRequest(200)：音频数据 */
function encodeTaskRequest({ sessionId, pcmBytes }) {
  const w = new PbWriter()
  w.message(1, encodeRequestMeta({ sessionId }))
  w.varintField(2, EVENT.TaskRequest)
  w.message(4, encodeAudio({ format: 'wav', rate: 16000, bits: 16, channel: 1, binaryData: pcmBytes }))
  return w.finish()
}

/** FinishSession(102) */
function encodeFinishSession({ sessionId }) {
  const w = new PbWriter()
  w.message(1, encodeRequestMeta({ sessionId }))
  w.varintField(2, EVENT.FinishSession)
  return w.finish()
}

// ============================================================
// 轻量 protobuf 解码（TranslateResponse）
// ============================================================
class PbReader {
  constructor(uint8) {
    this.u8 = uint8
    this.pos = 0
    this.dv = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength)
  }

  get done() {
    return this.pos >= this.u8.length
  }

  varint() {
    let result = 0
    let shift = 0
    while (true) {
      if (this.pos >= this.u8.length) throw new Error('protobuf 数据损坏（varint 越界）')
      const b = this.u8[this.pos++]
      if (shift < 28) {
        result |= (b & 0x7f) << shift
      } else {
        result += (b & 0x7f) * Math.pow(2, shift)
      }
      if (!(b & 0x80)) break
      shift += 7
    }
    return result
  }

  raw(len) {
    const start = this.pos
    this.pos += len
    if (this.pos > this.u8.length) throw new Error('protobuf 数据损坏（长度越界）')
    return this.u8.subarray(start, this.pos)
  }

  bytes() {
    return this.raw(this.varint())
  }

  string() {
    return new TextDecoder().decode(this.bytes())
  }

  float32() {
    const v = this.dv.getFloat32(this.pos, true)
    this.pos += 4
    return v
  }

  skip(wireType) {
    switch (wireType) {
      case 0: this.varint(); break
      case 1: this.pos += 8; break
      case 2: this.pos += this.varint(); break
      case 5: this.pos += 4; break
      default: throw new Error(`不支持的 wire type: ${wireType}`)
    }
  }
}

function decodeBillingItem(reader) {
  const item = {}
  while (!reader.done) {
    const tag = reader.varint()
    const field = tag >>> 3
    const wt = tag & 7
    switch (field) {
      case 1: item.unit = reader.string(); break
      case 2: item.quantity = reader.float32(); break // float -> fixed32
      default: reader.skip(wt)
    }
  }
  return item
}

function decodeBilling(reader) {
  const billing = {}
  billing.items = []
  while (!reader.done) {
    const tag = reader.varint()
    const field = tag >>> 3
    const wt = tag & 7
    switch (field) {
      case 1: billing.items.push(decodeBillingItem(new PbReader(reader.bytes()))); break
      case 2: billing.durationMsec = reader.varint(); break
      case 3: billing.wordCount = reader.varint(); break
      default: reader.skip(wt)
    }
  }
  return billing
}

function decodeResponseMeta(reader) {
  const meta = {}
  while (!reader.done) {
    const tag = reader.varint()
    const field = tag >>> 3
    const wt = tag & 7
    switch (field) {
      case 1: meta.sessionId = reader.string(); break
      case 2: meta.sequence = reader.varint(); break
      case 3: meta.statusCode = reader.varint(); break
      case 4: meta.message = reader.string(); break
      case 5: meta.billing = decodeBilling(new PbReader(reader.bytes())); break
      default: reader.skip(wt)
    }
  }
  return meta
}

/**
 * 解码服务端 TranslateResponse
 * @param {Uint8Array} uint8
 * @returns {{ responseMeta?: Object, event: number, data?: Uint8Array, text?: string, startTime?: number, endTime?: number, spkChg?: boolean, mutedDurationMs?: number }}
 */
export function decodeTranslateResponse(uint8) {
  const reader = new PbReader(uint8)
  const resp = { event: 0 }
  while (!reader.done) {
    const tag = reader.varint()
    const field = tag >>> 3
    const wt = tag & 7
    switch (field) {
      case 1: resp.responseMeta = decodeResponseMeta(new PbReader(reader.bytes())); break
      case 2: resp.event = reader.varint(); break
      case 3: resp.data = reader.bytes(); break
      case 4: resp.text = reader.string(); break
      case 5: resp.startTime = reader.varint(); break
      case 6: resp.endTime = reader.varint(); break
      case 7: resp.spkChg = !!reader.varint(); break
      case 8: resp.mutedDurationMs = reader.varint(); break
      default: reader.skip(wt)
    }
  }
  return resp
}

// ============================================================
// 实时翻译客户端（WebSocket + protobuf）
// ============================================================

/**
 * AST 翻译器（遵循官方流程：WS 建连 → StartSession → TaskRequest×N → FinishSession）
 *
 * @param {Object} options
 * @param {string} options.mode          - 's2s' | 's2t'
 * @param {string} options.sourceLang    - 源语言
 * @param {string} options.targetLang    - 目标语言
 * @param {string} options.speakerId     - 音色（空 = 复刻说话人）
 * @param {boolean} options.denoise      - 是否服务端降噪（默认 false，保留音色细节）
 * @param {Function} options.onSourceStart - 原文字幕开始
 * @param {Function} options.onSourceText  - (text: string, isFinal: boolean)
 * @param {Function} options.onTargetStart
 * @param {Function} options.onTargetText  - (text: string, isFinal: boolean)
 * @param {Function} options.onAudioStart  - TTS 音频开始
 * @param {Function} options.onAudio       - (bytes: Uint8Array) TTS PCM 数据（24000Hz Float32LE）
 * @param {Function} options.onAudioEnd    - TTS 音频结束
 * @param {Function} options.onMuted       - (durationMs: number) 静音事件
 * @param {Function} options.onUsage       - (responseMeta) 计费信息
 * @param {Function} options.onSessionStarted
 * @param {Function} options.onSessionFinished
 * @param {Function} options.onError
 * @param {Function} options.onClose
 */
export class AstTranslator {
  constructor(options = {}) {
    this.callbacks = {
      onSourceStart: () => {},
      onSourceText: () => {},
      onTargetStart: () => {},
      onTargetText: () => {},
      onAudioStart: () => {},
      onAudio: () => {},
      onAudioEnd: () => {},
      onMuted: () => {},
      onUsage: () => {},
      onSessionStarted: () => {},
      onSessionFinished: () => {},
      onError: () => {},
      onClose: () => {},
      ...options,
    }
    this.mode = options.mode || 's2s'
    this.sourceLang = options.sourceLang || 'zh'
    this.targetLang = options.targetLang || 'en'
    this.speakerId = options.speakerId || ''
    this.denoise = !!options.denoise
    this.ws = null
    this.sessionId = ''
    this._connected = false
    this._resolveConnect = null
    this._rejectConnect = null
    this._connectTimer = null
  }

  get connected() {
    return this._connected && !!this.ws && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * 建立 WebSocket 连接并发送 StartSession，等待 SessionStarted
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (!isAstKeyConfigured()) {
        reject(new Error('请先在 src/api/astTranslate.js 中配置火山引擎 API Key（AST_API_KEY）'))
        return
      }
      if (this.connected) {
        resolve()
        return
      }

      this.sessionId = generateUUID()
      let settled = false
      const settle = (fn, value) => {
        if (settled) return
        settled = true
        this._resolveConnect = null
        this._rejectConnect = null
        if (this._connectTimer) { clearTimeout(this._connectTimer); this._connectTimer = null }
        fn(value)
      }
      this._resolveConnect = () => settle(resolve)
      this._rejectConnect = (err) => settle(reject, err)

      this._connectTimer = setTimeout(() => {
        this._rejectConnect && this._rejectConnect(new Error('连接超时'))
        this.close()
      }, 15000)

      const ws = new WebSocket(getWsUrl())
      this.ws = ws
      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        if (ws.readyState !== WebSocket.OPEN) return
        ws.send(encodeStartSession({
          sessionId: this.sessionId,
          mode: this.mode,
          sourceLang: this.sourceLang,
          targetLang: this.targetLang,
          speakerId: this.speakerId,
          denoise: this.denoise,
        }))
      }

      ws.onmessage = (ev) => this.handleMessage(ev.data)

      ws.onerror = () => {
        if (!settled) {
          settle(reject, new Error('WebSocket 连接错误'))
        }
        this.callbacks.onError(new Error('WebSocket 连接错误'))
      }

      ws.onclose = () => {
        const wasConnected = this._connected
        this._connected = false
        this.ws = null
        if (!settled) {
          settle(reject, new Error(wasConnected ? '连接已关闭' : '连接被拒绝（请检查鉴权配置）'))
        }
        this.callbacks.onClose()
      }
    })
  }

  handleMessage(raw) {
    let resp
    try {
      resp = decodeTranslateResponse(new Uint8Array(raw))
    } catch (e) {
      console.warn('[AST] protobuf 解码失败:', e)
      return
    }

    const statusCode = resp.responseMeta?.statusCode || 0
    const message = resp.responseMeta?.message || ''
    if (typeof window !== 'undefined' && window.__AST_DEBUG) {
      console.log(`[AST-DEBUG] event=${resp.event} (${EVENT_LABELS[resp.event] || 'UNKNOWN'}) status=${statusCode || 0} text="${(resp.text || '').slice(0, 80)}" data=${resp.data ? resp.data.length : 0}B`)
    }
    if (statusCode && statusCode !== AST_STATUS_SUCCESS) {
      this.callbacks.onError(new Error(`服务端错误 ${statusCode}: ${message}`))
      return
    }

    switch (resp.event) {
      case EVENT.SessionStarted:
        this._connected = true
        if (this._resolveConnect) this._resolveConnect()
        this.callbacks.onSessionStarted()
        break
      case EVENT.SessionFailed:
      case EVENT.SessionCanceled:
        if (this._rejectConnect) this._rejectConnect(new Error(message || '会话失败'))
        this.callbacks.onError(new Error(message || '会话失败'))
        break
      case EVENT.SessionFinished:
        this.callbacks.onSessionFinished()
        break
      case EVENT.SourceSubtitleStart:
        this.callbacks.onSourceStart(resp)
        break
      case EVENT.SourceSubtitleResponse:
        this.callbacks.onSourceText(resp.text || '', false)
        break
      case EVENT.SourceSubtitleEnd:
        this.callbacks.onSourceText(resp.text || '', true)
        break
      case EVENT.TranslationSubtitleStart:
        this.callbacks.onTargetStart(resp)
        break
      case EVENT.TranslationSubtitleResponse:
        this.callbacks.onTargetText(resp.text || '', false)
        break
      case EVENT.TranslationSubtitleEnd:
        this.callbacks.onTargetText(resp.text || '', true)
        break
      case EVENT.TTSSentenceStart:
        this.callbacks.onAudioStart()
        break
      case EVENT.TTSResponse:
        if (resp.data && resp.data.length) this.callbacks.onAudio(resp.data)
        break
      case EVENT.TTSSentenceEnd:
        this.callbacks.onAudioEnd()
        break
      case EVENT.AudioMuted:
        this.callbacks.onMuted(resp.mutedDurationMs || 0)
        break
      case EVENT.UsageResponse:
        this.callbacks.onUsage(resp.responseMeta)
        break
      default:
        break
    }
  }

  /**
   * 发送音频数据（PCM Int16 小端，16kHz 单声道，建议 80ms=2560 字节一包）
   * @param {Uint8Array} pcmBytes
   */
  sendAudio(pcmBytes) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(encodeTaskRequest({ sessionId: this.sessionId, pcmBytes }))
  }

  /** 通知服务端音频发送完毕，等待最终结果 */
  finish() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(encodeFinishSession({ sessionId: this.sessionId }))
    }
  }

  close() {
    if (this._connectTimer) { clearTimeout(this._connectTimer); this._connectTimer = null }
    if (this.ws) {
      try {
        this.ws.close()
      } catch (e) { /* 忽略 */ }
      this.ws = null
    }
    this._connected = false
  }
}

// ============================================================
// 麦克风录音（PCM 16kHz 16bit 单声道，按 80ms 分包）
// ============================================================
export class AstMicrophoneRecorder {
  constructor() {
    this.audioContext = null
    this.mediaStream = null
    this.scriptProcessor = null
    this.onAudioData = null
    this.remainder = new Uint8Array(0)
  }

  /** 每 80ms = 1280 采样 = 2560 字节 */
  static get FRAME_BYTES() { return 2560 }

  async start(onAudioData) {
    this.onAudioData = onAudioData

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    })

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
    const source = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1)

    this.scriptProcessor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0)
      const int16 = new Int16Array(input.length)
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]))
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }
      this.emitChunks(new Uint8Array(int16.buffer))
    }

    source.connect(this.scriptProcessor)
    this.scriptProcessor.connect(this.audioContext.destination)
  }

  /** 累积缓冲并切成 80ms 帧后回调 */
  emitChunks(bytes) {
    const FRAME = AstMicrophoneRecorder.FRAME_BYTES
    let data = bytes
    if (this.remainder.length) {
      const merged = new Uint8Array(this.remainder.length + data.length)
      merged.set(this.remainder)
      merged.set(data, this.remainder.length)
      data = merged
    }
    let offset = 0
    while (data.length - offset >= FRAME) {
      if (this.onAudioData) this.onAudioData(data.slice(offset, offset + FRAME))
      offset += FRAME
    }
    this.remainder = data.slice(offset)
  }

  /** 停止录音。停止前先将缓冲中残留的不足一帧（<80ms）的尾部音频刷新发出，避免尾音丢失 */
  stop() {
    // 先 flush 残留尾部数据，作为最后一包发送（服务端接受短于常规帧的包）
    if (this.onAudioData && this.remainder.length) {
      const tail = this.remainder
      this.remainder = new Uint8Array(0)
      this.onAudioData(tail)
    }
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
      this.scriptProcessor = null
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.onAudioData = null
    this.remainder = new Uint8Array(0)
  }
}

// ============================================================
// 音频播放（服务端输出：PCM 24000Hz Float32LE）
// ============================================================
export class AstAudioPlayer {
  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate
    this.audioContext = null
    this.nextPlayTime = 0
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this.sampleRate })
      this.nextPlayTime = 0
      if (typeof window !== 'undefined' && window.__AST_DEBUG) console.log('[AST-AUDIO] AudioContext created, state=', this.audioContext.state, 'sampleRate=', this.audioContext.sampleRate)
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
      if (typeof window !== 'undefined' && window.__AST_DEBUG) console.log('[AST-AUDIO] AudioContext was suspended, resume() called')
    }
  }

  /**
   * 播放一段 Float32LE PCM 字节
   * @param {Uint8Array} floatPcmBytes
   */
  playChunk(floatPcmBytes) {
    if (!floatPcmBytes || floatPcmBytes.length === 0) {
      if (typeof window !== 'undefined' && window.__AST_DEBUG) console.warn('[AST-AUDIO] playChunk: empty/null data, skipped')
      return
    }
    this.init()
    if (floatPcmBytes.length % 4 !== 0) {
      if (typeof window !== 'undefined' && window.__AST_DEBUG) console.warn('[AST-AUDIO] playChunk: length', floatPcmBytes.length, 'not aligned to 4 bytes, SKIPPED')
      return
    }

    // 字节流可能未按 4 字节对齐，先拷贝到对齐缓冲区
    const aligned = new Uint8Array(floatPcmBytes.length)
    aligned.set(floatPcmBytes)
    const float32 = new Float32Array(aligned.buffer)

    const buffer = this.audioContext.createBuffer(1, float32.length, this.sampleRate)
    buffer.getChannelData(0).set(float32)

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)
    const now = this.audioContext.currentTime
    const startTime = Math.max(this.nextPlayTime, now)
    source.start(startTime)
    this.nextPlayTime = startTime + buffer.duration
    if (typeof window !== 'undefined' && window.__AST_DEBUG) {
      const min = Math.min(...float32.slice(0, 10))
      const max = Math.max(...float32.slice(0, 10))
      console.log('[AST-AUDIO] playChunk: len=', floatPcmBytes.length, 'float32Len=', float32.length, 'duration=', buffer.duration.toFixed(3), 's, startTime=', startTime.toFixed(3), 'contextState=', this.audioContext.state, 'sample[0..9]=', Array.from(float32.slice(0, 10)).map(v => v.toFixed(4)))
    }
  }

  stop() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.nextPlayTime = 0
    }
  }
}

// ============================================================
// 音频工具
// ============================================================

/**
 * 将任意音频文件解码并重采样为 PCM 16kHz / 16bit / 单声道
 * @param {File} file
 * @returns {Promise<Uint8Array>} 裸 PCM（Int16 小端）
 */
export async function decodeAudioFileToPcm16(file) {
  const arrayBuffer = await file.arrayBuffer()
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    const input = audioBuffer.getChannelData(0)
    const targetRate = 16000
    const ratio = audioBuffer.sampleRate / targetRate
    const length = Math.max(1, Math.round(input.length / ratio))
    const int16 = new Int16Array(length)
    for (let i = 0; i < length; i++) {
      const idx = Math.min(input.length - 1, Math.floor(i * ratio))
      const s = Math.max(-1, Math.min(1, input[idx]))
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return new Uint8Array(int16.buffer)
  } finally {
    ctx.close()
  }
}

/** 拼接多个 Float32LE PCM 字节块为单个 Float32Array */
export function concatFloatPcm(chunks) {
  const total = chunks.reduce((n, c) => n + Math.floor(c.length / 4), 0)
  const out = new Float32Array(total)
  let offset = 0
  for (const chunk of chunks) {
    const aligned = new Uint8Array(chunk.length)
    aligned.set(chunk)
    const data = new Float32Array(aligned.buffer)
    out.set(data, offset)
    offset += data.length
  }
  return out
}

/** Float32 PCM → WAV（PCM16）Blob，可直接播放/下载 */
export function float32PcmToWavBlob(float32, sampleRate = 24000) {
  const numSamples = float32.length
  const int16 = new Int16Array(numSamples)
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  const buffer = new ArrayBuffer(44 + int16.length * 2)
  const view = new DataView(buffer)
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + int16.length * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)        // PCM
  view.setUint16(22, 1, true)        // 单声道
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byteRate
  view.setUint16(32, 2, true)        // blockAlign
  view.setUint16(34, 16, true)       // bitsPerSample
  writeStr(36, 'data')
  view.setUint32(40, int16.length * 2, true)
  for (let i = 0; i < numSamples; i++) view.setInt16(44 + i * 2, int16[i], true)
  return new Blob([buffer], { type: 'audio/wav' })
}

// ============================================================
// 离线文件翻译（上传文件 → 解码 → 流式发送 → 结果回调）
// ============================================================

/**
 * 离线翻译音频文件（AST 为流式协议，此处将文件按 80ms 分包实时速率发送）
 *
 * @param {Object} options
 * @param {File} options.file        - 音频文件（任意格式，内部解码）
 * @param {string} options.mode      - 's2s' | 's2t'
 * @param {string} options.sourceLang
 * @param {string} options.targetLang
 * @param {string} options.speakerId
 * @param {Function} options.onSourceText - (text: string, isFinal: boolean)
 * @param {Function} options.onTargetText
 * @param {Function} options.onAudio      - (bytes: Uint8Array) s2s 输出音频
 * @param {Function} options.onProgress   - ({ sent, total }) 发送进度
 * @param {Function} options.onError
 * @param {Function} options.onDone
 * @returns {{ cancel: Function }}
 */
export function translateAudioFile({
  file,
  mode,
  sourceLang,
  targetLang,
  speakerId = '',
  onSourceText = () => {},
  onTargetText = () => {},
  onAudio = () => {},
  onProgress = () => {},
  onError = () => {},
  onDone = () => {},
} = {}) {
  let cancelled = false

  const cancel = () => { cancelled = true }

  ;(async () => {
    let pcm
    try {
      pcm = await decodeAudioFileToPcm16(file)
    } catch (e) {
      onError(new Error('音频解析失败: ' + (e.message || e)))
      return
    }

    const FRAME = AstMicrophoneRecorder.FRAME_BYTES
    const totalFrames = Math.ceil(pcm.length / FRAME)
    if (totalFrames === 0) {
      onError(new Error('音频内容为空'))
      return
    }

    const translator = new AstTranslator({
      mode,
      sourceLang,
      targetLang,
      speakerId,
      onSourceText,
      onTargetText,
      onAudio,
      onError,
    })

    try {
      await translator.connect()
      if (typeof window !== 'undefined' && window.__AST_DEBUG) console.log('[AST-DEBUG] 离线: 会话已建立')
    } catch (e) {
      onError(e)
      return
    }

    // 按实时速率流式发送（80ms/包）
    let sentFrames = 0
    for (let i = 0; i < pcm.length && !cancelled; i += FRAME) {
      translator.sendAudio(pcm.slice(i, i + FRAME))
      sentFrames++
      onProgress({ sent: sentFrames, total: totalFrames })
      await sleep(80)
    }

    if (cancelled) {
      translator.close()
      return
    }

    // 发送 FinishSession 后等待 SessionFinished（最长 10s）
    translator.finish()
    if (typeof window !== 'undefined' && window.__AST_DEBUG) console.log('[AST-DEBUG] 离线: 已发送 FinishSession，等待最终结果...')
    await new Promise((resolve) => {
      const original = translator.callbacks.onSessionFinished
      translator.callbacks.onSessionFinished = () => {
        if (typeof window !== 'undefined' && window.__AST_DEBUG) console.log('[AST-DEBUG] 离线: 收到 SessionFinished')
        original()
        resolve()
      }
      setTimeout(resolve, 10000)
    })
    translator.close()
    if (typeof window !== 'undefined' && window.__AST_DEBUG) console.log('[AST-DEBUG] 离线: 会话已关闭，onDone')
    if (!cancelled) onDone()
  })()

  return { cancel }
}

export default {
  AstTranslator,
  AstMicrophoneRecorder,
  AstAudioPlayer,
  decodeAudioFileToPcm16,
  translateAudioFile,
  decodeTranslateResponse,
  validateAstPair,
  isAstKeyConfigured,
  AST_LANGUAGES,
  AST_SPEAKERS,
  AST_LANG_8,
  EVENT,
}