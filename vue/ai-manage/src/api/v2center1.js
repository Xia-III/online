import request from '../utils/request'

const center = '/center/'


// 获取微信jsapi的配置
export const JsApiConfig = params => request({
    method: 'GET',
    url: center + 'api/v3/Player/JsApiConfig',
    params
})
