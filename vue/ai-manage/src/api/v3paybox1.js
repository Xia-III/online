// v2用户paybox1相关接口：
import request from '../utils/request'


// 发送对话消息
export const chatMessages = (data, streaming = true) => {
    // 确保response_mode为streaming
    if (streaming) {
        data.response_mode = 'streaming';
    }
    
    // 确保有conversation_id字段，即使是空字符串
    if (!data.hasOwnProperty('conversation_id')) {
        data.conversation_id = '';
    }
    
    return request({
        method: 'POST',
        url: 'v1/chat-messages',
        data
    });
}

// 获取会话列表 
export const conversations = params => request({
    method: 'GET',
    url: 'v1/conversations',
    params
})

// 获取历史会话列表
export const messages = params => request({
    method: 'GET',
    url: 'v1/messages',
    params
})

// 创建标注

export const annotations = data => request({
    method: 'POST',
    url: 'v1/apps/annotations',
    data
})

// 点赞反馈
export const messageFeedback = (message_id, data) => request({
    method: 'POST',
    url: `v1/messages/${message_id}/feedbacks`,
    data
})

// 处理流式响应
export const handleStreamResponse = async (response) => {
    if (!response.ok || !response.body) {
        throw new Error('网络异常或接口无响应体');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let completedAnswer = '';
    let messageId = '';
    let conversationId = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // 保留不完整的最后一段

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const jsonStr = line.replace(/^data:\s*/, '');
                    if (jsonStr === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        
                        if (parsed.event === 'message') {
                            const textFragment = parsed.answer || '';
                            completedAnswer += textFragment;
                            
                            if (!messageId && parsed.id) {
                                messageId = parsed.id;
                            }
                            
                            if (parsed.conversation_id && !conversationId) {
                                conversationId = parsed.conversation_id;
                            }
                        }
                        else if (parsed.event === 'workflow_started' && parsed.conversation_id) {
                            conversationId = parsed.conversation_id;
                        }
                    } catch (err) {
                        console.warn('解析失败：', err);
                    }
                }
            }
        }
    } catch (error) {
        console.error('流式响应处理错误:', error);
        throw error;
    }

    return {
        answer: completedAnswer,
        messageId,
        conversationId
    };
}


  