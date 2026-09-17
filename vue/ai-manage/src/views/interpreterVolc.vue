<template>
  <div class="interpreter-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <!-- 返回按钮：白底胶囊 + 左箭头，与 translateChat.vue 的 header-back 一致 -->
      <div class="nav-back" @click="goBack" title="返回">
        <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        返回
      </div>
      <h2 class="nav-title">同声传译</h2>
    </div>

    <!-- 主内容区 -->
    <div class="content">
      <!-- API Key 未配置警告 -->
      <el-alert
        v-if="!keyReady"
        class="key-alert"
        type="warning"
        :closable="false"
        show-icon
        title="未配置火山引擎 API Key"
        description="请在 src/api/astTranslate.js 中配置 AST_API_KEY（控制台：https://console.volcengine.com/speech/new）"
      />

      <!-- 模式切换 -->
      <div class="mode-tabs">
        <div class="mode-tab" :class="{ active: mode === 'realtime' }" @click="switchMode('realtime')">
          <el-icon><Microphone /></el-icon>
          <span>实时传译</span>
        </div>
        <div class="mode-tab" :class="{ active: mode === 'offline' }" @click="switchMode('offline')">
          <el-icon><Upload /></el-icon>
          <span>在线翻译</span>
        </div>
      </div>

      <!-- 源语言 / 目标语言选择 -->
      <div class="language-bar">
        <div class="lang-select">
          <span class="lang-label">源语言</span>
          <el-select v-model="sourceLang" size="large">
            <el-option v-for="lang in sourceLanguages" :key="lang.value" :label="lang.label" :value="lang.value" />
          </el-select>
        </div>

        <div class="swap-btn" @click="swapLanguages">
          <el-icon :size="20"><Switch /></el-icon>
        </div>

        <div class="lang-select">
          <span class="lang-label">目标语言</span>
          <!-- 窄屏防横向翻转：仅允许垂直方向回退；preventOverflow 使能 altAxis 将下拉整体左移到视口内，保证始终显示在下方 -->
          <el-select
            v-model="targetLang"
            size="large"
            :fallback-placements="['bottom-start', 'bottom-end', 'top-start', 'top-end']"
            :popper-options="{
              modifiers: [
                { name: 'preventOverflow', options: { mainAxis: true, altAxis: true, padding: 8 } },
              ],
            }"
          >
            <el-option v-for="lang in targetLanguages" :key="lang.value" :label="lang.label" :value="lang.value" />
          </el-select>
        </div>
      </div>

      <!-- 翻译参数 -->
      <div class="params-bar">
        <div class="param-item">
          <span class="lang-label">翻译模式</span>
          <div class="param-tabs">
            <div class="param-tab" :class="{ active: translateMode === 's2s' }" @click="translateMode = 's2s'">语音 ↔ 语音</div>
            <div class="param-tab" :class="{ active: translateMode === 's2t' }" @click="translateMode = 's2t'">语音 → 文本</div>
          </div>
        </div>
        <div class="param-item speaker-select" v-if="translateMode === 's2s'">
          <span class="lang-label">说话人音色</span>
          <el-select v-model="speakerId" size="large">
            <el-option v-for="s in speakers" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </div>
        <div class="param-item">
          <span class="lang-label">服务端降噪</span>
          <el-switch v-model="denoise" />
        </div>
      </div>
      <p class="params-hint">提示：AST 服务不支持会话中切换语言 / 模式 / 音色，变更后实时传译将自动断开，需重新连接。</p>

      <!-- ============ 离线翻译模式 ============ -->
      <template v-if="mode === 'offline'">
        <!-- 上传区域 -->
        <div class="upload-area" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
          <input ref="fileInput" type="file" accept="audio/*" style="display: none;" @change="handleFileChange" />
          <div v-if="!audioFile" class="upload-placeholder">
            <el-icon :size="48" color="#c0c4cc"><UploadFilled /></el-icon>
            <p class="upload-text">点击或拖拽上传音频文件</p>
            <p class="upload-hint">支持 WAV、MP3、FLAC、AAC、OGG、OPUS、M4A、WMA、AMR</p>
          </div>
          <div v-else class="file-info">
            <el-icon :size="32" color="#409eff"><Headset /></el-icon>
            <div class="file-detail">
              <span class="file-name">{{ audioFile.name }}</span>
              <span class="file-size">{{ formatFileSize(audioFile.size) }}</span>
            </div>
            <el-button type="danger" text @click.stop="removeFile">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 音频预览 -->
        <div v-if="audioFile" class="audio-preview">
          <audio ref="audioPlayer" :src="audioUrl" controls style="width: 100%;"></audio>
        </div>

        <!-- 翻译按钮 -->
        <div class="action-bar">
          <el-button type="primary" size="large" :loading="isTranslating" :disabled="!audioFile || isTranslating" @click="startOfflineTranslate" class="translate-btn">
            <el-icon v-if="!isTranslating"><VideoPlay /></el-icon>
            {{ isTranslating ? '翻译中...' : '开始翻译' }}
          </el-button>
          <el-button v-if="isTranslating" size="large" @click="cancelOfflineTranslate" class="cancel-btn">
            取消
          </el-button>
        </div>

        <!-- 翻译进度 -->
        <div v-if="isTranslating" class="progress-bar">
          <el-progress :percentage="offlineProgress" :stroke-width="10" :text-inside="true" />
        </div>

        <!-- 结果区域 -->
        <div v-if="offlineResultReady" class="result-section">
          <div class="result-header">
            <h3>翻译结果</h3>
            <el-tag type="info" effect="dark">原文</el-tag>
            <el-tag type="success" effect="dark">译文</el-tag>
            <el-tag v-if="translateMode === 's2s'" type="warning" effect="dark">音频</el-tag>
          </div>

          <!-- 文字结果：原文识别 -->
          <div class="realtime-block">
            <div class="block-header">
              <span class="block-label">原文识别</span>
            </div>
            <div class="realtime-text-box" ref="offlineSourceBox">
              <span v-if="offlineSourceText" class="realtime-text-content">{{ offlineSourceText }}</span>
              <span v-else class="realtime-placeholder">识别文字将在此显示...</span>
              <span v-if="isTranslating" class="typing-cursor">|</span>
            </div>
          </div>

          <!-- 文字结果：译文 -->
          <div class="realtime-block">
            <div class="block-header">
              <span class="block-label">译文</span>
            </div>
            <div class="realtime-text-box" ref="offlineTargetBox">
              <span v-if="offlineTargetText" class="realtime-text-content">{{ offlineTargetText }}</span>
              <span v-else class="realtime-placeholder">翻译文字将在此显示...</span>
              <span v-if="isTranslating" class="typing-cursor">|</span>
            </div>
            <el-button class="copy-btn" type="primary" text @click="copyText(offlineTargetText)" :disabled="!offlineTargetText">
              <el-icon><DocumentCopy /></el-icon> 复制
            </el-button>
          </div>

          <!-- 音频结果（仅 s2s） -->
          <div v-if="translateMode === 's2s' && offlineResultAudioUrl" class="audio-result">
            <audio ref="offlineAudioResult" :src="offlineResultAudioUrl" controls style="width: 100%;"></audio>
            <el-button class="download-btn" type="primary" @click="downloadResultAudio(offlineResultAudioUrl)">
              <el-icon><Download /></el-icon> 下载音频
            </el-button>
          </div>
        </div>
      </template>

      <!-- ============ 实时传译模式 ============ -->
      <template v-if="mode === 'realtime'">
        <!-- 连接状态（连接生命周期绑定麦克风：录音即自动连接） -->
        <div class="realtime-status" :class="{ connected: realtimeConnected }">
          <div class="status-dot" :class="{ active: realtimeConnected, reconnecting: isReconnecting }"></div>
          <span>{{ realtimeStatusText }}</span>
        </div>

        <!-- 麦克风控制（长按 0.5s 自动连接，松开挂断） -->
        <div class="mic-section">
          <div class="mic-button-wrap" :class="{ disabled: realtimeConnecting || isReconnecting }"
               @pointerdown="handleMicDown" @pointerup="handleMicUp"
               @pointerleave="handleMicUp" @pointercancel="handleMicUp">
            <div class="mic-button" :class="{ recording: isRecording, speaking: isSpeaking, disabled: realtimeConnecting || isReconnecting }">
              <el-icon :size="36" color="#fff"><Microphone /></el-icon>
            </div>
            <div class="mic-ripple" v-if="isRecording"></div>
          </div>
          <p class="mic-hint">{{ micHint }}</p>
        </div>

        <!-- 实时翻译结果：始终渲染以保持布局高度稳定（未连接时展示占位提示）。
             断开/松开后仍保留上次会话结果，便于查阅尾句；
             新会话/重连开始时数据会被清空，但结果区不消失，
             避免滚动到底部时结果区消失导致滚动条消失、页面闪回顶部 -->
        <div class="realtime-results">
          <!-- 识别文字（源语言） -->
          <div class="realtime-block">
            <div class="block-header">
              <span class="block-label">源语言识别</span>
              <el-tag size="small" type="info">原文</el-tag>
            </div>
            <div class="realtime-text-box" ref="realtimeSourceBox">
              <span v-if="realtimeSourceText" class="realtime-text-content">{{ realtimeSourceText }}</span>
              <span v-else class="realtime-placeholder">语音识别文字将在此显示...</span>
            </div>
          </div>

          <!-- 翻译文字（目标语言） -->
          <div class="realtime-block">
            <div class="block-header">
              <span class="block-label">翻译结果</span>
              <el-tag size="small" type="success">译文</el-tag>
            </div>
            <div class="realtime-text-box" ref="realtimeTargetBox">
              <span v-if="realtimeTargetText" class="realtime-text-content">{{ realtimeTargetText }}</span>
              <span v-else class="realtime-placeholder">翻译文字将在此显示...</span>
            </div>
            <el-button v-if="realtimeTargetText" class="copy-btn" type="primary" text @click="copyText(realtimeTargetText)" size="small">
              <el-icon><DocumentCopy /></el-icon> 复制译文
            </el-button>
          </div>

          <!-- 实时音频播放器状态（仅 s2s） -->
          <div class="realtime-audio-status" v-if="isPlayingTranslatedAudio && translateMode === 's2s'">
            <div class="audio-wave">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <span class="audio-status-text">正在播放翻译音频...</span>
          </div>

          <!-- 实时音频结果（s2s；连接/录音期间也渲染容器，仅在有 URL 时显示播放器，防止区块消失引发滚动跳动） -->
          <div v-if="translateMode === 's2s' && (realtimeResultAudioUrl || realtimeConnected || realtimeConnecting || isReconnecting || isRecording)" class="audio-result">
            <template v-if="realtimeResultAudioUrl">
              <audio :src="realtimeResultAudioUrl" controls style="width: 100%;"></audio>
              <el-button class="download-btn" type="primary" @click="downloadResultAudio(realtimeResultAudioUrl)">
                <el-icon><Download /></el-icon> 下载音频
              </el-button>
            </template>
            <span v-else class="audio-result-placeholder">录音结束后可在此播放 / 下载整段翻译音频</span>
          </div>
        </div>

        <!-- 清空按钮（连接/重连期间保持显示，防止布局坍塌引起滚动跳动） -->
        <div class="action-bar" v-if="realtimeConnected || realtimeConnecting || isReconnecting || realtimeSourceText || realtimeTargetText || realtimeResultAudioUrl">
          <el-button @click="clearRealtimeResults" :disabled="!realtimeSourceText && !realtimeTargetText && !realtimeResultAudioUrl">
            清空结果
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Switch, Upload, UploadFilled, Headset, Delete,
  VideoPlay, Microphone, DocumentCopy, Download
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  AST_LANGUAGES,
  AST_SPEAKERS,
  validateAstPair,
  isAstKeyConfigured,
  AstTranslator,
  AstMicrophoneRecorder,
  AstAudioPlayer,
  translateAudioFile,
  concatFloatPcm,
  float32PcmToWavBlob,
} from '@/api/astTranslate'
import { prewarmMicrophone } from '@/utils/micPermission'

const router = useRouter()

/** 返回上一页；无历史记录（直接打开链接进入）时兜底回首页 */
const goBack = () => {
  if (router.options.history.state.back) {
    router.back()
  } else {
    router.replace('/index')
  }
}

// ============================================================
// 共享：语言 / 模式 / 音色配置
// ============================================================
const sourceLanguages = AST_LANGUAGES
const targetLanguages = AST_LANGUAGES.filter((l) => !['yue-CN', 'sh-CN'].includes(l.value)) // 方言仅支持作为源语种
const speakers = AST_SPEAKERS

const sourceLang = ref('zh')
const targetLang = ref('en')
const translateMode = ref('s2s')   // 's2s' 语音到语音 | 's2t' 语音到文本
const speakerId = ref('zh_female_vv_uranus_bigtts')          // 空 = 复刻说话人音色
const denoise = ref(false)
const mode = ref('realtime')        // 'offline' | 'realtime'

const keyReady = isAstKeyConfigured()

/** 翻译前校验语言/模式/音色组合（官方约束） */
const checkPair = () => {
  const result = validateAstPair({
    mode: translateMode.value,
    sourceLang: sourceLang.value,
    targetLang: targetLang.value,
    speakerId: translateMode.value === 's2s' ? speakerId.value : '',
  })
  if (!result.ok) {
    ElMessage.warning(result.message)
    return false
  }
  return true
}

const swapLanguages = () => {
  const temp = sourceLang.value
  sourceLang.value = targetLang.value
  targetLang.value = temp
}

const switchMode = (newMode) => {
  if (mode.value === 'realtime' && (realtimeConnected.value || isRecording.value || realtimeConnecting.value)) {
    ElMessage.warning('请先停止实时传译（松开麦克风停止）')
    return
  }
  mode.value = newMode
  // 预热麦克风权限：切到"实时传译"标签是用户的第一次自然手势，
  // prewarmMicrophone 内部同步发起 getUserMedia（处于点击手势 activation 窗口内），
  // 提前完成授权，避免首次长按麦克风时才弹授权框打断录音手势
  if (newMode === 'realtime') {
    prewarmMicrophone().then(({ ok, state }) => {
      if (!ok) {
        ElMessage.warning(
          state === 'denied'
            ? '麦克风未授权，长按录音将失败，请在浏览器地址栏站点设置中允许'
            : '麦克风不可用，请检查是否有其他应用占用'
        )
      }
    })
  }
}

// ============================================================
// 字幕分段状态（原文 / 译文共用）
// AST 流式返回：Start 开场白 → Response 增量（非最终）→ End 最终结果
// ============================================================
const createSegmentStore = () => {
  // 必须用 reactive：computed(() => store.text()) 依赖数组的响应式跟踪，
  // 普通数组会让 computed 首次求值后永久缓存，页面永远不更新
  const segments = reactive([])
  const onStart = () => {
    segments.push({ text: '', final: false })
  }
  const onText = (text, isFinal) => {
    const cur = segments[segments.length - 1]
    if (isFinal) {
      if (cur) { cur.text = text; cur.final = true }
      else segments.push({ text, final: true })
    } else {
      if (cur && !cur.final) cur.text = text
      else segments.push({ text, final: false })
    }
  }
  const text = () => segments.filter((s) => s.text).map((s) => s.text).join(' ')
  const reset = () => { segments.length = 0 }
  return { onStart, onText, text, reset }
}

const realtimeSource = createSegmentStore()
const realtimeTarget = createSegmentStore()
const offlineSource = createSegmentStore()
const offlineTarget = createSegmentStore()

const realtimeSourceText = computed(() => realtimeSource.text())
const realtimeTargetText = computed(() => realtimeTarget.text())
const offlineSourceText = computed(() => offlineSource.text())
const offlineTargetText = computed(() => offlineTarget.text())

const realtimeSourceBox = ref(null)
const realtimeTargetBox = ref(null)
const offlineSourceBox = ref(null)
const offlineTargetBox = ref(null)

const scrollToBottom = (boxRef) => {
  nextTick(() => {
    if (boxRef.value) boxRef.value.scrollTop = boxRef.value.scrollHeight
  })
}

// ============================================================
// 模式一：离线翻译
// ============================================================
const fileInput = ref(null)
const audioFile = ref(null)
const audioUrl = ref('')
const isTranslating = ref(false)
const offlineProgress = ref(0)
const offlineResultReady = ref(false)
const offlineResultAudioUrl = ref('')
let offlineController = null
const offlineAudioChunks = []

const triggerUpload = () => {
  if (!audioFile.value) fileInput.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files?.[0]
  if (file) setFile(file)
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('audio/')) {
    setFile(file)
  } else {
    ElMessage.warning('请上传音频文件')
  }
}

const setFile = (file) => {
  removeFile(false)
  audioFile.value = file
  audioUrl.value = URL.createObjectURL(file)
}

const removeFile = (clearInput = true) => {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioFile.value = null
  audioUrl.value = ''
  if (clearInput && fileInput.value) fileInput.value.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const startOfflineTranslate = () => {
  if (!audioFile.value || isTranslating.value) return
  if (!checkPair()) return

  isTranslating.value = true
  offlineProgress.value = 0
  offlineResultReady.value = true
  offlineSource.reset()
  offlineTarget.reset()
  offlineAudioChunks.length = 0

  if (offlineResultAudioUrl.value) {
    URL.revokeObjectURL(offlineResultAudioUrl.value)
    offlineResultAudioUrl.value = ''
  }

  offlineController = translateAudioFile({
    file: audioFile.value,
    mode: translateMode.value,
    sourceLang: sourceLang.value,
    targetLang: targetLang.value,
    speakerId: translateMode.value === 's2s' ? speakerId.value : '',
    onSourceText: (text, isFinal) => {
      if (window.__AST_DEBUG) console.log('[AST-PAGE] 原文 onSourceText:', JSON.stringify(text), 'final=', isFinal)
      offlineSource.onText(text, isFinal)
      scrollToBottom(offlineSourceBox)
    },
    onTargetText: (text, isFinal) => {
      if (window.__AST_DEBUG) console.log('[AST-PAGE] 译文 onTargetText:', JSON.stringify(text), 'final=', isFinal)
      offlineTarget.onText(text, isFinal)
      scrollToBottom(offlineTargetBox)
    },
    onAudio: (bytes) => {
      offlineAudioChunks.push(bytes)
    },
    onProgress: ({ sent, total }) => {
      offlineProgress.value = Math.round((sent / total) * 100)
    },
    onError: (error) => {
      isTranslating.value = false
      console.error('翻译失败:', error)
      ElMessage.error('翻译失败: ' + (error.message || '请稍后重试'))
    },
    onDone: () => {
      if (window.__AST_DEBUG) console.log('[AST-PAGE] onDone, 音频块数=', offlineAudioChunks.length)
      isTranslating.value = false
      offlineProgress.value = 100
      if (translateMode.value === 's2s' && offlineAudioChunks.length > 0) {
        const float32 = concatFloatPcm(offlineAudioChunks)
        const blob = float32PcmToWavBlob(float32, 24000)
        offlineResultAudioUrl.value = URL.createObjectURL(blob)
      }
      ElMessage.success('翻译完成')
    },
  })
}

const cancelOfflineTranslate = () => {
  if (offlineController) {
    offlineController.cancel()
    offlineController = null
    isTranslating.value = false
    ElMessage.info('已取消翻译')
  }
}

// ============================================================
// 模式二：实时传译
// ============================================================
const realtimeConnected = ref(false)
const realtimeConnecting = ref(false)
const isRecording = ref(false)
const isSpeaking = ref(false)
const isReconnecting = ref(false)
const isPlayingTranslatedAudio = ref(false)
const realtimeResultAudioUrl = ref('')
let realtimeTranslator = null
let micRecorder = null
let realtimePlayer = null
const realtimeAudioChunks = []
let reconnectTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
let pressTimer = null // 长按计时器
let useCancelled = false // 用户连接中松开取消使用（避免误报连接失败）
let closeTimeout = null // 收尾关闭会话的兜底定时器
const LONG_PRESS_MS = 500 // 长按触发自动连接的时长

/** 连接生命周期绑定麦克风：点击录音即自动连接，停止录音即结束会话 */
const realtimeStatusText = computed(() => {
  if (isReconnecting.value) return '连接中断，自动重连中...'
  if (realtimeConnecting.value) return '正在自动连接服务...'
  if (realtimeConnected.value) return '已连接 - 实时传译中'
  return '未连接 - 长按麦克风开始'
})

const micHint = computed(() => {
  if (isReconnecting.value) return '连接中断，正在自动重连...'
  if (realtimeConnecting.value) return '正在自动连接服务，请保持按住...'
  if (isRecording.value) return isSpeaking.value ? '检测到语音...' : '正在录音，松开结束'
  return '按住说话'
})

/** 创建翻译器实例（首次连接 / 自动重连共用同一套回调） */
const createTranslator = () => {
  return new AstTranslator({
    mode: translateMode.value,
    sourceLang: sourceLang.value,
    targetLang: targetLang.value,
    speakerId: translateMode.value === 's2s' ? speakerId.value : '',
    denoise: denoise.value,
    onSourceStart: () => {
      realtimeSource.onStart()
      isSpeaking.value = true
    },
    onSourceText: (text, isFinal) => {
      realtimeSource.onText(text, isFinal)
      if (isFinal) isSpeaking.value = false
      scrollToBottom(realtimeSourceBox)
    },
    onTargetStart: () => realtimeTarget.onStart(),
    onTargetText: (text, isFinal) => {
      realtimeTarget.onText(text, isFinal)
      scrollToBottom(realtimeTargetBox)
    },
    onAudioStart: () => {
      isPlayingTranslatedAudio.value = true
      if (window.__AST_DEBUG) console.log('[AST-AUDIO] onAudioStart fired')
    },
    onAudio: (bytes) => {
      isPlayingTranslatedAudio.value = true
      if (window.__AST_DEBUG) console.log('[AST-AUDIO] onAudio called, bytes.length=', bytes?.length, 'type=', bytes?.constructor?.name)
      realtimeAudioChunks.push(bytes) // 收集供结束后合成可重复播放的 WAV
      if (!realtimePlayer) {
        realtimePlayer = new AstAudioPlayer(24000)
        if (window.__AST_DEBUG) console.log('[AST-AUDIO] AstAudioPlayer created, sampleRate=24000')
      }
      realtimePlayer.playChunk(bytes)
    },
    onAudioEnd: () => {
      isPlayingTranslatedAudio.value = false
    },
    onError: (error) => {
      console.error('实时翻译错误:', error)
      const msg = error.message || ''
      const sessionOver = /45000081|45000002/.test(msg) // 服务端已结束会话（等包超时/空音频）
      if (sessionOver && isRecording.value && !isReconnecting.value) {
        // 使用中会话被服务端结束 → 关闭残留连接并立即自动重连
        realtimeTranslator?.close()
        scheduleReconnect()
        return
      }
      if (isRecording.value && !realtimeConnected.value && !isReconnecting.value) {
        scheduleReconnect()
      } else if (!isRecording.value) {
        ElMessage.error('实时翻译错误: ' + msg)
      }
    },
    onClose: () => {
      realtimeConnected.value = false
      realtimeConnecting.value = false
      // 使用中（录音未停）连接被关闭 → 自动重连；重连中/已停止则不处理
      if (isRecording.value && !reconnectTimer && !isReconnecting.value) {
        scheduleReconnect()
      }
    },
  })
}

/** 建立连接：创建实例 → 等待 SessionStarted（首次与重连共用），成功返回 true */
const connectRealtime = async () => {
  if (realtimeConnected.value) return true
  if (!checkPair()) return false // checkPair 内部已提示具体原因

  realtimeConnecting.value = true
  realtimeSource.reset()
  realtimeTarget.reset()
  realtimeAudioChunks.length = 0
  if (realtimeResultAudioUrl.value) {
    URL.revokeObjectURL(realtimeResultAudioUrl.value)
    realtimeResultAudioUrl.value = ''
  }
  realtimeTranslator = createTranslator()
  try {
    await realtimeTranslator.connect()
    realtimeConnected.value = true
    return true
  } catch (error) {
    realtimeTranslator = null
    throw error
  } finally {
    realtimeConnecting.value = false
  }
}

/** 长按 0.5s 触发自动连接；拆分为"开始使用/挂断"的依据 */
const handleMicDown = (e) => {
  if (realtimeConnecting.value || isReconnecting.value) return
  useCancelled = false
  e.currentTarget?.setPointerCapture?.(e.pointerId)
  pressTimer = setTimeout(() => {
    pressTimer = null
    startUsing() // 长按达成 → 自动连接
  }, LONG_PRESS_MS)
}

const handleMicUp = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
    return // 未满 0.5s，本次按住取消
  }
  if (isReconnecting.value) {
    stopUsing() // 重连中松开 → 停止重连并挂断
    return
  }
  if (realtimeConnecting.value) {
    useCancelled = true
    abortUse() // 连接未完成就松开 → 取消本次使用
    return
  }
  if (isRecording.value) {
    stopUsing() // 使用结束 → 挂断连接
  }
}

/** 立即取消本次使用（连接未完成时）：直接关闭连接，不等 SessionFinished */
const abortUse = () => {
  isRecording.value = false
  isSpeaking.value = false
  isReconnecting.value = false
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectAttempts = 0
  if (realtimeTranslator) {
    realtimeTranslator.close()
    realtimeTranslator = null
  }
  realtimeConnected.value = false
  realtimeConnecting.value = false
  isPlayingTranslatedAudio.value = false
}

/** 开始使用：标记使用意愿 → 未连接则自动连接 → 连接成功后采音 */
const startUsing = async () => {
  isRecording.value = true
  try {
    if (!realtimeTranslator || !realtimeTranslator.connected) {
      const ok = await connectRealtime()
      if (!ok) { isRecording.value = false; return }
      if (!isRecording.value) return // 连接期间用户已松开（abortUse 已取消）
    }
    if (realtimeTranslator && realtimeTranslator.connected) {
      await startMicrophoneInternal()
    }
  } catch (error) {
    if (useCancelled) return // 用户主动松开取消，不弹错误
    isRecording.value = false
    ElMessage.error('连接失败: ' + (error.message || '请检查网络或 API Key 配置'))
  }
}

/** 停止使用：停录音 + 结束会话（避免空挂触发服务端等包超时） */
const stopUsing = () => {
  if (isRecording.value) {
    stopMicrophoneInternal()
    isRecording.value = false
  }
  isSpeaking.value = false
  isReconnecting.value = false
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectAttempts = 0
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
  if (realtimeTranslator) {
    const t = realtimeTranslator
    // 立即解除可用引用：收尾期间的新长按会建立独立会话，不会被本会话的 close 误伤
    realtimeTranslator = null
    t.finish()
    // 收尾：等服务端返回 SessionFinished（此前尾句字幕/TTS 数据已全部到达）再关闭；
    // 6s 超时兜底，防止服务端异常导致连接永不释放
    let closed = false
    const doClose = () => {
      if (closed) return
      closed = true
      t.close()
    }
    const origFinish = t.callbacks.onSessionFinished
    t.callbacks.onSessionFinished = () => {
      origFinish()
      // 尾句 TTS 数据已全部到达 → 合成可重复播放的 WAV（仅 s2s）
      if (translateMode.value === 's2s' && realtimeAudioChunks.length > 0) {
        try {
          const float32 = concatFloatPcm(realtimeAudioChunks)
          const blob = float32PcmToWavBlob(float32, 24000)
          realtimeResultAudioUrl.value = URL.createObjectURL(blob)
          if (window.__AST_DEBUG) console.log('[AST-AUDIO] realtime WAV 合成完成, chunks=', realtimeAudioChunks.length, 'float32Len=', float32.length)
        } catch (e) {
          console.error('[AST-AUDIO] realtime WAV 合成失败:', e)
        }
      }
      doClose()
    }
    closeTimeout = setTimeout(doClose, 6000)
  }
  realtimeConnected.value = false
  isPlayingTranslatedAudio.value = false
}

/** 自动重连：使用中会话被服务端结束/断线后自动恢复（指数退避防风暴） */
const scheduleReconnect = () => {
  if (reconnectTimer || isReconnecting.value) return
  if (!isRecording.value) return
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts = 0
    stopUsing()
    ElMessage.error('自动重连失败，请重新打开麦克风')
    return
  }
  reconnectAttempts++
  isReconnecting.value = true
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 8000)
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null
    try {
      realtimeTranslator?.close() // 清理残留旧连接（其 onClose 因 isReconnecting 不再调度）
      if (!isRecording.value) { isReconnecting.value = false; return }
      const ok = await connectRealtime()
      if (!ok) { // 语言/模式/音色组合不合法（checkPair 已提示），重连无意义
        stopUsing()
        return
      }
      reconnectAttempts = 0
      isReconnecting.value = false
      ElMessage.success('已自动重连')
    } catch (e) {
      isReconnecting.value = false
      if (isRecording.value) scheduleReconnect()
    }
  }, delay)
}

/** 实际启动录音（需已连接；发送回调引用模块级 realtimeTranslator，重连后自动指向新会话） */
const startMicrophoneInternal = async () => {
  if (!realtimeTranslator || !realtimeTranslator.connected) return
  micRecorder = new AstMicrophoneRecorder()
  try {
    await micRecorder.start((pcmBytes) => {
      if (realtimeTranslator && realtimeTranslator.connected) {
        realtimeTranslator.sendAudio(pcmBytes)
      }
    })
  } catch (error) {
    ElMessage.error('无法访问麦克风: ' + (error.message || ''))
    console.error(error)
    micRecorder = null
    stopUsing()
  }
}

/** 停止录音（不结束会话） */
const stopMicrophoneInternal = () => {
  if (micRecorder) {
    micRecorder.stop()
    micRecorder = null
  }
  isSpeaking.value = false
}

const clearRealtimeResults = () => {
  realtimeSource.reset()
  realtimeTarget.reset()
  realtimeAudioChunks.length = 0
  if (realtimeResultAudioUrl.value) {
    URL.revokeObjectURL(realtimeResultAudioUrl.value)
    realtimeResultAudioUrl.value = ''
  }
}

// AST 不支持会话中切换语言 / 模式 / 音色 / 降噪配置：变更时停止使用并断开
watch([sourceLang, targetLang, translateMode, speakerId, denoise], () => {
  if (realtimeConnected.value || isRecording.value || realtimeConnecting.value) {
    ElMessage.warning('AST 服务不支持会话中切换语言 / 模式 / 音色，已停止并断开，请重新打开麦克风')
    stopUsing()
  }
})

// 录音期间锁定全局文本选择/长按复制，防止长按页面任意文字弹出复制菜单，
// 触发 pointercancel 打断按住麦克风的录音手势（对齐 translateChat.vue 的 record-lock-select 模式）
watch(isRecording, (recording) => {
  document.body.classList.toggle('record-lock-select', recording)
})

// ============================================================
// 通用工具
// ============================================================
const copyText = async (text) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadResultAudio = (url) => {
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `translated_${Date.now()}.wav`
  a.click()
}

// ============================================================
// 清理
// ============================================================
onBeforeUnmount(() => {
  // 清理录音期全局文本选择锁，防止组件销毁后 body 残留 record-lock-select
  document.body.classList.remove('record-lock-select')
  if (pressTimer) clearTimeout(pressTimer)
  if (reconnectTimer) clearTimeout(reconnectTimer)
  if (closeTimeout) clearTimeout(closeTimeout)
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  if (offlineResultAudioUrl.value) URL.revokeObjectURL(offlineResultAudioUrl.value)
  if (realtimeResultAudioUrl.value) URL.revokeObjectURL(realtimeResultAudioUrl.value)
  if (offlineController) {
    offlineController.cancel()
    offlineController = null
  }
  if (isRecording.value) stopMicrophoneInternal()
  if (realtimeTranslator) realtimeTranslator.close()
  if (realtimePlayer) realtimePlayer.stop()
})
</script>

<style scoped>
/* ============================================================
   全局容器
   App.vue 设 body overflow: hidden，页面容器自身滚动；
   背景与字号体系对齐 translateChat.vue（#f5f5f5 底、rem 字号）
   ============================================================ */
.interpreter-container {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f5f5f5;
}

/* ============================================================
   顶部导航栏 — 对齐 translateChat 头部：渐变蓝底 + 白色胶囊徽章
   ============================================================ */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .35rem .5rem;
  background: linear-gradient(135deg, #1890ff, #0050b3);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 返回按钮：白色胶囊 + 左箭头，与 translateChat.vue 的 header-back 同款
   （top-nav 为 sticky positioned，可作 absolute 定位参照） */
.nav-back {
  position: absolute;
  left: .3rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: .08rem;
  color: #1890ff;
  font-size: .28rem;
  font-weight: 600;
  padding: .12rem .24rem;
  background: #ffffff;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s;
}

.nav-back .back-icon {
  width: .3rem;
  height: .3rem;
  flex-shrink: 0;
}

.nav-back:hover {
  background: #eef3fb;
}

.nav-back:active {
  transform: translateY(-50%) scale(0.94);
  background: #e8f0fe;
}

.nav-title {
  display: flex;
  align-items: center;
  gap: .12rem;
  font-size: .36rem;
  font-weight: 600;
  letter-spacing: 0.02rem;
  color: #ffffff;
  margin: 0;
}

.content {
  padding: .48rem .4rem;
  max-width: 800px;
  margin: 0 auto;
  box-sizing: border-box;
}

.key-alert {
  margin-bottom: .4rem;
}

:deep(.el-alert) {
  border-radius: 12px;
}

/* ============================================================
   模式切换 — 胶囊分段控件（对齐 translateChat 语言选择/切换风格）
   ============================================================ */
.mode-tabs {
  display: flex;
  gap: .08rem;
  margin-bottom: .48rem;
  background: #f0f2f5;
  border-radius: 12px;
  padding: .08rem;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
}

.mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .16rem;
  padding: .28rem 0;
  cursor: pointer;
  font-size: .32rem;
  font-weight: 500;
  color: #666;
  border-radius: 9px;
  transition: all 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.mode-tab:hover {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.06);
}

.mode-tab.active {
  color: #ffffff;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.25);
  font-weight: 600;
}

/* ============================================================
   语言选择
   ============================================================ */
.language-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .32rem;
  margin-bottom: .4rem;
  background: #ffffff;
  padding: .4rem;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.lang-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .16rem;
}

/* 下拉框宽度在 rem 下自适应（原内联 px 宽度已移除） */
.lang-select :deep(.el-select) {
  width: 3rem;
}

.speaker-select :deep(.el-select) {
  width: 4.2rem;
}

.lang-label {
  font-size: .26rem;
  color: #909399;
  font-weight: 500;
}

.swap-btn {
  width: .8rem;
  height: .8rem;
  margin-top: .44rem;
  border-radius: 50%;
  background: rgba(24, 144, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #1890ff;
  flex-shrink: 0;
}

.swap-btn:hover {
  background: rgba(24, 144, 255, 0.16);
}

/* ============================================================
   翻译参数
   ============================================================ */
.params-bar {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-wrap: wrap;
  gap: .48rem;
  margin-bottom: .24rem;
  background: #ffffff;
  padding: .32rem .4rem;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.param-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .16rem;
}

.param-tabs {
  display: flex;
  gap: .04rem;
  background: #f0f2f5;
  border-radius: 8px;
  overflow: hidden;
  padding: .06rem;
}

.param-tab {
  padding: .14rem .32rem;
  font-size: .26rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  user-select: none;
}

.param-tab:hover {
  color: #1890ff;
}

.param-tab.active {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.25);
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #1890ff;
  border-color: #1890ff;
}

.params-hint {
  margin: 0 0 .48rem;
  font-size: .24rem;
  color: #c0c4cc;
  text-align: center;
}

/* ============================================================
   上传区域
   ============================================================ */
.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: .8rem .4rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #ffffff;
  margin-bottom: .4rem;
}

.upload-area:hover {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .24rem;
}

.upload-text {
  font-size: .32rem;
  color: #606266;
  margin: 0;
}

.upload-hint {
  font-size: .26rem;
  color: #c0c4cc;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: .32rem;
  text-align: left;
}

.file-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: .08rem;
}

.file-name {
  font-size: .3rem;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
}

.file-size {
  font-size: .26rem;
  color: #909399;
}

/* 音频预览 */
.audio-preview {
  margin-bottom: .4rem;
  background: #ffffff;
  border-radius: 12px;
  padding: .32rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* ============================================================
   按钮 — 主按钮渐变胶囊（对齐 translateChat send-btn）
   ============================================================ */
.action-bar {
  display: flex;
  justify-content: center;
  gap: .24rem;
  margin-bottom: .48rem;
}

.translate-btn {
  min-width: 4rem;
  height: .96rem;
  font-size: .32rem;
  font-weight: 500;
  border-radius: 24px !important;
  background: linear-gradient(135deg, #1890ff, #096dd9) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.25) !important;
  transition: all 0.2s;
}

.translate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35) !important;
}

.translate-btn:active {
  transform: translateY(1px);
}

.cancel-btn {
  height: .96rem;
  font-size: .32rem;
  border-radius: 24px !important;
}

/* ============================================================
   进度条
   ============================================================ */
.progress-bar {
  margin-bottom: .48rem;
  background: #ffffff;
  border-radius: 12px;
  padding: .32rem .4rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-progress-bar__outer) {
  border-radius: 8px;
  background-color: #f0f2f5;
}

:deep(.el-progress-bar__inner) {
  border-radius: 8px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

/* ============================================================
   离线结果区域
   ============================================================ */
.result-section {
  background: #ffffff;
  border-radius: 12px;
  padding: .48rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.result-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .2rem;
  margin-bottom: .32rem;
}

.result-header h3 {
  margin: 0;
  font-size: .32rem;
  font-weight: 600;
  color: #303133;
}

/* 结果标签：原文/译文/音频 — 圆角胶囊描边风格（对齐 translateChat lang-tag） */
:deep(.el-tag) {
  border-radius: 9999px;
  font-size: .22rem;
  height: .36rem;
  line-height: .36rem;
  padding: 0 .16rem !important;
  border: 1px solid transparent;
}

:deep(.el-tag--info) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.08);
  border-color: rgba(24, 144, 255, 0.2);
}

:deep(.el-tag--success) {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.25);
}

:deep(.el-tag--warning) {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.25);
}

/* 结果文本块（离线/实时共用） */
.realtime-block {
  background: #ffffff;
  border-radius: 12px;
  padding: .32rem .4rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.realtime-block + .realtime-block {
  margin-top: .32rem;
}

.block-header {
  display: flex;
  align-items: center;
  gap: .2rem;
  margin-bottom: .24rem;
}

.block-label {
  font-size: .28rem;
  font-weight: 600;
  color: #303133;
  /* 标题文字禁止选中/长按复制：防止长按麦克风时误触弹出复制菜单 */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.realtime-text-box {
  max-height: 4rem;
  overflow-y: auto;
  padding: .24rem;
  background: #f9fafb;
  border-radius: 8px;
  line-height: 1.8;
  font-size: .3rem;
  color: #303133;
  min-height: 1.2rem;
  box-sizing: border-box;
}

.realtime-placeholder {
  color: #c0c4cc;
  font-style: italic;
}

.realtime-text-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.typing-cursor {
  animation: blink 0.8s infinite;
  color: #1890ff;
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.copy-btn {
  margin-top: .16rem;
}

.audio-result {
  display: flex;
  flex-direction: column;
  gap: .32rem;
  align-items: flex-start;
  margin-top: .32rem;
}

.download-btn {
  border-radius: 8px !important;
}

.audio-result-placeholder {
  font-size: .26rem;
  color: #c0c4cc;
}

/* ============================================================
   实时传译状态
   ============================================================ */
.realtime-status {
  display: flex;
  align-items: center;
  gap: .24rem;
  padding: .32rem .4rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid transparent;
  margin-bottom: .4rem;
  font-size: .28rem;
  color: #606266;
}

.realtime-status.connected {
  border-left-color: #67c23a;
}

.status-dot {
  width: .2rem;
  height: .2rem;
  border-radius: 50%;
  background: #dcdfe6;
  flex-shrink: 0;
  transition: background 0.3s;
}

.status-dot.active {
  background: #67c23a;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.5);
  animation: pulse 2s infinite;
}

.status-dot.reconnecting {
  background: #e6a23c;
  box-shadow: 0 0 8px rgba(230, 162, 60, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(103, 194, 58, 0.5); }
  50% { box-shadow: 0 0 16px rgba(103, 194, 58, 0.8); }
}

/* ============================================================
   麦克风 — 主色改为 #1890ff 渐变
   ============================================================ */
.mic-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: .6rem 0;
  /* 禁止选中/长按复制：长按麦克风按钮区域内任何元素（按钮/提示文字/图标）
     都不会弹出系统复制菜单；录音期间另有全局 record-lock-select 兜底 */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.mic-button-wrap {
  position: relative;
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
}

.mic-button-wrap.disabled {
  cursor: not-allowed;
}

.mic-button-wrap.disabled:hover .mic-button {
  transform: none;
}

.mic-button {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.mic-button:hover {
  transform: scale(1.05);
}

.mic-button.recording {
  background: linear-gradient(135deg, #f56c6c, #c45656);
  box-shadow: 0 4px 20px rgba(245, 108, 108, 0.4);
}

.mic-button.speaking {
  animation: speakPulse 0.6s infinite alternate;
}

.mic-button.disabled {
  background: linear-gradient(135deg, #c0c4cc, #909399);
  box-shadow: 0 4px 15px rgba(144, 147, 153, 0.3);
}

@keyframes speakPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.mic-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 3px solid rgba(245, 108, 108, 0.4);
  animation: ripple 1.5s infinite;
}

@keyframes ripple {
  0% { width: 1.6rem; height: 1.6rem; opacity: 1; }
  100% { width: 2.8rem; height: 2.8rem; opacity: 0; }
}

.mic-hint {
  margin-top: .32rem;
  font-size: .28rem;
  color: #909399;
  text-align: center;
  /* 禁止选中/长按复制：长按麦克风录音时，误触提示文字会弹出复制菜单打断录音 */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* 录音期间全局锁定文本选择（body 动态 class，由 watch(isRecording) 控制）
   对齐 translateChat.vue 的 record-lock-select：录音期间页面任意文字
   长按都不会触发原生选中/复制菜单，避免 pointercancel 打断麦克风手势 */
:global(.record-lock-select),
:global(.record-lock-select *) {
  user-select: none !important;
  -webkit-user-select: none !important;
  -webkit-touch-callout: none !important;
}

/* ============================================================
   实时结果
   ============================================================ */
.realtime-results {
  display: flex;
  flex-direction: column;
  gap: .32rem;
  margin-bottom: .4rem;
}

/* 实时音频波形 */
.realtime-audio-status {
  display: flex;
  align-items: center;
  gap: .24rem;
  padding: .24rem .32rem;
  background: rgba(24, 144, 255, 0.08);
  border-radius: 8px;
}

.audio-wave {
  display: flex;
  align-items: center;
  gap: 3px;
  height: .48rem;
}

.audio-wave span {
  display: block;
  width: 3px;
  height: .16rem;
  background: #1890ff;
  border-radius: 2px;
  animation: wave 0.8s infinite ease-in-out;
}

.audio-wave span:nth-child(1) { animation-delay: 0s; }
.audio-wave span:nth-child(2) { animation-delay: 0.1s; }
.audio-wave span:nth-child(3) { animation-delay: 0.2s; }
.audio-wave span:nth-child(4) { animation-delay: 0.3s; }
.audio-wave span:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { height: .16rem; }
  50% { height: .4rem; }
}

.audio-status-text {
  font-size: .26rem;
  color: #1890ff;
  font-weight: 500;
}
</style>