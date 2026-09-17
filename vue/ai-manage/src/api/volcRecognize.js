// ============================================================
// 火山引擎 大模型录音文件识别（极速版 / Flash）
// 文档: https://www.volcengine.com/docs/6561/2608628（录音文件识别极速版HTTP）
//
// 说明：
// - 一次 HTTP 请求同步返回完整识别结果，无需 submit/query 轮询；
// - 鉴权头（X-Api-Key / X-Api-Resource-Id / X-Api-Request-Id / X-Api-Sequence）
//   由同源代理注入（dev: vue.config.js 的 /recognize，生产: nginx.txt /recognize），
//   前端只需 POST /recognize 携带 JSON body（与 /tts 同模式）；
// - 音频传递：audio.url 与 audio.data 二选一，本实现采用 data（base64 直传），
//   避免把录音上传到对象存储拿公网 URL 的额外链路；
// - 浏览器 MediaRecorder 产物为 webm(opuS)、mp4(aac) 等容器，极速版接口仅支持
//   wav/mp3/ogg，发送前用 Web Audio API 解码 → 重采样 16kHz/16bit/单声道 → 编码 WAV
//   （rate/bits/channel 恰好是接口默认值，codec 默认 raw 即 PCM）。
//
// 资源 ID: volc.bigasr.auc_turbo
// 成功判定: 响应头 X-Api-Status-Code = 20000000
// ============================================================

/**
 * 任意音频 blob → 16kHz / 16bit / 单声道 WAV(PCM) Blob
 * 实现参考 astTranslate.js 的 decodeAudioFileToPcm16 / float32PcmToWavBlob
 * @param {Blob} blob 浏览器可解码的音频（webm / mp4 / wav / mp3 ...）
 * @returns {Promise<Blob>}
 */
const blobToWav16k = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer()
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    try {
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        const input = audioBuffer.getChannelData(0) // 取左声道（单声道输入通常只有一个声道）
        const targetRate = 16000
        const ratio = audioBuffer.sampleRate / targetRate
        const length = Math.max(1, Math.round(input.length / ratio))
        // 线性重采样 + Float32 → Int16
        const int16 = new Int16Array(length)
        for (let i = 0; i < length; i++) {
            const idx = Math.min(input.length - 1, Math.floor(i * ratio))
            const s = Math.max(-1, Math.min(1, input[idx]))
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }
        // 拼接 WAV 头（RIFF / WAVE / fmt / data，PCM16 单声道）
        const buffer = new ArrayBuffer(44 + int16.length * 2)
        const view = new DataView(buffer)
        const writeStr = (offset, str) => {
            for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
        }
        writeStr(0, 'RIFF')
        view.setUint32(4, 36 + int16.length * 2, true)
        writeStr(8, 'WAVE')
        writeStr(12, 'fmt ')
        view.setUint32(16, 16, true)            // fmt 块长度
        view.setUint16(20, 1, true)             // 音频格式：PCM
        view.setUint16(22, 1, true)             // 声道数：单声道
        view.setUint32(24, targetRate, true)    // 采样率
        view.setUint32(28, targetRate * 2, true) // 字节率
        view.setUint16(32, 2, true)             // 块对齐
        view.setUint16(34, 16, true)            // 位深
        writeStr(36, 'data')
        view.setUint32(40, int16.length * 2, true)
        for (let i = 0; i < int16.length; i++) view.setInt16(44 + i * 2, int16[i], true)
        return new Blob([buffer], { type: 'audio/wav' })
    } finally {
        ctx.close()
    }
}

/** Blob → base64 字符串（去掉 "data:...;base64," 前缀） */
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
        const result = reader.result
        const comma = result.indexOf(',')
        resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('音频转 base64 失败'))
    reader.readAsDataURL(blob)
})

/**
 * 大模型录音文件识别（极速版，同步返回识别文本）
 * @param {Blob} audioBlob 录音产物（任意浏览器可解码格式，内部转 WAV 16k）
 * @param {Object} [options]
 * @param {string} [options.language]  指定识别语种（如 'zh-CN' / 'en-US'）；留空时按 enableAutoLang 自动检测
 * @param {boolean} [options.enableAutoLang] 自动识别语种（默认 true；支持中英日韩法德西葡俄泰越阿意等 24 语种，
 *                                            覆盖界面全部目标语言对应的可能源语言）
 * @returns {Promise<string>} 识别文本
 */
export const recognizeSpeech = async (audioBlob, options = {}) => {
    const { language = '', enableAutoLang = true } = options
    if (!audioBlob || !audioBlob.size) throw new Error('音频数据为空')

    const wavBlob = await blobToWav16k(audioBlob)
    const base64 = await blobToBase64(wavBlob)

    const audio = {
        data: base64,
        format: 'wav',
        rate: 16000,
        bits: 16,
        channel: 1
    }
    if (language) audio.language = language

    const body = {
        user: { uid: 'ai-manage' },
        audio,
        request: {
            model_name: 'bigmodel',
            enable_itn: true,            // 数字/金额/日期等口语转书面格式
            enable_punc: true,           // 输出标点
            enable_ddc: false,           // 语义顺滑：关闭，保留原文措辞便于对照翻译
            enable_auto_lang: enableAutoLang // 自动检测语种
        }
    }

    const response = await fetch('/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })

    // 服务端业务状态在响应头（X-Api-Status-Code: 20000000 成功，X-Api-Message 携带失败原因）
    const statusCode = response.headers.get('X-Api-Status-Code') || ''
    const apiMessage = response.headers.get('X-Api-Message') || ''

    if (!response.ok) {
        throw new Error(`识别请求失败：HTTP ${response.status}${apiMessage ? `（${apiMessage}）` : ''}`)
    }

    const data = await response.json()

    // 兼容多种响应结构：result 为对象（result.text）或数组（result[0].text）
    const result = data?.result ?? data?.data?.result
    const text = typeof result === 'string' ? result
        : (Array.isArray(result) ? result.find((item) => item && item.text)?.text || ''
        : (result && result.text) || '') || ''

    // 业务层失败（HTTP 200 但状态码非成功）
    if (statusCode && statusCode !== '20000000') {
        throw new Error(`识别失败：${apiMessage || `状态码 ${statusCode}`}`)
    }
    if (!text) throw new Error(apiMessage ? `识别失败：${apiMessage}` : '识别结果为空')
    return text
}

export default { recognizeSpeech }