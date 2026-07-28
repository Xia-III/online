import request4 from '../utils/request4'

//设置权限
export const generateImage = data => request4({
    method: 'POST',
    url: 'siliconflow/images/generations',
    data: data
})

export const generateChat = data => request4({
    method: 'POST',
    url: 'siliconflow/chat/completions',
    data: data
})




