// v2用户paybox1相关接口：
import request from '../utils/request'

const clawcrane = '/clawcrane/'


// 玩家授权(v3WwjAuthPlayerAuth)
export const v3WwjAuthPlayerAuth = data => request({
    method: 'POST',
    url: clawcrane + 'api/Auth/PlayerAuth',
    data
})

// 扫码三合一(v3WwjAuthScanQRCode)
export const v3WwjAuthScanQRCode = params => request({
    method: 'GET',
    url: clawcrane + 'api/Auth/ScanQRCode',
    params
})

// 玩家基本信息(v3WwjPlayerProfile)
export const v3WwjPlayerProfile = data => request({
    method: 'POST',
    url: clawcrane + 'api/v3/Player/Profile',
    data
})
// 投币套餐(v3PWwjlayerCoinInPlan)
export const v3WwjPlayerCoinInPlan = params => request({
    method: 'GET',
    url: clawcrane + 'api/v3/Player/CoinInPlan',
    params
})
// 获取场地机器列表(v3WwjPlayerMachineList)
export const v3WwjPlayerMachineList = params => request({
    method: 'GET',
    url: clawcrane + 'api/v3/Player/MachineList',
    params
})