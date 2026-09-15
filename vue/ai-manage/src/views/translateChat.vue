<template>
    <div class="translate-chat">
        <!-- 顶部标题栏 -->
        <div class="header">
            <div class="header-title">对话翻译</div>
            <div class="header-clear" @click="handleClearConversation">
                <svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                清空
            </div>
        </div>

        <!-- 消息区 -->
        <div class="chat-content" ref="chatContentRef">
            <!-- 尾部窗口渲染：更早的消息折叠，点击展开 -->
            <div class="load-earlier" v-if="canLoadEarlier" @click="loadEarlier">
                查看更早消息（还有 {{ messages.length - displayCount }} 条）
            </div>
            <div class="chat-container" v-for="message in visibleMessages" :key="message.id">
                <!-- 用户文本消息（原文） -->
                <div class="message user" v-if="message.role === 'user' && message.type === 'text'">
                    <div class="meta">{{ formatTime(message.timestamp) }}</div>
                    <div class="bubble">
                        <span class="lang-tag">原文</span>
                        <div class="text">{{ message.text }}</div>
                    </div>
                </div>
                <!-- 用户语音消息（音频文件） -->
                <div class="message user" v-else-if="message.role === 'user' && message.type === 'audio'">
                    <div class="meta">{{ formatTime(message.timestamp) }}</div>
                    <div class="bubble audio-bubble" @click="togglePlay(message)">
                        <span class="play-icon">
                            <svg v-if="playingId !== message.id" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"></path>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                            </svg>
                        </span>
                        <span class="wave-play" :class="{ playing: playingId === message.id }">
                            <span></span><span></span><span></span><span></span>
                        </span>
                        <span class="audio-duration">{{ message.duration }}"</span>
                        <div class="transcription" v-if="message.transcription">
                            <span class="transcription-label">识别</span>
                            {{ message.transcription }}
                        </div>
                    </div>
                </div>
                <!-- AI 消息（译文） -->
                <div class="message ai" v-else>
                    <div class="meta">{{ formatTime(message.timestamp) }}</div>
                    <div class="bubble">
                        <span class="lang-tag" v-if="message.targetLang && !message.isWelcome">{{ message.targetLang }}</span>
                        <div class="text" v-if="message.text">{{ message.text }}</div>
                        <div class="dot-loading" v-if="message.loading">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                        <!-- 译文语音播放（火山 TTS 合成），欢迎提示消息不显示 -->
                        <div class="tts-player" v-if="message.text && !message.loading && !message.isWelcome" @click="handleTtsPlay(message)">
                            <span class="tts-play-icon">
                                <svg v-if="playingId !== message.id" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                                </svg>
                            </span>
                            <span class="tts-label">{{ message.ttsLoading ? '合成中...' : '播放译文' }}</span>
                            <span class="tts-wave" :class="{ playing: playingId === message.id }">
                                <span></span><span></span><span></span><span></span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 滚动目标 -->
            <div ref="bottomAnchor"></div>
        </div>

        <!-- 底部操作区 -->
        <div class="chat-footer">
            <!-- 目标语言选择 -->
            <div class="language-selector">
                <div class="language-selector-btn" @click="toggleLanguageSelector">
                    <span>目标语言：<span class="target-lang">{{ targetLanguage }}</span></span>
                    <span class="language-arrow" :class="{ open: isLanguageSelectorVisible }">▾</span>
                </div>
                <div v-if="isLanguageSelectorVisible" class="language-tags" @click.stop>
                    <div v-for="lang in targetLanguages" :key="lang" class="language-tag"
                         :class="{ active: targetLanguage === lang }" @click="selectTargetLanguage(lang)">
                        {{ lang }}
                    </div>
                </div>
            </div>

            <!-- 输入区（微信式：文本模式 / 语音模式切换） -->
            <div class="input-area">
                <!-- 文本输入模式 -->
                <div class="input-container" v-if="inputMode === 'text'">
                    <!-- 点击切换为语音模式 -->
                    <div class="mode-switch-btn" @click="switchToVoiceMode" title="切换为语音输入">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round" class="switch-icon">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    </div>
                    <input placeholder="输入文本" v-model="inputValue" @keydown.enter="handleEnter" />
                    <button class="send-btn" :disabled="disabledBtn" @click="handleSend">发送</button>
                </div>

                <!-- 语音输入模式（按住说话，松开发送音频文件） -->
                <div class="voice-input-container" v-else>
                    <!-- 点击切换回文本模式 -->
                    <div class="mode-switch-btn" @click="switchToTextMode" title="切换为键盘输入">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"
                             stroke-linecap="round" class="switch-icon">
                            <rect x="2" y="4" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="11" x2="22" y2="11"></line>
                        </svg>
                    </div>
                    <!-- 按住说话按钮（仿新版微信：长椭圆胶囊 + 外围描边） -->
                    <div class="hold-area">
                        <div class="hold-btn"
                             :class="{ holding: isRecording, canceling: isRecording && cancelIntent }"
                             @pointerdown="handleHoldDown" @pointerup="handleHoldUp"
                             @pointermove="handleHoldMove" @pointercancel="cancelRecording"
                             :style="{ touchAction: 'none' }">
                            <span class="hold-mic" v-if="!isRecording">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                     stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="9" y="3" width="6" height="11" rx="3"></rect>
                                    <path d="M5 11a7 7 0 0 0 14 0"></path>
                                    <line x1="12" y1="18" x2="12" y2="21"></line>
                                </svg>
                            </span>
                            <span v-if="!isRecording">按住 说话</span>
                            <span v-else>{{ cancelIntent ? '松开 取消' : '松开 结束' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 录音遮罩（仿新版微信全屏录音浮层；pointer-events 穿透保证按住手势不中断） -->
        <transition name="mask-fade">
            <div class="record-mask" v-if="isRecording">
                <div class="record-panel" :class="{ canceling: cancelIntent }">
                    <!-- 上滑取消提示 -->
                    <div class="record-hint">
                        <svg class="record-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 19V5"></path>
                            <path d="M5 12l7-7 7 7"></path>
                        </svg>
                        <span>{{ cancelIntent ? '上滑到此取消' : '上滑取消' }}</span>
                    </div>
                    <!-- 波形动画 -->
                    <div class="record-wave">
                        <span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <!-- 录音时长 -->
                    <div class="record-seconds">{{ recordingSeconds }}<em>s</em></div>
                    <!-- 状态文案 -->
                    <div class="record-status">{{ cancelIntent ? '松开 取消' : '松开 结束' }}</div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted, onActivated, onDeactivated, onBeforeUnmount } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { generateTranscriptionAPI, generateChatAPI, synthesizeSpeechAPI, resolveSpeakerForLang } from '../api/index'
import { prewarmMicrophone } from '../utils/micPermission'

// ============================================================
// 消息数据
// ============================================================
const messages = ref([])
let messageSeq = 0
const genId = () => `msg-${Date.now()}-${messageSeq++}`

// ============================================================
// 内存 / DOM 天花板：消息上限 + 尾部窗口渲染
// ============================================================
const MAX_MESSAGES = 200      // 消息内存上限，超出后从头部淘汰并回收 blob URL
const DISPLAY_WINDOW = 50     // 尾部窗口渲染条数（DOM 上限），更早的消息折叠
const LOAD_EARLIER_STEP = 50  // "查看更早消息"每次追加条数

const displayCount = ref(DISPLAY_WINDOW)
const visibleMessages = computed(() => messages.value.slice(-displayCount.value))
const canLoadEarlier = computed(() => messages.value.length > displayCount.value)

const loadEarlier = () => {
    displayCount.value = Math.min(messages.value.length, displayCount.value + LOAD_EARLIER_STEP)
}

/** 释放单条消息持有的 blob URL；若该消息正在播放则停止播放器 */
const releaseMessage = (msg) => {
    if (!msg) return
    if (msg.audioUrl) {
        URL.revokeObjectURL(msg.audioUrl)
        msg.audioUrl = null
    }
    if (msg.ttsUrl) {
        URL.revokeObjectURL(msg.ttsUrl)
        msg.ttsUrl = null
    }
    if (playingId.value === msg.id) {
        audioPlayer?.pause()
        audioPlayer?.removeEventListener('ended', onAudioEnded)
        playingId.value = null
    }
}

/** 追加消息；超 MAX_MESSAGES 时淘汰最旧消息并回收其资源 */
const appendMessage = (msg) => {
    messages.value.push(msg)
    const overflow = messages.value.length - MAX_MESSAGES
    if (overflow > 0) {
        const removed = messages.value.splice(0, overflow)
        removed.forEach(releaseMessage)
        displayCount.value = Math.min(displayCount.value, messages.value.length)
    }
    return msg.id
}

// ============================================================
// 输入模式：'text' 文本输入 | 'voice' 语音输入（微信式切换）
// ============================================================
const inputMode = ref('text')
const inputValue = ref('')

// sending：真正的发送锁（翻译请求进行中），防止并发发送
// disabledBtn：UI 禁用状态（发送按钮/按住说话），与 sending 同步
const sending = ref(false)
const disabledBtn = ref(false)

const switchToVoiceMode = async () => {
    inputMode.value = 'voice'
    // 预热麦克风权限：切换语音模式是用户的第一次自然手势，
    // 提前完成授权（prewarmMicrophone 内部同步发起 getUserMedia，处于点击手势 activation 窗口内），
    // 避免首次长按说话时才弹授权框打断录音手势
    const { ok, state } = await prewarmMicrophone()
    if (!ok) {
        showToast(state === 'denied' ? '麦克风未授权，请在浏览器设置中允许后重试' : '麦克风不可用，请检查是否有其他应用占用')
        return
    }
    showToast('长按说话，松开发送语音')
}

const switchToTextMode = () => {
    if (isRecording.value) return // 录音中不允许切换
    inputMode.value = 'text'
}

// ============================================================
// 目标语言选择
// ============================================================
const targetLanguage = ref('英文')
const isLanguageSelectorVisible = ref(false)
const targetLanguages = ref([
    '中文', '英文', '日文', '韩文', '法文', '德文',
    '西班牙文', '葡萄牙文', '俄文', '泰文', '越南文',
    '阿拉伯文', '意大利文'
])

const toggleLanguageSelector = () => {
    isLanguageSelectorVisible.value = !isLanguageSelectorVisible.value
    if (isLanguageSelectorVisible.value) {
        setTimeout(() => document.addEventListener('click', closeLanguageSelectorOnClickOutside), 10)
    } else {
        document.removeEventListener('click', closeLanguageSelectorOnClickOutside)
    }
}

const selectTargetLanguage = (lang) => {
    targetLanguage.value = lang
    isLanguageSelectorVisible.value = false
    document.removeEventListener('click', closeLanguageSelectorOnClickOutside)
    showToast(`目标语言：${lang}`)
}

const closeLanguageSelectorOnClickOutside = (event) => {
    const container = document.querySelector('.language-selector')
    if (container && !container.contains(event.target)) {
        isLanguageSelectorVisible.value = false
        document.removeEventListener('click', closeLanguageSelectorOnClickOutside)
    }
}

// ============================================================
// 滚动
// ============================================================
const bottomAnchor = ref(null)
const scrollToBottom = () => {
    nextTick(() => {
        bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
    })
}

// ============================================================
// 长按录音（MediaRecorder 采集音频文件）
// ============================================================
const MIN_PRESS_MS = 500      // 最短按住时长，不足视为误触
const MAX_RECORD_SEC = 60     // 最长录音时长（微信为 60s），到点自动发送
const CANCEL_DISTANCE = 60    // 上滑超过该距离（px）取消发送

const isRecording = ref(false)
const cancelIntent = ref(false)
const recordingSeconds = ref(0)

let pressTimer = null         // 最短时长计时器
let recordTimer = null        // 录音秒数计时器
let pressStartY = 0           // 按下时的 Y 坐标（用于上滑取消判断）
let recorder = null           // MediaRecorder 实例
let mediaStream = null        // 麦克风流
let audioChunks = []          // 录音数据块
let recordingStartTime = 0    // 实际录音开始时间戳

// 兼容不同浏览器的录音编码：iOS Safari 用 mp4，其余用 webm
const pickMimeType = () => {
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
    for (const type of candidates) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) return type
    }
    return ''
}

const handleHoldDown = (e) => {
    if (inputMode.value !== 'voice' || disabledBtn.value) return
    if (e?.clientY !== undefined) pressStartY = e.clientY
    // 捕获指针：手指滑出按钮仍持续收到 move/up，实现"上滑取消"
    e?.currentTarget?.setPointerCapture?.(e.pointerId)
    cancelIntent.value = false
    recordingSeconds.value = 0
    isRecording.value = true
    // 先展示按住状态，达到最短时长才真正开始录音
    pressTimer = setTimeout(async () => {
        pressTimer = null
        await startRecordingActual()
    }, MIN_PRESS_MS)
}

/** 实时检测上滑，超过阈值进入"松开 取消"状态 */
const handleHoldMove = (e) => {
    if (!isRecording.value) return
    const delta = (e.clientY ?? pressStartY) - pressStartY
    cancelIntent.value = delta < -CANCEL_DISTANCE
}

const handleHoldUp = () => {
    if (!isRecording.value) return

    if (pressTimer) {
        // 不足最短时长：误触，取消
        clearTimeout(pressTimer)
        pressTimer = null
        isRecording.value = false
        showToast('按住说话，松开发送')
        return
    }

    // 上滑超过阈值 → 取消发送（cancelIntent 由 handleHoldMove 实时更新）
    if (cancelIntent.value) {
        cancelRecording()
    } else {
        stopAndSend()
    }
}

const startRecordingActual = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
        isRecording.value = false
        showToast('当前浏览器不支持录音')
        return
    }
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
        console.error('无法访问麦克风:', error)
        isRecording.value = false
        showToast('无法访问麦克风，请检查权限')
        return
    }

    try {
        const mimeType = pickMimeType()
        recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined)
        audioChunks = []
        recordingStartTime = Date.now()

        recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) audioChunks.push(event.data)
        }

        recorder.onstop = () => {
            // 停止麦克风
            mediaStream?.getTracks().forEach((track) => track.stop())
            mediaStream = null
        }

        recorder.start()
        // 录音秒数计时
        recordingSeconds.value = 0
        recordTimer = setInterval(() => {
            recordingSeconds.value += 1
            // 达到 60s 上限自动发送
            if (recordingSeconds.value >= MAX_RECORD_SEC) {
                stopAndSend()
            }
        }, 1000)
    } catch (error) {
        console.error('录音启动失败:', error)
        mediaStream?.getTracks().forEach((track) => track.stop())
        mediaStream = null
        isRecording.value = false
        showToast('录音启动失败，请重试')
    }
}

const stopAndSend = () => {
    clearRecordTimer()
    if (!recorder || recorder.state === 'inactive') {
        isRecording.value = false
        return
    }
    const duration = Math.max(1, Math.round((Date.now() - recordingStartTime) / 1000))
    // 原 onstop（停止麦克风）被覆盖，必须在此一并处理。
    // 注意顺序：先 recorder.stop() 落盘尾帧，再停止流，避免提前结束数据源丢失音频尾部
    recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: recorder.mimeType || 'audio/webm' })
        mediaStream?.getTracks().forEach((track) => track.stop())
        mediaStream = null
        sendAudioMessage(blob, duration)
    }
    recorder.stop()
    isRecording.value = false
}

const cancelRecording = (silent = false) => {
    clearRecordTimer()
    // 不足最短时长时 pressTimer 可能仍挂起，必须一并清除（防止其到期误启动录音）
    if (pressTimer) {
        clearTimeout(pressTimer)
        pressTimer = null
    }
    try {
        if (recorder && recorder.state !== 'inactive') recorder.stop()
    } catch (error) {
        console.error('取消录音失败:', error)
    }
    recorder = null
    mediaStream?.getTracks().forEach((track) => track.stop())
    mediaStream = null
    audioChunks = []
    isRecording.value = false
    cancelIntent.value = false
    if (!silent) showToast('已取消发送')
}

const clearRecordTimer = () => {
    if (recordTimer) {
        clearInterval(recordTimer)
        recordTimer = null
    }
}

// 录音期间锁定全局文本选择/长按复制，防止长按文字弹出复制菜单打断按住说话的手势
// （聚焦在按住按钮上，但遮罩文字/页面其他文字长按时仍可能触发文本选择导致 pointercancel）
watch(isRecording, (recording) => {
    document.body.classList.toggle('record-lock-select', recording)
})

// ============================================================
// 发送与翻译流程
// ============================================================

/** 文本翻译（generateChatAPI，用法参考 index.vue 的 translateText） */
const translateText = async (text, lang) => {
    const response = await generateChatAPI({
        model: 'tencent/Hunyuan-MT-7B',
        messages: [
            { role: 'system', content: `把下面的文本翻译成${lang}，不要额外解释` },
            { role: 'user', content: text }
        ],
        temperature: 0.7,
        top_p: 0.6,
        top_k: 20,
        frequency_penalty: 0.0
    })
    const content = response?.data?.choices?.[0]?.message?.content
    if (!content) throw new Error('翻译结果为空')
    return content
}

/** 语音文件识别为文本（generateTranscriptionAPI，model: XingChenAGI/XingChenASR-V3.2） */
const transcribeAudio = async (blob) => {
    const formData = new FormData()
    // 按录音编码推断文件后缀：iOS(Safari) 为 mp4/m4a，Android/桌面为 webm
    const isMp4 = blob.type.includes('mp4') || blob.type.includes('m4a') || blob.type.includes('aac')
    formData.append('file', blob, isMp4 ? 'audio.m4a' : 'audio.webm')
    formData.append('model', 'XingChenAGI/XingChenASR-V3.2')
    const response = await generateTranscriptionAPI(formData)
    // 响应格式: { duration, text, usage: { type: 'duration', seconds } }
    return response?.data?.text || ''
}

/** 推送 AI 译文回复（loading → 译文）；发送锁由调用方（sendMessage / sendAudioMessage）负责 */
const pushAiReply = async (sourceText) => {
    const aiMsg = {
        id: genId(),
        role: 'ai',
        type: 'text',
        text: '',
        loading: true,
        targetLang: targetLanguage.value,
        timestamp: new Date()
    }
    const id = appendMessage(aiMsg)
    scrollToBottom()
    try {
        const translated = await translateText(sourceText, targetLanguage.value)
        // 会话可能已被清空/淘汰，必须按 id 找到消息再回写
        const target = messages.value.find((m) => m.id === id)
        if (target) target.text = translated
    } catch (error) {
        console.error('翻译失败:', error)
        const target = messages.value.find((m) => m.id === id)
        if (target) target.text = '翻译失败，请稍后重试'
    } finally {
        const target = messages.value.find((m) => m.id === id)
        if (target) target.loading = false
        scrollToBottom()
    }
}

/** 发送文本消息 */
const sendMessage = async (text) => {
    if (!text?.trim() || sending.value) return
    sending.value = true
    disabledBtn.value = true
    appendMessage({
        id: genId(),
        role: 'user',
        type: 'text',
        text: text.trim(),
        timestamp: new Date()
    })
    scrollToBottom()
    try {
        await pushAiReply(text.trim())
    } finally {
        sending.value = false
        disabledBtn.value = false
    }
}

/** 发送语音消息（录音生成的音频文件 → 语音识别 → 翻译） */
const sendAudioMessage = async (blob, duration) => {
    if (sending.value) return
    sending.value = true
    disabledBtn.value = true
    try {
        const audioUrl = URL.createObjectURL(blob)
        console.log('语音消息已生成:', { blob, duration, audioUrl })

        const id = appendMessage({
            id: genId(),
            role: 'user',
            type: 'audio',
            audioUrl,
            duration,
            timestamp: new Date()
        })
        scrollToBottom()

        // 语音识别为文本（真实 API）
        let sourceText = ''
        try {
            sourceText = await transcribeAudio(blob)
            if (!sourceText) throw new Error('识别结果为空')
            console.log('语音识别结果:', sourceText)
            // 识别文本回写气泡，方便用户核对识别是否准确
            const target = messages.value.find((m) => m.id === id)
            if (target) target.transcription = sourceText
        } catch (error) {
            console.error('语音识别失败:', error)
            if (messages.value.some((m) => m.id === id)) {
                await pushAiReply('语音识别失败，请重试或使用文本输入')
            }
            return
        }

        // 会话已被清空（onDeactivated / 清空按钮），丢弃后续推送
        if (!messages.value.some((m) => m.id === id)) return
        // 识别文本 → 翻译为目标语言
        await pushAiReply(sourceText)
    } finally {
        sending.value = false
        disabledBtn.value = false
    }
}

const handleSend = () => {
    // 发送中直接忽略：不清空输入框，避免用户输入丢失
    if (sending.value || !inputValue.value?.trim()) return
    const text = inputValue.value
    inputValue.value = ''
    sendMessage(text)
}

const handleEnter = () => {
    handleSend()
}

// ============================================================
// 语音消息播放
// ============================================================
const playingId = ref(null)
let audioPlayer = null

/** 播放指定 URL 的音频；同一时刻只允许一个播放器 */
const playUrl = (id, url) => {
    if (playingId.value === id) {
        // 暂停当前播放
        audioPlayer?.pause()
        playingId.value = null
        return
    }
    // 停止上一个播放
    audioPlayer?.pause()
    audioPlayer?.removeEventListener('ended', onAudioEnded)

    audioPlayer = new Audio(url)
    playingId.value = id
    audioPlayer.addEventListener('ended', onAudioEnded)
    audioPlayer.play().catch((error) => {
        console.error('播放失败:', error)
        playingId.value = null
        showToast('播放失败')
    })
}

/** 用户录音消息：直接播放已上传的音频文件 */
const togglePlay = (message) => {
    playUrl(message.id, message.audioUrl)
}

/** AI 译文消息：火山 TTS 合成目标语言语音并播放（合成结果缓存到 message.ttsUrl） */
const handleTtsPlay = async (message) => {
    if (!message.text) return
    // 已合成过：直接播放/暂停
    if (message.ttsUrl) {
        playUrl(message.id, message.ttsUrl)
        return
    }
    // 防重复点击：合成中不响应
    if (message.ttsLoading) return
    message.ttsLoading = true
    try {
        const ttsConfig = resolveSpeakerForLang(targetLanguage.value)
        const blob = await synthesizeSpeechAPI(message.text, ttsConfig)
        // 会话已被清空（onDeactivated / 清空按钮），丢弃合成结果避免孤立 blob URL
        if (!messages.value.includes(message)) return
        message.ttsUrl = URL.createObjectURL(blob)
        playUrl(message.id, message.ttsUrl)
    } catch (error) {
        console.error('译文语音合成失败:', error)
        // 火山控制台未开通语音合成资源时，接口会返回资源未授权类错误
        showToast('语音合成失败：' + (error?.message || '请检查火山控制台是否已开通语音合成'))
    } finally {
        message.ttsLoading = false
    }
}

const onAudioEnded = () => {
    playingId.value = null
}

// ============================================================
// 工具
// ============================================================
const formatTime = (date) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return ''
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

// ============================================================
// 清空会话
// ============================================================

/** 推送欢迎提示消息（首次进入 / 清空会话后） */
const pushWelcome = () => {
    appendMessage({
        id: genId(),
        role: 'ai',
        type: 'text',
        text: '您好，可输入文本或点击麦克风切换语音模式，长按说话发送语音，我会将内容翻译为所选语言',
        loading: false,
        targetLang: targetLanguage.value,
        // 欢迎提示消息：不展示语言标签与播放译文按钮（区别后续真实译文）
        isWelcome: true,
        timestamp: new Date()
    })
    nextTick(() => scrollToBottom())
}

/** 清空会话：释放全部 blob URL、停止播放/录音（清空按钮与 onDeactivated 共用） */
const clearConversation = () => {
    cancelRecording(true)
    audioPlayer?.pause()
    audioPlayer?.removeEventListener('ended', onAudioEnded)
    audioPlayer = null
    messages.value.forEach(releaseMessage)
    messages.value = []
    displayCount.value = DISPLAY_WINDOW
}

const handleClearConversation = () => {
    showConfirmDialog({
        title: '清空会话',
        message: '确定清空全部对话记录吗？此操作不可恢复',
        confirmButtonText: '清空',
        cancelButtonText: '取消'
    }).then(() => {
        clearConversation()
        pushWelcome()
        showToast('会话已清空')
    }).catch(() => {
        // 用户取消，无操作
    })
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
    nextTick(() => scrollToBottom())
})

// keep-alive 下组件不会卸载：切走时清空会话释放内存，切回时重新初始化
onActivated(() => {
    if (messages.value.length === 0) pushWelcome()
})

onDeactivated(() => {
    clearConversation()
})

onBeforeUnmount(() => {
    if (pressTimer) clearTimeout(pressTimer)
    clearRecordTimer()
    // 清理录音资源
    try { if (recorder && recorder.state === 'recording') recorder.stop() } catch (e) { /* ignore */ }
    mediaStream?.getTracks().forEach((track) => track.stop())
    mediaStream = null
    // 停止播放并释放
    audioPlayer?.pause()
    audioPlayer?.removeEventListener('ended', onAudioEnded)
    audioPlayer = null
    messages.value.forEach((msg) => {
        if (msg.type === 'audio' && msg.audioUrl) URL.revokeObjectURL(msg.audioUrl)
        if (msg.ttsUrl) URL.revokeObjectURL(msg.ttsUrl)
    })
    document.removeEventListener('click', closeLanguageSelectorOnClickOutside)
    document.body.classList.remove('record-lock-select')
})
</script>

<style scoped lang="less">
.translate-chat {
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    padding-top: env(safe-area-inset-top);
    padding-top: var(--window-top, 0px);
}

/* ========== 顶部标题栏 ========== */
.header {
    position: relative;
    flex-shrink: 0;
    padding: .35rem .5rem;
    background: linear-gradient(135deg, #1890ff, #0050b3);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    .header-title {
        font-weight: 600;
        font-size: .36rem;
        letter-spacing: 0.02rem;
    }

    /* 清空会话按钮：白色胶囊 + 垃圾桶图标，与蓝色标题栏形成高对比 */
    .header-clear {
        position: absolute;
        right: .3rem;
        top: 50%;
        transform: translateY(-50%);
        display: inline-flex;
        align-items: center;
        gap: .08rem;
        color: #1890ff;
        font-size: .28rem;
        font-weight: 600;
        padding: .12rem .28rem;
        background: #fff;
        border-radius: 9999px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        transition: all 0.2s;

        .clear-icon {
            width: .3rem;
            height: .3rem;
            flex-shrink: 0;
        }

        &:active {
            transform: translateY(-50%) scale(0.94);
            background: #e8f0fe;
        }
    }
}

/* ========== 消息区 ========== */
.chat-content {
    flex: 1;
    min-height: 0;
    padding: .3rem;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    gap: .3rem;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    touch-action: pan-y;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    .chat-container {
        padding: .2rem;
        border-radius: 12px;
        font-size: .5rem;
        display: flex;
        flex-direction: column;
        gap: .4rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }
}

/* 查看更早消息（尾部窗口渲染） */
.load-earlier {
    align-self: center;
    flex-shrink: 0;
    padding: .14rem .4rem;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 9999px;
    font-size: .28rem;
    color: #1890ff;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    transition: background 0.2s;

    &:active {
        background: rgba(24, 144, 255, 0.08);
    }
}

.message {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    padding: .2rem;

    &.user {
        align-self: flex-end;
        align-items: flex-end;

        .meta {
            text-align: right;
            font-size: .28rem;
            color: #6b7280;
            margin-bottom: .1rem;
        }

        .bubble {
            background: linear-gradient(135deg, #d5e6fb, #bfdbfe);
            padding: .2rem .3rem;
            border-radius: 12px 12px 0 12px;
            font-size: .34rem;
            box-shadow: 0 1px 2px rgba(30, 64, 175, 0.1);
        }
    }

    &.ai {
        align-self: flex-start;
        align-items: flex-start;

        .meta {
            text-align: left;
            font-size: .28rem;
            color: #6b7280;
            margin-bottom: .1rem;
        }

        .bubble {
            background: linear-gradient(135deg, #ffffff, #f9fafb);
            padding: .2rem .3rem;
            border-radius: 0 12px 12px 12px;
            font-size: .34rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.03);
        }
    }

    .bubble .text {
        word-break: break-word;
        white-space: pre-wrap;
        color: #333;
    }
}

/* 语言标签 */
.lang-tag {
    display: inline-block;
    margin-bottom: .1rem;
    padding: .02rem .16rem;
    font-size: .24rem;
    color: #1890ff;
    background: rgba(24, 144, 255, 0.08);
    border: 1px solid rgba(24, 144, 255, 0.2);
    border-radius: 9999px;
}

/* ========== 语音消息气泡（微信式） ========== */
.audio-bubble {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .12rem;
    cursor: pointer;
    min-width: 2.6rem;
    padding: .15rem .2rem !important;

    .play-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        svg {
            width: .36rem;
            height: .36rem;
            color: #1e40af;
        }
    }

    .wave-play {
        display: flex;
        align-items: center;
        gap: 3px;
        height: .3rem;
        flex-shrink: 0;

        span {
            display: block;
            width: 3px;
            height: 10px;
            background: #1e40af;
            border-radius: 2px;
            opacity: 0.35;
        }

        &.playing span {
            animation: audioWave 0.8s infinite ease-in-out;
            opacity: 1;

            &:nth-child(1) { animation-delay: 0s; }
            &:nth-child(2) { animation-delay: 0.15s; }
            &:nth-child(3) { animation-delay: 0.3s; }
            &:nth-child(4) { animation-delay: 0.45s; }
        }
    }

    .audio-duration {
        font-size: .28rem;
        color: #1e40af;
        flex-shrink: 0;
    }

    /* 语音识别结果（独立一行显示） */
    .transcription {
        flex-basis: 100%;
        margin-top: .08rem;
        padding-top: .12rem;
        border-top: 1px solid rgba(30, 64, 175, 0.12);
        font-size: .26rem;
        line-height: 1.5;
        color: #64748b;
        word-break: break-word;
        white-space: pre-wrap;
        text-align: left;

        .transcription-label {
            display: inline-block;
            margin-right: .08rem;
            padding: 0 .12rem;
            font-size: .22rem;
            color: #1e40af;
            background: rgba(30, 64, 175, 0.08);
            border-radius: 4px;
            vertical-align: middle;
        }
    }
}

@keyframes audioWave {
    0%, 100% { height: 10px; }
    50% { height: 22px; }
}

/* ========== 译文语音播放（火山 TTS） ========== */
.tts-player {
    display: inline-flex;
    align-items: center;
    gap: .12rem;
    margin-top: .16rem;
    padding: .1rem .22rem;
    background: linear-gradient(135deg, #e8f4ff, #d6ecff);
    border: 1px solid rgba(24, 144, 255, 0.25);
    border-radius: 9999px;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.2s;

    &:active {
        background: rgba(24, 144, 255, 0.15);
        transform: scale(0.97);
    }

    .tts-play-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        svg {
            width: .3rem;
            height: .3rem;
            color: #1890ff;
        }
    }

    .tts-label {
        font-size: .28rem;
        color: #1890ff;
        flex-shrink: 0;
    }

    .tts-wave {
        display: flex;
        align-items: center;
        gap: 2px;
        height: .26rem;

        span {
            display: block;
            width: 2.5px;
            height: 8px;
            background: #1890ff;
            border-radius: 2px;
            opacity: 0.35;
        }

        &.playing span {
            animation: audioWave 0.8s infinite ease-in-out;
            opacity: 1;

            &:nth-child(1) { animation-delay: 0s; }
            &:nth-child(2) { animation-delay: 0.15s; }
            &:nth-child(3) { animation-delay: 0.3s; }
            &:nth-child(4) { animation-delay: 0.45s; }
        }
    }
}

/* 三点加载动画 */
.dot-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 20px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #1890ff;
    animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

/* ========== 底部操作区 ========== */
.chat-footer {
    flex-shrink: 0;
    border-top: 1px solid rgba(232, 232, 232, 0.5);
    background-color: rgba(255, 255, 255, 0.97);
    width: 100%;
    backdrop-filter: blur(5px);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    padding-top: 0.1rem;
    padding-bottom: env(safe-area-inset-bottom);
    box-sizing: border-box;

    /* 目标语言选择 */
    .language-selector {
        margin: 0 .3rem .1rem .3rem;
        position: relative;

        .target-lang {
            color: #e53935;
            font-weight: 600;
        }

        .language-selector-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: .1rem;
            padding: .18rem .3rem;
            background: #f0f2f5;
            border-radius: 8px;
            font-size: .34rem;
            color: #666;
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.2s;

            &:active {
                background: rgba(24, 144, 255, 0.08);
                color: #1890ff;
            }

            .language-arrow {
                font-size: .24rem;
                transition: transform 0.2s;

                &.open {
                    transform: rotate(180deg);
                }
            }
        }

        .language-tags {
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: .2rem;
            display: flex;
            flex-wrap: wrap;
            gap: .15rem;
            z-index: 100;
            margin-bottom: .1rem;

            .language-tag {
                padding: .15rem .35rem;
                background: #f5f5f5;
                border-radius: 6px;
                font-size: .28rem;
                color: #555;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;

                &:active {
                    background: #e8e8e8;
                }

                &.active {
                    background: linear-gradient(135deg, #1890ff, #096dd9);
                    color: #fff;
                    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.25);
                }
            }
        }
    }

    /* 输入区 */
    .input-area {
        position: relative;
        padding-bottom: .2rem;

        /* 模式切换按钮（麦克风 / 键盘） */
        .mode-switch-btn {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: .6rem;
            height: .6rem;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s;

            &:active {
                background: rgba(24, 144, 255, 0.08);
            }

            .switch-icon {
                width: .42rem;
                height: .42rem;
            }
        }

        /* 文本模式输入条 */
        .input-container {
            display: flex;
            align-items: center;
            background-color: rgba(248, 248, 248, 0.95);
            border-radius: 24px;
            padding: 0.1rem .2rem 0.1rem .1rem;
            margin: .1rem .3rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            position: relative;
            border: 1px solid rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease;

            &:focus-within {
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                border-color: rgba(24, 144, 255, 0.2);
            }

            input {
                flex: 1;
                min-width: 0;
                border: none;
                background-color: transparent;
                padding: 0.25rem 0.3rem;
                font-size: .36rem;
                outline: none;
                color: #333;

                &::placeholder {
                    color: #aaa;
                }
            }

            .send-btn {
                background: linear-gradient(135deg, #1890ff, #096dd9);
                color: white;
                border: none;
                padding: 0.25rem 0.6rem;
                font-size: .3rem;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 2px 5px rgba(24, 144, 255, 0.25);
                flex-shrink: 0;

                &:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                &:hover {
                    transform: translateY(-1px);
                }

                &:active {
                    transform: translateY(1px);
                }
            }
        }

        /* 语音模式输入条（仿新版微信：模式切换键 + 描边胶囊按住按钮） */
        .voice-input-container {
            display: flex;
            align-items: center;
            margin: .1rem .3rem;
            gap: .1rem;

            .hold-area {
                position: relative;
                flex: 1;
                min-width: 0;
            }

            /* 按住说话按钮：长椭圆胶囊 + 外围一圈线条描边（新版微信样式特征） */
            .hold-btn {
                height: .8rem;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: .1rem;
                border-radius: 9999px;
                background-color: #fff;
                border: 1px solid rgba(0, 0, 0, 0.06);
                box-shadow:
                    0 0 0 3px rgba(24, 144, 255, 0.08),
                    0 2px 6px rgba(0, 0, 0, 0.04);
                font-size: .32rem;
                font-weight: 500;
                color: #333;
                cursor: pointer;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
                -webkit-tap-highlight-color: transparent;
                transition: background 0.15s, transform 0.1s, box-shadow 0.15s, color 0.15s;

                .hold-mic {
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    svg {
                        width: .34rem;
                        height: .34rem;
                        color: #1890ff;
                    }
                }

                &:active {
                    transform: scale(0.97);
                }

                &.holding {
                    background-color: #ececec;
                    box-shadow:
                        0 0 0 3px rgba(24, 144, 255, 0.16),
                        0 2px 6px rgba(0, 0, 0, 0.06);
                    transform: scale(0.97);
                }

                &.canceling {
                    background-color: #fdecec;
                    border-color: rgba(255, 59, 48, 0.25);
                    box-shadow:
                        0 0 0 3px rgba(255, 59, 48, 0.12),
                        0 2px 6px rgba(0, 0, 0, 0.04);
                    color: #ff3b30;
                }
            }
        }
    }
}

@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

/* ========== 录音遮罩（仿新版微信全屏录音浮层） ========== */
.record-mask {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    /* 必须穿透：录音指针事件由 setPointerCapture 锁定在按住按钮上，遮罩不能拦截 */
    pointer-events: none;
    /* 防止长按遮罩文字（上滑取消/松开结束）被选中复制，打断录音手势 */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;

    .record-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translateY(-8%);
        transition: color 0.15s;
    }

    /* 顶部"上滑取消"提示 */
    .record-hint {
        display: flex;
        align-items: center;
        gap: .06rem;
        font-size: .26rem;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: .5rem;

        .record-arrow {
            width: .3rem;
            height: .3rem;
            animation: hintFloat 1.2s ease-in-out infinite;
        }
    }

    /* 波形动画：5 根音量柱 */
    .record-wave {
        display: flex;
        align-items: center;
        gap: .12rem;
        height: .9rem;
        margin-bottom: .4rem;

        span {
            width: .08rem;
            height: .18rem;
            border-radius: 9999px;
            background: #4a9eff;
            box-shadow: 0 0 8px rgba(74, 158, 255, 0.6);
            animation: recordWave 0.8s infinite ease-in-out;

            &:nth-child(2) { animation-delay: 0.1s; }
            &:nth-child(3) { animation-delay: 0.2s; }
            &:nth-child(4) { animation-delay: 0.3s; }
            &:nth-child(5) { animation-delay: 0.4s; }
        }
    }

    /* 录音时长 */
    .record-seconds {
        font-size: .8rem;
        font-weight: 700;
        color: #fff;
        line-height: 1;
        margin-bottom: .3rem;
        font-variant-numeric: tabular-nums;

        em {
            font-style: normal;
            font-size: .34rem;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.6);
            margin-left: .08rem;
        }
    }

    /* 状态文案 */
    .record-status {
        font-size: .32rem;
        color: rgba(255, 255, 255, 0.9);
        letter-spacing: 0.02rem;
    }

    /* 上滑取消态：整体转红 */
    .record-panel.canceling {
        .record-hint {
            color: #ff6b63;
        }

        .record-wave span {
            background: #ff6b63;
            box-shadow: 0 0 8px rgba(255, 107, 99, 0.6);
        }

        .record-status {
            color: #ff6b63;
        }
    }
}

/* 录音期间全局锁定文本选择（body 动态 class，由 watch(isRecording) 控制） */
:global(.record-lock-select),
:global(.record-lock-select *) {
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
}

/* 遮罩淡入淡出 */
.mask-fade-enter-active {
    animation: maskFadeIn 0.18s ease;
}

.mask-fade-leave-active {
    animation: maskFadeIn 0.12s ease reverse;
}

@keyframes maskFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 录音波形柱动画 */
@keyframes recordWave {
    0%, 100% { height: .16rem; }
    50% { height: .62rem; }
}

/* 上滑提示箭头浮动 */
@keyframes hintFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}
</style>