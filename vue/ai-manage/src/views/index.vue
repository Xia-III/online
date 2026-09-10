<template>
    <div class="chat-dialog">
        <!-- 修改下拉刷新区域，移除单独的刷新指示器 -->
        <div class="header">
            <div class="agent-info">
                <div class="agent-name">小蜗</div>
            </div>
        </div>

        <div class="chat-content" ref="chatContentRef">
            <!-- 历史消息提示区域只在下拉时显示 -->
            <div v-if="conversation_id && isAtTop && isPulling" class="history-available-hint" :class="{ 'refreshing': isRefreshing, 'ready': isPulling && pullDistance >= pullThreshold }" ref="hintRef">
                <span>{{ isRefreshing ? '正在获取历史消息...' : (isPulling ? (pullDistance >= pullThreshold ? '释放立即获取历史消息' : '下拉获取历史消息') : '下拉可查看历史消息') }}</span>
            </div>
            
            <!-- 历史消息区域 -->
            <div v-if="historyMessages.length > 0" class="history-messages">
                <div class="chat-container" v-for="(message, index) in historyMessages" :key="'history-'+index">
                    <div class="message user">
                        <div class="meta">{{ formatTime(message.timestamp) }}</div>
                        <div class="bubble">{{ message.question }}</div>
                    </div>
                    <div class="message agent">
                        <div class="meta">小蜗{{ formatTime(message.timestamp) }}</div>
                        <div class="bubble">
                            <div>
                                <div v-html="formatMessage(message.answer)"></div>
                                <div v-if="message.imageUrls && message.imageUrls.length" class="answer-image">
                                    <img v-for="(img, idx) in message.imageUrls" :key="img + idx" :src="img" alt="图片" @error="() => {}"
                                        style="max-width: 100%" @click.stop='yltp(img)' />
                                </div>
                                <div class="video-wrapper" v-if="message.videoUrls && message.videoUrls.length">
                                    <video v-for="(vid, idx) in message.videoUrls" :key="vid + idx" class="video-player" :src="vid" controls width="100%"></video>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chat-userQuestion slide-in-active">
                <div class="message agent">
                    <div class="meta">小蜗{{ formatTime(new Date()) }}</div>
                    <div class="bubble">你好，我是你的客服助手，很高兴为您服务，有什么可以帮助到您的吗？</div>
                </div>
                <div class="message agent">
                    <div class="meta">小蜗{{ formatTime(new Date()) }}</div>
                    <div class="quick-questions">
                        <div class="title">热点问题</div>
                        <div class="allquestions">
                            <!-- 二级菜单时显示返回上一级按钮 -->
                            <div v-if="hotLevel === 2" class="question-list back-to-parent" @click="() => { currentHotList = hotQuestions; hotLevel = 1; hotParent = null; }">
                                <span style="color: #fff; background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%); font-weight: bold; border-radius: 8px; padding: 0.3rem 1.2rem; display: inline-block; box-shadow: 0 2px 8px rgba(24,144,255,0.18);">← 返回上一级</span>
                            </div>
                            <!-- 三级菜单（产品相关问题二级目录）时显示返回上一级按钮 -->
                            <div v-if="hotLevel === 3" class="question-list back-to-parent" @click="() => { currentHotList = productCategories.map(cat => ({ name: cat.name })); hotLevel = 2; hotParent = '产品相关问题'; }">
                                <span style="color: #fff; background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%); font-weight: bold; border-radius: 8px; padding: 0.3rem 1.2rem; display: inline-block; box-shadow: 0 2px 8px rgba(24,144,255,0.18);">← 返回上一级</span>
                            </div>
                            <div class="question-list" v-for="(question, index) in currentHotList" :key="question.name + index"
                                @click="onHotQuestionClick(question)">
                                <span>{{ hotLevel === 1 ? (question.id + '.' + question.name) : question.name }}</span>
                                <van-icon name="arrow" v-if="hotLevel === 1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chat-container" v-for="(message, index) in qaPairs" :key="index">
                <div class="message user">
                    <div class="meta">{{ formatTime(message.timestamp) }}</div>
                    <div class="bubble">{{ message.question }}</div>
                </div>
                <div class="message agent">
                    <div class="meta">小蜗{{ formatTime(message.timestamp) }}</div>
                    <div class="bubble">
                        <div>
                            <div v-html="formatMessage(message.answer)"></div>
                            <!-- {{ formatMessage(message.answer) }} -->
                            <div v-if="message.imageUrls && message.imageUrls.length" class="answer-image">
                                <img v-for="(img, idx) in message.imageUrls" :key="img + idx" :src="img" alt="图片" @error="() => {}"
                                    style="max-width: 100%" @click.stop='yltp(img)' />
                            </div>
                            <div class="video-wrapper" v-if="message.videoUrls && message.videoUrls.length">
                                <video v-for="(vid, idx) in message.videoUrls" :key="vid + idx" class="video-player" :src="vid" controls width="100%"></video>
                            </div>
                        </div>
                        <div class="dot-loading" v-if="message.questionLoading">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                        <!-- 点赞反馈 -->
                        <div class="feedback" v-if="message.feedbackFlag">
                            <div class="action" :class="{ disabled: message.dislike }"
                                @click="!message.dislike && feedbackHelp('like')">
                                <img v-if="!message.like" src="../assets/diazna.png" alt="">
                                <img v-else src="../assets/diazan11.png" alt="">
                                <span :class="message.like ? 'like' : ''">有帮助</span>
                            </div>
                            <div class="action" :class="{ disabled: message.like }"
                                @click="!message.like && feedbackHelp('dislike')">
                                <img v-if="!message.dislike" src="../assets/121212.png" alt="">
                                <img v-else src="../assets/budianzan11.png" alt="">
                                <span :class="message.dislike ? 'like' : ''">没帮助</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 这个是滚动目标，用于 scrollIntoView -->
            <div ref="bottomAnchor"></div>
        </div>

        <div class="chat-footer">
            <!-- 支付常见问题与产品相关问题按钮并排放置 -->
            <div class="buttons-container">
                <div class="payment-issues-container">
                    <button class="payment-issues-btn" @click="togglePaymentIssues">
                        常见问题
                    </button>
                    <!-- 标签列表，根据isPaymentIssuesVisible控制显示 -->
                    <div v-if="isPaymentIssuesVisible" class="payment-tags" @wheel.stop>
                        <div v-for="(tag, index) in tags" :key="index" class="payment-tag" @click="selectPaymentIssue(tag)">
                            {{ tag }}
                        </div>
                    </div>
                </div>
                
                <!-- 新增产品相关问题按钮 -->
                <div class="product-issues-container">
                    <button class="product-issues-btn" @click="toggleProductIssues">
                        相关问题
                    </button>
                    <!-- 产品标签列表，根据isProductIssuesVisible控制显示 -->
                    <div v-if="isProductIssuesVisible" class="product-tags" @wheel.stop>
                        <div v-for="(tag, index) in productCategories" :key="index" class="product-tag" @click="selectProductIssue(tag)">
                            {{ tag.name }}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- input 框 -->
            <div class="input-area">
                <!-- 模式切换 -->
                <div class="mode-toggle">
                    <div class="mode-segment" :class="{ active: !isImageMode && !isTranslateMode }" @click="setChatMode('chat')">
                        <span class="mode-icon">💬</span>
                        <span class="mode-label">聊天</span>
                    </div>
                    <div class="mode-segment" :class="{ active: isImageMode }" @click="setChatMode('image')">
                        <span class="mode-icon">🎨</span>
                        <span class="mode-label">生图</span>
                    </div>
                    <div class="mode-segment" :class="{ active: isTranslateMode }" @click="setChatMode('translate')">
                        <span class="mode-icon">🌐</span>
                        <span class="mode-label">翻译</span>
                    </div>
                </div>
                <!-- 翻译模式：目标语言选择 -->
                <div v-if="isTranslateMode" class="language-selector">
                    <div class="language-selector-btn" @click="toggleLanguageSelector">
                        <span>目标语言：<span class="target-lang">{{ targetLanguage }}</span></span>
                        <span class="language-arrow" :class="{ open: isLanguageSelectorVisible }">▾</span>
                    </div>
                    <div v-if="isLanguageSelectorVisible" class="language-tags" @click.stop>
                        <div v-for="lang in targetLanguages" :key="lang" class="language-tag"
                             :class="{ active: targetLanguage === lang }"
                             @click="selectTargetLanguage(lang)">
                            {{ lang }}
                        </div>
                    </div>
                </div>
                <div class="input-container">
                    <input :placeholder="isTranslateMode ? '请输入要翻译的文本' : (isImageMode ? '请描述想要的图片' : '很高兴为您服务，请描述您的问题')" v-model="inputValue" @keydown.up.prevent="navigateMatches('up')"
                        @keydown.down.prevent="navigateMatches('down')" @keydown.enter="handleEnterKey" />
                    <button @click="isTranslateMode ? translateText() : (isImageMode ? generateImage() : sendQuestion())">发送</button>

                    <!-- 匹配的热门问题列表 -->
                    <div class="matched-questions" v-if="!isImageMode && !isTranslateMode && matchedQuestions.length > 0 && inputValue.trim().length > 0">
                        <div class="matched-question-item" v-for="(question, index) in matchedQuestions" :key="question.id"
                            :class="{ 'active': selectedMatchIndex === index }" @click="selectMatchedQuestion(question)">
                            <span v-html="highlightMatch(question.name)"></span>
                            <span v-if="question.parent" class="matched-parent">（{{ question.parent }}）</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 添加备案信息 -->
            <div class="footer-icp">
                <a href="https://beian.miit.gov.cn" target="_blank">粤ICP备2023017957号-1</a><span> · 广州欢喜莲莲信息科技服务有限公司</span>
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import { showImagePreview, showToast } from 'vant';
import { chatMessagesAPI, conversationsAPI, messagesAPI, annotationsAPI, messageFeedbackAPI, generateImageAPI, generateChatAPI } from '../api/index'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { useRoute } from 'vue-router'

// 设备指纹ID
const deviceId = ref('')
const historyFirstId = ref(null) // 添加历史消息first_id参数

// 用于跟踪已显示的消息ID，防止重复加载
const displayedMessageIds = ref(new Set());

// 下拉刷新相关变量
const chatContentRef = ref(null)
const hintRef = ref(null) // 提示区域引用
const isRefreshing = ref(false)
const touchStartY = ref(0)
const touchStartX = ref(0) // 记录起始X坐标
const touchStartTime = ref(0) // 添加触摸开始时间
const isPulling = ref(false)
const pullThreshold = 40 // 触发刷新的阈值
const pullDistance = ref(0)
const minPullDuration = 75 // 最小下拉持续时间（毫秒）
const isAtTop = ref(false) // 是否在顶部的标志
const isHintVisible = ref(false) // 提示区域是否可见

// 历史消息加载状态
const historyLoading = ref(false)
// 历史消息列表，单独存储
const historyMessages = ref([])

// 控制支付问题列表的显示/隐藏
const isPaymentIssuesVisible = ref(false)
// 控制产品问题列表的显示/隐藏
const isProductIssuesVisible = ref(false)

// 检查提示区域是否在可视区域内
const checkHintVisibility = () => {
    if (!hintRef.value) return false;
    
    const rect = hintRef.value.getBoundingClientRect();
    // 元素顶部在视口内且元素底部也在视口内
    return (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
};

// 添加API调用方法
const getAiRecord = async (userId) => {
    try {
        const response = await fetch(`q1/AiRecord/FindByUserId?userId=${userId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });
        const result = await response.json();
        if (result.code === 0 && result.data) {
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('获取会话ID失败:', error);
        return null;
    }
}

const saveAiRecord = async (userId, dialogueId) => {
    try {
        const response = await fetch('q1/AiRecord/Add', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json-patch+json'
            },
            body: JSON.stringify({
                userId,
                dialogueId
            })
        });
        const result = await response.json();
        return result.code === 0;
    } catch (error) {
        console.error('保存会话ID失败:', error);
        return false;
    }
}

// 初始化FingerprintJS并获取设备ID
const initFingerprint = async () => {
    try {
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        deviceId.value = result.visitorId
        // 可以将设备ID存储到localStorage中以便后续使用
        localStorage.setItem('deviceId', deviceId.value)
        
        // 通过API获取历史会话ID
        const storedDialogueId = await getAiRecord(deviceId.value);
        if (storedDialogueId) {
            conversation_id.value = storedDialogueId;
            localStorage.setItem('conversation_id', conversation_id.value);
        } else {
            // 无历史会话，清除localStorage但保留内存中的conversation_id
            // 避免竞态：sendQuestion可能已在指纹加载完成前建立了新会话
            localStorage.removeItem('conversation_id');
        }
    } catch (error) {
        console.error('获取设备指纹失败:', error)
        // 如果获取失败，使用随机ID作为备用
        deviceId.value = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }
}

// 添加滚动事件监听函数以动态检测是否在顶部
const handleScroll = () => {
    if (!chatContentRef.value) return;
    // 设置一个小的阈值以改善用户体验
    isAtTop.value = chatContentRef.value.scrollTop <= 1;
    
    // 如果不在顶部，确保重置下拉状态
    if (!isAtTop.value && isPulling.value) {
        isPulling.value = false;
        pullDistance.value = 0;
        isHintVisible.value = false;
    }
    
    // 如果提示区域存在且正在下拉，检查其可见性
    if (hintRef.value && isPulling.value) {
        isHintVisible.value = checkHintVisibility();
    }
}

// 窗口大小变化时检查提示区域可见性
const handleResize = () => {
    if (hintRef.value && isPulling.value) {
        isHintVisible.value = checkHintVisibility();
    }
}

// 组件挂载时初始化指纹和滚动监听
onMounted(() => {
    initFingerprint();
    // 添加滚动事件监听
    if (chatContentRef.value) {
        chatContentRef.value.addEventListener('scroll', handleScroll);
        // 初始检查是否在顶部
        isAtTop.value = chatContentRef.value.scrollTop <= 1;
        // 手动注册触摸事件（{ passive: false } 以允许 preventDefault 阻止页面拖动）
        chatContentRef.value.addEventListener('touchstart', handleTouchStart, { passive: false });
        chatContentRef.value.addEventListener('touchmove', handleTouchMove, { passive: false });
        chatContentRef.value.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    // 锁定 body 滚动，防止下拉时拖动整个页面
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // 添加窗口大小变化事件监听
    window.addEventListener('resize', handleResize);

    // 检查 URL 参数 question
    const route = useRoute();
    if (route.query.question) {
        inputValue.value = route.query.question;
        sendQuestion();
    }
})

// 组件卸载时清理
onBeforeUnmount(() => {
    if (chatContentRef.value) {
        chatContentRef.value.removeEventListener('scroll', handleScroll);
        chatContentRef.value.removeEventListener('touchstart', handleTouchStart);
        chatContentRef.value.removeEventListener('touchmove', handleTouchMove);
        chatContentRef.value.removeEventListener('touchend', handleTouchEnd);
    }
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('click', closePaymentTagsOnClickOutside);
    document.removeEventListener('click', closeProductTagsOnClickOutside);
    document.removeEventListener('click', closeLanguageSelectorOnClickOutside);
    // 恢复 body 滚动
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
})

// 支付常见问题
const tags = ref([
    '简称变更',
    '绑定银行卡',
    '微信实名认证',
    '支付宝实名认证',
    '修改银行卡',
    '手续费结算费率',
    '搜索不到银行支付'
])

// 产品相关问题一级目录及其二级选项
const productCategories = ref([
    {
        name: '设备故障',
        children: [
            '投币故障',
            '计数光眼故障',
            '复位光眼故障',
            '上光眼故障',
            '下光眼故障',
            '投币器故障',
            '上限位故障',
            '前限位故障',
            '后限位故障',
            '左限位故障',
            '马达无币',
            '游戏币不足',
            '出珠器错误',
            '盲盒礼品空',
        ]
    },
    {
        name: '点阵屏配置',
        children: [
            'LED点阵屏二阶创建',
            'LED点阵屏分组设置',
            'LED点阵屏机器组内顺序设置',
            'LED点阵屏检查是否设置成功',
            'LED点阵屏网络连接教程（分机设置）',
            'LED点阵屏绑定教程（机器绑定教程）',
            '点阵屏头顶游戏启动动画操作流程（网页版后台）',
        ]
    },
    {
        name: '教程与账户设置',
        children: [
            '主机网络连接教程',
            'WiFi-box绑定教程',
            '欢喜乐园后台注册教程',
            '设备绑定',
            '设备安装',
            '解绑设备',
            '微信支付商家认证',
            '支付宝商家认证',
            '子账户创建',
            '商家分账设置',
        ]
    },
    {
        name: '设备二维码位置',
        children: [
            '幸运转转乐二维码位置',
            '胶囊扭蛋机二维码位置',
            '常规版扭蛋机二维码位置',
            '简易兑币机二维码位置',
            '带屏兑币机二维码位置',
        ]
    },
    {
        name: '后台核心功能',
        children: [
            '后台链接',
            '经营统计',
            '设备管理',
            '会员管理',
            '套餐设置',
            '远程投币',
            '订单管理',
            '主机联网app',
            '蜗牛森林智能主页',
            '设备离线',
        ]
    },
    {
        name: '弹珠机',
        children: [
            '弹珠机安装',
            '弹珠机自动数珠',
            '弹珠机故障排除',
        ]
    },
    {
        name: '格斗机',
        children: [
            '格斗机安装',
            '格斗机后台设置',
        ]
    },
        {
        name: '夹子机',
        children: [
            '夹子机安装',
            '夹子机后台设置',
            '夹子机礼品添加（通用）',
            '1号位校正（32夹）',
            '准度调整（通用）',
            '复位光眼常闭错误（通用）',
            '复位光眼常开错误（通用）',
            '计数光眼常闭错误',
            '下光眼常闭错误（通用）',
            '上光眼常闭错误（通用）',
            '投币器错误（通用）',
            '投币器感应不灵敏（通用）',
            '推推乐补充礼品',
            '落物光眼错误',
            '夹子机到货后第一步',
        ]
    },
]);


const hotQuestions = ref([
{ name: '产品相关问题', id: 1 },
{ name: '支付常见问题', id: 2 },
])

const answer = ref('')
const message_id = ref('')
const conversation_id = ref('')
const qaPairs = ref([])
const queryText = ref('')
const bottomAnchor = ref(null)
const disabledBtn = ref(false)
const scrollToBottom = () => {
    nextTick(() => {
        bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' })
    })
}
// 问题回答
const onQuestionClick = async (item) => {
    typeAnswers.value = false
    if (disabledBtn.value) return;
    disabledBtn.value = true;  //禁用
    queryText.value = item.name
    // 清空输入框
    inputValue.value = ''
    const newItem = { question: queryText.value, answer: '', imageUrl: '', videoUrl: '', questionLoading: true, feedbackFlag: false, like: false, dislike: false, timestamp: new Date() };
    qaPairs.value.push(newItem);
    // 获取当前问题在数组中的索引
    const index = qaPairs.value.length - 1
    await nextTick()
    // 滚动到底部
    scrollToBottom()
    
    // 内部函数：执行流式请求，支持 404 自动无会话重试
    const doSend = async (convId) => {
        try {
            const response = await fetch('v1/chat-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer app-xPJ41Pa0JlFZm0NzzvgS9l3b'
                },
                body: JSON.stringify({
                    inputs: {},
                    query: queryText.value,
                    response_mode: 'streaming',
                    conversation_id: convId,
                    user: deviceId.value || 'abc-' + Date.now(),
                    files: [{
                        type: 'image',
                        transfer_method: 'remote_url',
                        url: 'https://cloud.dify.ai/logo/logo-site.png'
                    }]
                })
            });

            if (!response.ok) {
                // 404 + 携带了会话ID → Dify 侧会话已过期，清除后无会话重试
                if (response.status === 404 && convId) {
                    conversation_id.value = '';
                    localStorage.removeItem('conversation_id');
                    console.log('会话已过期(404)，清除本地会话ID，无会话模式重试');
                    fetch(`q1/AiRecord/DeleteByUserId?userId=${deviceId.value}`, { method: 'POST', headers: { 'accept': 'text/plain' }, body: '' }).catch(() => {});
                    return await doSend('');
                }
                const statusMsg = { 400:'请求参数有误', 401:'会话已过期，请刷新重试', 403:'暂无访问权限', 404:'服务不可用', 429:'请求过于频繁，请稍后重试', 500:'服务器繁忙，请稍后重试', 502:'服务暂时不可用', 503:'服务维护中' };
                qaPairs.value[index].answer = statusMsg[response.status] || `服务异常(${response.status})，请稍后重试`;
                return;
            }
            if (!response.body) {
                qaPairs.value[index].answer = '服务响应异常，请稍后重试';
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let completedAnswer = '';
            let messageId = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const jsonStr = line.replace(/^data:\s*/, '');
                        if (jsonStr === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.event === 'message') {
                                const textFragment = parsed.answer || '';
                                completedAnswer += textFragment;
                                qaPairs.value[index].answer = completedAnswer;

                                if (!messageId && parsed.id) {
                                    messageId = parsed.id;
                                    message_id.value = messageId;
                                    displayedMessageIds.value.add(messageId);
                                    qaPairs.value[index].id = messageId;
                                }

                                if (parsed.conversation_id && !conversation_id.value) {
                                    conversation_id.value = parsed.conversation_id;
                                    localStorage.setItem('conversation_id', conversation_id.value);
                                    console.log('保存conversation_id:', conversation_id.value);
                                    await saveAiRecord(deviceId.value, conversation_id.value);
                                }

                                await nextTick();
                                scrollToBottom();
                            } else if (parsed.event === 'workflow_started' && parsed.conversation_id) {
                                console.log('工作流开始，但不从此处获取会话ID');
                            } else if (parsed.event === 'workflow_finished') {
                                const { cleanedText, imageUrls, videoUrls } = extractImageUrl(completedAnswer);
                                if (imageUrls.length > 0) {
                                    qaPairs.value[index].imageUrls = imageUrls;
                                    await loadImages(imageUrls);
                                }
                                if (videoUrls.length > 0) {
                                    qaPairs.value[index].videoUrls = videoUrls;
                                }
                                if (imageUrls.length > 0 || videoUrls.length > 0) {
                                    qaPairs.value[index].answer = cleanedText;
                                }
                                qaPairs.value[index].feedbackFlag = true;
                            }
                        } catch (err) {
                            console.warn('解析失败：', err);
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('请求被取消');
                qaPairs.value[index].answer = '请求已取消';
            } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('网络请求失败:', error);
                qaPairs.value[index].answer = '网络连接失败，请检查网络后重试';
            } else {
                console.error('请求错误:', error);
                qaPairs.value[index].answer = '服务响应异常，请稍后重试';
            }
        } finally {
            qaPairs.value[index].questionLoading = false;
            disabledBtn.value = false;
        }
    };

    await doSend(conversation_id.value);
}


const isImageLoaded = ref(false)
// 机器人返回的数据模拟打字行为输出
async function typeAnswer(text, index) {
    const { cleanedText, imageUrls, videoUrls } = extractImageUrl(text);

    // 固定总时间为2.5秒
    const totalTime = 2500; // 2.5秒
    const textLength = cleanedText.length;

    if (textLength === 0) {
        // 如果没有文本内容，直接返回
        await nextTick();
        scrollToBottom();
    } else {
        // 计算每个字符的延迟时间，确保总时间为2.5秒
        const charsPerChunk = Math.max(1, Math.ceil(textLength / 20)); // 分成约20个块
        const chunkDelay = totalTime / (textLength / charsPerChunk); // 每块的延迟时间

        for (let i = 0; i < textLength; i += charsPerChunk) {
            // 显示到当前位置
            const endIndex = Math.min(i + charsPerChunk, textLength);
            qaPairs.value[index].answer = cleanedText.substring(0, endIndex);

            // 每块更新后滚动
            await nextTick();
            scrollToBottom();

            // 等待下一块的时间
            if (i < textLength - charsPerChunk) {
                await new Promise(r => setTimeout(r, chunkDelay));
            }
        }
    }

    // 如果有图片，先设置URL并等待加载
    if (imageUrls.length > 0) {
        qaPairs.value[index].imageUrls = imageUrls
        await loadImages(imageUrls) // 等待图片加载
        isImageLoaded.value = true
    }

    if (videoUrls.length > 0) {
        qaPairs.value[index].videoUrls = videoUrls
    }

    console.log(qaPairs.value);
    await nextTick()
    scrollToBottom()
    qaPairs.value[index].feedbackFlag = true
}

// 图片加载函数
function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image()
        img.src = url
        img.onload = resolve
        img.onerror = resolve // 即使加载失败也继续
    })
}

// 提取所有图片和视频链接
function extractImageUrl(text) {
    // 匹配所有图片链接
    const imageRegex = /(http|https):\/\/[^\s]+?(\.png|\.jpg|\.jpeg|\.gif|\.webp)/ig;
    const videoRegex = /(http|https):\/\/[^\s]+?\.mp4/ig;
    
    // 提取所有图片链接
    const imageUrls = [];
    let match;
    let cleanedText = text;
    while ((match = imageRegex.exec(text)) !== null) {
        imageUrls.push(match[0]);
        cleanedText = cleanedText.replace(match[0], '');
    }
    // 提取所有视频链接
    const videoUrls = [];
    while ((match = videoRegex.exec(text)) !== null) {
        videoUrls.push(match[0]);
        cleanedText = cleanedText.replace(match[0], '');
    }
    cleanedText = cleanedText.trim();
    return {
        cleanedText,
        imageUrls,
        videoUrls
    };
}


//预览图片
const yltp = (dwimg) => {
    showImagePreview({
        images: [
            dwimg
        ],
        closeable: true,
    });
}

const inputValue = ref('')
const selectedMatchIndex = ref(-1) // 当前选中的匹配项索引
const isImageMode = ref(false) // 是否为图片生成模式
const isTranslateMode = ref(false) // 是否为翻译模式

// 翻译模式：目标语言选择
const targetLanguage = ref('英文')
const isLanguageSelectorVisible = ref(false)
const targetLanguages = ref([
    '中文', '英文', '日文', '韩文', '法文', '德文',
    '西班牙文', '葡萄牙文', '俄文', '泰文', '越南文',
    '阿拉伯文', '意大利文'
])

// 构建所有可直接发送的选项（支付常见问题标签、产品相关问题二级选项、热门问题）
const allProductChildren = computed(() =>
  productCategories.value.flatMap(cat =>
    cat.children.map(child => ({ name: child, parent: cat.name }))
  )
);
const allSendableQuestions = computed(() => [
  ...hotQuestions.value.map(q => ({ name: q.name, type: 'hot' })),
  ...tags.value.map(tag => ({ name: tag, type: 'pay' })),
  ...allProductChildren.value.map(q => ({ ...q, type: 'product' }))
]);

// 优化后的匹配逻辑，只匹配可发送的选项
const matchedQuestions = computed(() => {
  if (!inputValue.value || inputValue.value.trim() === '') {
    selectedMatchIndex.value = -1;
    return [];
  }
  const keyword = inputValue.value.toLowerCase().trim();
  const matches = allSendableQuestions.value
    .filter(q => q.name.toLowerCase().includes(keyword))
    .map(q => {
      const index = q.name.toLowerCase().indexOf(keyword);
      const score = 1000 - index;
      return { ...q, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  if (matches.length > 0 && selectedMatchIndex.value === -1) {
    selectedMatchIndex.value = 0;
  } else if (selectedMatchIndex.value >= matches.length) {
    selectedMatchIndex.value = matches.length - 1;
  }
  return matches;
});

// 键盘导航
const navigateMatches = (direction) => {
    if (matchedQuestions.value.length === 0) return;

    if (direction === 'up') {
        selectedMatchIndex.value = selectedMatchIndex.value <= 0
            ? matchedQuestions.value.length - 1
            : selectedMatchIndex.value - 1;
    } else {
        selectedMatchIndex.value = selectedMatchIndex.value >= matchedQuestions.value.length - 1
            ? 0
            : selectedMatchIndex.value + 1;
    }
};

// 处理回车键
const handleEnterKey = () => {
    // 翻译模式：直接翻译
    if (isTranslateMode.value) {
        translateText();
        return;
    }

    // 生图模式：直接生成图片，不走匹配项逻辑
    if (isImageMode.value) {
        generateImage();
        return;
    }

    // 聊天模式：优先选择匹配项，否则直接发送
    if (matchedQuestions.value.length > 0 && selectedMatchIndex.value >= 0) {
        selectMatchedQuestion(matchedQuestions.value[selectedMatchIndex.value]);
    } else {
        sendQuestion();
    }
};

// 高亮显示匹配的关键词
const highlightMatch = (text) => {
    if (!inputValue.value || inputValue.value.trim() === '') return text;

    const keyword = inputValue.value.trim();
    const regex = new RegExp(keyword, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
};

// 选择匹配的热门问题
const selectMatchedQuestion = (question) => {
    inputValue.value = question.name;
    selectedMatchIndex.value = -1; // 重置选中索引
    
    // 判断是问题类型
    if (typeof question.id === 'string' && question.id.startsWith('tag-')) {
        // 如果是支付标签
        sendQuestion();
    } else if (typeof question.id === 'string' && question.id.startsWith('product-')) {
        // 如果是产品标签
        sendQuestion();
    } else {
        // 如果是热门问题，直接发送
        sendQuestion();
    }
}

// 输入框输入问题
const sendQuestion = async () => {
    if (!inputValue.value?.trim() || disabledBtn.value) return;

    disabledBtn.value = true;
    const question = inputValue.value;
    inputValue.value = '';

    const newItem = {
        question,
        answer: '',
        imageUrls: [],
        videoUrls: [],
        questionLoading: true,
        feedbackFlag: false,
        like: false,
        dislike: false,
        timestamp: new Date()
    };
    qaPairs.value.push(newItem);
    const index = qaPairs.value.length - 1;

    await nextTick();
    scrollToBottom();

    // 内部函数：执行流式请求，支持 404 自动无会话重试
    const doSend = async (convId) => {
        try {
            const response = await fetch('v1/chat-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer app-xPJ41Pa0JlFZm0NzzvgS9l3b'
                },
                body: JSON.stringify({
                    inputs: {},
                    query: question,
                    response_mode: 'streaming',
                    conversation_id: convId,
                    user: deviceId.value || 'abc-' + Date.now(),
                    files: [{
                        type: 'image',
                        transfer_method: 'remote_url',
                        url: 'https://cloud.dify.ai/logo/logo-site.png'
                    }]
                })
            });

            if (!response.ok) {
                // 404 + 携带了会话ID → Dify 侧会话已过期，清除后无会话重试
                if (response.status === 404 && convId) {
                    conversation_id.value = '';
                    localStorage.removeItem('conversation_id');
                    console.log('会话已过期(404)，清除本地会话ID，无会话模式重试');
                    fetch(`q1/AiRecord/DeleteByUserId?userId=${deviceId.value}`, { method: 'POST', headers: { 'accept': 'text/plain' }, body: '' }).catch(() => {});
                    return await doSend('');
                }
                const statusMsg = { 400:'请求参数有误', 401:'会话已过期，请刷新重试', 403:'暂无访问权限', 404:'服务不可用', 429:'请求过于频繁，请稍后重试', 500:'服务器繁忙，请稍后重试', 502:'服务暂时不可用', 503:'服务维护中' };
                qaPairs.value[index].answer = statusMsg[response.status] || `服务异常(${response.status})，请稍后重试`;
                return;
            }
            if (!response.body) {
                qaPairs.value[index].answer = '服务响应异常，请稍后重试';
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let completedAnswer = '';
            let messageId = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const jsonStr = line.replace(/^data:\s*/, '');
                        if (jsonStr === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.event === 'message') {
                                const textFragment = parsed.answer || '';
                                completedAnswer += textFragment;
                                qaPairs.value[index].answer = completedAnswer;

                                if (!messageId && parsed.id) {
                                    messageId = parsed.id;
                                    message_id.value = messageId;
                                    displayedMessageIds.value.add(messageId);
                                    qaPairs.value[index].id = messageId;
                                }

                                if (parsed.conversation_id && !conversation_id.value) {
                                    conversation_id.value = parsed.conversation_id;
                                    localStorage.setItem('conversation_id', conversation_id.value);
                                    console.log('保存conversation_id:', conversation_id.value);
                                    await saveAiRecord(deviceId.value, conversation_id.value);
                                }

                                await nextTick();
                                scrollToBottom();
                            } else if (parsed.event === 'workflow_started' && parsed.conversation_id) {
                                console.log('工作流开始，但不从此处获取会话ID');
                            } else if (parsed.event === 'workflow_finished') {
                                const { cleanedText, imageUrls, videoUrls } = extractImageUrl(completedAnswer);
                                if (imageUrls.length > 0) {
                                    qaPairs.value[index].imageUrls = imageUrls;
                                    await loadImages(imageUrls);
                                }
                                if (videoUrls.length > 0) {
                                    qaPairs.value[index].videoUrls = videoUrls;
                                }
                                if (imageUrls.length > 0 || videoUrls.length > 0) {
                                    qaPairs.value[index].answer = cleanedText;
                                }
                                qaPairs.value[index].feedbackFlag = true;
                            }
                        } catch (err) {
                            console.warn('解析失败：', err);
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('请求被取消');
                qaPairs.value[index].answer = '请求已取消';
            } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
                console.error('网络请求失败:', error);
                qaPairs.value[index].answer = '网络连接失败，请检查网络后重试';
            } else {
                console.error('请求出错:', error);
                qaPairs.value[index].answer = '服务响应异常，请稍后重试';
            }
        } finally {
            qaPairs.value[index].questionLoading = false;
            disabledBtn.value = false;
        }
    };

    await doSend(conversation_id.value);
}

// 图片生成
const generateImage = async () => {
    if (!inputValue.value?.trim() || disabledBtn.value) return;

    disabledBtn.value = true;
    const prompt = inputValue.value;
    inputValue.value = '';

    const newItem = {
        question: prompt,
        answer: '',
        imageUrls: [],
        videoUrls: [],
        questionLoading: true,
        feedbackFlag: false,
        like: false,
        dislike: false,
        timestamp: new Date()
    };
    qaPairs.value.push(newItem);
    const index = qaPairs.value.length - 1;

    await nextTick();
    scrollToBottom();

    try {
        const response = await generateImageAPI({
            model: "Kwai-Kolors/Kolors",
            prompt: prompt,
            image_size: "1024x1024",
            batch_size: 1,
            num_inference_steps: 20,
            guidance_scale: 7.5
        });

        if (response && response.data && response.data.images && response.data.images.length > 0) {
            const imageUrl = response.data.images[0].url;
            qaPairs.value[index].imageUrls = [imageUrl];
            qaPairs.value[index].answer = '';
        } else {
            qaPairs.value[index].answer = response?.data?.code === 50604 ? '当前过多人使用，请稍后重试' : '图片生成失败，请稍后重试';
        }
    } catch (error) {
        console.error('图片生成失败:', error);
        qaPairs.value[index].answer = '图片生成失败，请稍后重试';
    } finally {
        qaPairs.value[index].questionLoading = false;
        disabledBtn.value = false;
    }
}

// 文本翻译
const translateText = async () => {
    if (!inputValue.value?.trim() || disabledBtn.value) return;

    disabledBtn.value = true;
    const text = inputValue.value;
    inputValue.value = '';

    const newItem = {
        question: text,
        answer: '',
        imageUrls: [],
        videoUrls: [],
        questionLoading: true,
        feedbackFlag: false,
        like: false,
        dislike: false,
        timestamp: new Date()
    };
    qaPairs.value.push(newItem);
    const index = qaPairs.value.length - 1;

    await nextTick();
    scrollToBottom();

    try {
        const response = await generateChatAPI({
            model: 'tencent/Hunyuan-MT-7B',
            messages: [
                { role: 'system', content: `把下面的文本翻译成${targetLanguage.value}，不要额外解释` },
                { role: 'user', content: text }
            ],
            temperature: 0.7,
            top_p: 0.6,
            top_k: 20,
            frequency_penalty: 0.0
        });

        if (response && response.data && response.data.choices && response.data.choices.length > 0) {
            qaPairs.value[index].answer = response.data.choices[0].message.content || '';
        } else {
            qaPairs.value[index].answer = '翻译失败，请稍后重试';
        }
    } catch (error) {
        console.error('翻译失败:', error);
        qaPairs.value[index].answer = '翻译失败，请稍后重试';
    } finally {
        qaPairs.value[index].questionLoading = false;
        disabledBtn.value = false;
    }
}

// 点赞反馈
const feedbackHelp = async (item) => {
    const index = qaPairs.value.length - 1;

    if (
        (item === 'like' && qaPairs.value[index].like) ||
        (item === 'dislike' && qaPairs.value[index].dislike)
    ) {
        return showToast('已点评');
    }

    const feedbackData = {
        rating: item,
        user: deviceId.value || 'abc-' + Date.now(),
        content: "message feedback information"
    };

    try {
        const response = await messageFeedbackAPI(message_id.value, feedbackData);
        console.log('反馈提交成功', response);

        if (item === 'like') {
            qaPairs.value[index].like = true;
            qaPairs.value[index].dislike = false; // 禁用"没帮助"
        } else {
            qaPairs.value[index].dislike = true;
            qaPairs.value[index].like = false; // 禁用"有帮助"
        }

    } catch (error) {
        console.error('反馈提交失败', error);
    }
};

// 格式化时间
const formatTime = (date) => {
    if (!date) return '';
    try {
        let d;
        
        // 处理不同类型的输入
        if (date instanceof Date) {
            d = date;
        } else if (typeof date === 'number') {
            // 处理Unix时间戳（秒）
            d = new Date(date * 1000);
        } else if (typeof date === 'string') {
            // 尝试解析字符串格式的时间
            if (/^\d{10}$/.test(date)) {
                // 如果是10位数字字符串，认为是Unix时间戳（秒）
                d = new Date(parseInt(date) * 1000);
            } else if (/^\d{13}$/.test(date)) {
                // 如果是13位数字字符串，认为是毫秒时间戳
                d = new Date(parseInt(date));
            } else {
                // 其他格式尝试直接解析
                d = new Date(date);
            }
        } else {
            console.warn('未知日期格式:', date);
            return '';
        }
        
        // 检查是否为有效日期
        if (isNaN(d.getTime())) {
            console.warn('无效日期格式:', date);
            return '';
        }
        
        // 判断是否为历史消息（如果是当天的消息，只显示时间；否则显示完整日期）
        const now = new Date();
        const isToday = d.getDate() === now.getDate() && 
                        d.getMonth() === now.getMonth() && 
                        d.getFullYear() === now.getFullYear();
        
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        
        if (isToday) {
            // 当天消息只显示时间
            return `${hours}:${minutes}`;
        } else {
            // 历史消息显示完整日期和时间
            const year = d.getFullYear();
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
    } catch (error) {
        console.error('时间格式化错误:', error, date);
        return '';
    }
}



const typeAnswers = ref(false)

const formatMessage = (text) => {
    if (!text) return '';

    // 替换标题（如：1. 文字 -> <strong>1. 文字</strong>）
    text = text.replace(/^(\d+\.)\s*(.+)$/gm, '<strong>$1 $2</strong>');

    // 替换子项（如：- 文字 -> <li>文字</li>）
    text = text.replace(/[-•●]\s*(.+)/g, '<li>$1</li>');

    // 包裹所有 <li> 为 <ul>
    if (text.includes('<li>')) {
        text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }

    // 将换行符转成段落
    text = text.replace(/\n/g, '<br>');

    return text;
}

// 获取历史消息
const getHistoryMessages = async () => {
    if (!conversation_id.value || historyLoading.value) {
        return showToast('暂无历史消息')
    }

    historyLoading.value = true

    try {
        // 记录当前滚动位置
        const scrollPosition = chatContentRef.value.scrollTop;
        const hotQuestionsElement = document.querySelector('.chat-userQuestion');
        const hotQuestionsRect = hotQuestionsElement?.getBoundingClientRect();
        const hotQuestionsOffsetTop = hotQuestionsElement ? hotQuestionsElement.offsetTop : 0;

        const response = await messagesAPI({
            conversation_id: conversation_id.value,
            user: deviceId.value || 'abc-' + Date.now(),
            first_id: historyFirstId.value, // 使用存储的first_id参数
            limit: 10
        });

        if (response && response.data && Array.isArray(response.data.data)) {
            const messages = response.data.data;
            
            if (messages.length === 0) {
                showToast('暂无更多历史消息');
                return;
            }


            // 格式化历史消息，过滤已显示的消息
            const formattedHistory = messages.filter(msg => !displayedMessageIds.value.has(msg.id))
                .map(msg => {
                    // 添加到已显示集合
                    displayedMessageIds.value.add(msg.id);
                    
                    // 提取图片和视频链接
                    const { cleanedText, imageUrls, videoUrls } = extractImageUrl(msg.answer || '');
                    
                    // 正确解析timestamp格式的时间
                    let timestamp;
                    try {
                        // 检查created_at的类型和格式
                        const createdAt = msg.created_at;
                        
                        if (typeof createdAt === 'number') {
                            // 如果是数字，判断是秒还是毫秒时间戳
                            timestamp = createdAt > 9999999999 
                                ? new Date(createdAt) // 毫秒
                                : new Date(createdAt * 1000); // 秒
                        } else if (typeof createdAt === 'string') {
                            // 如果是字符串，尝试不同的解析方式
                            if (/^\d{10}$/.test(createdAt)) {
                                // 10位数字字符串，可能是Unix时间戳（秒）
                                timestamp = new Date(parseInt(createdAt) * 1000);
                            } else if (/^\d{13}$/.test(createdAt)) {
                                // 13位数字字符串，可能是毫秒时间戳
                                timestamp = new Date(parseInt(createdAt));
                            } else {
                                // 其他格式尝试直接解析
                                timestamp = new Date(createdAt);
                            }
                        } else {
                            // 默认使用当前时间
                            timestamp = new Date();
                        }
                        
                        // 检查是否是有效的日期对象
                        if (isNaN(timestamp.getTime())) {
                            console.warn('无效的时间戳格式:', msg.created_at);
                            timestamp = new Date(); // 如果解析失败，使用当前时间作为后备
                        }
                    } catch (error) {
                        console.error('时间戳解析错误:', error, msg.created_at);
                        timestamp = new Date(); // 出错时使用当前时间
                    }
                    
                    return {
                        id: msg.id, // 保存消息id
                        question: msg.query || '',
                        answer: cleanedText || msg.answer || '',
                        imageUrls,
                        videoUrls,
                        questionLoading: false,
                        feedbackFlag: false, // 历史消息不显示反馈按钮
                        like: false,
                        dislike: false,
                        timestamp: timestamp,
                        // 保存原始时间戳，便于调试
                        originalTimestamp: msg.created_at 
                    };
                });
            
            if (formattedHistory.length === 0) {
                showToast('暂无更多新的历史消息');
                return;
            }
            
            // 合并新旧历史消息
            const newMessages = [...historyMessages.value, ...formattedHistory];
            
            // 按时间顺序排列合并后的历史消息（最早的消息在前，最新的消息在后）
            const sortedMessages = newMessages.sort((a, b) => a.timestamp - b.timestamp);
            
            // 去重处理，防止重复消息
            const uniqueMessages = [];
            const messageIds = new Set();
            
            for (const msg of sortedMessages) {
                if (!messageIds.has(msg.id)) {
                    messageIds.add(msg.id);
                    uniqueMessages.push(msg);
                }
            }
            
            historyMessages.value = uniqueMessages;
             
            // 更新first_id为时间最小的消息的id
            if (formattedHistory.length > 0) {
                // 对新获取的消息按时间排序
                const sortedNewMessages = formattedHistory.sort((a, b) => a.timestamp - b.timestamp);
                historyFirstId.value = sortedNewMessages[0].id;
            }
            
            showToast(`已加载${formattedHistory.length}条历史消息`);
            
            // 等待DOM更新后恢复滚动位置
            await nextTick();
            
            // 如果之前有热门问题元素，尝试保持视角在相同位置
            if (hotQuestionsElement) {
                // 获取更新后的热门问题位置
                const newHotQuestionsElement = document.querySelector('.chat-userQuestion');
                if (newHotQuestionsElement) {
                    // 计算新的滚动位置，使热门问题保持在之前的视图位置
                    const newPosition = newHotQuestionsElement.offsetTop - (hotQuestionsRect.top - window.scrollY);
                    chatContentRef.value.scrollTop = newPosition;
                } else {
                    // 如果找不到热门问题元素，恢复原来的滚动位置
                    chatContentRef.value.scrollTop = scrollPosition;
                }
            }
        } else {
            showToast('获取历史消息失败');
        }
    } catch (error) {
        console.error('获取历史消息失败', error);
        showToast('获取历史消息失败');
    } finally {
        historyLoading.value = false;
        isRefreshing.value = false;
    }
};

// 下拉刷新触摸事件处理
const handleTouchStart = (e) => {
    // 只记录初始触摸位置，不立即判断是否可以下拉刷新
    touchStartY.value = e.touches[0].clientY;
    touchStartX.value = e.touches[0].clientX; // 记录起始X坐标
    touchStartTime.value = Date.now();
    
    // 实时检查是否真的在顶部，这比依赖scroll事件更可靠
    if (chatContentRef.value) {
        isAtTop.value = chatContentRef.value.scrollTop <= 1; // 允许1px的误差
    }
    
    // 确保初始状态下拉标志为false
    isPulling.value = false;
    pullDistance.value = 0;
};

const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    const touchDeltaY = touchY - touchStartY.value;
    const touchDeltaX = touchX - touchStartX.value;
    
    // 水平滑动：阻止默认行为（CSS touch-action: pan-y 也可能不足，JS 兜底）
    if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY) && Math.abs(touchDeltaX) > 10) {
        e.preventDefault();
        return;
    }
    
    // 实时更新 isAtTop（scroll 事件有延迟，这里做二次确认更可靠）
    if (chatContentRef.value) {
        isAtTop.value = chatContentRef.value.scrollTop <= 1;
    }
    
    // 顶部 + 向下拉：无论是否有 conversation_id，都必须阻止浏览器原生行为
    // 否则浏览器会触发整页弹性滚动/下拉刷新，导致页面整体被拖动
    if (isAtTop.value && touchDeltaY > 0) {
        e.preventDefault();
        
        if (conversation_id.value && !isRefreshing.value) {
            if (touchDeltaY > 20) {
                isPulling.value = true;
                pullDistance.value = Math.min(pullThreshold * 1.5, Math.pow(touchDeltaY, 0.8));
                requestAnimationFrame(() => {
                    isHintVisible.value = checkHintVisibility();
                });
            }
        } else {
            isPulling.value = false;
            pullDistance.value = 0;
            isHintVisible.value = false;
        }
        return;
    }
    
    // 底部 + 向上拉：阻止浏览器原生弹性滚动
    const el = chatContentRef.value;
    if (el && touchDeltaY < 0) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 1;
        if (atBottom) {
            e.preventDefault();
        }
    }
    
    // 不在边界时正常滚动，重置下拉状态
    isPulling.value = false;
    pullDistance.value = 0;
    isHintVisible.value = false;
};

const handleTouchEnd = (e) => {
    // 如果没有进入下拉状态，直接退出
    if (!isPulling.value) {
        return;
    }
    
    // 最后一次检查提示区域可见性
    isHintVisible.value = checkHintVisibility();
    
    // 判断条件：
    // 1. 确认是下拉刷新状态
    // 2. 下拉距离达到阈值
    // 3. 在顶部
    // 4. 有会话ID
    // 5. 提示区域显示中且在可视区域内
    if (isPulling.value && pullDistance.value >= pullThreshold && isAtTop.value && conversation_id.value && isHintVisible.value) {
        isRefreshing.value = true;
        
        // 获取历史消息
        getHistoryMessages();
    }
    
    // 重置状态
    isPulling.value = false;
    pullDistance.value = 0;
    isHintVisible.value = false;
};

// 切换支付问题列表显示状态
const togglePaymentIssues = () => {
    isPaymentIssuesVisible.value = !isPaymentIssuesVisible.value
    
    // 当显示列表时，添加事件监听器阻止body的滚动事件
    if (isPaymentIssuesVisible.value) {
        // 添加点击外部关闭列表的监听器
        setTimeout(() => {
            document.addEventListener('click', closePaymentTagsOnClickOutside)
        }, 10)
    } else {
        document.removeEventListener('click', closePaymentTagsOnClickOutside)
    }
}

// 点击外部关闭标签列表
const closePaymentTagsOnClickOutside = (event) => {
    const container = document.querySelector('.payment-issues-container')
    if (container && !container.contains(event.target)) {
        isPaymentIssuesVisible.value = false
        document.removeEventListener('click', closePaymentTagsOnClickOutside)
    }
}

// 新增产品相关问题按钮
const toggleProductIssues = () => {
    isProductIssuesVisible.value = !isProductIssuesVisible.value
    
    // 当显示列表时，添加事件监听器阻止body的滚动事件
    if (isProductIssuesVisible.value) {
        // 添加点击外部关闭列表的监听器
        setTimeout(() => {
            document.addEventListener('click', closeProductTagsOnClickOutside)
        }, 10)
    } else {
        document.removeEventListener('click', closeProductTagsOnClickOutside)
    }
}

// 点击外部关闭产品标签列表
const closeProductTagsOnClickOutside = (event) => {
    const container = document.querySelector('.product-issues-container')
    if (container && !container.contains(event.target)) {
        isProductIssuesVisible.value = false
        document.removeEventListener('click', closeProductTagsOnClickOutside)
    }
}

// 选择支付问题
const selectPaymentIssue = (tag) => {
    inputValue.value = tag // 设置输入框的值为选中的标签
    isPaymentIssuesVisible.value = false // 隐藏标签列表
    sendQuestion() // 直接发送问题
}

// 选择产品相关问题
const selectProductIssue = (tag) => {
    inputValue.value = tag // 设置输入框的值为选中的标签
    isProductIssuesVisible.value = false // 隐藏标签列表
    sendQuestion() // 直接发送问题
}

// 设置对话模式（chat/生图/翻译）
const setChatMode = (mode) => {
    if (mode === 'image') {
        if (!isImageMode.value) {
            isImageMode.value = true
            isTranslateMode.value = false
            inputValue.value = ''
        }
    } else if (mode === 'translate') {
        if (!isTranslateMode.value) {
            isTranslateMode.value = true
            isImageMode.value = false
            inputValue.value = ''
        }
    } else {
        if (isImageMode.value || isTranslateMode.value) {
            isImageMode.value = false
            isTranslateMode.value = false
            inputValue.value = ''
        }
    }
}

// 翻译模式：切换语言选择器显示/隐藏
const toggleLanguageSelector = () => {
    isLanguageSelectorVisible.value = !isLanguageSelectorVisible.value
    if (isLanguageSelectorVisible.value) {
        setTimeout(() => {
            document.addEventListener('click', closeLanguageSelectorOnClickOutside)
        }, 10)
    } else {
        document.removeEventListener('click', closeLanguageSelectorOnClickOutside)
    }
}

// 翻译模式：选择目标语言
const selectTargetLanguage = (lang) => {
    targetLanguage.value = lang
    isLanguageSelectorVisible.value = false
    document.removeEventListener('click', closeLanguageSelectorOnClickOutside)
}

// 翻译模式：点击外部关闭语言选择器
const closeLanguageSelectorOnClickOutside = (event) => {
    const container = document.querySelector('.language-selector')
    if (container && !container.contains(event.target)) {
        isLanguageSelectorVisible.value = false
        document.removeEventListener('click', closeLanguageSelectorOnClickOutside)
    }
}

// 批量加载图片
function loadImages(urls) {
    return Promise.all(urls.map(url => new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = resolve;
    })));
}

const hotLevel = ref(1); // 1: 一级菜单, 2: 二级菜单
const currentHotList = ref(hotQuestions.value); // 当前展示的热门问题列表
const hotParent = ref(null); // 当前二级菜单的父级

const onHotQuestionClick = (item) => {
    if (hotLevel.value === 1) {
        // 一级菜单，切换到二级菜单
        if (item.name === '支付常见问题') {
            currentHotList.value = tags.value.map(tag => ({ name: tag }));
            hotLevel.value = 2;
            hotParent.value = '支付常见问题';
        } else if (item.name === '产品相关问题') {
            // 展示产品相关问题的5个一级目录
            currentHotList.value = productCategories.value.map(cat => ({ name: cat.name }));
            hotLevel.value = 2;
            hotParent.value = '产品相关问题';
        }
    } else if (hotLevel.value === 2 && hotParent.value === '产品相关问题') {
        // 二级菜单，点击产品相关问题的一级目录，进入三级菜单
        const selectedCategory = productCategories.value.find(cat => cat.name === item.name);
        if (selectedCategory) {
            currentHotList.value = selectedCategory.children.map(child => ({ name: child }));
            hotLevel.value = 3;
            hotParent.value = item.name;
        }
    } else if ((hotLevel.value === 2 && hotParent.value === '支付常见问题') || hotLevel.value === 3) {
        // 二级菜单（支付常见问题）或三级菜单（产品相关问题）点击后发送请求
        inputValue.value = item.name;
        sendQuestion();
        // 恢复为一级菜单
        currentHotList.value = hotQuestions.value;
        hotLevel.value = 1;
        hotParent.value = null;
    }
};

</script>

<style scoped lang="less">
.chat-dialog {
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

/* 下拉提示区域和历史消息提示合并，只保留一个提示区域 */
.history-available-hint {
    text-align: center;
    padding: .3rem 0;
    font-size: .26rem;
    color: #1890ff;
    background-color: rgba(240, 249, 255, 0.8);
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    animation: pulse 2.5s infinite;
    backdrop-filter: blur(1px);
    border: 1px solid rgba(24, 144, 255, 0.1);
    transition: background 0.2s, color 0.2s;
    position: sticky;
    top: 0;
    z-index: 10;
    margin: 0 0 .2rem 0;
    &.refreshing {
        color: #fff;
        background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
        box-shadow: 0 2px 8px rgba(24,144,255,0.08);
        border: none;
    }
    &.ready {
        color: #40a9ff;
        background: #e6f7ff;
        border: 1px solid #91d5ff;
    }
}

@keyframes pulse {
    0% {
        opacity: 0.8;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.8;
    }
}

.header {
    flex-shrink: 0;
    padding: .35rem .5rem;
    background: linear-gradient(135deg, #1890ff, #0050b3);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    .agent-info {
        display: flex;
        flex-direction: column;

        .agent-name {
            font-weight: 600;
            font-size: .34rem;
            letter-spacing: 0.02rem;
        }
    }
}

.agent-status {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.status-dot.online {
    background-color: #52c41a;
}

.close-button {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

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
        // background-color: #f9fafb;
        padding: .2rem;
        border-radius: 12px;
        font-size: .5rem;
        display: flex;
        flex-direction: column;
        gap: .4rem;
        width: 100%; /* 确保内容宽度固定 */
        max-width: 100%; /* 确保不超出父容器 */
        box-sizing: border-box; /* 确保padding包含在宽度内 */
    }
}

.message {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    padding: .2rem;
    border-radius: 8px;

    &.user {
        align-self: flex-end;
        color: #1e40af;

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

    &.agent {
        align-self: flex-start;

        .meta {
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

        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: .2rem;
            background-color: #fff;
            padding: .5rem;

            .tag {
                border: 1px solid #60a5fa;
                background-color: #eff6ff;
                color: #2563eb;
                border-radius: 9999px;
                padding: 4px 8px;
                font-size: .35rem;
                cursor: pointer;

                &:hover {
                    background-color: #dbeafe;
                }
            }
        }
    }
}

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
    
    // 支付常见问题与产品相关问题按钮并排放置
    .buttons-container {
        display: none;
    }

    .mode-toggle {
        display: flex;
        margin: 0 .3rem .12rem .3rem;
        // background: #f0f2f5;
        border-radius: 10px;
        padding: 0.06rem;
        gap: 0.25rem;
        // box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);

        .mode-segment {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.1rem;
            padding: 0.15rem 0;
            border-radius: 8px;
            background: #f0f2f5;
            font-size: 0.31rem;
            font-weight: 500;
            color: #888;
            cursor: pointer;
            transition: color 0.05s ease, box-shadow 0.05s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            min-height: 0.63rem;

            .mode-icon {
                font-size: 0.40rem;
                line-height: 1;
            }

            .mode-label {
                line-height: 1;
            }

            &.active {
                background: linear-gradient(135deg, #1890ff, #096dd9);
                color: #fff;
                box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
                font-weight: 600;

                .mode-icon {
                    transform: scale(1.1);
                    transition: transform 0.05s ease;
                }
            }

            &:not(.active):active {
                background: rgba(24, 144, 255, 0.08);
                color: #1890ff;
            }
        }
    }

    // 翻译模式：目标语言选择器
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
            font-size: .35rem;
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
            top: 100%;
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
            margin-top: .1rem;

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

    .input-area {
        position: relative;
    }

    .input-container {
        display: flex;
        align-items: center;
        background-color: rgba(248, 248, 248, 0.95);
        border-radius: 24px;
        padding: 0.1rem 0.2rem;
        margin: .1rem .3rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        position: relative;
        border: 1px solid rgba(0, 0, 0, 0.04);
        transition: all 0.2s ease;
        height: auto; /* 让高度自适应内容 */

        &:focus-within {
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
            border-color: rgba(24, 144, 255, 0.2);
        }
    }

    .input-container input {
        flex: 1;
        border: none;
        background-color: transparent;
        padding: 0.25rem 0.4rem; /* 调整内边距 */
        font-size: .36rem;
        outline: none;
        color: #333;
        &::placeholder {
            color: #aaa;
        }
    }

    .input-container button {
        background: linear-gradient(135deg, #4f76b6, #3b5f99);
        color: white;
        border: none;
        padding: 0.25rem 0.6rem;
        font-size: .3rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 5px rgba(59, 95, 153, 0.2);

        &:hover {
            background: linear-gradient(135deg, #3b5f99, #2b4b85);
            transform: translateY(-1px);
        }
        
        &:active {
            transform: translateY(1px);
        }
    }

    .matched-questions {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        max-height: 40vh;
        overflow-y: auto;
        z-index: 1000;
        margin-bottom: 0.2rem;
    }

    .matched-question-item {
        padding: 0.3rem 0.5rem;
        font-size: 0.34rem;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
    }

    .matched-question-item:hover,
    .matched-question-item.active {
        background-color: #f5f5f5;
        color: #1890ff;
    }

    .highlight {
        color: #1890ff;
        font-weight: bold;
    }

    /* 历史消息区域样式 */
    .history-messages {
        margin-bottom: 1rem;
        padding: .3rem;
        background-color: rgba(245, 245, 245, 0.7);
        border-radius: 10px;
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.04);
        position: relative;
        
        &::before {
            content: '';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background-color: rgba(24, 144, 255, 0.3);
            border-radius: 3px;
        }
    }

    .history-header {
        display: flex;
        justify-content: center;
        margin-bottom: .5rem;
        
        .history-title {
            font-size: .4rem;
            color: #666;
            background-color: #e0e0e0;
            padding: .2rem .5rem;
            border-radius: 1rem;
        }
    }
}

.quick-questions {
    background-color: white;
    border-radius: 8px;
    padding: .2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .title {
        font-size: .5rem;
        color: #1890ff;
        margin-bottom: 8px;
        padding-left: 4px;
    }

    .allquestions {
        color: #7f7569;
        font-size: .35rem;

        .question-list {
            padding: .4rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #7f7569;
            cursor: pointer;
            transition: all 0.2s;
        }

        .question-list:hover {
            background-color: #fafafa;
            color: #1890ff;
        }
    }
}

.questions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.question {
    background-color: #f0f0f0;
    border: none;
    border-radius: 15px;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.question:hover {
    background-color: #e0e0e0;
}

.feedback {
    display: flex;
    justify-content: space-between;
    font-size: .35rem;
    color: #6b7280;
    margin-top: 8px;
    width: 100%;

    .action {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;

        &:hover {
            color: #1f2937;
        }
    }
}

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
    background-color: #333;
    animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}

.dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

/* 为 slide-in-active 添加动画 */
.chat-userQuestion .slide-in-active {
    animation: slideInRightToLeft 0.5s ease-out forwards;
}

/* 动画关键帧 */
@keyframes slideInRightToLeft {
    0% {
        transform: translateX(100%);
        opacity: 0;
    }

    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

/* 子元素依次滑入效果 */
.chat-userQuestion.slide-in-active .message {
    opacity: 0;
    transform: translateX(100%);
    animation: slideInRightToLeft 0.5s ease-out forwards;
}

.chat-userQuestion.slide-in-active .message:nth-child(1) {
    animation-delay: 0.1s;
}

.chat-userQuestion.slide-in-active .message:nth-child(2) {
    animation-delay: 0.3s;
}

.video-player {
    width: 100%;
}

.like {
    color: #3554b7;
}

.disabled {
    pointer-events: none;
    opacity: 0.5;
}

.chat-message strong {
    display: block;
    margin-top: 10px;
    font-weight: bold;
    color: #333;
}

.chat-message ul {
    padding-left: 20px;
    margin: 5px 0;
}

.chat-message li {
    list-style-type: disc;
    margin-bottom: 4px;
}

/* 备案信息样式 */
.footer-icp {
    width: 100%;
    text-align: center;
    font-size: .26rem;
    color: #999;
    padding: .2rem 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.footer-icp a {
    color: #1890ff;
    text-decoration: none;
    transition: all 0.2s;
}

.footer-icp a:hover {
    text-decoration: underline;
    color: #40a9ff;
}

.footer-icp span {
    color: #999;
}

.back-to-parent {
    margin-bottom: 0.2rem;
    cursor: pointer;
    text-align: center;
    font-size: 0.38rem;
    font-weight: bold;
    background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
    color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(24,144,255,0.18);
    padding: 0.3rem 0;
    transition: background 0.2s, color 0.2s;
}

.matched-parent {
  color: #aaa;
  font-size: 0.28rem;
  margin-left: 0.2rem;
}
</style>
