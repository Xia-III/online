// ============================================================
// 火山引擎 语音合成（TTS）—— 豆包语音合成模型 2.0（seed-tts-2.0）
// 文档: https://www.volcengine.com/docs/6561/2528925（单向流式语音合成 HTTP）
//
// 说明：浏览器无法自定义请求头，鉴权头（X-Api-Key / X-Api-Resource-Id /
// X-Api-Request-Id）由同源代理注入（dev: vue.config.js /tts，生产: nginx.txt /tts），
// 前端只需 POST /tts 携带正常 JSON body。接口返回 HTTP Chunked 流，
// 由多个 JSON 对象拼接而成，需正则逐个解析并拼接 base64 音频帧。
//
// 重要（2026-09 实测结论）：
// - 2.0 公版音色（如 Vivi）仅能合成中文/英文，法/德/西/葡/意/越 需配
//   explicit_language 参数强制指定语种；日/韩/俄/泰 用官方多语种专色
//   （Vivi 合成日/韩/越南语未指定 explicit_language 会返回 code:0 data:null 空响应）。
// - 所有音色组合均经 curl 实测可用。
// ============================================================

// 版本标记：浏览器控制台执行该语句可确认前端加载的是否为最新版 TTS 代码
export const TTS_CODE_VERSION = 'v3-lang-20260912'

/**
 * 目标语言 → TTS 配置（种子豆包语音合成模型 2.0 公版/多语种音色）
 * - speaker:  音色 ID（req_params.speaker）
 * - language: explicit_language 参数（仅部分语种需要，用于强制指定朗读语种）
 */
export const TTS_LANG_MAP = {
    '中文':     { speaker: 'zh_female_vv_uranus_bigtts' },                    // Vivi 2.0
    '英文':     { speaker: 'en_female_dacey_uranus_bigtts' },                 // Dacey（美式英语）
    '日文':     { speaker: 'ja_female_bv024_uranus_bigtts' },                 // Bonnie（日语专色）
    '韩文':     { speaker: 'ko_male_bv545_uranus_bigtts' },                   // Jay（韩语专色）
    '法文':     { speaker: 'zh_female_vv_uranus_bigtts', language: 'fr' },    // Vivi + fr
    '德文':     { speaker: 'zh_female_vv_uranus_bigtts', language: 'de' },    // Vivi + de
    '西班牙文': { speaker: 'zh_female_vv_uranus_bigtts', language: 'es' },    // Vivi + es
    '葡萄牙文': { speaker: 'zh_female_vv_uranus_bigtts', language: 'pt' },    // Vivi + pt
    '意大利文': { speaker: 'zh_female_vv_uranus_bigtts', language: 'it' },    // Vivi + it
    '越南文':   { speaker: 'zh_female_vv_uranus_bigtts', language: 'vi' },    // Vivi + vi
    '阿拉伯文': { speaker: 'ar_female_dina_uranus_bigtts' },                  // Dina（阿拉伯语专色）
    '俄文':     { speaker: 'ru_female_sophie_uranus_bigtts', language: 'ru' },// Ksenia（俄语专色）
    '泰文':     { speaker: 'th_female_bv568_neutral_uranus_bigtts', language: 'th' }, // Mildred（泰语专色）
}

/** 兜底音色：Vivi 2.0（中文/英文/加 explicit_language 的多数欧洲语种） */
const FALLBACK_TTS = { speaker: 'zh_female_vv_uranus_bigtts' }

/**
 * 按目标语言取 TTS 配置 { speaker, language? }
 * @param {string} targetLang 目标语言（如 '中文'、'日文'、'法文'）
 * @returns {{speaker: string, language?: string}}
 */
export const resolveTtsConfig = (targetLang) => TTS_LANG_MAP[targetLang] || FALLBACK_TTS

/** 兼容旧导出名：按目标语言取音色配置 */
export const resolveSpeaker = resolveTtsConfig

/** 简单的用户标识（火山侧匿名统计用，无鉴权含义） */
const genUid = () => `uid-${Date.now()}-${Math.floor(Math.random() * 100000)}`

/** base64 音频帧 → 原始字节（atob 为二进制字符串再转 Uint8Array） */
const base64ToBytes = (base64) => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

/**
 * 单向流式语音合成（HTTP）
 * @param {string} text    待合成文本（≤1000 utf-8 字符）
 * @param {{speaker: string, language?: string}|string} ttsConfig
 *        音色配置对象（resolveTtsConfig 的返回值）或 speaker ID 字符串
 * @returns {Promise<Blob>} mp3 音频 Blob（type: audio/mpeg）
 */
export const synthesizeSpeech = async (text, ttsConfig = FALLBACK_TTS) => {
    if (!text?.trim()) throw new Error('合成文本为空')
    if (text.length > 1000) throw new Error('合成文本过长（超过 1000 字符），请分段合成')

    const config = typeof ttsConfig === 'string' ? { speaker: ttsConfig } : ttsConfig
    const { speaker, language } = config

    const reqParams = {
        text,
        speaker,
        audio_params: {
            format: 'mp3',
            sample_rate: 24000
        }
    }
    // explicit_language：强制指定朗读语种，仅对配置了该字段的语种生效
    if (language) reqParams.explicit_language = language

    const response = await fetch('/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user: { uid: genUid() },
            req_params: reqParams,
            additions: {}
        })
    })

    if (!response.ok) {
        throw new Error(`语音合成请求失败：HTTP ${response.status}`)
    }

    /**
 * 从流式响应文本中提取完整 JSON 对象（引号感知的括号深度扫描）
 * 替代 /\{.*?\}/g：响应帧可能含嵌套对象（如 sentence 元数据）或被换行分隔，
 * 非贪婪正则会在内层 } 截断产生残缺 JSON，导致帧丢失。
 */
const extractJsonObjects = (rawText) => {
    const frames = []
    let depth = 0
    let start = -1
    let inString = false
    let escaped = false

    for (let i = 0; i < rawText.length; i++) {
        const ch = rawText[i]
        if (inString) {
            if (escaped) {
                escaped = false
            } else if (ch === '\\') {
                escaped = true
            } else if (ch === '"') {
                inString = false
            }
            continue
        }
        if (ch === '"') {
            inString = true
        } else if (ch === '{') {
            if (depth === 0) start = i
            depth++
        } else if (ch === '}') {
            depth--
            if (depth === 0 && start >= 0) {
                frames.push(rawText.slice(start, i + 1))
                start = -1
            }
        }
    }
    return frames
}

// 响应体为 HTTP Chunked，多段 JSON 对象直接拼接，如：
// {"code":0,"data":"...base64...","message":"success"}...{"code":20000000,...}
const rawText = await response.text()
const jsonObjects = extractJsonObjects(rawText)
const audioChunks = []

    for (const piece of jsonObjects) {
        let obj
        try {
            obj = JSON.parse(piece)
        } catch (e) {
            console.warn('[TTS] 跳过无法解析的分片:', piece.slice(0, 80))
            continue
        }
        if (obj.code === 0 && obj.data) {
            audioChunks.push(base64ToBytes(obj.data))
        } else if (obj.code === 20000000) {
            // 合成完成标记
            break
        } else if (obj.code === 0) {
            // code:0 但无 data：无音频帧（音色不支持该语种时会整段为空），跳过
            continue
        } else {
            // 业务错误（如 4000 系列配置错误 / 资源未授权）
            throw new Error(`语音合成失败：${obj.message || `code ${obj.code}`}`)
        }
    }

    if (!audioChunks.length) {
        throw new Error(`语音合成失败：未返回音频数据（speaker=${speaker}${language ? `, language=${language}` : ''}，请检查浏览器是否加载最新代码 TTS_CODE_VERSION）`)
    }
    return new Blob(audioChunks, { type: 'audio/mpeg' })
}